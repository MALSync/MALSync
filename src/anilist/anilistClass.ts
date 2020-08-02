import * as helper from '../provider/AniList/helper';
import { Single as anilistSingle } from '../_provider/AniList/single';
import { userlist } from '../_provider/AniList/list';

interface detail {
  page: 'detail';
  id: number;
  malid: number;
  type: 'anime' | 'manga';
}

interface bookmarks {
  page: 'bookmarks';
  type: 'anime' | 'manga';
}

export class anilistClass {
  page: any = null;

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
          return $('.lists')
            .first()
            .height();
        }
        let ogUrl = $('meta[property="og:url"]').attr('content');
        if (typeof ogUrl !== 'undefined' && ogUrl.split('/').length > 4) {
          return ogUrl
            .split('/')
            .slice(0, 6)
            .join('/');
        }
        ogUrl = window.location.href;

        return ogUrl;
      },
    );

    if (this.url.indexOf('access_token=') > -1) {
      this.init();
    }

    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
  }

  init() {
    if (this.url.indexOf('access_token=') > -1) {
      this.authentication();
    }

    const urlpart = utils.urlPart(this.url, 3);
    if (urlpart === 'anime' || urlpart === 'manga') {
      this.page = {
        page: 'detail',
        id: utils.urlPart(this.url, 4),
        malid: NaN,
        type: urlpart,
      };
      this.siteSearch();
      this.streamingUI();
      helper.aniListToMal(this.page.id, this.page.type).then(malid => {
        this.page!.malid = malid;
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

  async authentication() {
    try {
      utils.checkDoubleExecution();
    } catch (e) {
      con.error(e);
    }
    const tokens = /access_token=[^&]+/gi.exec(this.url);
    if (tokens !== null && typeof tokens[0] !== 'undefined' && tokens[0]) {
      const token = tokens[0].toString().replace(/access_token=/gi, '');
      con.log('Token Found', token);

      await api.settings.set('anilistToken', token);

      $(document).ready(function() {
        $('.page-content .container').html(
          j.html(
            `
          <div style="text-align: center; margin-top: 50px; background-color: white; border: 1px solid lightgrey; padding: 10px;">
            <h1>MAL-Sync</h1>
            <br>
            ${api.storage.lang('anilistClass_authentication')}
          </div>
        `,
          ),
        );
      });
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

  malToKiss() {
    con.log('malToKiss');
    $('.mal_links').remove();
    utils.getMalToKissArray(this.page!.type, this.page!.malid).then(links => {
      let html = '';
      for (const pageKey in links) {
        const page = links[pageKey];

        let tempHtml = '';
        let tempUrl = '';
        for (const streamKey in page) {
          const stream = page[streamKey];
          tempHtml += `
          <div class="mal_links" style="margin-top: 5px;">
            <a target="_blank" href="${stream.url}">
              ${stream.title}
            </a>
          </div>`;
          tempUrl = stream.url;
        }
        html += `
          <div id="${pageKey}Links" class="mal_links" style="
            background: rgb(var(--color-foreground));
            border-radius: 3px;
            display: block;
            padding: 8px 12px;
            width: 100%;
            margin-bottom: 16px;
            font-size: 1.2rem;

          ">
            <img src="${utils.favicon(tempUrl.split('/')[2])}">
            <span style="font-weight: 500; line-height: 16px; vertical-align: middle;">${pageKey}</span>
            <span title="${pageKey}" class="remove-mal-sync" style="float: right; cursor: pointer;">x</span>
            ${tempHtml}
          </div>`;
      }
      $(document).ready(function() {
        $('.mal_links').remove();
        $('.sidebar .data').before(j.html(html));
        $('.remove-mal-sync').click(function() {
          const key = $(this).attr('title');
          api.settings.set(String(key), false);
          window.location.reload();
        });
      });
    });
  }

  siteSearch() {
    if (!api.settings.get('SiteSearch')) return;
    const This = this;
    $(document).ready(function() {
      con.log('Site Search');
      let pageSearch = {};
      utils.getPageSearch().then(pages => {
        pageSearch = pages;
      });
      $('#mal-sync-search-links').remove();
      $('.sidebar .data').before(
        j.html(
          `
        <div id="mal-sync-search-links" style="
            background: rgb(var(--color-foreground));
            border-radius: 3px;
            display: block;
            padding: 8px 12px;
            width: 100%;
            margin-bottom: 16px;
            font-size: 1.2rem;
        ">
          <span style="font-weight: 500; line-height: 16px; vertical-align: middle;">${api.storage.lang(
            'Search',
          )}</span>
          <div class="MALSync-search"><a>[${api.storage.lang('Show')}]</a></div><br class="mal_links" />
        </div>
      `,
        ),
      );
      api.storage.addStyle('#AniList.mal_links img{background-color: #898989;}');
      $('.MALSync-search').one('click', () => {
        const title = $('meta[property="og:title"]').attr('content');
        const titleEncoded = encodeURI(title!);
        let html = '';
        const imgStyle = 'position: relative; top: 0px;';

        for (const key in pageSearch) {
          const page = pageSearch[key];
          if (page.type !== This.page!.type) continue;

          const linkContent = `<img style="${imgStyle}" src="${utils.favicon(page.domain)}"> ${page.name}`;

          let link;
          if (typeof page.completeSearchTag === 'undefined') {
            link = `<a target="_blank" href="${page.searchUrl.replace('##searchkey##', titleEncoded)}">
              ${linkContent}
            </a>`;
          } else {
            link = page.completeSearchTag(title, linkContent);
          }

          let googleSeach = '';
          if (typeof page.googleSearchDomain !== 'undefined') {
            googleSeach = `<a target="_blank" href="https://www.google.com/search?q=${titleEncoded}+site:${
              page.googleSearchDomain
            }">
              <img style="${imgStyle}" src="${utils.favicon('google.com')}">
            </a>`;
          }

          html += `<div class="mal_links" id="${key}" style="padding: 1px 0;">
              ${link}
              ${googleSeach}
          </div>`;
        }

        $('.MALSync-search').html(j.html(html));
      });
    });
  }

  async streamingUI() {
    con.log('Streaming UI');
    $('#mal-sync-stream-div').remove();
    const malObj = new anilistSingle(this.url);
    await malObj.update();

    const streamUrl = malObj.getStreamingUrl();
    if (streamUrl) {
      $(document).ready(async function() {
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
              )}" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${continueUrlObj.url}">
              <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16">
            </a>`,
            ),
          );
        } else if (resumeUrlObj && resumeUrlObj.ep === malObj.getEpisode()) {
          $('#mal-sync-stream-div').append(
            j.html(
              `<a class="resumeStream" title="${api.storage.lang(
                `overview_Resume_Episode_${malObj.getType()}`,
              )}" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${resumeUrlObj.url}">
              <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
            </a>`,
            ),
          );
        }
      });
    }
  }

  private tempAnimelist: any = null;

  private tempMangalist: any = null;

  bookmarks() {
    const This = this;
    $(document).ready(() => {
      $('.list-entries .entry, .list-entries .entry-card')
        .not('.malSyncDone')
        .each((index, el) => {
          $(el).addClass('malSyncDone');
          let label = $(el)
            .find('.notes')
            .first()
            .attr('label');

          if (typeof label !== 'undefined') {
            label = label.replace(/(malSync|last)::[\d\D]+::/, '').replace(/#,/, '');
            if (label.trim() === '' || label.trim() === ',') {
              $(el)
                .find('.notes')
                .first()
                .css('visibility', 'hidden');
            } else {
              $(el)
                .find('.notes')
                .first()
                .attr('label', label);
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

      const listProvider: userlist = new userlist(1, this.page!.type);

      listProvider
        .get()
        .then(list => {
          if (this.page!.type === 'anime') {
            this.tempAnimelist = list;
          } else {
            this.tempMangalist = list;
          }
          fullListCallback(list);
        })
        .catch(e => {
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
                  <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16">
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

            utils.epPredictionUI(en.malId, en.cacheKey, This.page!.type, prediction => {
              if (!prediction) return;
              element
                .parent()
                .find('.progress')
                .append(j.html(prediction.tag));
            });
          }
        });
      }
    });
  }
}
