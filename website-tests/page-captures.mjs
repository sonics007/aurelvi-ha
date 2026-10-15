/* Capture the actual panel renderer with local, fictional data; no HA or MQTT access. */
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('custom_components/aurelvi/frontend');
const output=path.resolve('website/assets/pages');
const camera=`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="#bec6b6"/><path d="M0 0H800V300H0Z" fill="#e7e3d9"/><path d="M0 300H800V450H0Z" fill="#bbaa91"/><path d="M80 60H310V300H80Z" fill="#526960"/><path d="M99 78H290V280H99Z" fill="#b5c9be"/><path d="M195 78V280M99 170H290" stroke="#f1eee5" stroke-width="10"/><rect x="450" y="60" width="190" height="290" rx="3" fill="#83725d"/><rect x="470" y="80" width="150" height="245" fill="#9e8a70"/><circle cx="603" cy="200" r="6" fill="#d9cead"/><path d="M325 320H405L390 385H340Z" fill="#817b67"/><path d="M365 325V210M365 260Q295 215 325 185Q378 210 365 260M365 290Q440 240 410 210Q362 220 365 290" fill="#557359" stroke="#557359" stroke-width="8"/><rect x="20" y="20" width="230" height="35" rx="5" fill="#17372acc"/><text x="34" y="43" fill="#fff" font-family="sans-serif" font-size="16">ILLUSTRATED DEMO FEED</text></svg>`;
const server=http.createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;if(pathname==='/demo-camera.svg'){res.setHeader('Content-Type','image/svg+xml');return res.end(camera)}const target=path.resolve(root,'.'+pathname);if(!target.startsWith(root+path.sep))throw Error();const data=await fs.readFile(target);res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(target)]||'application/octet-stream');res.end(data)}catch{res.writeHead(404);res.end()}});
await new Promise(r=>server.listen(8776,'127.0.0.1',r));
const tile=(id,label,icon,col,row,extra={})=>({id,type:'button',label,icon,entity:'light.'+id,col,row,...extra});
const grid=(title,columns,rows,tiles)=>({id:'demo',type:'grid',title,grid:{columns,rows},tiles});
const state=(on=true,extra={})=>({available:true,on,value:on?'on':'off',...extra});
const room=grid('Living room',2,2,[tile('ceiling','Ceiling','light',1,1),tile('reading','Reading','light',2,1),tile('evening','Evening','scene',1,2),tile('all_off','All off','power',2,2)]);
const variants=[
 {id:'room',theme:'kyoto-oak',page:room,states:{light_ceiling:state(),light_reading:state(),light_evening:state(false),light_all_off:state(false)}},
 {id:'scenes',theme:'empire-emerald',page:grid('Your favourite scenes',3,2,['Morning','Reading','Dinner','Cinema','Relax','Good night'].map((label,i)=>tile('scene'+i,label,'scene',i%3+1,Math.floor(i/3)+1,{entity:'scene.scene'+i,behavior:'push'})))},
 {id:'lights',theme:'pearl-ceramic',page:grid('Lighting',1,3,['Ceiling','Pendant','Reading lamp'].map((label,i)=>tile('light'+i,label,'light',1,i+1,{type:'dimmer'}))),states:{light_light0:state(true,{brightness:.8}),light_light1:state(true,{brightness:.45}),light_light2:state(true,{brightness:.25})}},
 {id:'blinds',theme:'walnut-amplifier',page:grid('Blinds',2,1,[tile('east','East window','cover',1,1,{entity:'cover.east',type:'rocker'}),tile('west','West window','cover',2,1,{entity:'cover.west',type:'rocker'})]),states:{cover_east:state(),cover_west:state()}},
 {id:'clock-analog',theme:'kyoto-oak',page:{id:'demo',type:'clock',title:'A moment of calm'},device:{clockFace:'analog',clockTheme:'kyoto-oak',clockAccent:'#776044'}},
 {id:'clock-digital',theme:'gatsby-midnight',page:{id:'demo',type:'clock',title:'Time for yourself'},device:{clockFace:'digital',clockTheme:'gatsby-midnight',clockAccent:'#d6b97b'}},
 {id:'weather',theme:'glacier-glass',page:{id:'demo',type:'weather',title:'Weather at home',weather:{entity:'weather.home'}}},
 {id:'weather-night',theme:'tokyo-pulse',page:{id:'demo',type:'weather',title:'Tomorrow, at a glance',weather:{entity:'weather.home'}}},
 {id:'alarm',theme:'obsidian-sunburst',page:{id:'demo',type:'alarm',title:'Home security',alarm:{stateTopic:'alarmo/state',commandTopic:'alarmo/command'}}},
 {id:'camera',theme:'stereo-silver',page:{id:'demo',type:'camera',title:'Entrance · demo',camera:{cameras:[{entity:'camera.entrance',name:'Entrance · illustrated demo',ptz:{up:true,down:true,left:true,right:true}}]}},states:{camera_entrance:state(true,{stream:'http://127.0.0.1:8776/demo-camera.svg'})}},
 {id:'music',theme:'champagne-receiver',page:{id:'demo',type:'music',title:'Music in the living room'}},
 {id:'fan',theme:'empire-emerald',page:{id:'demo',type:'fan',title:'Ceiling fan',fan:{fanEntity:'fan.ceiling',lightEntity:'light.ceiling',speeds:[17,33,50,67,83,100].map((percentage,i)=>({label:String(i+1),percentage})),controls:{direction:true,allOff:true,timer:false,brightness:false,temperature:false},extras:[]}},states:{fan_ceiling:state(true,{percentage:50,direction:'forward'}),light_ceiling:state(true,{brightness:.7})}}
];
let browser;
try{
 await fs.mkdir(output,{recursive:true});browser=await chromium.launch({headless:true});
 for(const variant of variants){
  const page=await browser.newPage({viewport:{width:480,height:480},deviceScaleFactor:1,timezoneId:'Europe/Bratislava'});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:8776'?route.continue():route.abort());
  await page.clock.setFixedTime(new Date('2026-10-15T08:08:30Z'));
  await page.goto('http://127.0.0.1:8776/index.html?demo=1');
  await page.waitForFunction(()=>!!window.OpenPanelDemo);
  await page.evaluate(v=>{
   const d=window.OpenPanelDemo;d.setClient({prefix:'aurelvi/panel/gallery',publish:()=>true,subscribe:()=>{},unsubscribe:()=>{}});
   d.setDevice({theme:v.theme,clockLanguage:'en-GB',uiLanguage:'en',...v.device});
   d.set({theme:v.theme,pages:[v.page]},v.states||{});
   if(v.page.type==='weather')d.features.onState('weather',{entity:'weather.home',condition:'sunny',attributes:{temperature:22,temperature_unit:'°C',humidity:48,wind_speed:9,wind_speed_unit:'km/h'},forecast:[22,24,21,19,23].map((temperature,i)=>({datetime:new Date(Date.UTC(2026,9,15+i)).toISOString(),temperature,templow:12+i%3})),ts:Date.now()});
   if(v.page.type==='alarm')d.features.onRaw('alarmo/state','disarmed');
   if(v.page.type==='music')window.OpenPanelNativeEvent('media',{title:'Sunday morning · demo track',state:'playing',volume:.45});
  },variant);
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.src?i.decode():Promise.resolve()));const skin=window.AurelviSkins.find(s=>s.id===document.body.dataset.skin);if(skin?.texture){const i=new Image();i.src='materials/'+skin.texture+'.webp';await i.decode()}});
  assert.equal(await page.locator('#settings').isHidden(),true);
  assert((await page.locator('#surface').textContent()).trim().length>0);
  if(variant.page.type==='weather')assert.equal(await page.locator('.forecast-day').count(),5);
  if(variant.page.type==='camera')assert(await page.locator('.camera-stream').evaluate(i=>i.naturalWidth>0));
  await page.screenshot({path:path.join(output,variant.id+'.png'),animations:'disabled'});
  assert.deepEqual(errors,[],variant.id);await page.close();
 }
 console.log('PASS: 12 actual panel captures; sample data, local assets, no external services.');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
