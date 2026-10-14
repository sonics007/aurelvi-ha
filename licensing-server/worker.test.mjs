import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import test from 'node:test';
import service,{checkout,entitlement,signLicence,verifyLicence} from './worker.mjs';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const now=Math.floor(Date.now()/1000);
const env={STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_PRICE_ANNUAL:'price_annual',STRIPE_PRICE_LIFETIME:'price_lifetime',SITE_URL:'https://sonics007.github.io/aurelvi-ha',COMMERCE_ENABLED:'true',NATIVE_ACTIVATION_READY:'true'};
const charge={paid:true,status:'succeeded',refunded:false,disputed:false,amount_refunded:0};
const price={id:'price_lifetime',currency:'eur',unit_amount:2900,active:true};
const session={id:'cs_test_A12345678901234567890',metadata:{panel_id:'panel-test',plan:'lifetime'},client_reference_id:'panel-test',created:now,status:'complete',currency:'eur',amount_total:2900,payment_status:'paid',line_items:{data:[{price,quantity:1}]},payment_intent:{status:'succeeded',latest_charge:charge}};
const yearlyPrice={id:'price_annual',currency:'eur',unit_amount:1200,active:true,recurring:{interval:'year',interval_count:1}};
const yearly={...session,metadata:{panel_id:'panel-test',plan:'annual'},amount_total:1200,line_items:{data:[{price:yearlyPrice,quantity:1}]},subscription:{status:'active',current_period_end:now+3600,items:{data:[{price:yearlyPrice,quantity:1}]},latest_invoice:{created:now,status:'paid',paid:true,currency:'eur',amount_paid:1200,payment_intent:{latest_charge:charge}}}};
test('real RSA signatures bind licences to one panel and reject modification',async()=>{
 const keys=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
 const privateKey=await crypto.subtle.exportKey('jwk',keys.privateKey),publicKey=await crypto.subtle.exportKey('jwk',keys.publicKey);
 const token=await signLicence(entitlement(session,env,now),privateKey);
 assert.equal((await verifyLicence(token,publicKey,'panel-test',now)).plan,'lifetime');
 await assert.rejects(()=>verifyLicence(token,publicKey,'other-panel',now));
 await assert.rejects(()=>verifyLicence(token+'x',publicKey,'panel-test',now));
 const annual=await signLicence(entitlement(yearly,env,now),privateKey);
 await assert.rejects(()=>verifyLicence(annual,publicKey,'panel-test',now+3601));
});
test('unpaid, refunded, disputed and wrong totals never grant entitlement',()=>{
 assert.throws(()=>entitlement({...session,payment_status:'unpaid'},env,now));
 assert.throws(()=>entitlement({...session,amount_total:1},env,now));
 for(const change of [{refunded:true},{disputed:true},{amount_refunded:1}])assert.throws(()=>entitlement({...session,payment_intent:{status:'succeeded',latest_charge:{...charge,...change}}},env,now));
});
test('annual period must be fully paid and unexpired',()=>{
 assert.equal(entitlement(yearly,env,now).exp,now+3600);
 assert.throws(()=>entitlement({...yearly,subscription:{...yearly.subscription,current_period_end:now-1}},env,now));
 assert.throws(()=>entitlement({...yearly,subscription:{...yearly.subscription,latest_invoice:{...yearly.subscription.latest_invoice,paid:false}}},env,now));
});
test('checkout uses allowlisted server price and recurring annual mode',async()=>{
 let parameters;
 const fake=async(url,options)=>{
  if(url.includes('/prices/'))return Response.json(yearlyPrice);
  parameters=new URLSearchParams(options.body);
  return Response.json({url:'https://checkout.stripe.com/c/pay/cs_test_fixture'});
 };
 await checkout({panelId:'panel-test',plan:'annual',language:'sk',amount:1},{...env,LICENCE_PRIVATE_JWK:'fixture'},fake);
 assert.equal(parameters.get('mode'),'subscription');
 assert.equal(parameters.get('line_items[0][price]'),'price_annual');
 assert.equal(parameters.get('metadata[panel_id]'),'panel-test');
 assert.equal(parameters.get('locale'),'sk');
 assert(!parameters.has('amount'));
});
test('disabled commerce, incorrect prices and unsupported plans are rejected',async()=>{
 await assert.rejects(()=>checkout({panelId:'panel-test',plan:'annual'},{...env,COMMERCE_ENABLED:'false'}));
 await assert.rejects(()=>checkout({panelId:'panel-test',plan:'invalid'},{...env,LICENCE_PRIVATE_JWK:'fixture'}));
 await assert.rejects(()=>checkout({panelId:'panel-test',plan:'annual'},{...env,LICENCE_PRIVATE_JWK:'fixture'},async()=>Response.json({...yearlyPrice,unit_amount:1})));
});
test('unexpected web origins are rejected before processing',async()=>{
 const result=await service.fetch(new Request('https://api.example/checkout',{method:'POST',headers:{Origin:'https://attacker.example'},body:'{}'}),env);
 assert.equal(result.status,403);
});
