module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '721cd3c08900a6f2f90c844135539962'),
    },
  },
  cron: {
    enabled: true,
  },
});
