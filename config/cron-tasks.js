// const { refreshCache } = require('../src/utils/cron');

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [SECOND (optional)] [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK]
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#cron-tasks
 */

module.exports = {
  /**
   * Send birthday notifications every day at 10:30
   */
  '30 10 * * *': ({ strapi }) => {
    strapi.services['api::core.core'].sendBirthdayNotifications();
  },
  /**
 * Remind for preparing birthday cards every day at 14:00
 */
  '0 14 * * *': ({ strapi }) => {
    strapi.services['api::core.core'].remindBirthdayCard();
  },
  /**
   * Perform member and discord health check every thursday at 11:15
  */
  '15 11 * * 4': ({ strapi }) => {
    strapi.services['api::core.core'].healthCheck();
  },
  /**
   * Refresh cashes every 30 minutes
   */
  '*/30 * * * *': ({ strapi }) => {
    strapi.services['api::core.core'].refreshCache()
  },
  /**
   * Post upcoming events every Sunday at 12:30
   */
  '30 12 * * 7': ({ strapi }) => {
    strapi.services['api::core.core'].postUpcomingEvents()
  },
};
