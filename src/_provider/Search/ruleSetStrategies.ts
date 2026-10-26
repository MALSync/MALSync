import type { RuleSetType, TvdbTypedRule } from './rulesClass';

// Season the episode is in
export interface SeasonContext {
  season: number;
  // Inferred from the current entry, not provided by the page
  inferred: boolean;
}

export interface RuleSetStrategy {
  // Rules that can apply to an episode of the season, none if the season is unknown
  select: (rules: TvdbTypedRule[], context: SeasonContext | undefined) => TvdbTypedRule[];
  // Rules of all seasons
  all: (rules: TvdbTypedRule[]) => TvdbTypedRule[];
  // First episode of a rule in the numbering of the rule set
  start: (rule: TvdbTypedRule) => number;
}

// Episode in range of the rule, end null = open-ended
export function covers(rule: TvdbTypedRule, episode: number, start: number): boolean {
  return episode >= start && (rule.end === null || episode <= start + rule.end - rule.start);
}

// One entry mapped with gaps over the whole season, e.g. counting specials. Used like a season rule
export function getWholeSeasonEntry(seasonRules: TvdbTypedRule[]): TvdbTypedRule | undefined {
  if (!seasonRules.length || seasonRules.some(rule => rule.type !== 'mapping')) return undefined;
  if (new Set(seasonRules.map(rule => rule.id)).size !== 1) return undefined;

  const [first] = [...seasonRules].sort((a, b) => a.start - b.start);
  if (first.start !== 1 || first.episodeStart !== 1) return undefined;

  // The entry can count more episodes than the season
  return { ...first, end: null };
}

// Provided season: the whole season entry, else seasons split into cours and whole seasons
function wholeSeasonOrCours(seasonRules: TvdbTypedRule[]): TvdbTypedRule[] {
  const wholeEntry = getWholeSeasonEntry(seasonRules);
  if (wholeEntry) return [wholeEntry];
  return seasonRules.filter(rule => rule.type === 'cour' || rule.type === 'season');
}

// Inferred season: only seasons split into cours, without the first part.
// The page could number a later part from 1. The first part can be split into multiple rules of the same id
function laterCours(seasonRules: TvdbTypedRule[]): TvdbTypedRule[] {
  const courRules = seasonRules.filter(rule => rule.type === 'cour');
  const [firstRule] = [...courRules].sort((a, b) => a.start - b.start);
  return courRules.filter(rule => rule.id !== firstRule.id);
}

// Strategy picking rules within each season
function bySeason(
  pick: (seasonRules: TvdbTypedRule[], inferred: boolean) => TvdbTypedRule[],
): RuleSetStrategy {
  const ofSeason = (rules: TvdbTypedRule[], season: number) =>
    rules.filter(rule => rule.season === season);
  return {
    select: (rules, context) =>
      context ? pick(ofSeason(rules, context.season), context.inferred) : [],
    all: rules =>
      [...new Set(rules.map(rule => rule.season))].flatMap(season =>
        pick(ofSeason(rules, season), false),
      ),
    start: rule => rule.start,
  };
}

// Absolute: rules with a known absolute episode, seasons do not matter
const absoluteRules = (rules: TvdbTypedRule[]) => rules.filter(rule => rule.absoluteStart !== null);

export const RULE_SET_STRATEGIES: Record<RuleSetType, RuleSetStrategy> = {
  off: bySeason(() => []),
  tvdb: bySeason(seasonRules => seasonRules),
  cour: bySeason((seasonRules, inferred) =>
    inferred ? laterCours(seasonRules) : wholeSeasonOrCours(seasonRules),
  ),
  absolute: {
    select: rules => absoluteRules(rules),
    all: absoluteRules,
    start: rule => (rule.absoluteStart !== null ? rule.absoluteStart : rule.start),
  },
};
