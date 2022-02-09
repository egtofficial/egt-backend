const { intersection, find, uniq } = require('lodash')
const { isSameDay, parseISO, setYear, addDays, differenceInMonths, differenceInYears, formatDistance, format, parseJSON } = require('date-fns');
const { getMemberships, resolve } = require('../easyverein/index');
const { de } = require('date-fns/locale');
const util = require('util');
const { fetchMemberById } = require('./discord');

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

const hasDiscordUsername = (member) =>
  member.contactDetails.companyName != null && member.contactDetails.companyName.trim() !== ''

const getMentionString = (discordMember, easyvereinMember) => discordMember ? `<@${discordMember.user.id}>` : `»${easyvereinMember.contactDetails.companyName}«`;

const isActiveMember = (member) => {
  if (!member.memberGroups || typeof (member.memberGroups) === 'string')
    throw new Error(`property memberGroups missing or not an object.`);

  const flat = member.memberGroups.map(g => g.short);
  return intersection(flat, ['AM1M', 'AM6M']).length > 0
}

const isPassiveMember = (member) => {
  if (!member.memberGroups || typeof (member.memberGroups) === 'string')
    throw new Error(`property memberGroups missing or not an object.`);

  const flat = member.memberGroups.map(g => g.short);
  return flat.includes('PM');
}

const isMember = (member) => {
  if (!member.memberGroups || typeof (member.memberGroups) === 'string')
    throw new Error(`property memberGroups missing or not an object.`);

  return member.joinDate != null && (isActiveMember(member) || isPassiveMember(member));
}

/**
 * Search discord role by name. To prevent managing IDs here, we use this approach
 */
const hasDiscordRole = (roles, roleName) => {
  const lcRoles = roles.map(r => r.toLowerCase());
  return lcRoles.includes(roleName.toLowerCase())
}

/**
 * Search discord role by part of string.
 */
const hasDiscordRoleMatch = (roles, searchText) => find(roles, (r) => r.toLowerCase().includes(searchText.toLowerCase())) != null

const hasActiveMemberDiscordRole = (discordMember) => {
  const roles = discordMember._roles.map(roleId => discordMember.guild.roles.cache.get(roleId).name)
  return hasDiscordRole(roles, 'Aktives Vereinsmitglied')
}

const hasPassiveMemberDiscordRole = (discordMember) => {
  const roles = discordMember._roles.map(roleId => discordMember.guild.roles.cache.get(roleId).name)
  return hasDiscordRole(roles, 'Passives Vereinsmitglied')
}

/**
 * Returns true if the roles contains an active team as player (Sub does not count as player)
 */
const getActiveTeamsPlaying = (roles, activeTeams) => {
  const playerInActiveTeams = activeTeams.map(t => {
    const found = find(roles, (r) => r === `[EGT] ${t.name}` && !r !== `[EGT] ${t.name}(Sub)`);
    return found ? t.name : null
  }).filter(i => i);
  return playerInActiveTeams;
}

/**
 * Get all teams, the person is part of (also as sub, which would not count as active player job)
 */
const getTeams = (roles) => {
  const leader = roles.filter(r => r.toLowerCase().includes('teamleitung'));
  const player = roles.filter(r => r.includes('[EGT]'));

  return uniq([
    ...leader.map(r => r.replace(/Teamleitung/ig, '').trim()),
    ...player.map(r => r.replace(/\[EGT\]/ig, '').replace(/\(Sub\)/ig, '').trim()),
  ]).sort();
}

/**
 * Calculate plenty of person facts for all needs
 * @param {*} member The easyVerein member
 * @param {*} discordMember The discord member
 * @param {*} birthdayAge The age the member will become on the next birthday
 * @param {*} referenceDate The reference date for all date calculations
 * @returns 
 */
const collectMemberFacts = (member, discordMember, birthdayAge, referenceDate = new Date(), activeTeams = []) => {
  try {
    const joinDate = parseISO(member.joinDate);
    const roles = discordMember ? discordMember._roles.map(roleId => discordMember.guild.roles.cache.get(roleId).name) : [];
  
    const isActive = isActiveMember(member);
    const isPassive = isPassiveMember(member);
    const hasPassiveMemberRole = discordMember ? hasPassiveMemberDiscordRole(discordMember) : false;
    const hasActiveMemberRole = discordMember ? hasActiveMemberDiscordRole(discordMember) : false;
  
    const playerInActiveTeams = getActiveTeamsPlaying(roles, activeTeams);
  
    const jobs = {
      isOrga: hasDiscordRole(roles, 'Orga'),
      isDepartmentManager: hasDiscordRoleMatch(roles, 'Bereichsleitung'),
      isPR: hasDiscordRole(roles, 'PR Team'),
      isTeamManager: hasDiscordRoleMatch(roles, 'Teamleitung'),
      isTeamPlayer: playerInActiveTeams.length > 0,
      isCaster: hasDiscordRole(roles, 'Caster')
    }
  
    return {
      discordNick: discordMember ? discordMember.nickname : null,
      isActive,
      isPassive,
      memberSinceInMonths: differenceInMonths(referenceDate, joinDate),
      memberSinceInYears: differenceInYears(referenceDate, joinDate),
      relativeMemberTime: formatDistance(joinDate, referenceDate, { locale: de }),
      membershipNoEqualsAge: parseInt(member.membershipNumber) === birthdayAge,
      membershipNoEqualsBirthDate: referenceDate.getDate() === birthdayAge,
      membershipNoEqualsBirthMonth: referenceDate.getMonth() + 1 === birthdayAge,
      discordRoles: {
        list: roles,
        memberRoleMissing: (isPassive && !hasPassiveMemberRole) || (isActive && !hasActiveMemberRole),
        memberRolesCorrect:
          (isPassive && hasPassiveMemberRole && !hasActiveMemberRole)
          || (isActive && hasActiveMemberRole && !hasPassiveMemberRole),
        activeMember: hasActiveMemberRole,
        passiveMember: hasPassiveMemberRole,
        missing: {
          activeMember: isActive && !hasActiveMemberRole,
          passiveMember: isPassive && !hasPassiveMemberRole,
        },
      },
      ...jobs,
      hasIllegalJobs: (!isActive && (jobs.isOrga || jobs.isDepartmentManager || jobs.isPR || jobs.isTeamManager || jobs.isTeamPlayer || jobs.isCaster)),
      teams: getTeams(roles),
      activeTeamsPlaying: playerInActiveTeams,
      // TODO: Let's make this configurable in the Strapi UI
      games: {
        aoe: hasDiscordRoleMatch(roles, 'Age of Empires'),
        animalCrossing: hasDiscordRole(roles, 'Animal Crossing'),
        counterStrike: hasDiscordRole(roles, 'Counter Strike'),
        fifa: hasDiscordRole(roles, 'FIFA'),
        hearthstone: hasDiscordRole(roles, 'Hearthstone'),
        lol: hasDiscordRole(roles, 'League of Legends'),
        lor: hasDiscordRole(roles, 'Legends of Runeterra'),
        monsterHunter: hasDiscordRole(roles, 'Monster Hunter'),
        overwatch: hasDiscordRole(roles, 'Overwatch'),
        pokemon: hasDiscordRole(roles, 'Pokemon'),
        rainbow6: hasDiscordRole(roles, 'Rainbow 6'),
        rocketLeague: hasDiscordRole(roles, 'Rocket League'),
        smashBros: hasDiscordRoleMatch(roles, 'Smash Bros'),
        starcraft: hasDiscordRoleMatch(roles, 'Starcraft'),
        tft: hasDiscordRole(roles, 'TFT'),
        valorant: hasDiscordRole(roles, 'Valorant'),
      }
    }
  } catch (ex) {
    console.error(`Error collecting member facts for ${member.contactDetails.firstName} ${member.contactDetails.familyName}.`, ex)
    return {
      error: ex.message
    };
  }
}

const formatDate = (date, f) => format(parseJSON(date), f || 'P', { locale: de })
const formatDateTime = (date, f) => format(parseJSON(date), f || 'P p', { locale: de })
const getDiscordTag = (user) => `${user.username}#${user.discriminator}`;
const wait = util.promisify(setTimeout);
const parseDiscordTag = (str) => {
  const matches = /[A-Z0-9\. |_\\/]+#[0-9]{4}/i.exec(str);
  return matches ? matches[0] : null;
}

const resolveAuthorAndFacts = async (message) => {
  const member = await resolve(getDiscordTag(message.author), true);
  const activeTeams = await strapi.services['api::team.team'].find({ pagination: { page: 1, pageSize: 200 }, filters: { active: { $eq: true } }, sort: ['name:asc'] }, [])
  const dcMember = await fetchMemberById(message.author.id);
  const facts = collectMemberFacts(
    member,
    dcMember,
    member.contactDetails.age + 1,
    undefined,
    activeTeams.results,
  )
  return {
    member,
    dcMember,
    facts,
  }
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
  collectMemberFacts,
  formatDate,
  formatDateTime,
  getDiscordTag,
  wait,
  parseDiscordTag,
  resolveAuthorAndFacts
};
