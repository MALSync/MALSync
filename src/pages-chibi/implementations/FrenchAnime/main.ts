import { PageInterface } from '../../pageInterface';

export const FrenchAnime: PageInterface = {
  name: 'French Anime',
  domain: 'https://french-anime.com',
  languages: ['French'],
  type: 'anime',
  urls: {
    match: ['*://*.french-anime.com/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).boolean().run(), $c.url().urlPart(4).regex('\\d+').boolean().run())
        .run();
    },
    getTitle($c) {
      // Return base title without episode (normal operation)
      return $c.querySelector('h1[itemprop="name"]').text().trim().run();
    },
    getIdentifier($c) {
      // Get the unique post ID with null safety
      return $c
        .querySelector('input[name="post_id"]')
        .getAttribute('value')
        .ifNotReturn($c.string('no-value').run())
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .string('<section>/<identifier>')
        .replace('<section>', $c.url().urlPart(3).run())
        .replace('<identifier>', $c.this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      // Try to find the visible button and extract episode number with default 0
      return $c
        .querySelector('div.button_box[style*="display: block"]')
        .ifNotReturn($c.number(0).run())
        .getAttribute('id')
        .ifNotReturn($c.string('button_0').run())
        .regex('button_(\\d+)', 1)
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
        .querySelector('pre')
        .text()
        .contains('404 Page')
        .ifThen($c => $c.string('404').log().return().run())
        .domReady()
        .trigger()
        .detectChanges(
          $c
            .querySelector('div.button_box[style*="display: block"]')
            .ifNotReturn($c.string('no-change').run())
            .getAttribute('id')
            .ifNotReturn($c.string('button_0').run())
            .regex('button_(\\d+)', 1)
            .run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
