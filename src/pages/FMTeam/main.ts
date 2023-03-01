import { pageInterface } from '../pageInterface';

export const FMTeam: pageInterface = {
  name: 'FMTeam',
  domain: 'https://fmteam.fr/',
  languages: ['French'],
  type: 'manga',
  isSyncPage(url) {
    return url.split('/')[3] === 'read';
  },
  sync: {
    getTitle(url) {
      return utils
        .urlPart(url, 4)
        .replace(/-/g, ' ')
        .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl() {
      return utils.absoluteLink(j.$('.dropdown_parent > .text > a').attr('href'), FMTeam.domain);
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 7));
    },
    nextEpUrl() {
      // From FallenAngels pages code
      const scriptContent = j.$('#content > script').first().html();
      const nextChapterMatches = scriptContent.match(/next_chapter\s*=\s*".*"/gim);

      if (!nextChapterMatches || nextChapterMatches.length === 0) return '';

      const matchesOfRestOfNextChapter = nextChapterMatches[0].match(/"(.*?)"/gm);

      if (!matchesOfRestOfNextChapter || matchesOfRestOfNextChapter.length === 0) return '';

      const chapterUrl = matchesOfRestOfNextChapter[0].replace(/(^"|"$)/gm, '');

      if (typeof chapterUrl.split('/')[6] !== 'undefined') {
        return chapterUrl;
      }
      return '';
    },
  },
  overview: {
    getTitle() {
      return j.$('h1.title').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.panel > .comic.info').after(
        j.html(
          `<div class="list"><div class="group"><div class="title">MAL-Sync</div>${selector}</div></div>`,
        ),
      );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.panel > .list > .group > .element');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector.find('.title > a[href*="/read/"]').attr('href') || '',
          FMTeam.domain,
        );
      },
      elementEp(selector) {
        return FMTeam.sync.getEpisode(FMTeam.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      const urlSegment = page.url.split('/')[3];
      const handlingPage = urlSegment === 'read' || urlSegment === 'series';
      if (handlingPage && typeof page.url.split('/')[4] !== 'undefined') {
        page.handlePage();
      }
    });
  },
};
