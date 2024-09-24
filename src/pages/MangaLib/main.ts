import { pageInterface } from '../pageInterface';
import { SyncPage } from '../syncPage';

const { asyncWaitUntilTrue: awaitReaderLoading, reset: resetAwaitReader } =
  utils.getAsyncWaitUntilTrue(() => j.$('main img').length);

const { asyncWaitUntilTrue: awaitOverviewLoading, reset: resetAwaitOverview } =
  utils.getAsyncWaitUntilTrue(() => j.$('.n1_n3').length);

type TMangaData = {
  id: string;
  title: string;
  cover: string;
  reader: {
    volume: number;
    chapter: number;
  };
};

const mangaData: TMangaData = {
  id: '',
  title: '',
  cover: '',
  reader: {
    volume: 0,
    chapter: 0,
  },
};

export const MangaLib: pageInterface = {
  name: 'MangaLib',
  domain: ['https://test-front.mangalib.me'],
  languages: ['Russian'],
  type: 'manga',
  getImage() {
    con.info('getImage', mangaData.cover);
    return mangaData.cover;
  },
  isSyncPage(url) {
    con.info('isSyncPage', utils.urlPart(url, 5) === 'read');
    return utils.urlPart(url, 5) === 'read';
  },
  isOverviewPage(url) {
    con.info('isOverviewPage', utils.urlPart(url, 4) === 'manga');
    return utils.urlPart(url, 4) === 'manga';
  },
  sync: {
    getTitle(url) {
      con.info('getTitle', mangaData.title);
      return mangaData.title;
    },
    getIdentifier(url) {
      con.info('getIdentifier', mangaData.id);
      return mangaData.id;
    },
    getOverviewUrl(url) {
      con.info('getOverviewUrl', utils.absoluteLink(`ru/manga/${mangaData.id}`, MangaLib.domain));
      return utils.absoluteLink(`ru/manga/${mangaData.id}`, MangaLib.domain);
    },
    getEpisode(url) {
      con.info('getEpisode', mangaData.reader.chapter);
      return mangaData.reader.chapter;
    },
    getVolume(url) {
      con.info('getVolume', mangaData.reader.volume);
      return mangaData.reader.volume;
    },
    nextEpUrl(url) {
      const next = j.$('a.q2_bj.q2_r').last().attr('href');
      con.info('nextEpUrl', utils.absoluteLink(next, MangaLib.domain));
      return utils.absoluteLink(next, MangaLib.domain);
    },
    readerConfig: [
      {
        // TODO - Check this conditions
        condition: '.jv_jw[data-reader-mode="vertical"]',
        current: {
          selector: '.x7_k0',
          mode: 'text',
          regex: '\n(\\d+) / (\\d+)',
          group: 1,
        },
        total: {
          selector: '.x7_k0',
          mode: 'text',
          regex: '\n(\\d+) / (\\d+)',
          group: 2,
        },
      },
      {
        condition: '.jv_jw[data-reader-mode="horizontal"]',
        current: {
          selector: '.xy_j8',
          mode: 'countAbove',
        },
        total: {
          selector: '.xy_j8',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      con.info('getTitle', mangaData.title);
      return mangaData.title;
    },
    getIdentifier(url) {
      con.info('getIdentifier', mangaData.id);
      return mangaData.id;
    },
    uiSelector(selector) {
      j.$('.tabs._border').before(j.html(selector));
    },
  },
  init(page: SyncPage) {
    api.storage.addStyle(
      // eslint-disable-next-line global-require
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    j.$(() => {
      utils.fullUrlChangeDetect(check, true);
    });

    async function check() {
      page.reset();
      resetAwaitOverview();
      resetAwaitReader();
      con.info('Start checking', page.url);

      if (!MangaLib.isSyncPage(page.url) && !MangaLib.isOverviewPage!(page.url)) return;

      let manga_id: string = '';

      // NOTE - if we are on sync page
      if (MangaLib.isSyncPage(page.url)) {
        con.info('This is a sync page');
        const v = utils.urlPart(page.url, 6).substring(1);
        const c = utils.urlPart(page.url, 7).substring(1);
        manga_id = utils.urlPart(page.url, 4);
        mangaData.reader.chapter = Number(c);
        mangaData.reader.volume = Number(v);
        await awaitReaderLoading();
      }
      // NOTE - if we are on overview page
      if (MangaLib.isOverviewPage!(page.url)) {
        con.info('This is a overview page');
        manga_id = utils.urlPart(page.url, 5);

        await awaitOverviewLoading();
      }

      // NOTE - handling data for manga
      const { data } = await getData(manga_id);
      con.log('manga_id', manga_id);
      con.log('data', data);
      mangaData.id = data.slug_url;
      mangaData.cover = data.cover.default;
      if (data.eng_name) {
        mangaData.title = data.eng_name;
      } else if (data.name) mangaData.title = data.name;
      else if (data.ru_name) mangaData.title = data.ru_name;

      page.handlePage();
    }
  },
};

function apiRequest(path: string) {
  return api.request.xhr('GET', `https://api.mangalib.me/api/${path}`);
}

async function getData(manga_id: string) {
  const data = await apiRequest(`manga/${manga_id}`);
  return JSON.parse(data.responseText);
}
