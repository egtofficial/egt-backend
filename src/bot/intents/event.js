const { formatDateTime, resolveAuthorAndFacts } = require('../../utils');
const { startOfDay, parse } = require('date-fns');
const { isNaN } = require('lodash');

const stringifyEvent = (event, withId) => `**${withId ? `#${event.id} ` : ''}${event.title}**: ${formatDateTime(event.begin)} _(${event.location})_`;

const listEvents = async (message, args) => {
  const withId = args.includes('ids')
  const events = await strapi.services['api::event.event'].find({
    pagination: { page: 1, pageSize: 200 },
    sort: ['begin:asc'],
    filters: {
      begin: {
        $gte: startOfDay(new Date()).toISOString()
      }
    },
  },
    [])

  if (events.pagination.total === 0) {
    message.channel.send(`Es gibt keine anstehenden Events. 😧`);
    return;
  }

  message.channel.send(`Die folgenden Events sind bereits geplant:  
  ${events.results.map(e => `> 🔹 ${stringifyEvent(e, withId)}`).join("\n")}`);
}

const createEvent = async (message, args) => {
  const { facts } = await resolveAuthorAndFacts(message);

  if (!facts.isOrga) {
    message.channel.send(`Nur Mitglieder der Orga dürfen ein Event erstellen. ☝️`);
    message.channel.send(`Du kannst mit \`!egt facts\` sehen, welche Fakten wir über dich berechnen und ob das evtl. ein Fehler ist.`);
    return;
  }

  try {
    const params = args.split(' ').splice(1).join(' ').split('|').map(i => i.trim())
    const event = await strapi.service('api::event.event').create({
      data: {
        title: params[0],
        begin: parse(params[1], 'dd.MM.yyyy HH:mm', new Date()).toISOString(),
        location: params[2],
      }
    });

    message.channel.send(`Das Event wurde erstellt:  
- ${stringifyEvent(event)}`);

  } catch (ex) {
    console.error(ex);
    message.channel.send(`Es gab einen Fehler: \`${ex.message}\``);
    message.channel.send(`Achte auf das korrekte Format: \`!egt create event Name | dd.mm.yyyy hh:mm | Ort\`,
also bspw. \`!egt create event Stammtisch | 14.05.2022 18:00 | Neckarmüller Tübingen\`.`);
  }
}

const deleteEvent = async (message, args) => {
  const { facts } = await resolveAuthorAndFacts(message);

  if (!facts.isOrga) {
    message.channel.send(`Nur Mitglieder der Orga dürfen ein Event löschen. ☝️`);
    message.channel.send(`Du kannst mit \`!egt facts\` sehen, welche Fakten wir über dich berechnen und ob das evtl. ein Fehler ist.`);
    return;
  }

  const params = args.split(' ').splice(1)

  if (isNaN(params[0])) {
    message.channel.send(`Bitte gib beim Löschen die ID des Events an, also bspw \`!egt delete 42\`. Die IDs der Events kannst du mit \`!egt list ids\` sehen.`);
    return;
  }

  const id = parseInt(params[0])
  if (!id) {
    message.channel.send(`Bitte gib beim Löschen die ID des Events an, also bspw \`!egt delete 42\`. Die IDs der Events kannst du mit \`!egt list ids\` sehen.`);
    return;
  }

  try {
    const result = await strapi.service('api::event.event').delete(id);
    if (result)
      message.channel.send(`Das Event ${stringifyEvent(result, true)} wurde gelöscht.`);
    else
      message.channel.send(`Es wurde kein Event mit der ID ${id} gefunden. Die IDs der Events kannst du mit \`!egt list ids\` sehen.`);
  } catch (ex) {
    console.error(ex);
    message.channel.send(`Es gab einen Fehler: \`${ex.message}\``);
    return;
  }

  return;
}

module.exports = {
  listEvents,
  createEvent,
  deleteEvent,
};
