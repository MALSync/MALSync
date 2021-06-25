import Vue from 'vue';
import { Single as SimklSingle } from '../_provider/Simkl/single';
import { UserList } from '../_provider/Simkl/list';
import * as helper from '../provider/Simkl/helper';
import malkiss from './malkiss.vue';
import { activeLinks } from '../utils/quicklinksBuilder';

interface detail {
  page: 'detail';
  id: number;
  malid: number;
  type: 'anime' | 'manga';
  malObj: undefined;
}

interface bookmarks {
  page: 'bookmarks';
  type: 'anime' | 'manga';
}

export class SimklClass {
  page: any = null;

  private interval;

  private interval2;

  private malkiss;

  constructor(public url: string) {
    utils.urlChangeDetect(() => {
      clearInterval(this.interval);
      this.interval = utils.waitUntilTrue(
        function() {
          return (
            (!$('#global_div').length || parseInt($('#global_div').css('opacity')) === 1) &&
            (!$('#tvMainTable').length || parseInt($('#tvMainTable').css('opacity')) === 1)
          );
        },
        () => {
          this.url = window.location.href;
          this.init();
        },
        1000,
      );
    });

    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    $(document).ready(() => {
      this.init();
    });
  }

  async init() {
    con.log(this.url);

    clearInterval(this.interval2);

    if (this.url.indexOf('apps/chrome/mal-sync') > -1) {
      this.authentication();
    }

    const urlpart = utils.urlPart(this.url, 3);
    const url2part = utils.urlPart(this.url, 4);

    if ((urlpart === 'anime' || urlpart === 'manga') && !Number.isNaN(Number(url2part))) {
      const malObj = new SimklSingle(this.url);
      await malObj.update();

      this.page = {
        page: 'detail',
        id: malObj.getIds().simkl,
        malid: malObj.getIds().mal,
        type: urlpart,
        malObj,
      };
      con.log('page', this.page);

      if (!$('#malkiss').length)
        $('.SimklTVAboutBlockTitle, .simkltvdetailmobilesummaryinfo').after(j.html('<div id="malkiss"></div>'));
      if (this.malkiss) this.malkiss.$destroy();
      this.malkiss = new Vue({
        el: '#malkiss',
        render: h => h(malkiss),
      }).$children[0];

      this.streamingUI();
      this.malToKiss();
      this.pageRelation();
      return;
    }

    if ((urlpart === 'anime' || urlpart === 'manga') && url2part === 'all') {
      this.page = {
        page: 'bookmarks',
        type: urlpart,
      };
      this.bookmarksAnime();
    }

    if (url2part === 'anime' || url2part === 'manga') {
      const status = utils.urlPart(this.url, 5);
      if (status === 'watching') {
        this.page = {
          page: 'bookmarks',
          type: url2part,
        };
        this.bookmarksProfile();
      }
    }
  }

  async getMalUrl() {
    const urlpart = utils.urlPart(this.url, 3);
    if (urlpart === 'anime' || urlpart === 'manga') {
      const simklId = utils.urlPart(this.url, 4);
      return helper.simklIdToMal(simklId).then(malId => {
        if (!malId) return '';
        return `https://myanimelist.net/${urlpart}/${malId}/${utils.urlPart(this.url, 5)}`;
      });
    }
    return '';
  }

  authentication() {
    try {
      utils.checkDoubleExecution();
    } catch (e) {
      con.error(e);
    }
    try {
      const code = utils.urlParam(this.url, 'code');
      if (!code) throw 'No code found!';
      helper
        .call(
          'https://api.simkl.com/oauth/token',
          JSON.stringify({
            code,
            client_id: helper.client_id,
            client_secret: '3f883e8e6cdd60d2d5e765aaf0612953f743dc77f44c422af98b38e083cf038b',
            redirect_uri: 'https://simkl.com/apps/chrome/mal-sync/connected/',
            grant_type: 'authorization_code',
          }),
          false,
          'POST',
        )
        .then(access_token => {
          if (typeof access_token.error !== 'undefined' || typeof access_token.access_token === 'undefined')
            throw access_token;
          return api.settings.set('simklToken', access_token.access_token);
        })
        .then(access_token => {
          $('.firstStage').addClass('HideImportant');
          $('.secondStage').removeClass('HideImportant');
          $('.secondStage .SimklTVKodiheaddesc').css('text-align', 'center');
        })
        .catch(e => {
          ee(e);
        });
    } catch (e) {
      ee(e);
    }

    function ee(e) {
      con.error(e);
      $('.firstStage .SimklTVKodititletext, .secondStage .SimklTVKodititletext').text('Something went wrong');
    }
  }

  async streamingUI() {
    con.log('Streaming UI');

    const { malObj } = this.page;

    const streamUrl = malObj.getStreamingUrl();
    if (typeof streamUrl !== 'undefined') {
      this.malkiss.streamUrl = streamUrl;

      const resumeUrlObj = malObj.getResumeWatching();
      const continueUrlObj = malObj.getContinueWatching();
      con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
      if (continueUrlObj && continueUrlObj.ep === malObj.getEpisode() + 1) {
        this.malkiss.continueUrl = continueUrlObj.url;
      } else if (resumeUrlObj && resumeUrlObj.ep === malObj.getEpisode()) {
        this.malkiss.resumeUrl = resumeUrlObj.url;
      }
    } else {
      this.malkiss.streamUrl = null;
    }
  }

  malToKiss() {
    con.log('malToKiss');

    const title = $('h1')
      .first()
      .text()
      .trim();

    activeLinks(this.page!.type, this.page!.malid, title).then(links => {
      this.malkiss.links = links;
    });
  }

  async pageRelation() {
    await this.page.malObj.fillRelations();
    this.malkiss.pageRelation = this.page.malObj.getPageRelations();
  }

  bookmarksProfile() {
    const listProvider: UserList = new UserList(1, this.page!.type);

    listProvider
      .getCompleteList()
      .then(list => {
        $.each(list, async (index, en) => {
          con.log('en', en);
          const element = $(`a[href^="/${this.page!.type}/${en.uid}"]`);
          if (!element || element.hasClass('malSyncDone2')) return;
          element.addClass('malSyncDone2');

          if (en.options && en.options.u) {
            con.log(en.options.u);
            element.after(
              j.html(`
            <a class="mal-sync-stream mal-rem" onclick="event.stopPropagation();" title="${
              en.options.u.split('/')[2]
            }" target="_blank" style="display: inline-block; height: 0; position: relative; top: -11px; margin-left: 5px;" href="${
                en.options.u
              }">
              <img src="${utils.favicon(en.options.u.split('/')[2])}">
            </a>`),
            );

            const resumeUrlObj = en.options.r;
            const continueUrlObj = en.options.c;

            const curEp = en.watchedEp;

            con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
            if (continueUrlObj && continueUrlObj.ep === curEp + 1) {
              element.parent().append(
                j.html(
                  `<a class="nextStream mal-rem" onclick="event.stopPropagation();" title="Continue watching" target="_blank" style="display: inline-block; height: 0; position: relative; top: -11px; margin-left: 5px; color: #BABABA;" href="${
                    continueUrlObj.url
                  }">
                <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16">
              </a>`,
                ),
              );
            } else if (resumeUrlObj && resumeUrlObj.ep === curEp) {
              element.parent().append(
                j.html(
                  `<a class="resumeStream mal-rem" onclick="event.stopPropagation();" title="Resume watching" target="_blank" style="display: inline-block; height: 0; position: relative; top: -11px; margin-left: 5px; color: #BABABA;" href="${
                    resumeUrlObj.url
                  }">
                <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
              </a>`,
                ),
              );
            }
          }
        });
      })
      .catch(e => {
        con.error(e);
        listProvider.flashmError(e);
      });
  }

  bookmarksAnime() {
    const listProvider: UserList = new UserList(1, this.page!.type);

    listProvider
      .getCompleteList()
      .then(list => {
        exec();

        this.interval2 = utils.changeDetect(
          () => {
            exec();
          },
          () => {
            return $('#tv_best_left_addContainer li').length + $('#tv_best_left_addContainer > div').height()!;
          },
        );

        function exec() {
          con.info('list');
          $.each(list, async (index, en) => {
            const element = $(`#c${en.uid}`);
            if (!element || !element.length || element.hasClass('malSyncDone2')) return;
            element.addClass('malSyncDone2').css('position', 'relative');

            if (en.options && en.options.u) {
              con.log(en.options.u);
              element.append(
                j.html(`
              <a class="mal-sync-stream mal-rem" onclick="event.stopPropagation();" title="${
                en.options.u.split('/')[2]
              }" target="_blank" style="position: absolute; z-index: 10; right: 0; top: 0; background-color: #00000057; padding: 5px;" href="${
                  en.options.u
                }">
                <img src="${utils.favicon(en.options.u.split('/')[2])}">
              </a>`),
              );

              const resumeUrlObj = en.options.r;
              const continueUrlObj = en.options.c;

              const curEp = en.watchedEp;

              con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
              if (continueUrlObj && continueUrlObj.ep === curEp + 1) {
                element.append(
                  j.html(
                    `<a class="nextStream mal-rem" onclick="event.stopPropagation();" title="Continue watching" target="_blank" style="position: absolute; z-index: 10; right: 0; top: 26px; background-color: #00000057; padding: 5px;" href="${
                      continueUrlObj.url
                    }">
                  <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16">
                </a>`,
                  ),
                );
              } else if (resumeUrlObj && resumeUrlObj.ep === curEp) {
                element.append(
                  j.html(
                    `<a class="resumeStream mal-rem" onclick="event.stopPropagation();" title="Resume watching" target="_blank" style="position: absolute; z-index: 10; right: 0; top: 26px; background-color: #00000057; padding: 5px;" href="${
                      resumeUrlObj.url
                    }">
                  <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
                </a>`,
                  ),
                );
              }
            }
          });
        }
      })
      .catch(e => {
        con.error(e);
        listProvider.flashmError(e);
      });
  }
}
