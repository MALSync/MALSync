import { pageInterface } from '../pageInterface';

let obfusList = false;

export const MangaKatana: pageInterface = {
  name: 'MangaKatana',
  domain: 'http://mangakatana.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[5] !== undefined && url.split('/')[5].length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return utils.getBaseText($('#breadcrumb_wrap > ol > li:nth-child(2) > a > span')).trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return j.$('#breadcrumb_wrap > ol > li:nth-child(2) > a').attr('href') || '';
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[5];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/c\d*/gi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl() {
      const nextEpisodeAnchor = document.querySelector('a.nav_button.next') as HTMLAnchorElement;

      if (nextEpisodeAnchor?.href.startsWith('javascript')) return '';

      return nextEpisodeAnchor.href;
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('div.info > h1.heading')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('#single_book')
        .first()
        .before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        if (
          typeof j.$("div.chapters:not('.uk-hidden') > table > tbody > tr") !== 'undefined' &&
          j.$("div.chapters:not('.uk-hidden') > table > tbody > tr").length
        ) {
          return j.$("div.chapters:not('.uk-hidden') > table > tbody > tr");
        }
        if (
          typeof window.location.href.split('/')[5] === 'undefined' &&
          typeof j
            .$('#single_book > script')
            .prev()
            .children()
            .children() !== 'undefined' &&
          j
            .$('#single_book > script')
            .prev()
            .children()
            .children().length
        ) {
          obfusList = true;
          return j
            .$('#single_book > script')
            .prev()
            .children()
            .children();
        }
        return j.$('.nowaythisexists');
      },
      elementUrl(selector) {
        if (!obfusList) {
          return utils.absoluteLink(
            selector
              .find('td > div.chapter > a')
              .first()
              .attr('href'),
            MangaKatana.domain,
          );
        }
        return utils.absoluteLink(
          selector
            .find('div > div > a')
            .first()
            .attr('href'),
          MangaKatana.domain,
        );
      },
      elementEp(selector) {
        if (!obfusList) {
          return MangaKatana.sync.getEpisode(
            String(
              selector
                .find('td > div.chapter > a')
                .first()
                .attr('href'),
            ),
          );
        }
        return MangaKatana.sync.getEpisode(
          String(
            selector
              .find('div > div > a')
              .first()
              .attr('href'),
          ),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[3] === 'manga' &&
        page.url.split('/')[4] !== undefined &&
        page.url.split('/')[4].length > 0
      ) {
        page.handlePage();
      }
    });
  },
};
