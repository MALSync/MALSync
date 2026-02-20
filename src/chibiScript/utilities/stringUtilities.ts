import type { ChibiGenerator, ChibiParam } from '../ChibiGenerator';

export default {
  /**
   * Replaces all linebreaks in a string with spaces.
   * @param replacement The string to replace linebreaks with. Defaults to a single space.
   * @returns string with linebreaks replaced
   */
  replaceLinebreaks: ($c: ChibiGenerator<string>, replacement: ChibiParam<string> = ' ') => {
    return $c.replaceRegex('(\n|\r)', replacement).replaceRegex(' +', ' ').trim();
  },

  /**
   * Slugify a string (Converts string to lowercase, removes special characters, and replaces spaces with hyphens)
   * @param replacement Additional replacement rules in the format {'target': 'replacement'} or [['target', 'replacement']].
   * @example
   * $c.string('1 World/s New').slugify().run() // return 1-worlds-new
   * $c.string('100%-&').slugify([['%', 'percent'], [$c.string('&').run(), $c.string('and').run()]]).run() // return 100percent-and
   * $c.string('100%-&').slugify({'%': 'percent', '&': $c.string('and').run()}).run() // return 100percent-and
   */
  slugify: (
    $c: ChibiGenerator<string>,
    replacements?: Record<string, ChibiParam<string>> | [ChibiParam<string>, ChibiParam<string>][],
  ) => {
    const entries: [string, ChibiParam<string>][] = Array.isArray(replacements)
      ? (replacements as [ChibiParam<string>, ChibiParam<string>][])
      : Object.entries(replacements ?? {});

    const expr = entries.reduce((acc, [from, to]) => acc.replaceAll(from, to), $c.toLowerCase());

    return expr
      .replaceRegex('[^\\w\\s-]', '')
      .trim()
      .replaceRegex('\\s+', '-')
      .replaceRegex('-{2,}', '-');
  },

  /**
   * Iterates group of regex until it matched.
   * @param pattern The regex pattern string
   * @example $c.string('Hello 123').regexAuto('(MAL)|(\\d+)') // return 123
   */
  regexAutoGroup: ($c: ChibiGenerator<string>, pattern: ChibiParam<string>) => {
    // Has to use different variable name for some reason when using it inside AND outside of coalesce
    const uniqueVar = `regAuto_${Math.random().toString(36).slice(2, 9)}`;
    const Var = $c.setVariable(uniqueVar);

    const match = new RegExp(`(?:${pattern})|`).exec('');
    const groupCount = match ? match.length - 1 : 0;

    if (groupCount === 0) return $c;
    const branches = Array.from({ length: groupCount }, (_, i) => {
      const groupIndex = i + 1;

      return $c
        .getVariable(uniqueVar)
        .string()
        .regex(pattern, groupIndex)
        .ifThen($c => $c.string().run())
        .run();
    });

    return Var.coalesce(...branches);
  },
};
