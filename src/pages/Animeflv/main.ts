/*By kaiserdj*/
import { pageInterface } from './../pageInterface';

export const animeflv: pageInterface = {
  name: 'animeflv',
  domain: 'https://animeflv.net',
  type: 'anime',
  isSyncPage: function(url) {
    if (j.$('h2.SubTitle').length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle: function(url) {
      return j
        .$('h1.Title')
        .text()
        .split(' Episodio')[0]
        .trim();
    },
    getIdentifier: function(url) {
      return `${utils.urlPart(
        animeflv.domain + (j.$('.fa-th-list').attr('href') || ''),
        4,
      )}/${utils.urlPart(
        animeflv.domain + (j.$('.fa-th-list').attr('href') || ''),
        5,
      )}`;
    },
    getOverviewUrl: function(url) {
      return animeflv.domain + (j.$('.fa-th-list').attr('href') || '');
    },
    getEpisode: function(url) {
      return parseInt(
        j
          .$('h2.SubTitle')
          .text()
          .replace('Episodio ', '')
          .trim(),
      );
    },
    nextEpUrl: function(url) {
      const nextEp = j.$('.fa-chevron-right').attr('href');
      if (!nextEp) return nextEp;
      return animeflv.domain + nextEp;
    },
    uiSelector: function(selector) {
      selector.insertAfter(j.$('.CapOptns'));
    },
  },
  overview: {
    getTitle: function(url) {
      return j.$('h2.Title').text();
    },
    getIdentifier: function(url) {
      return `${utils.urlPart(url, 4)}/${utils.urlPart(url, 5)}`;
    },
    uiSelector: function(selector) {
      selector.insertAfter(j.$('.Description'));
    },
    list: {
      offsetHandler: false,
      elementsSelector: function() {
        const url = window.location.href;
        document.body.insertAdjacentHTML(
          'afterbegin',
          '<div id="MALSync" class="MALSync" style="display: none;"><ul id="MALSyncUl" class="MALSyncUl"></ul></div>',
        );
        const idMALSync = document.getElementById('MALSyncUl');
        const patron = /<script>\s\s   var([^]*?)<\/script>/g;
        const html = document.body.innerHTML;
        let scriptEps = patron.exec(html);
        if (scriptEps != null) {
          // @ts-ignore
          scriptEps = scriptEps[1] || null;
          if (scriptEps != null) {
            // @ts-ignore
            const patron2 = /\[([^\[\]]{0,10},{0,10})\]/g;
            // @ts-ignore
            const eps = scriptEps.toString().match(patron2);
            if (eps != null) {
              // @ts-ignore
              eps.forEach(element => {
                if (idMALSync != null) {
                  const Url = `${animeflv.domain}/ver/${element
                    .split(',')[1]
                    .replace(']', '')}/${utils.urlPart(url, 5)}-${element
                    .split(',')[0]
                    .replace('[', '')}`;
                  const Episodio = element.split(',')[0].replace('[', '');
                  idMALSync.innerHTML += `<li><a href="${Url}" epi="${Episodio}"></a> </li>`;
                }
              });
            }
          }
        }
        return j.$('.MALSync a');
      },
      elementUrl: function(selector) {
        return utils.absoluteLink(selector.attr('href'), animeflv.domain);
      },
      elementEp: function(selector) {
        return selector.attr('epi');
      },
      handleListHook: function(epi, epilist) {
        epi++;
        if (epilist.length - 1 >= epi) {
          const cover = j.$('.AnimeCover img').attr('src');
          const name = j.$('.Container h2').text();
          const epiAct = `<li class="fa-play-circle Next"><a href="${epilist[
            epi
          ][0].toString()}"><figure><img src="${cover}" alt=""></figure><h3 class="Title">${name}</h3><p>Episodio ${epi}</p><span style="position: absolute; top: 0; bottom: 0; margin: auto; right: 20px; line-height: 30px; font-size: 16px; font-weight: 700; height: 30px;">Siguiente Episodio</span></a></li>`;
          j.$('.Main .ListCaps').prepend(epiAct);
        }
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    if (
      document.title == 'Just a moment...' ||
      document.title == 'Verifica que no eres un bot | AnimeFLV'
    ) {
      con.log('loading');
      page.cdn();
      return;
    }
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
