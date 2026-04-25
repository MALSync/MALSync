import { PageInterface } from '../../pageInterface';

export const FrenchAnime: PageInterface = {
  name: 'French Anime',
  domain: 'https://french-anime.com',
  languages: ['French'],
  type: 'anime',
  urls: {
    match: ['*://*.french-anime.com/*'],
  },
  search: 'https://french-anime.com/index.php?do=search&subaction=search&story={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(4).regex('^\\d+').boolean().run();
    },
    getTitle($c) {
      return $c.querySelector('h1[itemprop="name"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c
        .querySelector('input[name="post_id"]')
        .getAttribute('value')
        .ifNotReturn($c.url().urlPart(4).regex('^(\\d+)', 1).run())
        .run();
    },
    getOverviewUrl($c) {
      return $c.url().run();
    },
    getEpisode($c) {
      return $c
        .querySelector('.new_player_bottom div.button_box:not([style*="display: none"])')
        .getAttribute('id')
        .regex('button_(\\d+)', 1)
        .number()
        .run();
    },
    getImage($c) {
      return $c
        .querySelector('.mov-img img[itemprop="thumbnailUrl"]')
        .getAttribute('src')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#epselect option').run();
    },
    elementEp($c) {
      return $c.text().regex('Episode\\s+(\\d+)', 1).number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.domReady().trigger().run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.querySelector('h1[itemprop="name"]').boolean().run(),
              $c.querySelector('#epselect').boolean().run(),
            )
            .run(),
        )
        .trigger()
        .detectChanges(
          $c
            .querySelector('.new_player_bottom div.button_box:not([style*="display: none"])')
            .getAttribute('id')
            .run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
