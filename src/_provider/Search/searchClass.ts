/*
  Only create instances of this class in tests. Please use vueSearchClass instead if used in code.
 */

import { compareTwoStrings } from 'string-similarity';

import { search as pageSearch } from '../searchFactory';
import { Single as LocalSingle } from '../Local/single';
import { getRulesCacheKey } from '../singleFactory';
import { RulesClass } from './rulesClass';

import { getSyncMode } from '../helper';

interface SearchResult {
  id?: number;
  url: string;
  offset: number;
  provider: 'firebase' | 'mal' | 'page' | 'user' | 'sync' | 'local';
  cache?: boolean;
  similarity: {
    same: boolean;
    value: number;
  };
}

export class SearchClass {
  private sanitizedTitel;

  private page;

  private syncPage;

  private localUrl = '';

  protected state: SearchResult | false = false;

  protected logger;

  changed = false;

  constructor(
    protected title: string,
    protected type: 'anime' | 'manga' | 'novel',
    protected identifier: string,
  ) {
    this.identifier += '';
    this.sanitizedTitel = this.sanitizeTitel(this.title);
    this.logger = con.m('search', 'red');
  }

  setPage(page) {
    this.page = page;
  }

  setLocalUrl(url: string) {
    this.localUrl = url;
  }

  setSyncPage(syncPage) {
    this.syncPage = syncPage;
  }

  getSyncPage() {
    return this.syncPage;
  }

  getUrl(): string | null {
    if (this.state) {
      return this.state.url;
    }
    return null;
  }

  setUrl(url, id = 0) {
    if (this.state) {
      if (this.state.url !== url) this.changed = true;
      this.state.provider = 'user';
      this.state.url = url;
      this.state.id = id;
      this.state.cache = false;
      this.state.similarity = {
        same: true,
        value: 1,
      };
    } else {
      this.changed = true;
      this.state = {
        id,
        url,
        offset: 0,
        provider: 'user',
        similarity: {
          same: true,
          value: 1,
        },
      };
    }

    this.setCache(this.state);
  }

  getOffset(): number {
    if (this.state) {
      return this.state.offset;
    }
    return 0;
  }

  setOffset(offset: number) {
    if (this.state) {
      if (this.state.offset !== offset) this.changed = true;
      this.state.offset = offset;
    }
    this.setCache(this.state);
  }

  async getCachedOffset(): Promise<number> {
    this.state = await this.getCache();
    if (this.state) {
      return this.state.offset;
    }
    return 0;
  }

  getId() {
    if (this.state && this.state.id) return this.state.id;
    return 0;
  }

  getSanitizedTitel() {
    return this.sanitizedTitel;
  }

  getNormalizedType() {
    if (this.type === 'anime') return 'anime';
    return 'manga';
  }

  public sanitizeTitel(title) {
    let resTitle = title.replace(
      / *(\(dub\)|\(sub\)|\(uncensored\)|\(uncut\)|\(subbed\)|\(dubbed\))/i,
      '',
    );
    resTitle = resTitle.replace(/ *\([^)]+audio\)/i, '');
    resTitle = resTitle.replace(/ BD( |$)/i, '');
    resTitle = resTitle.trim();
    resTitle = resTitle.substring(0, 99); // truncate
    return resTitle;
  }

  public async search() {
    this.state = await this.getCache();

    if (!this.state) {
      this.state = await this.searchLocal();
    }

    if (!this.state) {
      this.state = await this.searchForIt();
    }

    if (
      !this.state ||
      (this.state && !['user', 'firebase', 'sync', 'local'].includes(this.state.provider))
    ) {
      const tempRes = await this.onsiteSearch();
      if (tempRes) this.state = tempRes;
    }

    if (this.state) {
      await this.setCache(this.state);
    }

    this.logger.log('Result', this.state);

    return this.state;
  }

  protected async getCache() {
    return api.storage.get(`${this.page.name}/${this.identifier}/Search`).then(state => {
      if (state) state.cache = true;
      return state;
    });
  }

  protected setCache(cache) {
    cache = JSON.parse(JSON.stringify(cache));
    setTimeout(() => {
      this.databaseRequest();
    }, 200);
    return api.storage.set(`${this.page.name}/${this.identifier}/Search`, cache);
  }

  static similarity(externalTitle, title, titleArray: string[] = []) {
    let simi = compareTwoStrings(title.toLowerCase(), externalTitle.toLowerCase());
    titleArray.forEach(el => {
      if (el) {
        const tempSimi = compareTwoStrings(title.toLowerCase(), el.toLowerCase());
        if (tempSimi > simi) simi = tempSimi;
      }
    });
    let found = false;
    if (simi > 0.6) {
      found = true;
    }

    return {
      same: found,
      value: simi,
    };
  }

  public async searchLocal(): Promise<SearchResult | false> {
    if (!this.localUrl) return false;
    const local = new LocalSingle(this.localUrl);
    await local.update();
    if (!local.isOnList()) return false;
    this.logger.m('Local').log('On List');
    return {
      url: '',
      offset: 0,
      provider: 'local',
      similarity: {
        same: true,
        value: 1,
      },
    };
  }

  public async searchForIt(): Promise<SearchResult | false> {
    let result: SearchResult | false = false;

    try {
      result = searchCompare(result, await this.malSync());
    } catch (e) {
      if (this.page && this.page.database)
        this.logger.error('MALSync api error or not supported', e);
    }

    if ((result && result.provider !== 'firebase') || !result) {
      try {
        result = searchCompare(result, await this.malSearch());
      } catch (e) {
        this.logger.m(e);
      }
    }

    if ((result && result.provider !== 'firebase') || !result) {
      try {
        result = searchCompare(result, await this.pageSearch(), 0.5);
      } catch (e) {
        this.logger.m(e);
      }
    }

    if (
      result &&
      result.provider === 'firebase' &&
      api.settings.get('syncMode') !== 'MAL' &&
      !result.url
    ) {
      try {
        const temp = await this.pageSearch();
        if (temp && !utils.isDomainMatching(temp.url, 'myanimelist.net') && temp.similarity.same) {
          this.logger.log('Ignore Firebase', result);
          result = temp;
        }
      } catch (e) {
        this.logger.m(e);
      }
    }

    return result;

    function searchCompare(curVal, newVal, threshold = 0) {
      if (curVal !== false && newVal !== false && newVal.similarity.value > threshold) {
        if (curVal.similarity.value >= newVal.similarity.value) return curVal;
        return newVal;
      }
      if (curVal !== false) return curVal;
      return newVal;
    }
  }

  public async firebase(): Promise<SearchResult | false> {
    if (!this.page || !this.page.database) return false;

    const logger = this.logger.m('Firebase');

    const url = `https://kissanimelist.firebaseio.com/Data2/${
      this.page.database
    }/${encodeURIComponent(this.identifierToDbKey(this.identifier)).toLowerCase()}/Mal.json`;
    logger.log(url);
    const response = await api.request.xhr('GET', url);

    logger.log('response', response.responseText);
    if (
      !response.responseText ||
      response.responseText === 'null' ||
      response.responseText.includes('error')
    )
      return false;
    let matches;
    try {
      matches = JSON.parse(response.responseText);
    } catch (e) {
      logger.info('Parse failed');
      return false;
    }

    if (!matches || Object.keys(matches).length === 0) return false;

    const id = Object.keys(matches)[0];

    let returnUrl = '';

    if (id !== 'Not-Found') returnUrl = `https://myanimelist.net/${this.page.type}/${id}`;

    return {
      url: returnUrl,
      offset: 0,
      provider: 'firebase',
      similarity: {
        same: true,
        value: 1,
      },
    };
  }

  public async malSync(): Promise<SearchResult | false> {
    const logger = this.logger.m('API');

    if (!this.page) return false;
    const dbPl = this.page.database;
    if (!dbPl) return false;
    const url = `https://api.malsync.moe/page/${dbPl}/${encodeURIComponent(
      this.identifierToDbKey(this.identifier),
    ).toLowerCase()}`;
    logger.log(url);

    const response = await api.request.xhr('GET', url);
    logger.log('Response', response);

    if (response.status !== 400 && response.status !== 200) throw new Error('malsync offline');

    if (response.status === 400 && response.responseText?.includes('error')) return false;

    const res = JSON.parse(response.responseText);

    let pageUrl = res.malUrl;

    if (!pageUrl && res.aniUrl && getSyncMode(this.getNormalizedType()) === 'ANILIST') {
      pageUrl = res.aniUrl;
    }

    return {
      url: pageUrl,
      offset: 0,
      provider: 'firebase',
      similarity: {
        same: true,
        value: 1,
      },
    };
  }

  public async malSearch(): Promise<SearchResult | false> {
    const logger = this.logger.m('MAL');

    let url = `https://myanimelist.net/${this.getNormalizedType()}.php?q=${encodeURI(
      this.sanitizedTitel,
    )}`;
    if (this.type === 'novel') {
      url = `https://myanimelist.net/${this.getNormalizedType()}.php?type=2&q=${encodeURI(
        this.sanitizedTitel,
      )}`;
    }
    logger.log(url);

    function handleResult(response, i, This) {
      const link = getLink(response, i);
      let id = 0;
      let sim = { same: false, value: 0 };
      if (link !== false) {
        try {
          if (This.type === 'manga') {
            const typeCheck = response.responseText
              .split(`href="${link}" id="si`)[1]
              .split('</tr>')[0];
            if (typeCheck.indexOf('Novel') !== -1) {
              logger.log('Novel Found check next entry');
              return handleResult(response, i + 1, This);
            }
          }

          const malTitel = getTitle(response, link);
          sim = SearchClass.similarity(malTitel, This.sanitizedTitel);
          id = parseInt(link.split('/')[4]);
        } catch (e) {
          logger.error(e);
        }
      }

      return {
        id,
        url: link,
        offset: 0,
        provider: 'mal',
        similarity: sim,
      };
    }

    function getLink(response, i) {
      try {
        return response.responseText.split('<a class="hoverinfo_trigger" href="')[i].split('"')[0];
      } catch (e) {
        logger.error(e);
        try {
          return response.responseText
            .split('class="picSurround')
            [i].split('<a')[1]
            .split('href="')[1]
            .split('"')[0];
        } catch (e2) {
          logger.error(e2);
          return false;
        }
      }
    }

    function getTitle(response, link) {
      try {
        const id = link.split('/')[4];
        return response.responseText.split(`rel="#sinfo${id}"><strong>`)[1].split('<')[0];
      } catch (e) {
        logger.error(e);
        return '';
      }
    }

    const response = await api.request.xhr('GET', url);

    if (!response || response.responseText?.includes('  error ')) return false;
    if (!response || response.responseText?.includes('No titles that matched')) return false;

    return handleResult(response, 1, this);
  }

  public async pageSearch(): Promise<SearchResult | false> {
    const searchResult = await pageSearch(this.sanitizedTitel, this.getNormalizedType());
    let best: any = null;
    for (let i = 0; i < searchResult.length && i < 5; i++) {
      const el = searchResult[i];
      const sim = SearchClass.similarity(el.name, this.sanitizedTitel, el.altNames);
      const tempBest = {
        index: i,
        similarity: sim,
      };
      if (
        (this.type === 'manga' && !el.isNovel) ||
        (this.type === 'novel' && el.isNovel) ||
        this.type === 'anime'
      ) {
        if (!best || sim.value > best.similarity.value) {
          best = tempBest;
        }
      }
    }

    if (best) {
      const retEl = searchResult[best.index];
      const url = await retEl.malUrl();
      return {
        id: retEl.id,
        url: url || retEl.url,
        offset: 0,
        provider: 'page',
        similarity: best.similarity,
      };
    }

    return false;
  }

  public async databaseRequest() {
    const logger = this.logger.m('DB Request');
    if (this.page && this.page.database && this.syncPage && this.state) {
      if (this.state.cache) return;
      if (this.state.provider === 'user' && !this.changed) return;
      if (this.state.provider === 'firebase') return;
      if (this.state.provider === 'local') return;

      let kissurl;
      if (!kissurl) {
        if (this.page.isSyncPage(this.syncPage.url)) {
          kissurl = this.page.sync.getOverviewUrl(this.syncPage.url);
          if (this.page.database === 'Crunchyroll') {
            kissurl = `${this.syncPage.url}`;
          }
        } else {
          if (this.page.database === 'Crunchyroll') {
            logger.log('CR block');
            return;
          }
          kissurl = this.syncPage.url;
        }
      }
      const param: {
        pageUrl: string;
        malUrl: string;
        correction: boolean;
        page: string;
      } = {
        pageUrl: kissurl,
        malUrl: this.state.url,
        correction: false,
        page: this.page.database,
      };
      if (this.state.provider === 'user') {
        if (
          !(await utils.flashConfirm(
            api.storage.lang('correction_DBRequest'),
            'dbrequest',
            () => undefined,
            () => undefined,
            true,
          ))
        )
          return;
        param.correction = true;
      }

      const url = 'https://api.malsync.moe/corrections';
      api.request
        .xhr('POST', {
          url,
          data: JSON.stringify(param),
          headers: { 'Content-Type': 'application/json' },
        })
        .then(response => {
          try {
            const res = JSON.parse(response.responseText);
            if (res.error) throw res;
            logger.log('Send to database:', res);
          } catch (e) {
            logger.error('Send to database:', e);
          }
        });
    }
  }

  public async onsiteSearch(): Promise<false | SearchResult> {
    if (this.page && this.syncPage && this.syncPage.curState && this.syncPage.curState.on) {
      let result: false | string = false;
      if (this.syncPage.curState.on === 'OVERVIEW') {
        if (this.page.overview && this.page.overview.getMalUrl) {
          result = await this.page.overview.getMalUrl(api.settings.get('syncMode'));
        }
      } else if (this.page.sync && this.page.sync.getMalUrl) {
        result = await this.page.sync.getMalUrl(api.settings.get('syncMode'));
      }
      if (result) {
        this.logger.m('Onsite').log('[SEARCH]', 'Overwrite by onsite url', result);
        return {
          url: result,
          offset: 0,
          provider: 'sync',
          similarity: {
            same: true,
            value: 1,
          },
        };
      }
    }
    return false;
  }

  public openCorrection() {
    /* Implemented in vueSearchClass */
  }

  protected identifierToDbKey(title) {
    if (this.page.database === 'Crunchyroll') {
      return encodeURIComponent(title.toLowerCase().split('#')[0]).replace(/\./g, '%2E');
    }
    return title.toLowerCase().split('#')[0].replace(/\./g, '%2E');
  }

  // Rules
  rules: RulesClass | undefined;

  async initRules() {
    const logger = con.m('Rules');
    const url = this.getUrl();
    logger.log('Url', url);
    if (url) {
      const cacheKeyObj = await getRulesCacheKey(url);
      logger.log('Cachekey', cacheKeyObj);
      this.rules = await new RulesClass(cacheKeyObj.rulesCacheKey, this.getNormalizedType()).init();
      return cacheKeyObj.singleObj;
    }
    return undefined;
  }

  applyRules(episode: number) {
    if (this.rules) {
      const userOffset = this.getOffset() || 0;
      const res = this.rules.applyRules(Number(episode) + Number(userOffset));
      if (res) res.offset = Number(res.offset) + Number(userOffset);
      return res;
    }
    return undefined;
  }

  getRuledOffset(episode: number): number {
    const res = this.applyRules(episode);
    return res ? res.offset : this.getOffset();
  }

  getRuledUrl(episode: number): string | null {
    const res = this.applyRules(episode);
    return res ? res.url : this.getUrl();
  }
}
