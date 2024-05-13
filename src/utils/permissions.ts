import { Ref, ref } from 'vue';

export type permissionType = 'granted' | 'denied' | 'unknown';

export type permissionElement = {
  name?: string;
  match: string[];
  api?: string[];
  permission: Ref<permissionType>;
};

export class PermissionsHandler {
  protected permissionsObject: {
    general: Ref<permissionType>;
    required: permissionElement;
    player: permissionElement;
    pages: permissionElement[];
  };

  constructor() {
    this.permissionsObject = {
      general: ref('unknown'),
      required: {
        match: [],
        api: [],
        permission: ref('unknown'),
      },
      player: {
        match: [],
        permission: ref('unknown'),
      },
      pages: [],
    };

    const manifest = chrome.runtime.getManifest();

    this.permissionsObject.required.api = manifest.host_permissions.filter(
      el => el !== '<all_urls>',
    );

    manifest.content_scripts!.forEach(page => {
      if (page.matches) {
        const obj: permissionElement = {
          match: page.matches,
          permission: ref('unknown'),
        };

        const script = page.js?.find(e => /content\/page_/.test(e) || e.includes('iframe.js'));

        if (!script) {
          this.permissionsObject.required.match = this.permissionsObject.required.match.concat(
            page.matches,
          );
          return;
        }

        if (script.includes('iframe.js')) {
          this.permissionsObject.player.match = this.permissionsObject.player.match.concat(
            page.matches,
          );
          return;
        }

        obj.name = script.replace(/^.*content\/page_/, '').replace('.js', '');

        this.permissionsObject!.pages.push(obj);
      }
    });
  }

  public getRequiredPermissions() {
    return this.permissionsObject.required;
  }

  public getPagesPermissions() {
    return this.permissionsObject.pages;
  }

  public getPlayerPermissions() {
    return this.permissionsObject.player;
  }

  public async checkPermissions() {
    const permissions = await chrome.permissions.getAll();

    const results = await Promise.all([
      this.testPermissionElement(this.permissionsObject.required, permissions),
      this.testPermissionElement(this.permissionsObject.player, permissions),
      ...this.permissionsObject.pages.map(page => this.testPermissionElement(page, permissions)),
    ]);

    if (results.includes('denied')) {
      this.permissionsObject.general.value = 'denied';
    } else {
      this.permissionsObject.general.value = 'granted';
    }
  }

  protected async testPermissionElement(
    element: permissionElement,
    permissions: chrome.permissions.Permissions,
  ): Promise<permissionType> {
    if (!element.match.every(permission => permissions.origins!.includes(permission))) {
      if (!(await chrome.permissions.contains({ origins: element.match }))) {
        element.permission.value = 'denied';
        return 'denied';
      }
    }

    if (element.api && !(await chrome.permissions.contains({ origins: element.api }))) {
      element.permission.value = 'denied';
      return 'denied';
    }

    element.permission.value = 'granted';
    return 'granted';
  }

  public async requestPermissions() {
    const permissions = {
      origins: this.permissionsObject.required.match,
    };

    if (this.permissionsObject.required.api) {
      permissions.origins = permissions.origins.concat(this.permissionsObject.required.api);
    }

    if (this.permissionsObject.player.match) {
      permissions.origins = permissions.origins.concat(this.permissionsObject.player.match);
    }

    if (this.permissionsObject.pages) {
      permissions.origins = permissions.origins.concat(
        this.permissionsObject.pages.flatMap(page => page.match),
      );
    }

    const granted = await chrome.permissions.request(permissions);

    await this.checkPermissions();

    return granted;
  }

  public hasAllPermissions() {
    return this.permissionsObject.general.value !== 'denied';
  }

  public hasRequiredPermissions() {
    return this.permissionsObject.required.permission.value !== 'denied';
  }

  public getRequiredState() {
    return this.permissionsObject.required.permission;
  }
}
