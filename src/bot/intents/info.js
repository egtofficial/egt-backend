const { getMemberships, resolve } = require('../../easyverein/index');
const { formatDate, getDiscordTag, parseDiscordTag, wait, collectMemberFacts, getMentionString } = require('../../utils');
const { green, red, yellow } = require('colors/safe');
const config = require('../../easyverein/config');
const { fetchMember, guild } = require('../../utils/discord');

const info = async (message, name) => {
  console.log(`Incoming intend info for target ${name || 'self'}…`);
  const authorDiscordTag = getDiscordTag(message.author);
  const memberDiscordTag = name ? parseDiscordTag(name) : null;
  const authorMember = await resolve(authorDiscordTag, true);
  const member = memberDiscordTag ? await resolve(memberDiscordTag) : null;

  if (name && !memberDiscordTag) {
    return wait(1000)
      .then(() => {
        sendMessage(message.channel, message.author, 'info-show', `Der zweite Parameter sollte ein gültiger Discord-Tag sein. Also beispielsweise \`!egt info ${authorDiscordTag}\`.`);
        return wait(2000);
      })
  }

  if (!authorMember) {
    console.warn(red(`Could not resolve ${authorDiscordTag}.`));
    return wait(1000)
      .then(() => {
        sendMessage(message.channel, message.author, 'info-show', `Hmmm…`);
        return wait(2000);
      })
      .then(() => {
        sendMessage(message.channel, message.author, 'info-show', `Tut mir leid, ich kann dich in unseren Vereinsunterlagen nicht finden. 🤷‍♂️`);
        if (name)
          sendMessage(message.channel, message.author, 'info-show', `Nur Personen mit Zugriff auf die Mitgliederkartei können mich nach anderen Leuten fragen. Und ich habe ehrlich gesagt keine Ahnung, wer du bist. 😅`);
        return wait(3000);
      })
      .then(() => {
        sendMessage(message.channel, message.author, 'info-show', `Entweder bist du noch gar kein Mitglied (das sollten wir dann unbedingt ändern!) oder wir haben auf deiner Akte das Post-it mit deinem Discordtag \`${authorDiscordTag}\` vergessen. 🤔`);
        return wait(5000);
      })
      .then(() => {
        sendMessage(message.channel, message.author, 'info-show', `Aber wenn du sicher bist, dass du Mitglied bei Elysium Gaming Tübingen e.V. bist, dann schreib doch einfach mal dem *Cattus | Fred*, der meldet sich dann bei mir und wir klären das alles ganz easy.`);
      });
  }

  const activeTeams = await strapi.services['api::team.team'].find({ pagination: { page: 1, pageSize: 200 }, filters: { active: { $eq: true } }, sort: ['name:asc'] }, [])

  if (name) {
    // Check if authorMember is Vorstand
    if (!config.admins.includes(authorMember.membershipNumber)) {
      console.warn(yellow(`Denied ${authorDiscordTag} to query for ${name}.`));
      return wait(1000)
        .then(() => {
          sendMessage(message.channel, message.author, 'info-show', `Hmmm…`);
          return wait(2000);
        })
        .then(() => {
          sendMessage(message.channel, message.author, 'info-show', `Tut mir leid, aber nur Personen mit Zugriff auf die Mitgliederkartei können mich nach der Identität von Leuten fragen. 😛`);
          return wait(3000);
        })
    }

    if (!member) {
      console.warn(red(`Could not resolve ${memberDiscordTag}.`));
      return wait(1000)
        .then(() => {
          sendMessage(message.channel, message.author, 'info-show', `Hmmm…`);
          return wait(2000);
        })
        .then(() => {
          sendMessage(message.channel, message.author, 'info-show', `Tut mir leid, ich kann **${memberDiscordTag}** in unseren Vereinsunterlagen nicht finden. 🤷‍♂️`);
          return wait(3000);
        })
        .then(() => {
          sendMessage(message.channel, message.author, 'info-show', `Entweder er/sie ist noch gar kein Mitglied oder wir haben auf der Akte das Post-it mit dem Discordtag vergessen. 🤔`);
        });
    } else {
      console.log(green(`Successfully resolved ${member.contactDetails.companyName}.`));

      const dcMember = member.contactDetails.companyName ? await fetchMember(member.contactDetails.companyName) : undefined;
      // let facts;
      // if (dcMember) {
      //   facts = collectMemberFacts(
      //     member,
      //     dcMember,
      //     member.contactDetails.age + 1,
      //     undefined,
      //     activeTeams.results,
      //   )
      // }

      return wait(1000)
        .then(() => {
          sendMessage(message.channel, message.author, 'info-show', `Hinter ${getMentionString(dcMember, member)} steckt **${member.contactDetails.firstName} ${member.contactDetails.familyName}**.`);
          return wait(2000);
        })
        .then(() => {
          sendMessage(message.channel, message.author, 'info-show', `Die Mitgliedsnummer ist ${member.membershipNumber}.`);
          return wait(1500);
        })
        .then(() => {
          const membership = getMemberships(member)[0];
          if (!membership) {
            sendMessage(message.channel, message.author, 'info-show', `Das Mitglied ist seit dem ${formatDate(member.joinDate)} ein Mitglied, die Mitgliedsgruppe ist mir jedoch unbekannt. 🤷‍♂️`);
            return;
          }
          if (membership.short === 'former')
            sendMessage(message.channel, message.author, 'info-show', `Das Mitglied ist am ${formatDate(member.joinDate)} beigetreten, aber ist in der Zwischenzeit ein ${membership.description}. 😭`);
          else
            sendMessage(message.channel, message.author, 'info-show', `Das Mitglied ist seit dem ${formatDate(member.joinDate)} ein ${membership.description}. 🥳`);
        })
    }
  }

  console.log(green(`Successfully resolved ${authorDiscordTag}.`));

  const dcMember = await guild.members.fetch(message.author.id);
  // let facts;
  // if (dcMember) {
  //   facts = collectMemberFacts(
  //     authorMember,
  //     dcMember,
  //     authorMember.contactDetails.age + 1,
  //     undefined,
  //     activeTeams.results,
  //   )
  // }

  return wait(1000)
    .then(() => {
      sendMessage(message.channel, message.author, 'info-show', `Du bist ${getMentionString(dcMember, authorMember)}, aber dein echter Name ist **${authorMember.contactDetails.firstName} ${authorMember.contactDetails.familyName}**.`);
      return wait(2000);
    })
    .then(() => {
      sendMessage(message.channel, message.author, 'info-show', `Deine Mitgliedsnummer ist ${authorMember.membershipNumber}.`);
      return wait(1500);
    })
    .then(() => {
      const membership = getMemberships(authorMember)[0];
      if (!membership) {
        sendMessage(message.channel, message.author, 'info-show', `Du bist seit dem ${formatDate(authorMember.joinDate)} ein Mitglied. 🥳`);
        return wait(4000);
      }
      if (membership.short === 'former')
        sendMessage(message.channel, message.author, 'info-show', `Du bist am ${formatDate(authorMember.joinDate)} beigetreten, aber bist in der Zwischenzeit ein ${membership.description}. 😭`);
      else
        sendMessage(message.channel, message.author, 'info-show', `Du bist seit dem ${formatDate(authorMember.joinDate)} ein ${membership.description}. 🥳`);
      return wait(4000);
    })
    .then(() => {
      if (authorDiscordTag.includes('/') || authorDiscordTag.includes('|')) {
        sendMessage(message.channel, message.author, 'info-show', 
          `__**Kleiner Servicehinweis:**__   
Dein serverübergreifend öffentlich sichtbarer Discord-Username ist \`${message.author.username}\`, dein einzigartiger Discord-Tag ist \`${authorDiscordTag}\`.  
Ich gehe davon aus, dass es tatsächlich ein Versehen war, dass du nun deinen Vornamen in deinem öffentlichen Username hast. Keine Sorge, das ist hier vielen passiert… 🤦    
Du kannst über das Servermenü jederzeit deinen *innerhalb des EGT-Servers* sichtbaren Anzeigenamen ändern, ohne deinen globalen Username anzufassen.`);
      }
    })
}

module.exports = info;
