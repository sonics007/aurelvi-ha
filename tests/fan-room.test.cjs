const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const dom=new JSDOM('<body/>',{url:'https://ha.test',runScripts:'outside-only'}),w=dom.window;
const states={
  'fan.ceiling':{state:'on',attributes:{friendly_name:'Ceiling fan',percentage:50,percentage_step:16.67,preset_mode:'natural',preset_modes:['normal','natural','sleep','breeze','eco','auto','smart'],oscillating:false,direction:'forward'}},
  'light.ceiling':{state:'on',attributes:{brightness:128,supported_color_modes:['color_temp'],effect_list:['soft','pulse']}},
  'select.wind':{state:'natural',attributes:{options:['normal','natural','sleep','breeze','eco','auto','smart']}},
  'number.fan_timer':{state:'0.5',attributes:{min:0,max:8,step:0.5,unit_of_measurement:'h'}},
  'switch.reverse':{state:'off',attributes:{}},
  'light.unrelated':{state:'off',attributes:{}},
};
const records=Object.keys(states).map(entity_id=>({entity_id,device_id:entity_id==='light.unrelated'?'other':'ceiling'}));
const store={panels:[{id:'panel',paired:true,device:{},config:{pages:[{id:'home',title:'Home',type:'grid',grid:{columns:2,rows:2},tiles:[]}]},status:{online:true,info:{},sys:{}}}],timers:{},settings:{},latest:{},logs:[]};
w.eval(fs.readFileSync(__dirname+'/../custom_components/aurelvi/frontend/studio.js','utf8'));
const studio=w.document.createElement('aurelvi-studio');studio.hass={language:'en',states,callWS:async()=>structuredClone(store)};w.document.body.append(studio);
(async()=>{
  await studio.load();
  const pages=studio.buildRoomDraft({area_id:'living',name:'Living'},records),fan=pages.find(p=>p.type==='fan').fan,tiles=pages.flatMap(p=>p.tiles||[]);
  assert.equal(fan.speeds.length,6);assert(fan.speeds.every(s=>typeof s.percentage==='number'));
  assert.equal(fan.lightEntity,'light.ceiling');assert(fan.controls.temperature);
  const modes=tiles.filter(t=>t.stateAttribute==='preset_mode');
  assert.deepEqual(Array.from(modes).flatMap(t=>Array.from(t.items,i=>i.value)),Array.from(states['fan.ceiling'].attributes.preset_modes));
  assert(modes.every(t=>t.items.length<=4&&t.stateKey==='aurelvi_attr_fan_ceiling_preset_mode'));
  assert.equal(modes[0].bindings['state:natural'].service,'fan.set_preset_mode');
  const oscillation=tiles.find(t=>t.stateAttribute==='oscillating');assert.equal(oscillation.bindings['state:false'].data.oscillating,false);assert.equal(oscillation.bindings['state:true'].data.oscillating,true);
  assert.equal(tiles.find(t=>t.stateAttribute==='effect').bindings['state:pulse'].data.effect,'pulse');
  assert.equal(tiles.filter(t=>t.entity==='select.wind').flatMap(t=>Array.from(t.items||[])).length,7);
  assert(tiles.some(t=>t.entity==='number.fan_timer'&&t.type==='readout'));
  const adjust=tiles.find(t=>t.entity==='number.fan_timer'&&t.type==='split');assert.equal(adjust.buttons[0].bindings.press.delta,-1);assert.equal(adjust.buttons[1].bindings.press.dynamic,'number_step');
  assert(tiles.some(t=>t.entity==='switch.reverse'||(t.buttons||[]).some(b=>b.entity==='switch.reverse')));
  // Exercise the unchanged APK renderer: projected attributes confirm each mode.
  const frontend=__dirname+'/../custom_components/aurelvi/frontend/';
  const panel=new JSDOM(fs.readFileSync(frontend+'index.html','utf8'),{url:'https://panel.test/?demo=1',runScripts:'outside-only',pretendToBeVisual:true}),pw=panel.window;
  pw.TextEncoder=TextEncoder;pw.TextDecoder=TextDecoder;pw.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});
  for(const file of ['protocol.js','icons.js','skins.js','features.js','aurelvi.js','licence.js','app.js'])pw.eval(fs.readFileSync(frontend+file,'utf8'));
  const modePage={id:'settings',type:'grid',title:'Settings',grid:{columns:2,rows:2},tiles:[{...modes[0],row:1,col:1},{...oscillation,row:2,col:1}]};
  const mirrors={fan_ceiling:{available:true,on:true,value:'on'},aurelvi_attr_fan_ceiling_preset_mode:{available:true,value:'natural'},aurelvi_attr_fan_ceiling_oscillating:{available:true,value:false}};
  pw.OpenPanelDemo.set({pages:[modePage]},mirrors);
  const controls=Array.from(pw.document.querySelectorAll('#surface .segment'));
  assert.equal(controls.filter(b=>b.classList.contains('lit')).length,2);
  assert(controls.find(b=>b.textContent.includes('natural')).classList.contains('lit'));
  const sent=[];pw.OpenPanelDemo.setClient({publish:(...args)=>sent.push(args)});controls.find(b=>b.textContent.includes('breeze')).click();
  assert(sent.some(args=>JSON.stringify(args).includes('breeze')));assert(controls.find(b=>b.textContent.includes('natural')).classList.contains('lit'));
  mirrors.aurelvi_attr_fan_ceiling_preset_mode={available:true,value:'unknown'};pw.OpenPanelDemo.set({pages:[modePage]},mirrors);
  const breeze=Array.from(pw.document.querySelectorAll('#surface .segment')).find(b=>b.textContent.includes('breeze'));assert(!breeze.disabled);assert(!breeze.classList.contains('lit'));breeze.click();assert(sent.length>=2);
  pw.close();
  delete states['fan.ceiling'].attributes.oscillating;delete states['fan.ceiling'].attributes.preset_modes;
  const rebuilt=studio.buildRoomDraft({area_id:'living',name:'Living'},records);
  assert(!rebuilt.flatMap(p=>p.tiles||[]).some(t=>['preset_mode','oscillating'].includes(t.stateAttribute)));
  studio.remove();w.close();console.log('PASS fan percentage plus all presets, oscillation false, linked light/effects, select pagination, number controls and missing capabilities');
})().catch(e=>{console.error(e);w.close();process.exitCode=1});
