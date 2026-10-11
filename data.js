'use strict';
// One authored day; event phases are separate from world movement and rendering.
const PEOPLE = {
 player:{name:'我',color:'#cd9c66',hair:'#493f39',bio:'住在这里的房东，和大家一起过日子。公共空间的事，大家商量着来。'},
 lin:{name:'林砚',color:'#536575',hair:'#2e373b',bio:'大四法学生，说话比较有条理，希望生活有明确约定。'},
 su:{name:'苏白',color:'#b6bec3',hair:'#c5cfcb',bio:'大三视觉传达学生，平时话不多，喜欢安静，不太习惯别人追着问。'},
 chen:{name:'陈灿',color:'#d98669',hair:'#d28b77',bio:'大二播音学生，性格挺热情，爱拍视频，一高兴就容易忘了先问别人。'},
 xu:{name:'许川',color:'#7e998b',hair:'#624a3b',bio:'以前做设计，最近刚失业。人挺好相处，就是总怕给别人添麻烦。'}
};
const BRANCHES = {
 A:{label:'今晚先住吧？住多久，明晚吃饭的时候再说。',delta:{lin:1,su:2,chen:-1,xu:1},nights:1,pending:true,review:'明晚饭后',relations:{chen_su:1},agreement:'先住今晚，明晚饭后一起商量后续期限。23:00 后安静，早上 8:00 前收好寝具、留出通道；拍到别人前先问本人。',reply:[['lin','行。明晚我七点回来，等我一起啊。'],['su','嗯，可以。我十一点睡，之后别太大声就好。'],['chen','可以。我待会儿收东西，沙发上乱的都是我的。'],['xu','行，谢谢。明天我出去看两间房。']]},
 B:{label:'先住三晚怎么样？不够的话，到时候大家再商量。',delta:{lin:2,su:-1,chen:0,xu:2},nights:3,pending:false,review:'第三晚饭后',relations:{lin_xu:1},agreement:'大家同意试住三晚，第三晚饭后重新讨论，不自动续住。23:00 后安静，早上 8:00 前收好寝具、留出通道；拍摄先问本人。',reply:[['lin','三晚可以。到时要是没找到房，再跟我们说。'],['su','可以，晚上安静就行。早上我会出来拿东西，别堵住路。'],['chen','行啊。沙发那箱子是我的，我收一下。'],['xu','好，那我能踏实睡一觉了。谢谢你们。']]},
 C:{label:'今天太晚了，先住一晚？剩下的明早九点再聊。',delta:{lin:-1,su:1,chen:0,xu:2},nights:1,pending:true,review:'明早 9:00',relations:{su_xu:1},agreement:'只同意今晚应急暂住，明早 9:00 讨论后续，不默认延长。23:00 后安静，早上 8:00 前收好寝具、留出通道；拍摄先问本人。',reply:[['lin','行，我九点有空。别太晚，我十点得出门。'],['su','今晚可以。我先说一下，我十一点睡。'],['chen','我也没问题。九点……行，我定个闹钟。'],['xu','好。我八点前把东西收好，你们走路方便。']]}
};
const CHECK_INS={
 lin:[['lin','我倒没意见。他打算住几天？我这周早课多，得早点睡。'],['player','他也还没找好房。我问问另外两个人，待会儿一起说。']],
 su:[['su','我就怕晚上吵。还有陈灿那个相机，别拍到我就行。'],['player','知道了，我跟他说。你几点睡？'],['su','十一点。拍背影也不行啊。'],['player','好，不拍。']],
 chen:[['chen','借住？行啊。哎，我刚想拍一下来着，还没问他呢。'],['player','先别拍了，他今天够累的。苏白也不想入镜。'],['chen','行，我收起来。沙发上还有我的箱子，待会儿一起搬？'],['player','好啊。']]
};
const PHASES=['explore','doorbell','listen','agree','prepare','rest','sleep','complete'];
const QUESTS={
 explore:['安顿一下','随便走走，认识一下这间公寓。','日常'],
 doorbell:['门铃响了','去左侧玄关看看是谁。靠近门口按 E。','突发事件'],
 listen:['先听听大家怎么想','找林砚、苏白和陈灿聊聊，顺序由你决定。','沙发客上门'],
 agree:['一起聊聊怎么住','到便签板那儿，把大家叫来聊聊。','一起协商'],
 prepare:['腾出今晚的位置','收好沙发上的设备箱，再把毯子铺好。','动手处理'],
 rest:['今晚有了着落','去沙发旁找许川，确认一切安顿好。','安顿好了'],
 sleep:['回屋歇会儿','灯关了，大家都回屋了。你也回最右边那间睡吧。','夜深了'],
 complete:['第一天结束','今晚的客厅，多了一盏灯。','完成']
};
const INITIAL=()=>({version:5,day:1,ledger:[],favors:[],actionDone:false,wrapDone:false,phase:'explore',player:{x:624,y:368},heard:[],choice:null,trust:{lin:0,su:0,chen:0,xu:0},relations:{},stay:null,boxMoved:false,blanket:false,history:[],elapsed:0,nightTime:0,sleepRequested:false,npcs:null});
