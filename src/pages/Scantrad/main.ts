import { pageInterface } from '../pageInterface';

export const Scantrad: pageInterface = {
  name: 'Scantrad',
  domain: 'https://scantrad.net',
  languages: ['French'],
  type: 'manga',
  isSyncPage(url) {
    return url.split('/')[3] === 'mangas';
  },
  sync: {
    getTitle(url) {
      return utils
        .urlPart(url, 4)
        .replace(/-/g, ' ')
        .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl() {
      return utils.absoluteLink(
        j
          .$('.logo_box')
          .first()
          .attr('href'),
        Scantrad.domain,
      );
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 5));
    },
    nextEpUrl() {
      const href = j.$('a.next_chapitre').attr('href');

      if (href && href.split('/')[3] === 'forum') {
        return '';
      }
      return utils.absoluteLink(href, Scantrad.domain);
    },
  },
  overview: {
    getTitle() {
      return j
        .$('div.titre')
        .clone()
        .children()
        .remove()
        .end()
        .text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    uiSelector(selector) {
      j.$('.ct-top').after(
        j.html(`<h3 class="home-titre" style="margin-top: 31px;">MAL-Sync</h3><div class="new-main">${selector}</div>`),
      );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#chapitres > div.chapitre ');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a[href*="/mangas/"]').attr('href') || '', Scantrad.domain);
      },
      elementEp(selector) {
        return Scantrad.sync.getEpisode(Scantrad.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        (page.url.split('/')[3] === 'mangas' && typeof page.url.split('/')[4] !== 'undefined') ||
        (j.$('body > div.main-fiche > div.mf-chapitre > div.ct-top > div.info > div.titre').length &&
          j.$('#chap-top').length)
      ) {
        page.handlePage();
      }
    });
  },
};
