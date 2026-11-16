import { ChibiListRepository } from '../pages-chibi/loader/ChibiListRepository';

export type permissionType = 'granted' | 'denied' | 'unknown';

type tempPermissionElement = {
  name?: string;
  match: string[];
  api?: string[];
};

export type permissionElement = tempPermissionElement & {
  permission: permissionType;
};

type permissionsCacheType = {
  key: string;
  result: {
    required: permissionElement;
    player: permissionElement;
    pages: permissionElement[];
    chibi: permissionElement[];
  };
};

export class PermissionsHandler {
  protected required!: permissionElement;

  protected player!: permissionElement;

  protected pages!: permissionElement[];

  protected chibi!: permissionElement[];

  public async init() {
    const manifest = chrome.runtime.getManifest();

    const required: tempPermissionElement = {
      name: 'required',
      match: [],
      api: manifest.host_permissions.filter(el => el !== '<all_urls>'),
    };

    const player: tempPermissionElement = {
      name: 'player',
      match: [],
      api: [],
    };

    const pages: tempPermissionElement[] = [];

    manifest.content_scripts!.forEach(page => {
      if (page.matches) {
        const obj: tempPermissionElement = {
          match: page.matches,
        };

        const script = page.js?.find(e => /content\/page_/.test(e) || e.includes('iframe.js'));

        if (!script) {
          required.match = required.match.concat(obj.match);
          return;
        }

        if (script.includes('iframe.js')) {
          player.match = player.match.concat(page.matches);
          return;
        }

        obj.name = script.replace(/^.*content\/page_/, '').replace('.js', '');

        pages.push(obj);
      }
    });

    let chibi: tempPermissionElement[] = [];
    try {
      const chibiRepo = await (await ChibiListRepository.getInstance()).init();
      chibi = chibiRepo.getPermissionsElements();
    } catch (e) {
      con.error('Failed to load chibi permissions', e);
    }

    const activePermissions = await chrome.permissions.getAll();

    // permissions.contains blocks the browser UI thread for up to ~250ms per call (#3866)
    const cacheKey = JSON.stringify([activePermissions.origins, required, player, pages, chibi]);
    const cache: permissionsCacheType | undefined = await chrome.storage.local
      .get('permissionsCache')
      .then(res => res.permissionsCache as permissionsCacheType)
      .catch(() => undefined);
    if (cache?.key === cacheKey) {
      ({
        required: this.required,
        player: this.player,
        pages: this.pages,
        chibi: this.chibi,
      } = cache.result);
      return this;
    }

    this.required = await this.testPermission(required, activePermissions);
    this.player = await this.testPermission(player, activePermissions);
    this.pages = await Promise.all(pages.map(page => this.testPermission(page, activePermissions)));
    this.chibi = await Promise.all(chibi.map(page => this.testPermission(page, activePermissions)));

    chrome.storage.local
      .set({
        permissionsCache: {
          key: cacheKey,
          result: {
            required: this.required,
            player: this.player,
            pages: this.pages,
            chibi: this.chibi,
          },
        },
      })
      .catch(() => {});

    return this;
  }

  public getRequiredPermissions() {
    return this.required;
  }

  public getPagesPermissions() {
    return this.pages;
  }

  public getChibiPermissions() {
    return this.chibi;
  }

  public getPlayerPermissions() {
    return this.player;
  }

  protected async testPermission(
    element: tempPermissionElement,
    permissions: chrome.permissions.Permissions,
  ): Promise<permissionElement> {
    if (!element.match.every(permission => permissions.origins!.includes(permission))) {
      if (
        element.match.length &&
        !(await chrome.permissions.contains({ origins: element.match }))
      ) {
        return {
          ...element,
          permission: 'denied',
        };
      }
    }

    if (element.api?.length && !(await chrome.permissions.contains({ origins: element.api }))) {
      return {
        ...element,
        permission: 'denied',
      };
    }

    return {
      ...element,
      permission: 'granted',
    };
  }

  public async requestPermissions() {
    const permissions = {
      origins: this.required.match,
    };

    if (this.required.api) {
      permissions.origins = permissions.origins.concat(this.required.api);
    }

    if (this.player.match) {
      permissions.origins = permissions.origins.concat(this.player.match);
    }

    if (this.pages) {
      permissions.origins = permissions.origins.concat(this.pages.flatMap(page => page.match));
    }

    if (this.chibi) {
      permissions.origins = permissions.origins.concat(this.chibi.flatMap(page => page.match));
    }

    const granted = await chrome.permissions.request(permissions);

    await this.init();

    return granted;
  }

  public hasAllPermissions() {
    return (
      this.required.permission !== 'denied' &&
      this.player.permission !== 'denied' &&
      this.pages.every(page => page.permission !== 'denied') &&
      this.chibi.every(page => page.permission !== 'denied')
    );
  }

  public hasRequiredPermissions() {
    return this.required.permission !== 'denied';
  }

  public hasMinimumPermissions() {
    return (
      this.required.permission !== 'denied' &&
      this.chibi.every(page => page.permission !== 'denied')
    );
  }
}
