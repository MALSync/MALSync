import { pageInterface } from '../pageInterface';

export const OtakuAnimes: pageInterface = {
  name: 'OtakuAnimes',
  domain: 'https://otakuanimess.com',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'episodio') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'animes') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return removeDubTitle(j.$('#weds > div > div.headerEP > div > h1').text());
    },
    getIdentifier(url) {
      return utils.urlPart(url, 5);
    },
    getOverviewUrl(url) {
      return `${OtakuAnimes.domain}/animes/${url.split('/')[5]}`;
    },
    getEpisode(url) {
      return Number(utils.urlPart(url, 6));
    },
    nextEpUrl(url) {
      if (url === undefined) return '';
      
      let actualEpisode = url.split('/')[6];
      let lastIndex = url.lastIndexOf(actualEpisode);
      let newEpisode = Number(actualEpisode) + 1;

      let newUrl = url.substring(0, lastIndex) + `${newEpisode}` + '/';
      return newUrl;
    },
  },
  overview: {
    getTitle(url) {
      return removeDubTitle(j.$('#weds > div > div.pageAnime > div > div > div.right > div.animeFirstContainer > h1').text());
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('#weds > div > div.pageAnime > div > div > div.right > div.animeSecondContainer').after(j.html(selector));
    },
    list: {
      offsetHandler: true,
      elementsSelector() {
        return j.$('#aba_epi > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), OtakuAnimes.domain);
      },
      elementEp(selector) {
        return Number(selector.attr('title')?.split(' ').at(-1));
      },
    },
  },
  init(page) {
    j.$(document).ready(function () {
      api.storage.addStyle(
        require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
      );
    
      //if (page.url.split('/')[3] === 'episodio' && typeof page.url.split('/')[6] !== 'undefined') {
        page.handlePage();
      //}
    });
  },
};

function removeDubTitle(title){
  const newTitle = title
    .replace('dublado', '')
    .replace('Dublado', '')
    .trim();

  return newTitle;
}