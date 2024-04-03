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
    required: permissionElement;
    player: permissionElement;
    pages: permissionElement[];
  };

  constructor() {
    this.permissionsObject = {
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

    this.permissionsObject.required.api = manifest.host_permissions;

    manifest.content_scripts!.forEach(page => {
      if (page.matches) {
        const obj: permissionElement = {
          match: page.matches,
          permission: ref('unknown'),
        };

        const script = page.js?.find(e => /^content\/page_/.test(e) || e.includes('iframe.js'));

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

        obj.name = script.replace('content/page_', '').replace('.js', '');

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

    await this.testPermissionElement(this.permissionsObject.required, permissions);
    await this.testPermissionElement(this.permissionsObject.player, permissions);
    await Promise.all(
      this.permissionsObject.pages.map(page => this.testPermissionElement(page, permissions)),
    );
  }

  protected async testPermissionElement(
    element: permissionElement,
    permissions: chrome.permissions.Permissions,
  ) {
    if (!element.match.every(permission => permissions.origins!.includes(permission))) {
      element.permission.value = 'denied';
      return;
    }

    if (element.api && !(await chrome.permissions.contains({ origins: element.api }))) {
      element.permission.value = 'denied';
      return;
    }

    element.permission.value = 'granted';
  }

  public requestPermissions() {
    alert('Requesting permissions');
  }
}
