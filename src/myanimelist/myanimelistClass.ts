// Double import is needed or the code will break. No idea why

// eslint-disable-next-line import/no-duplicates
import { Single as LegacySingle } from '../_provider/MyAnimeList_hybrid/single';
import { UserList as LegacyList } from '../_provider/MyAnimeList_legacy/list';

// eslint-disable-next-line import/no-duplicates
import { Single as ApiSingle } from '../_provider/MyAnimeList_hybrid/single';
import { UserList as ApiList } from '../_provider/MyAnimeList_hybrid/list';
import { activeLinks, removeFromOptions } from '../utils/quicklinksBuilder';

export class MyAnimeListClass {
  page: 'detail' | 'bookmarks' | 'modern' | 'classic' | 'character' | 'people' | 'search' | null = null;

  // detail
  readonly id: number | null = null;

  readonly type: 'anime' | 'manga' | null = null;

  // bookmarks
  readonly username: any = null;

  constructor(public url: string) {
    let urlTemp;
    if (url.indexOf('myanimelist.net/anime.php') > -1) {
      urlTemp = `/anime/${utils.urlParam(this.url, 'id')}`;
      // @ts-ignore
      window.history.replaceState(null, null, urlTemp);
      this.url = utils.absoluteLink(urlTemp, 'https://myanimelist.net');
    }
    if (url.indexOf('myanimelist.net/manga.php') > -1) {
      urlTemp = `/manga/${utils.urlParam(this.url, 'id')}`;
      // @ts-ignore
      window.history.replaceState(null, null, urlTemp);
      this.url = utils.absoluteLink(urlTemp, 'https://myanimelist.net');
    }

    const urlpart = utils.urlPart(this.url, 3);
    if (urlpart === 'anime' || urlpart === 'manga') {
      this.page = 'detail';
      this.id = Number(utils.urlPart(this.url, 4));
      this.type = urlpart;
    }
    if (urlpart === 'animelist' || urlpart === 'mangalist') {
      this.page = 'bookmarks';
      this.username = utils.urlPart(this.url, 4);
      this.type = urlpart === 'animelist' ? 'anime' : 'manga';
    }
    if (urlpart === 'character') {
      this.page = 'character';
    }
    if (urlpart === 'people') {
      this.page = 'people';
    }
    if (urlpart === 'search') {
      this.page = 'search';
    }
  }

  init() {
    con.log(this);
    switch (this.page) {
      case 'detail':
        this.thumbnails();
        this.streamingUI();
        this.malToKiss();
        this.related();
        this.friendScore();
        this.relatedTag();
        break;
      case 'bookmarks':
        $(document).ready(() => {
          if ($('#mal_cs_powered').length) {
            this.page = 'classic';
          } else {
            this.page = 'modern';
          }
          this.init();
        });
        break;
      case 'modern':
        this.bookmarks();
        break;
      case 'classic':
        this.bookmarks();
        break;
      case 'character':
      case 'people':
        this.relatedTag();
      case 'search':
        this.thumbnails();
        break;
      default:
        con.log('This page has no scipt');
    }
  }

  thumbnails() {
    con.log('Lazyloaded Images');
    if (this.url.indexOf('/pics') > -1) {
      return;
    }
    if (this.url.indexOf('/pictures') > -1) {
      return;
    }
    if (api.settings.get('malThumbnail') === '0') {
      return;
    }
    const height = parseInt(api.settings.get('malThumbnail'));
    const width = Math.floor((height / 144) * 100);

    const surHeight = height + 4;
    const surWidth = width + 4;
    api.storage.addStyle(`.picSurround img:not(.noKal){height: ${height}px !important; width: ${width}px !important;}`);
    api.storage.addStyle('.picSurround img.lazyloaded.kal{width: auto !important;}');
    api.storage.addStyle(
      `.picSurround:not(.noKal) a{height: ${surHeight}px; width: ${surWidth}px; overflow: hidden; display: flex; justify-content: center;}`,
    );
    api.storage.addStyle(`.picSurround img[src*="userimages"]{max-width: ${width}px !important}`);

    let loaded = 0;
    try {
      // @ts-ignore
      $(window).load(function() {
        overrideLazyload();
      });
    } catch (e) {
      con.info(e);
    }
    try {
      window.onload = function() {
        overrideLazyload();
      };
    } catch (e) {
      con.info(e);
    }
    try {
      document.onload = function() {
        overrideLazyload();
      };
    } catch (e) {
      con.info(e);
    }
    try {
      $(document).ready(function() {
        overrideLazyload();
      });
    } catch (e) {
      con.info(e);
    }

    function overrideLazyload() {
      if (loaded) return;
      loaded = 1;
      const tags = document.querySelectorAll('.picSurround img:not(.kal)');
      let url = '';
      for (let i = 0; i < tags.length; i++) {
        const regexDimensions = /\/r\/\d*x\d*/g;
        if (tags[i].hasAttribute('data-src')) {
          url = tags[i].getAttribute('data-src')!;
        } else {
          url = tags[i].getAttribute('src')!;
        }

        if (regexDimensions.test(url) || /voiceactors.*v.jpg$/g.test(url) || url.indexOf('questionmark') !== -1) {
          url = utils.handleMalImages(url);
          if (!(url.indexOf('100x140') > -1)) {
            tags[i].setAttribute('data-src', url);
            url = url.replace(/v.jpg$/g, '.jpg');
            tags[i].setAttribute('data-srcset', url.replace(regexDimensions, ''));
            tags[i].classList.add('lazyload');
          }
          tags[i].classList.add('kal');
        } else {
          tags[i].closest('.picSurround')!.classList.add('noKal');
          tags[i].classList.add('kal');
          tags[i].classList.add('noKal');
        }
      }
    }
  }

  bookmarksHDimages() {
    const tags = document.querySelectorAll('img[src*="/96x136/"]');
    for (let i = 0; i < tags.length; i++) {
      const regexDimensions = /\/r\/\d*x\d*/g;
      const url = tags[i].getAttribute('src')!;
      tags[i].setAttribute('src', url.replace(regexDimensions, ''));
    }
  }

  setEpPrediction(progress) {
    if (progress && progress.isAiring() && progress.getCurrentEpisode()) {
      $('.mal-sync-pre-remove, .mal-sync-ep-pre').remove();
      $('#addtolist')
        .prev()
        .before(j.html(`<div class="mal-sync-pre-remove">${progress.getAutoText()}</div>`));
      $('[id="curEps"], [id="totalChaps"]').before(
        j.html(
          `<span class="mal-sync-ep-pre" title="${progress.getAutoText()}">[<span style="border-bottom: 1px dotted ${progress.getColor()};">${progress.getCurrentEpisode()}</span>]</span> `,
        ),
      );
    }
  }

  async malToKiss() {
    $(document).ready(() => {
      con.log('malToKiss');

      const title = $('meta[property="og:title"]')
        .first()
        .attr('content')!
        .trim();

      activeLinks(this.type!, this.id, title).then(links => {
        let html = '';

        links.forEach(page => {
          let tempHtml = '';

          page.links.forEach(stream => {
            tempHtml += `<div class="mal_links"><a target="_blank" href="${stream.url}">${stream.name}</a></div>`;
          });

          html += `<h2 id="${page.name}Links" class="mal_links"><img src="${utils.favicon(page.domain)}"> ${
            page.name
          }<span title="${
            page.name
          }" class="remove-mal-sync" style="float: right; font-weight: 100; line-height: 2; cursor: pointer; color: grey;">x</span></h2>`;
          html += tempHtml;
          html += '<br class="mal_links" />';
        });

        $('h2:contains("Information")').before(j.html(html));
        $('.remove-mal-sync').click(function() {
          const key = $(this).attr('title');
          removeFromOptions(String(key));
          window.location.reload();
        });
      });
    });
  }

  async streamingUI() {
    con.log('Streaming UI');
    const malObj = new ApiSingle(this.url);

    await malObj.update();

    this.pageRelation(malObj);

    const streamUrl = malObj.getStreamingUrl();
    if (streamUrl) {
      $(document).ready(async function() {
        $('.breadcrumb')
          .first()
          .append(
            j.html(`
        <div class="data title progress" id="mal-sync-stream-div" style="padding-left: 5px; display: inline-block; position: relative; top: -12px; height: 0px;">
          <a class="mal-sync-stream" title="${
            streamUrl ? streamUrl.split('/')[2] : ''
          }" target="_blank" style="margin: 0 0; display: inline-block; height: 0;" href="${streamUrl}">
            <img style="display: block;" src="${utils.favicon(streamUrl ? streamUrl.split('/')[2] : '')}">
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
              )}" target="_blank" style="margin: 0 5px 0 0; color: #BABABA; display: inline-block; height: 0;" href="${
                continueUrlObj.url
              }">
              <img style="display: block;" src="${api.storage.assetUrl(
                'double-arrow-16px.png',
              )}" width="16" height="16">
            </a>`,
            ),
          );
        } else if (resumeUrlObj && resumeUrlObj.ep === malObj.getEpisode()) {
          $('#mal-sync-stream-div').append(
            j.html(
              `<a class="resumeStream" title="${api.storage.lang(
                `overview_Resume_Episode_${malObj.getType()}`,
              )}" target="_blank" style="margin: 0 5px 0 0; color: #BABABA; display: inline-block; height: 0;" href="${
                resumeUrlObj.url
              }">
              <img style="display: block;" src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
            </a>`,
            ),
          );
        }
      });
    }

    await malObj.initProgress();

    this.setEpPrediction(malObj.getProgress());

    setInterval(() => {
      this.setEpPrediction(malObj.getProgress());
    }, 1000 * 60);
  }

  async pageRelation(malObj) {
    await malObj.fillRelations();

    malObj.getPageRelations().forEach(page => {
      $('#horiznav_nav > ul').append(
        j.html(`
          <li style="position: relative; width: 24px; display: inline-block;">
            <a href="${page.link}" target="_blank" title="${page.name}" class="link" style="position: absolute; bottom: -3px; width: 16px; text-align: center;">
              <img src="${page.icon}" width="16" width="16">
            </a>
          </li>
        `),
      );
    });
  }

  bookmarks() {
    con.log(`Bookmarks [${this.username}][${this.page}]`);
    const This = this;

    const listProvider = new ApiList(7, this.type!);
    const dataProvider = new LegacyList(7, this.type!);

    let book;
    if (this.page === 'modern') {
      book = {
        bookReady(callback) {
          utils.waitUntilTrue(
            function() {
              return $('#loading-spinner').css('display') === 'none';
            },
            async function() {
              callback(await dataProvider.prepareData($.parseJSON($('.list-table').attr('data-items')!)));

              utils.changeDetect(
                () => {
                  $('.tags span a').each(function(index) {
                    if (typeof utils.getUrlFromTags($(this).text()) !== 'undefined') {
                      const par = $(this)
                        .parent()
                        .parent()
                        .parent()
                        .parent();
                      $(this)
                        .parent()
                        .remove();
                      streamUI(
                        This.type,
                        par
                          .find('.title .link')
                          .first()
                          .attr('href'),
                        $(this).text(),
                        parseInt(
                          par
                            .find('.progress .link')
                            .first()
                            .text(),
                        ),
                        par
                          .find('.title .link')
                          .first()
                          .attr('href')!
                          .split('/')[1],
                      );
                    }
                  });
                },
                () => {
                  return $('.list-table > *').length;
                },
              );
            },
          );
        },
        getElement(malUrl) {
          return $(`.list-item a[href^="${malUrl}"]`)
            .parent()
            .parent('.list-table-data');
        },
        streamingSelector: '.data.title .link',
        cleanTags() {
          $('.tags span a').each(function(index) {
            if (typeof utils.getUrlFromTags($(this).text()) !== 'undefined') {
              $(this)
                .parent()
                .remove();
            }
          });
        },
        predictionPos(element, tag) {
          element
            .find('.data.progress span, .data.chapter span')
            .first()
            .after(j.html(tag));
        },
      };
    } else if (this.page === 'classic') {
      book = {
        bookReady(callback) {
          listProvider
            .getCompleteList()
            .then(list => {
              callback(list);
            })
            .catch(e => {
              con.error(e);
              listProvider.flashmError(e);
            });
        },
        getElement(malUrl) {
          return $(`a[href^="${malUrl}"]`);
        },
        streamingSelector: 'span',
        cleanTags() {
          $('span[id^="tagLinks"] a').each(function(index) {
            if (typeof utils.getUrlFromTags($(this).text()) !== 'undefined') {
              $(this).remove();
            }
          });
        },
        predictionPos(element, tag) {
          element
            .parent()
            .parent()
            .find('span[id^="epText"] a span, span[id^="chap"]')
            .first()
            .after(j.html(tag));
        },
      };
    } else {
      con.error('Bookmark type unknown');
      return;
    }

    book.bookReady(function(data) {
      This.bookmarksHDimages();
      $.each(data, async function(index, el) {
        const malUrl = el.url.replace('https://myanimelist.net', '');
        const { type } = el;

        streamUI(type, malUrl, el.tags, parseInt(el.watchedEp), el.cacheKey);

        await el.fn.initProgress();

        if (el.fn.progress && el.fn.progress.isAiring() && el.fn.progress.getCurrentEpisode()) {
          const element = book.getElement(malUrl);
          book.predictionPos(
            element,
            `<span class="mal-sync-ep-pre" title="${el.fn.progress.getAutoText()}">[<span style="border-bottom: 1px dotted ${el.fn.progress.getColor()};">${el.fn.progress.getCurrentEpisode()}</span>]</span>`,
          );
        }
      });
      book.cleanTags();
    });

    async function streamUI(type, malUrl, tags, curEp, cacheKey) {
      const options = await utils.getEntrySettings(type, cacheKey, tags);
      if (options && options.u) {
        const element = book.getElement(malUrl);
        element.find(book.streamingSelector).after(
          j.html(`
          <a class="mal-sync-stream" title="${options.u.split('/')[2]}" target="_blank" style="margin: 0 0;" href="${
            options.u
          }">
            <img src="${utils.favicon(options.u.split('/')[2])}">
          </a>`),
        );

        const resumeUrlObj = options.r;
        const continueUrlObj = options.c;

        con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
        if (continueUrlObj && continueUrlObj.ep === curEp + 1) {
          element.find('.mal-sync-stream').after(
            j.html(
              `<a class="nextStream" title="Continue watching" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${
                continueUrlObj.url
              }">
              <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16">
            </a>`,
            ),
          );
        } else if (resumeUrlObj && resumeUrlObj.ep === curEp) {
          element.find('.mal-sync-stream').after(
            j.html(
              `<a class="resumeStream" title="Resume watching" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${
                resumeUrlObj.url
              }">
              <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
            </a>`,
            ),
          );
        }
      }
    }
  }

  related() {
    $(document).ready(function() {
      $('.anime_detail_related_anime a').each(function() {
        const el = $(this);
        const url = utils.absoluteLink(el.attr('href'), 'https://myanimelist.net');
        if (typeof url !== 'undefined') {
          utils
            .timeCache(
              `MALTAG/${url}`,
              async function() {
                const malObj = new LegacySingle(url);

                await malObj.update();
                return utils.statusTag(malObj.getStatus(), malObj.getType(), malObj.getMalId());
              },
              2 * 24 * 60 * 60 * 1000,
            )
            .then(function(tag: any) {
              if (tag) {
                el.append(j.html(tag));
              }
            });
        }
      });
    });
  }

  relatedTag() {
    const This = this;
    $(document).ready(function() {
      $('a.button_edit').each(function() {
        const el = $(this);
        const href = $(this).attr('href') || '';
        const type = utils.urlPart(href, 4);
        const id = utils.urlPart(href, 5);
        const state = el.attr('title');
        if (typeof state !== 'undefined' && state) {
          const tag = String(utils.statusTag(state, type, id));
          if (This.page === 'detail') {
            el.parent()
              .find('> a')
              .first()
              .after(j.html(tag));
          } else {
            el.parent()
              .parent()
              .find('> a')
              .after(j.html(tag));
          }
          el.remove();
        }
      });
    });
  }

  friendScore() {
    if (!api.settings.get('friendScore')) return;
    $(document).ready(function() {
      const position = $('h2:contains(Reviews)');
      if (!position.length) return;

      const overview = $('#horiznav_nav li a').first();
      if (!overview.is('#horiznav_nav li a.horiznav_active')) return;

      let url = overview.attr('href');
      if (typeof url === 'undefined' || !url) return;
      url = utils.absoluteLink(url, 'https://myanimelist.net');

      api.request.xhr('GET', `${url}/stats`).then(response => {
        const friendHead = $('a[name=members]', $(response.responseText).children());
        if (!friendHead) return;
        const friendBody = friendHead.nextAll();

        let bodyHtml = '';

        friendBody.each((i, val) => {
          bodyHtml += val.outerHTML;
        });
        if (friendBody.length > 1 && friendBody.find('a:contains("All Members")').length) {
          position
            .before(j.html(friendHead.html()))
            .before(j.html(bodyHtml))
            .before(j.html('<br>'));

          $('a:contains("All Members")').after(
            j.html(
              ' | <span id="mal-sync-removeFriends" title="remove" style="cursor: pointer; color: #1d439b;">X</span>',
            ),
          );
          $('#mal-sync-removeFriends').click(function() {
            api.settings.set('friendScore', false);
            window.location.reload();
          });
        }
      });
    });
  }
}
