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
   * Repeat group of regex until it found 1
   * @param pattern The regex pattern string
   * @example $c.regexAuto('(\\w+)(\\d+)') // Automatically handles group 1 and group 2
   */
  regexAuto: ($c: ChibiGenerator<string>, pattern: string) => {
    const match = new RegExp(`${pattern}|`).exec('');
    const groupCount = match ? match.length - 1 : 0;
    const branches = Array.from({ length: groupCount }, (_, i) => {
      const groupIndex = i + 1;

      return $c
        .getVariable('multiRegex')
        .string()
        .regex(pattern, groupIndex)
        .ifThen($c => $c.string().return().run())
        .run();
    });

    // If no groups found, you might want to return the original generator or a default
    if (branches.length === 0) return $c;

    return $c.setVariable('multiRegex').coalesce(...branches);
  },
};
