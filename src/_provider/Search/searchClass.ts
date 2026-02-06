/*
  Only create instances of this class in tests. Please use vueSearchClass instead if used in code.
 */

import { compareTwoStrings } from 'string-similarity';

import { search as pageSearch } from '../searchFactory';
import { Single as LocalSingle } from '../Local/single';
import { getRulesCacheKey } from '../singleFactory';
import { RulesClass } from './rulesClass';

import { getSyncMode } from '../helper';
import { pageInterface } from '../../pages/pageInterface';
import { SyncPage } from '../../pages/syncPage';

interface Logger {
  log: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  m: (name: string, color?: string) => Logger;
}

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

/* eslint-disable es-x/no-class-instance-fields */
export class SearchClass {
  private sanitizedTitle: string;

  private page: pageInterface | undefined;

  private syncPage: SyncPage | undefined;

  private localUrl: string;

  protected state: SearchResult | false;

  protected logger: Logger;

  changed: boolean;

  constructor(
    protected title: string,
    protected type: 'anime' | 'manga' | 'novel',
    protected identifier: string,
  ) {
    this.localUrl = '';
    this.state = false;
    this.changed = false;
    this.identifier += '';
    this.sanitizedTitle = this.sanitizeTitle(this.title);
    this.logger = con.m('search', 'red') as unknown as Logger;
  }

  setPage(page: pageInterface) {
    this.page = page;
  }

  setLocalUrl(url: string) {
    this.localUrl = url;
  }

  setSyncPage(syncPage: SyncPage) {
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

  setUrl(url: string, id = 0) {
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

    this.setCache(this.state).catch(e => this.logger.error(e));
  }

  getOffset(): number {
    if (this.state && this.state.offset) {
      return this.state.offset;
    }
    return 0;
  }

  setOffset(offset: number) {
    if (this.state) {
      if (this.state.offset !== offset) this.changed = true;
      this.state.offset = offset;
      this.setCache(this.state).catch(e => this.logger.error(e));
    }
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

  getSanitizedTitle() {
    return this.sanitizedTitle;
  }

  getNormalizedType() {
    if (this.type === 'anime') return 'anime';
    return 'manga';
  }

  public sanitizeTitle(title: string): string {
    let resTitle = title.replace(
      / *(\(dub\)|\(sub\)|\(uncensored\)|\(uncut\)|\(subbed\)|\(dubbed\)|\(novel\)|\(wn\)|\(ln\))/i,
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

  protected async getCache(): Promise<SearchResult | false> {
    if (!this.page) return false;
    return api.storage
      .get(`${this.page.name}/${this.identifier}/Search`)
      .then((state: SearchResult | false) => {
        if (state) state.cache = true;
        return state;
      });
  }

  protected setCache(cache: SearchResult | false) {
    if (!this.page) return Promise.resolve();
    const cleanCache = JSON.parse(JSON.stringify(cache)) as SearchResult | false;
    setTimeout(() => {
      this.databaseRequest().catch(e => this.logger.error(e));
    }, 200);
    return api.storage.set(`${this.page.name}/${this.identifier}/Search`, cleanCache);
  }

  static similarity(externalTitle: string, title: string, titleArray: (string | undefined)[] = []) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    let simValue = compareTwoStrings(title.toLowerCase(), externalTitle.toLowerCase()) as number;
    titleArray.forEach(el => {
      if (el) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const tempSim = compareTwoStrings(title.toLowerCase(), el.toLowerCase()) as number;
        if (tempSim > simValue) simValue = tempSim;
      }
    });

    return {
      same: simValue > 0.8,
      value: simValue,
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
      result = this.searchCompare(result, await this.malSync());
    } catch (e) {
      if (this.page && this.page.database)
        this.logger.error('MALSync api error or not supported', e);
    }

    if ((result && result.provider !== 'firebase') || !result) {
      try {
        result = this.searchCompare(result, await this.malSearch());
      } catch (e) {
        this.logger.error(e);
      }
    }

    if ((result && result.provider !== 'firebase') || !result) {
      try {
        result = this.searchCompare(result, await this.pageSearch(), 0.5);
      } catch (e) {
        this.logger.error(e);
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
        this.logger.error(e);
      }
    }

    return result;
  }

  protected searchCompare(
    curVal: SearchResult | false,
    newVal: SearchResult | false,
    threshold = 0,
  ) {
    if (curVal !== false && newVal !== false && newVal.similarity.value > threshold) {
      if (curVal.similarity.value >= newVal.similarity.value) return curVal;
      return newVal;
    }
    if (curVal !== false) return curVal;
    return newVal;
  }

  public async firebase(): Promise<SearchResult | false> {
    if (!this.page || !this.page.database) return false;

    const logger = this.logger.m('Firebase');

    const url = `https://kissanimelist.firebaseio.com/Data2/${this.page.database}/${encodeURIComponent(
      this.identifierToDbKey(this.identifier),
    ).toLowerCase()}/Mal.json`;
    logger.log(url);
    const response = await api.request.xhr('GET', url);

    logger.log('response', response.responseText);
    if (
      !response.responseText ||
      response.responseText === 'null' ||
      response.responseText.includes('error')
    )
      return false;
    let matches: { [key: string]: string } | undefined;
    try {
      matches = JSON.parse(response.responseText) as { [key: string]: string };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e) logger.error(e);
      logger.info('Parse failed');
      return false;
    }

    if (!matches || Object.keys(matches).length === 0) return false;

    const [id] = Object.keys(matches);

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

    if (!this.page || !this.page.database) return false;
    const dbPl = this.page.database;

    const url = `https://api.malsync.moe/page/${dbPl}/${encodeURIComponent(
      this.identifierToDbKey(this.identifier),
    ).toLowerCase()}`;
    logger.log(url);

    const response = await api.request.xhr('GET', url);
    logger.log('Response', response);

    if (response.status !== 400 && response.status !== 200) {
      throw new Error('malsync offline');
    }

    if (response.status === 400 && response.responseText && response.responseText.includes('error'))
      return false;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const res: {
      malUrl?: string;
      aniUrl?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = JSON.parse(response.responseText);

    let pageUrl = res.malUrl;

    if (!pageUrl && res.aniUrl && getSyncMode(this.getNormalizedType()) === 'ANILIST') {
      pageUrl = res.aniUrl;
    }

    if (!pageUrl) return false;

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

    const url = `https://myanimelist.net/${this.getNormalizedType()}.php?q=${encodeURI(
      this.sanitizedTitle,
    )}`;

    logger.log(url);

    const handleResult = (
      response: { responseText: string },
      i: number,
      context: SearchClass,
    ): SearchResult => {
      const link = this.getLink(response, i);
      let id = 0;
      let sim = { same: false, value: 0 };
      if (link !== false && link !== undefined) {
        try {
          if (context.type === 'manga' || context.type === 'novel') {
            const split1 = response.responseText.split(`href="${link}" id="si`);
            if (split1.length < 2) return handleResult(response, i + 1, context);
            const [typeCheck] = split1[1].split('</tr>');
            const linkIsNovel = typeCheck.indexOf('Novel') !== -1;

            if (
              (context.type === 'manga' && linkIsNovel) ||
              (context.type === 'novel' && !linkIsNovel)
            ) {
              logger.log(`${linkIsNovel ? 'Novel Found' : 'Novel Not found'} check next entry`);
              return handleResult(response, i + 1, context);
            }
          }

          const malTitle = this.getTitle(response, link);
          sim = SearchClass.similarity(malTitle, context.sanitizedTitle);
          id = parseInt(link.split('/')[4] || '0');
        } catch (e) {
          logger.error(e);
        }
      }

      return {
        id,
        url: link || '',
        offset: 0,
        provider: 'mal',
        similarity: sim,
      };
    };

    const response = await api.request.xhr('GET', url);

    if (!response || (response.responseText && response.responseText.includes('  error ')))
      return false;
    if (
      !response ||
      (response.responseText && response.responseText.includes('No titles that matched'))
    )
      return false;

    return handleResult(response as { responseText: string }, 1, this);
  }

  protected getLink(response: { responseText: string }, i: number): string | false {
    try {
      const parts = response.responseText.split('<a class="hoverinfo_trigger" href="');
      if (parts.length <= i) return false;
      const [link] = parts[i].split('"');
      return link;
    } catch (e) {
      this.logger.error(e);
      try {
        const parts = response.responseText.split('class="picSurround');
        if (parts.length <= i) return false;
        const [, linkPart] = parts[i].split('<a');
        if (!linkPart) return false;
        const [, hrefPart] = linkPart.split('href="');
        if (!hrefPart) return false;
        const [finalLink] = hrefPart.split('"');
        return finalLink;
      } catch (e2) {
        this.logger.error(e2);
        return false;
      }
    }
  }

  protected getTitle(response: { responseText: string }, link: string): string {
    try {
      const [, , , , id] = link.split('/');
      if (!id) return '';
      const parts = response.responseText.split(`rel="#sinfo${id}"><strong>`);
      if (parts.length < 2) return '';
      const [title] = parts[1].split('<');
      return title;
    } catch (e) {
      this.logger.error(e);
      return '';
    }
  }

  public async pageSearch(): Promise<SearchResult | false> {
    const searchResult = await pageSearch(this.sanitizedTitle, this.getNormalizedType());
    let best: { index: number; similarity: { same: boolean; value: number } } | null = null;
    for (let i = 0; i < searchResult.length && i < 5; i++) {
      const el = searchResult[i];
      const sim = SearchClass.similarity(el.name, this.sanitizedTitle, el.altNames);
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

      let syncUrl = '';
      if (this.page.isSyncPage(this.syncPage.url as string)) {
        syncUrl = this.page.sync.getOverviewUrl(this.syncPage.url as string);
        if (this.page.database === 'Crunchyroll') {
          syncUrl = `${this.syncPage.url}`;
        }
      } else {
        if (this.page.database === 'Crunchyroll') {
          logger.log('CR block');
          return;
        }
        syncUrl = this.syncPage.url as string;
      }

      if (!syncUrl) return;

      const param: {
        pageUrl: string;
        malUrl: string;
        correction: boolean;
        page: string;
      } = {
        pageUrl: syncUrl,
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
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: { 'Content-Type': 'application/json' },
        })
        .then(response => {
          try {
            const res = JSON.parse(response.responseText) as { error?: unknown };
            if (res.error) {
              // eslint-disable-next-line
              throw res;
            }
            logger.log('Send to database:', res);
          } catch (e) {
            logger.error('Send to database:', e);
          }
        })
        .catch(e => {
          logger.error('Send to database xhr error:', e);
        });
    }
  }

  public async onsiteSearch(): Promise<false | SearchResult> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (this.page && this.syncPage && this.syncPage.curState && this.syncPage.curState.on) {
      let result: false | string = false;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (this.syncPage.curState.on === 'OVERVIEW') {
        if (this.page.overview && this.page.overview.getMalUrl) {
          result = await this.page.overview.getMalUrl(
            api.settings.get('syncMode') as 'MAL' | 'ANILIST' | 'KITSU' | 'SIMKL' | 'SHIKI',
          );
        }
      } else if (this.page.sync && this.page.sync.getMalUrl) {
        result = await this.page.sync.getMalUrl(
          api.settings.get('syncMode') as 'MAL' | 'ANILIST' | 'KITSU' | 'SIMKL' | 'SHIKI',
        );
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

  protected identifierToDbKey(title: string) {
    if (!title) return '';
    const db = this.page ? this.page.database : undefined;
    const [cleanTitle] = title.toLowerCase().split('#');
    if (db === 'Crunchyroll') {
      return encodeURIComponent(cleanTitle).replace(/\./g, '%2E');
    }
    if (db === 'MangaFire') {
      return encodeURIComponent(cleanTitle);
    }
    return cleanTitle.replace(/\./g, '%2E');
  }

  // Rules
  rules: RulesClass | undefined;

  async initRules() {
    const logger = con.m('Rules') as unknown as Logger;
    const url = this.getUrl();
    logger.log('Url', url);
    if (url) {
      const cacheKeyObj = await getRulesCacheKey(url);
      logger.log('Cachekey', cacheKeyObj);
      this.rules = await new RulesClass(cacheKeyObj.rulesCacheKey, this.getNormalizedType()).init();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
