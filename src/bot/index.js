const { sample, words } = require('lodash')
const { genericFallbackReplies, genericHelloReplies, genericHelloWords, prefix, genericThankWords, genericThankReplies } = require('./constants')
const info = require('./intents/info');
const facts = require('./intents/facts');
const { listEvents, createEvent, deleteEvent } = require('./intents/event');
const { blue } = require('colors/safe');
const { wait, logIncomingMessage } = require('../utils');
const { sendMessage } = require('../utils/discord');

const processMessage = async (message) => {
  const messageString = message.content.substr(prefix.length);
  const mWords = words(messageString);
  const cmd = words(messageString)[0].toLowerCase();
  const args = messageString.replace(cmd, '').trim() || '';
  console.log(blue(`Incoming command: ${cmd}`), args ? `=> ${args}` : '');

  logIncomingMessage(message)

  if (genericHelloWords.includes(cmd.toLowerCase())) {
    sendMessage(message.channel, message.author, 'generic-hello', sample(genericHelloReplies).replace('{username}', message.author.username))
    return;
  }

  if (genericThankWords.includes(cmd.toLowerCase())) {
    sendMessage(message.channel, message.author, 'generic-thanks', sample(genericThankReplies))
    return;
  }

  if (['whoami', 'info'].includes(cmd))
    return info(message, args);

  if (['facts'].includes(cmd))
    return facts(message, args);

  if (['event', 'list'].every(w => mWords.includes(w)) || ['events', 'list'].every(w => mWords.includes(w))) {
    return listEvents(message, args);
  }

  if (['event', 'create'].every(w => mWords.includes(w)) || ['events', 'create'].every(w => mWords.includes(w))) {
    return createEvent(message, args);
  }

  if (['event', 'delete'].every(w => mWords.includes(w)) || ['events', 'delete'].every(w => mWords.includes(w))) {
    return deleteEvent(message, args);
  }

  // if (['post']) {
  //   const match = args.match(/^(\S+)\s(.*)/);
  //   if (match) {
  //     const parts = match.slice(1);
  //     return post(message, parts[0], parts[1]);
  //   }
  // }

  sendMessage(message.channel, message.author, 'unknown-command', sample(genericFallbackReplies))
  return wait(2000).then(() => {
    sendMessage(message.channel, message.author, 'unknown-command', `**Mögliche Befehle:**  
    \`\`\`  
    !egt whoami                  Zeigt deine EGT-Mitgliederinformationen an  
    !egt info  
    !egt info Discordtag#1234    Zeigt die Mitgliederinformationen der Person an  
                                 Zugriff auf die Mitgliederkartei notwendig.
    !egt facts                   Zeigt alle "Vereinsfakten", die wir über dich und deine Mitgliedschaft berechnen.
    !egt facts Discordtag#1234   Zeigt alle "Vereinsfakten", die wir über die Person und ihre Mitgliedschaft berechnen.
                                 Zugriff auf die Mitgliederkartei notwendig.
    !egt list events             Zeigt alle anstehenden Aktionen an.
    \`\`\``)
  })
}

module.exports = {
  processMessage,
}
