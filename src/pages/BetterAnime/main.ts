import { pageInterface } from '../pageInterface';

export const BetterAnime: pageInterface = {
  name: 'BetterAnime',
  domain: 'https://betteranime.net',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 6).startsWith('episodio-') && !url.includes('/download');
  },
  isOverviewPage(url) {
    return ['anime', 'filme'].includes(utils.urlPart(url, 3)) && utils.urlPart(url, 6) === '';
  },
  sync: {
    getTitle(url) {
      return j
        .$('.anime-title > h2')
        .first()
        .text()
        .replace(/ (- )?Dublado/, '')
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[5].replace('-dublado', '');
    },
    getOverviewUrl(url) {
      return url.substring(0, url.lastIndexOf('/'));
    },
    getEpisode(url) {
      return Number(j.$('.anime-title > h3').text().replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      return j.$('.btn-control.ml-auto').first().attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('.anime-info > h2')
        .first()
        .text()
        .replace(/ (- )?Dublado/, '')
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[5].replace('-dublado', '');
    },
    uiSelector(selector) {
      j.$('.anime-info > p:last-child').after(
        j.html(`<div title="MalSync">${j.html(selector)}</div>`),
      );
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#episodesList > li > a').filter(
          (_, el) =>
            !$(el)
              .attr('href')!
              .match(/episodio-(ova)|(especial)/),
        );
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), BetterAnime.domain);
      },
      elementEp(selector) {
        return Number(selector.find('h3').text().match(/\d+/)?.[0]);
      },
    },
  },
  init(page) {
    j.$(document).ready(function () {
      api.storage.addStyle(
        require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
      );
      if (utils.urlPart(document.location.href, 6).match(/episodio-(ova)|(especial)/)) {
        return;
      }
      page.handlePage();
    });
  },
};
