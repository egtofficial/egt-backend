egt-backend
==============

General backend for process automation and awesome features powered by [strapi](https://strapi.io/) using [discordjs](https://github.com/discordjs/discord.js) and [easyVerein](https://github.com/Fensterbank/easyverein).  
This node application will automate and handle different tasks in our daily org processes.  

Even if it's a Strapi CMS, we **yet** don't use any controllers or models, but we use mailing and provide a discord bot with it.  
Most likeley at some point this repo will replace [egt-vereinsbot](https://github.com/egtofficial/egt-vereinsbot) and all bot features will be included here powered by strapi models and database persistance.

## Installation

```bash
yarn install
```

## Running the app

```bash
# development
yarn development

# production mode
yarn start
```

# Hosting
## Dependencies
Node 14, MySQL or MariaDB.  
Best hosted with [pm2](https://pm2.keymetrics.io/)

```bash
npm install pm2@latest -g
npm install yarn -g
```

## Installation
```bash
yarn install

# Build Admin UI in production mode
NODE_ENV=production yarn build --clean
```

## Setting up database
First set up the database. The database settings and login will be passed as environment variables.

```bash
sudo mysql -u root

CREATE DATABASE egt_backend;
CREATE USER 'egt_backend'@'localhost' IDENTIFIED BY 'secure-password';
GRANT ALL PRIVILEGES ON egt_backend.* to 'egt_backend'@'localhost';
FLUSH PRIVILEGES;
```

## Setting up the ecosystem.config.js
The ecosystem file is a file gives pm2 all information about the hosted app.  
Update the database settings in `ecosystem.config.js` with the actual values and replace the secret keys by actual secret keys.  
You can get some secure keys [here](https://api.wordpress.org/secret-key/1.1/salt/) but any other secure password strings will do it too.  
You also need to pass the tokens for EasyVerein and the discord bot as environment variables.  
```javascript
env: {
  NODE_ENV: 'production',
  DATABASE_USERNAME: 'egt_backend',
  DATABASE_PASSWORD: 'secure-password',
  DATABASE_NAME: 'egt_backend',
  DATABASE_PORT: 3306,
  PORT: 3010,
  SECRET: 'secret-key',
  ADMIN_JWT_SECRET: 'another-secret-key',
  SMTP_HOST: 'mail.foo.tld',
  SMTP_USER: 'smtp-user',
  SMTP_PASS: 'smtp-password',
  ADMIN_MAIL: 'mail.egt.community',
  EASYVEREIN_TOKEN: 'your-easyverein-token',
  BOT_TOKEN: 'your-discord-bot-token',
  ORGA_CHANNEL: 'organisation', // the orga channel name to post some info messages
  GUILD_ID: '282148204999475201', // the ID of the discord server. We don't support multiple servers
},
```

## Setting up the webserver
The node process will run on a specific non-root accessible port, e.g. localhost:3010. This port is defined in the env variable section of the `ecosystem.config.js` file.  
To make the app accessible from the internet, it's the job of a webserver to provide a secure https connection and proxy all requests to the specific port.  

## Start and manage process with pm2
After you did the [installation](##Installation) and [configured the ecosystem file](##Setting-up-the-ecosystem.config.js), you can start the process with pm2.


```bash
pm2 start ecosystem.config.js
```

_You can always check the process with `pm2 status`, you can stop or start it with `pm2 start|stop|restart <processId>` and you can see the output of strapi with `pm2 log <processId>`.  
So if the app restarts too often or doesn't start properly, take a look at the log file, normally you'll find the reason there._

## Configure strapi
[Strapi](https://strapi.io/) is a headless cms coming with an admin interface to manage all things.  
When Strapi is first run, it will setup all database tables and will allow to set an admin user.  
Since this is possible for everyone, after running the process **you should hurry** to open the admin interface on e.g. https://api.domain.tld/admin and create your first admin user.  
