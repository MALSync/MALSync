import { pageInterface } from '../pageInterface';

export const MangaPlus: pageInterface = {
  name: 'MangaPlus',
  domain: 'https://mangaplus.shueisha.co.jp',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'viewer') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('h1.Navigation-module_title_180OT').first().text();
    },
    getIdentifier(url) {
      const identifierHref = j.$('h1.Navigation-module_title_180OT').first().parent().attr('href');

      if (!identifierHref || identifierHref.length < 3) return '';

      return identifierHref.split('/')[2];
    },
    getOverviewUrl(url) {
      return (
        MangaPlus.domain +
        (j.$('h1.Navigation-module_title_180OT').first().parent().attr('href') || '')
      );
    },
    getEpisode(url) {
      return getEpisode(j.$('p.Navigation-module_chapterTitle_20juD').first().text());
    },
    readerConfig: [
      {
        current: {
          mode: 'text',
          selector: '[class*="Viewer-module_pageNumber"]',
          regex: '(\\d+) /',
          group: 1,
        },
        total: {
          mode: 'text',
          selector: '[class*="Viewer-module_pageNumber"]',
          regex: '/ (\\d+)',
          group: 1,
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return j.$('h1.TitleDetailHeader-module_title_Iy33M').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('[class*="TitleDetailHeader-module_overviewTitleWrapper"]')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('[class*="ChapterListItem-module_chapterListItem"]');
      },
      elementEp(selector) {
        return getEpisode(selector.find('[class*="ChapterListItem-module_name"]').first().text());
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    if (page.url.split('/')[3] === 'viewer' || page.url.split('/')[3] === 'titles') {
      utils.waitUntilTrue(
        function () {
          if (
            j.$('h1.Navigation-module_title_180OT').text() ||
            j.$('h1.TitleDetailHeader-module_title_Iy33M').text()
          ) {
            return true;
          }
          return false;
        },
        function () {
          page.handlePage();
        },
      );
    }
    utils.urlChangeDetect(function () {
      page.reset();
      if (page.url.split('/')[3] === 'viewer' || page.url.split('/')[3] === 'titles') {
        utils.waitUntilTrue(
          function () {
            if (
              j.$('h1.Navigation-module_title_180OT').text() ||
              j.$('h1.TitleDetailHeader-module_title_Iy33M').text()
            ) {
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

function getEpisode(episodeText: string) {
  if (!episodeText) return NaN;

  const temp = episodeText.match(/#(\d+)/i);

  if (!temp) return NaN;

  return Number(temp[1]);
}
