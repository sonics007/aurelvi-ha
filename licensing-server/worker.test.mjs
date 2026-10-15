import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import test from 'node:test';
import service,{checkout,entitlement,signLicence,verifyLicence,issue,portal,PAGE_TYPES} from './worker.mjs';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const now=Math.floor(Date.now()/1000);
const env={STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_PRICE_FULL:'price_full',STRIPE_PRICE_PAGE:'price_page',STRIPE_PORTAL_CONFIGURATION:'bpc_fixture',SITE_URL:'https://aurelvi-app.com',COMMERCE_ENABLED:'true',NATIVE_ACTIVATION_READY:'true',LICENCE_PRIVATE_JWK:'fixture'};
const charge={paid:true,status:'succeeded',refunded:false,disputed:false,amount_refunded:0};
function order(plan='full',product='full'){
 const amount=plan==='full'?3490:790,price={id:'price_'+plan,currency:'eur',unit_amount:amount,active:true,recurring:{interval:'year',interval_count:1}},metadata={panel_id:'panel-test',plan,product};
 return {id:'cs_test_A12345678901234567890',mode:'subscription',customer:'cus_fixture',metadata,client_reference_id:'panel-test',created:now,status:'complete',currency:'eur',amount_total:amount,payment_status:'paid',line_items:{data:[{price,quantity:1}]},subscription:{id:'sub_fixture',metadata,status:'active',current_period_end:now+3600,items:{data:[{price,quantity:1}]},latest_invoice:{subscription:'sub_fixture',created:now,status:'paid',paid:true,currency:'eur',amount_paid:amount,payment_intent:{latest_charge:{...charge}}}}};
}
const keys=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const privateKey=await crypto.subtle.exportKey('jwk',keys.privateKey),publicKey=await crypto.subtle.exportKey('jwk',keys.publicKey);
test('Full and all six page types are annual, signed and panel-bound',async()=>{
 for(const [plan,product] of [['full','full'],...PAGE_TYPES.map(p=>['page','page:'+p])]){
  const claims=entitlement(order(plan,product),env,now),token=await signLicence(claims,privateKey);
  assert.deepEqual((await verifyLicence(token,publicKey,'panel-test',now)).products,[product]);
  await assert.rejects(()=>verifyLicence(token,publicKey,'other-panel',now));
  await assert.rejects(()=>verifyLicence(token+'x',publicKey,'panel-test',now));
  await assert.rejects(()=>verifyLicence(token,publicKey,'panel-test',now+3601));
 }
});
test('unpaid, refund, partial refund, dispute and changed product never grant entitlement',()=>{
 for(const modify of [s=>s.payment_status='unpaid',s=>s.amount_total=1,s=>s.subscription.latest_invoice.payment_intent.latest_charge.refunded=true,s=>s.subscription.latest_invoice.payment_intent.latest_charge.amount_refunded=1,s=>s.subscription.latest_invoice.payment_intent.latest_charge.disputed=true,s=>s.subscription.latest_invoice.subscription='sub_other',s=>s.subscription.metadata={...s.metadata,product:'page:alarm'},s=>s.line_items.has_more=true,s=>s.subscription.items.has_more=true]){const s=order();modify(s);assert.throws(()=>entitlement(s,env,now));}
});
test('cancellation preserves the paid period; expiry and failed renewal do not extend it',()=>{
 const s=order();s.subscription.cancel_at_period_end=true;
 assert.equal(entitlement(s,env,now).exp,now+3600);
 s.subscription.status='canceled';assert.equal(entitlement(s,env,now).exp,now+3600);
 assert.throws(()=>entitlement(s,env,now+3601));s.subscription.latest_invoice.paid=false;assert.throws(()=>entitlement(s,env,now));
});
test('checkout fixes prices on the server, uses subscriptions, records panel and page',async()=>{
 for(const [plan,product] of [['full','full'],['page','page:clock']]){
  let params;const fixture=order(plan,product);const fake=async(url,options)=>{if(url.includes('/prices/'))return Response.json(fixture.line_items.data[0].price);params=new URLSearchParams(options.body);return Response.json({url:'https://checkout.stripe.com/c/pay/cs_test_fixture'});};
  await checkout({panelId:'panel-test',plan,product,language:'sk',amount:1},env,fake);
  assert.equal(params.get('mode'),'subscription');assert.equal(params.get('line_items[0][price]'),'price_'+plan);assert.equal(params.get('subscription_data[metadata][product]'),product);assert.equal(params.get('metadata[panel_id]'),'panel-test');assert.equal(params.get('locale'),'sk');assert(!params.has('amount'));assert.equal(params.get('consent_collection[terms_of_service]'),'required');
 }
});
test('old checkout models, invalid page products, nonyearly and wrong prices are rejected',async()=>{
 for(const plan of ['annual','lifetime','pack','skin','invalid'])await assert.rejects(()=>checkout({panelId:'panel-test',plan,product:'full'},env));
 for(const product of ['full','page:unknown','page:clock:extra'])await assert.rejects(()=>checkout({panelId:'panel-test',plan:'page',product},env));
 for(const change of [{unit_amount:1},{recurring:null},{recurring:{interval:'month',interval_count:12}},{currency:'usd'}])await assert.rejects(()=>checkout({panelId:'panel-test',plan:'full'},env,async()=>Response.json({...order().line_items.data[0].price,...change})));
 await assert.rejects(()=>checkout({panelId:'panel-test',plan:'full'},{...env,COMMERCE_ENABLED:'false'}));
});
test('legacy signed passes and visual packs remain verifiable without being sold again',async()=>{
 for(const [plan,product] of [['annual','plus'],['lifetime','plus'],['pack','pack:hifi'],['skin','skin:stereo-silver']]){const token=await signLicence({v:1,iss:'aurelvi',aud:'aurelvi-panel',panel_id:'panel-test',plan,products:[product],iat:now,exp:plan==='annual'?now+3600:null},privateKey);assert.equal((await verifyLicence(token,publicKey,'panel-test',now)).plan,plan);}
});
test('renewal retrieves latest paid invoice in a separate depth-limited API call',async()=>{
 const s=order('page','page:weather');s.subscription.current_period_end=now+31536000;const paths=[];
 const result=await issue(s.id,{...env,LICENCE_PRIVATE_JWK:JSON.stringify(privateKey)},async url=>{paths.push(url);return Response.json(url.includes('/subscriptions/')?s.subscription:{...s,subscription:'sub_fixture'});});
 assert.equal(result.expires,now+31536000);assert.equal(result.product,'page:weather');assert.equal(paths.length,2);assert(!paths[0].includes('subscription.latest_invoice'));
 assert.equal((await verifyLicence(result.token,publicKey,'panel-test',now)).exp,now+31536000);
});
test('portal uses customer from Stripe receipt, not untrusted request data',async()=>{
 let params;const fake=async(url,options)=>{if(url.includes('/checkout/sessions/'))return Response.json(order());params=new URLSearchParams(options.body);return Response.json({url:'https://billing.stripe.com/p/session/fixture'});};
 assert((await portal(order().id,env,fake)).url.startsWith('https://billing.stripe.com/'));
 assert.equal(params.get('customer'),'cus_fixture');assert.equal(params.get('configuration'),'bpc_fixture');
 await assert.rejects(()=>portal(order().id,{...env,STRIPE_PORTAL_CONFIGURATION:''},fake));
});
test('origin checks, health and disabled-state guards',async()=>{
 const request=new Request('https://api.example/checkout',{method:'POST',headers:{Origin:'https://attacker.example'},body:'{}'});assert.equal((await service.fetch(request,env)).status,403);
 const health=await service.fetch(new Request('https://api.example/health'),{...env,COMMERCE_ENABLED:'false'});assert.equal((await health.json()).checkout,false);
});
