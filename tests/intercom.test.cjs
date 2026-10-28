const fs=require('fs'),assert=require('node:assert/strict'),{JSDOM}=require(process.env.JSDOM_PATH||'jsdom'),{EventEmitter}=require('node:events');
const path=__dirname+'/../custom_components/aurelvi/frontend/',dom=new JSDOM(fs.readFileSync(path+'index.html','utf8'),{url:'https://panel.test/?demo=1',runScripts:'outside-only'}),w=dom.window,d=w.document;
const cfg={enabled:true,server:'wss://pbx.example/ws',uri:'sip:panel@example.com',password:'private-sip-secret',contacts:[{id:'iphone',label:'Laco iPhone',uri:'sip:101@example.com'},{id:'android',label:'Android',uri:'sip:102@example.com'}],iceServers:[]};
let ua,calls=[],native=[],permission=true,saved=[],trackStopped=0;
w.HTMLMediaElement.prototype.play=()=>Promise.resolve();w.HTMLMediaElement.prototype.pause=()=>{};w.RTCPeerConnection=function(){};Object.defineProperty(w.navigator,'mediaDevices',{value:{getUserMedia:()=>Promise.resolve({})}});
w.OpenPanelNative={readCache:()=>'{"clockLanguage":"en-GB"}',loadIntercomSettings:()=>JSON.stringify(cfg),requestIntercomMicrophone:()=>permission,intercomAudio:v=>native.push(['audio',v]),intercomRinging:v=>native.push(['ring',v]),saveIntercomSettings:raw=>{saved.push(JSON.parse(raw));return 'OK';}};
class Session extends EventEmitter{constructor(direction='outgoing',user='101'){super();this.direction=direction;this.established=false;this.ended=false;this.connection={addEventListener(){},getSenders:()=>[{track:{stop:()=>trackStopped++}}]};this.remote_identity={uri:{user,host:'example.com'}};}isEstablished(){return this.established;}isEnded(){return this.ended;}terminate(data){this.termination=data;this.ended=true;this.emit('ended');}answer(o){this.options=o;this.answered=true;}mute(o){this.muted=o.audio;}unmute(){this.muted=false;}}
class UA extends EventEmitter{constructor(options){super();this.options=options;ua=this;}start(){this.started=true;}stop(){this.stopped=true;}call(uri,options){const s=new Session();calls.push({uri,options,session:s});this.emit('newRTCSession',{session:s,originator:'local'});return s;}}
w.JsSIP={UA,WebSocketInterface:class{constructor(url){this.url=url;}},URI:{parse:uri=>{let m=/sip:([^@]+)@(.+)/.exec(uri);return m&&{user:m[1],host:m[2]};}}};
// Simulate older NSPanel WebView without replaceChildren.
w.Element.prototype.replaceChildren=undefined;
w.eval(fs.readFileSync(path+'i18n.js','utf8'));// like index.html: runtime first
w.eval(fs.readFileSync(path+'intercom.js','utf8'));
const clickContact=id=>d.querySelector('[data-contact="'+id+'"]').click(),flush=()=>new Promise(r=>setImmediate(r));
(async()=>{
 assert(ua.started);assert(d.querySelector('[data-contact="iphone"]').disabled);ua.emit('registered');assert(!d.querySelector('[data-contact="iphone"]').disabled);
 clickContact('iphone');await flush();assert.equal(calls.length,1);assert.equal(calls[0].uri,'sip:101@example.com');assert.equal(calls[0].options.mediaConstraints.video,false);clickContact('android');await flush();assert.equal(calls.length,1);
 let s=calls[0].session;assert(d.querySelector('.intercom-actions button:nth-child(2)').hidden);s.established=true;s.emit('confirmed');d.querySelector('.intercom-actions button:nth-child(2)').click();assert(s.muted);d.querySelector('.intercom-end').click();assert.equal(trackStopped,1);assert(!d.querySelector('[data-contact="android"]').disabled);
 clickContact('android');await flush();assert.equal(calls[1].uri,'sip:102@example.com');const busy=new Session('incoming','101');ua.emit('newRTCSession',{originator:'remote',session:busy});assert.equal(busy.termination.status_code,486);d.querySelector('.intercom-end').click();
 const unknown=new Session('incoming','999');ua.emit('newRTCSession',{originator:'remote',session:unknown});assert.equal(unknown.termination.status_code,403);
 const incoming=new Session('incoming','101');ua.emit('newRTCSession',{originator:'remote',session:incoming});assert(!incoming.answered);assert(native.some(x=>x[0]==='ring'&&x[1]));d.querySelector('.intercom-actions button').click();await flush();assert(incoming.answered);assert.equal(incoming.options.mediaConstraints.video,false);incoming.terminate();
 permission=false;clickContact('iphone');await flush();w.AurelviIntercomPermission(false);await flush();assert.equal(calls.length,2);assert(d.querySelector('.intercom-status').textContent.includes('denied'));
 ua.emit('disconnected');assert(d.querySelector('[data-contact="iphone"]').disabled);
 d.getElementById('intercom-uri').value='javascript:alert(1)';d.querySelector('.intercom-setup form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(saved.length,0);
 d.getElementById('intercom-uri').value='sip:panel@example.com';d.querySelector('.intercom-setup form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(saved.length,1);assert.equal(saved[0].password,'private-sip-secret');assert(!d.body.textContent.includes('private-sip-secret'));
 w.AurelviI18n.setLanguage('sk');assert.equal(d.getElementById('intercom-heading').textContent,'Interkom');assert.equal(d.querySelector('.intercom-end').textContent,'Ukončiť hovor');w.AurelviI18n.setLanguage('en');assert.equal(d.getElementById('intercom-heading').textContent,'Intercom');
 w.close();console.log('PASS SIP registration, selected iOS/Android contacts, one call, mute, hangup, incoming consent, busy/unknown rejection, microphone denial, validation and native-only credential saving');
})().catch(e=>{console.error(e);w.close();process.exitCode=1;});
