import { pageInterface } from '../pageInterface';

export const Goyabu: pageInterface = {
  name: 'Goyabu',
  domain: 'https://goyabu.com',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'videos') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'assistir') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('div.sidebar-holder.kanra-info > span:nth-child(2)').text();
    },
    getIdentifier(url) {
      return Goyabu.sync.getOverviewUrl(url).split('/')[4];
    },
    getOverviewUrl(url) {
      return j.$('div.kanra-controls > a[href*="/assistir/"]').attr('href') || '';
    },
    getEpisode(url) {
      return getEpisode(j.$('#main > div > div.left-single > h1').text());
    },
    nextEpUrl(url) {
      return j
        .$('div.kanra-controls > a[rel="next"]')
        .first()
        .attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('div.anime-title > h1')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.anime-single-index.episodes-container')
        .first()
        .before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.anime-single-index.episodes-container div.anime-episode');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').attr('href'), Goyabu.domain);
      },
      elementEp(selector) {
        return getEpisode(selector.find('h3').text());
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};

function getEpisode(text) {
  if (text.length === 0) return NaN;

  const matches = text.match(/(episódio|episodio)\s*\d+/gim);

  if (!matches || matches.length === 0) return 1;

  return Number(matches[0].replace(/\D+/g, ''));
}
