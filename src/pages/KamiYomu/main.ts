import { pageInterface } from '../pageInterface';

async function apiCall(url: string) {
  url = window.location.origin + url;
  con.log('Api Call', url);
  return api.request.xhr('GET', url);
}

const chapter = {
  libraryId: '',
  chapterDownloadId: '',
  chapterNumber: 0,
  volumeNumber: 0,
  totalPages: 0,
};

const series = {
  name: '',
  links: {} as Record<string, string>,
};

// KamiYomu URL patterns:
//   Reader:   /Reader/MangaReader/{libraryId}/chapter/{chapterDownloadId}
//   Overview: /Libraries/MangaInfo/{libraryId}

export const KamiYomu: pageInterface = {
  name: 'KamiYomu',
  domain: 'http://localhost:8090',
  languages: ['Many'],
  type: 'manga',
  isSyncPage(url) {
    return (
      utils.urlPart(url, 3) === 'MangaReader' &&
      utils.urlParam(url, 'incognito') !== 'true'
    );
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'MangaInfo';
  },
  sync: {
    getTitle(_url) {
      if (!series.name) throw 'No title';
      return series.name;
    },
    getIdentifier(_url) {
      if (!chapter.libraryId) throw 'No libraryId';
      return chapter.libraryId;
    },
    getOverviewUrl(_url) {
      return `${window.location.origin}/Libraries/MangaInfo/${chapter.libraryId}`;
    },
    getEpisode(_url) {
      return chapter.chapterNumber || 1;
    },
    getVolume(_url) {
      return chapter.volumeNumber || 0;
    },
    getMalUrl(provider) {
      if (series.links['mal']) return series.links['mal'];
      if (provider === 'ANILIST' && series.links['al']) return series.links['al'];
      if (provider === 'KITSU' && series.links['kt']) return series.links['kt'];
      return false;
    },
    readerConfig: [
      {
        current: {
          mode: 'url',
          regex: '(\\?|&)page=(\\d+)',
          group: 2,
        },
        total: {
          callback: () => chapter.totalPages as any,
          mode: 'callback',
        },
      },
    ],
  },
  overview: {
    getTitle(_url) {
      if (!series.name) throw 'No title';
      return series.name;
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('h1, h2, h3').first().after(j.html(selector));
    },
    getMalUrl(provider) {
      return KamiYomu.sync.getMalUrl!(provider);
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('table tbody tr, .chapter-row');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector.find('a').first().attr('href'),
          KamiYomu.domain,
        );
      },
      elementEp(selector) {
        const text = selector.find('td, .chapter-number').first().text().trim();
        return Number(text.replace(/[^\d.]/g, '')) || 0;
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    utils.changeDetect(load, () => window.location.href.split('?')[0].split('#')[0]);
    load();

    function resetState() {
      chapter.libraryId = '';
      chapter.chapterDownloadId = '';
      chapter.chapterNumber = 0;
      chapter.volumeNumber = 0;
      chapter.totalPages = 0;
      series.name = '';
      series.links = {};
    }

    function setLinksFromManga(manga: any) {
      if (!manga || !manga.links) return;
      Object.values(manga.links as Record<string, string>).forEach((linkUrl: string) => {
        if (!linkUrl) return;
        if (linkUrl.includes('myanimelist.net/manga') && !series.links['mal'])
          series.links['mal'] = linkUrl;
        else if (linkUrl.includes('anilist.co/manga') && !series.links['al'])
          series.links['al'] = linkUrl;
        else if (linkUrl.includes('kitsu.app/manga') && !series.links['kt'])
          series.links['kt'] = linkUrl;
      });
    }

    async function loadCollectionItem(libraryId: string) {
      const res = await apiCall(`/Public/api/v1/Collection/${libraryId}`);
      const data = JSON.parse(res.responseText);
      con.m('Collection').log(data);
      if (data.manga) {
        series.name = data.manga.title || '';
        setLinksFromManga(data.manga);
      }
    }

    async function load() {
      resetState();
      page.reset();

      const url = window.location.href;

      if (KamiYomu.isSyncPage(url)) {
        // /Reader/MangaReader/{libraryId}/chapter/{chapterDownloadId}
        chapter.libraryId = utils.urlPart(url, 4);
        chapter.chapterDownloadId = utils.urlPart(url, 6);
        if (!chapter.libraryId || !chapter.chapterDownloadId) return;

        try {
          const chRes = await apiCall(
            `/Public/api/v1/Collection/${chapter.libraryId}/chapters/${chapter.chapterDownloadId}`,
          );
          const chData = JSON.parse(chRes.responseText);
          con.m('Chapter').log(chData);
          chapter.chapterNumber = chData.number ?? 0;
          chapter.volumeNumber = chData.volume ?? 0;
          await loadCollectionItem(chapter.libraryId);
        } catch (e) {
          con.error('KamiYomu init error', e);
          return;
        }

        page.handlePage();
      } else if (KamiYomu.isOverviewPage!(url)) {
        // /Libraries/MangaInfo/{libraryId}
        chapter.libraryId = utils.urlPart(url, 4);
        if (!chapter.libraryId) return;

        try {
          await loadCollectionItem(chapter.libraryId);
        } catch (e) {
          con.error('KamiYomu overview init error', e);
          return;
        }

        page.handlePage();
      }
    }
  },
};
