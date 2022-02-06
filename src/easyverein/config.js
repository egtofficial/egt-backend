module.exports = {
  // internal IDs for membership types
  memberships: {
    'AM1M': {
      'discordRoleId': -1,
      'short': 'active',
      'roleName': 'Aktives Mitglied',
      'longName': 'Aktives Mitglied (Monatliche Zahlungsweise)',
      'description': 'aktives Mitglied mit monatlichen Beitragszahlungen',
    },
    'AM6M': {
      'discordRoleId': -1,
      'short': 'active',
      'roleName': 'Aktives Mitglied',
      'longName': 'Aktives Mitglied (Halbjährliche Zahlungsweise)',
      'description': 'aktives Mitglied mit halbjährlichen Beitragszahlungen',
    },
    'PM': {
      'discordRoleId': -1,
      'short': 'passive',
      'roleName': 'Passives Mitglied',
      'longName': 'Passives Mitglied',
      'description': 'passives Mitglied',
    },
    'EM': {
      'discordRoleId': -1,
      'short': 'former',
      'roleName': 'Ehemaliges Mitglied',
      'longName': 'Ehemaliges Mitglied',
      'description': 'ehemaliges Mitglied',
    },
  },
  // membership numbers of admins
  admins: ['1', '2', '16'],
}
