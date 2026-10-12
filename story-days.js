'use strict';
// Authored days, dialogue and choice effects. No individual relationship values.
const STORY_DAYS={
 1:{title:'入住签约',time:'傍晚',intro:'',end:'行李放好了。公约还贴在墙上。'},
 2:{title:'初次违规',time:'23:20',intro:'客厅的外放还响着。苏白站在门口，一直没回屋。',eventPeople:['su'],eventText:'苏白有话要说',
   lines:[['su','已经十一点二十了。他那段视频，一句重录了八遍。'],['chen','最后一遍，真的。我没注意时间。'],['su','我明早有课。你能跟他说一下吗？']],end:'外放关了，厨房那瓶饮料还开着。',
   choices:{
    A:{label:'陈灿，声音收一下。还有，写了名字的东西先问再拿。',reply:[['chen','好，我戴耳机。饮料的事明早说吧。'],['su','那我先回去了。']]},
    B:{label:'公约写着十一点后不能吵。今晚先别拍了。',reply:[['chen','知道了，停了。'],['lin','饮料是我的，明早也得说清楚。'],['chen','……行。']]},
    C:{label:'苏白，今晚先让他录完吧。我去催他。',shift:1,reply:[['su','我已经等了挺久了。'],['chen','我关外放，剩下的戴耳机录。']]},
    D:{label:'林砚，你能跟我一起去说一下吗？',reply:[['lin','行，不过你也一起说。'],['chen','不用两个人来，我听见了。现在关。']]}
   }},
 3:{title:'公开争执',time:'早上',intro:'厨房传来争吵声。那瓶写着名字的饮料，被摆到了两个人中间。',eventPeople:['lin','chen'],eventText:'饮料的事还没说完',
   lines:[['chen','是我喝的。我以为名字是买东西时做的标记。'],['lin','那是我留给自己的。你喝之前问一句不行吗？'],['chen','我买一瓶还你。别搞得跟审我一样。'],['lin','你说呢？']],end:'瓶子收走了，厨房没人再说话。',
   choices:{
    A:{label:'陈灿，给林砚道个歉，补一瓶。公约还是得遵守。',shift:-1,reply:[['chen','对不起，明天补给你。'],['lin','我要的就是这句话。'],['chen','嗯，下次先问你。']]},
    B:{label:'就是一瓶饮料，先别吵了。陈灿也不是故意的。',shift:1,reply:[['lin','你们觉得小，可那是我的东西。'],['chen','我还是会赔的。']]},
    C:{label:'陈灿补一瓶，以后先问。今天这事就说到这儿，好吗？',shift:-1,reply:[['chen','行，口味发我。'],['lin','好，补了就行。下次先问我。']]},
    D:{label:'要不另放一层，愿意共享的饮料放那儿？各自的照旧。',shift:-1,flag:'sharedDrinks',reply:[['lin','我的先不放，行吧？'],['chen','行。这次先赔你一瓶，以后我的放共享那层。']]},
    E:{label:'瓶上写着林砚的名字。陈灿，这次确实是你没问。',requires:'drink',shift:-1,reply:[['chen','看见了。我赔。'],['lin','嗯，赔一瓶就行。以后先问我。']]}
   }},
 4:{title:'休战暗流日',time:'午后',intro:'今天没人吵架。各忙各的，客厅倒显得空了。',end:'今天没有争吵。有些话，只在两个人之间说了。'},
 5:{title:'公约崩塌',time:'深夜',intro:'陈灿带朋友回来了，相机还开着。林砚拦住镜头，许川扯下了冰箱上的公约。',eventPeople:['chen','lin'],eventText:'客厅吵起来了',
   lines:[['lin','谁说可以带人回来拍的？先把镜头关了。'],['chen','就补两个镜头，没拍你。'],['xu','别吵了！这张纸贴在这儿，大家还不是天天吵。'],['player','许川，先把纸放下。']],end:'人散了。餐桌上的纸，再也拼不回原样。',
   choices:{
    A:{label:'先停拍，朋友今晚先回去。咱们几个留下说。',flag:'guestLeft',reply:[['chen','行，我送他下楼。'],['lin','以后带人来，先说一声。'],['xu','纸……我不是想撕成这样的。']]},
    B:{label:'今晚先留一晚，别再拍了。天亮就走，行吗？',shift:1,flag:'guestStays',reply:[['lin','我不赞成。你已经决定了，还问什么？'],['chen','我让他明早就走。今晚不拍了。'],['su','至少现在关掉吧。']]},
    C:{label:'许川，你扯公约，是不是根本没打算到期搬走？',requiresFlag:'suHint',shift:1,flag:'guestLeft',reply:[['xu','我是还没找到地方，不是想赖着。'],['lin','那为什么不早点说？'],['chen','我先送人走，你们别再吵了。']]},
    D:{label:'苏白，能陪我劝两句吗？我先送客。',shift:-1,flag:'guestLeft',reply:[['su','可以。先关相机吧。'],['chen','关了，我陪你送他。'],['xu','我等你们回来，把借住的事也说清楚。']]}
   }}
};
Object.assign(CLUES,{
 drink:{title:'被开启的饮料',text:'瓶口已经开过，标签上写着“林砚”。',group:'被开启的饮料'},
 bill:{title:'许川的外卖账单',text:'沙发缝里的账单：一份白粥，用了优惠券。',group:'许川的生活困境'},
 medical:{title:'林砚的备考病历碎片',text:'林砚递来的复诊单，写着睡眠不足。她说这阵子在备考。',group:'林砚的备考压力'},
 hairtie:{title:'陌生发圈',text:'洗手台边多了一个发圈，四位室友都没戴过。',group:'陌生发圈'},
 scrap:{title:'公约残片',text:'餐桌上的碎纸还看得见“提前告知所有人”。',group:'公约残片'}
});
const DAY_OBSERVATIONS={
 2:{kitchen:['被开启的饮料','瓶口开了，瓶盖搁在一边。标签上写着“林砚”。','drink'],sofa:['还亮着的屏幕','陈灿的设备架在沙发前，外放声一遍遍重来。'],balcony:['纸箱','画具已经拿出来了，空箱靠着墙。'],bathroom:['洗手台','水龙头没拧紧，水珠一滴滴落下。']},
 3:{sofa:['沙发缝里的账单','一份白粥，用了优惠券。许川说昨晚没什么胃口。','bill'],kitchen:['空饮料瓶','林砚把有名字的那一面转了过来。'],balcony:['晾着的画','苏白的画夹好了，还不能碰。'],bathroom:['洗手台','镜子上有一点没擦干的水汽。']},
 4:{sofa:['叠好的毯子','背包贴着沙发扶手，许川给过道留了位置。'],kitchen:['各自的杯子','杯子分开摆了。今天没人碰别人的。'],balcony:['晾干的画','画纸已经干了，苏白还在这里发呆。'],bathroom:['陌生发圈','洗手台边多了个发圈，没见谁戴过。','hairtie']},
 5:{sofa:['挪开的茶几','茶几让出了拍摄的位置，沙发上堆着外套。'],kitchen:['没动的水杯','两杯水刚倒好，谁也没喝。'],balcony:['关着的窗','窗关着，客厅里的声音还是传了过来。'],bathroom:['洗手台','发圈不见了，台边留着水印。'],dining:['公约残片','纸被扯成几片。“提前告知所有人”那一行还看得清。','scrap']}
};
const DAY_CHAT={
 2:{lin:'我那瓶饮料还没喝，盖子怎么开了？',su:'我明早有课，真不能再吵了。',chen:'收音有点杂，我再听一遍。',xu:'我耳机借你们吧。别因为我睡客厅就都不出声。'},
 3:{lin:'不是钱的事。你用之前先问，我至少能知道。',su:'我睡得有点少，今天不太想说话。',chen:'我会买的。就是一大早被堵在厨房，有点烦。',xu:'昨晚那张账单是我的，扔了就行。'},
 4:{chen:'今天没拍。电池也得歇会儿。'},
 5:{lin:'规矩写过一遍，还是要一遍遍解释。',su:'我不想被拍。躲回房间也不是长久的办法。',chen:'我以为补完镜头就走，没想到弄成这样。',xu:'纸是我扯的，这个我认。'}
};
const DAY_PLACES={
 2:{lin:[816,368],su:[624,368],chen:[560,464],xu:[496,464]},
 3:{lin:[912,432],su:[560,560],chen:[976,464],xu:[496,464]},
 4:{lin:[240,176],su:[432,624],chen:[816,208],xu:[496,464]},
 5:{lin:[752,464],su:[624,368],chen:[624,528],xu:[496,464]}
};
function dayDefinition(day=state.day){return STORY_DAYS[day];}
function needsEvent(s=state){return s.day===7?!s.flags.finaleRead:!!STORY_DAYS[s.day]?.choices&&!s.choices[s.day];}
function availableChoices(s=state){
 const choices=STORY_DAYS[s.day]?.choices||{};
 const keys=s.day===3?[s.clues.includes('drink')?'E':'A','B','C','D']:Object.keys(choices);
 return keys.map(id=>[id,choices[id]]).filter(([,b])=>(!b.requires||s.clues.includes(b.requires))&&(!b.requiresFlag||s.flags[b.requiresFlag]));
}
function evaluateChoice(atmosphere,pact,flags,day,id){
 const b=STORY_DAYS[day].choices[id];let a=b.atmosphere??atmosphere;
 if(b.shift)a+=b.shift;if(b.cap!==undefined)a=Math.min(a,b.cap);if(b.floor!==undefined)a=Math.max(a,b.floor);
 return {atmosphere:Math.max(0,Math.min(3,a)),pact:day===5?'torn':b.pact||pact,flags:{...flags,...(b.flag?{[b.flag]:true}:{})}};
}
function clueGroups(s=state){return [s.clues.includes('departure')&&s.clues.includes('bill'),'drink','medical','hairtie','scrap'].filter((c,i)=>i===0?c:s.clues.includes(c)).length;}
function dayObjects(){const objects=OBJECTS.map(o=>({...o}));if(state.day>=5)objects.push({id:'dining',name:'公约残片',x:880,y:528,hitX:880,hitY:565});return objects;}
function dayNPCs(saved){const list=createNPCs(saved);if(!saved&&DAY_PLACES[state.day])for(const a of list){[a.x,a.y]=DAY_PLACES[state.day][a.id];a.dir='down';}return list;}
function eventPerson(id){return state.phase==='explore'&&needsEvent()&&dayDefinition().eventPeople.includes(id);}
function tipText(t){
 if(eventPerson(t.id))return dayDefinition().eventText;
 if(PEOPLE[t.id])return '和'+t.name+'聊聊';
 if(t.id==='board'||t.id==='fridge')return state.day>=5?'看看胶带留下的痕迹':'看看七日公约';
 return DAY_OBSERVATIONS[state.day]?.[t.id]?.[0]||OBJECT_TIPS[t.id];
}
function grantClue(id){if(state.clues.includes(id))return;state.clues.push(id);notify('记下了：'+CLUES[id].title);}
function inspectDayObject(t){
 if(state.day===1)return false;
 if(state.day===6&&t.id==='sofa'){openModal('<h2>沙发边的行李</h2><p>'+(state.atmosphere<2?'箱子装了一半，换洗的衣服还留在外面。':'箱子敞着，衣服和日用品还没收进去。')+'</p>');return true;}
 const o=DAY_OBSERVATIONS[state.day]?.[t.id];
 if(o){if(o[2])grantClue(o[2]);openModal('<h2>'+o[0]+'</h2><p>'+o[1]+'</p>');save();return true;}
 if(t.id==='player-door'){openModal('<h2>自己的房间</h2><p>窗边留着一点光，床单还平平整整。</p>');return true;}return false;
}
function chatDay(id){
 if(state.day===1)return false;
 if(state.day===4){
  if(id==='lin'){startDialogue([['lin','昨晚又没睡好。我快考试了，白天还得看书。'],['player','你脸色不太好。看过医生了吗？'],['lin','看了，这是复诊单。别跟他们说啊，我不想挨个解释。']],'clue:medical');return true;}
  if(id==='su'){startDialogue([['su','许川昨天问我，沙发再睡一阵会不会碍事。'],['player','他还没找到地方？'],['su','好像是。你找个没人的时候问他吧，别当着大家的面。']],'hint:su');return true;}
  if(id==='xu'){
   const enough=state.clues.includes('departure')&&state.clues.includes('bill');
   startDialogue(enough?[['player','工作刚停，最近是不是有点难？'],['xu','嗯。房租交完，手里剩得不多，才找你借住。'],['player','饭还是得好好吃。房子的事，找时间一起说。']]:[['xu','毯子我叠好了。你们要坐，直接拿开就行。']],enough?'hint:empathy':'');return true;
  }
  if(id==='chen'&&state.clues.includes('hairtie')){startDialogue([['player','洗手台那个发圈，你知道是谁的吗？'],['chen','朋友的。前两天上来拿过东西，我忘了说。'],['player','下次提前说一声。']],'hint:visitor');return true;}
 }
 startDialogue([[id,state.day===2&&state.choices[2]&&id==='chen'?'外放关了。我把素材收一下就回屋。':DAY_CHAT[state.day][id]]]);return true;
}
function startEvent(){
 if(mode!=='play'||state.phase!=='explore'||!needsEvent()||state.dialogue||$('modal').open)return;
 state.activeTarget='event';if(state.day===7){state.eventStage='finale';startDialogue(endingFor().lines,'finale:done');return;}state.eventStage='intro';startDialogue(dayDefinition().lines,'event:choose');
}
function paintChoices(){
 clearTimeout(toastTimer);$('toast').hidden=true;stopMotion();$('conversation').hidden=false;document.body.classList.add('talking');$('speaker').textContent='我';$('speech-text').textContent='你想怎么说？';$('speech-hint').textContent='';$('choices').hidden=false;$('choices').replaceChildren();
 for(const [id,b] of availableChoices()){const el=document.createElement('button');el.textContent=b.label;el.dataset.choice=id;const reason=choiceLock(id);el.disabled=!!reason;if(reason){const hint=document.createElement('small');hint.className='choice-lock';hint.textContent=reason;el.append(hint);}el.onclick=()=>commitChoice(id);$('choices').append(el);}
}
function commitChoice(id){
 if(state.eventStage!=='choice'||!needsEvent()||choiceLock(id)||!availableChoices().some(([key])=>key===id))return;
 const b=dayDefinition().choices[id];state.history.push(['player',b.label]);Object.assign(state,evaluateChoice(state.atmosphere,state.pact,state.flags,state.day,id));
 state.choices[state.day]=id;state.eventStage='response';$('choices').hidden=true;startDialogue(b.reply,'event:done');refreshHud();
}
function advanceStory(after){
 if(after==='finale:done'){finishFinale();return true;}
 if(after.startsWith('clue:'))grantClue(after.slice(5));
 if(after==='hint:su')state.flags.suHint=true;
 if(after==='hint:empathy')state.flags.empathy=true;
 if(after==='hint:visitor'){state.flags.visitorKnown=true;notify('发圈是陈灿朋友留下的。');}
 if(after==='event:choose'){state.eventStage='choice';save();paintChoices();return true;}
 if(after==='event:done'){for(const id of dayDefinition().eventPeople)if(!state.spoken.includes(id))state.spoken.push(id);state.eventStage='done';state.activeTarget=null;save();refreshHud();if(state.actions>=6||state.endRequested)beginDusk();return true;}
 return false;
}
function nextDay(){
 if(state.phase!=='complete'||state.day>=7)return;
 const carry={day:state.day+1,atmosphere:state.atmosphere,pact:state.pact,clues:[...state.clues],flags:{...state.flags},choices:{...state.choices},history:[...state.history],introStep:'done'};
 state={...INITIAL(),...carry};if(state.day===5)state.pact='torn';npcs=dayNPCs();setMode('play');save();openModal('<h2>第 '+state.day+' 天 · '+dayDefinition().title+'</h2><p>'+dayDefinition().intro+'</p>','开始');
}
function drawStoryProps(g){
 if(state.day<2)return;drawFinaleProps(g);
 if(state.pact==='marked'||state.pact==='scored'){
  for(const [x,y]of[[1075,417],[674,307]]){line(g,x-7,y-4,x,y,'#746f65',1.6);if(state.pact==='scored'){line(g,x-8,y,x+2,y-8,'#746f65',1.8);line(g,x-7,y-6,x,y+3,'#746f65',1);}}
 }
 if(state.day===2||state.day===3){round(g,925,361,14,27,'#b9ce99',3);round(g,927,354,10,9,'#e1e4c9',2);round(g,927,372,10,8,'#f6ebd6',1);ellipse(g,947,382,5,3,'#a1ad81');}
 if(state.day===3&&!state.clues.includes('bill')){round(g,441,415,12,26,'#f9ebcb',1);for(let i=0;i<4;i++)line(g,444,420+i*4,450,420+i*4,'#9c927a',1);}
 if(state.day===4&&!state.clues.includes('hairtie')){g.strokeStyle='#bd8582';g.lineWidth=3;g.beginPath();g.ellipse(744,578,5,4,0,0,Math.PI*2);g.stroke();}
 if((state.day===2||state.day===5)&&needsEvent()){
  round(g,588,447,28,18,'#405751',3);ellipse(g,602,456,5,5,'#96b6b1');line(g,602,465,590,496,'#5d6252',2);line(g,602,465,614,496,'#5d6252',2);
  ellipse(g,611,452,2,2,'#d07960');
 }
 if(state.day>=5){
  for(let i=0;i<5;i++){g.save();g.translate(855+i*11,558+(i%2)*8);g.rotate((i-2)*.18);round(g,0,0,20,9,'#f8ecd0',1,'#b9aa8d');line(g,4,4,16,4,'#9d947f',1);g.restore();}
  if(state.day===5&&(needsEvent()||state.flags.guestStays)){
   // Visitor silhouette: separate muted outfit, short side-swept hair, no resident identity.
   ellipse(g,710,526,13,5,'#293b3828');round(g,701,482,21,34,'#9294a0',7,'#596475');line(g,705,514,704,525,'#576574',7);line(g,718,514,719,525,'#576574',7);ellipse(g,711,474,12,14,'#d4b69d');ellipse(g,711,465,13,10,'#5b5a54');
  }
 }
}
