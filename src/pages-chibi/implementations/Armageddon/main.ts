import { PageInterface } from '../../pageInterface';

export const Armageddon: PageInterface = {
  name: 'Armageddon',
  domain: 'https://armageddontl.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://armageddontl.com/*'],
  },
  search: 'https://armageddontl.com/?s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .or(
          $c.url().urlPart(3).regex('(?:-ch(?:apter)?-\\d+(?:-\\d+)?)?$').boolean().run(),
          $c.url().urlParam('chapter').boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('[property="og:title"]')
        .getAttribute('content')
        .regex('^(?:\\[.*?\\]\\s*)?(.*?)(?:\\s*Ch(?:apter)? \\d+(?:\\.\\d+)?)?$', 1)
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(3).replaceRegex('-ch(?:apter)?-\\d+(?:-\\d+)?$', '').run();
    },
    getOverviewUrl($c) {
      return $c.url().urlStrip().replaceRegex('-ch(?:apter)?-\\d+(?:-\\d+)?(?=/|$)', '').run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          $c.url().urlPart(3).regex('(?:-ch(?:apter)?-(\\d+)(?:-\\d+)?)?$', 1).run(),
          $c.url().urlParam('chapter').string().split('.').at(0).run(),
          $c.string('NaN').run(),
        )
        .number()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('#chapter option:not([disabled]):has(+ :checked)')
        .ifNotReturn()
        .getAttribute('value')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '#select-paged option:checked',
          property: 'text',
          regex: '(\\d+)/\\d+',
          group: 1,
          mode: 'prop',
        },
        total: {
          selector: '#select-paged option:checked',
          property: 'text',
          regex: '\\d+/(\\d+)',
          group: 1,
          mode: 'prop',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.querySelector('#content.manga-info').boolean().run();
    },
    getTitle($c) {
      return $c.this('sync.getTitle').run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.entry-content').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#chapterlist li[data-num] .chbox').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.closest('li[data-num]').getAttribute('data-num').number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.domReady().detectURLChanges($c.trigger().run()).trigger().run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .fn(
              $c
                .querySelector('#readerarea-loading')
                .ifNotReturn()
                .getComputedStyle('display')
                .equals('none')
                .run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c
        .waitUntilTrue($c.this('list.elementsSelector').length().boolean().run())
        .trigger()
        .run();
    },
  },
};
