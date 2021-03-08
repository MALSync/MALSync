/* By kaiserdj */
import { pageInterface } from '../pageInterface';

export const AnimeId: pageInterface = {
  name: 'AnimeId',
  domain: 'https://www.animeid.tv',
  languages: ['Spanish'],
  type: 'anime',
  isSyncPage(url) {
    if (utils.urlPart(url, 3) === `v`) return true;

    return false;
  },
  isOverviewPage(url) {
    if (j.$('section#capitulos')[0]) return true;

    return false;
  },
  sync: {
    getTitle(url) {
      return j.$(`#infoanime h1 a`)[0].innerText;
    },
    getIdentifier(url) {
      return (
        j
          .$(`#infoanime h1 a`)[0]
          .getAttribute(`href`)
          ?.split(`/`)
          .pop() || ''
      );
    },
    getOverviewUrl(url) {
      return `${AnimeId.domain}${$(`#infoanime h1 a`)[0].getAttribute(`href`)}`;
    },
    getEpisode(url) {
      return Number.parseInt(
        j
          .$(`#infoanime strong`)[0]
          .innerText.replace('Capítulo ', '')
          .trim(),
      );
    },
    nextEpUrl(url) {
      const epi = `${AnimeId.domain}${j.$(`.buttons li a`)[2].getAttribute(`href`)}`;
      return epi;
    },
  },
  overview: {
    getTitle(url) {
      return j.$(`article hgroup h1`).text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    uiSelector(selector) {
      j.$('article').after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        const url = window.location.href;
        document.body.insertAdjacentHTML(
          'afterbegin',
          '<div id="MALSync" class="MALSync" style="display: none;"><ul id="MALSyncUl" class="MALSyncUl"></ul></div>',
        );
        const idMALSync = document.getElementById('MALSyncUl');

        let lastEpi: HTMLElement | string | null = j.$(`section#capitulos li a`)[0];
        if (lastEpi) {
          lastEpi = lastEpi.getAttribute('href');
          const numLastEpi = lastEpi!.split(`-`).pop();
          if (numLastEpi !== undefined) {
            for (let x = 1; x < Number.parseInt(numLastEpi) + 1; x++) {
              if (idMALSync !== null) {
                idMALSync.innerHTML += j.html(
                  `<li><a href="${AnimeId.domain}/v/${utils.urlPart(url, 3)}-${x}" epi="${x}"></a> </li>`,
                );
              }
            }
          }
        }
        return j.$('.MALSync a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), AnimeId.domain);
      },
      elementEp(selector) {
        return Number(selector.attr('epi'));
      },
      handleListHook(epi, epilist) {
        epi++;
        if (epilist.length - 1 >= epi) {
          const epiAct = `<li><a href="${epilist[
            epi
          ][0].toString()}"><strong>Capítulo ${epi}</strong><small class="right">Siguiente Episodio</small></li><li></li>`;
          j.$('#listado').prepend(j.html(epiAct));
        }
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    con.log('loading');
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
