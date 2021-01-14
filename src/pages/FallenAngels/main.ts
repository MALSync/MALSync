import { pageInterface } from '../pageInterface';

export const FallenAngels: pageInterface = {
  name: 'FallenAngels',
  domain: 'https://manga.fascans.com',
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
      return j
        .$('#navbar-collapse-1 > ul > li:nth-child(1) > a')
        .text()
        .replace(/manga$/gi, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return j.$('#navbar-collapse-1 > ul > li:nth-child(1) > a').attr('href') || '';
    },
    getEpisode(url) {
      return Number(url.split('/')[5]);
    },
    nextEpUrl(url) {
      const scriptContent = j.$('body > div.container-fluid > script').html();
      const nextChapterMatches = scriptContent.match(/next_chapter\s*=\s*".*"/gim);

      if (!nextChapterMatches || nextChapterMatches.length === 0) return '';

      const matchesOfRestOfNextChapter = nextChapterMatches[0].match(/"(.*?)"/gm);

      if (!matchesOfRestOfNextChapter || matchesOfRestOfNextChapter.length === 0) return '';

      return matchesOfRestOfNextChapter[0].replace(/(^"|"$)/gm, '');
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
      return utils.urlPart(url, 4);
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
          FallenAngels.domain,
        );
      },
      elementEp(selector) {
        return utils
          .absoluteLink(
            selector
              .find('h5 > a')
              .first()
              .attr('href'),
            FallenAngels.domain,
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
