import { pageInterface } from '../pageInterface';

export const fourAnime: pageInterface = {
  name: '4Anime',
  domain: 'https://4anime.to',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (j.$('.singletitletop').length && j.$('.episodes').length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('span.singletitletop a')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(fourAnime.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return j.$('span.singletitletop a').attr('href') || '';
    },
    getEpisode(url) {
      return Number(
        j
          .$('ul.episodes a.active')
          .text()
          .replace(/\D+/g, ''),
      );
    },
    nextEpUrl(url) {
      const href = j
        .$('.anipager-next a')
        .first()
        .attr('href');
      if (typeof href !== 'undefined') {
        return utils.absoluteLink(href, fourAnime.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('p.single-anime-desktop')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('p.description-mobile')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.episodes.range a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), fourAnime.domain);
      },
      elementEp(selector) {
        return Number(selector.text());
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if ((j.$('.singletitletop').length && j.$('.episodes').length) || page.url.split('/')[3] === 'anime') {
        page.handlePage();
      }
    });
  },
};
