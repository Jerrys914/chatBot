import express from 'express';
import path from 'path'
import router from './routes.js';
import dbHelper from './dbHelper.js';
import { getUserPublicMessages } from "./services/slack/slack-messages-service";
import { getChannelUsers } from "./services/slack/slack-user-service.js";
import Watson from './watson';
const app = express();
import { postMessage } from "./services/slack/slack-chat-service";
import { parseUserSentiment } from './services/misc/parse-user-sentiment-service';

require('./routes.js')(app);
getChannelUsers().then(users => {
  console.log('users', users)
}).catch(err => console.log(err));


getUserPublicMessages().then(result => {
  Watson.analyzeText(result.splice(0,1))
});

app.post('/add/user', function(req, res){
  dbHelper.addUser(req.body, res);
});

app.post('/add/channel', function(req, res){
  console.log('add/user');
  dbHelper.addChannel(req.body, res);
});

app.get('/get/users', function(req, res) {
  getChannelUsers()
  .then(res =>{
    console.log('res', res)
  });
})

const port = process.env.PORT || 3000;

app.listen(port,(err) => {
  console.log("Listening on port " + port);
});

// e.g. tone format
// const tones = [{user: 'U5BHVEU86',
//   tone: { emotion_tone:
//     { anger: 0.221577,
//       disgust: 0.31794,
//       fear: 0.078204,
//       joy: 0.025548,
//       sadness: 0.582408
//     },
//     language_tone:
//       { analytical: 0,
//         confident: 0,
//         tentative: 0.966403
//       },
//     social_tone:
//       { openness: 0.915827,
//         conscientiousness: 0.064387,
//         extraversion: 0.375757,
//         agreeableness: 0.579473,
//         emotional_range: 0.287825
//       }}}];

const sendMessages = (tones) => {
  tones.forEach(tone => {
    postMessage(tone.user, parseUserSentiment(tone))
  });
}
