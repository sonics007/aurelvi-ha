const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
(async()=>{
 const dom=new JSDOM(fs.readFileSync('website/pricing.html','utf8'),{runScripts:'outside-only',url:'https://aurelvi-app.com/pricing.html'}),w=dom.window;let sent;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.fetch=async(url,options)=>{if(url==='assets/commerce.json')return{ok:true,json:async()=>({enabled:true,nativeActivationReady:true,apiBase:'https://api.aurelvi-app.com'})};if(url.endsWith('/checkout')){sent=JSON.parse(options.body);return{ok:false,json:async()=>({error:'Test checkout captured'})};}return{ok:false};};
 for(const f of ['i18n.js','skins.js','site.js'])w.eval(fs.readFileSync('website/assets/'+f,'utf8'));
 await new Promise(r=>setTimeout(r,20));w.document.querySelector('#panel-id').value='living-room';w.document.querySelector('#product-page').value='page:alarm';w.document.querySelector('[data-buy="page"]').click();await new Promise(r=>setTimeout(r,20));assert.deepEqual(JSON.parse(JSON.stringify(sent)),{plan:'page',panelId:'living-room',language:'en',product:'page:alarm'});assert.equal(w.document.querySelector('#checkout-message').textContent,'Test checkout captured');
 w.document.querySelector('[data-buy="full"]').click();await new Promise(r=>setTimeout(r,20));assert.equal(sent.plan,'full');assert.equal(sent.product,'full');assert(!('amount'in sent));dom.window.close();console.log('PASS annual website checkout: selected page scope, Full scope, no client-controlled price');
})().catch(e=>{console.error(e);process.exit(1)});
