import type { ChibiGenerator, ChibiParam } from '../ChibiGenerator';

export default {
  /**
   * Replaces all linebreaks in a string with spaces.
   * @param replacement The string to replace linebreaks with. Defaults to a single space.
   * @returns string with linebreaks replaced
   */
  replaceLinebreaks: ($c: ChibiGenerator<string>, replacement: ChibiParam<string> = ' ') => {
    return $c.replaceAll('(\n|\r)', replacement);
  },

  /**
   * Slugify a string (Converts string to lowercase, removes special characters, and replaces spaces with hyphens)
   * @param replacement Additional replacement rules in the format {'target': 'replacement'}.
   * @example
   * $c.string('1 World/s New').slugify().run() // return 1-worlds-strong
   * $c.string('100% World-&-☢').slugify([['%', 'percent'], ['☢', $c.string('radiation').run()], ['&', 'and']]).run() // return 100percent-world-and-radiation
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
};
