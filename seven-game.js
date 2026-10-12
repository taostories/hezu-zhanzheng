 'use strict';
const $=id=>document.getElementById(id),SAVE='flat-war-seven-day-v1',PREFS='flat-war-topdown-settings';
let state=INITIAL(),npcs=createNPCs(),mode='menu',destination=null,chase=null,playerPath=[],settings={volume:.35,speed:30,reduced:false},audio=null,lastFrame=performance.now(),saveElapsed=0,printed=0,typeElapsed=0,toastTimer=null;
try{const p=JSON.parse(localStorage.getItem(PREFS));if(p&&[0,20,30,50].includes(p.speed)&&typeof p.reduced==='boolean'&&Number.isFinite(p.volume)&&p.volume>=0&&p.volume<=1)settings=p;}catch{}
function notify(t){$('toast').textContent=t;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3000);}
function interactionKey(id){return ['board','fridge'].includes(id)?'pact':id.endsWith('-door')&&id!=='player-door'?id.replace('-door',''):id;}
function valid(s){
 const pos=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&canStand(p.x,p.y);
 const line=l=>Array.isArray(l)&&l.length===2&&Object.hasOwn(PEOPLE,l[0])&&typeof l[1]==='string'&&l[1].length<1000;
 const objects=[...OBJECTS.map(o=>o.id),'dining'],people=['lin','su','chen','xu'];
 const list=(v,allowed)=>Array.isArray(v)&&new Set(v).size===v.length&&v.every(k=>allowed.includes(k));
 if(!s||s.version!==8||s.edition!=='seven-day'||!Number.isInteger(s.day)||s.day<1||s.day>7||!['explore','dusk','complete'].includes(s.phase))return false;
 if(!Number.isInteger(s.atmosphere)||s.atmosphere<0||s.atmosphere>3||!['intact','marked','scored','torn'].includes(s.pact)||s.signed!==true)return false;
 if(!s.flags||Array.isArray(s.flags)||Object.entries(s.flags).some(([k,v])=>!['suHint','empathy','visitorKnown','sharedDrinks','guestLeft','guestStays','finaleRead'].includes(k)||v!==true))return false;
 if(!s.choices||Array.isArray(s.choices)||Object.entries(s.choices).some(([d,id])=>!['2','3','5','6'].includes(d)||+d>s.day||!STORY_DAYS[d].choices[id]))return false;
 for(const d of [2,3,5,6])if(d<s.day&&!s.choices[d])return false;
 if(!['idle','intro','choice','response','done','finale'].includes(s.eventStage)||typeof s.endRequested!=='boolean'||typeof s.bedRequested!=='boolean')return false;
 if(!list(s.counted,[...objects.filter(k=>!['board','fridge','player-door'].includes(k)),...people])||s.actions!==s.counted.length||s.actions>6||!list(s.spoken,people)||!list(s.visited,objects))return false;
 if(s.activeTarget!==null&&![...objects,...people,'event'].includes(s.activeTarget))return false;
 if(!Number.isFinite(s.duskTime)||s.duskTime<0||!Number.isFinite(s.elapsed)||s.elapsed<0||!pos(s.player)||!list(s.clues,Object.keys(CLUES))||!Array.isArray(s.history)||!s.history.every(line))return false;
 if(s.npcs&&(!Array.isArray(s.npcs)||s.npcs.length!==4||!list(s.npcs.map(n=>n.id),people)||!s.npcs.every(pos)))return false;
 const after=['','hint:su','hint:empathy','hint:visitor','event:choose','event:done','finale:done',...Object.keys(CLUES).map(k=>'clue:'+k)];
 if(s.dialogue&&(s.phase!=='explore'||!Array.isArray(s.dialogue.lines)||!s.dialogue.lines.length||!s.dialogue.lines.every(line)||!Number.isInteger(s.dialogue.index)||s.dialogue.index<0||s.dialogue.index>=s.dialogue.lines.length||!after.includes(s.dialogue.after)))return false;
 if(['intro','choice'].includes(s.eventStage)&&(!needsEvent(s)||s.activeTarget!=='event'))return false;
 if(s.eventStage==='choice'&&s.dialogue)return false;
 if(['response','done'].includes(s.eventStage)&&!s.choices[s.day])return false;
 if(s.eventStage==='finale'&&(s.day!==7||s.activeTarget!=='event'||s.dialogue?.after!=='finale:done'))return false;
 if(s.choices[6]==='C'&&meetingLock(s))return false;
 if(s.flags.finaleRead&&(s.day!==7||s.phase!=='complete'))return false;
 if(s.phase!=='explore'&&needsEvent(s))return false;
 for(const [d,id]of Object.entries(s.choices)){const b=STORY_DAYS[d].choices[id];if(b.requires&&!s.clues.includes(b.requires)||b.requiresFlag&&!s.flags[b.requiresFlag])return false;}
 return true;
}
function readSave(){try{const raw=localStorage.getItem(SAVE);if(!raw)return{state:null};const s=JSON.parse(raw);if(s?.version===1){s.version=2;s.actions=0;s.activeTarget=null;s.duskTime=0;s.spoken=[...new Set((s.history||[]).filter(l=>l[0]!=='player').map(l=>l[0]))];}if(s?.version===2){s.version=3;s.counted=[...new Set([...(s.visited||[]),...(s.spoken||[]),...(s.activeTarget?[s.activeTarget]:[])].map(interactionKey))].slice(0,6);s.actions=s.counted.length;if(s.phase==='dusk'&&s.actions<6){s.phase='explore';s.duskTime=0;}}if(s?.version===3&&Array.isArray(s.counted)){const charged=s.counted.includes('pact');s.counted=s.counted.filter(k=>k!=='pact');s.actions=s.counted.length;s.version=4;if(charged&&s.phase==='dusk'&&s.actions<6){s.phase='explore';s.duskTime=0;}}if(s?.version===4&&Array.isArray(s.visited)){const removed=['lin-door','su-door','chen-door'];s.visited=s.visited.filter(id=>!removed.includes(id));if(removed.includes(s.activeTarget)){const person=s.activeTarget.replace('-door','');if(!s.spoken.includes(person))s.spoken.push(person);s.activeTarget=null;delete s.dialogue;}s.version=5;}if(s?.version===5){s.version=6;s.flags={};s.choices={};s.eventStage='idle';s.endRequested=false;s.bedRequested=!!s.bedRequested;}if(s?.version===6&&Array.isArray(s.counted)){const charged=s.counted.includes('player-door');s.counted=s.counted.filter(k=>k!=='player-door');s.actions=s.counted.length;if(charged&&s.actions<6&&s.phase==='explore')s.endRequested=false;s.version=7;}if(s?.version===7)s.version=8;return valid(s)?{state:s}:{state:null,error:'这份进度读不出来，原记录已保留。可以重新开始。'};}catch{return{state:null,error:'无法读取进度，原记录已保留。'};}}
function save(){state.npcs=npcs.map(({id,x,y})=>({id,x,y}));try{localStorage.setItem(SAVE,JSON.stringify(state));}catch{notify('浏览器没能保存进度，请先别关闭页面。');}}
function applySettings(){document.body.classList.toggle('reduced',settings.reduced);if(audio)audio.gain.gain.value=settings.volume*.16;if(music)music.gain.gain.value=settings.volume*.055;try{localStorage.setItem(PREFS,JSON.stringify(settings));}catch{notify('设置仅在当前会话生效。');}}
let music=null,musicTimer=null,musicStep=0;
function stopMusic(){clearInterval(musicTimer);musicTimer=null;if(music){music.gain.disconnect();music=null;}}
function startMusic(){if(musicTimer||!audio||document.hidden||mode!=='play')return;audio.ctx.resume();const c=audio.ctx,g=c.createGain();g.gain.value=settings.volume*.055;g.connect(c.destination);music={gain:g};const bars=[[261.63,329.63,392],[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66]];const play=()=>{const chord=bars[musicStep++%bars.length];chord.forEach((f,i)=>{const o=c.createOscillator(),v=c.createGain(),t=c.currentTime+i*.22;o.type='sine';o.frequency.value=f;v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(.24,t+.12);v.gain.exponentialRampToValueAtTime(.001,t+2.7);o.connect(v).connect(g);o.start(t);o.stop(t+2.8);});};play();musicTimer=setInterval(play,3000);}
function sound(kind='tap'){try{if(!audio){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C(),g=c.createGain();g.gain.value=settings.volume*.16;g.connect(c.destination);audio={ctx:c,gain:g};}audio.ctx.resume();const c=audio.ctx;const notes=kind==='bell'?[659,523]:kind==='done'?[392,494,587]:[440];notes.forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+i*.2;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.35,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.55);o.connect(g).connect(audio.gain);o.start(t);o.stop(t+.6);});}catch{notify('当前浏览器不能播放提示音。');}}
function stopMotion(){playerPath=[];destination=null;chase=null;state.player.step=0;}

function hasReadPact(){return state.visited.includes('board')||state.visited.includes('fridge');}
function refreshHud(){ $('atmosphere').textContent='合租氛围：'+ATMOSPHERES[state.atmosphere];$('day-number').textContent='第 '+state.day+' 天';document.querySelector('.day i').textContent='· '+(state.phase==='dusk'?'夜里':dayDefinition().time);$('finish-day').textContent=state.day===7?'看看今天的事':needsEvent()?'处理今天的事':'结束今天'; }
function setMode(next){mode=next;stopMotion();if(next==='play')startMusic();else stopMusic();$('menu').hidden=next!=='menu';$('hud').hidden=next!=='play';$('ending').hidden=next!=='end';$('world-tips').hidden=next!=='play';$('finish-day').hidden=state.phase==='dusk';$('nightfall').hidden=next!=='play'||state.phase!=='dusk';const talking=!!state.dialogue||state.eventStage==='choice';$('conversation').hidden=next!=='play'||!talking;document.body.classList.toggle('talking',next==='play'&&talking);if(next==='play'){refreshHud();if(state.dialogue)paintDialogue();else if(state.eventStage==='choice')paintChoices();}}
function menu(){if(mode==='play')save();if($('modal').open)$('modal').close();setMode('menu');const r=readSave();$('continue').disabled=!r.state;$('save-info').textContent=r.state?'第 '+r.state.day+' 天 · '+(r.state.phase==='complete'?'已结束':dayDefinition(r.state.day).title):'暂无新版存档';if(r.error)notify(r.error);}
function openModal(html,close='关闭'){stopMotion();$('modal').dataset.next='';$('modal-close').classList.toggle('welcome-action',close==='进屋逛逛');$('modal-body').innerHTML=html;$('modal-close').textContent=close;if(!$('modal').open)$('modal').showModal();$('modal-body').scrollTop=0;$('modal').scrollTop=0;}
function newGame(){begin();}
function begin(){sound();state=INITIAL();npcs=createNPCs();setMode('play');save();showRoster(true);}
function guideText(){return '<p>你是合租房东，许川借住七天。和室友聊天、找线索，决定怎样一起生活。</p><p><strong>点地面移动，点人物或物件互动。</strong>对话点一下补全，再点继续。</p><p>探索 <strong>6 个不同的人或物件</strong>后天黑，点自己的床回屋休息，才会结束今天。查看公约、自己的房间和重复查看都不计次，也可提前结束。有「！」时先处理事情再休息。</p>';}
function showGuide(){openModal(guideText(),'知道了');}
function showRoster(first=false){openModal((first?guideText():'<h2>住户</h2>')+'<div id="people-list"></div>',first?'开始':'关闭');if(first)$('modal').dataset.next='explore';for(const id of ['lin','su','chen','xu']){const row=document.createElement('div');row.className='roster-row';const c=document.createElement('canvas');c.width=84;c.height=124;const g=c.getContext('2d');g.scale(2,2);drawPerson(g,{id,x:21,y:59,dir:'down'});const p=document.createElement('p'),b=document.createElement('strong');b.textContent=PEOPLE[id].name;p.append(b,document.createTextNode(PEOPLE[id].bio));row.append(c,p);$('people-list').append(row);}}
function startDialogue(lines,after=''){stopMotion();state.dialogue={lines,index:0,after};save();paintDialogue();}
function paintDialogue(){$('choices').hidden=true;$('speech-hint').textContent='点击画面继续';const d=state.dialogue;$('conversation').hidden=false;document.body.classList.add('talking');$('speaker').textContent=PEOPLE[d.lines[d.index][0]].name;printed=settings.speed===0?d.lines[d.index][1].length:0;typeElapsed=0;$('speech-text').textContent=d.lines[d.index][1].slice(0,printed);}
function advance(){const d=state.dialogue;if(mode!=='play'||!d||$('modal').open)return;const t=d.lines[d.index][1];if(printed<t.length){printed=t.length;$('speech-text').textContent=t;return;}state.history.push(d.lines[d.index]);if(++d.index<d.lines.length){save();paintDialogue();return;}const after=d.after;delete state.dialogue;document.body.classList.remove('talking');$('conversation').hidden=true;if(!advanceStory(after))finishInteraction();refreshHud();save();}
function targets(){if(state.phase==='dusk')return [PLAYER_BED];return [...dayObjects(),...visibleResidents().map(a=>({...a,name:PEOPLE[a.id].name,hitX:a.x,hitY:a.y-25}))];}
function nearestTarget(){let best=null,dist=68;for(const t of targets()){const d=Math.hypot(t.x-state.player.x,t.y-state.player.y);if(d<dist){best=t;dist=d;}}return best;}
function inspectPact(){if(state.day>=5){openModal('<h2>胶带的痕迹</h2><p>公约不在了，碎纸散在餐桌上。</p>');return;}openModal('<div class="pact-paper"><h2>七日公约</h2><ol>'+PACT.map(t=>'<li>'+t+'</li>').join('')+'</ol></div>');}
function inspectBag(){if(state.clues.includes('departure')){openModal('<h2>许川的背包</h2><p>离职证明已经收好，拉链也拉上了。</p>');return;}startDialogue([['player','许川，你的离职证明要掉了。'],['xu','哎，谢谢。上一份工作刚结束，这个还得留着办手续。']],'clue:departure');}
function interact(id){
 if(mode!=='play'||state.phase!=='explore'||state.dialogue||state.eventStage==='choice'||$('modal').open)return;
 const t=id?targets().find(t=>t.id===id):nearestTarget();if(!t||Math.hypot(t.x-state.player.x,t.y-state.player.y)>70)return;
 if(eventPerson(t.id)){startEvent();return;}
 if(!state.activeTarget){if(state.actions>=6){beginDusk();return;}const key=interactionKey(t.id);if(!['pact','player-door'].includes(key)&&!state.counted.includes(key)){state.counted.push(key);state.actions=state.counted.length;}state.activeTarget=t.id;}
 save();sound();if(PEOPLE[t.id]){if(!chatDay(t.id))startDialogue([[t.id,CHAT[t.id]]]);return;}
 if(!state.visited.includes(t.id))state.visited.push(t.id);save();refreshHud();
 if(t.id==='fridge'||t.id==='board')return inspectPact();if(inspectDayObject(t))return;if(t.id==='sofa')return inspectBag();
 const o=OBSERVATIONS[t.id];if(o.speaker)startDialogue([[o.speaker,o.text]]);else openModal('<h2>'+o.title+'</h2><p>'+o.text+'</p>');
}
function journal(){openModal('<h2>随手记</h2><p>合租氛围：'+ATMOSPHERES[state.atmosphere]+'。公约板上的约定还好好贴着。</p><div id="clue-list"></div><details><summary>刚才聊过的事</summary><div id="history-list"></div></details>','返回');const list=$('clue-list');if(!state.clues.length)list.textContent='今天还没记下什么。';for(const id of state.clues){const c=CLUES[id],section=document.createElement('section');section.className='notebook-clue';for(const [tag,t] of [['h3',c.title],['p',c.text],['small',c.detail]]){const el=document.createElement(tag);el.textContent=t;section.append(el);}list.append(section);}for(const [id,t]of state.history.slice(-30)){const p=document.createElement('p');p.textContent=PEOPLE[id].name+'：'+t;$('history-list').append(p);}}
function finishInteraction(){if(!state.activeTarget||state.activeTarget==='event')return;const id=state.activeTarget;if(PEOPLE[id]&&!state.spoken.includes(id))state.spoken.push(id);state.activeTarget=null;save();if(state.actions>=6)beginDusk();}
function nightHud(){refreshHud();$('hud').hidden=false;$('finish-day').hidden=true;$('nightfall').hidden=false;$('nightfall').style.opacity='1';}
function beginDusk(){if(mode!=='play'||state.phase!=='explore')return;if(needsEvent()){state.endRequested=true;startEvent();save();return;}stopMotion();state.phase='dusk';state.activeTarget=null;state.bedRequested=false;state.duskTime=0;for(const a of npcs){a.path=[];a.bedRoute=false;}nightHud();save();}
function requestEnd(){if(mode!=='play'||state.phase!=='explore'||state.dialogue||state.eventStage==='choice')return;if(needsEvent()){startEvent();return;}openModal('<h2>结束今天？</h2><button id="confirm-end" class="primary">结束今天</button>','再看看');$('confirm-end').onclick=()=>{$('modal').close();beginDusk();};}
function showEnd(){
 $('nightfall').hidden=true;setMode('end');const final=state.day===7?endingFor():null;
 $('end-day').textContent=final?final.title:'第'+['','一','二','三','四','五','六'][state.day]+'天结束';
 $('end-atmosphere').textContent='合租氛围：'+ATMOSPHERES[state.atmosphere];
 $('end-agreement').textContent=final?final.summary:dayDefinition().end;
 $('end-clue').textContent=final?final.closing:'';$('next-day').hidden=!!final;$('end-note').hidden=!final||final.id!=='reconcile';$('end-note').textContent=final?.id==='reconcile'?'隐藏结局':'';
 $('next-day').textContent='睡醒，继续第'+(state.day+1)+'天';$('replay').textContent=final?'重新开始七日公约':'重新开始';
}
function resume(){const r=readSave();if(!r.state)return notify(r.error||'暂无存档');state=r.state;npcs=dayNPCs(state.npcs);sound();if(state.phase==='complete')showEnd();else{setMode('play');if(state.phase==='dusk'){nightHud();if(state.bedRequested)activateTarget('bed');}else if(state.eventStage==='choice')paintChoices();else if(state.introStep==='guide'||state.introStep==='roster')showRoster(true);else if(state.activeTarget&&!state.dialogue)interact(state.activeTarget);else if(state.actions>=6&&!state.dialogue)beginDusk();}}
function settingsModal(){openModal('<h2>设置</h2><label>声音音量<input id="volume" aria-label="声音音量" type="range" min="0" max="1" step="0.05"></label><label>文字速度<select id="speed"><option value="50">慢</option><option value="30">标准</option><option value="20">快</option><option value="0">即时</option></select></label><label>减少界面动态<input id="reduce" type="checkbox"></label><p>声音包含轻柔的环境音乐和互动提示。减少动态会关闭浮动提示与镜头缓动，角色移动保留。</p>','返回');$('volume').value=settings.volume;$('speed').value=settings.speed;$('reduce').checked=settings.reduced;$('volume').oninput=e=>{settings.volume=+e.target.value;applySettings();sound();};$('speed').onchange=e=>{settings.speed=+e.target.value;applySettings();};$('reduce').onchange=e=>{settings.reduced=e.target.checked;applySettings();};}

function seek(point){playerPath=findPath(state.player,point);destination=playerPath.length?playerPath[playerPath.length-1]:null;}
function activateTarget(id){if(mode!=='play'||state.dialogue||state.eventStage==='choice'||$('modal').open)return;if(state.phase==='dusk'){if(id==='bed'){state.bedRequested=true;chase=null;seek(PLAYER_BED);save();}return;}if(state.phase!=='explore')return;const t=targets().find(t=>t.id===id);if(!t)return;if(Math.hypot(t.x-state.player.x,t.y-state.player.y)<70)interact(id);else{chase=id;seek(t);}}
canvas.addEventListener('pointerdown',e=>{if(mode!=='play'||!['explore','dusk'].includes(state.phase)||$('modal').open)return;if(state.dialogue){advance();return;}if(state.eventStage==='choice')return;const p=worldPoint(e.clientX,e.clientY);const hit=targets().find(t=>Math.hypot(t.hitX-p.x,t.hitY-p.y)<28);if(hit)activateTarget(hit.id);else{state.bedRequested=false;chase=null;seek(p);}});
const tipButtons=new Map();
function paintTips(){
 const layer=$('world-tips');layer.hidden=mode!=='play'||!!state.dialogue||state.eventStage==='choice'||$('modal').open;
 if(layer.hidden)return;
 const blockers=[$('finish-day'),$('atmosphere'),document.querySelector('.day'),document.querySelector('.tools')].filter(e=>e.getClientRects().length).map(e=>e.getBoundingClientRect());
 const occupied=[];for(const [id,b] of tipButtons)b.hidden=!targets().some(t=>t.id===id);
 for(const t of targets()){
  let b=tipButtons.get(t.id);if(!b){b=document.createElement('button');b.className='world-tip';b.dataset.target=t.id;b.onclick=()=>activateTarget(t.id);layer.append(b);tipButtons.set(t.id,b);}
  if(t.id==='bed'){b.textContent='回床';b.setAttribute('aria-label','回自己的床休息');b.classList.add('pact-tip');b.hidden=false;b.style.left=Math.max(8,Math.min(innerWidth-70,t.hitX*cam.scale+cam.x-29))+'px';b.style.top=Math.max(145,Math.min(innerHeight-80,(t.hitY-27)*cam.scale+cam.y-22))+'px';continue;}const person=!!PEOPLE[t.id];if(person&&state.spoken.includes(t.id)&&!eventPerson(t.id)){b.hidden=true;continue;}const read=t.id==='board'||t.id==='fridge'?hasReadPact():state.visited.includes(t.id);
  const done=state.day===1&&t.id==='sofa'?state.clues.includes('departure'):read;
  const caption=tipText(t);b.classList.toggle('event-tip',eventPerson(t.id));
  b.classList.toggle('seen',!person&&done);b.classList.toggle('pact-tip',t.id==='board');
  const label=t.id==='board'?(state.day>=5?'胶带':'公约'):person?(eventPerson(t.id)?'!':'…'):done?'✓':'?';
  if(b.dataset.caption!==caption||b.dataset.symbol!==label){b.dataset.caption=caption;b.dataset.symbol=label;b.textContent=label;const small=document.createElement('span');small.className='tip-caption';small.textContent=caption;b.append(small);b.setAttribute('aria-label',caption);}
  const x=t.hitX*cam.scale+cam.x,y=(t.hitY-(person?45:27))*cam.scale+cam.y,w=t.id==='board'?58:44,h=44;
  if(x<22||x>innerWidth-22||y<60||y>innerHeight-35){b.hidden=true;continue;}
  let spot=null;
  for(const [dx,dy]of [[0,0],[0,-44],[44,0],[-44,0],[0,44],[0,-88],[0,88],[88,0],[-88,0]]){
   const box={left:x-w/2+dx,top:y-h/2+dy,right:x+w/2+dx,bottom:y+h/2+dy};
   if(box.left<4||box.right>innerWidth-4||box.top<68||box.bottom>innerHeight-28)continue;
   if([...blockers,...occupied].some(a=>box.left<a.right+3&&box.right>a.left-3&&box.top<a.bottom+3&&box.bottom>a.top-3))continue;
   spot=box;break;
  }
  b.hidden=!spot;if(!spot)continue;occupied.push(spot);b.style.left=spot.left+'px';b.style.top=spot.top+'px';
 }
}
document.addEventListener('click',e=>{if(mode==='play'&&state.dialogue&&!e.target.closest('button,input,select,dialog,canvas'))advance();});
addEventListener('blur',stopMotion);
document.addEventListener('visibilitychange',()=>{stopMotion();if(mode==='play')save();if(document.hidden){stopMusic();if(audio)audio.ctx.suspend();}else if(audio){audio.ctx.resume();startMusic();}});
$('modal').addEventListener('close',()=>{if($('modal').open)return;const next=$('modal').dataset.next;$('modal').dataset.next='';if(next==='explore'){state.introStep='done';save();refreshHud();}else if(mode==='play'&&state.phase==='explore'&&!state.dialogue)finishInteraction();});
$('next-day').onclick=nextDay;$('new-game').onclick=newGame;$('replay').onclick=newGame;$('continue').onclick=resume;$('end-home').onclick=menu;$('menu-settings').onclick=settingsModal;$('settings').onclick=settingsModal;$('roster').onclick=()=>showRoster();$('finish-day').onclick=requestEnd;$('modal-close').onclick=()=>{if($('modal').dataset.next==='explore'){state.introStep='done';save();}$('modal').close();};
let chaseTime=0;
function update(dt){if(mode!=='play'||$('modal').open||document.hidden||innerHeight>innerWidth&&innerWidth<900)return;if(state.phase==='dusk')state.duskTime+=dt;if(state.dialogue){const t=state.dialogue.lines[state.dialogue.index][1];typeElapsed+=dt*1000;if(settings.speed===0)printed=t.length;else while(typeElapsed>=settings.speed&&printed<t.length){printed++;typeElapsed-=settings.speed;}$('speech-text').textContent=t.slice(0,printed);return;}
 if(state.eventStage==='choice')return;
 state.elapsed+=dt;
 if(playerPath.length){state.player.path=playerPath;followPath(state.player,dt,210);playerPath=state.player.path;if(!playerPath.length)destination=null;}else state.player.step=0;
 if(chase){const target=targets().find(t=>t.id===chase);chaseTime+=dt;if(target&&Math.hypot(target.x-state.player.x,target.y-state.player.y)<64){const id=chase;stopMotion();interact(id);}else if(target&&chaseTime>.55){chaseTime=0;seek(target);}}
 for(const a of npcs){if(state.phase==='dusk'){const bed=BEDSPOTS[a.id];if(!a.bedRoute){a.path=findPath(a,bed);a.bedRoute=true;}followPath(a,dt,140);a.asleep=Math.hypot(a.x-bed.x,a.y-bed.y)<4;continue;}if(state.day>1){a.step=0;continue;}if(a.path.length)followPath(a,dt,68);else{a.step=0;a.wait-=dt;if(a.wait<=0){a.route=(a.route+1)%ROUTES[a.id].length;const [x,y]=ROUTES[a.id][a.route];a.path=findPath(a,{x:x*32+16,y:y*32+16});a.wait=3+a.route;}}}
 if(state.phase==='dusk'&&state.bedRequested&&Math.hypot(state.player.x-PLAYER_BED.x,state.player.y-PLAYER_BED.y)<4){state.phase='complete';state.bedRequested=false;stopMotion();save();showEnd();return;}
 saveElapsed+=dt;if(saveElapsed>2){saveElapsed=0;save();}
}
function frame(now){const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;update(dt);renderWorld(dt);paintTips();requestAnimationFrame(frame);}applySettings();menu();requestAnimationFrame(frame);
