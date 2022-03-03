const { getMemberships, resolve } = require('../../easyverein/index');
const { formatDate, getDiscordTag, parseDiscordTag, wait, collectMemberFacts, getMentionString } = require('../../utils');
const { green, red, yellow } = require('colors/safe');
const config = require('../../easyverein/config');
const { fetchMember, guild } = require('../../utils/discord');

const facts = async (message, name) => {
  console.log(`Incoming intend facts for target ${name || 'self'}…`);
  const authorDiscordTag = getDiscordTag(message.author);
  const memberDiscordTag = name ? parseDiscordTag(name) : null;
  const authorMember = await resolve(authorDiscordTag, true);
  const member = memberDiscordTag ? await resolve(memberDiscordTag) : null;

  if (name && !memberDiscordTag) {
    return wait(1000)
      .then(() => {
        sendMessage(message.channel, message.author, 'facts-show', `Der zweite Parameter sollte ein gültiger Discord-Tag sein. Also beispielsweise \`!egt info ${authorDiscordTag}\`.`);
        return wait(2000);
      })
  }

  if (!authorMember) {
    console.warn(red(`Could not resolve ${authorDiscordTag}.`));
    return wait(1000)
      .then(() => {
        sendMessage(message.channel, message.author, 'facts-show', `Hmmm…`);
        return wait(2000);
      })
      .then(() => {
        sendMessage(message.channel, message.author, 'facts-show', `Tut mir leid, ich kann dich in unseren Vereinsunterlagen nicht finden. 🤷‍♂️`);
        if (name)
          sendMessage(message.channel, message.author, 'facts-show', `Nur Personen mit Zugriff auf die Mitgliederkartei können mich nach anderen Leuten fragen. Und ich habe ehrlich gesagt keine Ahnung, wer du bist. 😅`);
        return wait(3000);
      })
      .then(() => {
        sendMessage(message.channel, message.author, 'facts-show', `Entweder bist du noch gar kein Mitglied (das sollten wir dann unbedingt ändern!) oder wir haben auf deiner Akte das Post-it mit deinem Discordtag \`${authorDiscordTag}\` vergessen. 🤔`);
        return wait(5000);
      })
      .then(() => {
        sendMessage(message.channel, message.author, 'facts-show', `Aber wenn du sicher bist, dass du Mitglied bei Elysium Gaming Tübingen e.V. bist, dann schreib doch einfach mal dem *Cattus | Fred*, der meldet sich dann bei mir und wir klären das alles ganz easy.`);
      });
  }

  const activeTeams = await strapi.services['api::team.team'].find({ pagination: { page: 1, pageSize: 200 }, filters: { active: { $eq: true } }, sort: ['name:asc'] }, [])

  if (name) {
    // Check if authorMember is Vorstand
    if (!config.admins.includes(authorMember.membershipNumber)) {
      console.warn(yellow(`Denied ${authorDiscordTag} to query for ${name}.`));
      return wait(1000)
        .then(() => {
          sendMessage(message.channel, message.author, 'facts-show', `Hmmm…`);
          return wait(2000);
        })
        .then(() => {
          sendMessage(message.channel, message.author, 'facts-show', `Tut mir leid, aber nur Personen mit Zugriff auf die Mitgliederkartei können mich nach der Identität von Leuten fragen. 😛`);
          return wait(3000);
        })
    }

    if (!member) {
      console.warn(red(`Could not resolve ${memberDiscordTag}.`));
      return wait(1000)
        .then(() => {
          sendMessage(message.channel, message.author, 'facts-show', `Hmmm…`);
          return wait(2000);
        })
        .then(() => {
          sendMessage(message.channel, message.author, 'facts-show', `Tut mir leid, ich kann **${memberDiscordTag}** in unseren Vereinsunterlagen nicht finden. 🤷‍♂️`);
          return wait(3000);
        })
        .then(() => {
          sendMessage(message.channel, message.author, 'facts-show', `Entweder er/sie ist noch gar kein Mitglied oder wir haben auf der Akte das Post-it mit dem Discordtag vergessen. 🤔`);
        });
    } else {
      console.log(green(`Successfully resolved ${member.contactDetails.companyName}.`));

      const dcMember = member.contactDetails.companyName ? await fetchMember(member.contactDetails.companyName) : undefined;
      let facts;
      if (dcMember) {
        facts = collectMemberFacts(
          member,
          dcMember,
          member.contactDetails.age + 1,
          undefined,
          activeTeams.results,
        )
      }

      sendMessage(message.channel, message.author, 'facts-show', `Es folgen alle unsere bekannten Fakten über ${getMentionString(dcMember, member)}:`);

      return wait(2000)
        .then(() => {
          if (facts) sendMessage(message.channel, message.author, 'facts-show', `\`\`\`  
${JSON.stringify(facts, null, 2)}
\`\`\``);
        })
    }
  }

  console.log(green(`Successfully resolved ${authorDiscordTag}.`));

  const dcMember = await guild.members.fetch(message.author.id);
  let facts;
  if (dcMember) {
    facts = collectMemberFacts(
      authorMember,
      dcMember,
      authorMember.contactDetails.age + 1,
      undefined,
      activeTeams.results,
    )
  }

  sendMessage(message.channel, message.author, 'facts-show', `Es folgen alle unsere bekannten Fakten über ${getMentionString(dcMember, member)}:`);

  return wait(2000)
    .then(() => {
      if (facts) sendMessage(message.channel, message.author, 'facts-show', `\`\`\`  
${JSON.stringify(facts, null, 2)}
\`\`\``);
    })
}

module.exports = facts;
