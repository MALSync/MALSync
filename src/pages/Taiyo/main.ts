import { pageInterface } from '../pageInterface';

const uiSelec = '.flex.justify-end.gap-2';

const { asyncWaitUntilTrue: awaitUi, reset: resetAwaitUi } = utils.getAsyncWaitUntilTrue(
  () => j.$(uiSelec).length,
);

const { asyncWaitUntilTrue: awaitReader, reset: resetawaitReader } = utils.getAsyncWaitUntilTrue(
  () => j.$('.grid-areas-mediaChapter img').length,
);

export const Taiyo: pageInterface = {
  name: 'Taiyo',
  domain: 'https://taiyo.moe',
  languages: ['Portuguese'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'chapter') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'media') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('.media-title').text();
    },
    getIdentifier(url) {
      return Taiyo.overview!.getIdentifier(Taiyo.sync.getOverviewUrl(url));
    },
    getOverviewUrl(url) {
      const urlObject = new URL(url);
      const baseUrl = urlObject.origin;
      return baseUrl + j.$('.media-title').attr('href') || '';
    },
    nextEpUrl(url) {
      const urlObject = new URL(url);
      const baseUrl = urlObject.origin;
      return baseUrl + j.$('.md\\:max-w-readerSidebar a:last-of-type').attr('href') || '';
    },
    getEpisode(url) {
      const chapterNumber = j.$('.chapter-number').text();

      const match = chapterNumber.match(/Capítulo (\d+)/);

      if (!match) return NaN;

      return parseInt(match[1]);
    },
    readerConfig: [
      {
        condition: '.chapter-currentPage',
        current: {
          selector: '.chapter-currentPage',
          mode: 'text',
          regex: '^\\d+',
        },
        total: {
          selector: '.chapter-currentPage',
          mode: 'text',
          regex: '\\d+$',
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return j.$('.media-title').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$(uiSelec).first().after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      // eslint-disable-next-line global-require
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.changeDetect(
      () => {
        page.reset();
        check();
      },
      () => {
        if (document.location.href.split('/')[3] === 'chapter') {
          return `${document.location.href.split('/')[3]}/${document.location.href.split('/')[4]}`;
        }
        return utils.urlStrip(document.location.href);
      },
    );
    check();

    async function check() {
      resetAwaitUi();
      resetawaitReader();
      if (
        !Taiyo.isSyncPage(document.location.href) &&
        !Taiyo.isOverviewPage!(document.location.href)
      )
        return;

      if (Taiyo.isSyncPage(document.location.href)) {
        await awaitReader();
      }
      if (Taiyo.isOverviewPage!(document.location.href)) {
        await awaitUi();
      }
      page.handlePage();
    }
  },
};
