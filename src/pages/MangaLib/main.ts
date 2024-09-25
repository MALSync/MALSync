/* eslint-disable global-require */
import { pageInterface } from '../pageInterface';
import { SyncPage } from '../syncPage';
import { Manga, getMangaData, getChapterData, getChaptersData } from '../AnimeLib/api';

const { asyncWaitUntilTrue: awaitReaderLoading, reset: resetAwaitReader } =
  utils.getAsyncWaitUntilTrue(() => j.$('main img').length);

const { asyncWaitUntilTrue: awaitOverviewLoading, reset: resetAwaitOverview } =
  utils.getAsyncWaitUntilTrue(() => j.$('.n1_n3').length);

const manga: Manga = {
  data: {
    id: 0,
    name: '',
    rus_name: '',
    eng_name: '',
    slug_url: '',
    cover: {
      thumbnail: '',
      default: '',
    },
  },
  reader: {
    chapter: 0,
    total: 0,
    volume: 0,
    next: undefined,
  },
};
export const MangaLib: pageInterface = {
  name: 'MangaLib',
  domain: ['https://test-front.mangalib.me'],
  languages: ['Russian'],
  type: 'manga',
  getImage() {
    con.info('getImage', manga.data.cover);
    return manga.data.cover.default || manga.data.cover.thumbnail;
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
      con.info('getTitle', manga.data.eng_name);
      return manga.data.eng_name || manga.data.name || manga.data.rus_name;
    },
    getIdentifier(url) {
      con.info('getIdentifier', manga.data.id);
      return manga.data.id.toString();
    },
    getOverviewUrl(url) {
      con.info('getOverviewUrl', utils.absoluteLink(`ru/manga/${manga.data.id}`, MangaLib.domain));
      return utils.absoluteLink(`ru/manga/${manga.data.id}`, MangaLib.domain);
    },
    getEpisode(url) {
      con.info('getEpisode', manga.reader.chapter);
      return manga.reader.chapter;
    },
    getVolume(url) {
      con.info('getVolume', manga.reader.volume);
      return manga.reader.volume || 1;
    },
    nextEpUrl(url) {
      con.info('nextEpUrl', manga.reader.next);
      return manga.reader.next;
    },
    readerConfig: [
      {
        // TODO - Rewrite this conditions without random selectors
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
      con.info('getTitle', manga.data.eng_name);
      return manga.data.eng_name || manga.data.name || manga.data.rus_name;
    },
    getIdentifier(url) {
      con.info('getIdentifier', manga.data.id);
      return manga.data.id.toString();
    },
    uiSelector(selector) {
      j.$('.tabs._border').before(j.html(selector));
    },
  },
  init(page: SyncPage) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    j.$(() => {
      utils.fullUrlChangeDetect(check, true);
    });

    async function check() {
      page.reset();
      resetAwaitOverview();
      resetAwaitReader();
      con.info('Start checking', window.location.href);

      if (
        !MangaLib.isSyncPage(window.location.href) &&
        !MangaLib.isOverviewPage!(window.location.href)
      )
        return;

      // NOTE - if we are on sync page
      if (MangaLib.isSyncPage(window.location.href)) {
        con.info('This is a sync page');
        await updateSyncPage();
        await awaitReaderLoading();
      }

      // NOTE - if we are on overview page
      if (MangaLib.isOverviewPage!(window.location.href)) {
        con.info('This is a overview page');
        await updateOverviewPage();
        await awaitOverviewLoading();
      }

      page.handlePage();
    }
  },
};

async function updateOverviewPage() {
  const mangaSlug = utils.urlPart(window.location.href, 5);
  const { data: mangaData } = await getMangaData(mangaSlug);
  manga.data = mangaData;
}
async function updateSyncPage() {
  const mangaSlug = utils.urlPart(window.location.href, 4);
  const { data: mangaData } = await getMangaData(mangaSlug);
  manga.data = mangaData;

  const volumeString = utils.urlPart(window.location.href, 6);
  const chapterString = utils.urlPart(window.location.href, 7);

  if (volumeString && chapterString) {
    const { data: chapter } = await getChapterData(
      mangaSlug,
      chapterString,
      volumeString.substring(1),
    );
    manga.reader.chapter = Number(chapter.number || chapter.number_secondary || 1);
    manga.reader.volume = Number(chapter.volume || 1);

    const { data: chapters } = await getChaptersData(mangaSlug);
    if (chapters) {
      manga.reader.total = chapters.length;
      const currentEpisode = chapters.find(e => e.id === Number(manga.data.id));
      if (currentEpisode) {
        const currentIndex = chapters.indexOf(currentEpisode);
        if (currentIndex + 1 < manga.reader.total - 1) {
          const nextChapter = chapters[currentIndex + 1].number;
          manga.reader.next = utils.absoluteLink(
            `ru/${mangaSlug}/read/${volumeString}/c${nextChapter}`,
            MangaLib.domain,
          );
        }
      }
    }
  }
}
