import { pageInterface } from '../pageInterface';

const uiSelec = '[style*="synopsis"]';

const { asyncWaitUntilTrue: awaitUi, reset: resetAwaitUi } = utils.getAsyncWaitUntilTrue(
  () => j.$(uiSelec).length,
);

let listUpdate: number;

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
    nextEpUrl(url) {
      const dir = $('.rtl').length ? 'left' : 'right';
      const chev = j.$(`a[href*="/chapter/"] .feather-chevron-${dir}`).first();
      if (!chev.length) return '';

      const path = chev.closest('a[href*="/chapter/"]').first().attr('href');
      if (!path) return '';

      return utils.absoluteLink(path, Mangadex.domain);
    },
    getMalUrl(provider) {
      if (mangaData.links?.mal) return `https://myanimelist.net/manga/${mangaData.links.mal}`;
      if (provider === 'ANILIST' && mangaData.links?.al)
        return `https://anilist.co/manga/${mangaData.links.al}`;
      if (provider === 'KITSU' && mangaData.links?.kt)
        return `https://kitsu.io/manga/${mangaData.links.kt}`;
      return false;
    },
    readerConfig: [
      {
        condition: '.md--progress-page .current',
        current: {
          selector: '.md--progress-page .current:last-child',
          mode: 'text',
          regex: '\\d+$',
        },
        total: {
          selector: '.md--progress-page:last-child',
          mode: 'text',
          regex: '\\d+$',
        },
      },
      {
        current: {
          selector: '.md--reader-pages img',
          mode: 'countAbove',
        },
        total: {
          selector: '.md--reader-pages img',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return mangaData.title;
    },
    getIdentifier(url) {
      return mangaData.id;
    },
    uiSelector(selector) {
      j.$(uiSelec).first().prepend(j.html(selector));
    },
    getMalUrl(provider) {
      return Mangadex.sync.getMalUrl!(provider);
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.chapter').closest('.bg-accent');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), Mangadex.domain);
      },
      elementEp(selector) {
        // multi line
        let epText = selector.find('.font-bold:not(.ml-1):not(a)').first().text();
        // single line
        if (!epText) epText = selector.find('a').first().attr('title')!;
        const ep = epText.match(/ch(apter)?\.? *(\d+)/i);
        if (!ep) return 0;
        return Number(ep[2]);
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.changeDetect(
      () => {
        page.reset();
        check();
      },
      () => {
        const part = utils.urlPart(window.location.href, 3).toLowerCase();
        if (part === 'chapter') {
          return `${utils.urlPart(window.location.href, 3)}/${utils.urlPart(
            window.location.href,
            4,
          )}`;
        }
        return utils.urlStrip(window.location.href);
      },
    );
    check();

    async function check() {
      resetAwaitUi();
      clearInterval(listUpdate);
      if (
        !Mangadex.isSyncPage(window.location.href) &&
        !Mangadex.isOverviewPage!(window.location.href)
      )
        return;

      let manga: any = {};

      if (Mangadex.isSyncPage(window.location.href)) {
        const chapterResponse = await request(
          `chapter/${utils.urlPart(window.location.href, 4)}?includes[]=manga`,
        );
        const chapter = JSON.parse(chapterResponse.responseText);
        chapterData.chapter = chapter.data.attributes.chapter;
        chapterData.volume = chapter.data.attributes.volume;
        chapterData.translatedLanguage = chapter.data.attributes.translatedLanguage;
        manga.data = chapter.data.relationships.find(relation => relation.type === 'manga');
      }
      if (Mangadex.isOverviewPage!(window.location.href)) {
        const id = utils.urlPart(window.location.href, 4);
        if (id.toLowerCase() === 'random') throw 'The random page is not supported';
        const mangaResponse = await request(`manga/${id}?includes[]=cover_art`);
        manga = JSON.parse(mangaResponse.responseText);
        await awaitUi();

        listUpdate = utils.changeDetect(
          () => page.handleList(),
          () => $('.chapter').first().text() + $('.chapter').last().text(),
        );
      }

      mangaData.id = manga.data.id;
      const titleData = manga.data.attributes.title;
      mangaData.title =
        titleData[`${manga.data.attributes.originalLanguage}-ro`] ??
        titleData.en ??
        titleData[manga.data.attributes.originalLanguage] ??
        titleData[Object.keys(titleData)[0]];
      mangaData.links = manga.data.attributes.links;
      mangaData.coverFilename = manga.data.relationships?.find(
        relation => relation.type === 'cover_art',
      )?.attributes?.fileName;

      page.handlePage();
    }
  },
};

function request(path) {
  return api.request.xhr('GET', `https://api.mangadex.org/${path}`);
}
