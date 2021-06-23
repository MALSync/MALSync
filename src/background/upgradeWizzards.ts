// eslint-disable-next-line import/no-extraneous-dependencies
import semverGt from 'semver/functions/gt';

export function upgradewWizzards(lastVersion) {
  if (!lastVersion) throw 'No last Version';

  con.m('Wizzard').log('Last version', lastVersion);

  const wizzards = [
    {
      version: '0.7.8',
      name: 'Set existing users to tags on',
      action: () => {
        api.storage.get('settings/malTags').then(res => {
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
        api.storage.set('updateCheckTime', 0);
      },
    },
    {
      version: '0.8.8',
      name: 'Reset to normal Mal api',
      action: () => {
        api.storage.get('settings/syncMode').then(res => {
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
        api.storage.set('updateCheckTime', 0);
      },
    },
  ];

  wizzards.forEach(wizard => {
    if (semverGt(wizard.version, lastVersion)) {
      con
        .m('Wizzard')
        .m(wizard.version)
        .log(wizard.name);

      try {
        wizard.action();
      } catch (error) {
        con
          .m('Wizzard')
          .m(wizard.name)
          .error(error);
      }
    }
  })
}
