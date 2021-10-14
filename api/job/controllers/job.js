'use strict';

const { healthCheck } = require('../../../utils/cron');

module.exports = {
  async find(ctx) {
    return ['healthcheck']
  },
  async healthcheck(ctx) {
    console.log('HealtHCeck')
    await healthCheck();
    return true;
  },
};
