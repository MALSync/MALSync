import { PageInterface } from '../../pageInterface';

export const MangaLivreTV: PageInterface = {
  name: 'MangaLivreTV',
  domain: 'https://toonlivre.net',
  languages: ['Portuguese'],
  type: 'manga',
  urls: {
    match: ['*://toonlivre.net/*'],
  },
  search: 'https://toonlivre.net/?s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).boolean().run(),
          $c.url().urlPart(4).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('h2')
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(3).run();
    },
    getImage($c) {
      return $c
        .querySelector('img[alt]')
        .getAttribute('src')
        .ifNotReturn()
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/<slug>')
        .replace('<slug>', $c.url().urlPart(3).run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(4).number().run();
    },
    readerConfig: [
      {
        current: {
          selector: '[data-page]',
          mode: 'attr',
          attribute: 'data-page',
        },
        total: {
          selector: 'canvas[aria-label]',
          mode: 'attr',
          attribute: 'aria-label',
          regex: 'Page (\\d+)',
          group: 1,
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).boolean().run(),
          $c.url().urlPart(4).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('h2')
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(3).run();
    },
    getImage($c) {
      return $c
        .querySelector('img[alt]')
        .getAttribute('src')
        .ifNotReturn()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('h2').parent().uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c
        .querySelectorAll('.divide-y:last-of-type > div[class*="p-4"]')
        .run();
    },
    elementUrl($c) {
      return $c
        .string('/<slug>/<number>')
        .replace('<slug>', $c.url().urlPart(3).run())
        .replace('<number>', $c.find('span').text().regex('Capítulo\\s+(\\d+(?:\\.\\d+)?)', 1).trim().run())
        .urlAbsolute()
        .run();
    },
    elementEp($c) {
      // Extract chapter number from the text (e.g., "Capítulo 171" → 171)
      // Remove decimals and convert to integer
      return $c
        .find('span')
        .text()
        .regex('Capítulo\\s+(\\d+)(?:\\.\\d+)?', 1)
        .number()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
  },
};
