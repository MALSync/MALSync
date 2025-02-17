import { pageInterface } from '../pageInterface';

export const v3: pageInterface = {
  name: 'bato',
  domain: 'https://bato.to',
  languages: ['Many'],
  type: 'manga',
  isSyncPage(url) {
    if (j.$('div.comic-detail').length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('div.comic-detail > h3 > a').text();
    },
    getIdentifier(url) {
      return utils.urlPart(v3.sync.getOverviewUrl(url), 4).split('-')[0] || '';
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('div.comic-detail > h3 > a').attr('href'), v3.domain);
    },
    getEpisode(url) {
      const selectedOptionText = j
        .$('div.comic-detail ~ div > div > select:nth-child(1) > optgroup > option:selected')
        .text();

      if (!selectedOptionText) return NaN;

      return getChapter(selectedOptionText);
    },
    getVolume(url) {
      const selectedOptionText = j
        .$('div.comic-detail ~ div > div > select:nth-child(1) > optgroup > option:selected')
        .text();

      if (!selectedOptionText) return NaN;

      const chapterTextMatches = /(vol\.|volume)\D?\d+/i.exec(selectedOptionText);

      if (!chapterTextMatches || chapterTextMatches.length === 0) return NaN;

      return Number(/\d+/.exec(chapterTextMatches[0]));
    },
    nextEpUrl(url) {
      const href = utils.absoluteLink(j.$('a.btn:nth-child(6)').first().attr('href'), v3.domain);
      if (href.split('/')[3] === 'chapter') {
        return href;
      }
      if (href.split('/')[3].split('-')[0]) {
        return href;
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h3.text-lg > a').first().text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4).split('-')[0] || '';
    },
    uiSelector(selector) {
      j.$('div.mt-3 > div:nth-child(3)').first().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.scrollable-panel > div.group > astro-slot > div');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a').first().attr('href'), v3.domain);
      },
      elementEp(selector) {
        const episodeText = selector.find('a').first().text();

        if (!episodeText) return NaN;

        return getChapter(episodeText);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./v3.less').toString());
    j.$(function () {
      if (page.url.split('/')[3] === 'title') {
        page.handlePage();
      }
    });
  },
};

export function getChapter(text: string) {
  const res = /(ch|chapter|episode|ep|chap|chp|no\.?)\D?(\d+)/i.exec(text);

  if (!res) return NaN;

  return Number(res[2]) || NaN;
}
