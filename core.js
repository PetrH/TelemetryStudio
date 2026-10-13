/* Shared preview/export renderer and telemetry model. No remote data processing. */
(function(root){
'use strict';
const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
const rad=v=>v*Math.PI/180;
function distance(a,b){let x=rad(b.lat-a.lat),y=rad(b.lon-a.lon);return 6371000*2*Math.asin(Math.min(1,Math.sqrt(Math.sin(x/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(y/2)**2)));}
function bearing(a,b){let y=Math.sin(rad(b.lon-a.lon))*Math.cos(rad(b.lat)),x=Math.cos(rad(a.lat))*Math.sin(rad(b.lat))-Math.sin(rad(a.lat))*Math.cos(rad(b.lat))*Math.cos(rad(b.lon-a.lon));return (Math.atan2(y,x)*180/Math.PI+360)%360;}
function normalize(rows){
 let points=rows.filter(p=>Number.isFinite(p.stamp)).sort((a,b)=>a.stamp-b.stamp).filter((p,i,a)=>!i||p.stamp!==a[i-1].stamp);
 if(points.length<2)throw Error('Soubor musí obsahovat alespoň dva body s platným časem.');
 const base=points[0].stamp,act=points[0].active;let accumulated=0;
 points.forEach((p,i)=>{p.t=(p.stamp-base)/1000; if(p.lat===null||p.lon===null||Math.abs(p.lat)>90||Math.abs(p.lon)>180){p.lat=null;p.lon=null;}
 const prev=points[i-1],dt=prev?p.t-prev.t:0; const gps=prev&&p.lat!==null&&prev.lat!==null;const meters=gps?distance(prev,p):0;
 if(prev)accumulated+=meters;
 if(p.distance===null)p.distance=prev?prev.distance+meters:0;
 if(p.speed===null&&prev&&dt>0&&dt<=30){let dd=p.distance-prev.distance;if(dd>=0)p.speed=dd/dt*3.6;}
 if(p.heading===null||p.heading<0)p.heading=gps&&meters>0.2?bearing(prev,p):(prev?.heading??0);
 p.active=Number.isFinite(p.active)&&Number.isFinite(act)?Math.max(0,p.active-act):null;
 });
 deriveSlope(points);
 return points;
}
// Estimate road angle over a centred ~40 m window, never across pauses.
function deriveSlope(points){
 for(let i=0;i<points.length;i++){
  const p=points[i];p.slope=null;if(p.altitude==null)continue;
  let l=i,r=i;
  while(l>0&&p.distance-points[l].distance<20&&p.t-points[l-1].t<=15&&points[l].t-points[l-1].t<=5&&points[l-1].altitude!=null)l--;
  while(r<points.length-1&&points[r].distance-p.distance<20&&points[r+1].t-p.t<=15&&points[r+1].t-points[r].t<=5&&points[r+1].altitude!=null)r++;
  const meters=points[r].distance-points[l].distance;
  if(meters>=10&&points[r].t>points[l].t&&meters/(points[r].t-points[l].t)>.5)p.slope=Math.atan2(points[r].altitude-points[l].altitude,meters)*180/Math.PI;
 }
}
function stampAt(points,t){return interpolateCoordinate(points,t,'t','stamp');}
function timeAtStamp(points,stamp){return interpolateCoordinate(points,stamp,'stamp','t');}
function interpolateCoordinate(points,value,from,to){
 if(!points.length)return null;if(value<points[0][from]-.001||value>points.at(-1)[from]+.001)return null;
 let l=0,r=points.length-1;while(r-l>1){let m=(l+r)>>1;if(points[m][from]<=value)l=m;else r=m;}
 let a=points[l],b=points[r],delta=b[from]-a[from];return delta?a[to]+(b[to]-a[to])*(value-a[from])/delta:a[to];
}
function parseJSON(text){let d=JSON.parse(text);if(!Array.isArray(d))throw Error('Očekáván export Cadence jako pole záznamů.');let rows=d.flat(Infinity).filter(v=>v&&typeof v==='object'&&'timestamp'in v).map(p=>({stamp:finite(p.timestamp),active:finite(p.totalTime),lat:finite(p.latitude??p.gpsLatitude),lon:finite(p.longitude??p.gpsLongitude),speed:finite(p.speed??p.gpsSpeed)===null?null:Number(p.speed??p.gpsSpeed)*3.6,cadence:finite(p.cadence),power:finite(p.power),hr:finite(p.hr),altitude:finite(p.altitude),distance:finite(p.totalDistance),heading:finite(p.gpsHeading)}));return normalize(rows);}
function parseTCX(text){
 const doc=new DOMParser().parseFromString(text,'application/xml');
 const all=Array.from(doc.getElementsByTagName('*'));
 if(all.some(e=>e.localName.toLowerCase()==='parsererror'))throw Error('TCX není platný XML soubor.');
 const records=all.filter(e=>e.localName.toLowerCase()==='trackpoint');
 return normalize(records.map(e=>{
  const nodes=Array.from(e.getElementsByTagName('*'));
  const find=names=>nodes.filter(n=>names.includes(n.localName.toLowerCase()));
  // Prefer valid values rather than the first tag (which can be empty).
  const number=names=>{for(const n of find(names)){const direct=finite(n.textContent.trim());if(direct!==null)return direct;const value=Array.from(n.getElementsByTagName('*')).find(v=>v.localName.toLowerCase()==='value');if(value&&finite(value.textContent)!==null)return finite(value.textContent);}return null;};
  const speed=number(['speed']);
  return {stamp:Date.parse(find(['time'])[0]?.textContent.trim()),active:number(['totaltime']),
   lat:number(['latitudedegrees']),lon:number(['longitudedegrees']),speed:speed===null?null:speed*3.6,
   cadence:number(['cadence','runcadence','bikecadence','cyclingcadence','runningcadence','rpm']),power:number(['watts','power','powerinwatts']),
   hr:number(['heartratebpm','heartrate','hr']),altitude:number(['altitudemeters','altitude']),distance:number(['distancemeters']),heading:number(['heading'])};
 }));
}
function timeline(points,mode){if(mode==='active'&&points.some(p=>p.active===null))throw Error('Tento záznam nemá aktivní čas. Použij skutečný čas.');let list=points.map(p=>({...p,t:mode==='active'?p.active:p.t}));if(list.some((p,i)=>i&&p.t<list[i-1].t))throw Error('Aktivní čas v souboru není vzestupný.');return list.filter((p,i,a)=>!i||p.t!==a[i-1].t);}
function sample(points,t){if(!points.length)return {};if(t<=points[0].t)return points[0];if(t>=points.at(-1).t)return points.at(-1);let l=0,r=points.length-1;while(r-l>1){let m=(l+r)>>1;if(points[m].t<=t)l=m;else r=m;}let a=points[l],b=points[r],gap=b.t-a.t;if(gap>30)return {...a,speed:null,cadence:null,power:null,hr:null,slope:null,gap:true};let f=(t-a.t)/gap,out={...a,t};for(let k of ['speed','cadence','power','hr','altitude','distance','lat','lon','slope'])out[k]=a[k]===null||b[k]===null?null:a[k]+(b[k]-a[k])*f;out.heading=(a.heading+(((b.heading-a.heading+540)%360)-180)*f+360)%360;return out;}
// Time-weighted trailing average of the same linear signal used in preview.
// Use available history at the start; never blend across missing data or pauses.
function averagePower(points,t,seconds=3){
 const now=sample(points,t).power;if(!Number.isFinite(now))return null;
 let lo=0,hi=points.length;while(lo<hi){const m=(lo+hi)>>1;if(points[m].t<t)lo=m+1;else hi=m;}
 let i=Math.min(lo,points.length-1),area=0,duration=0,from=Math.max(points[0].t,t-seconds);
 for(;i>0;i--){const a=points[i-1],b=points[i];if(b.t<=from)break;
  const left=Math.max(from,a.t),right=Math.min(t,b.t);if(right<=left)continue;
  if(!Number.isFinite(a.power)||!Number.isFinite(b.power)||b.t-a.t>30||b.stamp-a.stamp>30000)break;
  const slope=(b.power-a.power)/(b.t-a.t),v0=a.power+slope*(left-a.t),v1=a.power+slope*(right-a.t);
  area+=(v0+v1)/2*(right-left);duration+=right-left;
 }
 return duration>0?area/duration:now;
}
function displaySample(points,t,layout){const p={...sample(points,t)};if(layout.powerMode!=='instant')p.power=averagePower(points,t);return p;}
function applyExportBackground(canvas,format,color){
 if(!['h264','h265'].includes(format))return;
 const c=canvas.getContext('2d');c.save();c.globalCompositeOperation='destination-over';c.fillStyle=/^#[0-9a-f]{6}$/i.test(color)?color:'#0000ff';c.fillRect(0,0,canvas.width,canvas.height);c.restore();
}
const definitions=[['cadence','Kadence','RPM'],['power','Výkon','W'],['hr','Tep','BPM'],['speed','Rychlost','KM/H'],['route','Trasa',''],['altitude','Výška','M'],['distance','Vzdálenost','KM'],['slope','Stoupání / klesání','°']];
function defaults(){return {mapMode:'full',mapZoom:1000,mapSurface:'transparent',powerMode:'3s',style:'race',accent:'#a8ec58',scale:1,widgets:{cadence:{x:1550,y:130,show:true},power:{x:1550,y:330,show:true},hr:{x:1550,y:530,show:true},speed:{x:1550,y:730,show:true},route:{x:85,y:780,show:true},altitude:{x:80,y:120,show:false},distance:{x:80,y:300,show:false},slope:{x:80,y:480,show:false}}};}
function validateLayout(v){if(!v||!['race','icons','minimal'].includes(v.style)||!/^#[0-9a-f]{6}$/i.test(v.accent)||!(v.scale>=.6&&v.scale<=1.5))throw Error('Neplatné rozložení.');if(v.mapMode===undefined)v.mapMode='full';if(v.mapZoom===undefined)v.mapZoom=1000;if(v.mapSurface===undefined)v.mapSurface='transparent';if(!['full','follow','heading'].includes(v.mapMode)||![250,500,1000,2000].includes(Number(v.mapZoom))||!['transparent','card'].includes(v.mapSurface))throw Error('Neplatné nastavení mapy.');if(v.powerMode===undefined)v.powerMode='3s';if(!['3s','instant'].includes(v.powerMode))throw Error('Neplatný režim výkonu.');if(v.widgets&&!v.widgets.slope)v.widgets.slope=defaults().widgets.slope;for(let [k]of definitions){let w=v.widgets?.[k];if(!w||!Number.isFinite(w.x)||!Number.isFinite(w.y)||typeof w.show!=='boolean'||w.x<0||w.x>1920||w.y<0||w.y>1080)throw Error('Neplatná pozice ukazatele.');}return v;}
function bounds(k,layout){let w=layout.widgets[k],size=k==='route'?[330,260]:layout.style==='icons'?[370,145]:[285,145];return {x:w.x,y:w.y,w:size[0]*layout.scale,h:size[1]*layout.scale};}
function icon(c,k,x,y,size,color){c.save();c.translate(x,y);c.scale(size/32,size/32);c.strokeStyle=color;c.fillStyle=color;c.lineWidth=2.2;c.lineCap='round';c.lineJoin='round';c.beginPath();if(k==='power'){c.moveTo(19,1);c.lineTo(6,18);c.lineTo(15,18);c.lineTo(12,31);c.lineTo(27,12);c.lineTo(18,12);c.closePath();c.fill();}else if(k==='hr'){c.moveTo(16,29);c.bezierCurveTo(-8,13,6,-3,16,8);c.bezierCurveTo(26,-3,40,13,16,29);c.stroke();}else if(k==='cadence'){
 // Chainring teeth, lightening holes, opposing crank arms and pedals.
 c.save();c.translate(16,16);c.lineWidth=1.3;
 for(let i=0;i<16;i++){let a=i*Math.PI/8;c.moveTo(Math.cos(a)*10.5,Math.sin(a)*10.5);c.lineTo(Math.cos(a)*12.5,Math.sin(a)*12.5);}c.stroke();
 c.beginPath();c.arc(0,0,10,0,Math.PI*2);c.arc(0,0,2.5,0,Math.PI*2);c.stroke();
 for(let i=0;i<5;i++){let a=i*Math.PI*2/5;c.beginPath();c.arc(Math.cos(a)*6.4,Math.sin(a)*6.4,1.6,0,Math.PI*2);c.stroke();}
 c.lineWidth=3;c.beginPath();c.moveTo(-9,10);c.lineTo(0,0);c.lineTo(9,-10);c.stroke();c.lineWidth=2;
 c.beginPath();c.moveTo(-13,10);c.lineTo(-6,10);c.moveTo(6,-10);c.lineTo(13,-10);c.stroke();c.restore();
 }else if(k==='slope'){c.moveTo(2,27);c.lineTo(29,27);c.moveTo(2,27);c.lineTo(29,7);c.moveTo(21,7);c.lineTo(29,7);c.lineTo(29,15);c.moveTo(12,27);c.arc(2,27,10,0,-.6,true);c.stroke();
 }else if(k==='speed'){
 // Bicycle with motion strokes, matching the outlined sensor icons.
 c.lineWidth=1.7;c.moveTo(0,5);c.lineTo(9,5);c.moveTo(0,10);c.lineTo(5,10);
 c.moveTo(11,23);c.arc(6,23,5,0,Math.PI*2);c.moveTo(32,23);c.arc(27,23,5,0,Math.PI*2);
 c.moveTo(6,23);c.lineTo(12,13);c.lineTo(18,23);c.lineTo(6,23);c.moveTo(12,13);c.lineTo(23,13);c.lineTo(18,23);c.moveTo(27,23);c.lineTo(22,8);c.lineTo(26,8);
 c.moveTo(12,13);c.lineTo(11,9);c.moveTo(8,9);c.lineTo(14,9);c.stroke();
 }else if(k==='altitude'){c.moveTo(1,28);c.lineTo(14,4);c.lineTo(31,28);c.closePath();c.moveTo(9,14);c.lineTo(15,17);c.lineTo(19,13);c.stroke();}else{c.moveTo(4,29);c.lineTo(12,3);c.moveTo(28,29);c.lineTo(20,3);c.moveTo(16,6);c.lineTo(16,12);c.moveTo(16,18);c.lineTo(16,25);c.stroke();}c.restore();}
function render(canvas,points,t,layout,selected=null,planned=null){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.save();c.scale(canvas.width/1920,canvas.height/1080);let p=displaySample(points,t,layout);const white='#ffffff';let text=(s,x,y,size=70,bold=true)=>{c.font=`${layout.style==='race'&&bold?'italic ':''}${bold?800:400} ${size}px Arial, sans-serif`;c.fillStyle=white;c.fillText(s,x,y);};

 for(let [k,label,unit]of definitions){let w=layout.widgets[k];if(!w.show)continue;c.save();c.translate(w.x,w.y);c.scale(layout.scale,layout.scale);c.shadowColor='rgba(0,0,0,.75)';c.shadowBlur=5;c.shadowOffsetY=2;
 if(k==='route'){RouteOverlay.draw(c,points,t,p,layout,planned);
 }else{let val=p[k];if(k==='distance'&&val!=null)val=(val/1000).toFixed(1);else if(k==='slope'&&val!=null)val=(val>0?'+':'')+val.toFixed(1);else if(val!=null)val=Math.round(val);
 const icons=layout.style==='icons',offset=icons?90:0;
 if(icons)icon(c,k,0,49,68,layout.accent);else text(k==='power'&&layout.powerMode!=='instant'?label+' · 3 s':label,0,26,layout.style==='minimal'?24:28,false);
 const content=val==null?'—':String(val);text(content,offset,108,layout.style==='minimal'?62:76);let width=c.measureText(content).width;text(unit,offset+width+12,108,27);}

 c.restore();if(selected===k){let b=bounds(k,layout);c.save();c.shadowBlur=0;c.strokeStyle=layout.accent;c.lineWidth=2;c.setLineDash([8,6]);c.strokeRect(b.x-10,b.y-10,b.w+20,b.h+20);c.restore();}}
 c.restore();return p;
}
root.Telemetry={parseJSON,parseTCX,normalize,stampAt,timeAtStamp,timeline,sample,averagePower,displaySample,applyExportBackground,definitions,defaults,validateLayout,bounds,render,distance,bearing};
})(typeof window==='undefined'?globalThis:window);
