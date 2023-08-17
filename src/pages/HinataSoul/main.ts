import { pageInterface } from '../pageInterface';

export const HinataSoul: pageInterface = {
  name: 'HinataSoul',
  domain: 'https://hinatasoul.com',
  languages: ['Portuguese'],
  type: 'anime',
  isSyncPage(url) {
    if (utils.urlPart(url, 3) !== 'videos') return false;
    const overviewUrl = HinataSoul.sync.getOverviewUrl(url);
    return utils.urlPart(overviewUrl, 3).startsWith('anime');
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3).startsWith('anime') && utils.urlPart(url, 4) !== '';
  },
  getImage() {
    return j.$('.aniInfosSingleCapa img').attr('src');
  },
  sync: {
    getTitle(url) {
      return document.title
        .split('–')[0]
        .trim()
        .replace(/ (- )?dublado/i, '');
    },
    getIdentifier(url) {
      return HinataSoul.sync.getOverviewUrl(url).split('/')[4]?.replace('-dublado', '');
    },
    getOverviewUrl(url) {
      return j.$('.iconLista').parent().attr('href') ?? '';
    },
    getEpisode(url) {
      return Number(
        j
          .$('.epTituloNome')
          .text()
          .match(/ep (\d+)/)?.[1] ?? 1,
      );
    },
    nextEpUrl(url) {
      return j.$('.iconProx').parent().attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('.tituloPage')
        .text()
        .trim()
        .replace(/ (- )?dublado/i, '');
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4).replace('-dublado', '');
    },
    uiSelector(selector) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('aniInfosMalSync');
      wrapper.innerHTML = `<b>MALSync</b>${j.html(selector)}`;
      j.$('.aniInfosSingleGeneros').before(j.html(wrapper.outerHTML));
    },
    getMalUrl(provider) {
      return j.$('.mbottom[href*="myanimelist"]').attr('href') ?? '';
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.aniContainer > div > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), HinataSoul.domain);
      },
      elementEp(selector) {
        const ep = Number(
          selector.find('.ultimosEpisodiosHomeItemInfosNum').text().match(/\d+/)?.[0],
        );
        // Animes without episodes, like movies, does not have a number.
        return Number.isNaN(ep) ? 1 : ep;
      },
      paginationNext(updateCheck) {
        const nextBtn: JQuery<HTMLElement> = j.$('.flickity-slider > a[href*="/page"]')?.last();
        if (nextBtn.length === 0 || nextBtn.attr('href') === document.location.href) return false;
        nextBtn[0].click();
        return true;
      },
    },
  },
  init(page) {
    j.$(document).ready(function () {
      api.storage.addStyle(
        require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
      );
      page.handlePage();
    });
  },
};
