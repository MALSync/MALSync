import { pageInterface } from '../pageInterface';

export const MuitoManga: pageInterface = {
  name: 'MuitoMangá',
  domain: 'https://muitomanga.com',
  languages: ['Portuguese'],
  type: 'manga',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'ler' && utils.urlPart(url, 4) !== '';
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'manga' && utils.urlPart(url, 4) !== '';
  },
  getImage() {
    return j.$('.capaMangaInfo img').first().attr('data-src');
  },
  sync: {
    getTitle(url) {
      return j
        .$('.widget-title')
        .first()
        .text()
        .match(/Ler (.+) Capítulo/)!
        .pop()!;
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j.$('a[href*="/manga"]').first().attr('href') || '',
        MuitoManga.domain,
      );
    },
    getEpisode(url) {
      return Number(utils.urlPart(url, 5).replace('capitulo-', ''));
    },
    nextEpUrl(url) {
      const link = utils.absoluteLink(
        j.$('.widgtl .botao_caps').last().attr('href') || '',
        MuitoManga.domain,
      );
      if (utils.urlPart(link, 3) === 'manga') {
        return undefined;
      }
      return link;
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.subtitles_menus').first().text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('.rating-area')
        .first()
        .after(j.html(`<div class="rating-area">${selector}</div>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.single-chapter');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector.children().first().attr('href') || '',
          MuitoManga.domain,
        );
      },
      elementEp(selector) {
        return Number(selector.children().first().text().replace('Capítulo #', ''));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      page.handlePage();
    });
  },
};
