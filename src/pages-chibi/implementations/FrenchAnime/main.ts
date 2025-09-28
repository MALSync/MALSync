import { PageInterface } from '../../pageInterface';

export const FrenchAnime: PageInterface = {
  name: 'French Anime',
  domain: 'https://french-anime.com',
  languages: ['French'],
  type: 'anime',
  urls: {
    match: ['*://*.french-anime.com/*'] 
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).regex('\\d+').boolean().run(),
          $c.querySelector('h1[itemprop="name"]').boolean().run()
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1[itemprop="name"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.querySelector('input[name="post_id"]').getAttribute('value').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      const section = $c.url().urlPart(3).run();
      const postId = $c.querySelector('input[name="post_id"]').getAttribute('value').ifNotReturn().run();
      return $c.string(`https://french-anime.com/${section}/${postId}.html`).run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('episode[_-](\\d+)', 1).number().run();
    }
  },  
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .domReady()
        .waitUntilTrue(
          $c.querySelector('h1[itemprop="name"]').boolean().run()
        )
        .ifThen($c => $c
          .title()
          .contains('Error 404')
          .ifThen($c => $c.string('404').log().return().run())
          .trigger()
          .run()
        )
        .run();
    },
  }
};
