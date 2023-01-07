/* eslint-disable no-shadow */
interface rules {
  provider: 'firebase' | 'user';
  cache?: boolean;
  updated: number;
  last_modified?: string;
  rules: {
    from: {
      title?: string;
      url: number;
      start: number;
      end: number;
    };
    to: {
      title?: string;
      url: number;
      start: number;
      end: number;
    };
  }[];
}

export class RulesClass {
  protected logger;

  protected state: rules | undefined;

  constructor(protected cacheKey: string | number, protected type: 'anime' | 'manga') {
    this.logger = con.m('Rules');
    return this;
  }

  public async init() {
    this.state = await this.getCache();

    if (
      !this.state ||
      (this.state.provider === 'firebase' &&
        this.state.updated &&
        this.state.updated + 7 * 24 * 60 * 60 * 1000 < new Date().getTime())
    ) {
      const tempState = await this.api();
      if (tempState) this.state = tempState;
    }

    this.logger.m('Result').log(this.state);

    if (this.state) {
      await this.setCache(this.state);
    }
    return this;
  }

  public getRules() {
    if (this.state && this.state.rules && this.state.rules.length) return this.state.rules;
    return [];
  }

  protected async api(): Promise<rules | undefined> {
    const logger = this.logger.m('API');
    try {
      if (this.type !== 'anime') {
        logger.info('Only supports anime');
        return undefined;
      }

      if (String(this.cacheKey).startsWith('simkl:')) {
        logger.info('Simkl is not supported');
        return undefined;
      }

      const url = `https://api.malsync.moe/rules/${this.cacheKey}`;
      logger.log(url);

      const response = await api.request.xhr('GET', url);
      logger.log('Response', response);

      const res = JSON.parse(response.responseText);

      return {
        provider: 'firebase',
        updated: new Date().getTime(),
        last_modified: res.last_modified,
        rules: res.rules.map(rule => {
          return {
            from: {
              title: rule.from.title,
              url: utils.pageUrl(res.page, this.type, rule.from.id),
              start: rule.from.start,
              end: rule.from.end,
            },
            to: {
              title: rule.to.title,
              url: utils.pageUrl(res.page, this.type, rule.to.id),
              start: rule.to.start,
              end: rule.to.end,
            },
          };
        }),
      };
    } catch (e) {
      logger.error(e);
      return undefined;
    }
  }

  protected async getCache(): Promise<rules | undefined> {
    return api.storage.get(`${this.type}/${this.cacheKey}/Rules`).then(state => {
      if (state) state.cache = true;
      return state;
    });
  }

  protected setCache(cache: rules) {
    cache = JSON.parse(JSON.stringify(cache));
    return api.storage.set(`${this.type}/${this.cacheKey}/Rules`, cache);
  }

  public activeRule: any | undefined;

  public applyRules(currentEpisode: number, rules?): { url: string; offset: number } | undefined {
    const logger = this.logger.m('apply');
    this.activeRule = undefined;
    if (!rules) rules = this.getRules();
    logger.log(currentEpisode, rules);
    const rule = rules.find(el => el.from.start <= currentEpisode && el.from.end >= currentEpisode);

    if (rule) {
      logger.log('Rule found', rule);
      this.activeRule = rule;
      return {
        url: rule.to.url,
        offset: rule.to.start - rule.from.start,
      };
    }

    // If continuous counting and seasons are merged (Crunchyroll: Re:ZERO Season 2)
    if (rules.length > 1) {
      const selfRule = rules.find(el => el.from.url === el.to.url && currentEpisode > el.from.end);
      if (selfRule) {
        const offset = selfRule.to.start - selfRule.from.start;
        const newEp = currentEpisode + offset;
        logger.log('Self Rule', selfRule, newEp, offset);
        const res = this.applyRules(
          newEp,
          rules.filter(el => el.from.url !== el.to.url),
        );
        if (res) {
          res.offset += offset;
          return res;
        }
      }
    }

    return undefined;
  }
}
