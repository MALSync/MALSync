/* By Deterio */
import { pageInterface } from '../pageInterface';

export const animepahe: pageInterface = {
  name: 'animepahe',
  domain: 'https://animepahe.com',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] !== 'play') {
      return false;
    }
    return true;
  },
  sync: {
    getTitle(url) {
      return j
        .$('.theatre-info h1 a')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return animepahe.sync.getTitle(url);
    },
    getOverviewUrl(url) {
      return `${animepahe.domain}/anime/${animepahe.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return Number((j.$('.theatre-info h1')[0].childNodes[2].textContent || '').replace(/[^0-9.]+/g, ''));
    },
    nextEpUrl(url) {
      const nextEp = j
        .$('.sequel a')
        .first()
        .attr('href');
      if (!nextEp) return nextEp;
      return animepahe.domain + nextEp;
    },
    uiSelector(selector) {
      j.$('.anime-season').after(j.html(selector));
    },
  },
  overview: {
    getTitle(url) {
      return utils.getBaseText(j.$('.title-wrapper h1').first()).trim();
    },
    getIdentifier(url) {
      return animepahe.overview!.getTitle(url);
    },
    uiSelector(selector) {
      j.$('.anime-detail').after(j.html(selector));
    },
    getMalUrl(provider) {
      let url = j
        .$('a[href^="https://myanimelist.net/anime/"]')
        .not('#malRating')
        .first()
        .attr('href');
      if (url) return url;
      if (provider === 'ANILIST') {
        url = j
          .$('a[href^="https://anilist.co/anime/"]')
          .not('#malRating')
          .first()
          .attr('href');
        if (url) return url;
      }
      if (provider === 'KITSU') {
        url = j
          .$('a[href^="https://kitsu.io/anime/"]')
          .not('#malRating')
          .first()
          .attr('href');
        if (url) return url;
      }
      return false;
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.episode-list .episode');
      },
      elementUrl(selector) {
        const anchor = selector.find('a').first();

        if (!anchor) return '';

        const path = anchor.attr('href');

        if (!path) return '';

        return animepahe.domain + path;
      },
      elementEp(selector) {
        return Number(
          selector
            .find('.episode-number')
            .first()
            .text()
            .replace(selector.find('.episode-number > *').text(), ''),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    if (!animepahe.isSyncPage(page.url)) {
      utils.waitUntilTrue(
        function() {
          return animepahe.overview!.list!.elementsSelector!();
        },
        function() {
          page.handlePage();
        },
      );
    } else {
      $(document).ready(function() {
        page.handlePage();
      });
    }
  },
};
