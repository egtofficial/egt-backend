'use strict';
const birthday = require('../../../utils/birthday');
const cron = require('../../../utils/cron');

/**
 * birthday service.
 */

module.exports = () => ({
  refreshCache() {
    return cron.refreshCache();
  },
  healthCheck() {
    return cron.healthCheck();
  },
  sendBirthdayNotifications() {
    return birthday.sendBirthdayNotifications();
  },
  remindBirthdayCard() {
    return birthday.remindBirthdayCard();
  }
});
