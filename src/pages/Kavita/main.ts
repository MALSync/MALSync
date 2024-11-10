import { pageInterface } from '../pageInterface';
import { pathToUrl, urlToSlug } from '../../utils/slugs';


async function apiCall(url: string) {
  let authToken = JSON.parse(window.localStorage.getItem!("kavita-user") || '{}').token;
  return api.request
    .xhr('GET', {
      url: url,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`
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
};

async function getChapterProgress() {
  let chapterID = window.location.pathname.split("/")[6];
  let url = `${window.location.origin}/api/reader/get-progress?chapterid=${chapterID}`;
  let response = await apiCall(url);
  let responseJSON = JSON.parse(response.responseText);
  con.log('Chapter Progress Retrieved', response);

  // Handle weird kavita api case where current page number is 1 lesser than what it actually is
  // unless it is the last page
  if (parseInt(responseJSON.pageNum) < parseInt(chapterDetails.totalPageNum)) {
    chapterDetails.currentPageNum = responseJSON.pageNum + 1;
  } else {
    chapterDetails.currentPageNum = chapterDetails.totalPageNum;
  }

};

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
      return window.location.href.split("/").slice(0, 7).join("/");
    },
    getEpisode(url) {
      if (!chapterDetails.chapterNum || !parseInt(chapterDetails.chapterNum)) throw 'No chapter number';
      return parseInt(chapterDetails.chapterNum);
    },
    getVolume(url) {
      return parseInt(chapterDetails.volumeNum);
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
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    let progressUpdater;
    utils.changeDetect(
      () => {
        check();
      },
      () => {
        return utils.urlStrip(window.location.href);
      },
    );
    check();

    async function getSeriesDetails() {
      let seriesID = window.location.pathname.split("/")[4];

      let url = `${window.location.origin}/api/series/${seriesID}`;
      let response = await apiCall(url);
      let responseJSON = JSON.parse(response.responseText);
      con.log('Series Details Retrieved', responseJSON);

      seriesDetails.seriesTitle = responseJSON.name;
      seriesDetails.seriesID = seriesID;
      seriesDetails.totalPageNum = responseJSON.pages;
    };

    async function getChapterDetails() {
      let chapterID = window.location.pathname.split("/")[6];

      let url = `${window.location.origin}/api/reader/chapter-info?chapterid=${chapterID}`;
      let response = await apiCall(url);
      let responseJSON = JSON.parse(response.responseText);
      con.log('Chapter Info Retrieved', response);

      chapterDetails.volumeNum = responseJSON.volumeNumber;
      chapterDetails.chapterNum = responseJSON.chapterNumber;
      chapterDetails.totalPageNum = responseJSON.pages;

    };


    function resetDetails() {
      chapterDetails.volumeNum = '';
      chapterDetails.chapterNum = '';
      chapterDetails.currentPageNum = '';
      chapterDetails.totalPageNum = '';

      seriesDetails.seriesTitle = '';
      seriesDetails.seriesID = '';
      seriesDetails.totalPageNum = '';
    }

    async function check() {
      page.reset();
      con.log('check called')
      clearInterval(progressUpdater);
      if (
        !Kavita.isSyncPage!(window.location.href) &&
        !Kavita.isOverviewPage!(window.location.href)
      )
        return;

      await getSeriesDetails();

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
