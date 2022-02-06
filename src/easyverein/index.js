const { keyBy, find } = require('lodash');
const config = require('./config');
const { getMembers } = require('easyverein');

let membersMap = null;
let membersArr = null;

const resolve = async (discordTag, exact = false) => {
  if (!discordTag) return undefined;
  if (!membersMap) {
    membersArr = await getMembers(
      '{id,contactDetails{firstName,familyName,companyName,dateOfBirth,age,privateEmail},email,membershipNumber,memberGroups{name,short},joinDate}'
    );
    membersMap = new Map(Object.entries(keyBy(membersArr, (m) => m.contactDetails.companyName)));
  }
  return exact ? membersMap.get(discordTag) : find(membersArr, (m) => m.contactDetails.companyName.toLowerCase() === discordTag.toLowerCase());
}

const getMemberships = (member) =>
  member.memberGroups.map(g => (config).memberships[g.short]);

module.exports = {
  getMemberships,
  resolve
}
