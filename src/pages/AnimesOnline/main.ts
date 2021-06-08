import { pageInterface } from '../pageInterface';

export const AnimesOnline: pageInterface = {
  name: 'AnimesOnline',
  domain: 'https://animesonline.org',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    return (
      (url.split('/')[3] === 'filmes' || url.split('/')[3] === 'episodio') &&
      url.split('/').length >= 4 &&
      url.split('/')[4].length > 0
    );
  },
  sync: {
    getTitle(url) {
      return j
        .$('#info > h1, #single > div.content > div.sheader > div.data > h1')
        .first()
        .text()
        .replace(/\s+-\s+episódio\s+\d+/i, '');
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4).replace(/-episodio-\d+/, '');
    },
    getOverviewUrl(url) {
      return (
        utils.absoluteLink(
          j.$('#single > div.content > div.pag_episodes > div:nth-child(2) > a').attr('href'),
          AnimesOnline.domain,
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
        return utils.absoluteLink(nextUrl, AnimesOnline.domain);
      }
      return '';
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
