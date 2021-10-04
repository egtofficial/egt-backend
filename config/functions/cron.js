'use strict';
const { sendBirthdayNotifications } = require('../../utils/birthday');

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
   * Send birthday notifications ebery day at 10:30
   */
   '30 10 * * *': () => {
    sendBirthdayNotifications();
  },
};
