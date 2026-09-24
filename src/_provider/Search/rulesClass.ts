import { pageUrl } from '../../utils/slugs';

export type TvdbRuleProvider = 'anidb' | 'mal' | 'anilist';

export interface TvdbRange {
  start: number;
  end: number | null;
}

export interface TvdbRule extends TvdbRange {
  season: number;
  provider: TvdbRuleProvider;
  id: number;
  episodeStart: number;
  via?: TvdbRuleProvider;
}

export interface TvdbRuleSet {
  tvdbId: number;
  rules: TvdbRule[];
  ids: Record<TvdbRuleProvider, number[]>;
}

export interface RuleMatch {
  key: string;
  rule: TvdbRule;
  url: string;
  offset: number;
  episode: number;
}

interface rules {
  provider: 'api';
  cache?: boolean;
  updated: number;
  ruleSet: TvdbRuleSet | null;
}

export class RulesClass {
  protected logger;

  protected state: rules | undefined;

  protected selections: Record<string, string | null> = {};

  constructor(
    protected cacheKey: string | number,
    protected type: 'anime' | 'manga',
    // Storage key to remember the user selections, not remembered if empty
    protected selectionKey = '',
  ) {
    this.logger = con.m('Rules');
    return this;
  }

  public async init() {
    this.state = await this.getCache();
    if (this.selectionKey) this.selections = (await api.storage.get(this.selectionKey)) || {};

    if (!this.state || this.state.updated + 7 * 24 * 60 * 60 * 1000 < new Date().getTime()) {
      const tempState = await this.api();
      if (tempState) this.state = tempState;
    }

    this.logger.m('Result').log(this.state);

    if (this.state) {
      await this.setCache(this.state);
    }
    return this;
  }

  public getRuleProvider(): 'mal' | 'anilist' {
    return String(this.cacheKey).startsWith('anilist:') ? 'anilist' : 'mal';
  }

  public getRules(): TvdbRule[] {
    if (!this.state || !this.state.ruleSet || !this.state.ruleSet.rules) return [];
    const provider = this.getRuleProvider();
    return this.state.ruleSet.rules.filter(rule => rule.provider === provider);
  }

  static ruleKey(rule: TvdbRule): string {
    return `${rule.season}:${rule.provider}:${rule.id}:${rule.start}`;
  }

  protected async api(): Promise<rules | undefined> {
    const logger = this.logger.m('API');
    try {
      if (this.type !== 'anime') {
        logger.info('Only supports anime');
        return undefined;
      }

      if (/^(simkl|kitsu|mangabaka):/.test(String(this.cacheKey))) {
        logger.info('Cache key not supported', this.cacheKey);
        return undefined;
      }

      const url = `https://api.malsync.moe/tvdb/rules/cache-key/${this.cacheKey}`;
      logger.log(url);

      const response = await api.request.xhr('GET', url);
      logger.log('Response', response);

      const res: TvdbRuleSet | null = JSON.parse(response.responseText);

      return {
        provider: 'api',
        updated: new Date().getTime(),
        ruleSet: res && Array.isArray(res.rules) ? res : null,
      };
    } catch (e) {
      logger.error(e);
      return undefined;
    }
  }

  protected async getCache(): Promise<rules | undefined> {
    return api.storage.get(`${this.type}/${this.cacheKey}/TvdbRules`).then(state => {
      if (state) state.cache = true;
      return state;
    });
  }

  protected setCache(cache: rules) {
    cache = JSON.parse(JSON.stringify(cache));
    return api.storage.set(`${this.type}/${this.cacheKey}/TvdbRules`, cache);
  }

  public getMatches(episode: number, season?: number): RuleMatch[] {
    // Rules need a season
    if (season === undefined || season === null) return [];

    return (
      this.getRules()
        // Same season
        .filter(rule => rule.season === season)
        // Episode in range, end null = open-ended
        .filter(rule => episode >= rule.start && (rule.end === null || episode <= rule.end))
        // Most specific rule first
        .sort((a, b) => b.start - a.start)
        .map(rule => ({
          key: RulesClass.ruleKey(rule),
          rule,
          url: pageUrl(rule.provider as 'mal' | 'anilist', this.type, rule.id),
          offset: rule.episodeStart - rule.start,
          episode: rule.episodeStart + episode - rule.start,
        }))
    );
  }

  static candidateKey(matches: RuleMatch[]): string {
    return matches
      .map(el => el.key)
      .sort()
      .join(',');
  }

  public async resolve(
    episode: number,
    season: number | undefined,
    currentUrl: string | null,
    select: (matches: RuleMatch[]) => Promise<string | null | undefined>,
  ) {
    const matches = this.getMatches(episode, season);
    if (!matches.length) return;
    if (matches.length === 1 && matches[0].url === currentUrl) return;

    const key = RulesClass.candidateKey(matches);
    if (key in this.selections) return;

    const selection = await select(matches);
    if (selection === undefined) return;

    this.selections[key] = selection;
    if (this.selectionKey) {
      await api.storage.set(this.selectionKey, JSON.parse(JSON.stringify(this.selections)));
    }
  }

  public activeRule: TvdbRule | undefined;

  public applyRules(
    currentEpisode: number,
    season?: number,
  ): { url: string; offset: number } | undefined {
    this.activeRule = undefined;
    const matches = this.getMatches(currentEpisode, season);
    if (!matches.length) return undefined;

    const selection = this.selections[RulesClass.candidateKey(matches)];
    if (selection === null) return undefined;

    const match = matches.find(el => el.key === selection) || matches[0];
    this.activeRule = match.rule;
    return {
      url: match.url,
      offset: match.offset,
    };
  }
}
