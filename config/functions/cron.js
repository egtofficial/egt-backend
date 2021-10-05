'use strict';
const { sendBirthdayNotifications, remindBirthdayCard } = require('../../utils/birthday');
const { refreshCache } = require('../../utils/cron');

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
  '30 10 * * *': () => {
    sendBirthdayNotifications();
  },
  /**
 * Remind for preparing birthday cards every day at 14:00
 */
  '0 14 * * *': () => {
    remindBirthdayCard();
  },
  /**
   * Refresh cashes every 30 minutes
   */
  '*/30 * * * *': () => {
    refreshCache();
  },
};
