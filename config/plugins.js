module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        secure: env.bool('SMTP_SECURE', true),
        auth: {
          user: env('SMTP_USER', ''),
          pass: env('SMTP_PASS', ''),
        },
        tls: {
          rejectUnauthorized: env.bool('SMTP_VALIDATE_CERT', true),
        },
      },
      settings: {
        defaultFrom: 'noreply@egt.community',
        testAddress: 'fred@f-bit.software'
      },
    }
  }
});

