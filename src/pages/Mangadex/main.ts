import { pageInterface } from '../pageInterface';

const { asyncWaitUntilTrue: awaitUi, reset: resetAwaitUi } = utils.getAsyncWaitUntilTrue(
  () => j.$('.title__desktop').length,
);

const mangaData = {
  id: '',
  title: '',
  coverFilename: '',
  links: {
    mal: '',
    kt: '',
    al: '',
  },
};

const chapterData = {
  id: '',
  chapter: '',
  volume: '',
  translatedLanguage: '',
};

export const Mangadex: pageInterface = {
  name: 'Mangadex',
  domain: 'https://www.mangadex.org',
  database: 'Mangadex',
  languages: ['Many'],
  type: 'manga',
  isSyncPage(url) {
    return (
      typeof url.split('/')[3] !== 'undefined' &&
      url.split('/')[3] === 'chapter' &&
      typeof url.split('/')[4] !== 'undefined' &&
      url.split('/')[4].length > 0
    );
  },
  isOverviewPage(url) {
    return (
      typeof url.split('/')[3] !== 'undefined' &&
      url.split('/')[3] === 'title' &&
      typeof url.split('/')[4] !== 'undefined' &&
      url.split('/')[4].length > 0
    );
  },
  async getImage() {
    if (!mangaData.coverFilename) return undefined;
    return `https://uploads.mangadex.org/covers/${mangaData.id}/${mangaData.coverFilename}`;
  },
  sync: {
    getTitle(url) {
      return mangaData.title;
    },
    getIdentifier(url) {
      return mangaData.id;
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(`/title/${mangaData.id}`, Mangadex.domain);
    },
    getEpisode(url) {
      return parseInt(chapterData.chapter) || 1;
    },
    getVolume(url) {
      return parseInt(chapterData.volume);
    },
    getMalUrl(provider) {
      if (mangaData.links?.mal) return `https://myanimelist.net/manga/${mangaData.links.mal}`;
      if (provider === 'ANILIST' && mangaData.links?.al) return `https://anilist.co/manga/${mangaData.links.al}`;
      if (provider === 'KITSU' && mangaData.links?.kt) return `https://kitsu.io/manga/${mangaData.links.kt}`;
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return mangaData.title;
    },
    getIdentifier(url) {
      return mangaData.id;
    },
    uiSelector(selector) {
      j.$('div.title__desktop')
        .first()
        .after(j.html(selector));
    },
    getMalUrl(provider) {
      return Mangadex.sync.getMalUrl!(provider);
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    utils.changeDetect(
      () => {
        page.reset();
        check();
      },
      () => {
        const part = utils.urlPart(window.location.href, 3).toLowerCase();
        if (part === 'chapter') {
          return `${utils.urlPart(window.location.href, 3)}/${utils.urlPart(window.location.href, 4)}`;
        }
        return utils.urlStrip(window.location.href);
      },
    );
    check();

    async function check() {
      resetAwaitUi();
      if (!Mangadex.isSyncPage(window.location.href) && !Mangadex.isOverviewPage!(window.location.href)) return;

      let manga: any = {};

      if (Mangadex.isSyncPage(window.location.href)) {
        const chapterResponse = await request(`chapter/${utils.urlPart(window.location.href, 4)}?includes[]=manga`);
        const chapter = JSON.parse(chapterResponse.responseText);
        chapterData.chapter = chapter.data.attributes.chapter;
        chapterData.volume = chapter.data.attributes.volume;
        chapterData.translatedLanguage = chapter.data.attributes.translatedLanguage;
        manga.data = chapter.relationships.find(relation => relation.type === 'manga');
      }
      if (Mangadex.isOverviewPage!(window.location.href)) {
        const id = utils.urlPart(window.location.href, 4);
        if (id.toLowerCase() === 'random') throw 'The random page is not supported';
        const mangaResponse = await request(`manga/${id}?includes[]=cover_art`);
        manga = JSON.parse(mangaResponse.responseText);
        await awaitUi();
      }

      mangaData.id = manga.data.id;
      const titleData = manga.data.attributes.title;
      mangaData.title =
        titleData.en ?? titleData[manga.data.attributes.originalLanguage] ?? titleData[Object.keys(titleData)[0]];
      mangaData.links = manga.data.attributes.links;
      mangaData.coverFilename = manga.relationships?.find(
        relation => relation.type === 'cover_art',
      )?.attributes?.fileName;

      page.handlePage();
    }
  },
};

function request(path) {
  return api.request.xhr('GET', `https://api.mangadex.org/${path}`);
}
