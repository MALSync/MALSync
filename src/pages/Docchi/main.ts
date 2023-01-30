import { pageInterface } from '../pageInterface';

export const Docchi: pageInterface = {
  name: 'Docchi',
  domain: 'https://docchi.pl',
  languages: ['Polish'],
  type: 'anime',
  isSyncPage(url) {
    if(url.split('/')[5]){
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('a[mal_sync="title"]').text() || '';
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('a[mal_sync="title"]').attr('href'), Docchi.domain);
    },
    getEpisode(url) {
      return Number(j.$('a[mal_sync="episode"]').text());
    },
    nextEpUrl(url) {
      const href = j.$('a[mal_sync="title"]').attr('href');
      const episode = Number(j.$('a[mal_sync="episode"]').text())+1;

      return utils.absoluteLink(`${href}/${episode}`, Docchi.domain);
    },
  },
  overview: {
    getTitle(url) {
      return j.$('a[mal_sync="title"]').text();
    },
    getIdentifier(url) {
      return Docchi.sync!.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('div[mal_sync="episodes_list"]').before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div[mal_sync="episodes"]');
      },
      elementUrl(selector) {
        return utils.absoluteLink(j.$(selector).find("a").attr('href'), Docchi.domain);
      },
      elementEp(selector) {
        const ep = Number(j.$(selector).find('p.undefined.p-0.m-0').text().split(" ")[1]);
        return ep;
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    page.url = window.location.href;
    ready();
    utils.urlChangeDetect(function () {
      ready();
    });
    function ready() {
      page.reset();
      if (page.url.split('/')[3] === 'anime') {
        if (Docchi.isSyncPage(page.url)) {
          utils.waitUntilTrue(
            function () {
              if (j.$('a[mal_sync="title"]').length) {
                return true;
              }
              return false;
            },
            function () {
              page.handlePage();
            },
          );
        } else {
          page.reset();
          utils.waitUntilTrue(
            function () {
              if (j.$('a[mal_sync="title"]').length && j.$('a[mal_sync="title"]').text()) {
                return true;
              }
              return false;
            },
            function () {
              page.handlePage();
            },
          );
        }
      }
    }
  },
};
