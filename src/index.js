'use strict';

const { setApiToken } = require('easyverein');
const { ensureRole } = require("./utils/roles");
const { client } = require('./utils/discord');
const { prefix } = require('./bot/constants')
const { processMessage } = require('./bot')

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    console.log('Bootstrapping EGT Backend...');

    let roles = await strapi.plugins['users-permissions'].services.role.getRoles();
    await ensureRole(roles, 'public');
    await ensureRole(roles, 'authenticated');

    setApiToken(process.env.EASYVEREIN_TOKEN);
    client.login(process.env.BOT_TOKEN);
    client.on('messageCreate', function (message) {
      if (message.author.bot) return;
      if (!message.content.startsWith(prefix)) return;
      processMessage(message);
    });
    console.log(`Bot listening started…`);

    setTimeout(async () => {
      await strapi.services['api::core.core'].refreshCache();
      // sendPrivateMessage('Cattus#6287', 'debug', 'Bot wurde gestartet.')
  
      // if (process.env.NODE_ENV === 'development') {
      //   await strapi.services['api::core.core'].healthCheck();
      //   await strapi.services['api::core.core'].sendBirthdayNotifications();
      //   await strapi.services['api::core.core'].remindBirthdayCard();
      // }
    }, 8000)
  },
};
