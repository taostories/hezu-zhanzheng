'use strict';
const PEOPLE = {
 player:{name:'我',hair:'#493f39',bio:'住在这里的房东，自己的房间在最右边。'},
 lin:{name:'林砚',hair:'#2e373b',bio:'大四法学生，说话有条理，喜欢把约定说清楚。'},
 su:{name:'苏白',hair:'#c5cfcb',bio:'大三视觉传达学生，话少，喜欢安静。'},
 chen:{name:'陈灿',hair:'#d28b77',bio:'大二播音学生，热情，爱拍视频。'},
 xu:{name:'许川',hair:'#624a3b',bio:'做设计的朋友，借住七天，怕给人添麻烦。'}
};
const ATMOSPHERES=['和睦','微妙','紧绷','对立'];
const PACT=[
 '23:00后公共区域禁止喧哗',
 '私人物品标记名字，不可擅自动用',
 '公共区域使用后简单收拾',
 '访客、拍摄录像，需要提前告知所有人',
 '7日期满，许川搬离沙发'
];
const CLUES={departure:{title:'许川的离职证明',text:'许川说上一份工作刚结束，证明还要留着办手续。',group:'许川的生活困境',detail:'目前只知道他离职了，最近过得怎么样，还没聊到。'}};
// Only atmosphere is a relationship measure. Discovery flags never award points.
const INITIAL=()=>({version:10,flags:{},choices:{},eventStage:'idle',endRequested:false,actions:0,counted:[],spoken:[],activeTarget:null,bedRequested:false,duskTime:0,edition:'seven-day',day:1,phase:'explore',introStep:'guide',atmosphere:0,pact:'intact',signed:true,clues:[],visited:[],history:[],player:{x:624,y:368},npcs:null,elapsed:0});
const OBJECTS=[
 {id:'board',name:'公约板',x:656,y:336,hitX:672,hitY:304},
 {id:'sofa',name:'背包',x:464,y:452,hitX:468,hitY:411},
 {id:'fridge',name:'冰箱上的公约',x:1040,y:432,hitX:1072,hitY:410},
 {id:'kitchen',name:'外卖盒',x:912,y:400,hitX:933,hitY:383},
 {id:'balcony',name:'纸箱',x:400,y:620,hitX:352,hitY:624},
 {id:'bathroom',name:'洗手台',x:704,y:624,hitX:720,hitY:576},
 {id:'player-door',name:'自己的门',x:992,y:290,hitX:992,hitY:266}
];
const OBJECT_TIPS={board:'看看七日公约',sofa:'包边露出一张纸',fridge:'看看冰箱上的公约',kitchen:'外卖盒还没收',balcony:'谁的纸箱没拆？',bathroom:'看看新摆好的杯子','player-door':'看看自己的房间'};
const OBSERVATIONS={
 kitchen:{title:'晚饭留下的盒子',text:'筷子还架在盒沿，里面剩了两颗花生。陈灿说等视频传完就来收。'},
 balcony:{title:'还没拆的纸箱',text:'箱子上写着“画具，别压”。上头却放了一袋薯片。'},
 bathroom:{title:'刚收拾过',text:'镜子擦得很亮。五个漱口杯挨着摆好，最边上那个还是新的。'},
 'player-door':{title:'自己的房间',text:'床单铺好了，钥匙也找到了。今天总算没把什么落在旧住处。'}
};
const CHAT={lin:'公约贴上了？挺好，省得以后全靠记性。',su:'阳台那箱是我的。先放一晚，明天就拆。',chen:'刚想拍张合照。算了，等大家收拾好了再问。',xu:'沙发挺宽的。我包放边上，不挡你们走路。'};

const PLAYER_BED={id:'bed',name:'自己的床',x:1008,y:176,hitX:976,hitY:110};
