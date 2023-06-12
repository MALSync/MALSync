import { pageInterface } from '../pageInterface';

const TITLE_LINK_SELECTOR = 'ol.breadcrumb > li:nth-child(3) > a';
const SELECTED_CHAPTER_SELECTOR =
  '.header select.single-chapter-select option[selected="selected"]';
const URL_MANGA_ID_INDEX = 4;

function isChapterPage(url: string): boolean {
  return url.split('/')[5].startsWith('chapter');
}

export const FirstKiss: pageInterface = {
  name: '1stKissManga',
  domain: 'https://1stkissmanga.me',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (isChapterPage(url)) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$(TITLE_LINK_SELECTOR).text().trim().replace('\n', '');
    },
    getIdentifier(url) {
      return utils.urlPart(FirstKiss.sync.getOverviewUrl(url), URL_MANGA_ID_INDEX) || '';
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$(TITLE_LINK_SELECTOR).attr('href'), FirstKiss.domain);
    },
    getEpisode(url) {
      const selectedOptionText = j.$(SELECTED_CHAPTER_SELECTOR).text();

      if (!selectedOptionText) return NaN;

      return getChapter(selectedOptionText);
    },
    getVolume(url) {
      const selectedOptionText = j.$(SELECTED_CHAPTER_SELECTOR).text();

      if (!selectedOptionText) return NaN;

      const chapterTextMatches = selectedOptionText.match(/(vol\.|volume)\D?\d+/i);

      if (!chapterTextMatches || chapterTextMatches.length === 0) return NaN;

      return Number(chapterTextMatches[0].match(/\d+/));
    },
    nextEpUrl(url) {
      const href = utils.absoluteLink(
        j.$('.header .nav-next > a').first().attr('href'),
        FirstKiss.domain,
      );
      if (isChapterPage(url)) {
        return href;
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, URL_MANGA_ID_INDEX) || '';
    },
    uiSelector(selector) {
      j.$('h1').first();
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('ul .wp-manga-chapter');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), FirstKiss.domain);
      },
      elementEp(selector) {
        const episodeText = selector.find('a').text();

        if (!episodeText) return NaN;

        return getChapter(episodeText);
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (isChapterPage(page.url)) {
        page.handlePage();
      }
    });
  },
};

function getChapter(text: string) {
  const res = /(ch|chapter|episode|ep|chap|chp)\D?(\d+)/i.exec(text);

  if (!res) return NaN;

  return Number(res[2]) || NaN;
}
