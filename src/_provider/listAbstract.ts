import { Cache } from '../utils/Cache';
import { Progress } from '../utils/progress';
import * as definitions from './definitions';
import { emitter } from '../utils/emitter';

export interface listElement {
  uid: number;
  malId: number;
  cacheKey: any;
  type: 'anime' | 'manga';
  title: string;
  url: string;
  watchedEp: number;
  totalEp: number;
  status: number;
  score: number;
  image: string;
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

  protected abstract authenticationUrl: string;

  abstract readonly name;

  protected logger;

  public seperateRewatching = false;

  // Modes
  modes = {
    sortAiring: false,
    initProgress: false,
    cached: false,
  };

  constructor(
    protected status: number = 1,
    protected listType: 'anime' | 'manga' = 'anime',
    public callbacks: {
      singleCallback?: (el: listElement) => void;
      continueCall?;
    } = {},
    protected username: string = '',
    protected offset = 0,
    protected templist: listElement[] = [],
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

  isDone() {
    return this.done;
  }

  async get(): Promise<listElement[]> {
    let retList: listElement[] = [];
    do {
      retList = await this.getPart();

      if (typeof this.callbacks.singleCallback !== 'undefined') {
        // @ts-ignore
        if (!retList.length) this.callbacks.singleCallback(false, 0, 0);
        for (let i = 0; i < retList.length; i++) {
          // @ts-ignore
          this.callbacks.singleCallback(retList[i]);
        }
      }

      this.templist = this.templist.concat(retList);

      if (typeof this.callbacks.continueCall !== 'undefined') {
        if (this.modes.cached) this.getCache().setValue(this.templist.slice(0, 18));
        // @ts-ignore
        await this.callbacks.continueCall(this.templist);
      }
    } while (!this.done);

    if (this.modes.sortAiring) await this.sortAiringList();

    if (this.modes.cached) this.getCache().setValue(this.templist.slice(0, 18));

    if (typeof this.callbacks.continueCall !== 'undefined') this.callbacks.continueCall(this.templist);

    return this.templist;
  }

  async getCached(): Promise<listElement[]> {
    if (this.getCache().hasValue()) {
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

  abstract getUsername(): Promise<string> | string;

  abstract getPart(): Promise<listElement[]>;

  jsonParse(response) {
    if (response.responseText === '') {
      throw {
        code: 444,
        message: 'No Response',
      };
    }

    try {
      return JSON.parse(response.responseText);
    } catch (e) {
      throw {
        code: 406,
        message: 'Not Acceptable',
        error: e,
      };
    }
  }

  flashmError(error) {
    utils.flashm(this.errorMessage(error), { error: true, type: 'error' });
  }

  errorMessage(error) {
    if (typeof error.code === 'undefined') {
      return error;
    }

    switch (error.code) {
      case 400:
      case 401:
        return api.storage.lang('Error_Authenticate', [this.authenticationUrl]);
        break;
      default:
        return error.message;
        break;
    }
  }

  protected errorObj(code: definitions.errorCode, message): definitions.error {
    return {
      code,
      message,
    };
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

    emitter.on(`global.update.${item.cacheKey}`, (ignore, data) => {
      con.log('update', data);
      if (data.state) {
        item.watchedEp = data.state.episode;
        item.score = data.state.score;
        item.status = data.state.status;
      }
    });

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
    const normalItems: listElement[] = [];
    let preItems: listElement[] = [];
    let watchedItems: listElement[] = [];
    this.templist.forEach(item => {
      const prediction = item.fn.progress;
      if (prediction && prediction.isAiring() && prediction.getPredictionTimestamp()) {
        if (item.watchedEp < prediction.getCurrentEpisode()) {
          preItems.push(item);
        } else {
          watchedItems.push(item);
        }
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

  cacheObj: any = undefined;

  getCache() {
    if (this.cacheObj) return this.cacheObj;
    this.cacheObj = new Cache(`list/${this.name}/${this.listType}/${this.status}`, 48 * 60 * 60 * 1000);
    return this.cacheObj;
  }
}
