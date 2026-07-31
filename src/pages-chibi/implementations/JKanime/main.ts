/* eslint-disable @cspell/spellchecker */
import { PageInterface } from '../../pageInterface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const JKAnime: PageInterface = {
  name: 'JKAnime',
  domain: 'https://jkanime.net',
  languages: ['Spanish'],
  type: 'anime',
  urls: {
    match: ['*://jkanime.net/*'],
  },
  search: 'https://jkanime.net/buscar/{searchterm}',
  sync: {
    isSyncPage($c) {
      return $c
        .or(
          $c.url().urlPart(4).matches('\\d+').run(),
          $c.url().urlPart(4).matches('pelicula').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('div.player_normal > div.video-info div.video_i')
        .ifNotReturn()
        .find('a')
        .ifNotReturn()
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(3).run();
    },
    getImage($c) {
      return $c
        .querySelector('div.player_normal > div.video-info div.video_t > a > img')
        .ifNotReturn()
        .getAttribute('src')
        .ifNotReturn()
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('div.ep_bar > div.anime_slug > a > div')
        .ifNotReturn()
        .parent()
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(4).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('div.ep_bar > div.anime_slug > div > a > div > i.ti-chevron-right')
        .ifNotReturn()
        .parent()
        .ifNotReturn()
        .parent()
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelectorAll('#collapseServers').ifNotReturn().last().uiBefore().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.this('sync.isSyncPage').not().run(),
          $c.querySelector('#guardar-anime').ifNotReturn().boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('div.anime__details__content div.anime_info > h3')
        .ifNotReturn()
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c
        .querySelector('div.anime__details__content div.anime_pic.pc > img')
        .getAttribute('src')
        .ifNotReturn()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('div.anime_info').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c
        .querySelectorAll(
          $c
            .if(
              $c.this('overview.isOverviewPage').run(),
              $c.string('#episodes-content div.anime__item a').run(),
              $c.string('#episodes-content li.list-group-item a').run(),
            )
            .run(),
        )
        .run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.this('list.elementUrl').this('sync.getEpisode').run();
    },
  },
  lifecycle: {
    setup($c) {
      // this is added here because stylelint doesn't support the starting-style
      // at-rule until version 16, so it will not let me add it cleanly in
      // style.less without yelling at me in the lint:css check
      const _startingStyle =
        '@starting-style{#malp,#malp *{opacity:0!important;font-size:-1.25rem!important;}#malp{width:0;}}';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, global-require, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
      return $c.addStyle(require('./style.less?raw').toString()).addStyle(_startingStyle).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c
            .querySelectorAll(
              $c
                .if(
                  $c.this('overview.isOverviewPage').run(),
                  $c.string('#episodes-content div.anime__item').run(),
                  $c.string('#episodes-content li').run(),
                )
                .run(),
            )
            .last()
            .ifNotReturn()
            .find('a')
            .ifNotReturn()
            .getAttribute('href')
            .ifNotReturn()
            .run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
