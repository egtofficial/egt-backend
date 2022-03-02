module.exports = ({ env }) => ({
  connection: {
    client: 'mysql',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 3306),
      database: env('DATABASE_NAME', 'egt_backend'),
      user: env('DATABASE_USERNAME', 'egt_backend'),
      password: env('DATABASE_PASSWORD', 'mdbdevpass'),
      ssl: env.bool('DATABASE_SSL', false),
    },
  },
});
