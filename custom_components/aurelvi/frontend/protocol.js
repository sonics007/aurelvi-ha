/* OpenPanel — independently written MQTT 3.1.1 adapter. MIT. */
(function(root){
  'use strict';
  function tr(key,vars){return root.AurelviI18n?root.AurelviI18n.t(key,vars):key;}
  var encoder=new TextEncoder(),decoder=new TextDecoder('utf-8');
  function concat(parts){var size=0;parts.forEach(function(p){size+=p.length;});var out=new Uint8Array(size),at=0;parts.forEach(function(p){out.set(p,at);at+=p.length;});return out;}
  function string(value){var bytes=encoder.encode(String(value));if(bytes.length>65535)throw Error(tr('panel.protocol.string_too_long'));return concat([new Uint8Array([bytes.length>>8,bytes.length&255]),bytes]);}
  function packet(header,body){var n=body.length,encoded=[];do{var b=n%128;n=Math.floor(n/128);encoded.push(b|(n?128:0));}while(n);return concat([new Uint8Array([header].concat(encoded)),body]);}
  var namespace='aurelvi';function setNamespace(){namespace='aurelvi';}
  function base(id){if(!/^[A-Za-z0-9_-]{1,64}$/.test(id)||id==='discover')throw Error(tr('panel.protocol.invalid_panel_id'));return namespace+'/panel/'+id;}
  function entityKey(id){return String(id||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');}
  function stateFor(tile,states){return states[tile.stateKey||entityKey(tile.entity)]||{};}
  function compare(actual,rule){
    if(actual===undefined||actual===null||actual==='unknown'||actual==='unavailable')return false;
    var op=rule.operator||'equals',wanted=rule.compareTo===undefined?'on':rule.compareTo;
    if(op==='equals')return String(actual)===String(wanted);
    if(op==='notEqual')return String(actual)!==String(wanted);
    var a=Number(actual),b=Number(wanted);if(!isFinite(a)||!isFinite(b))return false;
    if(op==='less')return a<b;if(op==='more')return a>b;
    if(op==='notLess')return a>=b;if(op==='notMore')return a<=b;return false;
  }
  function splitState(segment,states){var cfg=segment.state||{};function test(rule){if(!rule)return false;return compare((states[entityKey(rule.entity||cfg.entity)]||{}).value,rule);}if(test(cfg.inset))return 'inset';if(test(cfg.on))return 'on';return 'off';}
  function validateConfig(doc){
    if(!doc||!Array.isArray(doc.pages)||!doc.pages.length||doc.pages.length>30)throw Error(tr('panel.protocol.invalid_pages'));
    var pageIds=Object.create(null),tileIds=Object.create(null);
    doc.pages.forEach(function(page){if(!page||typeof page.id!=='string'||!page.id||pageIds[page.id])throw Error(tr('panel.protocol.invalid_page_id'));pageIds[page.id]=true;
      if(page.type!=='grid')return;var grid=page.grid||{},occupied=Object.create(null);
      if(!Number.isInteger(grid.columns)||!Number.isInteger(grid.rows)||grid.columns<1||grid.rows<1||grid.columns>12||grid.rows>12||!Array.isArray(page.tiles)||page.tiles.length>100)throw Error(tr('panel.protocol.invalid_grid'));
      page.tiles.forEach(function(tile){if(!tile||typeof tile.id!=='string'||!tile.id||tileIds[tile.id])throw Error(tr('panel.protocol.invalid_tile_id'));tileIds[tile.id]=true;
        var cs=tile.colSpan===undefined?1:tile.colSpan,rs=tile.rowSpan===undefined?1:tile.rowSpan;
        if(!Number.isInteger(tile.col)||!Number.isInteger(tile.row)||!Number.isInteger(cs)||!Number.isInteger(rs)||tile.col<1||tile.row<1||cs<1||rs<1||tile.col+cs-1>grid.columns||tile.row+rs-1>grid.rows)throw Error(tr('panel.protocol.tile_outside_grid'));
        for(var c=tile.col;c<tile.col+cs;c++)for(var r=tile.row;r<tile.row+rs;r++){var cell=c+','+r;if(occupied[cell])throw Error(tr('panel.protocol.tiles_overlap'));occupied[cell]=true;}
      });
    });return doc;
  }
  function event(button,page,action,value,state){var doc={eventId:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12),v:1,button:button,page:page,action:action,ts:Date.now()};if(value!==undefined)doc.value=value;if(state!==undefined)doc.state=state;return doc;}
  function Client(options){this.o=options;this.prefix=base(options.deviceId);this.online=false;this.closed=false;this.serial=1;this.retries=0;this.buffer=new Uint8Array(0);this.reason='';this.connect();}
  Client.prototype.connect=function(){
    if(this.closed)return;var self=this;this.o.status('connecting');this.reason='';this.buffer=new Uint8Array(0);this.lastRx=Date.now();this.pingPending=false;
    try{this.ws=new (this.o.WebSocket||root.WebSocket)(this.o.url,['mqtt']);}catch(e){this.reason=e.message;this.o.status('offline',this.reason);this.retry();return;}
    this.ws.binaryType='arraybuffer';
    this.ws.onopen=function(){var flags=2|4|32|(self.o.username?128:0)|((self.o.password||self.o.username)?64:0),parts=[string('MQTT'),new Uint8Array([4,flags,0,30]),string('aurelvi-'+self.o.deviceId),string(self.prefix+'/avail'),string('offline')];if(self.o.username)parts.push(string(self.o.username));if(self.o.password||self.o.username)parts.push(string(self.o.password||''));self.send(packet(16,concat(parts)));self.handshake=setTimeout(function(){if(!self.online){self.reason=tr('panel.protocol.no_answer');self.ws.close();}},10000);};
    this.ws.onmessage=function(e){try{self.receive(new Uint8Array(e.data));}catch(error){self.reason=error.message;self.ws.close();}};
    this.ws.onerror=function(){self.reason=tr('panel.protocol.connection_failed');};
    this.ws.onclose=function(){self.online=false;clearTimeout(self.handshake);clearInterval(self.keepalive);if(!self.closed)self.o.status('offline',self.reason);self.retry();};
  };
  Client.prototype.retry=function(){if(this.closed)return;var self=this;clearTimeout(this.retryTimer);this.retryTimer=setTimeout(function(){self.connect();},Math.min(30000,1000*Math.pow(2,Math.min(this.retries++,5))));};
  Client.prototype.send=function(data){if(this.ws&&this.ws.readyState===1)this.ws.send(data);};
  Client.prototype.publish=function(topic,data,retained){if(!this.online)return false;this.send(packet(retained?49:48,concat([string(topic),encoder.encode(typeof data==='string'?data:JSON.stringify(data))])));return true;};
  Client.prototype.subscribe=function(topics){var id=this.serial++%65535||1,parts=[new Uint8Array([id>>8,id&255])];topics.forEach(function(t){parts.push(string(t),new Uint8Array([0]));});this.send(packet(130,concat(parts)));};
  Client.prototype.unsubscribe=function(topics){var id=this.serial++%65535||1,parts=[new Uint8Array([id>>8,id&255])];topics.forEach(function(t){parts.push(string(t));});this.send(packet(162,concat(parts)));};
  Client.prototype.receive=function(bytes){
    this.buffer=concat([this.buffer,bytes]);if(this.buffer.length>2097152)throw Error(tr('panel.protocol.message_too_large'));
    while(this.buffer.length>=2){var n=0,m=1,i=1,b;do{if(i>=this.buffer.length)return;b=this.buffer[i++];n+=(b&127)*m;m*=128;if(i>5)throw Error(tr('panel.protocol.invalid_header'));}while(b&128);
      if(n>1048576)throw Error(tr('panel.protocol.message_too_large'));if(this.buffer.length<i+n)return;var header=this.buffer[0],body=this.buffer.slice(i,i+n);this.buffer=this.buffer.slice(i+n);this.lastRx=Date.now();this.handle(header,body);
    }
  };
  Client.prototype.handle=function(header,body){var self=this,type=header>>4;
    if(type===2){if(body.length!==2||body[1]!==0){this.reason=tr('panel.protocol.login_refused',{code:body[1]});this.ws.close();return;}clearTimeout(this.handshake);this.online=true;this.retries=0;this.subscribe([this.prefix+'/config/panels',this.prefix+'/config/device',this.prefix+'/state/+',this.prefix+'/cmd/+',this.prefix+'/sys/+',namespace+'/panel/discover']);this.publish(this.prefix+'/avail','online',true);this.o.status('online');if(this.o.connected)this.o.connected();this.keepalive=setInterval(function(){if(self.pingPending&&Date.now()-self.lastRx>40000){self.reason=tr('panel.protocol.stopped_responding');self.ws.close();return;}self.pingPending=true;self.send(new Uint8Array([192,0]));},20000);
    }else if(type===3){if(body.length<2)throw Error(tr('panel.protocol.invalid_message'));var n=(body[0]<<8)|body[1],qos=(header>>1)&3,offset=2+n;if(body.length<offset+(qos?2:0)||qos>1)throw Error(tr('panel.protocol.unsupported_message'));var topic=decoder.decode(body.slice(2,offset)),id;if(qos){id=body.slice(offset,offset+2);offset+=2;}this.o.message(topic,decoder.decode(body.slice(offset)),!!(header&1));if(qos)this.send(packet(64,id));
    }else if(type===9){if(body.length<3||Array.prototype.some.call(body.slice(2),function(v){return v===128;})){this.reason=tr('panel.protocol.subscribe_refused');this.ws.close();}}
    else if(type===13)this.pingPending=false;
  };
  Client.prototype.close=function(){this.closed=true;clearTimeout(this.retryTimer);clearTimeout(this.handshake);clearInterval(this.keepalive);if(this.online){this.publish(this.prefix+'/avail','offline',true);this.send(new Uint8Array([224,0]));}this.online=false;if(this.ws)this.ws.close();};
  var api={Client:Client,concat:concat,string:string,packet:packet,base:base,setNamespace:setNamespace,entityKey:entityKey,stateFor:stateFor,compare:compare,splitState:splitState,validateConfig:validateConfig,event:event};root.OpenPanelProtocol=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
