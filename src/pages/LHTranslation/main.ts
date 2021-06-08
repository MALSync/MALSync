import { pageInterface } from '../pageInterface';

export const LHTranslation: pageInterface = {
  name: 'LHTranslation',
  domain: 'https://lhtranslation.net',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return (
      typeof url.split('/')[3] !== 'undefined' &&
      url.split('/')[3].startsWith('read-') &&
      !/page-([2-9]|1\d+)/.test(url.split('/')[3])
    );
  },
  isOverviewPage(url) {
    return typeof url.split('/')[3] !== 'undefined' && url.split('/')[3].startsWith('manga-');
  },
  getImage() {
    return $('.info-cover > img.thumbnail').attr('src');
  },
  sync: {
    getTitle(url) {
      return j.$('a.manga-name').text();
    },
    getIdentifier(url) {
      return LHTranslation.overview!.getIdentifier(LHTranslation.sync.getOverviewUrl(url));
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('a.manga-name').attr('href') || '', LHTranslation.domain);
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 3);

      const temp = episodePart.match(/chapter[_-]\d+/gi);

      if (!temp || !temp.length) return 0;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const next = j
        .$('ul.chapter_select option:selected')
        .prev()
        .val();

      if (next) {
        return utils.absoluteLink(next, LHTranslation.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('ul.manga-info > h1').text();
    },
    getIdentifier(url) {
      const part = utils.urlPart(url, 3);
      // remove manga- and .html
      return part.substring(part.indexOf('-') + 1, part.lastIndexOf('.') > -1 ? part.lastIndexOf('.') : part.length);
    },
    uiSelector(selector) {
      j.$('#listchapter').before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#list-chapters .titleLink');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href') || '',
          LHTranslation.domain,
        );
      },
      elementEp(selector) {
        return LHTranslation.sync.getEpisode(LHTranslation.overview!.list!.elementUrl(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(() => {
      page.handlePage();
    });
  },
};
