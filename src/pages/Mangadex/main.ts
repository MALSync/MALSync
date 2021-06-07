import { pageInterface } from '../pageInterface';

let mangaData = {
  id: '',
  title: '',
  coverId: '',
  links: {
    mal: '',
    kt: '',
    al: '',
  },
};

let chapterData = {
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
    if (!mangaData.coverId) return undefined;
    try {
      const coverResponse = await request(`cover/${mangaData.coverId}`);
      const cover = JSON.parse(coverResponse.responseText);
      return `https://uploads.mangadex.org/covers/${mangaData.id}/${cover.data.attributes.fileName}`;
    } catch (e) {
      // do nothing
    }
    return undefined;
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
      if (mangaData.links.mal) return `https://myanimelist.net/manga/${mangaData.links.mal}`;
      if (provider === 'ANILIST' && mangaData.links.al) return `https://anilist.co/manga/${mangaData.links.al}`;
      if (provider === 'KITSU' && mangaData.links.kt) return `https://kitsu.io/manga/${mangaData.links.kt}`;
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
    utils.fullUrlChangeDetect(function() {
      page.reset();
      check();
    }, true);

    async function check() {
      if (!Mangadex.isSyncPage(window.location.href) && !Mangadex.isOverviewPage!(window.location.href)) return;

      if (Mangadex.isSyncPage(window.location.href)) {
        chapterData.id = utils.urlPart(window.location.href, 4);
        const chapterResponse = await request(`chapter/${chapterData.id}`);
        const chapter = JSON.parse(chapterResponse.responseText);
        chapterData.chapter = chapter.data.attributes.chapter;
        chapterData.volume = chapter.data.attributes.volume;
        chapterData.translatedLanguage = chapter.data.attributes.translatedLanguage;
        mangaData.id = chapter.relationships.find(relation => relation.type === 'manga').id;
      }
      if (Mangadex.isOverviewPage!(window.location.href)) {
        mangaData.id = utils.urlPart(window.location.href, 4);
      }

      const mangaResponse = await request(`manga/${mangaData.id}`);
      const manga = JSON.parse(mangaResponse.responseText);
      const titleData = manga.data.attributes.title;
      mangaData.title =
        titleData.en ?? titleData[manga.data.attributes.originalLanguage] ?? titleData[Object.keys(titleData)[0]];
      mangaData.links = manga.data.attributes.links;
      mangaData.coverId = manga.relationships.find(relation => relation.type === 'cover_art')?.id;

      page.handlePage();
    }
  },
};

function request(path): Promise<XMLHttpRequest> {
  return new Promise(function(resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://api.mangadex.org/${path}`);
    xhr.onload = function() {
      if (xhr.status === 200) {
        resolve(xhr);
      } else {
        reject(xhr);
      }
    };
    xhr.send();
  });
}
