import type { domainType } from 'src/background/customDomain';
import { PageJsonInterface, PageListJsonInterface } from '../pageInterface';
import { greaterCurrentVersion } from '../../utils/version';

type StorageInterface = {
  chibiPages: PageListJsonInterface['pages'];
  errors: Record<string, unknown>;
};

export class ChibiListRepository {
  private collections: string[];

  private pages: PageListJsonInterface['pages'] | null = null;

  private useCache: boolean;

  static getInstance(useCache = false) {
    let repos;
    if ((api.type as any) === 'userscript') {
      repos = ['https://chibi.malsync.moe/config'];
    } else {
      repos = [chrome.runtime.getURL('chibi'), 'https://chibi.malsync.moe/config'];
    }
    return new ChibiListRepository(repos, useCache);
  }

  constructor(collections: string[], useCache = false) {
    this.collections = collections;
    this.useCache = useCache;
  }

  async init() {
    const storageKey = `chibiPages-${api.storage.version()}`;
    const data: StorageInterface = ((await api.storage.get(
      storageKey,
    )) as StorageInterface | null) || { chibiPages: {}, errors: {} };

    if (this.useCache && data.chibiPages && Object.keys(data.chibiPages).length > 0) {
      this.pages = data.chibiPages;
      return this;
    }

    const errors = {};
    const collectionsData = (
      await Promise.all(
        this.collections.map(c =>
          this.retrieveCollection(c).catch(e => {
            errors[c] = e;
            return null as unknown as PageListJsonInterface;
          }),
        ),
      )
    ).filter(c => c);
    data.errors = errors;

    collectionsData.forEach(col => {
      Object.keys(col.pages).forEach(key => {
        // Skip pages that require a higher version than current
        if (col.pages[key].minimumVersion && greaterCurrentVersion(col.pages[key].minimumVersion)) {
          return;
        }

        const newer =
          data.chibiPages[key] &&
          data.chibiPages[key].version.hash !== col.pages[key].version.hash &&
          Number(data.chibiPages[key].version.timestamp) < Number(col.pages[key].version.timestamp);

        if (!data.chibiPages[key] || newer) {
          data.chibiPages[key] = col.pages[key];
        }
      });
    });

    await api.storage.set(storageKey, data);
    this.pages = data.chibiPages;

    return this;
  }

  async retrieveCollection(root: string) {
    const response = await api.request.xhr('GET', `${root}/list.json`);
    const res: PageListJsonInterface = JSON.parse(response.responseText);

    Object.keys(res.pages).forEach(key => {
      res.pages[key].root = root;
    });
    return res;
  }

  public getList() {
    if (!this.pages) {
      throw new Error('Pages not loaded');
    }
    return this.pages;
  }

  public async getPage(key: string) {
    if (!this.pages) {
      throw new Error('Pages not loaded');
    }
    const page = this.pages[key];
    if (!page) {
      throw new Error(`Page ${key} not found`);
    }

    const response = await api.request.xhr(
      'GET',
      `${page.root}/pages/${key}.json?version=${page.version.hash}`,
    );
    const res: PageJsonInterface = JSON.parse(response.responseText);

    return res;
  }

  public getPermissions(): domainType[] {
    const pages = this.getList();
    const permissions = Object.values(pages).map(page => {
      return page.urls.match.map(url => {
        return {
          page: `${page.name} (chibi)`,
          domain: url,
          auto: true,
          chibi: true,
        };
      });
    });
    return permissions.flat();
  }

  public getPermissionsElements() {
    const pages = this.getList();
    return Object.values(pages).map(page => {
      return {
        name: `${page.name} (chibi)`,
        match: page.urls.match,
      };
    });
  }
}
