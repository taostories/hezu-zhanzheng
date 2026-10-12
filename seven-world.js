'use strict';
const TILE=32, COLS=36, ROWS=22, WW=COLS*TILE, WH=ROWS*TILE;
const walls=new Set();
for(let x=0;x<COLS;x++){walls.add(x+',0');walls.add(x+',21');}
for(let y=0;y<ROWS;y++){walls.add('0,'+y);walls.add('35,'+y);}
for(let x=1;x<35;x++)if(![5,6,13,14,22,23,30,31].includes(x))walls.add(x+',8');
for(let y=1;y<8;y++)for(const x of [9,18,27])walls.add(x+','+y);
const FURNITURE=[
 {type:'bed',x:2,y:2,w:3,h:3,color:'#a9b49b'},{type:'desk',x:6,y:2,w:2,h:2,color:'#bda17b'},{type:'shelf',x:2,y:6,w:2,h:1},
 {type:'bed',x:11,y:2,w:3,h:3,color:'#91aeb0'},{type:'desk',x:15,y:2,w:2,h:2,color:'#bda17b'},{type:'shelf',x:11,y:6,w:2,h:1},
 {type:'bed',x:20,y:2,w:3,h:3,color:'#d6a17f'},{type:'desk',x:24,y:2,w:2,h:2,color:'#bda17b'},{type:'shelf',x:20,y:6,w:2,h:1},
 {type:'bed',x:29,y:2,w:3,h:3,color:'#c0b38d'},{type:'desk',x:33,y:2,w:1,h:2,color:'#bda17b'},
 {type:'sofa',x:11,y:12,w:5,h:2,color:'#8caa92',id:'sofa'},
 {type:'table',x:12,y:16,w:4,h:2,color:'#cfa67a'},
 {type:'kitchen',x:29,y:10,w:5,h:2,color:'#b7c4ad'},
 {type:'fridge',x:33,y:12,w:1,h:2,color:'#d3dac8'},
 {type:'dining',x:26,y:17,w:4,h:2,color:'#cca579'},
 {type:'shoe',x:2,y:17,w:3,h:1,color:'#ba916f'},
 {type:'plant',x:2,y:10,w:1,h:1},{type:'plant',x:17,y:12,w:1,h:1},{type:'plant',x:32,y:19,w:1,h:1},
 {type:'board',x:20,y:9,w:2,h:1,id:'board'},
 {type:'laundry',x:7,y:18,w:2,h:2,color:'#d2d4bd'}
];
for(let y=17;y<=20;y++){if(y!==19)walls.add('20,'+y);walls.add('24,'+y);}for(let x=20;x<=24;x++)walls.add(x+',17');
const solid=new Set(walls);for(const key of ['22,18','23,18','23,19','23,20','10,19','11,19'])solid.add(key);for(const f of FURNITURE)for(let x=f.x;x<f.x+f.w;x++)for(let y=f.y;y<f.y+f.h;y++)solid.add(x+','+y);
function walkable(x,y){return x>=1&&y>=1&&x<35&&y<21&&!solid.has(x+','+y);}
function canStand(x,y){const r=9;return [[-r,-r],[r,-r],[-r,r],[r,r]].every(([a,b])=>walkable(Math.floor((x+a)/32),Math.floor((y+b)/32)));}
function nearestTile(x,y){let tx=Math.max(1,Math.min(34,Math.floor(x/32))),ty=Math.max(1,Math.min(20,Math.floor(y/32)));if(walkable(tx,ty))return [tx,ty];for(let r=1;r<12;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(Math.abs(dx)+Math.abs(dy)===r&&walkable(tx+dx,ty+dy))return [tx+dx,ty+dy];return null;}
function findPath(from,to){const a=nearestTile(from.x,from.y),b=nearestTile(to.x,to.y);if(!a||!b)return [];const start=a.join(','),goal=b.join(','),q=[a],prev=new Map([[start,null]]);let head=0;while(head<q.length){const cell=q[head++],key=cell.join(',');if(key===goal)break;for(const [dx,dy]of[[0,1],[1,0],[0,-1],[-1,0]]){const nx=cell[0]+dx,ny=cell[1]+dy,k=nx+','+ny;if(walkable(nx,ny)&&!prev.has(k)){prev.set(k,key);q.push([nx,ny]);}}}if(!prev.has(goal))return [];const result=[];for(let k=goal;k!==start;k=prev.get(k)){const [x,y]=k.split(',').map(Number);result.unshift({x:x*32+16,y:y*32+16});}return result;}
function moveEntity(a,dx,dy){if(canStand(a.x+dx,a.y))a.x+=dx;if(canStand(a.x,a.y+dy))a.y+=dy;if(Math.abs(dx)+Math.abs(dy)>.05){a.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');a.step=(a.step||0)+Math.hypot(dx,dy)/12;}else a.step=0;}
function followPath(a,dt,speed=95){if(!a.path?.length){a.step=0;return;}const p=a.path[0],d=Math.hypot(p.x-a.x,p.y-a.y);if(d<3){a.x=p.x;a.y=p.y;a.path.shift();return;}const n=Math.min(d,speed*dt);moveEntity(a,(p.x-a.x)/d*n,(p.y-a.y)/d*n);}
const ROUTES={lin:[[5,5],[7,6],[6,10],[8,14]],su:[[14,5],[16,6],[16,10],[18,15]],chen:[[24,5],[25,6],[23,11],[22,17]],xu:[[15,14],[17,14],[15,15],[14,14]]};
const BEDSPOTS={lin:{x:176,y:144},su:{x:464,y:144},chen:{x:752,y:144},xu:{x:432,y:464}};
const SPAWNS={lin:[7,10],su:[17,16],chen:[27,14],xu:[15,14]};
function createNPCs(saved){return Object.keys(SPAWNS).map((id,i)=>{const p=saved?.find(n=>n.id===id);return {id,x:p?.x??SPAWNS[id][0]*32+16,y:p?.y??SPAWNS[id][1]*32+16,dir:'down',step:0,path:[],wait:1+i,route:0};});}
const canvas=document.getElementById('world'),ctx=canvas.getContext('2d');
let vw=innerWidth,vh=innerHeight,cam={x:0,y:0,scale:1},clock=0,staticArt=document.createElement('canvas');staticArt.width=WW;staticArt.height=WH;
function round(g,x,y,w,h,c,r=4,stroke='#685f4c'){g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=1.5;g.stroke();}}
function ellipse(g,x,y,rx,ry,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();}
function line(g,x,y,xx,yy,c,w=2){g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(xx,yy);g.stroke();}
function text(g,t,x,y,size=12,color='#6b725e',align='left'){g.font=size+'px "Microsoft YaHei",sans-serif';g.textAlign=align;g.fillStyle=color;g.fillText(t,x,y);}
function plant(g,x,y){ellipse(g,x+16,y+31,18,7,'#3c543128');round(g,x+5,y+12,23,24,'#c78e6c',5);ellipse(g,x+16,y+13,13,7,'#877556');for(const [dx,dy,r] of [[-8,-10,-.7],[8,-13,.6],[-13,0,-1],[13,-1,1],[0,-20,0]]){g.save();g.translate(x+16+dx,y+10+dy);g.rotate(r);ellipse(g,0,0,7,15,dy<-10?'#769c70':'#91ac7f');line(g,0,10,0,-8,'#587f5b',1.2);g.restore();}}
function fixture(g,f){let x=f.x*32,y=f.y*32,w=f.w*32,h=f.h*32;round(g,x+4,y+7,w,h,'#644a3a25',5,null);
 if(f.type==='bed'){round(g,x,y,w,h,'#947759',6);round(g,x+5,y+7,w-10,h-12,'#f4ead4',5);round(g,x+5,y+33,w-10,h-38,f.color,4);round(g,x+15,y+10,w-30,20,'#fff5df',5);line(g,x+10,y+47,x+w-10,y+47,'#f6eed25c');for(let a=18;a<w;a+=15)line(g,x+a,y+38,x+a,y+h-10,'#faf6db30',1);}
 else if(f.type==='desk'){round(g,x,y,w,h,f.color,4);round(g,x+9,y+10,Math.min(40,w-14),25,'#f0e6c7',2);line(g,x+13,y+17,x+Math.min(40,w-8),y+17,'#a5ac91',2);round(g,x+w-15,y+h-20,9,12,'#819e97',2);round(g,x+8,y+h+3,24,12,'#9aab8b',4);}
 else if(f.type==='shelf'){round(g,x,y,w,h,'#a38261',3);for(let a=5;a<w-6;a+=10)round(g,x+a,y+5,7,19,['#a6b39a','#bf8370','#d2ba82','#829d9c'][Math.floor(a/10)%4],1);}
 else if(f.type==='sofa'){round(g,x,y,w,h,'#597865',9);round(g,x+6,y+5,w-12,19,'#8eaa92',6);for(let a=0;a<3;a++)round(g,x+12+a*45,y+26,44,29,'#a8b99a',5);round(g,x,y+14,12,h-12,'#77947c',5);round(g,x+w-12,y+14,12,h-12,'#77947c',5);round(g,x+23,y+20,27,27,'#ddbd80',4);line(g,x+29,y+24,x+29,y+43,'#aa9364',1);round(g,x+109,y+22,25,26,'#ca917c',4);}
 else if(f.type==='table'||f.type==='dining'){round(g,x,y,w,h,f.color,20);line(g,x+18,y+13,x+w-18,y+13,'#b98f692e',2);line(g,x+15,y+h-12,x+w-13,y+h-12,'#af876b44',2);if(f.type==='table'){round(g,x+20,y+17,31,27,'#f1e6bb',2);for(let i=0;i<3;i++)line(g,x+24,y+23+i*6,x+45,y+23+i*6,'#a3a07c',1);ellipse(g,x+w-30,y+33,13,8,'#789295');ellipse(g,x+w-30,y+29,10,7,'#eadcbf');ellipse(g,x+w-30,y+27,7,4,'#7c6952');}else{for(let i=0;i<2;i++){ellipse(g,x+32+i*64,y+32,16,14,'#f3ecd6');ellipse(g,x+32+i*64,y+32,10,8,'#d9ac75');}round(g,x-19,y+12,16,32,'#aab599',4);round(g,x+w+3,y+12,16,32,'#aab599',4);}}
 else if(f.type==='kitchen'){round(g,x,y,w,h,'#9cae94',4);round(g,x+3,y+3,w-6,h-10,'#e1dbc5',3);round(g,x+14,y+12,48,35,'#9eb5b0',4);round(g,x+21,y+17,33,22,'#c4d5c7',4);line(g,x+40,y+13,x+40,y+3,'#6c8177',5);round(g,x+94,y+10,46,37,'#536864',3);for(let i=0;i<2;i++){ellipse(g,x+105+i*24,y+28,8,8,'#354744');ellipse(g,x+105+i*24,y+28,4,4,'#6b8580');}}
 else if(f.type==='fridge'){round(g,x,y,w,h,'#d5ddcd',4);line(g,x+3,y+23,x+w-3,y+23,'#a0b39f');line(g,x+7,y+31,x+7,y+44,'#81998b',3);}
 else if(f.type==='shoe'){round(g,x,y,w,h,'#ab8967',3);for(let a=12;a<w-10;a+=26){round(g,x+a,y+6,10,19,'#788e86',4);round(g,x+a+11,y+6,10,19,'#dfbb8c',4);}}
 else if(f.type==='board'){round(g,x,y,w,h,'#8e7256',3);round(g,x+4,y+4,w-8,h-8,'#cabb91',1);for(let i=0;i<3;i++){g.save();g.translate(x+9+i*17,y+8);g.rotate((i-1)*.07);round(g,0,0,14,18,['#edce8c','#a9c5ab','#dca491'][i],1,null);line(g,3,7,10,7,'#9b8665',1);g.restore();}}
 else if(f.type==='laundry'){round(g,x,y,w,h,'#c6cfbc',4);ellipse(g,x+w/2,y+h/2+4,23,23,'#738c88');ellipse(g,x+w/2,y+h/2+4,16,16,'#a6c0b6');round(g,x+6,y+5,20,8,'#f3efd6',2);}
 else if(f.type==='plant')plant(g,x,y);
}
function buildArt(){const g=staticArt.getContext('2d');g.fillStyle='#d3b38c';g.fillRect(0,0,WW,WH);for(let y=0;y<WH;y+=16)for(let x=-(y%32?48:0);x<WW;x+=96){g.fillStyle=['#dec29b','#d9b891','#d4b28a','#dfc09b'][(Math.floor(x/96)+Math.floor(y/16)+40)%4];g.fillRect(x+1,y+1,94,14);line(g,x+12,y+8,x+72,y+8,'#b9967420',1);}
 // Small rugs and shared-area woven rug.
 for(const [x,c]of[[3,'#c2c9a8'],[12,'#b2c7c0'],[21,'#d5b29e'],[30,'#cfbf95']]){round(g,x*32,5.1*32,3.5*32,2*32,c,8,'#9c9f7c');for(let k=0;k<7;k++)line(g,x*32+8,5.1*32+8+k*8,x*32+104,5.1*32+8+k*8,'#faf4dd25',2);}
 round(g,10*32,11.3*32,8*32,8.2*32,'#bdc5a5',16,'#9eaa8c');round(g,10*32+11,11.3*32+11,8*32-22,8.2*32-22,'#cbd0b3',12,'#a8b693');
 for(let i=0;i<25;i++)line(g,10*32+18,11.3*32+18+i*9,18*32-18,11.3*32+18+i*9,'#efe5c830',1);
 round(g,1.2*32,12*32,4.8*32,3.3*32,'#adba9a',8,'#8c9d81');for(let i=0;i<10;i++)line(g,44,391+i*8,184,391+i*8,'#d7d8b050',2);
 round(g,28*32,9.6*32,6.7*32,5.2*32,'#dce0c8',4,null);for(let y=310;y<469;y+=24)for(let x=900;x<1114;x+=24)round(g,x,y,22,22,'#e5e6d1',0,'#c7cdb7');
 for(const key of walls){const [x,y]=key.split(',').map(Number);round(g,x*32,y*32,32,32,'#8b8f78',1,null);g.fillStyle='#f0dac0';g.fillRect(x*32,y*32,32,22);g.fillStyle='#c4ad8d';g.fillRect(x*32,y*32+22,32,5);}
 // Open door thresholds, windows and room names.
 for(const x of [5,13,22,30]){round(g,x*32,8*32+8,64,17,'#d3b18c',0,null);line(g,x*32+3,8*32+27,x*32+58,8*32+27,'#af8d65',2);}
 for(const x of [3,12,21,30]){round(g,x*32,4,3*32,18,'#8aa9a6',2,'#688a88');line(g,x*32+48,5,x*32+48,21,'#ede5cc',3);g.fillStyle='#fff3c625';g.beginPath();g.moveTo(x*32,33);g.lineTo(x*32+96,33);g.lineTo(x*32+160,226);g.lineTo(x*32+70,226);g.fill();}
 round(g,0,12.4*32,23,2.4*32,'#6d8d7d',3,'#415f50');line(g,16,423,16,440,'#e6c28c',3);
 for(const f of FURNITURE)fixture(g,f);
 // Deterministic paper flecks; retained in a cached bitmap.
 for(let i=0;i<4500;i++){const x=(i*131.731)%WW,y=(i*79.617)%WH;g.fillStyle=i%2?'#564c3510':'#fff4d820';g.fillRect(x,y,1.1,1.1);}
}
function drawPerson(g,a,scale=1){
 const id=a.id,p=PEOPLE[id],back=a.dir==='up',side=a.dir==='left'?-1:a.dir==='right'?1:0;
 const moving=(a.step||0)>0,walk=moving?Math.sin(a.step)*2.5:0,bob=moving?Math.sin(a.step*2)*.55:0;
 g.save();g.translate(a.x,a.y);g.scale(scale,scale);
 ellipse(g,0,1,12,4,'#273d3326');
 function shape(path,fill,stroke='#5e6256',width=1){g.beginPath();path();g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}}
 function shade(y1,y2,light,dark){const v=g.createLinearGradient(-10,y1,12,y2);v.addColorStop(0,light);v.addColorStop(1,dark);return v;}
 const trousers=id==='player'?'#879184':id==='chen'?'#637c78':'#5e6b69';
 for(const [x,w]of[[-6,walk],[5,-walk]]){
  shape(()=>{g.moveTo(x-4,-16);g.lineTo(x+4,-16);g.quadraticCurveTo(x+5,-7+w,x+3,-3+w);g.lineTo(x-4,-3+w);g.closePath();},shade(-16,0,trousers,'#4e5e57'));
  shape(()=>{g.moveTo(x-4,-4+w);g.quadraticCurveTo(x+4,-6+w,x+6,-1+w);g.quadraticCurveTo(x+6,2+w,x-4,1+w);g.closePath();},id==='player'?'#f0e6d1':'#d1c7b1','#7c8173',.8);
 }
 g.translate(0,bob);
 if(id==='lin'){shape(()=>{g.moveTo(6,-43);g.bezierCurveTo(23,-43,17,-20,12,-22);g.bezierCurveTo(8,-28,7,-32,6,-43);},shade(-46,-23,'#455154','#283b40'));line(g,12,-39,14,-29,'#65706e',.7);}
 const clothing={player:['#efe4cf','#b8b6a0'],lin:['#65767a','#3e5159'],su:['#e0e2dc','#a2b4b4'],chen:['#e9bb92','#c48c71'],xu:['#aec0ab','#768e7f']}[id];
 const cloth=shade(-32,-9,...clothing);
 // Curved shoulders and sleeves give each outfit a softer silhouette.
 const shoulder=id==='su'?14:id==='lin'?13:11;
 for(const sign of [-1,1]){
  shape(()=>{g.moveTo(sign*8,-31);g.quadraticCurveTo(sign*(shoulder+4),-30,sign*(shoulder+3),-18+sign*walk*.35);g.lineTo(sign*(shoulder-2),-15+sign*walk*.35);g.quadraticCurveTo(sign*9,-22,sign*7,-25);g.closePath();},cloth);
  ellipse(g,sign*(shoulder+.2),-14+sign*walk*.35,2.4,3.2,'#e3c4a6');
 }
 shape(()=>{g.moveTo(-7,-34);g.quadraticCurveTo(-shoulder,-32,-11,-23);g.lineTo(-11,-12);g.quadraticCurveTo(0,-8,11,-12);g.lineTo(11,-23);g.quadraticCurveTo(shoulder,-32,7,-34);g.closePath();},cloth);
 line(g,-8,-22,-7,-14,'#ffffff35',1);line(g,8,-22,7,-14,'#596d5c30',1);
 if(id==='player'){
  shape(()=>{g.moveTo(-6,-33);g.quadraticCurveTo(0,-27,6,-33);g.lineTo(4,-25);g.quadraticCurveTo(0,-23,-4,-25);g.closePath();},'#f9f0dd','#b3af98',.7);
  line(g,0,-24,0,-11,'#999e873b',.8);
  for(let i=0;i<3;i++)ellipse(g,1,-21+i*4,.7,.7,'#978f75');
  shape(()=>{g.moveTo(-8,-20);g.lineTo(-3,-20);g.lineTo(-3,-15);g.quadraticCurveTo(-6,-13,-8,-15);g.closePath();},'#d9d6bd','#aaae98',.6);
 }else if(id==='lin'||id==='su'){
  shape(()=>{g.moveTo(-9,-32);g.quadraticCurveTo(0,-38,9,-32);g.quadraticCurveTo(6,-24,0,-25);g.quadraticCurveTo(-6,-24,-9,-32);},cloth,'#7c908746',1);
  if(!back){line(g,-4,-26,-5,-19,'#e7e6d7',.8);line(g,4,-26,5,-19,'#e7e6d7',.8);line(g,-6,-15,6,-15,'#627b7240',.8);}
 }else if(id==='xu'){
  shape(()=>{g.moveTo(-7,-32);g.lineTo(0,-28);g.lineTo(7,-32);g.lineTo(4,-23);g.lineTo(0,-27);g.lineTo(-4,-23);g.closePath();},'#d2d4ba','#8d9f8d',.8);
  line(g,0,-26,0,-12,'#657f7159',.8);for(let i=0;i<3;i++)ellipse(g,1,-22+i*4,.65,.65,'#677c6b');
 }else if(id==='chen'){line(g,-8,-24,8,-24,'#f5d3a3',1);line(g,-8,-16,8,-16,'#f5d3a380',1);}
 const hairGrad=shade(-57,-32,id==='player'?'#817465':id==='lin'?'#526064':id==='su'?'#e1e5dc':id==='chen'?'#cb9b7c':'#89715c',id==='player'?'#544f49':p.hair);
 // Distinct hair outlines instead of rectangular caps.
 const outline=()=>{
  if(id==='xu'){g.moveTo(-12,-36);g.bezierCurveTo(-18,-41,-17,-49,-12,-50);g.bezierCurveTo(-16,-55,-8,-59,-4,-56);g.bezierCurveTo(1,-62,7,-58,9,-54);g.bezierCurveTo(16,-56,19,-47,14,-44);g.quadraticCurveTo(17,-37,11,-32);g.lineTo(-9,-32);}
  else if(id==='su'){g.moveTo(-14,-35);g.lineTo(-15,-47);g.quadraticCurveTo(-9,-58,3,-56);g.quadraticCurveTo(14,-57,15,-45);g.lineTo(13,-32);g.lineTo(8,-35);g.lineTo(-9,-33);}
  else if(id==='chen'){g.moveTo(-13,-35);g.quadraticCurveTo(-18,-47,-10,-53);g.lineTo(-13,-57);g.quadraticCurveTo(-2,-55,3,-57);g.bezierCurveTo(14,-57,17,-48,13,-35);g.lineTo(6,-32);g.lineTo(-8,-32);}
  else{g.moveTo(-13,-35);g.bezierCurveTo(-18,-43,-13,-56,-3,-56);g.bezierCurveTo(9,-60,17,-49,14,-38);g.quadraticCurveTo(11,-29,6,-32);g.lineTo(-9,-32);}
  g.closePath();
 };
 shape(outline,hairGrad,'#555e52',.9);
 if(!back){
  ellipse(g,-11,-38,2.7,4,'#e0bb9c');ellipse(g,11,-38,2.7,4,'#e0bb9c');
  shape(()=>{g.moveTo(-10,-46);g.bezierCurveTo(-5,-52,7,-51,10,-45);g.lineTo(10,-38);g.quadraticCurveTo(10,-30,0,-28);g.quadraticCurveTo(-10,-30,-10,-38);g.closePath();},shade(-49,-28,'#f5dfc0','#dfb79b'),'#a68e77',.65);
  shape(()=>{g.moveTo(-13,-43);g.quadraticCurveTo(-13,-55,1,-55);g.quadraticCurveTo(14,-55,13,-41);g.quadraticCurveTo(7,-43,7,-49);g.quadraticCurveTo(1,-40,-7,-41);g.lineTo(-10,-37);g.closePath();},hairGrad,null);
  const face=side*2;line(g,-7+face,-38,-3+face,-38,'#6b6355',.8);line(g,3+face,-38,7+face,-38,'#6b6355',.8);
  ellipse(g,-4.5+face,-35.7,1.1,1.4,'#3e4943');ellipse(g,4.5+face,-35.7,1.1,1.4,'#3e4943');
  ellipse(g,-4.8+face,-36.2,.35,.4,'#fff7e5');ellipse(g,4.2+face,-36.2,.35,.4,'#fff7e5');
  g.strokeStyle='#aa7c66';g.lineWidth=.75;g.beginPath();g.moveTo(-2+face,-31.6);g.quadraticCurveTo(face,-30.3,2+face,-31.6);g.stroke();
  if(id==='lin'){round(g,-9+face,-39,8,7,'#ffffff0a',2,'#394b4c');round(g,1+face,-39,8,7,'#ffffff0a',2,'#394b4c');line(g,-1+face,-36,1+face,-36,'#394b4c',.8);}
 }
 // Fine strands, highlights, collar and props distinguish all five at gameplay scale.
 for(let i=0;i<4;i++){const x=-9+i*5;g.beginPath();g.moveTo(x,-52);g.quadraticCurveTo(x-3,-48,x-2,-44);g.strokeStyle=id==='su'?'#9faeac70':'#eadcc130';g.lineWidth=.7;g.stroke();}
 if(id==='chen'){g.beginPath();g.moveTo(5,-54);g.bezierCurveTo(9,-50,9,-46,7,-43);g.strokeStyle='#efbba4';g.lineWidth=3;g.stroke();line(g,-8,-28,8,-13,'#6b695a',1.6);round(g,3,-17,10,8,'#536e6a',2,'#415953');ellipse(g,8,-13,2.7,2.7,'#a9c0b7');ellipse(g,8,-13,1.4,1.4,'#526f75');}
 if(id==='su'){round(g,-15,-42,4,11,'#687f85',2,'#4e686d');round(g,11,-42,4,11,'#687f85',2,'#4e686d');line(g,-13,-47,-11,-51,'#9aabaa',1.6);line(g,-12,-32,-10,-26,'#849c96',.8);}
 if(id==='xu'){line(g,-8,-30,10,-12,'#e2d0ac',2.5);shape(()=>{g.moveTo(6,-15);g.quadraticCurveTo(12,-17,16,-14);g.lineTo(15,-5);g.quadraticCurveTo(10,-3,6,-6);g.closePath();},shade(-15,-4,'#e7d9ba','#bead8a'),'#928a70',.8);line(g,9,-11,13,-11,'#b5a383',.8);}
 g.restore();
}
function marker(g,x,y,label,color='#e4ae68'){const b=typeof settings!=='undefined'&&settings.reduced?0:Math.sin(clock*3)*2;round(g,x-11,y-77+b,22,22,color,7,'#785f42');text(g,label,x,y-61+b,15,'#fff9e4','center');}
function resizeWorld(){vw=innerWidth;vh=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(vw*d);canvas.height=Math.round(vh*d);ctx.setTransform(d,0,0,d,0,0);}
function renderWorld(dt){clock+=dt;ctx.clearRect(0,0,vw,vh);ctx.fillStyle='#293f38';ctx.fillRect(0,0,vw,vh);const playing=typeof mode!=='undefined'&&mode==='play';const compact=vh<540;const scale=playing&&compact?Math.max(.72,vh/430):Math.min((vw-24)/WW,(vh-70)/WH);cam.scale=scale;const focus=playing?state.player:{x:WW/2,y:WH/2};const targetX=WW*scale<vw?(vw-WW*scale)/2:Math.min(18,Math.max(vw-WW*scale-18,vw/2-focus.x*scale));const targetY=WH*scale<vh-60?60+(vh-60-WH*scale)/2:Math.min(64,Math.max(vh-WH*scale-25,vh*.54-focus.y*scale));const lerp=typeof settings!=='undefined'&&settings.reduced?1:Math.min(1,dt*9);cam.x+=(targetX-cam.x)*lerp;cam.y+=(targetY-cam.y)*lerp;ctx.save();ctx.translate(cam.x,cam.y);ctx.scale(scale,scale);ctx.drawImage(staticArt,0,0);

 drawDayOneProps(ctx);drawStoryProps(ctx);
 if(destination){ctx.strokeStyle='#fff3cb';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(destination.x,destination.y,10,5,0,0,Math.PI*2);ctx.stroke();}
 const actors=[...npcs,{...state.player,id:'player'}].sort((a,b)=>a.y-b.y);
 for(const a of actors){if(a.asleep)drawSleeper(ctx,a);else drawPerson(ctx,a);if(a.id==='player'){ctx.fillStyle='#fff2cc';ctx.beginPath();ctx.moveTo(a.x-4,a.y-62);ctx.lineTo(a.x+4,a.y-62);ctx.lineTo(a.x,a.y-57);ctx.fill();}}
 if(playing&&!state.dialogue){const t=nearestTarget();if(t){const x=t.hitX,y=t.hitY;ctx.strokeStyle='#fff7d7';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y+12,21,8,0,0,Math.PI*2);ctx.stroke();}}
 drawNight(ctx);ctx.restore();}
function drawDayOneProps(g){
 // A signed paper on the existing noticeboard is the first visible destination.
 if(state.day!==5){round(g,647,293,34,22,'#fff3cf',1,'#baa982');
 for(let i=0;i<4;i++)line(g,652,298+i*4,676,298+i*4,'#8c947b',1);
 round(g,660,290,8,5,'#b77860',1,null);
 // A visible paper on the real fridge, not an invisible target beside the sink.
 round(g,1063,399,19,27,'#fff4ce',1,'#b4a386');round(g,1068,398,9,4,'#bf7963',1,null);
 for(let i=0;i<4;i++)line(g,1067,407+i*4,1079,407+i*4,'#98a184',.8);
 }else{round(g,660,290,8,5,'#b77860',1,null);round(g,1068,398,9,4,'#bf7963',1,null);}
 // Xu's backpack and an exposed document; the document disappears once put away.
 round(g,456,398,26,29,'#a69472',5,'#70694f');round(g,462,414,14,10,'#c6b592',3);line(g,462,400,476,400,'#6f755c',2);
 if(state.day===1&&!state.clues.includes('departure')){round(g,462,391,15,15,'#f7efd7',1,'#bcb193');line(g,465,395,473,395,'#92927b',1);}
 // Takeaway cartons, directly at the kitchen counter edge.
 if(state.day===1){round(g,918,370,26,18,'#e4c79d',2);round(g,941,377,19,14,'#f5e7c9',2);line(g,921,369,951,383,'#7d735b',1.5);line(g,921,366,951,380,'#7d735b',1.5);
 }
 // Balcony: glass rail, greenery and unopened boxes. No text over the room.
 line(g,305,660,520,660,'#7f9d91',5);for(let x=308;x<530;x+=40)line(g,x,660,x,677,'#718d83',3);
 round(g,329,607,45,35,'#c49d70',3);line(g,350,608,350,640,'#e3cda6',6);line(g,335,616,344,616,'#8d7c60',1);plant(g,466,609);
 // A compact bathroom with an open doorway and real fixtures.
 round(g,640,548,160,112,'#d6ddd0',2,'#a4b5a5');for(let x=645;x<799;x+=24)for(let y=553;y<657;y+=24)round(g,x,y,22,22,'#e8e8d7',0,'#c8d0c0');
 round(g,640,543,160,10,'#efddbd',1);round(g,640,548,9,52,'#d0bea0',1);round(g,640,640,9,20,'#d0bea0',1);round(g,791,548,9,112,'#d0bea0',1);round(g,640,652,39,8,'#d0bea0',1);round(g,744,652,56,8,'#d0bea0',1);
 round(g,694,556,58,32,'#f2ead6',4);ellipse(g,723,574,18,9,'#adc4be');line(g,722,568,722,558,'#6a8d88',3);round(g,691,541,62,13,'#a6c4bc',2);
 for(let i=0;i<5;i++){round(g,693+i*11,554,7,10,['#b3bd93','#839ba8','#d1ab88','#d4c688','#b4c9bb'][i],2,null);}
 round(g,757,597,25,16,'#ebece0',3);ellipse(g,770,621,15,20,'#f1f0e2');ellipse(g,770,621,9,12,'#c5d6cd');
}
function drawSleeper(g,a){
 const bed={player:[976,110,'#c0b38d'],lin:[112,110,'#a9b49b'],su:[400,110,'#91aeb0'],chen:[688,110,'#d6a17f'],xu:[432,424,'#e9cb97']}[a.id];
 const [x,y,color]=bed;g.save();g.translate(x,y);
 if(a.id==='xu')g.rotate(-Math.PI/2);
 // Head on the pillow, body beneath the blanket. Collision position stays next to the bed.
 ellipse(g,0,-12,13,11,PEOPLE[a.id].hair);
 ellipse(g,0,-9,9,8,'#e3bea2');line(g,-6,-10,-2,-9,'#625e50',1);line(g,2,-9,6,-10,'#625e50',1);
 round(g,-20,0,40,36,color,6,'#829184');line(g,-16,7,16,7,'#f6edd379',2);
 g.restore();
}
function drawNight(g){
 const night=mode==='play'&&['dusk','complete'].includes(state.phase);
 if(!night){if(mode==='play'&&[2,5].includes(state.day)){g.fillStyle='rgba(17,29,61,.14)';g.fillRect(0,0,WW,WH);}return;}
 const progress=settings.reduced?1:Math.min(1,(state.duskTime||0)/2.5);
 // Tint only the world: dialogue, buttons and the return-home task remain readable.
 g.fillStyle='rgba(17,29,61,'+(.57*progress)+')';g.fillRect(0,0,WW,WH);
 for(const [x,y]of[[185,271],[464,271],[752,271],[1008,271],[385,458]]){
  const glow=g.createRadialGradient(x,y,2,x,y,58);
  glow.addColorStop(0,'rgba(247,199,116,'+(.19*progress)+')');
  glow.addColorStop(1,'rgba(247,199,116,0)');
  g.fillStyle=glow;g.fillRect(x-58,y-58,116,116);
 }
}
function worldPoint(clientX,clientY){return {x:(clientX-cam.x)/cam.scale,y:(clientY-cam.y)/cam.scale};}
buildArt();resizeWorld();addEventListener('resize',resizeWorld);
