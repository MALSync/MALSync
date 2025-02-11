import { pageInterface } from '../pageInterface';

export const WeebCentral: pageInterface = {
  name: 'WeebCentral',
  domain: 'https://weebcentral.com',
  languages: ['English'],
  type: 'manga',
  database: 'Weebcentral',
  isSyncPage(url) {
    if (url.split('/')[3] === 'chapters') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'series') {
      return true;
    }
    return false;
  },
  getImage() {
    return $('section section picture img').attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('section.w-full a[href*="/series/"] span').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(WeebCentral.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j.$('section.w-full a[href*="/series/"]').first().attr('href'),
        WeebCentral.domain,
      );
    },
    getEpisode(url) {
      const chapterText = getChapterText();
      return getChapter(chapterText);
    },
    getVolume(url) {
      const chapterText = getChapterText();

      const res = /^s(\d+)\D/i.exec(chapterText);

      if (!res) {
        return NaN;
      }

      return Number(res[1]) || NaN;
    },
    nextEpUrl(url) {
      const nextButton = j
        .$('section.w-full a span:contains("NEXT")')
        .closest('a[href*="/chapters/"]')
        .attr('href');
      return nextButton;
    },
    readerConfig: [
      {
        condition: () => j.$('[value="single_page"]').is(':checked'),
        current: {
          selector: '[onclick*="page_select_modal"]',
          mode: 'text',
          regex: '\\d+$',
        },
        total: {
          selector: 'main img[src*="/manga/"]',
          mode: 'count',
        },
      },
      {
        current: {
          selector: 'main img[src*="/manga/"]',
          mode: 'countAbove',
        },
        total: {
          selector: 'main img[src*="/manga/"]',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return j.$('section h1').first().text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('strong:contains("Chapter List")').before(
        j.html(`<strong>MAL-Sync</strong><br>${selector}<br>`),
      );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div#chapter-list > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), WeebCentral.domain) || '';
      },
      elementEp(selector) {
        return getChapter(selector.find('span > span').first().text().trim());
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    j.$(document).ready(function () {
      page.handlePage();

      utils.changeDetect(
        () => {
          if (WeebCentral.overview!.list!.elementsSelector().length) {
            page.handleList();
          }
        },
        () => {
          return WeebCentral.overview!.list!.elementsSelector().length;
        },
      );
    });
  },
};

function getChapterText() {
  return j.$('section.w-full button[hx-target="#chapter-select-body"] span').first().text().trim();
}

function getChapter(text: string) {
  const res = /(ch|chapter|episode|ep|chap|chp)\D?(\d+)/i.exec(text);

  if (!res) {
    const res2 = /((\d+\.)?\d+)$/i.exec(text);
    if (res2) {
      return Number(res2[1]) || NaN;
    }
    return NaN;
  }

  return Number(res[2]) || NaN;
}
