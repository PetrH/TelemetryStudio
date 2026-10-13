const assert=require('node:assert/strict');
const fs=require('node:fs');
require('../core.js');const T=globalThis.Telemetry;
const p=T.parseJSON(fs.readFileSync(__dirname+'/../demo.json','utf8'));
assert.equal(p.length,241);assert.equal(p[0].speed,6*3.6);assert.equal(p[0].cadence,80);
assert(T.timeline(p,'active').at(-1).t<p.at(-1).t);
const a={stamp:1000,active:null,lat:50,lon:14,speed:0,cadence:0,power:100,hr:120,altitude:200,distance:0,heading:350};
const b={...a,stamp:3000,speed:20,power:200,heading:10,distance:10};
let s=T.sample(T.normalize([a,b]),1);assert.equal(s.speed,10);assert.equal(s.heading,0);assert.equal(s.power,150);
let gap=T.normalize([{...a},{...b,stamp:60000}]);assert.equal(T.sample(gap,20).power,null);assert(T.sample(gap,20).gap);
assert.throws(()=>T.parseJSON('[]'));assert.throws(()=>T.timeline(p.map(x=>({...x,active:null})),'active'));
assert.throws(()=>T.validateLayout({...T.defaults(),scale:9}));
assert.equal(T.normalize([{...a},{...a},{...b}]).length,2);
console.log('PASS: Cadence import, units, zero values, active clock, interpolation, heading wrap, gaps, invalid data, duplicate timestamps.');
// Absolute clock conversion must preserve milliseconds and removed pauses.
assert.equal(T.stampAt(p,0),p[0].stamp);
assert(Math.abs(T.timeAtStamp(p,T.stampAt(p,100.125))-100.125)<.00001);
const active=T.timeline(p,'active');
assert(Math.abs(T.timeAtStamp(active,T.stampAt(active,100.125))-100.125)<.00001);
assert.equal(T.timeAtStamp(p,p[0].stamp-1000),null);
const hill=T.normalize(Array.from({length:9},(_,i)=>({...a,stamp:1000+i*1000,distance:i*5,altitude:200+i*.5})));
assert(Math.abs(hill[4].slope-Math.atan(.1)*180/Math.PI)<1e-9);
const down=T.normalize(Array.from({length:9},(_,i)=>({...a,stamp:1000+i*1000,distance:i*5,altitude:200-i*.5})));
assert(down[4].slope<0);
const noHeight=T.normalize([{...a,altitude:null},{...b,altitude:null}]);assert.equal(noHeight[0].slope,null);
const old=T.defaults();delete old.widgets.slope;assert.equal(T.validateLayout(old).widgets.slope.show,false);
console.log('PASS: wall-clock round trips, pause-free clock, out-of-range input, positive/negative slope, missing elevation, old layout migration.');
const powerPoints=T.normalize([0,1,3,4].map(t=>({...a,stamp:1000+t*1000,power:t*100})));
assert.equal(T.averagePower(powerPoints,3),150); // weighted: irregular 1 s + 2 s intervals
assert.equal(T.averagePower(powerPoints,4),250); // trailing window is [1,4]
assert.equal(T.averagePower(powerPoints,1),50); // shortened history at start
assert.equal(T.averagePower(powerPoints,0),0); // zero is valid
assert.equal(T.displaySample(powerPoints,3,T.defaults()).power,150);
assert.equal(T.displaySample(powerPoints,3,{powerMode:'instant'}).power,300);
assert.equal(T.averagePower([{t:0,stamp:0,power:100},{t:40,stamp:40000,power:200}],40),200);
assert.equal(T.averagePower([{t:0,stamp:0,power:100},{t:1,stamp:40000,power:200}],1),200); // compressed pause
assert.equal(T.averagePower([{t:0,stamp:0,power:100},{t:1,stamp:1000,power:null},{t:2,stamp:2000,power:200}],2),200);
assert.equal(T.averagePower([{t:0,stamp:0,power:null},{t:1,stamp:1000,power:null}],1),null);
const legacy=T.defaults();delete legacy.powerMode;assert.equal(T.validateLayout(legacy).powerMode,'3s');
assert.throws(()=>T.validateLayout({...T.defaults(),powerMode:'bad'}));
console.log('PASS: 3 s power, irregular sampling, zero watts, shortened history, instant mode, missing data, pauses, saved-layout migration.');
require('../route.js');const R=globalThis.RouteOverlay;
const road=[{lat:50,lon:14},{lat:50,lon:14.01}];const geom=R.geometry(road),mid=R.nearest(geom,{lat:50,lon:14.005});
assert(Math.abs(mid.d/geom.length-.5)<1e-9);assert(mid.offset<.001);
assert(R.nearest(geom,{lat:50.01,lon:14.005}).offset>1000);
const separated=R.geometry([{lat:50,lon:14},{lat:50,lon:14.01,breakBefore:true}]);assert.equal(separated.length,0);
assert.equal(R.geometry([{lat:null,lon:null}]),null);
assert.deepEqual(T.bounds('speed',T.defaults()),{x:1550,y:730,w:285,h:145});
const oldMap=T.defaults();delete oldMap.mapMode;delete oldMap.mapZoom;delete oldMap.mapSurface;
assert.equal(T.validateLayout(oldMap).mapMode,'full');assert.throws(()=>T.validateLayout({...T.defaults(),mapMode:'oops'}));
console.log('PASS: route projection, nearest position, off-route distance, disconnected segments, missing GPS, numeric speed bounds, layout migration.');
