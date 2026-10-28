"""ADB routing, command isolation and installation against a fake Android transport."""
import asyncio
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
import types
import unittest
from unittest.mock import patch
from adb_shell.auth.keygen import keygen
from adb_shell.auth.sign_pythonrsa import PythonRSASigner

spec=importlib.util.spec_from_file_location('aurelvi_adb',Path(__file__).resolve().parents[1]/'custom_components/aurelvi/adb.py')
adb=importlib.util.module_from_spec(spec);spec.loader.exec_module(adb)

class Device:
    instances=[]
    fail_install=False
    def __init__(self,*a,**kw):self.commands=[];self.closed=False;self.instances.append(self)
    def connect(self,**kw):return True
    def shell(self,cmd,**kw):
        self.commands.append(cmd)
        if cmd.startswith('pm install'):return 'Failure [INSTALL_FAILED_UPDATE_INCOMPATIBLE]' if self.fail_install else 'Success'
        if 'query-activities' in cmd:return 'sk.openpanel.nspanel/.MainActivity\ncom.android.launcher3/.Launcher\n'
        return 'OK'
    def push(self,local,remote,**kw):assert Path(local).exists();self.remote=remote
    def close(self):self.closed=True

class Tests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
        self.key=str(Path(self.tmp.name)/'adbkey')
        self.p=patch.dict(sys.modules,{'adb_shell.adb_device':types.SimpleNamespace(AdbDeviceTcp=Device)})
        self.p.start();self.addCleanup(self.p.stop)
    def execute(self,op,data=None):return adb.execute(self.key,'192.168.1.231',5555,op,data or {})
    def test_local_endpoint(self):self.assertEqual(adb.endpoint({'host':'192.168.1.231','port':5555}),('192.168.1.231',5555))
    def test_reject_non_panel_targets(self):
        for host in ['127.0.0.1','0.0.0.0','169.254.169.254','8.8.8.8','localhost','192.168.1.2;reboot','224.0.0.1']:
            with self.subTest(host=host),self.assertRaises(ValueError):adb.endpoint({'host':host})
    def test_reject_ports(self):
        for port in [0,65536,'invalid',None]:
            with self.subTest(port=port),self.assertRaises(ValueError):adb.endpoint({'host':'192.168.1.2','port':port})
    def test_text_never_accepts_shell(self):
        for text in ['hello;reboot','$(reboot)','`reboot`','a\nb','a%sb','á','']:
            with self.subTest(text=text),self.assertRaises(ValueError):adb.text_command(text)
        self.assertEqual(adb.text_command('hello world!'),'input text '+"'hello%sworld!'")
    def test_connect_key_persisted_private_and_transport_closed(self):
        self.execute('connect');key=Path(self.key).read_bytes();self.execute('wake')
        self.assertEqual(key,Path(self.key).read_bytes());self.assertEqual(Path(self.key).stat().st_mode&0o777,0o600)
        self.assertTrue(Device.instances[-1].closed);self.assertEqual(Device.instances[-1].commands,['input keyevent 224'])
    def test_restore_resolves_alternate_home(self):
        self.execute('unset_home');self.assertEqual(Device.instances[-1].commands[-1],'cmd package set-home-activity com.android.launcher3/.Launcher')
    def test_install_checks_result_then_launches_and_cleans(self):
        def download(path):Path(path).write_bytes(b'APK');return 'Aurelvi-0.3.4.apk'
        with patch.object(adb,'download_apk',download):result=self.execute('install')
        self.assertIn('installed',result['output']);d=Device.instances[-1]
        self.assertEqual(d.commands,['pm install -r /data/local/tmp/aurelvi-update.apk','am start -n sk.openpanel.nspanel/.MainActivity','rm -f /data/local/tmp/aurelvi-update.apk']);self.assertTrue(d.closed)
    def test_failed_install_does_not_launch(self):
        with patch.object(Device,'fail_install',True),patch.object(adb,'download_apk',lambda path:Path(path).write_bytes(b'APK')):
            with self.assertRaisesRegex(ValueError,'INSTALL_FAILED'):self.execute('install')
        self.assertFalse(any(c.startswith('am start') for c in Device.instances[-1].commands));self.assertTrue(Device.instances[-1].closed)
    def test_download_integrity(self):
        payload=b'APK';asset={'name':'Aurelvi-0.3.4.apk','browser_download_url':'https://github.com/sonics007/aurelvi-apk/releases/download/v0.3.4/Aurelvi-0.3.4.apk','digest':'sha256:'+hashlib.sha256(payload).hexdigest(),'size':3}
        def run(blob):
            replies=iter([json.dumps({'assets':[asset]}).encode(),blob])
            with patch.object(adb,'urlopen',lambda *a,**kw:io.BytesIO(next(replies))):return adb.download_apk(str(Path(self.tmp.name)/'file.apk'))
        self.assertEqual(run(payload),asset['name'])
        with self.assertRaisesRegex(ValueError,'checksum'):run(b'BAD')
    def test_unknown_operation_does_not_connect(self):
        with self.assertRaises(ValueError):asyncio.run(adb.async_command(None,{'operation':'shell','host':'192.168.1.2'}))
    def test_busy_lock_rejects_concurrent_commands(self):
        async def run():
            hub=types.SimpleNamespace(adb_lock=asyncio.Lock());await hub.adb_lock.acquire()
            with self.assertRaisesRegex(ValueError,'running'):await adb.async_command(hub,{'operation':'connect','host':'192.168.1.2'})
        asyncio.run(run())

    def hub(self,**kw):
        h=types.SimpleNamespace(panels={'p1':{'paired':True}},status={},calls=[],hass=None)
        async def persist():h.calls.append('persist')
        h.persist=persist;h.__dict__.update(kw);return h
    def test_resolve_endpoint_order(self):
        h=self.hub();h.status['p1']={'info':{'ip':'192.168.1.50'}}
        self.assertEqual(adb.resolve_endpoint(h,'p1'),('192.168.1.50',5555))
        h.panels['p1']['adb']={'host':'192.168.1.60','port':5556}
        self.assertEqual(adb.resolve_endpoint(h,'p1'),('192.168.1.60',5556))
        self.assertEqual(adb.resolve_endpoint(h,'p1',{'host':'192.168.1.70'}),('192.168.1.70',5556))
        self.assertTrue(adb.has_endpoint(h,'p1'))
    def test_resolve_endpoint_missing_or_public(self):
        h=self.hub();self.assertFalse(adb.has_endpoint(h,'p1'))
        with self.assertRaises(ValueError):adb.resolve_endpoint(h,'p1')
        h.status['p1']={'info':{'ip':'8.8.8.8'}}
        with self.assertRaises(ValueError):adb.resolve_endpoint(h,'p1')
    def test_remember_endpoint_persists_once(self):
        h=self.hub();asyncio.run(adb.remember_endpoint(h,'p1',{'host':'192.168.1.9','port':5555}));asyncio.run(adb.remember_endpoint(h,'p1',{'host':'192.168.1.9','port':5555}))
        self.assertEqual(h.panels['p1']['adb'],{'host':'192.168.1.9','port':5555});self.assertEqual(h.calls,['persist'])
    def test_service_rejects_disallowed_operations(self):
        h=self.hub();h.panels['p1']['adb']={'host':'192.168.1.9','port':5555}
        for op in ['install','text','set_home','unset_home','memory','notifications','shell',None]:
            with self.subTest(op=op),self.assertRaisesRegex(ValueError,'not allowed'):asyncio.run(adb.async_service(h,{'panel_id':'p1','operation':op}))
        with self.assertRaisesRegex(ValueError,'Unknown panel'):asyncio.run(adb.async_service(h,{'panel_id':'zz','operation':'reboot'}))
    def test_service_runs_reboot_with_resolved_endpoint(self):
        h=self.hub();h.status['p1']={'info':{'ip':'192.168.1.50'}};seen=[]
        async def fake(hub,data):seen.append(data);return {'output':'OK'}
        with patch.object(adb,'async_command',fake):asyncio.run(adb.async_service(h,{'panel_id':'p1','operation':'reboot'}))
        self.assertEqual(seen,[{'operation':'reboot','host':'192.168.1.50','port':5555}]);self.assertEqual(h.panels['p1']['adb']['host'],'192.168.1.50')

if __name__=='__main__':unittest.main()
