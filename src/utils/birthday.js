const { attachPrimaryMail, hasBirthday, isMember, isActiveMember, hasSoonBirthday, getMentionString } = require('./index')
const { parseISO, format } = require('date-fns');
const { getMembers } = require('easyverein');
const { happyBirthdayActive, happyBirthdayPassive, replacePlaceholders } = require('./mailtemplates');
const { de } = require('date-fns/locale');
const { postOrgaChannel, fetchMember, sendPrivateMessage } = require('./discord');

const sendBirthdayNotifications = async () => {
  console.log('[CRON] sendBirthdayNotifications');
  try {
    const members = await getMembers('{id,contactDetails{firstName,familyName,companyName,dateOfBirth,age,privateEmail},email,membershipNumber,memberGroups{name,short},joinDate}');

    const birthdayPeople = members
      .filter(m => isMember(m) && hasBirthday(m)) // only members with todays birthday
      .map(m => attachPrimaryMail(m))
      .filter(m => m.primaryEmail) // only with email

    if (birthdayPeople.length === 0)
      return Promise.resolve();

    console.log(`Having birthday notifications for ${birthdayPeople.length} members…`)

    const promises = birthdayPeople.map(async m => {
      const dcMember = m.contactDetails.companyName ? await fetchMember(m.contactDetails.companyName) : undefined
      if (!dcMember)
        console.warn(`Could not resolve member »${m.contactDetails.companyName}« (${m.contactDetails.firstName} ${m.contactDetails.familyName})`)

      const isActive = isActiveMember(m)
      console.log(`Sending happy birthday to ${isActive ? 'active' : 'passive'} member ${m.primaryEmail}…`)

      const template = isActive ? happyBirthdayActive : happyBirthdayPassive
      const values = {
        name: m.contactDetails.firstName,
        membershipNumber: m.membershipNumber,
        joinDate: format(parseISO(m.joinDate), 'P', { locale: de }),
        age: m.contactDetails.age,
      }

      if (dcMember)
        sendPrivateMessage(dcMember, 'birthday-notification', replacePlaceholders(template.markdown, values))

      await strapi.plugins['email'].services.email.sendTemplatedEmail(
        {
          to: process.env.NODE_ENV === 'production' ? m.primaryEmail : 'fred@f-bit.software',
        },
        template,
        values,
      );

      console.log(`Notifying orga channel…`)
      postOrgaChannel(`
Das ${isActive ? 'aktive' : 'passive'} Mitglied **${m.contactDetails.firstName} ${getMentionString(dcMember, m)} ${m.contactDetails.familyName}** hat heute Geburtstag und wurde ${m.contactDetails.age} Jahre alt. 🥳   
Ich habe Geburtstagsglückwünsche per Discord-Privatnachricht und E-Mail geschickt. 💌
      `, 'birthday-notification');
    });

    return Promise.all(promises);

  } catch (e) {
    console.error(e)
  }
}

const remindBirthdayCard = async () => {
  console.log('[CRON] remindBirthdayCard');
  try {
    const members = await getMembers('{id,contactDetails{firstName,familyName,companyName,dateOfBirth,age,privateEmail},email,membershipNumber,memberGroups{name,short},joinDate}');

    const birthdayPeople = members
      .filter(m => isActiveMember(m) && hasSoonBirthday(m)) // only active members who have soon birthday
      .map(m => attachPrimaryMail(m))
      .filter(m => m.primaryEmail) // only with email

    if (birthdayPeople.length === 0)
      return Promise.resolve();

    console.log(`Having ${birthdayPeople.length} members which have soon birthday…`)

    const promises = birthdayPeople.map(async m => {
      const dcMember = m.contactDetails.companyName ? await fetchMember(m.contactDetails.companyName) : undefined
      if (!dcMember)
        console.warn(`Could not resolve member »${m.contactDetails.companyName}« (${m.contactDetails.firstName} ${m.contactDetails.familyName})`)

      console.log(`Send post card reminder for ${m.contactDetails.firstName} ${m.contactDetails.familyName} into orga channel…`)
      postOrgaChannel(`
Das aktive Mitglied **${m.contactDetails.firstName} ${getMentionString(dcMember, m)} ${m.contactDetails.familyName}** hat **in 3 Tagen Geburtstag** (${format(parseISO(m.contactDetails.dateOfBirth), 'dd. MMMM', { locale: de })}) und wird ${m.contactDetails.age + 1} Jahre alt. 🥳   
Es wäre cool, wenn jemand eine Postkarte vorbereiten und rechtzeitig wegschicken könnte.
      `, 'birthday-reminder')
    });

    return Promise.all(promises);

  } catch (e) {
    console.error(e)
  }
}

module.exports = {
  sendBirthdayNotifications,
  remindBirthdayCard,
};
