import { pageInterface } from '../pageInterface';

export const Furyosquad: pageInterface = {
  name: 'Furyosquad',
  domain: 'https://furyosquad.com/',
  languages: ['French'],
  type: 'manga',
  isSyncPage(url) {
    return url.split('/')[3] === 'read';
  },
  sync: {
    getTitle() {
      return j
        .$('.fs-read-comic-link')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl() {
      return utils.absoluteLink(j.$('.fs-read-comic-link a').attr('href'), Furyosquad.domain);
    },
    getVolume(url) {
      return parseInt(utils.urlPart(url, 6));
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 7));
    },
    nextEpUrl() {
      const href = j.$('.vertical-next-chapter a').attr('href');
      // Check if it's the next chapter or the overview page (for the latest chapter available)
      if (href && href.split('/').length === 6) {
        return '';
      }
      return utils.absoluteLink(href, Furyosquad.domain);
    },
  },
  overview: {
    getTitle() {
      return j
        .$('.fs-comic-title')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.comic-info').after(
        j.html(
          `<div class="list fs-chapter-list"><div class="group"><div class="title">MAL-Sync</div>${selector}</div></div>`,
        ),
      );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.group > div.element');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.find('a[href*="/read/"]').attr('href') || '', Furyosquad.domain);
      },
      elementEp(selector) {
        return Furyosquad.sync.getEpisode(Furyosquad.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        (page.url.split('/')[3] === 'read' && typeof page.url.split('/')[4] !== 'undefined') ||
        (j.$('.fs-comic-title').length && j.$('div.main-container-top.comic').length)
      ) {
        page.handlePage();
      }
    });
  },
};
