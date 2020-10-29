import { pageInterface } from '../pageInterface';

export const MangaHere: pageInterface = getInter();

export function getInter(): pageInterface {
  let thisSelf;
  /* eslint-disable-next-line prefer-const */
  thisSelf = {
    name: 'MangaHere',
    domain: 'http://www.mangahere.cc',
    languages: ['English'],
    database: 'MangaFox',
    type: 'manga',
    isSyncPage(url) {
      if (url.split('/')[5] !== undefined && url.split('/')[5].length) {
        return true;
      }
      return false;
    },
    isOverviewPage(url) {
      if (url.split('/')[4] !== undefined && url.split('/')[4].length && !thisSelf.isSyncPage(url)) {
        return true;
      }
      return false;
    },
    sync: {
      getTitle(url) {
        return j.$('p.reader-header-title-1 > a:nth-child(1)').text();
      },
      getIdentifier(url) {
        return url.split('/')[4];
      },
      getOverviewUrl(url) {
        return utils.absoluteLink(j.$('p.reader-header-title-1 > a:nth-child(1)').attr('href'), thisSelf.domain);
      },
      getEpisode(url) {
        return getChapterNumber(j.$('p.reader-header-title-2').text());
      },
      getVolume(url) {
        const chapterText = j.$('p.reader-header-title-2').text();
        let temp = chapterText.match(/(vol\.|volume)\D?\d+/i);
        if (temp !== null) {
          temp = temp[0].match(/\d+/);
          if (temp !== null) {
            return parseInt(temp[0]);
          }
        }
        return NaN;
      },
      nextEpUrl(url) {
        const href = j.$('div.pager-list-left > a:contains("Next Chapter")').attr('href');
        if (href) return utils.absoluteLink(href, thisSelf.domain);
        return '';
      },
    },
    overview: {
      getTitle(url) {
        return j
          .$('span.detail-info-right-title-font')
          .first()
          .text();
      },
      getIdentifier(url) {
        return utils.urlPart(url, 4);
      },
      uiSelector(selector) {
        j.$('div.detail-main')
          .first()
          .before(j.html(selector));
      },
      list: {
        offsetHandler: false,
        elementsSelector() {
          return j.$('ul.detail-main-list > li');
        },
        elementUrl(selector) {
          return utils.absoluteLink(
            selector
              .find('a')
              .first()
              .attr('href') || '',
            thisSelf.domain,
          );
        },
        elementEp(selector) {
          return getChapterNumber(selector.find('a > div > p.title3').text());
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
  return thisSelf;
}

function getChapterNumber(text: string) {
  let temp = text.match(/(ch\.|chapter)\D?\d+/i);
  if (temp !== null) {
    temp = temp[0].match(/\d+/);
    if (temp !== null) {
      return parseInt(temp[0]);
    }
  }
  return 1;
}
