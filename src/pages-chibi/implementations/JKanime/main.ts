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
        .title()
        .replaceRegex(' \\d+ Sub Español Online gratis — JkAnime', '')
        .string()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(3).run();
    },
    getImage($c) {
      return $c
        .string('/assets/images/animes/image/')
        .concat($c.this('sync.getIdentifier').run())
        .concat('.jpg')
        .urlAbsolute('https://cdn.jkdesa.com')
        .run();
    },
    getOverviewUrl($c) {
      return $c.this('sync.getIdentifier').urlAbsolute().concat('/').run();
    },
    getEpisode($c) {
      return $c.url().urlPart(4).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.ep_bar a:has(i.ti-chevron-right)')
        .ifNotReturn()
        .getAttribute('href')
        .replaceRegex('^#', '')
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
          $c
            .or(
              $c.title().contains(' - anime ').ifNotReturn().boolean().run(),
              $c.querySelector('#guardar-anime').ifNotReturn().boolean().run(),
            )
            .run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.title().split(' - anime ').at(0).string().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(3).run();
    },
    getImage($c) {
      return $c.this('sync.getImage').run();
    },
    uiInjection($c) {
      return $c.querySelector('div.anime_info').ifNotReturn().uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c
        .this('overview.isOverviewPage')
        .ifNotReturn()
        .querySelectorAll('#episodes-content div.anime__item a')
        .ifNotReturn()
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
      // style.less without yelling at me in the lint:less check
      const _startingStyle =
        '@starting-style{#malp,#malp *{opacity:0!important;font-size:-1.25rem!important;}#malp{width:0;}}';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, global-require, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
      return $c.addStyle(require('./style.less?raw').toString()).addStyle(_startingStyle).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    listChange($c) {
      return (
        $c
          .title()
          .contains('Página no encontrada')
          // eslint-disable-next-line @typescript-eslint/no-shadow
          .ifThen($c => $c.string('404').log().return().run())
          .domReady()
          .detectChanges(
            $c
              .this('overview.isOverviewPage')
              .ifNotReturn()
              .querySelectorAll('#episodes-content div.anime__item')
              .last()
              .ifNotReturn()
              .find('a')
              .ifNotReturn()
              .getAttribute('href')
              .ifNotReturn()
              .run(),
            $c.trigger().run(),
          )
          .run()
      );
    },
  },
};
