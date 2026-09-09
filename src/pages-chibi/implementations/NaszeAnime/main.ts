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
      return $c
        .querySelector('button.border-blue-500 > span')
        .text()
        .trim()
        .number()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .domReady()
        .detectChanges(
          $c
            .querySelector('button.border-blue-500 > span')
            .ifNotReturn()
            .text()
            .run(),
          $c.trigger().run(),
        )
        .trigger()
        .run();
    },
  },
};
