import { pageUrl } from '../../utils/slugs';

export type TvdbRuleProvider = 'anidb' | 'mal' | 'anilist';
export type TvdbRuleSource = 'tvdb';

export interface TvdbRange {
  start: number;
  end: number | null;
}

export interface TvdbRule extends TvdbRange {
  source: TvdbRuleSource;
  season: number;
  provider: TvdbRuleProvider;
  id: number;
  episodeStart: number;
  via?: TvdbRuleProvider;
}

export type TvdbRuleType = 'season' | 'cour' | 'mapping';

export interface TvdbTypedRule extends TvdbRule {
  type: TvdbRuleType;
  absoluteStart: number | null;
}

export interface TvdbRuleSet {
  tvdbId: number;
  rules: TvdbTypedRule[];
  ids: Record<TvdbRuleProvider, number[]>;
}

export interface RuleMatch {
  key: string;
  rule: TvdbTypedRule;
  url: string;
  offset: number;
  episode: number;
}

export type RuleSetType = 'tvdb' | 'cour' | 'absolute' | 'off';

export const RULE_SETS: RuleSetType[] = ['tvdb', 'cour', 'absolute', 'off'];

export const DEFAULT_RULE_SET: RuleSetType = 'cour';

interface rules {
  provider: 'api';
  cache?: boolean;
  updated: number;
  ruleSet: TvdbRuleSet | null;
}

export class RulesClass {
  protected logger;

  protected state: rules | undefined;

  protected ruleSet: RuleSetType = DEFAULT_RULE_SET;

  constructor(
    protected cacheKey: string | number,
    protected type: 'anime' | 'manga',
    // Storage key to remember the selected rule set, not remembered if empty
    protected ruleSetKey = '',
  ) {
    this.logger = con.m('Rules');
    return this;
  }

  public async init() {
    this.state = await this.getCache();
    if (this.ruleSetKey) {
      const ruleSet = await api.storage.get(this.ruleSetKey);
      if (RULE_SETS.includes(ruleSet)) this.ruleSet = ruleSet;
    }

    if (
      !this.state ||
      this.state.updated + 7 * 24 * 60 * 60 * 1000 < new Date().getTime() ||
      // Cached before the rules had all fields
      (this.state.ruleSet &&
        this.state.ruleSet.rules.some(rule => !rule.type || rule.absoluteStart === undefined))
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

  public getRuleSet(): RuleSetType {
    return this.ruleSet;
  }

  public async setRuleSet(ruleSet: RuleSetType) {
    this.ruleSet = ruleSet;
    if (this.ruleSetKey) await api.storage.set(this.ruleSetKey, ruleSet);
  }

  public getRuleProvider(): 'mal' | 'anilist' {
    return String(this.cacheKey).startsWith('anilist:') ? 'anilist' : 'mal';
  }

  public getEntryId(): number {
    return Number(String(this.cacheKey).split(':').pop());
  }

  public getRules(): TvdbTypedRule[] {
    if (!this.state || !this.state.ruleSet || !this.state.ruleSet.rules) return [];
    const provider = this.getRuleProvider();
    return this.state.ruleSet.rules.filter(rule => rule.provider === provider);
  }

  static ruleKey(rule: TvdbTypedRule): string {
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

  protected inferSeason(episode: number): number | undefined {
    const ownRules = this.getRules().filter(rule => rule.id === this.getEntryId());

    const covering = ownRules.find(
      rule =>
        episode >= rule.episodeStart &&
        (rule.end === null || episode <= rule.episodeStart + rule.end - rule.start),
    );
    if (covering) return covering.season;

    const seasons = [...new Set(ownRules.map(rule => rule.season))];
    if (seasons.length === 1) return seasons[0];

    return undefined;
  }

  protected resolveSeason(episode: number, season?: number): number | undefined {
    if (season !== undefined && season !== null) return season;
    const inferred = this.inferSeason(episode);
    if (inferred !== undefined)
      this.logger.log('Inferred season', inferred, 'for episode', episode);
    return inferred;
  }

  // inferred: the season was inferred from the current entry, not provided by the page
  protected getSeasonRules(season: number, inferred = false): TvdbTypedRule[] {
    // Rule set off
    if (this.ruleSet === 'off') return [];

    // Same season
    const seasonRules = this.getRules().filter(rule => rule.season === season);

    if (this.ruleSet === 'cour') {
      // Provided season: seasons split into cours and whole seasons
      if (!inferred) {
        return seasonRules.filter(rule => rule.type === 'cour' || rule.type === 'season');
      }

      // Inferred season: only seasons split into cours, without the first part.
      // The page could number a later part from 1. The first part can be split into multiple rules of the same id
      const courRules = seasonRules.filter(rule => rule.type === 'cour');
      const firstRule = [...courRules].sort((a, b) => a.start - b.start)[0];
      return courRules.filter(rule => rule.id !== firstRule.id);
    }

    return seasonRules;
  }

  // Absolute: rules with a known absolute episode, seasons do not matter
  protected getAbsoluteRules(): TvdbTypedRule[] {
    return this.getRules().filter(rule => rule.absoluteStart !== null);
  }

  // First episode of a rule in the numbering of the rule set
  protected ruleStart(rule: TvdbTypedRule): number {
    if (this.ruleSet === 'absolute' && rule.absoluteStart !== null) return rule.absoluteStart;
    return rule.start;
  }

  // Rules of all seasons in the selected rule set
  public getRuleSetRules(): TvdbTypedRule[] {
    if (this.ruleSet === 'absolute') return this.getAbsoluteRules();
    const seasons = [...new Set(this.getRules().map(rule => rule.season))];
    return seasons.flatMap(season => this.getSeasonRules(season));
  }

  // Rules of the season the episode is in
  public getEpisodeSeasonRules(episode: number, season?: number): TvdbTypedRule[] {
    if (this.ruleSet === 'absolute') return this.getAbsoluteRules();
    const resolved = this.resolveSeason(episode, season);
    if (resolved === undefined) return [];
    return this.getSeasonRules(resolved, season === undefined || season === null);
  }

  public getMatches(episode: number, season?: number): RuleMatch[] {
    return (
      this.getEpisodeSeasonRules(episode, season)
        // Episode in range, end null = open-ended
        .filter(
          rule =>
            episode >= this.ruleStart(rule) &&
            (rule.end === null || episode <= this.ruleStart(rule) + rule.end - rule.start),
        )
        // Most specific rule first
        .sort((a, b) => this.ruleStart(b) - this.ruleStart(a))
        // Target entry url and episode
        .map(rule => ({
          key: RulesClass.ruleKey(rule),
          rule,
          url: pageUrl(rule.provider as 'mal' | 'anilist', this.type, rule.id),
          offset: rule.episodeStart - this.ruleStart(rule),
          episode: rule.episodeStart + episode - this.ruleStart(rule),
        }))
    );
  }

  public applyRules(
    currentEpisode: number,
    season?: number,
  ): { url: string; offset: number } | undefined {
    const matches = this.getMatches(currentEpisode, season);
    if (!matches.length) return undefined;

    const match = matches[0];
    return {
      url: match.url,
      offset: match.offset,
    };
  }
}
