import { pageInterface } from '../pageInterface';

export const AnimeFenix: pageInterface = {
  name: 'AnimeFenix',
  domain: 'https://animefenix.tv',
  languages: ['Spanish'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'ver') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      const urlParts = url.split('/');
      if (urlParts.length > 0) {
        const titleParts = urlParts[urlParts.length - 1].split('-');
        // Elimina el último elemento (número del episodio)
        titleParts.pop();
        // Convierte a formato de título y elimina los guiones
        const title = titleParts.join(' ').replace(/\b\w/g, l => l.toUpperCase());
        return title;
      }
      return '';
    },
    getIdentifier(url) {
      return AnimeFenix.sync.getTitle(url);
    },
    getOverviewUrl(url) {
      return j.$('.lista a').first().attr('href') || '';
    },
    getEpisode(url) {
      const urlParts = url.split('/');
      if (urlParts.length > 0) {
        const episodePart = urlParts[urlParts.length - 1].split('-').pop();
        return Number(episodePart);
      }
      return NaN;
    },
    nextEpUrl(url) {
      const href = j.$('.derecha a').first().attr('href');
      if (href) {
        if (AnimeFenix.sync.getEpisode(url) < AnimeFenix.sync.getEpisode(href)) {
          return href;
        }
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('h1')
        .first()
        .text()
        .replace(/(Sub|Dub)(\s+Español)$/gi, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      j.$('.heromain2').first().before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.allanimes .col-item');
      },
      elementUrl(selector) {
        return selector.find('a').first().attr('href') || '';
      },
      elementEp(selector) {
        return AnimeFenix.sync.getEpisode(AnimeFenix.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (document.title.includes('AnimeFenix - Anime sub español y latino')) {
        con.error('404');
        return;
      }
      if (page.url.split('/')[3] === 'ver' || page.url.split('/')[3] === 'anime') {
        page.handlePage();
      }
    });

    // Detecta cambios en la URL
    let oldUrl = window.location.href;
    setInterval(function() {
      let newUrl = window.location.href;
      if (newUrl !== oldUrl) {
        // Si la URL ha cambiado, vuelve a manejar la página
        if (newUrl.split('/')[3] === 'ver' || newUrl.split('/')[3] === 'anime') {
          page.handlePage();
        }
        oldUrl = newUrl;
      }
    }, 1000); // Comprueba cada segundo
  },
};
