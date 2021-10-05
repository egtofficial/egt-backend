const { fetchGuild } = require("./discord");

const refreshCache = async () => {
  console.log('[CRON] Refresh Cache');
  await fetchGuild();
}

module.exports = {
  refreshCache,
};
