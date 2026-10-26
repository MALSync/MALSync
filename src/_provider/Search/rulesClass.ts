import { pageUrl } from '../../utils/slugs';
import { RULE_SET_STRATEGIES, SeasonContext, covers } from './ruleSetStrategies';

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
  // Mal and anilist title from the database, null if unknown
  providerName?: string | null;
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

// Selected by the user, auto uses the default rule set and asks on conflicts
export type RuleSetSelection = RuleSetType | 'auto';

export const RULE_SET_SELECTIONS: RuleSetSelection[] = ['auto', ...RULE_SETS];

interface rules {
  provider: 'api';
  cache?: boolean;
  updated: number;
  ruleSet: TvdbRuleSet | null;
}

export class RulesClass {
  protected logger;

  protected state: rules | undefined;

  constructor(
    protected cacheKey: string | number,
    protected type: 'anime' | 'manga',
  ) {
    this.logger = con.m('Rules');
    return this;
  }

  public async init() {
    this.state = await this.getCache();

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

  public getTvdbId(): number | undefined {
    if (!this.state || !this.state.ruleSet) return undefined;
    return this.state.ruleSet.tvdbId;
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
    // Only regular seasons, season 0 collects specials of many entries
    const ownRules = this.getRules().filter(
      rule => rule.id === this.getEntryId() && rule.season > 0,
    );

    const covering = ownRules.find(rule => covers(rule, episode, rule.episodeStart));
    if (covering) return covering.season;

    const seasons = [...new Set(ownRules.map(rule => rule.season))];
    if (seasons.length === 1) return seasons[0];

    return undefined;
  }

  protected resolveSeason(episode: number, season?: number): SeasonContext | undefined {
    if (season !== undefined && season !== null) return { season, inferred: false };
    const inferred = this.inferSeason(episode);
    if (inferred === undefined) return undefined;
    this.logger.log('Inferred season', inferred, 'for episode', episode);
    return { season: inferred, inferred: true };
  }

  // Rules of all seasons in the selected rule set
  public getRuleSetRules(ruleSet: RuleSetType): TvdbTypedRule[] {
    return RULE_SET_STRATEGIES[ruleSet].all(this.getRules());
  }

  // Rules of the season the episode is in
  public getEpisodeSeasonRules(
    episode: number,
    season: number | undefined,
    ruleSet: RuleSetType,
  ): TvdbTypedRule[] {
    return RULE_SET_STRATEGIES[ruleSet].select(
      this.getRules(),
      this.resolveSeason(episode, season),
    );
  }

  public getMatches(
    episode: number,
    season: number | undefined,
    ruleSet: RuleSetType,
  ): RuleMatch[] {
    const { start } = RULE_SET_STRATEGIES[ruleSet];
    return (
      this.getEpisodeSeasonRules(episode, season, ruleSet)
        .filter(rule => covers(rule, episode, start(rule)))
        // Most specific rule first
        .sort((a, b) => start(b) - start(a))
        // Target entry url and episode
        .map(rule => ({
          key: RulesClass.ruleKey(rule),
          rule,
          url: pageUrl(rule.provider as 'mal' | 'anilist', this.type, rule.id),
          offset: rule.episodeStart - start(rule),
          episode: rule.episodeStart + episode - start(rule),
        }))
    );
  }

  public applyRules(
    currentEpisode: number,
    season: number | undefined,
    ruleSet: RuleSetType,
  ): { url: string; offset: number } | undefined {
    const matches = this.getMatches(currentEpisode, season, ruleSet);
    if (!matches.length) return undefined;

    const match = matches[0];
    return {
      url: match.url,
      offset: match.offset,
    };
  }
}
