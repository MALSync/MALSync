import { Cache } from '../utils/Cache';
import { Progress } from '../utils/progress';
import { emitter } from '../utils/emitter';
import { errorMessage as _errorMessage } from './Errors';

Object.seal(emitter);

export interface listElement {
  uid: number;
  malId: number;
  apiCacheKey: number | string;
  cacheKey: any;
  type: 'anime' | 'manga';
  title: string;
  url: string;
  watchedEp: number;
  totalEp: number;
  status: number;
  score: number;
  image: string;
  imageLarge: string;
  imageBanner?: string;
  tags: string;
  airingState: number;
  fn: {
    continueUrl: () => string;
    initProgress: () => void;
    progress: false | Progress;
  };
  options?: {
    u: string;
    r: any;
    c: any;
    p: any;
  };
}

export abstract class ListAbstract {
  protected done = false;

  protected loading = false;

  protected firstLoaded = false;

  protected abstract authenticationUrl: string;

  abstract readonly name;

  protected logger;

  public seperateRewatching = false;

  // Modes
  modes = {
    frontend: false,
    sortAiring: false,
    initProgress: false,
    cached: false,
  };

  protected username = '';

  protected offset = 0;

  protected templist: listElement[] = [];

  constructor(
    protected status: number = 1,
    protected listType: 'anime' | 'manga' = 'anime',
    protected sort: string = 'default',
  ) {
    this.status = Number(this.status);
    this.logger = con.m('[S]', '#348fff');
    return this;
  }

  public api = api;

  public setTemplist(list) {
    this.templist = list;
    return this;
  }

  public getTemplist() {
    return this.templist;
  }

  public setSort(sort) {
    if (this.firstLoaded || this.loading) throw 'To late to change sort';
    this.sort = sort;
  }

  isDone() {
    return this.done;
  }

  isLoading() {
    return this.loading;
  }

  isFirstLoaded() {
    return this.firstLoaded;
  }

  async getCompleteList(): Promise<listElement[]> {
    do {
      // eslint-disable-next-line no-await-in-loop
      await this.getNext();
    } while (!this.done);

    if (this.modes.sortAiring) await this.sortAiringList();

    if (this.modes.cached) this.getCache().setValue(this.templist.slice(0, 18));

    this.firstLoaded = true;

    return this.templist;
  }

  async getNextPage(): Promise<listElement[]> {
    if (this.done) return this.templist;

    if (
      this.modes.frontend &&
      this.status === 1 &&
      (this.sort === 'default' || this.sort === 'unread')
    ) {
      this.modes.sortAiring = true;
      return this.getCompleteList();
    }

    await this.getNext();

    if (this.modes.cached) this.getCache().setValue(this.templist.slice(0, 24));

    this.firstLoaded = true;

    return this.templist;
  }

  private async getNext() {
    this.loading = true;
    const retList = await this.getPart();
    this.templist = this.templist.concat(retList);
    this.loading = false;
  }

  async getCached(): Promise<listElement[]> {
    if (await this.getCache().hasValue()) {
      const cachelist = await this.getCache().getValue();
      cachelist.forEach(item => {
        item = this.fn(item);
        item.watchedEp = '';
        item.score = '';
      });
      return cachelist;
    }
    return [];
  }

  protected updateListener;

  public initFrontendMode() {
    this.modes.frontend = true;
    this.updateListener = emitter.on(
      'update.*',
      data => {
        con.log('update', data);
        if (data.cacheKey) {
          const item = this.templist.find(el => el.cacheKey === data.cacheKey);
          con.log(item);
          if (item && data.state) {
            item.watchedEp = data.state.episode;
            item.score = data.state.score;
            item.status = data.state.status;
          }
        }
      },
      { objectify: true },
    );
  }

  public destroy() {
    if (this.updateListener) {
      this.updateListener.off();
    }
  }

  public getUsername() {
    return this.getUserObject().then(user => user.username);
  }

  abstract getUserObject(): Promise<{ username: string; picture: string; href: string }>;

  abstract _getSortingOptions(): { icon: string; title: string; value: string; asc?: boolean }[];

  getSortingOptions(
    simple = false,
  ): { icon: string; title: string; value: string; asc?: boolean }[] {
    const res = [
      {
        icon: 'filter_list',
        title: api.storage.lang('settings_progress_default'),
        value: 'default',
      },
    ];

    if (this.status === 1 && this.listType === 'manga') {
      res.push({
        icon: 'adjust',
        title: api.storage.lang('list_sorting_unread'),
        value: 'unread',
      });
    }

    const options = this._getSortingOptions();
    options.forEach(el => {
      if (!simple) {
        if (el.asc) {
          const asc = { ...el };
          delete asc.asc;
          asc.value += '_asc';
          asc.title += ' Ascending';
          res.push(asc);
        }
        delete el.asc;
      }
      res.push(el);
    });
    return res;
  }

  abstract getPart(): Promise<listElement[]>;

  flashmError(error) {
    utils.flashm(this.errorMessage(error), { error: true, type: 'error' });
  }

  errorMessage(error) {
    return _errorMessage(error, this.authenticationUrl);
  }

  // itemFunctions;
  async fn(item, streamurl = '') {
    let continueUrlTemp: any = null;
    item.fn = {
      continueUrl: () => {
        if (continueUrlTemp !== null) return continueUrlTemp;
        return utils.getContinueWaching(item.type, item.cacheKey).then(obj => {
          const curEp = parseInt(item.watchedEp.toString());

          if (obj === undefined || obj.ep !== curEp + 1) return '';

          continueUrlTemp = obj.url;

          return continueUrlTemp;
        });
      },
      initProgress: () => {
        return new Progress(item.cacheKey, item.type).init().then(progress => {
          item.fn.progress = progress;
        });
      },
      progress: false,
    };
    item.options = await utils.getEntrySettings(item.type, item.cacheKey, item.tags);
    if (streamurl) item.options.u = streamurl;
    if (this.modes.sortAiring || this.modes.initProgress) await item.fn.initProgress();

    return item;
  }

  // Modes
  async initProgress() {
    const listP: any = [];
    this.templist.forEach(item => {
      listP.push(item.fn.initProgress());
    });

    await Promise.all(listP);
  }

  async sortAiringList() {
    if (this.sort === 'unread') {
      this.sortUnread();
      return;
    }

    const normalItems: listElement[] = [];
    let preItems: listElement[] = [];
    let watchedItems: listElement[] = [];
    this.templist.forEach(item => {
      const prediction = item.fn.progress;
      if (this.listType === 'anime') {
        if (prediction && prediction.isAiring() && prediction.getPredictionTimestamp()) {
          if (item.watchedEp < prediction.getCurrentEpisode()) {
            preItems.push(item);
          } else {
            watchedItems.push(item);
          }
        } else {
          normalItems.push(item);
        }
      } else if (
        // Manga only if less than 5 chapters to read
        prediction &&
        prediction.isAiring() &&
        prediction.getCurrentEpisode() &&
        item.watchedEp &&
        item.watchedEp < prediction.getCurrentEpisode() &&
        item.watchedEp + 6 > prediction.getCurrentEpisode()
      ) {
        preItems.push(item);
      } else {
        normalItems.push(item);
      }
    });

    preItems = preItems.sort(sortItems).reverse();
    watchedItems = watchedItems.sort(sortItems);

    this.templist = preItems.concat(watchedItems, normalItems);

    function sortItems(a, b) {
      let valA = a.fn.progress.getPredictionTimestamp();
      let valB = b.fn.progress.getPredictionTimestamp();

      if (!valA) valA = 999999999999;
      if (!valB) valB = valA;

      return valA - valB;
    }
  }

  sortUnread() {
    this.templist = this.templist.sort(function (a, b) {
      let valA = 10000;
      let valB = 10000;

      if (a.fn.progress && a.fn.progress.getCurrentEpisode()) {
        const tempA = a.fn.progress.getCurrentEpisode() - a.watchedEp;
        if (tempA > 0) valA = tempA;
      }
      if (b.fn.progress && b.fn.progress.getCurrentEpisode()) {
        const tempB = b.fn.progress.getCurrentEpisode() - b.watchedEp;
        if (tempB > 0) valB = tempB;
      }

      return valA - valB;
    });
  }

  cacheObj: any = undefined;

  getCache() {
    if (this.cacheObj) return this.cacheObj;
    this.cacheObj = new Cache(
      `list/${this.name}/${this.listType}/${this.status}/${this.sort}`,
      48 * 60 * 60 * 1000,
    );
    return this.cacheObj;
  }
}
