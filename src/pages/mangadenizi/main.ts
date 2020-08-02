import { pageInterface } from '../pageInterface';

export const mangadenizi: pageInterface = {
  name: 'mangadenizi',
  domain: 'https://mangadenizi.com',
  languages: ['Turkish'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[5] !== undefined && url.split('/')[5].length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('#navbar-collapse-1 > ul > li:nth-child(1) > a').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    getOverviewUrl(url) {
      return j.$('#navbar-collapse-1 > ul > li:nth-child(1) > a').attr('href') || '';
    },
    getEpisode(url) {
      return Number(url.split('/')[5]);
    },
    nextEpUrl(url) {
      const script = j.$('body > div.container-fluid > script')[0].innerHTML;
      let matches = script.match(/next_chapter\s*=\s*".*"/gim);

      if (!matches || matches.length === 0) return '';

      matches = matches[0].match(/"(.*?)"/gm);

      if (!matches || matches.length === 0) return '';

      return matches[0].replace(/(^"|"$)/gm, '');
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('h2.widget-title')
        .first()
        .text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      j.$('h2.widget-title')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('ul.chapters > li');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('h5 > a')
            .first()
            .attr('href'),
          mangadenizi.domain,
        );
      },
      elementEp(selector) {
        return utils
          .absoluteLink(
            selector
              .find('h5 > a')
              .first()
              .attr('href'),
            mangadenizi.domain,
          )
          .split('/')[5];
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'manga') {
        page.handlePage();
      }
    });
  },
};
