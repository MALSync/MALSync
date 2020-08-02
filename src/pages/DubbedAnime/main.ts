import { pageInterface } from '../pageInterface';

export const DubbedAnime: pageInterface = {
  name: 'DubbedAnime',
  domain: 'https://ww5.dubbedanime.net',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'episode') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('h1.dosis.ep-title')
        .text()
        .replace(/(episode|ova).*\d+/gim, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.absoluteLink(j.$('a.w-100.btn.btn-success').attr('href'), DubbedAnime.domain).split('/')[4];
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('a.w-100.btn.btn-success').attr('href'), DubbedAnime.domain);
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[4];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/-(episode|ova)-\d+-/gim);

      if (!temp || temp.length === 0) return 1;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j
          .$('body > div.container.mt-3.mb-3 > div > div.col-md-8 > div.row.mb-2 > div:nth-child(2) > a')
          .first()
          .attr('href'),
        DubbedAnime.domain,
      );
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('h1.h3.dosis.mt-0.text-white.pt-2.d-none.d-sm-block')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$('#episodes > div > div.row.mb-3.pr-2')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.da-page-episodes > ul.list-unstyled > li.da-tbl:not(.ongoing-ep-new,:hidden)');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('div.da-video-tbl > a')
            .first()
            .attr('href'),
          DubbedAnime.domain,
        );
      },
      elementEp(selector) {
        return selector
          .find('div.da-video-tbl > span.ep-num')
          .first()
          .text()
          .replace(/\D+/, '');
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'episode') {
        page.handlePage();
      } else if (page.url.split('/')[3] === 'anime') {
        page.handlePage();
        $('div.col-4.px-0 > button.subdub')
          .unbind('click')
          .click(function() {
            page.reset();
            page.handlePage();
          });
      }
    });
  },
};
