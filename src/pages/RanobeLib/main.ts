/* eslint-disable new-cap */
/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
import { SyncPage } from '../syncPage';
import { Manga, getMangaData, getChaptersData, isPageAPI, Chapters } from '../AnimeLib/api';
import { pageInterface } from '../pageInterface';
import { countAbove } from '../../utils/mangaProgress/modes/countAbove';
import { count } from '../../utils/mangaProgress/modes/count';

const { asyncWaitUntilTrue: awaitOverviewLoading, reset: resetAwaitOverview } =
  utils.getAsyncWaitUntilTrue(() => j.$('.tabs-item').length);

let interval: number | NodeJS.Timeout;

const novel: Manga = {
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
    total_subchapters: 1,
    current_subchapter: 0,
    current_subchapter_index: 0,
    volume: 0,
    next: undefined,
  },
};
export const RanobeLib: pageInterface = {
  name: 'RanobeLib',
  domain: ['https://ranobelib.me'],
  languages: ['Russian'],
  type: 'manga',
  getImage() {
    return novel.data.cover.default || novel.data.cover.thumbnail;
  },
  isSyncPage(url) {
    return utils.urlPart(url, 5) === 'read' && !isPageAPI(url);
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 4) === 'book' && !isPageAPI(url);
  },
  sync: {
    getTitle(url) {
      return novel.data.eng_name || novel.data.name || novel.data.rus_name;
    },
    getIdentifier(url) {
      return novel.data.id.toString();
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(`ru/book/${novel.data.slug_url}`, RanobeLib.domain);
    },
    getEpisode(url) {
      return novel.reader.chapter;
    },
    getVolume(url) {
      return novel.reader.volume || 1;
    },
    nextEpUrl(url) {
      return novel.reader.next;
    },
    readerConfig: [
      {
        current: {
          mode: 'callback',
          callback: () => {
            // NOTE - if chapter numbers are floats - 1.1 - 1.2 - 1.3 - 2.1 - 2.2 - 2.3
            // We count 'subchapters' as pages since 1.1 + 1.2 + 1.3 = WHOLE CHAPTER
            // If chapter are not floats we are switching to classic 'countAbove' variant
            let current = novel.reader.current_subchapter_index! + 1;
            if (!/\d+\.\d+/.test(utils.urlPart(window.location.href, 7))) {
              current = new countAbove().getProgress({
                selector: '[data-paragraph-index], .text-content p, .text-content img',
              });
            }
            return current;
          },
        },
        total: {
          mode: 'callback',
          callback: () => {
            // NOTE - For total pages we are using total number of 'subchapters' - 1.1 - 1.2 - 1.3 = 3 pages
            // We can only get them from 'getChaptersData' API call
            // If total subchapters = 1 we are switching to classic 'count' variant since subchapters = 1 means chapter number is not float
            // NOTE - Bypass 90% limit to make sure we read the last subchapter
            let total = (novel.reader.total_subchapters! / 90) * 100;
            if (!/\d+\.\d+/.test(utils.urlPart(window.location.href, 7))) {
              total = new count().getProgress({
                selector: '[data-paragraph-index], .text-content p, .text-content img',
              });
            }
            return total;
          },
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return novel.data.eng_name || novel.data.name || novel.data.rus_name;
    },
    getIdentifier(url) {
      return novel.data.id.toString();
    },
    uiSelector(selector) {
      j.$('.tabs._border').before(j.html(selector));
    },
  },
  init(page: SyncPage) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    page.novel = true;
    j.$(() => {
      utils.fullUrlChangeDetect(check, true);
    });

    async function check() {
      page.reset();
      resetAwaitOverview();
      clearInterval(interval);

      if (
        !RanobeLib.isSyncPage(window.location.href) &&
        !RanobeLib.isOverviewPage!(window.location.href)
      )
        return;

      // NOTE - if we are on sync page
      if (RanobeLib.isSyncPage(window.location.href)) {
        await updateSyncPage();
        utils.waitUntilTrue(
          () => j.$('[data-paragraph-index]').length || j.$('.text-content p').length,
          () => {
            interval = utils.changeDetect(
              async () => {
                page.reset();
                await updateSyncPage();
                page.handlePage();
              },
              () => window.location.search,
            );
          },
        );
      }

      // NOTE - if we are on overview page
      if (RanobeLib.isOverviewPage!(window.location.href)) {
        await updateOverviewPage();
        await awaitOverviewLoading();
      }

      page.handlePage();
    }
  },
};

async function updateOverviewPage() {
  const novelSlug = utils.urlPart(window.location.href, 5);
  const data = await getMangaData(novelSlug);
  if (data) {
    novel.data = data.data;
  } else {
    const idRegex = novelSlug.match(/(\d+)/);
    const animeId = Number(idRegex ? idRegex[0] : 0);
    novel.data.id = animeId;
    novel.data.slug_url = novelSlug;
    const metadataJson = j.$('script[type="application/ld+json"]').text();
    const novelMetadata = metadataJson ? JSON.parse(metadataJson)[1] : null;
    if (novelMetadata) {
      novel.data.rus_name = novelMetadata.name || novelMetadata.headline || '';
      novel.data.eng_name = novelMetadata.alternativeHeadline[0] || '';
      novel.data.cover.default = novelMetadata.image || '';
    } else {
      novel.data.rus_name = j.$('.container h1').text() || '';
      novel.data.eng_name = j.$('.container h2').text() || '';
      novel.data.cover.default = j.$('.cover__img').attr('src') || '';
    }
  }
}
async function updateSyncPage() {
  const novelSlug = utils.urlPart(window.location.href, 4);
  const novelData = await getMangaData(novelSlug);
  const chaptersData = await getChaptersData(novelSlug);
  const idRegex = novelSlug.match(/(\d+)/);
  const novelId = Number(idRegex ? idRegex[0] : 0);

  const haveNovelData = !!novelData;
  const haveChaptersData = !!chaptersData;

  if (haveNovelData) {
    getTotalChaptersAPI(novelData, undefined);
    getMangaDataAPI(novelData);
  } else {
    getMangaDataNoAPI(novelSlug, novelId);
    if (!haveChaptersData) {
      getTotalChaptersNoAPI();
    }
  }
  getChapterWithVolumeNoAPI();
  if (haveChaptersData) {
    getSubchaptersAPI(chaptersData);
    getNextChapterAPI(novelSlug, chaptersData);
    if (!haveNovelData) {
      getTotalChaptersAPI(undefined, chaptersData);
    }
  } else {
    getNextChapterNoAPI();
  }
}
function getTotalChaptersNoAPI() {
  // NOTE - No way to get total without API
  novel.reader.total = 1;
  novel.reader.total_subchapters = 1;
  novel.reader.current_subchapter_index = 0;
}
function getTotalChaptersAPI(novel_data?: Manga, chapters_data?: Chapters) {
  if (novel_data) {
    novel.reader.total =
      novel_data.data.items_count!.total || novel_data.data.items_count!.uploaded;
  }
  if (chapters_data) {
    novel.reader.total = chapters_data.data.length;
  }
  return novel.reader.total || 1;
}
function getNextChapterNoAPI() {
  const nextButton = j.$('header a[href]').last();
  novel.reader.next = utils.absoluteLink(nextButton.attr('href'), RanobeLib.domain);
}
function getSubchaptersAPI(chapters_data: Chapters) {
  const subChapters = chapters_data.data.filter(
    c =>
      c.number.split('.')[0] === `${novel.reader.chapter}` && c.volume === `${novel.reader.volume}`,
  );
  if (subChapters.length > 1 && !subChapters.find(c => !c.number.includes('.'))) {
    novel.reader.total_subchapters = subChapters.length;
    const currentSubChapter = subChapters.find(
      c => c.number === novel.reader.current_subchapter!.toString(),
    );
    if (currentSubChapter) {
      novel.reader.current_subchapter_index = subChapters.indexOf(currentSubChapter);
    }
  } else {
    novel.reader.total_subchapters = 1;
    novel.reader.current_subchapter_index = 0;
  }
}
function getNextChapterAPI(novel_slug: string, chapters_data: Chapters) {
  const currentEpisode = chapters_data.data.find(
    e => e.number === `${novel.reader.current_subchapter}` && e.volume === `${novel.reader.volume}`,
  );
  if (currentEpisode) {
    const currentIndex = chapters_data.data.indexOf(currentEpisode);
    if (currentIndex + 1 < getTotalChaptersAPI(undefined, chapters_data) - 1) {
      const nextChapter = chapters_data.data[currentIndex + 1].number;
      const nextVolume = chapters_data.data[currentIndex + 1].volume;
      novel.reader.next = utils.absoluteLink(
        `ru/${novel_slug}/read/v${nextVolume}/c${nextChapter}`,
        RanobeLib.domain,
      );
    }
  }
}
function getChapterWithVolumeNoAPI() {
  const volumeString = utils.urlPart(window.location.href, 6);
  const chapterString = utils.urlPart(window.location.href, 7);

  if (volumeString && chapterString) {
    novel.reader.current_subchapter = Number(chapterString.substring(1));
    novel.reader.chapter = Math.floor(Number(chapterString.substring(1)));
    novel.reader.volume = Number(volumeString.substring(1));
  } else {
    const match = /(\d+\.\d+|\d+)\D+(\d+\.\d+|\d+)/;
    const current = j.$('header [data-media-up] div').last().text().match(match);
    if (current) {
      novel.reader.current_subchapter = Number(current[2]);
      novel.reader.chapter = Math.floor(Number(current[2]));
      novel.reader.volume = Number(current[1]);
    }
  }
}
function getMangaDataNoAPI(novel_slug: string, novelId: number) {
  novel.data.eng_name = j.$('a>div[data-media-up="sm"]').text();
  novel.data.id = novelId;
  novel.data.slug_url = novel_slug;
  // NOTE - There is no way no get cover image on sync page...
  novel.data.cover.default = undefined;
  novel.data.cover.thumbnail = undefined;
}
function getMangaDataAPI(novel_data: Manga) {
  novel.data = novel_data.data;
}
