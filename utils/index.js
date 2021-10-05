const { intersection } = require('lodash')
const { isSameDay, parseISO, setYear, addDays } = require('date-fns');

const attachPrimaryMail = (m) => ({
  ...m,
  primaryEmail: m.email.includes('@') ? m.email : m.contactDetails.privateEmail.includes('@') ? m.contactDetails.privateEmail : null
});

const hasBirthday = (member) => {
  if (!member.contactDetails)
    throw new Error(`property contactDetails missing.`);

  const today = new Date();
  return (isSameDay(setYear(parseISO(member.contactDetails.dateOfBirth), today.getFullYear()), today))
}

const hasSoonBirthday = (member) => {
  if (!member.contactDetails)
    throw new Error(`property contactDetails missing.`);

  const today = new Date();
  return (isSameDay(setYear(parseISO(member.contactDetails.dateOfBirth), today.getFullYear()), addDays(today, 3)))
}

const isMember = (member) => {
  if (!member.memberGroups || typeof(member.memberGroups) === 'string')
    throw new Error(`property memberGroups missing or not an object.`);

  return member.joinDate != null && member.memberGroups.length > 0;
}

const hasDiscordUsername = (member) => 
  member.contactDetails.companyName != null && member.contactDetails.companyName.trim() !== ''

const getMentionString = (discordMember, easyvereinMember) => discordMember ? `<@${discordMember.user.id}>` : `»${easyvereinMember.contactDetails.companyName}«`;

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
  hasSoonBirthday,
  isMember,
  isActiveMember,
  isPassiveMember,
  hasDiscordUsername,
  getMentionString,
};
