//	nodemon app.js     https://horgeninc.slack.com/messages/CGTSY4CF3  dave.john UGVTCGLSJ info UHHBKMMLP 
//  npm config set proxy=http://127.0.0.1:8580   npm config list dave.john
// https://hooks.slack.com/services/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
var SlackBot = require('slackbots');
const axios = require('axios');
const token = 'xoxb-572493329154-576221432918-AyKpUGwCKSQqJ9RKYOTHLbfX';
var params = {cat:{icon_emoji: ':cat:'},
  mark:{icon_emoji: ':heavy_check_mark:'},
  list:{icon_emoji: ':scroll:'},
  bot:{icon_emoji: ':robot_face:'},
  x:{icon_emoji: ':x:'},
  valid:{icon_emoji: ':recycle:'},
  bye:{icon_emoji: ':curly_loop:'},
  bug:{icon_emoji: ':bug:'}};
var bot = new SlackBot({token: token,  name: 'imbot'});
bot.on('start', ()=>{
  //bot.postMessageToChannel('sales','horgeninc.com Online!', params['bot']);
});
getPresence = async (tk,id,name) => {
    let res = await axios.get('https://slack.com/api/users.getPresence?token='+tk+'&user='+id);
    let user = await res.data;
    console.log(name,JSON.stringify(user));
};
bot.getUsers().then( (users)=>{
  let members = users.members;
  for (i in members){
    if(!members[i].is_bot && members[i].name!='slackbot'){      
      getPresence(token,members[i].id,members[i].name)
        .catch(err => { console.log('Error: ',err)});
      console.log(members[i].id+'\t'+members[i].name+'\t'+members[i].is_bot);
    }
  }
});
//bot.getUser('dave.john').then((user)=>{
//  console.log('\ngetUser:\n '+JSON.stringify(user));
//});
bot.on('message', msg => {
  console.log('\nmessage:\n '+JSON.stringify(msg));
  if (msg.type !== 'message') {
    return;
  }
  if (msg.username !== 'imbot') {
    console.log('\neach:\n '+JSON.stringify(msg));
    bot.postMessage(msg.channel,msg.text, params['bot']);
    //bot.postMessageToUser('UGVTCGLSJ', 'meow!', params['cat']); 
  }
  console.log('\nbot.on func finest\n ');
});

