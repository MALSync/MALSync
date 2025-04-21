import { PageInterface } from '../../pageInterface';

export const mangadex: PageInterface = {
  name: 'Mangadex',
  domain: 'https://www.mangadex.org',
  database: 'Mangadex',
  languages: ['Many'],
  type: 'manga',
  search: 'https://mangadex.org/titles?q={searchterm}',
  urls: {
    match: ['*://mangadex.org/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('chapter').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('meta[property="og:title"]')
        .ifNotReturn($c.string('').run())
        .getAttribute('content')
        .ifNotReturn($c.string('').run())
        .regex('^.*(?= - MangaDex$)')
        .run();
    },
    getIdentifier($c) {
      return $c
        .querySelector('meta[property="og:url"]')
        .ifNotReturn($c.string('').run())
        .getAttribute('content')
        .ifNotReturn($c.string('').run())
        .urlPart(4)
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('meta[property="og:url"]')
        .ifNotReturn($c.string('').run())
        .getAttribute('content')
        .ifNotReturn($c.string('').run())
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('div.reader--meta.chapter')
        .ifNotReturn($c.number(0).run())
        .text()
        .regex('Ch\\.\\s+(\\d+)', 1)
        .ifNotReturn($c.number(0).run())
        .number()
        .run();
    },
    getVolume($c) {
      return $c
        .querySelector('div.reader--meta.chapter')
        .ifNotReturn($c.number(0).run())
        .text()
        .regex('Vol\\.\\s+(\\d+)', 1)
        .ifNotReturn($c.number(0).run())
        .number()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .if(
          $c.querySelector('.rtl').boolean().run(),
          $c.querySelector('a[href*="/chapter/"]:has(.feather-chevron-left)').run(),
          $c.querySelector('a[href*="/chapter/"]:has(.feather-chevron-right)').run(),
        )
        .ifNotReturn($c.string('').run())
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getMalUrl($c) {
      return $c
        .getGlobalVariable('MAL', false)
        .ifThen($c => $c.return().run())
        .provider()
        .equals('ANILIST')
        .ifThen($c => $c.getGlobalVariable('ANILIST', false).return().run())
        .provider()
        .equals('KITSU')
        .ifThen($c => $c.getGlobalVariable('KITSU', false).return().run())
        .boolean(false)
        .run();
    },
    readerConfig: [
      {
        condition: '.md--progress-page .current',
        current: {
          selector: '.md--progress-page .current:last-child',
          mode: 'text',
          regex: '\\d+$',
        },
        total: {
          selector: '.md--progress-page:last-child > *:last-child',
          mode: 'text',
          regex: '\\d+$',
        },
      },
      {
        condition: '.md--reader-progress .page-number',
        current: {
          selector: '.md--reader-progress .page-number:first-child',
          mode: 'text',
          regex: '\\d+$',
        },
        total: {
          selector: '.md--reader-progress .page-number:last-child',
          mode: 'text',
          regex: '\\d+$',
        },
      },
      {
        current: {
          selector: '.md--reader-pages img',
          mode: 'countAbove',
        },
        total: {
          selector: '.md--reader-pages img',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('title').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('meta[property="og:title"]')
        .ifNotReturn()
        .getAttribute('content')
        .ifNotReturn()
        .regex('^.*(?= - MangaDex$)')
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(3).run();
    },
    uiInjection($c) {
      return $c.querySelector('[style*="synopsis"]').ifNotReturn().uiPrepend().run();
    },
    getMalUrl($c) {
      return $c
        .querySelector('a.tag[href^="https://myanimelist.net/"]')
        .ifThen($c => $c.getAttribute('href').setGlobalVariable('MAL').run())
        .querySelector('a.tag[href^="https://anilist.co/"]')
        .ifThen($c => $c.getAttribute('href').setGlobalVariable('ANILIST').run())
        .querySelector('a.tag[href^="https://kitsu.app/"]')
        .ifThen($c => $c.getAttribute('href').setGlobalVariable('KITSU').run())
        .getGlobalVariable('MAL', false)
        .ifThen($c => $c.return().run())
        .provider()
        .equals('ANILIST')
        .ifThen($c => $c.getGlobalVariable('ANILIST', false).return().run())
        .provider()
        .equals('KITSU')
        .ifThen($c => $c.getGlobalVariable('KITSU', false).return().run())
        .boolean(false)
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.bg-accent:has(.chapter)').run();
    },
    elementUrl($c) {
      return $c
        .find('a')
        .ifNotReturn($c.string('').run())
        .getAttribute('href')
        .ifNotReturn($c.string('').run())
        .urlAbsolute()
        .run();
    },
    elementEp($c) {
      return $c
        .if(
          $c.element().find('.font-bold:not(.ml-1):not(a)').boolean().run(),

          // multi line
          $c.element().find('a').getAttribute('title').run(),

          // single line
          $c.element().find('.font-bold:not(.ml-1):not(a)').text().run(),
        )
        .ifNotReturn($c.number(0).run())
        .regex('ch(apter)?\\.? *(\\d+)', 2)
        .ifNotReturn($c.number(0).run())
        .number()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c
        .addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString())
        .run();
    },
    ready($c) {
      return $c
        .detectChanges(
          $c
            .if(
              $c.url().urlPart(3).toLowerCase().equals('chapter').run(),
              $c.url().urlPart(4).run(),
              $c.url().urlStrip().run(),
            )
            .run(),
          $c.trigger().run(),
        )
        .trigger()
        .run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .if(
              $c.querySelector('.md--reader-pages img').boolean().run(),
              $c
                .querySelector('a.tag[href^="https://myanimelist.net/"]')
                .ifThen($c => $c.getAttribute('href').setGlobalVariable('MAL').run())
                .querySelector('a.tag[href^="https://anilist.co/"]')
                .ifThen($c => $c.getAttribute('href').setGlobalVariable('ANILIST').run())
                .querySelector('a.tag[href^="https://kitsu.app/"]')
                .ifThen($c => $c.getAttribute('href').setGlobalVariable('KITSU').run())
                .querySelector('img[src^="https://mangadex.org/covers/"]')
                .ifThen($c => $c.getAttribute('src').setGlobalVariable('image').run())
                .boolean(true)
                .run(),
              $c.boolean(false).run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('[style*="synopsis"]').boolean().run())
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c
            .string('__FIRST__|__LENGTH__')
            .replace(
              '__FIRST__',
              $c
                .if(
                  $c.querySelector('.chapter').boolean().run(),
                  $c.querySelectorAll('.chapter').get('length').get('length').string().run(),
                  $c.string('').run(),
                )
                .run(),
            )
            .replace('__LENGTH__', $c.getVariable('chapters').get('length').run())
            .run(),
          $c.trigger().run(),
        )
        .trigger()
        .run();
    },
  },
};
