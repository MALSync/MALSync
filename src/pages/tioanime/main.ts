import { pageInterface } from '../pageInterface';

export const tioanime: pageInterface = {
  name: 'tioanime',
  domain: 'https://tioanime.com',
  languages: ['Spanish'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'ver') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('div.container div.episode-single h1.anime-title')
        .text()
        .replace(/ \d+$/, '');
    },
    getIdentifier(url) {
      return utils.urlPart(tioanime.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j
          .$('div.episode-single div.options > div.episodes-nav > span > a[href^="/anime/"]')
          .first()
          .attr('href'),
        tioanime.domain,
      );
    },
    getEpisode(url) {
      return parseInt(url.match(/-(\d+$)/)![1]);
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j
          .$('div.episode-single div.options > div.episodes-nav > span > a[href^="/ver/"]')
          .eq(1)
          .attr('href'),
        tioanime.domain,
      );
    },
  },
  overview: {
    getTitle(url) {
      return j.$('article h1.title').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.principal')
        .first()
        .prepend(j.html(`<div class="info">${selector}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('section > ul.episodes-list > li > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), tioanime.domain);
      },
      elementEp(selector) {
        return tioanime.sync.getEpisode(tioanime.overview!.list!.elementUrl(selector));
      },
    },
    getMalUrl(provider) {
      const jikan = $('body')
        .html()
        .match(/api\.jikan\.moe\/v\d+\/anime\/(\d+)/im);

      if (jikan && jikan.length) {
        return `https://myanimelist.net/anime/${jikan[1]}`;
      }
      return false;
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
