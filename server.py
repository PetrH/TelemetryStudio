#!/usr/bin/env python3
"""Local-only GUI and deterministic alpha-video encoder. Python 3.9+, no pip required."""
import http.server, json, os, pathlib, secrets, shutil, subprocess, tempfile, threading, time, uuid, webbrowser, zipfile
from fit_import import parse_fit
ROOT = pathlib.Path(__file__).resolve().parent
TOKEN = secrets.token_urlsafe(32)
JOBS = {}
LOCK = threading.Lock()
FFMPEG = next(iter((ROOT/'vendor').glob('ffmpeg*')), None) or shutil.which('ffmpeg')
OUT = ROOT/'exports'

def encoding_options(fmt):
    if fmt=='mov': return ['-c:v','prores_ks','-profile:v','4','-pix_fmt','yuva444p10le']
    if fmt=='webm': return ['-c:v','libvpx-vp9','-pix_fmt','yuva420p','-b:v','0','-crf','24','-deadline','good','-cpu-used','4','-row-mt','1','-auto-alt-ref','0']
    if fmt=='h264': return ['-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart']
    if fmt=='h265': return ['-c:v','libx265','-preset','fast','-crf','20','-pix_fmt','yuv420p','-tag:v','hvc1','-x265-params','pools=2:frame-threads=2:log-level=error','-movflags','+faststart']
    raise ValueError('Neznámý video formát.')

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw): super().__init__(*a, directory=str(ROOT), **kw)
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()
    def reply(self, data, code=200):
        b=json.dumps(data).encode(); self.send_response(code); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_GET(self):
        if self.path=='/':
            b=(ROOT/'index.html').read_text().replace('__TOKEN__',TOKEN).encode()
            self.send_response(200); self.send_header('Content-Type','text/html; charset=utf-8'); self.send_header('Content-Length',str(len(b))); self.end_headers(); self.wfile.write(b); return
        if self.path.startswith('/download/'):
            ident=self.path.split('/')[-1]; job=JOBS.get(ident)
            if not job or not job.get('done'): self.send_error(404); return
            p=job['path']; self.send_response(200); self.send_header('Content-Type','application/octet-stream'); self.send_header('Content-Length',str(p.stat().st_size)); self.send_header('Content-Disposition',f'attachment; filename="{p.name}"'); self.end_headers()
            try:
                with p.open('rb') as f: shutil.copyfileobj(f,self.wfile)
            except (BrokenPipeError, ConnectionResetError): pass
            return
        if self.path.split('?')[0] not in ['/i18n.js','/app.js','/route.js','/core.js','/style.css','/vendor/leaflet.js','/vendor/leaflet.css','/demo.json']:
            self.send_error(404); return
        super().do_GET()
    def do_POST(self):
        if self.headers.get('X-Token') != TOKEN: self.reply({'error':'Neplatný přístup.'},403); return
        try:
            size=int(self.headers.get('Content-Length',0))
            if size > 60_000_000: raise ValueError('Požadavek je příliš velký.')
            body=self.rfile.read(size)
            if self.path=='/api/import-fit':
                self.reply({'rows': parse_fit(body)}); return
            if self.path=='/api/start':
                d=json.loads(body); fps=int(d['fps']); w=int(d['width']); h=int(d['height']); count=int(d['count']); fmt=d['format']
                if fps not in [24,25,30,50,60] or (w,h) not in [(1280,720),(1920,1080),(3840,2160)] or not 1<=count<=2_000_000 or fmt not in ['mov','webm','h264','h265','zip']: raise ValueError('Neplatné parametry exportu.')
                with LOCK:
                    if any(not j.get('done') and not j.get('cancelled') for j in JOBS.values()): raise ValueError('Jiný export už běží.')
                    OUT.mkdir(exist_ok=True); ident=uuid.uuid4().hex; ext='mp4' if fmt in ['h264','h265'] else fmt; path=OUT/f'overlay-{time.strftime("%Y%m%d-%H%M%S")}-{ident[:6]}.{ext}'
                    j={'path':path,'count':count,'received':0,'format':fmt}; JOBS[ident]=j
                    if fmt!='zip':
                        if not FFMPEG: j['cancelled']=True; raise ValueError('FFmpeg není dostupný. Použijte PNG sekvenci.')
                        j['log']=tempfile.TemporaryFile()
                        codec=encoding_options(fmt)
                        j['proc']=subprocess.Popen([str(FFMPEG),'-y','-v','error','-f','image2pipe','-framerate',str(fps),'-vcodec','png','-i','pipe:0','-an']+codec+['-threads','2',str(path)],stdin=subprocess.PIPE,stderr=j['log'])
                    else: j['zip']=zipfile.ZipFile(path,'w',zipfile.ZIP_STORED)
                self.reply({'id':ident}); return
            parts=self.path.split('/'); ident=parts[-1]; action=parts[-2]; j=JOBS.get(ident)
            if not j or j.get('done') or j.get('cancelled'): raise ValueError('Export není aktivní.')
            if action=='frame':
                if not body.startswith(b'\x89PNG\r\n\x1a\n') or j['received']>=j['count']: raise ValueError('Neplatný snímek.')
                if j['format']!='zip': j['proc'].stdin.write(body)
                else: j['zip'].writestr(f'frame_{j["received"]:07d}.png',body)
                j['received']+=1; self.reply({'received':j['received']}); return
            if action=='finish':
                if j['received']!=j['count']: raise ValueError('Export nemá všechny snímky.')
                if j['format']!='zip':
                    j['proc'].stdin.close(); code=j['proc'].wait(); j['log'].seek(0); err=j['log'].read().decode(); j['log'].close()
                    if code: j['cancelled']=True; j['path'].unlink(missing_ok=True); raise ValueError('FFmpeg: '+err[-1500:])
                else: j['zip'].close()
                j['done']=True; self.reply({'url':'/download/'+ident,'name':j['path'].name}); return
            if action=='cancel':
                cancel(j); self.reply({'ok':True}); return
            raise ValueError('Neznámý požadavek.')
        except Exception as e: self.reply({'error':str(e)},400)

def cancel(j):
    j['cancelled']=True
    if 'proc' in j:
        if j['proc'].poll() is None: j['proc'].kill(); j['proc'].wait()
        j['proc'].stdin.close()
        if not j['log'].closed: j['log'].close()
    if 'zip' in j: j['zip'].close()
    j['path'].unlink(missing_ok=True)

if __name__=='__main__':
    server=http.server.ThreadingHTTPServer(('127.0.0.1',8765),Handler)
    url=f'http://127.0.0.1:{server.server_port}'
    print('Telemetry Studio: '+url,flush=True)
    if '--no-browser' not in os.sys.argv: webbrowser.open(url)
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally:
        for j in JOBS.values():
            if not j.get('done') and not j.get('cancelled'): cancel(j)
        server.server_close()
