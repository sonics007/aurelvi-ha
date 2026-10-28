"""Pure validation, indexing and state projection. No Home Assistant dependency."""
from __future__ import annotations
import copy
import json
import math
import re
from .i18n import msg

ID = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
ENTITY = re.compile(r"^[a-z_][a-z0-9_]*\.[a-z0-9_]+$")
SERVICE = re.compile(r"^[a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*$")
TYPES = {"grid", "fan", "clock", "weather", "camera", "alarm", "music"}
PROJECTED_ATTRIBUTES = {'preset_mode','oscillating','effect'}

def attribute_key(entity, attribute):
    return 'aurelvi_attr_'+entity_key(entity)+'_'+attribute

def panel_id(value):
    if not isinstance(value, str) or not ID.fullmatch(value) or value == "discover":
        raise ValueError(msg('backend.models.invalid_panel_id'))
    return value

def entity_id(value, domain=None):
    if not isinstance(value,str) or not ENTITY.fullmatch(value) or domain and value.split('.')[0] != domain:
        raise ValueError(msg('backend.models.invalid_entity'))
    return value

def entity_key(value):
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip('_')

def number(value, low, high):
    if isinstance(value,bool) or not isinstance(value,(int,float)) or not math.isfinite(value) or not low <= value <= high:
        raise ValueError(msg('backend.models.number_out_of_range'))
    return value

def actions(value):
    if isinstance(value,dict): value=[value]
    if not isinstance(value,list) or not value or len(value)>10: raise ValueError(msg('backend.models.actions_count'))
    for action in value:
        if isinstance(action,dict) and action=={'noop':True}:continue
        if not isinstance(action,dict) or not SERVICE.fullmatch(action.get('service','')): raise ValueError(msg('backend.models.action_service'))
        target=action.get('target',{})
        if not isinstance(target,dict) or set(target)-{'entity_id','area_id','device_id','label_id'}: raise ValueError(msg('backend.models.invalid_target'))
        ids=target.get('entity_id',action.get('entity_id',[]))
        for item in [ids] if isinstance(ids,str) else ids: entity_id(item)
        if not isinstance(action.get('data',{}),dict): raise ValueError(msg('backend.models.action_data_object'))
    return value

def validate_config(doc):
    if not isinstance(doc,dict) or len(json.dumps(doc))>262144: raise ValueError(msg('backend.models.config_too_large'))
    doc=copy.deepcopy(doc)
    pages=doc.get('pages')
    if not isinstance(pages,list) or not 1<=len(pages)<=30: raise ValueError(msg('backend.models.pages_count'))
    page_ids=set(); tile_ids=set()
    for page in pages:
        pid=panel_id(page.get('id'))
        if pid in page_ids: raise ValueError(msg('backend.models.duplicate_page'))
        page_ids.add(pid)
        if page.get('type') not in TYPES: raise ValueError(msg('backend.models.unsupported_page_type'))
        if page.get('type')=='fan':
            fan=page.get('fan',{}); entity_id(fan.get('fanEntity'),'fan')
            if fan.get('lightEntity'): entity_id(fan['lightEntity'],'light')
            speeds=fan.get('speeds',[])
            if not isinstance(speeds,list) or not 1<=len(speeds)<=6: raise ValueError(msg('backend.models.speeds_count'))
            for speed in speeds:
                if speed.get('actions'): actions(speed['actions'])
                elif 'percentage' in speed: number(speed['percentage'],1,100)
                elif not isinstance(speed.get('preset_mode'),str) or not speed['preset_mode']: raise ValueError(msg('backend.models.speed_assign'))
            for extra in fan.get('extras',[]):
                eid=panel_id(extra.get('id'))
                if pid+'.'+eid in tile_ids: raise ValueError(msg('backend.models.duplicate_action'))
                tile_ids.add(pid+'.'+eid);actions(extra.get('actions'))
            if len(fan.get('extras',[]))>8:raise ValueError(msg('backend.models.extras_max'))
        if page.get('type')=='grid':
            grid=page.get('grid',{});cols=number(grid.get('columns'),1,12);rows=number(grid.get('rows'),1,12)
            if int(cols)!=cols or int(rows)!=rows: raise ValueError(msg('backend.models.grid_integers'))
            tiles=page.get('tiles',[])
            if not isinstance(tiles,list) or len(tiles)>100:raise ValueError(msg('backend.models.too_many_tiles'))
            occupied=set()
            for tile in tiles:
                tid=panel_id(tile.get('id'))
                if tid in tile_ids:raise ValueError(msg('backend.models.duplicate_tile'))
                tile_ids.add(tid)
                if tile.get('type') not in {'button','dimmer','switcher','split','rocker','readout'}:raise ValueError(msg('backend.models.unsupported_control'))
                for name in ['row','col','rowSpan','colSpan']:
                    value=tile.get(name,1);number(value,1,12)
                    if int(value)!=value:raise ValueError(msg('backend.models.position_integer'))
                col=tile.get('col',1);row=tile.get('row',1);cs=tile.get('colSpan',1);rs=tile.get('rowSpan',1)
                if col+cs-1>cols or row+rs-1>rows:raise ValueError(msg('backend.models.tile_outside_grid'))
                for c in range(col,col+cs):
                    for r in range(row,row+rs):
                        if (c,r) in occupied:raise ValueError(msg('backend.models.tiles_overlap'))
                        occupied.add((c,r))
                if tile.get('entity'):entity_id(tile['entity'])
                if 'stateAttribute' in tile:
                    if tile['stateAttribute'] not in PROJECTED_ATTRIBUTES or not tile.get('entity') or tile.get('stateKey')!=attribute_key(tile['entity'],tile['stateAttribute']):
                        raise ValueError(msg('backend.models.invalid_projection'))
                for binding in tile.get('bindings',{}).values():actions(binding)
                for segment in tile.get('buttons',[]):
                    for binding in segment.get('bindings',{}).values():actions(binding)
        if page.get('type')=='weather' and (page.get('weather') or {}).get('entity'):entity_id(page['weather']['entity'],'weather')
        if page.get('type')=='camera':
            for camera in (page.get('camera') or {}).get('cameras',[]):
                entity_id(camera.get('entity'),'camera')
                for binding in camera.get('ptz',{}).values():actions(binding)
    doc.setdefault('v',1);doc.setdefault('theme','cream')
    return doc

def entities(config):
    out=set()
    def walk(value):
        if isinstance(value,dict):
            for key,v in value.items():
                if key in {'entity','entity_id','fanEntity','lightEntity'}:
                    for item in [v] if isinstance(v,str) else v if isinstance(v,list) else []:
                        if isinstance(item,str) and ENTITY.fullmatch(item):out.add(item)
                walk(v)
        elif isinstance(value,list):
            for v in value:walk(v)
    walk(config);return out

def finite_attribute(value):
    """Treat missing/invalid device readings as absent, never as zero."""
    if value is None or isinstance(value,bool):return None
    try:value=float(value)
    except (TypeError,ValueError,OverflowError):return None
    return value if math.isfinite(value) else None

def mirror(state):
    if state is None:return {'available':False,'on':False,'value':'unavailable'}
    value=state.state;a=state.attributes
    doc={'available':value not in {'unknown','unavailable'},'on':value=='on','value':value}
    for name in ['percentage','percentage_step','direction','preset_mode','preset_modes','oscillating','supported_features','color_temp_kelvin','min_color_temp_kelvin','max_color_temp_kelvin','temperature','current_temperature','unit_of_measurement','friendly_name','humidity','wind_speed','temperature_unit','wind_speed_unit','media_title','volume_level']:
        if a.get(name) is not None:doc[name]=a[name]
    for name in ['percentage','percentage_step','supported_features','color_temp_kelvin','min_color_temp_kelvin','max_color_temp_kelvin','temperature','current_temperature','humidity','wind_speed','volume_level']:
        if name in doc:
            reading=finite_attribute(doc[name])
            if reading is None:doc.pop(name)
            else:doc[name]=reading
    brightness=finite_attribute(a.get('brightness'))
    if brightness is not None:doc['brightness']=round(max(0,min(255,brightness))/255,4)
    if doc.get('color_temp_kelvin',0)<=0:doc.pop('color_temp_kelvin',None)
    if 'color_temp_kelvin' not in doc:
        mired=finite_attribute(a.get('color_temp'))
        if mired is not None and mired>0:
            kelvin=1000000/mired
            if math.isfinite(kelvin):doc['color_temp_kelvin']=round(kelvin)
    if state.entity_id.startswith('weather.'):doc['condition']=value;doc['attributes']=dict(a)
    return doc

def fan_page(fan='fan.stropny_ventilator',light='light.stropne_svetlo',count=6):
    return {'id':'fan','title':'Svetlo a ventilátor','type':'fan','fan':{'fanEntity':fan,'lightEntity':light,'speeds':[{'label':str(i+1),'percentage':round(100*(i+1)/count)} for i in range(count)],'controls':{'direction':True,'brightness':True,'temperature':True,'allOff':True,'timer':True},'extras':[]}}

def default_config():return {'v':1,'theme':'cream','pages':[{'id':'home','title':'Domov','type':'grid','grid':{'columns':2,'rows':2},'tiles':[]},{'id':'clock','title':'Hodiny','type':'clock'}]}

def validate_device(device,page_count):
    if not isinstance(device,dict) or len(json.dumps(device))>262144:raise ValueError(msg('backend.models.invalid_display'))
    d=copy.deepcopy(device)
    if 'wallpaper' in d:
        wall=d['wallpaper']
        if not isinstance(wall,dict) or wall.get('id') not in {'none','morning','forest','sea','sunset','graphite','custom'}:raise ValueError(msg('backend.models.invalid_wallpaper'))
        if 'dim' in wall:number(wall['dim'],0,80)
        if wall.get('id')=='custom':
            image=wall.get('image','')
            if not isinstance(image,str) or len(image)>180000 or not re.fullmatch(r'data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*',image):raise ValueError(msg('backend.models.invalid_wallpaper_image'))
        elif 'image' in wall:wall.pop('image')
    for key,low,high in [('labelSize',8,32),('labelOffsetY',-40,40),('iconSize',16,96)]:
        if key in d:number(d[key],low,high)
    if 'defaultPage' in d:number(d['defaultPage'],0,page_count-1)
    if 'inactivityTimeout' in d:number(d['inactivityTimeout'],0,86400)
    for key,low,high in [('clockDateSize',8,32),('sysInfoIntervalS',10,3600)]:
        if key in d:number(d[key],low,high)
    if 'clockLanguage' in d and d['clockLanguage'] not in {'en-GB','sk-SK','hu-HU','de-DE','cs-CZ','it-IT'}:raise ValueError(msg('backend.models.invalid_clock_language'))
    for group in ['motion','proximity']:
        if 'on' in d.get(group,{}):number(d[group]['on'],1,100)
    if 'clearS' in d.get('motion',{}):number(d['motion']['clearS'],1,600)
    saver=d.get('screensaver',{})
    if 'nightOffAfter' in saver:number(saver['nightOffAfter'],0,86400)
    if 'after' in saver:number(saver['after'],10,86400)
    if 'dimLevel' in saver:number(saver['dimLevel'],.05,1)
    night=d.get('nightMode',{})
    for key in ['start','end']:
        if key in night:number(night[key],0,23)
    if 'brightness' in night:number(night['brightness'],5,100)
    auto=d.get('autoBrightness',{})
    for key in ['dayBrightness','nightBrightness']:
        if key in auto:number(auto[key],5,100)
    if 'nightThresholdLux' in auto:number(auto['nightThresholdLux'],0,100000)
    if 'screensaverDropPoints' in auto:number(auto['screensaverDropPoints'],0,95)
    return d
