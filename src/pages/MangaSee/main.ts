import { pageInterface } from '../pageInterface';

export const MangaSee: pageInterface = {
  name: 'MangaSee',
  domain: 'https://mangasee123.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'read-online') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('div.Column.col-lg-4.col-12')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(MangaSee.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j
          .$('div.Column.col-lg-4.col-12 a')
          .first()
          .attr('href'),
        MangaSee.domain,
      );
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 4);

      const temp = episodePart.match(/chapter-\d+/gim);

      if (!temp || !temp.length) return 0;

      return Number(temp[0].replace(/\D+/g, ''));
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('li.list-group-item')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$(j.$('li.list-group-item')[1]).after(
        j.html(`<li class="list-group-item d-none d-sm-block"><span class="mlabel">MAL-Sync:</span>${selector}</li>`),
      );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        j.$('div.list-group-item.ShowAllChapters').click();
        return j.$('a.list-group-item.ChapterLink');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), MangaSee.domain) || '';
      },
      elementEp(selector) {
        return MangaSee.sync.getEpisode(MangaSee.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'read-online' || page.url.split('/')[3] === 'manga') {
        page.handlePage();
      }
    });
  },
};
