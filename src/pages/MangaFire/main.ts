import { pageInterface } from '../pageInterface';

type MangaFireSyncData = {
  page: 'chapter' | 'overview' | 'volume';
  number: string;
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

let jsonData: MangaFireSyncData;

export const MangaFire: pageInterface = {
  name: 'MangaFire',
  domain: 'https://mangafire.to',
  database: 'MangaFire',
  languages: ['English', 'Japanese', 'French', 'Spanish', 'Portuguese'],
  type: 'manga',
  isSyncPage(url) {
    return jsonData.page === 'chapter' || jsonData.page === 'volume';
  },
  isOverviewPage(url) {
    return jsonData.page === 'overview';
  },
  sync: {
    getTitle(url) {
      return utils.htmlDecode(jsonData.name);
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return jsonData.manga_url;
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 6);

      const temp = episodePart.match(/chapter-(\d+)/im);

      if (!temp) return NaN;

      return Number(temp[1]);
    },
    getVolume(url) {
      const episodePart = utils.urlPart(url, 6);

      const temp = episodePart.match(/volume-(\d+)/im);

      if (!temp) return NaN;

      return Number(temp[1]);
    },
    nextEpUrl(url) {
      const temp =
        jsonData.next_chapter_url!.match(/https:\/\/mangafire.to\/read\/.+/im) ||
        jsonData.next_volume_url!.match(/https:\/\/mangafire.to\/read\/.+/im);
      return temp![0];
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
          selector: '.step > form > input',
          property: 'placeholder',
          regex: '^[^-]*',
          mode: 'prop',
        },
        total: {
          selector: '.step .total',
          mode: 'text',
        },
      },
      {
        current: {
          selector: '.vertical > .page',
          mode: 'countAbove',
        },
        total: {
          selector: '.vertical > .page',
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
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$(jsonData.selector_position!).append(j.html(selector));
    },
    getMalUrl(provider) {
      return MangaFire.sync.getMalUrl!(provider);
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.chapter-list.lang-chapter[style=""] > li.item');
      },
      elementUrl(selector) {
        return selector.find('a').attr('href')!;
      },
      elementEp(selector) {
        return Number(selector.attr('data-number'));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      // eslint-disable-next-line global-require
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    let _debounce;

    utils.changeDetect(check, () => j.$('#syncData').text());
    check();

    utils.changeDetect(
      () => page.handleList(),
      () => j.$('.dropdown.language').text(),
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
