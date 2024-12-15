import { pageInterface } from '../pageInterface';

export const FlameScans: pageInterface = {
  name: 'FlameScans',
  domain: 'https://flamecomics.xyz',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (utils.urlPart(url, 5) === '') {
      return false;
    }
    return true;
  },
  sync: {
    getTitle(url) {
      return j.$('[class*="TopChapterNavbar_series_title"]').text().trim();
    },
    getIdentifier(url) {
      return replaceId(utils.urlPart(FlameScans.sync.getOverviewUrl(url), 4));
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

      const temp = elementEpN.match(/chapter \d+/gim);

      if (!temp || temp.length === 0) return 0;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const data = JSON.parse(j.$('#__NEXT_DATA__').text());
      const next = data.props.pageProps.next || undefined;

      if (!next || next === '#/next/') return undefined;

      const temp = url.split('/');

      temp.splice(5, 1);
      
      temp.push(next);

      return temp.join('/');
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1.mantine-Title-root').text().trim();
    },
    getIdentifier(url) {
      if (utils.urlPart(url, 3) === 'series') {
        return replaceId(utils.urlPart(url, 4));
      }
      return replaceId(utils.urlPart(url, 5));
    },
    uiSelector(selector) {
      j.$('[class*="SeriesPage_coverWrapper"]')
        .first()
        .after(
          j.html(
            `<div id= "malthing" style="background: #2e2e2e;border: 1px solid #3b3b3b;margin-top: 20px;"><div class="releases"><h2>MAL-Sync</h2></div>${selector}</div>`,
          ),
        );
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

        const temp = elementEpN.match(/\d+/gim);

        if (!temp || temp.length === 0) return 0;

        return Number(temp[0].replace(/\D+/g, ''));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (document.title.includes('Page not found')) {
        con.error('404');
        return;
      }
      if (j.$('.mantine-Title-root').length && j.$('[class*="ChapterCard_chapterWrapper"]').length) {
        page.handlePage();
      }
      if (j.$('[class*="TopChapterNavbar_series_title"]').length) {
        utils.waitUntilTrue(
          function () {
            if (j.$('#__NEXT_DATA__').first().length) {
              return true;
            }
            return false;
          },
          function () {
            page.handlePage();
          },
        );
      }
    });
  },
};

function replaceId(id: string) {
  return id.replace(/^\d+-/g, '');
}
