'use strict';
const FAVOR_TASKS={
 lin:{object:'board',title:'给林砚找回笔记',request:'我夹在便签板后面的笔记找不到了，能帮我拿一下吗？',done:'就是这张，谢谢。我可以接着看了。'},
 su:{object:'rack',title:'帮苏白拿画夹',request:'晾架旁边有一袋夹子。能帮我拿来吗？我手上都是颜料。',done:'谢谢，放桌边就行，别沾你衣服上。'},
 chen:{object:'sofa',title:'给陈灿拿充电线',request:'我线忘在沙发边了，能帮我捎过来吗？',done:'对，就这根！你先坐，我给手机充上。'},
 xu:{object:'sink',title:'给许川倒杯温水',request:'跑了一下午，能帮我倒杯温水吗？我先坐一下。',done:'谢了，正好口渴。你也喝点。'}
};
const TRADEOFFS={
1:{A:['chen','明晚又要留时间聊啊。我剪片子得往后挪一点了。'],B:['su','三晚有点长，不过既然说好了，我先试试。'],C:['lin','明早还要专门留时间……我更想今晚说完。']},
2:{A:['su','每样都写名字有点麻烦。我先把自己的拿回去了。'],B:['chen','共用那层占了位置，我那盒得横着放了。'],C:['lin','今天先不翻东西也好，我得赶着出门。']},
3:{A:['chen','裁完还得重做声音，我今晚得多赶一阵了。'],B:['xu','我能帮补拍，不过明早看房得改个时间。'],C:['lin','先撤公开的、留一晚核对，我觉得能把事情说清。']},
4:{A:['su','又住几天啊。我能接受，就是晚上出来没那么自在了。'],B:['xu','每天都可能要换安排，我还是有点悬着。'],C:['chen','要是许川能帮我看看片子，我确实松口气。']},
5:{A:['lin','那我的大被单今晚晾不开了，我得重新安排。'],B:['xu','轮着用就好，我的衣服等下一轮。'],C:['lin','被单能摊开了，至少明天能干。']},
6:{A:['chen','我还想今天一块儿吃呢。行吧，我自己看视频。'],B:['su','客厅聊起来，我房里也听得见。今天想早点安静。'],C:['chen','终于能凑一桌了，我把菜端来。']},
7:{A:['chen','那我学长那边先不问了，人家今晚正好有空来着。'],B:['xu','突然要跟陌生人聊工作，我还没缓过来。'],C:['lin','谢谢，我明天考试，今晚确实想静一点。']},
8:{A:['chen','我本来想一起吃的，今晚又得各弄各的了。'],B:['lin','大家在厨房准备冷餐的话，我得回屋换个地方复习。'],C:['su','今晚能各自吃就好，我想安静一会儿。']},
9:{A:['su','还得轮到别的活啊。我以为选完擦桌子就可以了。'],B:['lin','又是先顶两天，我有点担心后面还是没人轮。'],C:['su','这两天能先赶作业，对我确实有帮助。']},
10:{A:['su','以后还是要常凑一起聊啊。我有时真的不想出来。'],B:['chen','各过各的也可以，就是没那么容易凑热闹了。'],C:['su','不用每次参加，我能喘口气。但我有意见还是会说。']}
};
function presentNPC(id){return !(state.day===6&&((id==='lin'&&['explore','doorbell'].includes(state.phase))||(id==='chen'&&state.phase==='rest')));}
function favorState(){return state.favors.find(f=>f.day===state.day);}
function canOfferFavor(id){return Object.hasOwn(FAVOR_TASKS,id)&&!favorState()&&presentNPC(id)&&!['doorbell','agree','sleep','complete'].includes(state.phase)&&!(state.phase==='listen'&&!state.heard.includes(id))&&!(state.phase==='rest'&&id===(today()?.people[0]||'xu'));}
function offerFavor(id){if(!canOfferFavor(id))return;const task=FAVOR_TASKS[id];openModal('<h2>'+PEOPLE[id].name+'想请你帮个忙</h2><p>'+task.request+'</p><p>去'+OBJECTS.find(o=>o.id===task.object).name+'拿好，再交给'+PEOPLE[id].name+'。今天只够帮一人。</p><button id="accept-favor" class="primary">我来吧</button>','先不帮');$('accept-favor').onclick=()=>{if(!canOfferFavor(id))return;state.favors.push({day:state.day,person:id,status:'accepted'});$('modal').close();save();refreshHud();notify('去'+OBJECTS.find(o=>o.id===task.object).name+'看看。');};}
function favorMenu(){const active=favorState();openModal('<h2>今天帮谁搭把手？</h2><p>处理完今天的事就要休息了，空出的时间只够帮一人。接下后要去拿东西，再交给本人。</p><div id="favor-list"></div>','先不帮');const list=$('favor-list');
 if(active){const p=document.createElement('p');p.textContent=FAVOR_TASKS[active.person].title+' · '+({accepted:'去'+OBJECTS.find(o=>o.id===FAVOR_TASKS[active.person].object).name+'拿东西',collected:'拿到了，交给'+PEOPLE[active.person].name,done:'已经帮好了'})[active.status];list.append(p);return;}
 for(const id of ['lin','su','chen','xu']){const b=document.createElement('button');b.textContent=FAVOR_TASKS[id].title;b.disabled=!canOfferFavor(id);b.onclick=()=>offerFavor(id);list.append(b);}
}
function favorInteract(t){const f=favorState();if(!f||f.status==='done'||['sleep','complete'].includes(state.phase))return false;const task=FAVOR_TASKS[f.person];if(f.status==='accepted'&&t.id===task.object){f.status='collected';save();startDialogue([['player','找到了，给'+PEOPLE[f.person].name+'拿过去。']]);return true;}if(f.status==='collected'&&t.id===f.person){f.status='done';state.trust[f.person]+=2;save();startDialogue([[f.person,task.done]]);showDelta({delta:{[f.person]:2}});return true;}return false;}
function collection(){let cards=[];try{cards=JSON.parse(localStorage.getItem('flat-war-endings')||'[]');if(!Array.isArray(cards))cards=[];}catch{}
 openModal('<h2>结局收藏</h2><p>隐藏后日谈在第十天回床后解锁。高关系通常需要达到 10 或 12，并完成相关事件；低于 −3 可能让人疏远。已解锁的故事会留在这里。</p><div id="collection-list"></div>','返回');
 const el=$('collection-list');if(!cards.length)el.textContent='还没有解锁。当前进度不是结局丢失，需要先过完十天。';for(const c of cards){const h=document.createElement('h3'),p=document.createElement('p');h.textContent=c.title;p.textContent=c.text;el.append(h,p);}
}
function unlockEndings(){try{let old=JSON.parse(localStorage.getItem('flat-war-endings')||'[]');if(!Array.isArray(old))old=[];const map=new Map(old.map(c=>[c.id,c]));for(const c of endingCards(state))map.set(c.id,c);localStorage.setItem('flat-war-endings',JSON.stringify([...map.values()]));}catch{notify('结局已显示，但收藏保存失败。');}}
function upgradeLife(s){
 if(s?.version===4){
  // Keep the prior save as an explicit backup before rebalancing historical choices.
  if(!Array.isArray(s.ledger)||s.ledger.some((e,i)=>e.day!==i+1||e.day>10||!Object.hasOwn(branchesFor(e.day),e.choice)))return s;
  try{if(!localStorage.getItem('flat-war-before-balance-v5'))localStorage.setItem('flat-war-before-balance-v5',JSON.stringify(s));}catch{}
  s.version=5;s.favors=[];s.trust=daysLedgerTrust(s.ledger);
 }
 return s;
}

function appendFavorHint(){const f=favorState();if(!f||f.status==='done')return;const task=FAVOR_TASKS[f.person];$('quest-detail').textContent+=' / 顺手帮忙：'+(f.status==='accepted'?'去'+OBJECTS.find(o=>o.id===task.object).name+'拿东西':'交给'+PEOPLE[f.person].name);}
