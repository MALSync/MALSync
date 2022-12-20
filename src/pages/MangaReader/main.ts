import { pageInterface } from '../pageInterface';

type MangaReaderSyncData = {
  page: 'chapter' | 'manga';
  name: string;
  manga_id: string;
  mal_id: string;
  anilist_id: string;
  manga_url: string;
  selector_position?: string;
  chapter?: string;
  volume?: string;
  next_chapter_url?: string;
  next_volume_url?: string;
};

let jsonData: MangaReaderSyncData;

export const MangaReader: pageInterface = {
  name: 'MangaReader',
  domain: 'https://mangareader.to',
  languages: ['English', 'Japanese'],
  type: 'manga',
  database: 'MangaReader',
  isSyncPage(url) {
    return jsonData.page === 'chapter';
  },
  isOverviewPage(url) {
    return jsonData.page === 'manga';
  },
  sync: {
    getTitle(url) {
      return utils.htmlDecode(jsonData.name);
    },
    getIdentifier(url) {
      return jsonData.manga_id;
    },
    getOverviewUrl(url) {
      return jsonData.manga_url;
    },
    getEpisode(url) {
      return parseInt(jsonData.chapter!);
    },
    getVolume(url) {
      return parseInt(jsonData.volume!);
    },
    nextEpUrl(url) {
      return jsonData.next_chapter_url || jsonData.next_volume_url;
    },
    getMalUrl(provider) {
      if (jsonData.mal_id) return `https://myanimelist.net/manga/${jsonData.mal_id}`;
      if (provider === 'ANILIST' && jsonData.anilist_id)
        return `https://anilist.co/manga/${jsonData.anilist_id}`;
      return false;
    },
    readerConfig: [
      {
        current: {
          selector: '.hoz-current-index',
          mode: 'text',
          regex: '\\d+$',
        },
        total: {
          selector: '.hoz-total-image',
          mode: 'text',
        },
      },
      {
        current: {
          selector: '.iv-card',
          mode: 'countAbove',
        },
        total: {
          selector: '.iv-card',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return utils.htmlDecode(jsonData.name);
    },
    getIdentifier(url) {
      return jsonData.manga_id;
    },
    uiSelector(selector) {
      j.$(jsonData.selector_position!).append(j.html(selector));
    },
    getMalUrl(provider) {
      return MangaReader.sync.getMalUrl!(provider);
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('ul.lang-chapters.active li.chapter-item');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').attr('href'), MangaReader.domain);
      },
      elementEp(selector) {
        return Number(selector.attr('data-number'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    let _debounce;

    utils.changeDetect(check, () => j.$('#syncData').text());
    check();

    utils.changeDetect(
      () => page.handleList(),
      () => j.$('#c-selected-lang').text(),
    );

    function check() {
      page.reset();
      if (j.$('#syncData').length) {
        jsonData = JSON.parse(j.$('#syncData').text());

        clearTimeout(_debounce);
        _debounce = setTimeout(() => {
          page.handlePage();
        }, 500);
      }
    }
  },
};
