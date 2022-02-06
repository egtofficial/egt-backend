module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '2a790f94439d0e26c2b836f3cc64f42b'),
  },
});
