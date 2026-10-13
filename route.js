/* Offline route geometry and transparent overlay; shared by preview and export. */
(function(root){
'use strict';
const valid=p=>p&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&Math.abs(p.lat)<=90&&Math.abs(p.lon)<=180;
const cache=new WeakMap();
function geometry(points){
 if(cache.has(points))return cache.get(points);
 const first=points.find(valid);if(!first)return null;
 const cos=Math.cos(first.lat*Math.PI/180),mx=111320*Math.max(.001,cos),my=111320;
 const project=p=>({x:(p.lon-first.lon)*mx,y:-(p.lat-first.lat)*my});
 let nodes=[],length=0,minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity,broken=true;
 for(const p of points){if(!valid(p)){broken=true;continue;}const xy=project(p),prev=nodes.at(-1);
  const cut=broken||p.breakBefore||(prev&&Number.isFinite(p.stamp)&&p.stamp-prev.p.stamp>30000);
  if(prev&&!cut)length+=Math.hypot(xy.x-prev.x,xy.y-prev.y);
  nodes.push({...xy,p,cut:!!cut,d:length});broken=false;
  minX=Math.min(minX,xy.x);maxX=Math.max(maxX,xy.x);minY=Math.min(minY,xy.y);maxY=Math.max(maxY,xy.y);
 }
 const result={nodes,length,project,minX,minY,maxX,maxY};cache.set(points,result);return result;
}
function nearest(g,p){
 if(!g||!valid(p))return null;
 const q=g.project(p);let best=null;
 for(let i=1;i<g.nodes.length;i++){const a=g.nodes[i-1],b=g.nodes[i];if(b.cut)continue;
  const dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy;if(!den)continue;
  const f=Math.max(0,Math.min(1,((q.x-a.x)*dx+(q.y-a.y)*dy)/den)),x=a.x+f*dx,y=a.y+f*dy,offset=Math.hypot(q.x-x,q.y-y);
  if(!best||offset<best.offset)best={x,y,offset,d:a.d+(b.d-a.d)*f,index:i,f};
 }
 return best;
}
function parse(text,name){
 const doc=new DOMParser().parseFromString(text,'application/xml'),all=Array.from(doc.getElementsByTagName('*'));
 if(all.some(e=>e.localName.toLowerCase()==='parsererror'))throw Error('Trasa není platné XML.');
 const gpx=name.toLowerCase().endsWith('.gpx');let nodes=gpx?all.filter(e=>e.localName.toLowerCase()==='trkpt'):all.filter(e=>e.localName.toLowerCase()==='trackpoint');
 if(gpx&&!nodes.length)nodes=all.filter(e=>e.localName.toLowerCase()==='rtept');
 let previousParent=null,broken=true,result=[];
 function number(v){return v==null||v.trim()===''?null:Number(v);}
 for(const el of nodes){const sub=Array.from(el.getElementsByTagName('*')),value=n=>sub.find(x=>x.localName.toLowerCase()===n)?.textContent;
  const lat=number(gpx?el.getAttribute('lat'):value('latitudedegrees')),lon=number(gpx?el.getAttribute('lon'):value('longitudedegrees'));
  const p={lat,lon,breakBefore:broken||el.parentNode!==previousParent};previousParent=el.parentNode;
  if(!valid(p)){broken=true;continue;}result.push(p);broken=false;
 }
 if(result.length<2||!geometry(result)?.length)throw Error('Trasa musí obsahovat alespoň dva propojené GPS body.');return result;
}
function draw(c,activity,t,p,layout,planned){
 const source=planned?.length?planned:activity,g=geometry(source),mode=layout.mapMode||'full',zoom=Number(layout.mapZoom)||1000;
 const W=330,H=210,accent=layout.accent;
 c.save();c.shadowBlur=4;c.shadowColor='rgba(0,0,0,.8)';c.shadowOffsetY=1;
 if(layout.mapSurface==='card'){c.fillStyle='rgba(12,22,20,.76)';c.beginPath();c.roundRect(0,0,W,260,18);c.fill();}
 const label=(s,x,y,size=18)=>{c.font=`600 ${size}px Arial`;c.fillStyle='#fff';c.fillText(s,x,y);};
 if(!g){label('GPS —',20,80,28);c.restore();return;}
 const rider=valid(p)&&!p.gap?g.project(p):null,match=rider?nearest(g,p):null;
 const heading=(p.heading||0)*Math.PI/180,rot=mode==='heading'?-heading:0;
 let cx=(g.minX+g.maxX)/2,cy=(g.minY+g.maxY)/2,scale=Math.min((W-48)/Math.max(1,g.maxX-g.minX),(H-48)/Math.max(1,g.maxY-g.minY));
 if(mode!=='full'&&rider){cx=rider.x;cy=rider.y;scale=(W-48)/zoom;}
 const xy=(v)=>{const x=v.x-cx,y=v.y-cy;return [W/2+(x*Math.cos(rot)-y*Math.sin(rot))*scale,H/2+(x*Math.sin(rot)+y*Math.cos(rot))*scale];};
 c.save();c.beginPath();c.rect(10,10,W-20,H-10);c.clip();
 const path=(past)=>{c.beginPath();let pen=false;for(const n of g.nodes){if(past){const include=planned?.length?match&&match.offset<=100&&n.d<=match.d:n.p.t<=t;if(!include)break;}
  const [x,y]=xy(n);if(!pen||n.cut)c.moveTo(x,y);else c.lineTo(x,y);pen=true;}
  if(past&&rider&&(!planned?.length||match&&match.offset<=100)){const point=planned?.length?match:rider;const [x,y]=xy(point);if(pen)c.lineTo(x,y);}
  c.stroke();};
 c.lineCap='round';c.lineJoin='round';c.lineWidth=5;c.strokeStyle='rgba(255,255,255,.55)';path(false);c.strokeStyle=accent;c.lineWidth=6;path(true);
 // Start/end rings and a highly visible rider marker, at the actual GPS location.
 for(const [n,color]of [[g.nodes[0],accent],[g.nodes.at(-1),'#ffb567']]){let [x,y]=xy(n);c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.fillStyle=color;c.fill();}
 if(rider){let [x,y]=xy(rider);
  if(planned?.length&&match&&match.offset>20){const [tx,ty]=xy(match);c.save();c.setLineDash([4,5]);c.strokeStyle='#ffb567';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.stroke();c.restore();}
  // Clamp off-route marker to the inset map edge; orange means outside this view.
  const outside=x<22||x>W-22||y<22||y>H-16;x=Math.max(22,Math.min(W-22,x));y=Math.max(22,Math.min(H-16,y));
  c.fillStyle=outside?'rgba(255,181,103,.25)':'rgba(255,255,255,.2)';c.beginPath();c.arc(x,y,19,0,Math.PI*2);c.fill();
  c.save();c.translate(x,y);c.rotate(heading+rot);c.fillStyle=outside?'#ffb567':'#fff';c.strokeStyle='#14271e';c.lineWidth=2.5;c.beginPath();c.moveTo(0,-15);c.lineTo(11,11);c.lineTo(0,6);c.lineTo(-11,11);c.closePath();c.fill();c.stroke();c.restore();
 }
 c.restore();
 // North compass rotates with the heading-up view.
 c.save();c.translate(24,25);c.rotate(rot);c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(0,7);c.lineTo(0,-7);c.lineTo(-4,-2);c.moveTo(0,-7);c.lineTo(4,-2);c.stroke();c.restore();label('N',38,31,14);
 let progress=0;
 if(planned?.length&&match)progress=match.d;
 else{for(let i=0;i<g.nodes.length;i++){const n=g.nodes[i];if(n.p.t<=t)progress=n.d;else{const a=g.nodes[i-1];if(a&&!n.cut&&n.p.t>a.p.t)progress=a.d+(n.d-a.d)*(t-a.p.t)/(n.p.t-a.p.t);break;}}}
 const info=!rider?'GPS —':planned?.length&&match?.offset>100?`MIMO TRASU · ${Math.round(match.offset)} m`:`${planned?.length?'≈ ':''}${(progress/1000).toFixed(1)} / ${(g.length/1000).toFixed(1)} km`;
 label(info,15,232,20);c.fillStyle='rgba(255,255,255,.3)';c.fillRect(15,245,W-30,4);c.fillStyle=accent;if(rider&&(!planned?.length||match?.offset<=100))c.fillRect(15,245,(W-30)*Math.max(0,Math.min(1,progress/(g.length||1))),4);
 c.restore();
}
root.RouteOverlay={geometry,nearest,parse,draw};
})(typeof window==='undefined'?globalThis:window);
