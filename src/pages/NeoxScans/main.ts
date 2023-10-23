import { pageInterface } from '../pageInterface';

const TITLE_LINK_SELECTOR = 'ol.breadcrumb > li:nth-child(2) > a';
const SELECTED_CHAPTER_SELECTOR =
  '.header select.single-chapter-select option[selected="selected"]';
const URL_MANGA_ID_INDEX = 4;

function isChapterPage(url: string): boolean {
  return utils.urlPart(url, 5).startsWith('cap-');
}

function isOverviewPage(url: string): boolean {
  return utils.urlPart(url, 3) === 'manga' && !isChapterPage(url);
}

function getChapter(text: string) {
  const res = /(cap\.)\D?(\d+)/i.exec(text);

  if (!res) return NaN;

  return Number(res[2]) || NaN;
}

export const NeoxScans: pageInterface = {
  name: 'NeoxScans',
  domain: 'https://neoxscans.com/',
  languages: ['Portuguese'],
  type: 'manga',
  isSyncPage(url) {
    return Boolean(isChapterPage(url));
  },
  isOverviewPage(url) {
    return Boolean(isOverviewPage(url));
  },
  sync: {
    getTitle(url) {
      return j.$(TITLE_LINK_SELECTOR).text().trim().replace('\n', '');
    },
    getIdentifier(url) {
      return utils.urlPart(NeoxScans.sync.getOverviewUrl(url), URL_MANGA_ID_INDEX) || '';
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$(TITLE_LINK_SELECTOR).attr('href'), NeoxScans.domain);
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
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(() => {
      if (isChapterPage(page.url) || isOverviewPage(page.url)) {
        page.handlePage();
      }
    });
  },
};
