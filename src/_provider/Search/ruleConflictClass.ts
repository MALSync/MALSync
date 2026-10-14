import type { RuleSetType, RulesClass } from './rulesClass';

export interface RuleConflictOption {
  ruleSets: RuleSetType[];
  url: string | null;
  episode: number;
  // Undefined if no rule applies
  season?: number;
  title?: string | null;
}

export interface RuleConflict {
  season?: number;
  episode: number;
  options: RuleConflictOption[];
}

export class RuleConflictClass {
  constructor(
    protected rules: RulesClass,
    protected ruleSet: RuleSetType,
    protected currentUrl: string | null,
    // Rule set the page uses, only absolute numbering is compared to it
    protected pageRuleSet?: RuleSetType,
  ) {
    return this;
  }

  // Off always equals no rule applying. Tvdb only with a provided season, an inferred season assumes the episode of the entry
  protected getRuleSets(episode: number, season?: number): RuleSetType[] {
    if (this.pageRuleSet === 'absolute' || this.pageRuleSet === 'off') return [];

    let ruleSets: RuleSetType[];
    if (this.pageRuleSet) ruleSets = [this.pageRuleSet];
    else if (season === undefined || season === null) ruleSets = ['cour'];
    else ruleSets = ['tvdb', 'cour'];

    // Absolute only past the end of the season
    const seasonRules = this.rules.getEpisodeSeasonRules(episode, season, 'tvdb');
    if (
      seasonRules.length &&
      !seasonRules.some(rule => rule.end === null) &&
      episode > Math.max(...seasonRules.map(rule => rule.end as number))
    ) {
      ruleSets.push('absolute');
    }
    return ruleSets;
  }

  protected getOption(episode: number, season: number | undefined, ruleSet: RuleSetType) {
    const [match] = this.rules.getMatches(episode, season, ruleSet);
    if (!match) return { ruleSets: [ruleSet], url: this.currentUrl, episode };
    return {
      ruleSets: [ruleSet],
      url: match.url,
      episode: match.episode,
      season: match.rule.season,
      title: match.rule.providerName,
    };
  }

  public getConflict(episode: number, season?: number): RuleConflict | undefined {
    const options: RuleConflictOption[] = [];
    this.getRuleSets(episode, season).forEach(ruleSet => {
      const result: RuleConflictOption = this.getOption(episode, season, ruleSet);

      const same = options.find(el => el.url === result.url && el.episode === result.episode);
      if (same) {
        same.ruleSets.push(ruleSet);
        if (same.season === undefined && result.season !== undefined) same.season = result.season;
        if (!same.title && result.title !== undefined) same.title = result.title;
      } else {
        options.push(result);
      }
    });

    if (options.length < 2) return undefined;

    // Selecting an option selects its first rule set
    options.forEach(option =>
      option.ruleSets.sort((a, b) => Number(b === this.ruleSet) - Number(a === this.ruleSet)),
    );

    options.sort(
      (a, b) =>
        Number(b.ruleSets.includes(this.ruleSet)) - Number(a.ruleSets.includes(this.ruleSet)),
    );

    const [seasonRule] = this.rules.getEpisodeSeasonRules(episode, season, 'tvdb');
    return { season: seasonRule ? seasonRule.season : season, episode, options };
  }
}
