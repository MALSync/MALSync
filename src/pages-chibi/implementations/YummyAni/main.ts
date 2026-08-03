import { PageInterface } from '../../pageInterface';

export const YummyAni: PageInterface = {
  name: 'YummyAni',
  domain: ['https://old.yummyani.me'],
  languages: ['Russian', 'Ukrainian'],
  type: 'anime',
  urls: {
    match: ['*://*.yummyani.me/*'],
    player: {
      kodik: ['*://kodikplayer.com/*'],
      alloha: ['*://alloha.yani.tv/*'],
      cvh: ['*://ru.yummyani.me/iframeCVH.html*'],
    },
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(4).equals('item').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.alt-names-list').find('li').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(5).run();
    },
    getOverviewUrl($c) {
      return $c.url().run();
    },
    getEpisode($c) {
      return $c.querySelector('.pQCG').text().regex('[0-9.]+').number().run();
    },
    getImage($c) {
      return $c.querySelector('img.bordered-top').getAttribute('src').ifNotReturn().run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malUrl: $c.querySelector('.mal-color .link').getAttribute('href').run(),
        })
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .title()
        .contains('Страница не найдена')
        .ifThen($c => $c.string('404').log().return().run())
        .domReady()
        .detectChanges($c.querySelector('.pQCG').ifNotReturn().text().run(), $c.trigger().run())
        
        .trigger()
        .run();
    },
  },
  search: 'https://old.yummyani.me/search?word={searchtermPlus}',
};
