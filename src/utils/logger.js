const { getDiscordTag } = require(".");
const { resolve } = require("../easyverein");

const logIncomingMessage = async (message, reason) => {
  const discordUserName = getDiscordTag(message.author)
  const member = await resolve(discordUserName, true);

  return strapi.service('api::message.message').create({
    data: {
      messageId: message.id,
      discordUserId: message.author.id,
      discordUserName,
      type: 'incoming',
      reason,
      content: message.content,
      channelId: message.channel.id,
      channelName: message.channel.name,
      ...(member ? {
        memberId: member.id,
        memberNumber: member.membershipNumber,
        memberFullName: `${member.contactDetails.firstName} ${member.contactDetails.familyName}`,
        memberMail: member.email,
      } : undefined)
    }
  });
}

const logOutgoingMessage = async (message, recipient, reason) => {
  const discordUserName = recipient ? getDiscordTag(recipient) : null
  const member = recipient ? await resolve(discordUserName, true) : null;

  return strapi.service('api::message.message').create({
    data: {
      messageId: message.id,
      discordUserId: recipient ? recipient.id : null,
      discordUserName,
      type: 'outgoing',
      reason,
      content: message.content,
      channelId: message.channel.id,
      channelName: message.channel.name,
      ...(member ? {
        memberId: member.id,
        memberNumber: member.membershipNumber,
        memberFullName: `${member.contactDetails.firstName} ${member.contactDetails.familyName}`,
        memberMail: member.email,
      } : undefined)
    }
  });
}

module.exports = {
  logIncomingMessage,
  logOutgoingMessage,
}