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
  ];

  for (let i = 0; i < wizards.length; i++) {
    const wizard = wizards[i];
    if (semverGt(wizard.version, lastVersion)) {
      logger.m(wizard.version).log(wizard.name);

      try {
        await wizard.action();
      } catch (error) {
        logger.m(wizard.name).error(error);
      }
    }
  }
}
