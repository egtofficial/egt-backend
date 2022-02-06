const { find, pick } = require('lodash');

const lang = 'en';

const enable = () => ({ enabled: true, policy: '' })
const disable = () => ({ enabled: false, policy: '' })


/**
 * Default users permissions for authenticated users
 */
 const defaultAuthenticatedUserPermissions = (permissions) => ({
  ...permissions['plugin::users-permissions'],
  controllers: {
    ...permissions['plugin::users-permissions'].controllers,
    auth: {
      ...permissions['plugin::users-permissions'].controllers.auth,
      connect: enable(),
    },
    user: {
      ...permissions['plugin::users-permissions'].controllers.user,
      update: enable(),
      me: enable(),
    },
  },
})

/**
 * Default users permissions for non-authenticated users
 */
const defaultUnauthicatedUserPermissions = (permissions) => ({
  ...permissions['plugin::users-permissions'],
  controllers: {
    ...permissions['plugin::users-permissions'].controllers,
    auth: {
      ...permissions['plugin::users-permissions'].controllers.auth,
      callback: enable(),
    },
    user: {
      ...permissions['plugin::users-permissions'].controllers.user,
      me: enable(),
    },
  },
})

const defaultStrapiActions = ['find', 'findOne', 'count', 'create', 'update', 'delete'];

/**
 * Allows a given set of actions on a specific controller
 * @param {the existing set of permissions} permissions 
 * @param {the controller name} controller 
 * @param {the actions to allow} actions 
 * @returns 
 */
const allow = (permissions, controller, actions) => {
  const set = {}
  actions.forEach(a => {
    set[a] = enable();
  })
  return {
    [`api::${controller}`]: {
      ...permissions[`api::${controller}`],
      controllers: {
        [controller]: {
          ...permissions[`api::${controller}`].controllers[controller],
          ...set,
        }
      }
    }
  }
};

const defaultPublicPermissions = (permissions) => ({
  ...permissions,
  'plugin::users-permissions': defaultUnauthicatedUserPermissions(permissions),
})

const defaultAuthenticatedPermissions = (permissions) => ({
  ...permissions,
  ...allow(permissions, 'team', defaultStrapiActions),
  'plugin::users-permissions': defaultAuthenticatedUserPermissions(permissions),
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

  const permissions = strapi.plugins['users-permissions'].services['users-permissions'].getActions();

  if (existing) {
    await strapi.plugins['users-permissions'].services.role.updateRole(existing.id, {
      ...pick(role, ['name', 'description']),
      permissions: role.permissionBuilder(permissions),
    });
  } else {
    await strapi.plugins['users-permissions'].services.role.createRole({
      ...pick(role, ['name', 'description']),
      permissions: role.permissionBuilder(permissions),
    });
  }
}

module.exports = {
  ensureRole
};
