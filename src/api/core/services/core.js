'use strict';
const { postUpcomingEvents } = require('../../../bot/intents/event');
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
  },
  postUpcomingEvents() {
    return postUpcomingEvents();
  }
});
