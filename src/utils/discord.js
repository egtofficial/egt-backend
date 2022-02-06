const { Client, Intents } = require('discord.js');

let dClient = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES ]
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
  const members = await guild.members.fetch({ query: parts[0], limit: 1 })
  return members.first()
}

const postOrgaChannel = (content) => {
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

  orgaChannel.send(content);
}

module.exports = {
  client: dClient,
  guild,
  postOrgaChannel,
  fetchGuild,
  fetchMember,
};
