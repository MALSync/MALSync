import { PageInterface } from '../../pageInterface';

export const Novelfire: PageInterface = {
  name: 'Novelfire',
  domain: 'https://novelfire.net',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://novelfire.net/*'],
  },
  computedType: $c => {
    return $c.string('novel').run();
  },
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(5).matches('chapter[_-]').run();
    },
    getTitle($c) {
      return $c.url().querySelector('.booktitle').text().ifNotReturn().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.url().split('/').slice(0, 5).join('/').run();
    },
    getEpisode($c) {
      return getEpisode(
        $c
          .setVariable('chapterUrlPart', $c.url().urlPart(5).run())
          .setVariable('chapterName', $c.querySelector('.chapter-title').text().run()),
      ).run();
    },
    getVolume($c) {
      return getVolume(
        $c.setVariable('chapterName', $c.querySelector('.chapter-title').text().run()),
      ).run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.chapternav a[rel="next"][href*="https"]')
        .ifNotReturn()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '#content p',
          mode: 'countAbove',
        },
        total: {
          selector: '#content p',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('book').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).equals('chapters').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.text2row').text().ifNotReturn().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.novel-item').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.chapter-list > li').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return getEpisode(
        $c
          .setVariable('chapterUrlPart', $c.this('list.elementUrl').urlPart(5).run())
          .setVariable('chapterName', $c.target().find('.chapter-title').text().run()),
      ).run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.domReady().trigger().run();
    },
  },
};

const multiRegex = ['vol(?:ume)? (\\d+) (\\d+)', '(\\d+)[-_](\\d+)'];

function getEpisode($c) {
  return $c.coalesce(
    // Volume 2 5
    $c
      .getVariable('chapterName')
      .log()
      .regex(multiRegex[0], 2)
      .ifThen($c => $c.number().run())
      .run(),
    // Chapter 80
    $c
      .getVariable('chapterName')
      .log()
      .regex('chap(?:ter)? (\\d+)', 1)
      .ifThen($c => $c.number().run())
      .run(),
    // 2-35
    $c
      .getVariable('chapterName')
      .log()
      .regex(multiRegex[1], 2)
      .ifThen($c => $c.number().run())
      .run(),
    // 35
    $c
      .getVariable('chapterName')
      .log()
      .regex('^(\\d+)', 1)
      .ifThen($c => $c.number().run())
      .run(),
    $c.getVariable('chapterUrlPart').regex('chapter[_-](\\d+)', 1).number().run(),
  );
}

function getVolume($c) {
  return $c.coalesce(
    // Volume 2 5
    $c
      .getVariable('chapterName')
      .log()
      .regex(multiRegex[0], 1)
      .ifThen($c => $c.number().run())
      .run(),
    // Vol 5
    $c
      .getVariable('chapterName')
      .log()
      .regex('(?:vol(?:ume)?|book) (\\d+)', 1)
      .ifThen($c => $c.number().run())
      .run(),
    // 2-35
    $c
      .getVariable('chapterName')
      .log()
      .regex(multiRegex[1], 1)
      .ifThen($c => $c.number().run())
      .run(),
  );
}
