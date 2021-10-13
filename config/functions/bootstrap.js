'use strict';
const { setApiToken } = require('easyverein');
const { remindBirthdayCard, sendBirthdayNotifications } = require('../../utils/birthday');
const { refreshCache, healthCheck } = require('../../utils/cron');
const { client } = require('../../utils/discord');

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

module.exports = async () => {
  setApiToken(process.env.EASYVEREIN_TOKEN);
  client.login(process.env.BOT_TOKEN);
  setTimeout(async () => {
    await refreshCache();

    if (process.env.NODE_ENV === 'development') {
      await healthCheck();
      await sendBirthdayNotifications();
      await remindBirthdayCard();
    }
  }, 8000)
};
