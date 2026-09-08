import { PageInterface } from '../../pageInterface';

export const NaszeAnime: PageInterface = {
  name: 'NaszeAnime',
  type: 'anime',
  domain: 'https://naszeanime.pl',
  languages: ['Polish'],
  urls: {
    match: ['*://naszeanime.pl/*'],
  },
  search: 'https://naszeanime.pl/search?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('anime').run(),
          $c.url().urlPart(5).contains('watch').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/anime/')
        .concat($c.this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      const epId = $c
        .url()
        .urlParam('epId')
        .number()
        .run();

      const episodes = $c
        .querySelectorAll('script')
        .arrayFind(($script) =>
          $script
            .text()
            .contains('episodes')
            .run(),
        )
        .ifNotReturn($c.number(1).run())
        .text()
        .regex(
          '\\\\"episodes\\\\":(\\[.*?\\]),\\\\"firstEpisodeId\\\\"',
          1,
        )
        .replaceRegex('\\\\"', '"')
        .jsonParse()
        .type<Array<{ id: number; num: string }>>();

      return episodes
        .arrayFind(($episode) =>
          $episode
            .get('id')
            .number()
            .equals(epId)
            .run(),
        )
        .ifNotReturn($c.number(1).run())
        .get('num')
        .number()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.string('').run();
    },
    ready($c) {
      return $c
        .detectURLChanges(
          $c.trigger().run(),
          {
            ignoreQuery: false,
            ignoreAnchor: false
          },
        )
        .domReady()
        .trigger()
        .run();
    },
  },
};
