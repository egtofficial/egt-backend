const { Client, Intents } = require('discord.js');
const { logOutgoingMessage } = require('.');

let dClient = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES],
  partials: [
    'CHANNEL', // Required to receive DMs
  ]
});

let orgaChannel;
let guild;

const fetchGuild = async () => {
  if (!process.env.GUILD_ID)
    throw new Error('env variable GUILD_ID not set.');

  guild = dClient.guilds.cache.get(process.env.GUILD_ID);

  if (!guild)
    throw new Error(`Guild with id »${process.env.GUILD_ID}« not found.`);
}

//const fetchMember = async (discordTag) => guild.members.search({ query: discordTag }) // Discord.js 13
const fetchMember = async (discordTag) => {
  // we cannot search by discord username, so let's try to resolve without discriminator
  const parts = discordTag.split('#');
  const members = await guild.members.search({ query: parts[0], limit: 1 })
  return members.first()
}

const fetchMemberById = (id) => guild.members.fetch(id);

const postOrgaChannel = (content, reason) => {
  if (process.env.SIMULATE_POSTS === 'true') {
    console.log(content)
    return
  }
  if (!orgaChannel) {
    if (!process.env.ORGA_CHANNEL)
      throw new Error('env variable ORGA_CHANNEL not set.')

    const channels = dClient.channels.cache;
    const found = channels.find((c) => c.type === 'GUILD_TEXT' && c.name === process.env.ORGA_CHANNEL)

    if (!found)
      throw new Error(`Orga channel »${process.env.ORGA_CHANNEL}« not found.`)

    orgaChannel = found;
  }

  sendMessage(orgaChannel, null, reason, content)
}

const postChannel = (channelName, content, reason) => {
  const channels = dClient.channels.cache;
  const channel = channels.find((c) => c.type === 'GUILD_TEXT' && c.name === channelName)
  if (!channel)
    throw new Error(`Channel »${channelName}« not found.`)

  sendMessage(channel, null, reason, content)
}

const sendPrivateMessageByUsername = async (discordUsername, reason, content) => {
  const dcMember = await fetchMember(discordUsername)
  if (!dcMember) {
    console.error(`Could not send private message to ${discordUsername}, user not found.`)
  }

  const message = await dcMember.send(content)
  logOutgoingMessage(message, dcMember.user, reason)
}

const sendPrivateMessage = async (dcMember, reason, content) => {
  const message = await dcMember.send(content)
  logOutgoingMessage(message, dcMember.user, reason)
}

const sendMessage = async (channel, recipient, reason, content) => {
  const message = await channel.send(content)
  logOutgoingMessage(message, recipient, reason)
  return message
}

module.exports = {
  client: dClient,
  guild,
  postOrgaChannel,
  fetchGuild,
  fetchMember,
  fetchMemberById,
  sendMessage,
  sendPrivateMessage,
  sendPrivateMessageByUsername,
  postChannel,
};
