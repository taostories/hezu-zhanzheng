'use strict';
// D6 preserves atmosphere; its decision and the existing atmosphere select D7.
STORY_DAYS[6]={title:'站队拉扯',time:'傍晚',intro:'明天就是第七天。许川的行李还在沙发边。',eventPeople:['lin','xu','su'],eventText:'聊聊明天的安排',end:'明天谁走、谁留，今晚说定了。',
 lines:[['lin','明天到期了。说好七天，总得有个准数。'],['xu','我还没找好住处。能不能再给我几天？'],['su','别隔着你传话了。能谈的话，就坐下来谈。']],
 choices:{
  A:{label:'许川，还是按约定明天搬吧。我帮你收拾。',reply:[['xu','……好，我知道了。'],['lin','我不是想为难谁。只是不能一直没个期限。']]},
  B:{label:'许川先多住几天吧。林砚，我知道你不太能接受。',reply:[['lin','那原来说好的七天，算什么呢？'],['xu','谢谢。我先把东西往里挪，不挡路。']]},
  C:{label:'大家坐下来聊一次，把搬走的日期和这几天的安排说清楚。',reply:[['su','好，这次都把话说完。'],['lin','可以。但得有个具体日期。'],['xu','我会说清楚的。']]}
 }};
STORY_DAYS[7]={title:'到期之日',time:'早上',intro:'七天到了。阳光落进客厅。',eventPeople:['lin','su','chen','xu'],eventText:'七天到了',end:''};
DAY_PLACES[6]={lin:[624,400],su:[560,560],chen:[816,368],xu:[496,464]};
DAY_PLACES[7]={lin:[624,464],su:[560,560],chen:[688,528],xu:[496,464]};
DAY_OBSERVATIONS[6]={
 kitchen:['水杯','四只杯子分开放着。'],balcony:['晾衣架','衣服都收走了，只剩几个衣架。'],bathroom:['洗手台','发圈没有再出现。'],dining:['收在一起的碎纸','纸条堆在桌角，没人再把它贴回去。']
};
DAY_OBSERVATIONS[7]={
 sofa:['沙发边','许川把毯子折好了。'],kitchen:['早餐','面包摆在桌上，袋口还敞着。'],balcony:['阳光','今天出了太阳。'],bathroom:['洗手台','镜子上没有水汽。'],dining:['桌角的碎纸','纸已经皱了。']
};
DAY_CHAT[6]={lin:'书我收回房间了。今天看不进去。',su:'我不想每天出房门都得先听听外面有没有在吵。',chen:'朋友已经走了。拍到屋里的那几段，我删了。',xu:'箱子借到了，就是还不知道往哪儿搬。'};

function meetingLock(s=state){
 if(s.atmosphere===3)return '合租氛围：对立，大家暂时不愿坐下来谈。';
 const n=clueGroups(s);return n<5?'线索 '+n+'/5 组，还没了解齐大家的情况。':'';
}
function choiceLock(id,s=state){return s.day===6&&id==='C'?meetingLock(s):'';}
function endingFor(s=state){
 const calm=s.atmosphere<2;
 if(s.choices[6]==='C')return {
  id:'reconcile',title:'和解重约',summary:'许川自己提出再住三晚，随后搬走。夜里戴耳机，私人物品先问，访客和拍摄先征得大家同意。这次，每个人都开了口。',
  closing:'纸面的公约可以撕碎，人与人之间的理解，才是合租真正的规则。',
  lines:[['xu','工作没了以后，房租交完就没剩多少。我一直没好意思说。'],['lin','我最近在备考，失眠也去看过了。我只是想回家能睡个好觉。'],['chen','那发圈是我朋友的。我老想着拍点什么，忘了这是大家住的地方。'],['su','可以拍，但先问。别人说不，就别拍。'],['xu','再给我三晚吧。我去联系以前的同事，第四天搬。'],['lin','这个日期别再改了。夜里也安静点。'],['player','好。饮料先问，来客人提前商量。谁有难处，也早点说。'],['chen','行。早餐谁还没吃？我多买了。']]
 };
 if(s.choices[6]==='A')return calm?{
  id:'leave-calm',title:'守约散场',summary:'许川安静地收拾行李离开。沙发空了，大家照常出门，只是说话比刚来时少了。',closing:'约定落地，裂痕留在这间屋子里。',
  lines:[['xu','东西收好了，钥匙放桌上了。这几天谢谢你们。'],['player','路上慢点。到了说一声。'],['lin','……再见。']]
 }:{
  id:'leave-tense',title:'守约散场',summary:'争吵一直持续到门口。许川仓促离开，茶几下还剩一袋没带走的杂物。谁也没去收。',closing:'守住纸面约定，却失去所有人信任。',
  lines:[['xu','走就走，不用一直催。'],['lin','昨天说好了，今天怎么又要吵？'],['player','先别吵了。我帮你把箱子拿下去。'],['su','袋子还在桌子底下。……人已经走了。']]
 };
 return calm?{
  id:'stay-calm',title:'矛盾延续',summary:'许川留下了，主动收起东西、整理客厅。林砚没有再争，只把书带回了房间。',closing:'暂时平息争吵，但这场合租战争远没有结束。',
  lines:[['xu','谢谢你再让我住几天。我先把客厅收一下。'],['lin','我还是不同意。以后别把我不说话当答应。'],['player','我知道。搬走的日期，我们还得接着说。']]
 }:{
  id:'stay-tense',title:'矛盾延续',summary:'许川又把东西摊回客厅，不肯说什么时候搬。林砚看着乱掉的沙发，提出了退租。',closing:'留下许川，代价是失去一名租客。',
  lines:[['lin','沙发又堆满了。不是说往里收一点吗？'],['xu','反正还要住，我晚点再弄。'],['lin','算了。我退租，押金的事我们另外谈。'],['player','……好，我们找个时间说清楚。']]
 };
}
function finishFinale(){
 state.flags.finaleRead=true;state.eventStage='idle';state.activeTarget=null;state.phase='complete';save();showEnd();
}
function drawFinaleProps(g){
 if(state.day<6)return;
 // Luggage stays beside the sofa: Xu never has a private bedroom.
 const packed=state.atmosphere<2;
 round(g,524,478,27,34,packed?'#aa9879':'#c6b48e',5,'#706950');
 line(g,532,476,532,469,'#706950',2);line(g,532,469,542,469,'#706950',2);line(g,542,469,542,476,'#706950',2);
 if(!packed){round(g,511,498,19,9,'#9eaeb0',3);round(g,518,489,13,11,'#ddd2b8',3);}
 if(state.day===7){g.fillStyle='#ffe5a526';g.beginPath();g.moveTo(300,674);g.lineTo(545,674);g.lineTo(690,420);g.lineTo(490,420);g.fill();}
}

function visibleResidents(){
 return npcs.filter(a=>!(a.id==='xu'&&state.day===7&&state.choices[6]==='A'&&(state.flags.finaleRead||(state.atmosphere>=2&&state.dialogue?.after==='finale:done'&&state.dialogue.index>=3))));
}

// Each mood variant has its own user-supplied CG. Day-end screens use no CG.
function endingImage(id){return 'assets/cg/'+id+'.webp';}
function syncFinaleArt(){
 const active=mode==='play'&&state.day===7&&state.dialogue?.after==='finale:done';
 $('finale-art').hidden=!active;document.body.classList.toggle('showing-finale',active);
 if(active){const src=endingImage(endingFor().id);$('finale-image').src=src;$('finale-art').style.setProperty('--cg-image','url("'+src+'")');}
}
