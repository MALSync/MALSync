/* eslint-disable global-require */
import { pageInterface } from '../pageInterface';
import { SyncPage } from '../syncPage';
import { Manga, getMangaData, getChaptersData, isPageAPI } from '../AnimeLib/api';

const { asyncWaitUntilTrue: awaitReaderLoading, reset: resetAwaitReader } =
  utils.getAsyncWaitUntilTrue(() => j.$('main img').length);

const { asyncWaitUntilTrue: awaitOverviewLoading, reset: resetAwaitOverview } =
  utils.getAsyncWaitUntilTrue(() => j.$('.tabs-item').length);

const manga: Manga = {
  data: {
    id: 0,
    name: '',
    rus_name: '',
    eng_name: '',
    slug_url: '',
    cover: {
      thumbnail: undefined,
      default: undefined,
    },
  },
  reader: {
    chapter: 0,
    total: 1,
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
    return manga.data.cover.default || manga.data.cover.thumbnail;
  },
  isSyncPage(url) {
    return utils.urlPart(url, 5) === 'read' && !isPageAPI(url);
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 4) === 'manga' && !isPageAPI(url);
  },
  sync: {
    getTitle(url) {
      return manga.data.eng_name || manga.data.name || manga.data.rus_name;
    },
    getIdentifier(url) {
      return manga.data.id.toString();
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(`ru/manga/${manga.data.slug_url}`, MangaLib.domain);
    },
    getEpisode(url) {
      return manga.reader.chapter;
    },
    getVolume(url) {
      return manga.reader.volume || 1;
    },
    nextEpUrl(url) {
      return manga.reader.next;
    },
    readerConfig: [
      {
        current: {
          selector: 'footer',
          mode: 'text',
          regex: '(\\d+) / (\\d+)$',
          group: 1,
        },
        total: {
          selector: 'footer',
          mode: 'text',
          regex: '(\\d+) / (\\d+)$',
          group: 2,
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return manga.data.eng_name || manga.data.name || manga.data.rus_name;
    },
    getIdentifier(url) {
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

      if (
        !MangaLib.isSyncPage(window.location.href) &&
        !MangaLib.isOverviewPage!(window.location.href)
      )
        return;

      // NOTE - if we are on sync page
      if (MangaLib.isSyncPage(window.location.href)) {
        await updateSyncPage();
        await awaitReaderLoading();
      }

      // NOTE - if we are on overview page
      if (MangaLib.isOverviewPage!(window.location.href)) {
        await updateOverviewPage();
        await awaitOverviewLoading();
      }

      page.handlePage();
    }
  },
};

async function updateOverviewPage() {
  const mangaSlug = utils.urlPart(window.location.href, 5);
  const data = await getMangaData(mangaSlug);
  if (data) {
    manga.data = data.data;
  } else {
    const metadataJson = j.$('script[type="application/ld+json"]').text();
    if (!metadataJson) {
      try {
        const mangaMetadata = JSON.parse(metadataJson)[1];
        manga.data.rus_name = mangaMetadata.name || mangaMetadata.headline || '';
        const alternativeHeadline = mangaMetadata.alternativeHeadline[0];
        manga.data.eng_name = alternativeHeadline || '';
      } catch (e) {
        manga.data.eng_name = j.$('.container h2').text();
      }
    }
  }
}
async function updateSyncPage() {
  const mangaSlug = utils.urlPart(window.location.href, 4);

  // NOTE - Trying to get current manga from API, selectors overwise
  const data = await getMangaData(mangaSlug);
  if (data) {
    manga.data = data.data;
  } else {
    const idRegex = mangaSlug.match(/(\d+)/);
    manga.data.eng_name = j.$('a>div[data-media-up="sm"]').text();
    manga.data.id = idRegex ? Number(idRegex[0]) : 0;
    manga.data.slug_url = mangaSlug;
    // NOTE - There is no way no get cover image on sync page...
    manga.data.cover.default = undefined;
    manga.data.cover.thumbnail = undefined;
  }

  const volumeString = utils.urlPart(window.location.href, 6);
  const chapterString = utils.urlPart(window.location.href, 7);

  // NOTE - Trying to get chapter+volume from url, selectors overwise
  if (volumeString && chapterString) {
    manga.reader.chapter = Number(chapterString.substring(1));
    manga.reader.volume = Number(volumeString.substring(1));
  } else {
    const match = /(\d+\.\d+|\d+)\D+(\d+\.\d+|\d+)/;
    const current = j.$('header [data-media-up] div').last().text().match(match);
    if (current) {
      manga.reader.chapter = Number(current[2]);
      manga.reader.volume = Number(current[1]);
    } else {
      manga.reader.chapter = 1;
      manga.reader.volume = 1;
    }
  }

  // NOTE - Trying to get chapters from API, selectors overwise
  const chaptersData = await getChaptersData(mangaSlug);
  if (chaptersData) {
    const { data: chapters } = chaptersData;
    manga.reader.total = chapters.length;
    const currentEpisode = chapters.find(
      e =>
        e.number === manga.reader.chapter.toString() &&
        e.volume === manga.reader.volume!.toString(),
    );
    if (currentEpisode) {
      const currentIndex = chapters.indexOf(currentEpisode);
      if (currentIndex + 1 < manga.reader.total - 1) {
        const nextChapter = chapters[currentIndex + 1].number;
        const nextVolume = chapters[currentIndex + 1].volume;
        manga.reader.next = utils.absoluteLink(
          `ru/${mangaSlug}/read/v${nextVolume}/c${nextChapter}`,
          MangaLib.domain,
        );
      }
    }
  } else {
    const nextButton = j.$('header a[href]').last();
    manga.reader.next = utils.absoluteLink(nextButton.attr('href'), MangaLib.domain);
    if (data) {
      manga.reader.total = data.data.items_count!.total || data.data.items_count!.uploaded;
    }
  }
}
