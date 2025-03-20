import { PageInterfaceCompiled, PageJsonInterface, PageListJsonInterface } from '../pageInterface';
import { greaterCurrentVersion } from '../../utils/version';

export class ChibiListRepository {
  private collections: string[];

  private pages: PageListJsonInterface['pages'] | null = null;

  constructor(collections: string[]) {
    this.collections = collections;
  }

  async init() {
    const pages = await Promise.all(this.collections.map(c => this.retrieveCollection(c)));
    this.pages = pages.reduce((acc, cur) => {
      Object.keys(cur.pages).forEach(key => {
        // Skip pages that require a higher version than current
        if (cur.pages[key].minimumVersion && greaterCurrentVersion(cur.pages[key].minimumVersion)) {
          return;
        }

        const newer =
          acc[key] &&
          acc[key].version.hash !== cur.pages[key].version.hash &&
          acc[key].version.timestamp < cur.pages[key].version.timestamp;

        if (!acc[key] || newer) {
          acc[key] = cur.pages[key];
        }
      });
      return acc;
    }, this.pages || {});
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
      `${page.root}/pages/${key}.json?version=${page.version}`,
    );
    const res: PageJsonInterface = JSON.parse(response.responseText);

    return res;
  }
}
