import { Single as KitsuSingle } from '../_provider/Kitsu/single';
import { UserList } from '../_provider/Kitsu/list';
import { activeLinks, removeFromOptions } from '../utils/quicklinksBuilder';
import { waitForPageToBeVisible } from '../utils/general';
import { NotAutenticatedError } from '../_provider/Errors';

export class KitsuClass {
  page: any = null;

  same = false;

  protected authError = false;

  constructor(public url: string) {
    let oldUrl = window.location.href.split('/').slice(0, 5).join('/');
    utils.changeDetect(
      () => {
        this.same = false;
        if (this.page !== null && this.page.page === 'detail') {
          const tempUrl = window.location.href.split('/').slice(0, 5).join('/');
          if (tempUrl === oldUrl) {
            this.same = true;
          }
          oldUrl = tempUrl;
        }

        this.url = window.location.href;
        this.init();
      },
      () => {
        if (this.page !== null && this.page.page === 'bookmarks' && $('.library-content').length) {
          return $('.library-content').first().height();
        }

        return window.location.href;
      },
    );

    $(document).ready(() => {
      utils.waitUntilTrue(
        function () {
          return $('.global-container').length;
        },
        () => {
          this.init();
        },
      );
    });

    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
  }

  async init() {
    await waitForPageToBeVisible();
    if (this.url.indexOf('?mal-sync=authentication') > -1) {
      this.authentication();
    }

    const urlpart = utils.urlPart(this.url, 3);
    if ((urlpart === 'anime' || urlpart === 'manga') && utils.urlPart(this.url, 4)) {
      if (this.same && typeof this.page !== 'undefined' && this.page.malObj !== 'undefined') {
        this.streamingUI();
        this.malToKiss();
        this.pageRelation();
        return;
      }
      const malObj = new KitsuSingle(this.url);
      await malObj.update();

      this.page = {
        page: 'detail',
        id: malObj.getIds().kitsu.id,
        malid: malObj.getIds().mal,
        apiCacheKey: malObj.getApiCacheKey(),
        type: urlpart,
        malObj,
      };
      con.log('page', this.page);
      this.streamingUI();
      this.malToKiss();
      this.pageRelation();
    }

    const urlpart4 = utils.urlPart(this.url, 5);
    if (urlpart4 === 'library') {
      let type = 'anime';
      if (utils.urlParam(this.url, 'media') === 'manga') type = 'manga';
      this.page = {
        page: 'bookmarks',
        type,
      };
      con.log('page', this.page);
      this.bookmarks();
    }
  }

  authentication() {
    try {
      utils.checkDoubleExecution();
    } catch (e) {
      con.error(e);
    }
    $(document).ready(function () {
      $('body').after(
        j.html(
          `
        <div id="mal-sync-login" style="text-align: center; margin-top: 50px; background-color: white; border: 1px solid lightgrey; padding: 10px; max-width: 600px; margin-left: auto; margin-right: auto;">
          <h1>MAL-Sync</h1>
          <br>
          <p style="text-align: left;">
            ${api.storage.lang('kitsuClass_authentication_text')}
          </p>
          <div class="modal-content">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="pass" name="password" placeholder="${api.storage.lang(
              'kitsuClass_authentication_Password',
            )}" required>
          </div>
          <div class="form-cta" style="margin-top: 30px;">
            <button class="btn button--primary" type="submit" id="mal-sync-button">
              ${api.storage.lang('kitsuClass_authentication_Login')}
            </button>
          </div>
        </div>
      `,
        ),
      );
      $('#mal-sync-login #mal-sync-button').click(function () {
        $('#mal-sync-login #mal-sync-button').attr('disabled', 'disabled');
        $.ajax({
          type: 'POST',
          url: 'https://kitsu.io/api/oauth/token',
          data: `grant_type=password&username=${encodeURIComponent(
            String($('#mal-sync-login #email').val()),
          )}&password=${encodeURIComponent(String($('#mal-sync-login #pass').val()))}`,
          async success(result) {
            const token = result.access_token;

            if (!token) return;

            con.info('token', token);

            await api.settings.set('kitsuToken', token);

            $('#mal-sync-login').html(
              j.html(
                `<h1>MAL-Sync</h1><br>${api.storage.lang('kitsuClass_authentication_Success')}`,
              ),
            );
          },
          error(result) {
            try {
              con.error(result);
              $('#mal-sync-login #mal-sync-button').prop('disabled', false);
              if (result.responseJSON.error === 'invalid_grant') {
                utils.flashm(api.storage.lang('kitsuClass_authentication_Wrong'));
                return;
              }
              utils.flashm(result.responseJSON.error_description);
            } catch (e) {
              con.error(e);
              utils.flashm(result.responseText);
            }
          },
        });
      });

      utils.waitUntilTrue(
        function () {
          return $('body h1').length;
        },
        () => {
          $('body h1').remove();
        },
      );
    });
  }

  async getMalUrl() {
    if (this.page !== null && this.page.page === 'detail' && this.page.malid) {
      return `https://myanimelist.net/${this.page.type}/${this.page.malid}/${utils.urlPart(
        this.url,
        5,
      )}`;
    }
    return '';
  }

  async streamingUI() {
    con.log('Streaming UI');
    $('#mal-sync-stream-div').remove();
    const { malObj } = this.page;

    const streamUrl = malObj.getStreamingUrl();
    if (streamUrl) {
      $(document).ready(async function () {
        $('.media--title h3')
          .first()
          .after(
            j.html(`
        <div class="data title progress" id="mal-sync-stream-div" style="display: inline-block; position: relative; top: -4px; display: inline;">
          <a class="mal-sync-stream" title="${
            streamUrl.split('/')[2]
          }" target="_blank" style="margin: 0 0;" href="${streamUrl}">
            <img src="${utils.favicon(streamUrl.split('/')[2])}">
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

  getImage() {
    return j.$('.media-poster img').attr('src') || '';
  }

  getTitle() {
    return $('meta[property="og:title"]').attr('content') || '';
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
            <div id="${page.name}Links" class="mal_links library-state with-header" style="
              background: white;
              margin-bottom: 15px;
              border-radius: 3px;
              display: block;
              padding: 8px 12px;
              width: 100%;
              font-size: 12px;
              word-break: break-all;
            ">
              <img src="${utils.favicon(page.domain)}">
              <span style="font-weight: 500; line-height: 16px; vertical-align: middle;">${
                page.name
              }</span>
              <span title="${
                page.name
              }" class="remove-mal-sync" style="float: right; cursor: pointer;">x</span>
              ${tempHtml}
            </div>`;
        });

        if ($('#mal-sync-search-links').length) {
          $('#mal-sync-search-links').first().after(j.html(html));
        } else {
          $('.media-summary').first().after(j.html(html));
        }

        $('.remove-mal-sync').click(function () {
          const key = $(this).attr('title');
          removeFromOptions(String(key));
          window.location.reload();
        });
      });
    });
  }

  async pageRelation() {
    $('.malsync-rel-link').remove();
    await this.page.malObj.fillRelations();
    $('.media-summary h5')
      .first()
      .append(
        j.html(
          `<div class="malsync-rel-link" style="display: inline-block; margin: 0 5px; vertical-align: bottom;"></div>`,
        ),
      );

    this.page.malObj.getPageRelations().forEach(page => {
      $('.malsync-rel-link').append(
        j.html(`
          <a href="${page.link}" target="_blank" title="${page.name}" class="link">
            <img src="${page.icon}" width="16" height="16">
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
      if (this.page!.type === 'anime') {
        if (this.tempAnimelist !== null) {
          fullListCallback(this.tempAnimelist);
          return;
        }
      } else if (this.tempMangalist !== null) {
        fullListCallback(this.tempMangalist);
        return;
      }

      const listProvider: UserList = new UserList(1, this.page.type);

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
        let cover = true;
        if ($('.library-list tbody tr').length) cover = false;
        con.log(list);
        $.each(list, async (index, en) => {
          con.log('en', en);
          if (typeof en.malId !== 'undefined' && en.malId !== null && en.malId) {
            const element = $(
              `.library-grid-popover:not(.malSyncDone2) a[href^="/${This.page!.type}/${
                en.kitsuSlug
              }"], .library-list tbody tr:not(.malSyncDone2) a[href^="/${This.page!.type}/${
                en.kitsuSlug
              }"]`,
            )
              .first()
              .parent()
              .parent()
              .parent();
            con.log(element);
            element.addClass('malSyncDone2');

            if (en.options && en.options.u) {
              con.log(en.options.u);

              if (cover) {
                element.prepend(
                  j.html(`
                  <a class="mal-sync-stream mal-rem" title="${
                    en.options.u.split('/')[2]
                  }" target="_blank" style="margin: 0 0; z-index: 22; position:absolute; left: 0px; top: 0px; background-color: #ffffff5c; padding: 0 5px 3px 5px;" href="${
                    en.options.u
                  }">
                    <img src="${utils.favicon(en.options.u.split('/')[2])}">
                  </a>`),
                );
              } else {
                element.find('.title-wrapper').append(
                  j.html(`
                  <a class="mal-sync-stream mal-rem" title="${
                    en.options.u.split('/')[2]
                  }" target="_blank" style="padding: 0 5px;" href="${en.options.u}">
                    <img src="${utils.favicon(en.options.u.split('/')[2])}">
                  </a>`),
                );
              }
            }

            const resumeUrlObj = en.options.r;
            const continueUrlObj = en.options.c;

            const curEp = en.watchedEp;

            con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
            if (continueUrlObj && continueUrlObj.ep === curEp + 1) {
              if (cover) {
                element.prepend(
                  j.html(
                    `<a class="nextStream mal-rem" title="Continue watching" target="_blank" style="color: #BABABA; z-index: 22; position:absolute; top: 0px; left: 26px; background-color: #ffffff5c; padding: 0 5px 3px 5px;" href="${
                      continueUrlObj.url
                    }">
                    <img src="${api.storage.assetUrl(
                      'double-arrow-16px.png',
                    )}" width="16" height="16">
                  </a>`,
                  ),
                );
              } else {
                element.find('.title-wrapper').append(
                  j.html(
                    `<a class="nextStream mal-rem" title="Continue watching" target="_blank" style="padding: 0;" href="${
                      continueUrlObj.url
                    }">
                    <img src="${api.storage.assetUrl(
                      'double-arrow-16px.png',
                    )}" width="16" height="16">
                  </a>`,
                  ),
                );
              }
            } else if (resumeUrlObj && resumeUrlObj.ep === curEp) {
              if (cover) {
                element.prepend(
                  j.html(
                    `<a class="resumeStream mal-rem" title="Resume watching" target="_blank" style="color: #BABABA; z-index: 22; position:absolute; top: 0px; left: 26px; background-color: #ffffff5c; padding: 0 5px 3px 5px;" href="${
                      resumeUrlObj.url
                    }">
                    <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
                  </a>`,
                  ),
                );
              } else {
                element.find('.title-wrapper').append(
                  j.html(
                    `<a class="resumeStream mal-rem" title="Resume watching" target="_blank" style="padding: 0;" href="${
                      resumeUrlObj.url
                    }">
                    <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
                  </a>`,
                  ),
                );
              }
            }

            await en.fn.initProgress();
            if (en.fn.progress && en.fn.progress.isAiring() && en.fn.progress.getCurrentEpisode()) {
              element
                .parent()
                .find('.entry-unit, .progress-cell > span:last-of-type')
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
}
