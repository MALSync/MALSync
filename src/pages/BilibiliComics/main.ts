import { pageInterface } from '../pageInterface';

export const BilibiliComics: pageInterface = {
  name: 'BilibiliComics',
  domain: 'https://manga.bilibili.com',
  languages: ['Chinese'],
  type: 'manga',
  isSyncPage(url) {
    return Boolean(utils.urlPart(url, 3) !== 'detail' && parseInt(utils.urlPart(url, 4)));
  },
  isOverviewPage(url) {
    return Boolean(utils.urlPart(url, 3) === 'detail' && utils.urlPart(url, 4));
  },
  getImage() {
    return j.$('.manga-cover img').first().attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('.manga-title').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('.manga-title').attr('href'), BilibiliComics.domain);
    },
    getEpisode(url) {
      const temp = j
        .$('[property="og:title"]')
        .attr('content')!
        .trim()
        .match(/^(\d+)/im);

      if (!temp) return NaN;

      return Number(temp[1]);
    },
    readerConfig: [
      {
        current: {
          selector: '.progress-indicator',
          mode: 'text',
          regex: '^\\d+',
        },
        total: {
          selector: '.progress-indicator',
          mode: 'text',
          regex: '\\d+$',
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return j.$('.manga-info .manga-title').first().text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.author-name, .manga-title-container').last().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.list-data .list-item');
      },
      elementEp(selector) {
        return Number(selector.find('.short-title').first().text());
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      start();
    });

    utils.urlChangeDetect(() => start());

    function start() {
      if (BilibiliComics.isSyncPage(page.url)) {
        utils.waitUntilTrue(
          () =>
            BilibiliComics.sync.getTitle(page.url) && j.$('[property="og:title"]').attr('content'),
          () => page.handlePage(),
        );
      } else if (BilibiliComics.isOverviewPage!(page.url)) {
        utils.waitUntilTrue(
          () => {
            const title = BilibiliComics.overview!.getTitle(page.url);
            return title && title !== '--';
          },
          () => page.handlePage(),
        );
      }
    }
  },
};
