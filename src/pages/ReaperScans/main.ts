import { pageInterface } from '../pageInterface';

export const ReaperScans: pageInterface = {
  name: 'ReaperScans',
  domain: ['https://reaperscans.com', 'https://reaperscans.net'],
  languages: ['English', 'Portuguese'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[2].endsWith('.net')) {
      return utils.urlPart(url, 5).startsWith('capitulo');
    }
    return utils.urlPart(url, 5) === 'chapters';
  },
  isOverviewPage(url) {
    if (url.split('/')[4] !== undefined && url.split('/')[4].length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      if (url.split('/')[2].endsWith('.net')) {
        return j.$('div.chapter-heading > h5 > a').text().trim();
      }
      return j.$('div.text-center > p').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      if (url.split('/')[2].endsWith('net')) {
        return utils.absoluteLink(
          j.$('div.chapter-heading > h5 > a').first().attr('href'),
          'https://reaperscans.net',
        );
      }
      return utils.absoluteLink(
        j.$('.fa-list').closest('a[href*="/comics/"]').attr('href'),
        'https://reaperscans.com',
      );
    },
    getEpisode(url) {
      let temp = 0;

      const titlePart = document.title.match(/(chapter|capítulo) (\d+)/i);

      if (titlePart && titlePart[1]) {
        temp = Number(titlePart[1]);
      }

      if (!temp) {
        if (url.split('/')[2].endsWith('.net')) {
          const episodePart = utils.urlPart(url, 5).match(/capitulo-(\d+)/i);
          if (episodePart) temp = Number(episodePart[1]);
        } else {
          const episodePart = utils.urlPart(url, 6).match(/chapter-(\d+)/i);
          if (episodePart) temp = Number(episodePart[1]);
        }
      }

      if (!temp) return 0;

      return temp;
    },
    nextEpUrl(url) {
      if (url.split('/')[2].endsWith('.net')) {
        return utils.absoluteLink(
          j.$('div.next-chap > a').first().attr('href'),
          'https://reaperscans.net',
        );
      }
      return utils.absoluteLink(j.$('a:contains(Next)').attr('href'), 'https://reaperscans.com');
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('h1').first().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        if (document.URL.split('/')[2].endsWith('.net')) {
          return j.$('div.season > ul > a');
        }
        return j.$('div.pb-4 > div > div > ul > li');
      },
      elementUrl(selector) {
        if (document.URL.split('/')[2].endsWith('.net')) {
          return utils.absoluteLink(selector.attr('href'), 'https://reaperscans.net');
        }
        return utils.absoluteLink(
          selector.find('a').first().attr('href'),
          'https://reaperscans.com',
        );
      },
      elementEp(selector) {
        return ReaperScans.sync.getEpisode(ReaperScans.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      page.handlePage();
    });

    utils.changeDetect(
      () => page.handleList(),
      () => j.$(ReaperScans.overview!.list!.elementsSelector()).text(),
    );
  },
};
