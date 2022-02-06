const { sample, words } = require('lodash')
const { genericFallbackReplies, genericHelloReplies, genericHelloWords, prefix } = require('./constants')
const info = require('./intents/info');
const facts = require('./intents/facts');
const { blue } = require('colors/safe');
const { wait } = require('../utils');


const processMessage = async (message) => {
  const messageString = message.content.substr(prefix.length);
  const cmd = words(messageString)[0].toLowerCase();
  const args = messageString.replace(cmd, '').trim() || '';
  console.log(blue(`Incoming command: ${cmd}`), args ? `=> ${args}` : '');

  if (genericHelloWords.includes(cmd.toLowerCase())) {
    message.channel.send((sample(genericHelloReplies)).replace('{username}', message.author.username));
    return;
  }

  if (['whoami', 'info'].includes(cmd))
    return info(message, args);

  if (['facts'].includes(cmd))
    return facts(message, args);

  // if (['post']) {
  //   const match = args.match(/^(\S+)\s(.*)/);
  //   if (match) {
  //     const parts = match.slice(1);
  //     return post(message, parts[0], parts[1]);
  //   }
  // }

  message.channel.send(sample(genericFallbackReplies));
  return wait(2000).then(() => {
    message.channel.send(`**Mögliche Befehle:**  
    \`\`\`  
    !egt whoami                  Zeigt deine EGT-Mitgliederinformationen an  
    !egt info  
    !egt info Discordtag#1234    Zeigt die Mitgliederinformationen der Person an  
                                 Zugriff auf die Mitgliederkartei notwendig.
    \`\`\``)
  })
}

module.exports = {
  processMessage,
}
