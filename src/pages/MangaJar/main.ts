import { pageInterface } from '../pageInterface';

export const MangaJar: pageInterface = {
  name: 'MangaJar',
  domain: 'https://mangajar.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[5] === 'chapter') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[4] !== undefined && url.split('/')[4].length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('div.container-fluid.chapter-container > div > h1 > a').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j.$('div.container-fluid.chapter-container > div > h1 > a').attr('href'),
        MangaJar.domain,
      );
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 6));
    },
    getVolume(url) {
      let temp = utils
        .getBaseText(j.$('div.container-fluid.chapter-container > div > h1'))
        .match(/(vol\.|volume)\D?\d+/i);
      if (temp) {
        temp = temp[0].match(/\d+/);
        if (temp) {
          return parseInt(temp[0]);
        }
      }
      return 0;
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j
          .$('body > div.container-fluid.chapter-container > div.row.text-center > div > a.btn-primary')
          .first()
          .attr('href'),
        MangaJar.domain,
      );
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1.entry-title > span.post-name').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('h1.entry-title')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('ul.chaptersList > li.chapter-item');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href') || '',
          MangaJar.domain,
        );
      },
      elementEp(selector) {
        return MangaJar.sync.getEpisode(MangaJar.overview!.list!.elementUrl(selector));
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
