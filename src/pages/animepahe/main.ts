/* By Deterio */
import { pageInterface } from '../pageInterface';

export const animepahe: pageInterface = {
  name: 'animepahe',
  domain: 'https://animepahe.com',
  languages: ['English'],
  database: 'animepahe',
  type: 'anime',
  isSyncPage(url) {
    if (window.location.href.split('/')[3] !== 'play') {
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
      return getId();
    },
    getOverviewUrl(url) {
      return getUrl(getId(), true);
    },
    getEpisode(url) {
      return Number((j.$('.theatre-info h1')[0].childNodes[2].textContent || '').replace(/[^0-9.]+/g, ''));
    },
    nextEpUrl(url) {
      const nextEp = j
        .$('.sequel a')
        .first()
        .attr('href');
      if (!nextEp) return '';
      return getUrl(getId(), false, 1);
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
      return getId();
    },
    uiSelector(selector) {
      j.$('.anime-detail').after(j.html(selector));
    },
    getMalUrl(provider) {
      let url = j
        .$('a[href^="//myanimelist.net/anime/"]')
        .not('#malRating')
        .first()
        .attr('href');
      if (url) return url.replace(/^\/\//, 'https://');
      if (provider === 'ANILIST') {
        url = j
          .$('a[href^="//anilist.co/anime/"]')
          .not('#malRating')
          .first()
          .attr('href');
        if (url) return url.replace(/^\/\//, 'https://');
      }
      if (provider === 'KITSU') {
        url = j
          .$('a[href^="//kitsu.io/anime/"]')
          .not('#malRating')
          .first()
          .attr('href');
        if (url) return url.replace(/^\/\//, 'https://');
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
    utils.waitUntilTrue(
      function() {
        if (!animepahe.isSyncPage(window.location.href))
          return animepahe.overview!.list!.elementsSelector!() && typeof getId() !== 'undefined';
        return typeof getId() !== 'undefined';
      },
      function() {
        page.handlePage(getUrl(getId(), false));
      },
    );
  },
};

let id;
function getId() {
  if (id) return id;
  // overview id
  const href = j.$('a[href^="//pahe.win/a/"]').attr('href');
  if (href) {
    id = href.split('/')[4];
    return id;
  }

  // episode id
  const script = $('script').filter(function(idx) {
    return this.innerHTML.includes('getUrls(');
  });
  if (script && script.length) {
    const matches = script[0].innerHTML.match(/getUrls\(\d+/);
    if (matches && matches.length) {
      id = matches[0].replace(/\D+/g, '');
      return id;
    }
  }
  return undefined;
}

function getUrl(aid, overviewForce, increment = 0) {
  if (window.location.href.split('/')[3] !== 'play' || overviewForce) {
    return `https://pahe.win/a/${aid}`;
  }
  return `https://pahe.win/a/${aid}/${animepahe.sync.getEpisode(window.location.href) + increment}`;
}
