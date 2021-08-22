import { pageInterface } from '../pageInterface';

export const Mavanimes: pageInterface = {
  name: 'Mavanimes',
  domain: 'http://www.mavanimes.co/',
  languages: ['French'],
  type: 'anime',
  isSyncPage(url) {
    console.log('test length' + j.$('select').length);
    if (j.$('select').length) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    return false;
  },

  sync: {
    getTitle(url) {
      var title = j.$('meta[property="article:section"]').attr('content');
      if (!title) {
        console.log('No title');
        return '';
      }

      console.log(title.slice(0, -7));

      return title.slice(0, -7);
    },
    getIdentifier(url) {
      return Mavanimes.sync.getTitle(url);
    },
    getOverviewUrl(url) {
      var lst = url.split('-');
      lst.splice(-2, 1);
      return lst.join('-');
    },
    getEpisode(url) {
      const title = j
        .$('h1')
        .text()
        .split(' ');

      console.log('episode = ' + title[title.length - 2]);

      return Number(title[title.length - 2]);
    },
  },

  init(page) {
    console.log('salut');

      utils.waitUntilTrue(
        function() {
          return j.$('footer').length == 2;
        },
        function() {
          page.handlePage();
          setTimeout(function() {
            page.handleList();
          }, 500);
        },
      );
  },
};
