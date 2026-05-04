import { PageInterface } from '../../pageInterface';

export const SushiAnimes: PageInterface = {
  name: 'SushiAnimes',
  domain: ['https://sushianimes.com.br/'],
  languages: ['Portuguese'],
  type: 'anime',
  urls: {
    match: ['*://sushianimes.com.br/*'],
  },
  search: 'https://sushianimes.com.br/search/{searchtermRaw}',

  sync: {
    isSyncPage($c) {
      return $c
        .or(
          $c.url().urlPart(4).contains('episode').run(),
          $c.url().urlPart(3).equals('filme').run(),
        )
        .run();
    },
    getTitle($c) {
      const fullTitle = $c.querySelector('.caption-content h1').text().split('|');
      const season = $c.if(
        fullTitle.at(1).isEmpty().run(),
        $c.number(0).run(),
        fullTitle.at(1).string().split(' ').at(2).trim().run(),
      );
      return $c
        .if(
          season.greaterThanOrEqual(2).run(),
          fullTitle.at(0).trim().concat(' Season ').concat(season.string().run()).run(),
          fullTitle.at(0).trim().run(),
        )
        .replace('(Dublado)', '')
        .run();
    },
    getIdentifier($c) {
      const urlArray = $c.url().urlPart(4).split('-');
      const season = urlArray.reverse().at(3);
      return $c
        .if(
          urlArray.last().equals('episode').run(),
          urlArray
            .if(
              season.greaterThanOrEqual(2).run(),
              urlArray.reverse().at(4).concat('-season-').concat(season.run()).run(),
              urlArray.reverse().at(4).run(),
            )
            .run(),
          urlArray.last().run(),
        )
        .run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('.home-list').find('a').getAttribute('href').ifNotReturn().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(4).split('-').reverse().at(1).run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.pl-md-5:not(.disabled)')
        .getAttribute('href')
        .ifNotReturn($c.url().run())
        .run();
    },
  },

  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).contains('episode').not().run(),
          $c.url().urlPart(3).equals('filme').not().run(),
        )
        .or($c.url().urlPart(3).equals('anime').run(), $c.url().urlPart(3).equals('assistir').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('#title').text().replace('(Dublado)', '').trim().run();
    },
    getIdentifier($c) {
      const season = $c.querySelector('.episodes > .active').getAttribute('id');
      const urlId = $c.url().urlPart(4).split('-').last();
      return $c
        .if(
          $c.url().urlPart(3).equals('assistir').run(),
          urlId.run(),
          $c
            .if(
              season.split('-').last().greaterThanOrEqual(2).run(),
              urlId.concat('-').concat(season.ifNotReturn().run()).run(),
              urlId.run(),
            )
            .run(),
        )
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('[id^=epx-root]').uiPrepend().run();
    },
    getImage($c) {
      return $c.querySelector('.media > img').getAttribute('src').ifNotReturn().run();
    },
  },

  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.episodes > .active > .epx-card').ifNotReturn().run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('title').split('º').at(0).number().run();
    },
  },

  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .domReady()
        .and($c.this('isOverviewPage').run(), $c.url().urlPart(3).contains('anime').run())
        .ifThen($c =>
          $c.detectChanges(
              $c.querySelector('.episodes').find('.active').getAttribute('id').run(),
              $c.trigger().run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
  },
};
