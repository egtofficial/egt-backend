const { getMembers } = require('easyverein');
const { isMember, isActiveMember, collectMemberFacts, getMentionString } = require('.');
const { fetchGuild, fetchMember, postOrgaChannel } = require('./discord');

const refreshCache = async () => {
  console.log('[CRON] Refresh Cache');
  await fetchGuild();
}

const healthCheck = async () => {
  console.log('[CRON] Perform Health Check');
  try {
    const members = await getMembers('{id,contactDetails{firstName,familyName,companyName,dateOfBirth,age,privateEmail},email,membershipNumber,memberGroups{name,short},joinDate}');

    const peopleToCheck = members.filter(m => isMember(m))

    postOrgaChannel(`**Achtung**: Ich führe den **Mitglieder Health-Check** durch und schaue mir ${peopleToCheck.length} Mitglieder in unserer Vereinsverwaltung an…`);

    const withoutDiscordAccount = peopleToCheck.filter(m => !m.contactDetails.companyName);
    if (withoutDiscordAccount.length > 0) {
      postOrgaChannel(`
Von den folgenden **${withoutDiscordAccount.length} Mitgliedern** ist uns **kein Discord-Accountname** bekannt. 🤔  
  
> **${withoutDiscordAccount.map(m => `${m.contactDetails.firstName} ${m.contactDetails.familyName}`).join(', ')}**  
Kann da jemand unterstützen? Wir sollten diese Anzahl reduzieren.
`);
    }

    const activeTeams = await strapi.services['api::team.team'].find({ pagination: { page: 1, pageSize: 200 }, filters: { active: { $eq: true } }, sort: ['name:asc'] }, [])
    const inactiveTeams = await strapi.services['api::team.team'].find({ pagination: { page: 1, pageSize: 200 }, filters: { active: { $eq: false } }, sort: ['name:asc'] }, [])

    if (activeTeams.pagination.total > 0) {
      postOrgaChannel(`Für die Überprüfung, ob passive Mitglieder ein Teil eines aktiven Teams sind, werden folgende **derzeit aktive Teams** berücksichtigt:
> **${activeTeams.results.map(t => `[EGT] ${t.name}`).join(', ')}**  
Die folgenden Teams sind als **inaktiv** markiert und werden nicht berücksichtigt:
> **${inactiveTeams.results.map(t => `[EGT] ${t.name}`).join(', ')}**  
Ich bitte um zeitnahe Info, falls sich hier etwas geändert hat!`);
    }

    const withDiscordAccount = peopleToCheck.filter(m => m.contactDetails.companyName);

    const promises = withDiscordAccount.map(async m => {
      const isActive = isActiveMember(m);

      const dcMember = m.contactDetails.companyName ? await fetchMember(m.contactDetails.companyName) : undefined;

      if (!dcMember) {
        postOrgaChannel(`
🔎 Das ${isActive ? 'aktive' : 'passive'} Mitglied **${m.contactDetails.firstName} ${m.contactDetails.familyName}** konnte ich auf unserem Server nicht finden. 🤷  
Als Discord-Account ist \`${m.contactDetails.companyName}\` hinterlegt. Vielleicht hat das Mitglied den Account geändert oder den Server verlassen?`
        );
        return;
      }

      const facts = collectMemberFacts(
        m,
        dcMember,
        m.contactDetails.age + 1,
        undefined,
        activeTeams.results,
      )

      if (facts.error) {
        postOrgaChannel(`
💥 Fehler beim Sammeln der Mitgliederfakten von unserem ${isActive ? 'aktiven' : 'passiven'} Mitglied **${m.contactDetails.firstName} ${getMentionString(dcMember, m)} ${m.contactDetails.familyName}**.  
\`${facts.error}\`  
Für den Stacktrace bitte im Serverlog nachsehen.`);
        return;
      }

      if (!facts.discordRoles.memberRolesCorrect) {
        postOrgaChannel(`
⚠️ Die Mitgliedsrollen von unserem ${isActive ? 'aktiven' : 'passiven'} Mitglied **${m.contactDetails.firstName} ${getMentionString(dcMember, m)} ${m.contactDetails.familyName}** sind falsch. 🤦  
${facts.discordRoles.memberRoleMissing
            ? facts.discordRoles.missing.activeMember
              ? 'Bitte abgleichen. Auf jeden Fall **fehlt die Rolle** `Aktives Vereinsmitglied`.'
              : facts.discordRoles.missing.passiveMember
                ? 'Bitte abgleichen. Auf jeden Fall **fehlt die Rolle** `Passives Vereinsmitglied`.'
                : 'Bitte die Rollenzuweisung prüfen, irgendwas passt da nicht.'
            : 'Bitte die Rollenzuweisung prüfen, irgendwas passt da nicht.'
          }`
        );
        return;
      }

      if (facts.hasIllegalJobs) {
        const jobs = [
          ...(facts.isOrga ? ['Orga'] : []),
          ...(facts.isDepartmentManager ? ['Bereichsleitung'] : []),
          ...(facts.isPR ? ['PR-Team'] : []),
          ...(facts.isTeamManager ? ['Teamleitung'] : []),
          ...(facts.isTeamPlayer ? ['Teamspieler'] : []),
        ];
        postOrgaChannel(`
🚨 Das passive Mitglied **${m.contactDetails.firstName} ${getMentionString(dcMember, m)} ${m.contactDetails.familyName}** hat Rollen und Verantwortlichkeiten, die eine **aktive Mitgliedschaft erforderlich** machen:  
> **${jobs.join(', ')}**`);
      }
    })
    return Promise.all(promises).then(() => {
      postOrgaChannel(`
Alles erledigt. Sorry für den potenziellen Spam. ❤️`);
    });

  } catch (e) {
    console.error(e)
  }
}

module.exports = {
  refreshCache,
  healthCheck,
};
