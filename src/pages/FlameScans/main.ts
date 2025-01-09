import { pageInterface } from '../pageInterface';

export const FlameScans: pageInterface = {
  name: 'FlameScans',
  domain: 'https://flamecomics.xyz',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'series' && Boolean(utils.urlPart(url, 5));
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'series' && !utils.urlPart(url, 5);
  },
  sync: {
    getTitle(url) {
      return j.$('[class*="TopChapterNavbar_series_title"]').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(FlameScans.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      const overviewUrl = j.$('.mantine-Grid-inner').find('a:first').prop('href') || '';

      const temp = overviewUrl.split('/');

      if (temp[3] === 'series') return overviewUrl;

      temp.splice(3, 1);

      return temp.join('/');
    },
    getEpisode(url) {
      const elementEpN = j.$('[class*="TopChapterNavbar_chapter_title"]').text().trim();
      return getChapter(elementEpN);
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1.mantine-Title-root').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.mantine-Title-root').last().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('[class*="ChapterCard_chapterWrapper"]');
      },
      elementUrl(selector) {
        return selector.prop('href') || '';
      },
      elementEp(selector) {
        const elementEpN = selector.find('.mantine-Text-root').first().text().trim() || '';
        return getChapter(elementEpN);
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    let waitDebounce;
    const pageReady = function () {
      page.reset();
      clearInterval(waitDebounce);
      if (document.title.includes('Page not found')) {
        con.error('404');
        return;
      }
      if (FlameScans.isOverviewPage!(window.location.href)) {
        waitDebounce = utils.waitUntilTrue(
          () => FlameScans.overview!.getTitle(window.location.href),
          () => page.handlePage(),
        );
      } else if (FlameScans.isSyncPage!(window.location.href)) {
        waitDebounce = utils.waitUntilTrue(
          () => FlameScans.sync.getTitle(window.location.href),
          () => page.handlePage(),
        );
      }
    };

    j.$(document).ready(function () {
      utils.fullUrlChangeDetect(pageReady);
    });
  },
};

function getChapter(title) {
  const temp = title.match(/chapter \d+/gim);

  if (!temp || temp.length === 0) return 0;

  return Number(temp[0].replace(/\D+/g, ''));
}
