/* By kaiserdj */
import { pageInterface } from '../pageInterface';

let check = false;

export const Jkanime: pageInterface = {
  name: 'Jkanime',
  domain: 'https://jkanime.net/',
  languages: ['Spanish'],
  type: 'anime',
  isSyncPage(url) {
    if (Number.isNaN(parseInt(utils.urlPart(url, 4)))) {
      return false;
    }
    return true;
  },
  sync: {
    getTitle(url) {
      return j
        .$('.video-header h1')
        .text()
        .split(' - ')[0];
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    getOverviewUrl(url) {
      return j.$('.vnav-list').attr('href') || '';
    },
    getEpisode(url) {
      return Number(
        j
          .$('.video-header h1')
          .text()
          .split(' - ')[1],
      );
    },
    nextEpUrl(url) {
      const nextUrl = j.$('.vnav-right').attr('href');
      if (nextUrl === '#') return undefined;
      return nextUrl;
    },
    uiSelector(selector) {
      j.$('.server-box').after(j.html(selector));
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.sinopsis-box h2').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 3);
    },
    uiSelector(selector) {
      j.$('.sinopsis-links').after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        if (!utils.urlPart(window.location.href, 4).length) {
          document.body.insertAdjacentHTML(
            'afterbegin',
            '<div id="MALSync" class="MALSync" style="display: none;"><ul id="MALSyncUl" class="MALSyncUl"></ul></div>',
          );
          const idMALSync = document.getElementById('MALSyncUl');
          const lastEps = j
            .$('.navigation a')
            .last()
            .text()
            .split('-')[1]
            .trim();
          for (let i = 1; i <= Number(lastEps); i++) {
            if (idMALSync !== null) {
              idMALSync.innerHTML += j.html(`<li><a href="${document.URL}${i}" epi="${i}"></a> </li>`);
            }
          }
          return j.$('.MALSync a');
        }
        return j.$('.nowaythisexists123');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), Jkanime.domain);
      },
      elementEp(selector) {
        return selector.attr('epi');
      },
      handleListHook(epi, epilist) {
        epi++;
        if (epilist.length >= epi) {
          if (!check) {
            const buttons = j.$('.navigation a');

            buttons.each((i, button) => {
              const episodeNumbers = button.innerText.split('-');
              const episodeStart = Number(episodeNumbers[0]);
              const episodeEnd = Number(episodeNumbers[1]);

              if (episodeStart <= epi || episodeEnd >= epi) button.click();
            });

            check = true;
          }
          setTimeout(function() {
            j.$('#episodes-content .cap-post').each(function(i, obj) {
              if (Number(obj.innerText.split(' ')[1]) === epi) {
                j.$('#episodes-content .cap-post')
                  .eq(i)
                  .addClass('mal-sync-active');
                if (!check) {
                  j.$(`#episodes-content .cap-post:eq(${i})`)
                    .find('i')
                    .first()
                    .remove();
                }
              }
            });
          }, 500);
        }
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
    j.$('.navigation a').click(function() {
      if (check) {
        page.handleList();
      }
    });
  },
};
