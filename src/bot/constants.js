const prefix = '!egt';

const genericThankWords = ['danke', 'vielen dank', 'thx'];
const genericThankReplies = ['Gern geschehen.',
  'Bitteschön.',
  'Immer wieder gerne! ✌️',
  'Keine Ursache',
  'Das mache ich doch gern. 😉',
  'Bitte.',
  'Gerne.',
  'Nichts zu danken.',
  'Ich mach nur meinen Job… 😶',
];

const genericHelloWords = [ 'hi', 'hey', 'hallo', 'moin', 'huhu'];
const genericHelloReplies = [
  'Hi',
  'Hey {username} 👋',
  'Hallo!',
  'Moin {username} 😎',
];

const genericFallbackReplies = [
  'Sorry, ich verstehe nicht, was du von mir willst.',
  'Entschuldige, aber diesen Befehl verstehe ich nicht. 🧐',
  'Redest du mit mir? Das habe ich nicht verstanden. 🤦',
  'Ich habe keine Ahnung, was du von mir willst. 🤷‍♂️',
  'Bitte lies recherchier nochmal im Handbuch nach dem richtigen Befehl. 🤣'
];

module.exports = {
  prefix,
  genericThankWords,
  genericThankReplies,
  genericHelloWords,
  genericHelloReplies,
  genericFallbackReplies,
}
