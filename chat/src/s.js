//	nodemon app.js     https://horgeninc.slack.com/messages/CGTSY4CF3    dave UGVTCGLSJ
//  npm config set proxy=http://127.0.0.1:8580   npm config list
var SlackBot = require('slackbots');
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;
server.listen(port, () => {console.log('Server listening at port %d', port);});
app.use(express.static(path.join(__dirname, './')));
var talks=[];
var params = {cat:{icon_emoji: ':cat:'},
  mark:{icon_emoji: ':heavy_check_mark:'},
  list:{icon_emoji: ':scroll:'},
  bot:{icon_emoji: ':robot_face:'},
  x:{icon_emoji: ':x:'},
  valid:{icon_emoji: ':recycle:'},
  bye:{icon_emoji: ':curly_loop:'},
  bug:{icon_emoji: ':bug:'}};
var bot = new SlackBot({token: 'xoxb-572493329154-576221432918-AyKpUGwCKSQqJ9RKYOTHLbfX',  name: 'guest'});
bot.on('start', ()=>{
  //bot.postMessageToChannel('sales','horgeninc.com Online!', params['bot']);
});
bot.on('message', msg => {
  if (msg.type !== 'message'|| msg.subtype) {
    return;
  }
  for (let u in talks){
    if((Date.now()-talks[u].ts)>1200000)  // 20 min 60×1000×20
      talks.splice(u,1);
  }
  //console.log('Clean talks list! '+msg.text);
  if (msg.text==='.list'|| msg.text==='.l'||  msg.text==='.L') {
    let str='ID\t\tClient\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tStatus\n';
    for(let u in talks){
      str=str+u+'\t\t'+talks[u].uid+'\t\t'+((talks[u].svid==='')?':bug:\n':':cat:\n');
    }
    bot.postMessage(msg.channel,str, params['list']);
    return;
  }
  if (msg.text.includes('.delete.')|| msg.text.includes('.d.')||  msg.text.includes('.D.')) {
    let idx=parseInt(msg.text.split('.')[2]);
    talks.splice(idx,1);
    let str='ID\t\tClient\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tStatus\n';
    for(let u in talks){
      str=str+u+'\t\t'+talks[u].uid+'\t\t'+((talks[u].svid==='')?':bug:\n':':cat:\n');
    }
    bot.postMessage(msg.channel,str, params['list']);
    return;
  }
  if(msg.text==='.cls.'|| msg.text==='.c.'||msg.text==='.C.'){
    talks=[];
    bot.postMessage(msg.channel,'All customer queues cleared ! :u7a7a:', params['list']);
    return;
  }
  for (let u in talks){
    if(talks[u].svid===msg.user){
      if (msg.text==='.bye.'|| msg.text==='.b.'||  msg.text==='.B.') 
      {
        talks[u].svid='';
        talks[u].chid='sales';
        bot.postMessage(msg.channel, 'Quit talk with:\n'+JSON.stringify(talks[u]), params['bye']);
        return;
      }
      if (msg.text.includes('.get.')|| msg.text.includes('.g.')|| msg.text.includes('.G.'))
      {
        bot.postMessage(msg.channel, 'You are talking with:\n'+JSON.stringify(talks[u])+'\n Please reply .bye. to quit first!', params['x']);
        return;
      }
      talks[u].chid=msg.channel;
      io.to(talks[u].skid).emit('new message',{user:(msg.username===bot.name)?"guest":"admin", msg: msg.text});
      return;
    }
  }
  if (msg.text.includes('.get.')|| msg.text.includes('.g.')|| msg.text.includes('.G.'))
  {
    let idx=parseInt(msg.text.split('.')[2]);
    if(idx>=talks.length || idx<0) return;
    if(talks[idx].svid===''){
      talks[idx].svid=msg.user;
      bot.postMessageToChannel('sales', JSON.stringify(talks[idx])+'\nReceived by: '+msg.user,  params['mark']);
    }else{
      bot.postMessage(msg.channel, JSON.stringify(talks[idx])+'\n already in a talking!',  params['x']);
    }
  }  
});

io.on('connection', (socket) => {
  let rip = socket.handshake.address||socket.handshake.headers ['X-FORWARDED-FOR'];
  socket.on('add user', (uid,user) => {
    for (let u in talks){
			if(talks[u].uid===uid){
        talks[u].user=user;
				talks[u].skid=socket.id;
        talks[u].ts=Date.now();
        if(talks[u].svid!==''){
          bot.postMessage(talks[u].chid, user+'\n'+rip, params['cat']);
        }else{
          bot.postMessageToChannel('sales',user+'\n'+rip+'\n:recycle: #'+u, params['bug']);
        }
        return;
			}      
		}
    let idx=talks.push({uid:uid,user:user+'\n'+rip,svid:'',chid:'sales',skid:socket.id,ts:Date.now()});
    bot.postMessageToChannel('sales',user+'\n'+rip+'\n:recycle: #'+(idx-1), params['bug']);
		//console.log('add user : '+user);
  });
	socket.on('new message', (uid,data) => {
    for (let u in talks){
			if(talks[u].uid===uid) {
        talks[u].ts=Date.now();
        talks[u].skid=socket.id;
        if(talks[u].svid!==''){
          bot.postMessage(talks[u].chid, data, params['cat']);
        }else{
          bot.postMessageToChannel('sales',talks[u].user+'\n'+data+'\n:recycle: #'+u, params['bug']);
        }
        return;
      }
		}
    let idx=talks.push({uid:uid,user:'None \t'+rip,svid:'',chid:'sales',skid:socket.id,ts:Date.now()});
    bot.postMessageToChannel('sales','None\n'+data+'\n:recycle: #'+(idx-1), params['bug']);
	});
	socket.on('re connect', (uid,user) => {//console.log('reconnect:');
    for (let u in talks){
			if(talks[u].uid===uid){
				talks[u].skid=socket.id;
        talks[u].ts=Date.now();
        return;
			}
		}
    let idx=talks.push({uid:uid,user:user+'\n'+rip,svid:'',chid:'sales',skid:socket.id,ts:Date.now()});
    bot.postMessageToChannel('sales',user+'\n'+rip+'\n:recycle: #'+(idx-1), params['bug']);
  });
  socket.on('disconnect', () => {
    for (let u in talks){
      if(talks[u].skid===socket.id) {        
        console.log(socket.id+' : quit.  '+talks[u].uid);
        talks.splice(u,1);
      }
    }
  });
});