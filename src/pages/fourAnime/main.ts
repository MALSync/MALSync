import { pageInterface } from '../pageInterface';

export const fourAnime: pageInterface = {
  name: '4Anime',
  domain: 'https://4anime.to',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (j.$('.singletitletop')[0] && j.$('.episodes')[0]) {
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
      const urlPart3 = utils.urlPart(url, 3);

      if (!urlPart3) return '';

      return urlPart3.replace(/-episode[^]*$/g, '');
    },
    getOverviewUrl(url) {
      return `${fourAnime.domain}/anime/${fourAnime.sync.getIdentifier(url)}`;
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
      const urlPart4 = utils.urlPart(url, 4);

      if (!urlPart4) return '';

      return urlPart4.replace(/-episode[^]*$/g, '');
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
      if ((j.$('.singletitletop')[0] && j.$('.episodes')[0]) || page.url.split('/')[3] === 'anime') {
        page.handlePage();
      }
    });
  },
};
