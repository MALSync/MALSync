import { pageInterface } from '../pageInterface';

export const AnimesHD: pageInterface = {
  name: 'AnimesHD',
  domain: 'https://animeshd.org',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    return (url.split('/')[3] === 'filmes' || url.split('/')[3] === 'episodio') && url.split('/').length >= 4;
  },
  isOverviewPage(url) {
    return url.split('/')[3] === 'animes' && url.split('/').length >= 4;
  },
  sync: {
    getTitle(url) {
      return j
        .$('#info > h1, #single > div.content > div.sheader > div.data > h1')
        .first()
        .text();
    },
    getIdentifier(url) {
      return utils.urlPart(AnimesHD.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return (
        utils.absoluteLink(
          j.$('#single > div.content > div.pag_episodes > div:nth-child(2) > a').attr('href'),
          AnimesHD.domain,
        ) || url
      );
    },
    getEpisode(url) {
      const episodePart = utils.urlPart(url, 4);
      const temp = episodePart.match(/episodio-\d+/gi);
      if (!temp) {
        return 1;
      }
      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const nextUrl = j.$('#single > div.content > div.pag_episodes > div:nth-child(3) > a').attr('href');
      if (nextUrl && nextUrl !== '#') {
        return utils.absoluteLink(nextUrl, AnimesHD.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('#single > div > div.to-center > div.data.pdin > h1').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('#serie_contenido')
        .first()
        .before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('ul.episodios > li');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href') || '',
          AnimesHD.domain,
        );
      },
      elementEp(selector) {
        return AnimesHD.sync.getEpisode(AnimesHD.overview!.list!.elementUrl(selector));
      },
    },
  },

  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
