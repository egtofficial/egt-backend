const { attachPrimaryMail, hasBirthday, isMember, isActiveMember } = require('./index')
const { isSameDay, parseISO, setYear, format } = require('date-fns');
const { getMembers } = require('easyverein');
const { happyBirthday, happyBirthdayActive, happyBirthdayPassive } = require('./mailtemplates');
const { de } = require('date-fns/locale');



const sendBirthdayNotifications = async () => {
  console.log('[CRON] sendBirthdayNotifications');
  try {
    const members = await getMembers('{id,contactDetails{firstName,dateOfBirth,age,privateEmail},email,membershipNumber,memberGroups{name,short},joinDate}');

    const birthdayPeople = members
      .filter(m => isMember(m) && hasBirthday(m)) // only members with todays birthday
      .map(m => attachPrimaryMail(m))
      .filter(m => m.primaryEmail) // only with email

    if (birthdayPeople.length === 0)
      return Promise.resolve();

    console.log(`Having birthday notifications for ${birthdayPeople.length} members…`)

    const promises = birthdayPeople.map(async m => {
      const isActive = isActiveMember(m)
      console.log(`Sending happy birthday to ${isActive ? 'active' : 'passive'} member ${m.primaryEmail}…`)
      await strapi.plugins['email'].services.email.sendTemplatedEmail(
        {
          to: process.env.NODE_ENV === 'production' ? m.primaryEmail : 'fred@f-bit.software',
        },
        isActive ? happyBirthdayActive : happyBirthdayPassive,
        {
          name: m.contactDetails.firstName,
          membershipNumber: m.membershipNumber,
          joinDate: format(parseISO(m.joinDate), 'P', { locale: de }),
          age: m.contactDetails.age,
        },
      );
    });

    return Promise.all(promises);

  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  sendBirthdayNotifications
}