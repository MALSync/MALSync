import type { ChibiGenerator, ChibiJson } from '../ChibiGenerator';

export default {
  /**
   * Executes a function with the current generator context
   * @input any - Current context
   * @param fn - Function to execute that takes the generator and returns a new generator
   * @returns Result of the function execution
   * @example
   * function meta($c: ChibiGenerator<unknown>) {
   *    return $c.getGlobalVariable('metadataGlobal');
   * }
   *
   * $c.exec(meta).get('Type').run()
   */
  exec: <Input, Output>(
    $c: ChibiGenerator<Input>,
    fn: (c: ChibiGenerator<Input>) => ChibiGenerator<Output>,
  ): ChibiGenerator<Output> => {
    return fn($c);
  },

  /**
   * Utility to generate provider URLs based on provided IDs or URLs
   */
  providerUrlUtility: (
    $c: ChibiGenerator<void>,
    provider: {
      [K in
        | 'anilistId'
        | 'anilistUrl'
        | 'kitsuId'
        | 'kitsuUrl'
        | 'malId'
        | 'malUrl']?: ChibiJson<any>;
    },
  ) => {
    const providerConfig = [
      {
        provider: 'ANILIST',
        urlKey: 'anilistUrl',
        idKey: 'anilistId',
        urlTemplate: 'https://anilist.co/manga/<identifier>',
      },
      {
        provider: 'KITSU',
        urlKey: 'kitsuUrl',
        idKey: 'kitsuId',
        urlTemplate: 'https://kitsu.app/manga/<identifier>',
      },
      {
        provider: 'MAL',
        urlKey: 'malUrl',
        idKey: 'malId',
        urlTemplate: 'https://myanimelist.net/manga/<identifier>',
      },
    ];

    const providerFunctions: ChibiJson<any>[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const config of providerConfig) {
      if (provider[config.idKey] || provider[config.urlKey]) {
        let providerFn: ChibiGenerator<any> =
          config.provider === 'MAL' ? $c : $c.provider().equals(config.provider).ifNotReturn();

        if (provider[config.urlKey]) {
          providerFn = providerFn.fn(provider[config.urlKey]).ifThen($c => $c.return().run());
        }

        if (provider[config.idKey]) {
          providerFn = providerFn.setVariable(config.idKey, $c.fn(provider[config.idKey]).run());
          providerFn = providerFn
            .getVariable(config.idKey)
            .ifThen($c =>
              $c
                .string(config.urlTemplate)
                .replace('<identifier>', $c.getVariable(config.idKey).run())
                .return()
                .run(),
            );
        }
        providerFunctions.push(providerFn.run());
      }
    }

    return $c.coalesceFn(...providerFunctions);
  },
};
