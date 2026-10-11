'use strict';
function today(){return state.day===1?null:DAYS[state.day];}
function currentBranches(){return branchesFor(state.day);}
function neededPeople(){return today()?.people||['lin','su','chen'];}
function startNextDay(){
 if(state.phase!=='complete'||state.day>=10)return;
 state.day++;state.phase='explore';state.choice=null;state.heard=[];state.elapsed=0;state.nightTime=0;state.sleepRequested=false;state.actionDone=false;state.wrapDone=false;
 delete state.dialogue;state.player={x:1008,y:208};npcs=createNPCs();setMode('play');refreshHud();save();
 const lines=[['player',({2:'起来晚了……看看厨房还有没有吃的。',3:'谁手机一直响？出去看看。',4:'今天得记着聊许川住的事。',5:'洗衣机怎么还没停？',6:'饭味儿都飘进来了。',7:'许川今天还没出门？',8:'面包闻着挺香。',9:'茶几上又多了张纸。',10:'第十天了啊。'})[state.day]]];
 if(state.day===2&&state.stay.nights===1)lines.push(['player','许川还没找到房。先住到第四天，大家方便吗？'],['lin','可以，第四天我们再一起聊。'],['su','嗯，安静就好。'],['chen','行，我没问题。'],['xu','好，我这几天接着找。']);
 if(state.day===4)lines.push(['player',state.ledger[0].choice==='B'?'试住的三晚到了，今天得跟大家坐下来聊。':'前两天说过今天再聊，得把后面的日期说准。']);
 if(state.day===9)lines.push(['lin',state.ledger.find(e=>e.day===8)?.choice==='C'?'陈灿一早约了维修，我留下来等人。插排已经换好了。':'维修师傅来过了。插排换了，以后电器别都挤在一起用。']);
 startDialogue(lines);
}
function campaignHud(){
 document.querySelector('.day strong').replaceChildren(document.createTextNode('第 '+state.day+' 天 '));
 const i=document.createElement('i');i.textContent=['sleep','complete'].includes(state.phase)?'· 夜里':'· 傍晚';document.querySelector('.day strong').append(i);
 if(state.day===1)return false;
 const d=today();$('quest-tag').textContent=['sleep','complete'].includes(state.phase)?'夜深了':'今天的小事';
 $('quest-title').textContent=state.phase==='sleep'?'回屋睡觉':d.title;
 const remain=neededPeople().filter(id=>!state.heard.includes(id)).map(id=>PEOPLE[id].name).join('、');
 $('quest-detail').textContent=({explore:'先在屋里走走。',doorbell:d.detail,listen:'还想听听'+remain+'怎么说。',agree:'到便签板边，和大家说说你的想法。',prepare:d.actionText+'，靠近后互动。',rest:'去找'+PEOPLE[d.people[0]].name+'，说声今天忙完了。',sleep:'大家回屋了，你也回最右边的床边休息吧。',complete:'今天的事先到这里。'})[state.phase];
 return true;
}
function campaignInteract(t){
 const d=today();if(!d)return false;
 if(state.phase==='sleep')return false;
 if(state.phase==='doorbell'&&t.id===d.trigger){startDialogue(d.intro,'open-door');return true;}
 if(state.phase==='listen'&&d.people.includes(t.id)&&!state.heard.includes(t.id)){startDialogue(d.talk[t.id],'heard:'+t.id);return true;}
 if(state.phase==='agree'&&t.id==='board'){startDialogue([['player',d.question]],'',true);return true;}
 if(state.phase==='prepare'&&t.id===d.action){if(state.day===2){sortFridge();return true;}if(state.day===5||state.day===8){householdTask();return true;}const b=currentBranches()[state.choice];startDialogue([...d.acts,[d.people[0],b.result||({A:'行，那就先这样。',B:'好，明天再看看。',C:'……知道了。'})[state.choice]]],'daily-action');return true;}
 if(state.phase==='rest'&&t.id===d.people[0]){startDialogue([...d.closing,['player','灯关了啊，晚安。'],['lin','晚安。']],'settled');return true;}
 if(t.id==='bed')return false;
 if(PEOPLE[t.id]){
  const id=t.id,score=state.trust[id];
  const line=score<=-4?({lin:'有事发消息吧，我先忙。',su:'嗯，今天不想聊。',chen:'我回房了。',xu:'不用管我，你忙。'})[id]:
   score>=10?({lin:'我带了橘子，放桌上了，记得吃。',su:'你等一下，我有张画想给你看。',chen:'等我剪完，给你看看？就拍了物件。',xu:'刚看到个房源，你有空帮我瞅一眼吗？'})[id]:
   ({lin:'我等会儿还有事，先看两页书。',su:'杯子是干净的，刚洗。',chen:'你先坐，我找根线。',xu:'水烧好了，要喝自己倒。'})[id];
  startDialogue([[id,line]]);return true;
 }
 startDialogue([['player',t.id==='board'&&state.choice?currentBranches()[state.choice].agreement:'先放这儿吧。']]);return true;
}
function drawDailyProps(g){
 line(g,250,530,250,570,'#899c90',3);line(g,310,530,310,570,'#899c90',3);line(g,250,535,310,535,'#899c90',3);round(g,282,535,25,27,'#ede2c5',1);
 const f=favorState();if(f?.status==='accepted'){const o=OBJECTS.find(o=>o.id===FAVOR_TASKS[f.person].object);marker(g,o.x,o.y,'?','#8aa686');}
 if(state.day===1&&!['sleep','complete'].includes(state.phase)&&!f){for(const a of npcs)if(canOfferFavor(a.id)&&!(a.id==='xu'&&['explore','doorbell'].includes(state.phase)))marker(g,a.x,a.y,'?','#8aa686');}
 if(state.day<=1)return;
 const night=['sleep','complete'].includes(state.phase);
 if(!night&&state.phase==='doorbell'){const obj=OBJECTS.find(o=>o.id===today().trigger);marker(g,obj.x,obj.y,'!');}
 if(!night&&state.phase==='prepare'){const obj=OBJECTS.find(o=>o.id===today().action);marker(g,obj.x,obj.y,'!');}
 // Visible props remain until the corresponding action is done.
 const done=state.actionDone;
 if(state.day===2){round(g,1048,408,24,14,done?'#b4c5a3':'#dcaa85',3);if(done)line(g,1052,412,1067,412,'#f9edd0');}
 if(state.day===3){round(g,446,500,15,24,'#53645f',3);round(g,449,503,9,14,done?'#9bac91':'#d7b793',1);}
 if(state.day===5){line(g,250,530,250,570,'#899c90',3);line(g,310,530,310,570,'#899c90',3);line(g,250,535,310,535,'#899c90',3);round(g,done?282:260,535,25,27,'#ede2c5',1);round(g,260,541,16,21,done?'#a4bca8':'#b4cad0',1);}
 if(state.day===6){for(let n=0;n<(done?5:1);n++){ellipse(g,854+n*14,560,6,4,'#e6d8b7');ellipse(g,854+n*14,558,5,3,'#fbf0d5');}}
 if(state.day===7){round(g,447,526,26,18,'#7b9289',2);if(!done)round(g,450,528,20,12,'#c9d8c0',1);else for(let x of [450,470])ellipse(g,x,531,5,4,'#eddbb5');}
 if(state.day===8){round(g,1000,398,23,9,done?'#a4afa3':'#8b8371',2);if(!done){g.strokeStyle='#c6a16c';g.beginPath();g.moveTo(1007,392);g.lineTo(1012,384);g.lineTo(1009,383);g.stroke();}}
 if(!night&&!favorState()){for(const id of ['lin','su','chen','xu'])if(canOfferFavor(id)){const a=npcs.find(n=>n.id===id);if(a)marker(g,a.x,a.y,'?','#8aa686');}}
 if(state.day===9||state.day===10){round(g,666,303,22,18,done?'#bbceaa':'#e2c292',1);for(let i=0;i<3;i++)line(g,670,307+i*4,683,307+i*4,'#869675',1);}
}
function sortFridge(){
 const items=state.choice==='C'?[['昨天的剩菜','前排'],['空布丁盒','拿出来']]:[['陈灿的布丁','个人那层'],['大家买的鸡蛋','共用那层'],['昨天的剩菜','前排'],['空布丁盒','拿出来']];let index=0;
 openModal('<h2>打开冰箱</h2><p id="fridge-item"></p><div id="fridge-slots"></div><p id="fridge-feedback"></p>','先放着');
 const paint=()=>{const item=items[index];$('fridge-item').textContent=item[0]+' · '+(index+1)+' / '+items.length;$('fridge-slots').replaceChildren();for(const slot of ['个人那层','共用那层','前排','拿出来']){const button=document.createElement('button');button.textContent=slot;button.onclick=()=>{if(slot!==item[1]){$('fridge-feedback').textContent=slot==='拿出来'?'这个还要吃呢，找个位置放吧。':'再看看，是谁的？什么时候吃？';return;}index++;if(index===items.length){$('modal').close();startDialogue([['player',state.choice==='C'?'大家的东西没动，空盒和剩菜先收好了。':'好了，这下打开就能找到了。']],'daily-action');}else{$('fridge-feedback').textContent='放好了。';paint();}};$('fridge-slots').append(button);}};paint();
}
function householdTask(){
 const drying=state.day===5;
 const steps=drying?[
  {text:'被单滴着水，画纸就在下面。先挪什么？',options:['先把被单挪开','直接抽走画纸'],correct:0,hint:'纸还湿着，直接抽容易扯破。先把滴水的挪开。'},
  {text:'画纸放哪儿？',options:state.choice==='A'?['窗边的小夹架','被单下面']:state.choice==='B'?['另一边的临时夹架','叠起来放桌上']:['苏白屋里的夹架','折好塞进抽屉'],correct:0,hint:'还没干，得摊开夹着。'},
  {text:'架子摆好了，门口还挤着。',options:['往墙边挪，留出过道','就放门口'],correct:0,hint:'晚上出来倒水，别撞上了。'}
 ]:[
  {text:'故障插排已经断电。先确认什么？',options:['请林砚确认这路电源已关','插上烤箱试一试'],correct:0,hint:'别再通电试了，等维修的人来检查。'},
  {text:'林砚确认已断电，插排也冷下来了。',options:['拔掉设备，收起插排','拆开看看里面'],correct:0,hint:'咱们不懂电路，不拆，留给维修的人。'},
  {text:'收起来了，怎么提醒别人？',options:['贴上“坏了，别用”，留好维修消息','塞到桌下就好'],correct:0,hint:'藏起来容易又被拿出来，留张纸更稳。'}
 ];let index=0;
 openModal('<h2>'+(drying?'腾一腾晾架':'收起故障插排')+'</h2><p id="task-step"></p><div id="task-options"></div><p id="task-feedback" aria-live="polite"></p>','等会儿再弄');
 const paint=()=>{const step=steps[index];$('task-step').textContent=(index+1)+' / '+steps.length+' · '+step.text;$('task-options').replaceChildren();step.options.forEach((label,i)=>{const button=document.createElement('button');button.textContent=label;button.onclick=()=>{if(i!==step.correct){$('task-feedback').textContent=step.hint;return;}index++;if(index===steps.length){$('modal').close();startDialogue([[drying?'su':'lin',drying?'这下碰不到了。夹子给我，我自己夹。':'纸贴好了。今晚别再用这边的电器了。'],['player',drying?'好，我把过道也腾出来了。':'嗯，等维修的人来。']],'daily-action');}else{$('task-feedback').textContent='';paint();}};$('task-options').append(button);});};paint();
}
function upgradeCampaign(s){
 if(!s||![2,3].includes(s.version))return s;
 // Migration is in memory until a validated state is saved, never overwrites a bad save.
 if(!Number.isInteger(s.node)&&PHASES.includes(s.phase)){
  if(s.version===2){if(s.phase==='complete')s.phase='sleep';if(s.dialogue?.after==='end')s.dialogue.after='settled';}
  s.version=4;s.day=1;s.ledger=s.choice?[{day:1,choice:s.choice}]:[];s.actionDone=false;s.wrapDone=false;
  s.nightTime=s.nightTime||0;s.sleepRequested=!!s.sleepRequested;
 }
 return s;
}
function validateCampaign(s){
 if(!s||s.version!==5||!Number.isInteger(s.day)||s.day<1||s.day>10||!PHASES.includes(s.phase))return false;
 if(!s.player||!Number.isFinite(s.player.x)||!Number.isFinite(s.player.y)||!canStand(s.player.x,s.player.y))return false;
 if(!Array.isArray(s.ledger)||s.ledger.length!==s.day-1+(s.choice?1:0)||s.ledger.some((e,i)=>e.day!==i+1||!Object.hasOwn(branchesFor(e.day),e.choice)))return false;
 if(!(s.choice===null||Object.hasOwn(branchesFor(s.day),s.choice))||s.choice&&s.ledger.at(-1).choice!==s.choice)return false;
 const calculated=daysLedgerTrust(s.ledger);if(!Array.isArray(s.favors)||s.favors.length>10||new Set(s.favors.map(f=>f.day)).size!==s.favors.length||s.favors.some(f=>!Number.isInteger(f.day)||f.day<1||f.day>s.day||!Object.hasOwn(FAVOR_TASKS,f.person)||!["accepted","collected","done"].includes(f.status)))return false;for(const f of s.favors)if(f.status==="done")calculated[f.person]+=2;if(!s.trust||Object.keys(calculated).some(id=>s.trust[id]!==calculated[id]))return false;
 const people=s.day===1?['lin','su','chen']:DAYS[s.day].people;
 if(!Array.isArray(s.heard)||new Set(s.heard).size!==s.heard.length||s.heard.some(id=>!people.includes(id)))return false;
 if(['agree','prepare','rest','sleep','complete'].includes(s.phase)&&s.heard.length!==people.length)return false;
 if(['prepare','rest','sleep','complete'].includes(s.phase)!==!!s.choice)return false;
 for(const key of ['boxMoved','blanket','sleepRequested','actionDone','wrapDone'])if(typeof s[key]!=='boolean')return false;
 if(!Number.isFinite(s.elapsed)||s.elapsed<0||!Number.isFinite(s.nightTime)||s.nightTime<0)return false;
 if(s.sleepRequested&&!['sleep','complete'].includes(s.phase))return false;
 if(s.ledger.length){const first=BRANCHES[s.ledger[0].choice];if(!s.stay||s.stay.nights!==first.nights||s.stay.pending!==first.pending||s.stay.review!==first.review)return false;}
 else if(s.stay!==null)return false;
 if(s.day>1&&!s.blanket||s.blanket&&!s.boxMoved)return false;
 if(s.day===1&&['rest','sleep','complete'].includes(s.phase)&&!s.blanket)return false;
 if(s.day>1&&['rest','sleep','complete'].includes(s.phase)&&!s.actionDone)return false;
 const lines=v=>Array.isArray(v)&&v.length<=1000&&v.every(l=>Array.isArray(l)&&l.length===2&&Object.hasOwn(PEOPLE,l[0])&&typeof l[1]==='string'&&l[1].length<500);
 if(!lines(s.history))return false;
 if(s.npcs!==null&&(!Array.isArray(s.npcs)||s.npcs.length!==4||new Set(s.npcs.map(n=>n.id)).size!==4||s.npcs.some(n=>!Object.hasOwn(SPAWNS,n.id)||!Number.isFinite(n.x)||!Number.isFinite(n.y)||!canStand(n.x,n.y))))return false;
 if(s.dialogue){const d=s.dialogue;if(!lines(d.lines)||!d.lines.length||!Number.isInteger(d.index)||d.index<0||d.index>=d.lines.length||typeof d.choice!=='boolean'||!['','open-door','heard:lin','heard:su','heard:chen','heard:xu','box','blanket','daily-action','settled','end'].includes(d.after)||d.choice&&(s.phase!=='agree'||s.choice))return false;}
 return true;
}
