const { intersection } = require('lodash')
const { isSameDay, parseISO, setYear } = require('date-fns');

const attachPrimaryMail = (m) => ({
  ...m,
  primaryEmail: m.email.includes('@') ? m.email : m.contactDetails.privateEmail.includes('@') ? m.contactDetails.privateEmail : null
});

const hasBirthday = (member) => {
  if (!member.contactDetails)
    throw new Error(`property contactDetails missing.`);

  const today = new Date();
  return (isSameDay(setYear(parseISO(member.contactDetails.dateOfBirth), today.getFullYear()), new Date()))
}

const isMember = (member) => {
  if (!member.memberGroups || typeof(member.memberGroups) === 'string')
    throw new Error(`property memberGroups missing or not an object.`);

  return member.joinDate != null && member.memberGroups.length > 0;
}

const isActiveMember = (member) => {
  if (!member.memberGroups || typeof(member.memberGroups) === 'string')
    throw new Error(`property memberGroups missing or not an object.`);

  const flat = member.memberGroups.map(g => g.short);
  return intersection(flat, ['AM1M', 'AM6M']).length > 0
}

const isPassiveMember = (member) => {
  if (!member.memberGroups || typeof(member.memberGroups) === 'string')
    throw new Error(`property memberGroups missing or not an object.`);

  const flat = member.memberGroups.map(g => g.short);
  return flat.includes('PM');
}

module.exports = {
  attachPrimaryMail,
  hasBirthday,
  isMember,
  isActiveMember,
  isPassiveMember,
};
