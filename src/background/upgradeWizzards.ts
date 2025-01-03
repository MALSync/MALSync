// eslint-disable-next-line import/no-extraneous-dependencies
import semverGt from 'semver/functions/gt';

export async function upgradewWizzards(lastVersion) {
  if (!lastVersion) throw 'No last Version';
  const logger = con.m('Wizzard');
  logger.log('Last version', lastVersion);

  const wizards = [
    {
      version: '0.7.8',
      name: 'Set existing users to tags on',
      action: () => {
        return api.storage.get('settings/malTags').then(res => {
          if (typeof res === 'undefined') {
            api.storage.set('settings/malTags', true);
          }
        });
      },
    },
    {
      version: '0.8.7',
      name: 'Disable updateCheck',
      action: () => {
        return api.storage.set('updateCheckTime', 0);
      },
    },
    {
      version: '0.8.8',
      name: 'Reset to normal Mal api',
      action: () => {
        return api.storage.get('settings/syncMode').then(res => {
          if (res === 'MALAPI') {
            api.storage.set('settings/syncMode', 'MAL');
          }
        });
      },
    },
    {
      version: '0.8.9',
      name: 'Disable updateCheck',
      action: () => {
        return api.storage.set('updateCheckTime', 0);
      },
    },
    {
      version: '0.8.12',
      name: 'Clean up sync storage',
      action: () => {
        return api.storage.list('sync').then(elements => {
          const garbage = Object.keys(elements).filter(el => !utils.syncRegex.test(el));
          logger.log('Delete', garbage);
          if (garbage.length) {
            chrome.storage.sync.remove(garbage);
          }
        });
      },
    },
    {
      version: '0.8.19',
      name: 'Split notification options',
      action: () => {
        return api.storage.get('settings/progressNotifications').then(res => {
          let mode = true;
          if (typeof res !== 'undefined' && res === false) mode = false;
          api.storage.set('settings/progressNotificationsAnime', mode);
          api.storage.set('settings/progressNotificationsManga', mode);
        });
      },
    },
    {
      version: '0.9.0',
      name: 'Migrate serial theme',
      action: () => {
        return api.storage.get('settings/theme').then(res => {
          if (typeof res !== 'undefined' && res === 'serial')
            api.storage.set('settings/theme', 'auto');
        });
      },
    },
    {
      version: '0.11.0',
      name: 'Disable background listsync',
      action: () => {
        return api.storage.remove('backgroundListSync');
      },
    },
    {
      version: '*',
      name: 'Remove auto domain permissions',
      action: () => {
        return api.settings.getAsync('customDomains').then(perms => {
          const filteredDomains = perms.filter(customDomain => !customDomain.auto);
          return api.settings.set('customDomains', filteredDomains);
        });
      },
    },
  ];

  for (let i = 0; i < wizards.length; i++) {
    const wizard = wizards[i];
    if (wizard.version === '*' || semverGt(wizard.version, lastVersion)) {
      logger.m(wizard.version).log(wizard.name);

      try {
        await wizard.action();
      } catch (error) {
        logger.m(wizard.name).error(error);
      }
    }
  }
}
