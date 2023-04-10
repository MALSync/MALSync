import { createApp } from '../utils/Vue';
import * as helper from '../provider/AniList/helper';
import { Single as AniListSingle } from '../_provider/AniList/single';
import { UserList } from '../_provider/AniList/list';
import { activeLinks, removeFromOptions } from '../utils/quicklinksBuilder';
import updateUi from './updateUi.vue';
import { waitForPageToBeVisible } from '../utils/general';
import { NotAutenticatedError } from '../_provider/Errors';

export class AnilistClass {
  page: any = null;

  private vueEl;

  protected authError = false;

  constructor(public url: string) {
    let first = true;
    utils.changeDetect(
      () => {
        this.url = window.location.href;
        this.init();
      },
      () => {
        if (first) {
          first = false;
          return undefined;
        }
        if (this.page !== null && this.page.page === 'bookmarks' && $('.lists').length) {
          return $('.lists').first().height();
        }
        let ogUrl = $('meta[property="og:url"]').attr('content');
        if (typeof ogUrl !== 'undefined' && ogUrl.split('/').length > 4) {
          return ogUrl.split('/').slice(0, 6).join('/');
        }
        ogUrl = window.location.href;

        return ogUrl;
      },
    );

    j.$(document).on('click', '.save-btn', () => {
      setTimeout(() => {
        if (this.vueEl) this.vueEl.reload();
      }, 500);
    });

    j.$(document).on('click', '.delete-btn', () => {
      utils.waitUntilTrue(
        () => !j.$('.delete-btn').length,
        () => {
          setTimeout(() => {
            if (this.vueEl) this.vueEl.reload();
          }, 500);
        },
      );
    });

    // Anilist state dropdown
    utils.waitUntilTrue(
      () => j.$('.cover-wrap .list .el-dropdown-link').length,
      () => {
        const dropdownId = j.$('.cover-wrap .list .el-dropdown-link').attr('aria-controls');
        j.$(document).on('mousedown', `#${dropdownId} .el-dropdown-menu__item`, () => {
          setTimeout(() => {
            if (this.vueEl) this.vueEl.reload();
          }, 500);
        });
      },
    );

    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
  }

  async init() {
    await waitForPageToBeVisible();

    const urlpart = utils.urlPart(this.url, 3);
    if (urlpart === 'anime' || urlpart === 'manga') {
      this.page = {
        page: 'detail',
        id: utils.urlPart(this.url, 4),
        apiCacheKey: NaN,
        type: urlpart,
      };
      this.streamingUI();
      helper.aniListToMal(this.page.id, this.page.type).then(malid => {
        if (malid) {
          this.page!.apiCacheKey = malid;
        } else {
          this.page!.apiCacheKey = `anilist:${this.page!.id}`;
        }
        con.log('page', this.page);
        this.malToKiss();
      });
    }

    const urlpart4 = utils.urlPart(this.url, 5);
    if (urlpart4 === 'animelist' || urlpart4 === 'mangalist') {
      this.page = {
        page: 'bookmarks',
        type: urlpart4.substring(0, 5),
      };
      this.bookmarks();
    }
  }

  async getMalUrl() {
    const urlpart = utils.urlPart(this.url, 3);
    if (urlpart === 'anime' || urlpart === 'manga') {
      const aniListId = utils.urlPart(this.url, 4);
      return helper.aniListToMal(Number(aniListId), urlpart).then(malId => {
        if (!malId) return '';
        return `https://myanimelist.net/${urlpart}/${malId}/${utils.urlPart(this.url, 5)}`;
      });
    }
    return '';
  }

  getImage() {
    return $('.header .cover').attr('src') || '';
  }

  getTitle() {
    return $('h1').first().clone().children().remove().end().text().trim();
  }

  malToKiss() {
    $(document).ready(() => {
      con.log('malToKiss');
      $('.mal_links').remove();
      const title = this.getTitle();

      activeLinks(this.page!.type, this.page!.apiCacheKey, title).then(links => {
        let html = '';

        links.forEach(page => {
          let tempHtml = '';
          page.links.forEach(stream => {
            tempHtml += `
              <div class="mal_links" style="margin-top: 5px;">
                <a target="_blank" href="${stream.url}">
                  ${stream.name}
                </a>
              </div>`;
          });
          html += `
            <div id="${page.name}Links" class="mal_links" style="
              background: rgb(var(--color-foreground));
              border-radius: 3px;
              display: block;
              padding: 8px 12px;
              width: 100%;
              margin-bottom: 16px;
              margin-top: 16px;
              font-size: 1.2rem;
              position: relative;
              word-break: break-all;
            ">
              <img src="${utils.favicon(page.domain)}" height="16" width="16">
              <span style="font-weight: 500; line-height: 16px; vertical-align: middle;">${
                page.name
              }</span>
              <span title="${
                page.name
              }" class="remove-mal-sync" title="remove" style="position: absolute; top: 2px; right: 5px; cursor: pointer; opacity: 0.4;">x</span>
              ${tempHtml}
            </div>`;
        });

        $('.mal_links').remove();
        if (api.settings.get('quicklinksPosition') === 'below') {
          $('.sidebar .data').after(j.html(html));
        } else {
          $('.sidebar .data').before(j.html(html));
        }
        $('.remove-mal-sync').click(function () {
          const key = $(this).attr('title');
          removeFromOptions(String(key));
          window.location.reload();
        });
      });
    });
  }

  async streamingUI() {
    con.log('Streaming UI');
    $('#mal-sync-stream-div').remove();
    $('.malsync-rel-link').remove();
    if (this.vueEl) this.vueEl.loading = true;
    const malObj = new AniListSingle(this.url);
    await malObj.update();
    this.initVue(malObj);
    this.pageRelation(malObj);

    const streamUrl = malObj.getStreamingUrl();
    if (streamUrl) {
      $(document).ready(async function () {
        $('#mal-sync-stream-div').remove();
        $('h1')
          .first()
          .append(
            j.html(`
        <div class="data title progress" id="mal-sync-stream-div" style="margin-top: -2px; display: inline-block; position: relative; top: 2px;">
          <a class="mal-sync-stream" title="${
            streamUrl ? streamUrl.split('/')[2] : ''
          }" target="_blank" style="margin: 0 0;" href="${streamUrl}">
            <img src="${utils.favicon(streamUrl ? streamUrl.split('/')[2] : '')}">
          </a>
        </div>`),
          );

        const resumeUrlObj = malObj.getResumeWatching();
        const continueUrlObj = malObj.getContinueWatching();
        con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
        if (continueUrlObj && continueUrlObj.ep === malObj.getEpisode() + 1) {
          $('#mal-sync-stream-div').append(
            j.html(
              `<a class="nextStream" title="${api.storage.lang(
                `overview_Continue_${malObj.getType()}`,
              )}" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${
                continueUrlObj.url
              }">
              <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16">
            </a>`,
            ),
          );
        } else if (resumeUrlObj && resumeUrlObj.ep === malObj.getEpisode()) {
          $('#mal-sync-stream-div').append(
            j.html(
              `<a class="resumeStream" title="${api.storage.lang(
                `overview_Resume_Episode_${malObj.getType()}`,
              )}" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${
                resumeUrlObj.url
              }">
              <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
            </a>`,
            ),
          );
        }
      });
    }
  }

  async pageRelation(malObj) {
    await malObj.fillRelations();

    $('.malsync-rel-link').remove();
    $('h1').first().append(j.html(`<div class="malsync-rel-link" style="float: right;"></div>`));

    malObj.getPageRelations().forEach(page => {
      $('.malsync-rel-link').append(
        j.html(`
          <a href="${page.link}" target="_blank" title="${page.name}" class="link">
            <img src="${page.icon}" width="16" width="16">
          </a>

        `),
      );
    });
  }

  private tempAnimelist: any = null;

  private tempMangalist: any = null;

  bookmarks() {
    if (this.authError) return;
    const This = this;
    $(document).ready(() => {
      $('.list-entries .entry, .list-entries .entry-card')
        .not('.malSyncDone')
        .each((index, el) => {
          $(el).addClass('malSyncDone');
          let label = $(el).find('.notes').first().attr('label');

          if (typeof label !== 'undefined') {
            label = label.replace(/(malSync|last)::[\d\D]+::/, '').replace(/#,/, '');
            if (label.trim() === '' || label.trim() === ',') {
              $(el).find('.notes').first().css('visibility', 'hidden');
            } else {
              $(el).find('.notes').first().attr('label', label);
            }
          }
        });

      if (this.page!.type === 'anime') {
        if (this.tempAnimelist !== null) {
          fullListCallback(this.tempAnimelist);
          return;
        }
      } else if (this.tempMangalist !== null) {
        fullListCallback(this.tempMangalist);
        return;
      }

      const listProvider: UserList = new UserList(1, this.page!.type);

      listProvider
        .getCompleteList()
        .then(list => {
          if (this.page!.type === 'anime') {
            this.tempAnimelist = list;
          } else {
            this.tempMangalist = list;
          }
          fullListCallback(list);
        })
        .catch(e => {
          if (e instanceof NotAutenticatedError) this.authError = true;
          con.error(e);
          listProvider.flashmError(e);
        });

      function fullListCallback(list) {
        con.log(list);
        $.each(list, async (index, en) => {
          const tempEl = $(
            `.entry:not(.malSyncDone2) a[href^="/${This.page!.type}/${
              en.uid
            }/"], .entry-card:not(.malSyncDone2) a[href^="/${This.page!.type}/${en.uid}/"]`,
          );
          if (tempEl.length) {
            const element = tempEl.first().parent();

            element.parent().addClass('malSyncDone2');

            if (en.options && en.options.u) {
              con.log(en.options.u);
              element
                .find('a')
                .first()
                .after(
                  j.html(`
                <a class="mal-sync-stream mal-rem" title="${
                  en.options.u.split('/')[2]
                }" target="_blank" style="margin: 0 0; max-height: 14px;" href="${en.options.u}">
                  <img src="${utils.favicon(en.options.u.split('/')[2])}">
                </a>`),
                );
            }

            const resumeUrlObj = en.options.r;
            const continueUrlObj = en.options.c;

            const curEp = en.watchedEp;

            con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
            if (continueUrlObj && continueUrlObj.ep === curEp + 1) {
              element.prepend(
                j.html(
                  `<a class="nextStream mal-rem" title="Continue watching" target="_blank" style="margin: -2px 5px 0 0; color: #BABABA;" href="${
                    continueUrlObj.url
                  }">
                  <img src="${api.storage.assetUrl(
                    'double-arrow-16px.png',
                  )}" width="16" height="16">
                </a>`,
                ),
              );
            } else if (resumeUrlObj && resumeUrlObj.ep === curEp) {
              element.prepend(
                j.html(
                  `<a class="resumeStream mal-rem" title="Resume watching" target="_blank" style="margin: -2px 5px 0 0; color: #BABABA;" href="${
                    resumeUrlObj.url
                  }">
                  <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
                </a>`,
                ),
              );
            }

            await en.fn.initProgress();
            if (en.fn.progress && en.fn.progress.isAiring() && en.fn.progress.getCurrentEpisode()) {
              element
                .parent()
                .find('.progress')
                .first()
                .append(
                  j.html(
                    ` <span class="mal-sync-ep-pre" title="${en.fn.progress.getAutoText()}">[<span style="border-bottom: 1px dotted ${en.fn.progress.getColor()};">${en.fn.progress.getCurrentEpisode()}</span>]</span>`,
                  ),
                );
            }
          }
        });
      }
    });
  }

  protected initVue(malObj) {
    if (!api.settings.get('anilistUpdateUi')) return;

    if (!$('#malsync-update-ui').length)
      $('.sidebar').first().prepend(j.html('<div id="malsync-update-ui"></div>'));

    if (this.vueEl) this.vueEl.$.appContext.app.unmount();

    this.vueEl = createApp(updateUi, '#malsync-update-ui');

    this.vueEl.malObj = malObj;
  }
}
