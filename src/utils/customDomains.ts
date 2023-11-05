import { domainType } from '../background/customDomain';
import { hasDomainPermission } from './manifest';
import { greaterOrEqualCurrentVersion } from './version';
import { getPages } from './quicklinksBuilder';

export function getPageOptions() {
  const options = [{ key: 'iframe', title: 'Video Iframe' }];
  getPages().forEach(page => {
    options.push({
      key: page.key,
      title: page.name,
    });
  });
  return options;
}

export class MissingPermissions {
  options: { key: string; title: string }[];

  missingPermissions: {} = {};

  constructor() {
    this.options = getPageOptions();
  }

  async init() {
    return api.request.xhr('GET', 'https://api.malsync.moe/general/permissions').then(response => {
      const permissions: { [index: string]: { [index: string]: string[] } } = JSON.parse(
        response.responseText,
      );
      // Versions that are gte than the current version
      const versions = Object.keys(permissions)
        .filter(key => key !== 'ttl')
        .filter(key => greaterOrEqualCurrentVersion(key));

      const missingPermissions = versions.reduce((acc, version) => {
        for (const key in permissions[version]) {
          // check if key exists in options
          if (!this.options.some(option => option.key === key)) {
            continue;
          }

          if (acc[key]) {
            acc[key] = acc[key].concat(permissions[version][key]);
          } else {
            acc[key] = permissions[version][key];
          }
        }
        return acc;
      }, {});

      this.missingPermissions = missingPermissions;
    });
  }

  getMissingPermissions(currentCustomDomains: domainType[]) {
    const formated = this.getFormatedPermissions();

    console.log(currentCustomDomains);
    // check if already added or already in the manifest
    return formated
      .filter(perm => {
        return !currentCustomDomains.some(
          currentPerm => currentPerm.page === perm.page && currentPerm.domain === perm.domain,
        );
      })
      .filter(perm => !hasDomainPermission(perm.domain));
  }

  private getFormatedPermissions() {
    const formatted: domainType[] = [];

    for (const key in this.missingPermissions) {
      this.missingPermissions[key].forEach(perm => {
        formatted.push({
          page: key,
          domain: perm,
          auto: true,
        });
      });
    }

    return formatted;
  }
}

export async function hasMissingPermissions(): Promise<boolean> {
  if (api.type !== 'webextension') return false;
  const missingPermissions = new MissingPermissions();
  await missingPermissions.init();
  const missing = missingPermissions.getMissingPermissions(api.settings.get('customDomains'));
  con.m('Missing Permissions').log(missing);
  return Boolean(missing.length);
}

function getOrigins(permissions: domainType[]) {
  return permissions
    .filter(perm => {
      try {
        const url = new URL(perm.domain);
        return Boolean(url.origin);
      } catch (_) {
        return false;
      }
    })
    .map(perm => `${new URL(perm.domain).origin}/`);
}

export async function requestPermissions(permissions: domainType[]) {
  if (!sessionSupportsPermissions()) throw new Error('BadPermissionSession');
  return new Promise(resolve => {
    con.m('Request Permissions').log(getOrigins(permissions));
    chrome.permissions.request(
      {
        permissions: ['webNavigation'],
        origins: getOrigins(permissions),
      },
      granted => {
        if (!granted) utils.flashm('Requesting the permissions failed', { error: true });
        resolve(null);
      },
    );
  });
}

export function sessionSupportsPermissions() {
  return typeof chrome.permissions !== 'undefined';
}

export async function checkPermissions(permissions: domainType[]): Promise<boolean> {
  if (!sessionSupportsPermissions()) throw new Error('BadPermissionSession');
  return new Promise(resolve => {
    chrome.permissions.contains(
      {
        permissions: ['webNavigation'],
        origins: getOrigins(permissions),
      },
      result => {
        resolve(result);
      },
    );
  });
}
