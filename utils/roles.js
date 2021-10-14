const { find, pick } = require('lodash');

const lang = 'en';

const enable = () => ({ enabled: true, policy: '' })
const disable = () => ({ enabled: false, policy: '' })

/**
 * Default users permissions for authenticated users
 */
const defaultAuthenticatedUserPermissions = (permissions) => ({
  ...permissions['users-permissions'],
  controllers: {
    ...permissions['users-permissions'].controllers,
    auth: {
      ...permissions['users-permissions'].controllers.auth,
      connect: enable(),
    },
    user: {
      ...permissions['users-permissions'].controllers.user,
      me: enable(),
    },
  },
})

/**
 * Default users permissions for non-authenticated users
 */
const defaultUnauthicatedUserPermissions = (permissions) => ({
  ...permissions['users-permissions'],
  controllers: {
    ...permissions['users-permissions'].controllers,
    auth: {
      ...permissions['users-permissions'].controllers.auth,
      callback: enable(),
    },
    user: {
      ...permissions['users-permissions'].controllers.user,
      me: enable(),
    },
  },
})

const defaultPublicPermissions = (permissions) => ({
  ...permissions,
  'application': {
    ...permissions['application'],
    controllers: {
      ...permissions['application'].controllers,
    },
  },
  'users-permissions': defaultUnauthicatedUserPermissions(permissions),
})

const defaultAuthenticatedPermissions = (permissions) => ({
  ...permissions,
  'application': {
    ...permissions['application'],
    controllers: {
      ...permissions['application'].controllers,
      job: {
        ...permissions['application'].controllers.job,
        find: enable(),
        healthcheck: enable(),
      },
    },
  },
  'users-permissions': defaultAuthenticatedUserPermissions(permissions),
})

const ROLES = {
  authenticated: {
    name: 'Authenticated',
    description: 'Default role given to authenticated user.',
    permissionBuilder: defaultAuthenticatedPermissions,
  },
  public: {
    name: 'Public',
    description: 'Default role given to unauthenticated user.',
    permissionBuilder: defaultPublicPermissions,
  }
}

const ensureRole = async (roles, key) => {
  console.log(`Ensure ${key}…`);
  const role = ROLES[key];
  if (!role)
    throw new Error(`Unknown role ${key}`);

  const existing = find(roles, { type: key })

  const plugins = await strapi.plugins[
    'users-permissions'
  ].services.userspermissions.getPlugins(lang);

  const permissions = await strapi.plugins[
    'users-permissions'
  ].services.userspermissions.getActions(plugins);

  if (existing) {
    await strapi.plugins['users-permissions'].services.userspermissions.updateRole(existing.id, {
      ...pick(role, ['name', 'description']),
      permissions: role.permissionBuilder(permissions),
    });
  } else {
    await strapi.plugins['users-permissions'].services.userspermissions.createRole({
      ...pick(role, ['name', 'description']),
      permissions: role.permissionBuilder(permissions),
    });
  }
}

module.exports = {
  ensureRole
};
