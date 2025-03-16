import { PageInterfaceCompiled, PageListJsonInterface } from '../pageInterface';

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
        if (!acc[key] || acc[key].version !== cur.pages[key].version) {
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
    const res: PageListJsonInterface = JSON.parse(response.responseText);

    return res;
  }
}
