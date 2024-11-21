import { pageInterface } from '../pageInterface';
import { pathToUrl, urlToSlug } from '../../utils/slugs';

async function apiCall(url: string) {
  const authToken = JSON.parse(window.localStorage.getItem('kavita-user') || '{}').token;
  return api.request.xhr('GET', {
    url,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  });
}

const chapterDetails = {
  volumeNum: '',
  chapterNum: '',
  currentPageNum: '',
  totalPageNum: '',
};

const seriesDetails = {
  seriesTitle: '',
  seriesID: '',
  totalPageNum: '',
  anilistLink: '',
  kitsuLink: '',
  malLink: '',
};

async function getChapterProgress() {
  const chapterID = window.location.pathname.split('/')[6];
  const url = `${window.location.origin}/api/reader/get-progress?chapterid=${chapterID}`;
  const response = await apiCall(url);
  const responseJSON = JSON.parse(response.responseText);
  con.log('Chapter Progress Retrieved', response);

  // Handle weird kavita api case where current page number is 1 lesser than what it actually is
  // unless it is the last page
  if (parseInt(responseJSON.pageNum) < parseInt(chapterDetails.totalPageNum)) {
    chapterDetails.currentPageNum = responseJSON.pageNum + 1;
  } else {
    chapterDetails.currentPageNum = chapterDetails.totalPageNum;
  }
}

export const Kavita: pageInterface = {
  name: 'Kavita',
  domain: 'https://demo.kavitareader.com',
  languages: ['Many'],
  type: 'manga',
  isSyncPage(url) {
    return utils.urlPart(url, 7) === 'manga' && utils.urlParam(url, 'incognito') !== 'true';
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 5) === 'series' && url.split('/').length === 7;
  },
  sync: {
    getTitle(url) {
      if (!seriesDetails.seriesTitle) throw 'No Title';
      return seriesDetails.seriesTitle;
    },
    getIdentifier(url) {
      if (!seriesDetails.seriesID) throw 'No series id';
      return seriesDetails.seriesID;
    },
    getOverviewUrl(url) {
      return window.location.href.split('/').slice(0, 7).join('/');
    },
    getEpisode(url) {
      return parseInt(chapterDetails.chapterNum) || 1;
    },
    getVolume(url) {
      return parseInt(chapterDetails.volumeNum);
    },
    getMalUrl(provider) {
      if (seriesDetails.malLink) return seriesDetails.malLink;
      if (provider === 'ANILIST' && seriesDetails.anilistLink) return seriesDetails.anilistLink;
      if (provider === 'KITSU' && seriesDetails.kitsuLink) return seriesDetails.kitsuLink;
      return false;
    },
    readerConfig: [
      {
        current: {
          callback: () => chapterDetails.currentPageNum as any,
          mode: 'callback',
        },
        total: {
          callback: () => chapterDetails.totalPageNum as any,
          mode: 'callback',
        },
      },
    ],
  },
  overview: {
    getTitle() {
      if (!seriesDetails.seriesTitle) throw 'No name';
      return seriesDetails.seriesTitle;
    },
    getIdentifier(url) {
      if (!seriesDetails.seriesID) throw 'No series id';
      return seriesDetails.seriesID;
    },
    uiSelector(selector) {
      return j.$('h4').first().after(j.html(selector));
    },
    getMalUrl(provider) {
      return Kavita.sync.getMalUrl!(provider);
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    let progressUpdater;
    utils.changeDetect(
      () => {
        waitForPageLoad();
      },
      () => {
        return utils.urlStrip(window.location.href);
      },
    );
    waitForPageLoad();

    async function getSeriesDetails() {
      const seriesID = window.location.pathname.split('/')[4];

      const url = `${window.location.origin}/api/series/${seriesID}`;
      const response = await apiCall(url);
      const responseJSON = JSON.parse(response.responseText);
      con.log('Series Details Retrieved', responseJSON);

      seriesDetails.seriesTitle = responseJSON.name;
      seriesDetails.seriesID = seriesID;
      seriesDetails.totalPageNum = responseJSON.pages;
    }

    async function getChapterDetails() {
      const chapterID = window.location.pathname.split('/')[6];

      const url = `${window.location.origin}/api/reader/chapter-info?chapterid=${chapterID}`;
      const response = await apiCall(url);
      const responseJSON = JSON.parse(response.responseText);
      con.log('Chapter Info Retrieved', response);

      chapterDetails.volumeNum = responseJSON.volumeNumber;
      chapterDetails.chapterNum = responseJSON.chapterNumber < 0 ? 0 : responseJSON.chapterNumber;
      chapterDetails.totalPageNum = responseJSON.pages;
    }

    function waitForPageLoad() {
      let checkRan = false;
      const intervalId = setInterval(async () => {
        if (j.$('.spinner-border span').length) {
          clearInterval(intervalId);
          utils.waitUntilTrue(
            () => j.$('.spinner-border span').length === 0,
            () => {
              checkRan = true;
              check();
            },
          );
        }
      }, 100);

      // After 0.5 seconds, proceed with check() if it hasn't been run yet
      setTimeout(() => {
        clearInterval(intervalId);
        if (!checkRan) {
          check();
        }
      }, 500);
    }

    function getLinks() {
      seriesDetails.anilistLink =
        j.$('[href^="https://anilist.co/manga/"]').attr('href') ?? seriesDetails.anilistLink;
      seriesDetails.malLink =
        j.$('[href^="https://myanimelist.net/manga/"]').attr('href') ?? seriesDetails.malLink;
      seriesDetails.kitsuLink =
        j.$('[href^="https://kitsu.app/manga/"]').attr('href') ?? seriesDetails.kitsuLink;
    }

    async function check() {
      page.reset();
      clearInterval(progressUpdater);
      if (!Kavita.isSyncPage(window.location.href) && !Kavita.isOverviewPage!(window.location.href))
        return;

      await getSeriesDetails();
      if (Kavita.isOverviewPage!(window.location.href)) {
        getLinks();
      }

      if (Kavita.isSyncPage(window.location.href)) {
        await getChapterDetails();
        await getChapterProgress();
        progressUpdater = setInterval(async () => {
          await getChapterProgress();
        }, 1000);
      }

      con.log('Handle Page Chapter Details', chapterDetails);
      con.log('Handle Page Series Details', seriesDetails);
      page.handlePage();
    }
  },
};
