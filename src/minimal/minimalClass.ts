import {animeType} from "./types/anime";
import * as provider from "./../provider/provider.ts";

export class minimal{
  private history:(string)[] = [];

  constructor(public minimal){
    var material = `
      <div id="material" style="height: 100%;">
        <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-tabs">
          <header class="mdl-layout__header" style="min-height: 0;">
            <button class="mdl-layout__drawer-button" id="backbutton" style="display: none;"><i class="material-icons">arrow_back</i></button>
            <div class="mdl-layout__header-row">
              <button class="mdl-button mdl-js-button mdl-button--icon mdl-layout__drawer-button" id="book" style="">
                <i class="material-icons md-48 bookIcon">book</i>
                <i class="material-icons md-48 settingsIcon" style="display:none;">settings</i>
              </button>
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--expandable" id="SearchButton" style="margin-left: -57px; margin-top: 3px; padding-left: 40px;">
                <label class="mdl-button mdl-js-button mdl-button--icon" for="headMalSearch">
                  <i class="material-icons">search</i>
                </label>
                <div class="mdl-textfield__expandable-holder">
                  <input class="mdl-textfield__input" type="text" id="headMalSearch">
                  <label class="mdl-textfield__label" for="headMalSearch"></label>
                </div>
              </div>
              <button class="mdl-button mdl-js-button mdl-button--icon mdl-layout__drawer-button" id="material-fullscreen" style="left: initial; right: 40px;">
                <i class="material-icons" class="material-icons md-48">fullscreen</i>
              </button>
              <button class="mdl-button mdl-js-button mdl-button--icon mdl-layout__drawer-button" id="close-info-popup" style="left: initial; right: 0;">
                <i class="material-icons close">close</i>
              </button>
            </div>
            <!-- Tabs -->
            <div class="mdl-layout__tab-bar mdl-js-ripple-effect">

              <a href="#fixed-tab-1" class="mdl-layout__tab is-active">Overview</a>
              <a href="#fixed-tab-2" class="mdl-layout__tab reviewsTab">Reviews</a>
              <a href="#fixed-tab-3" class="mdl-layout__tab recommendationTab">Recommendations</a>
              <a href="#fixed-tab-5" class="mdl-layout__tab settingsTab">Settings</a>
            </div>
          </header>
          <main class="mdl-layout__content" data-simplebar style="height:  100%;">
            <section class="mdl-layout__tab-panel is-active" id="fixed-tab-1">
              <div id="loadOverview" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: absolute;"></div>
              <div class="page-content"></div>
            </section>
            <section class="mdl-layout__tab-panel" id="fixed-tab-2">
              <div id="loadReviews" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: absolute;"></div>
              <div class="page-content malClear" id="malReviews"></div>
            </section>
            <section class="mdl-layout__tab-panel" id="fixed-tab-3">
              <div id="loadRecommendations" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: absolute;"></div>
              <div class="page-content malClear" id="malRecommendations"></div>
            </section>
            <section class="mdl-layout__tab-panel" id="fixed-tab-4">
              <div id="loadMalSearchPop" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: absolute;"></div>
              <div class="page-content malClear" id="malSearchPopInner"></div>
            </section>
            <section class="mdl-layout__tab-panel" id="fixed-tab-5">
              <div class="page-content malClear" id="malConfig"></div>
            </section></main>
          </div>
        </div>
      </div>
    `;
    this.minimal.find("body").append(material);
    this.minimal.find("head").append('<base href="https://myanimelist.net/">');

    this.uiListener();
    this.injectCss();
    this.loadSettings();
    this.updateDom();

  }

  uiListener(){
    var modal = document.getElementById('info-popup');
    var This = this;

    this.minimal.on('click', '.mdl-layout__content a', function(e){
      // @ts-ignore
      if(j.$(this).attr('target') === '_blank' || j.$(this).hasClass('nojs')){
        return;
      }
      e.preventDefault();
      // @ts-ignore
      var url = utils.absoluteLink(j.$(this).attr('href'), 'https://myanimelist.net');
      if(!This.fill(url)){
        var win = window.open(url, '_blank');
        if (win) {
            win.focus();
        } else {
            alert('Please allow popups for this website');
        }
      }
    });

    this.minimal.find("#backbutton").click( function(){
      con.log('History', This.history);

      if(This.history.length > 1){
        This.history.pop(); //Remove current page
        var url = This.history.pop();

        if(typeof url != 'undefined'){
          This.fill(url);
          if(This.history.length > 1){
            return;
          }
        }

      }

      This.backbuttonHide();
    });

    this.minimal.find("#close-info-popup").click( function(){
        if(This.isPopup()){
          window.close();
        }else{
          modal!.style.display = "none";
          j.$('.floatbutton').fadeIn();
        }
    });

    this.minimal.find("#material-fullscreen").click( function(){
        if(j.$('.modal-content-kal.fullscreen').length){
            j.$(".modal-content-kal").removeClass('fullscreen');
            // @ts-ignore
            j.$(this).find('i').text('fullscreen');
        }else{
            j.$(".modal-content-kal").addClass('fullscreen');
            // @ts-ignore
            j.$(this).find('i').text('fullscreen_exit');
        }
    });

    var timer;
    this.minimal.find("#headMalSearch").on("input", function(){
      var listType = 'anime';
      if(typeof This.pageSync != 'undefined'){
        listType = This.pageSync.page.type;
      }

      This.minimal.find('#fixed-tab-4 #malSearchPopInner').html('');
      This.minimal.find('#loadMalSearchPop').show();
      clearTimeout(timer);
      timer = setTimeout(function(){
        if(This.minimal.find("#headMalSearch").val() == ''){
          This.minimal.find('#material').removeClass('pop-over');
        }else{
          This.minimal.find('#material').addClass('pop-over');
          This.searchMal(This.minimal.find("#headMalSearch").val(), listType, '#malSearchPopInner', function(){
            This.minimal.find('#loadMalSearchPop').hide();
          });
        }
      }, 300);
    });
    this.minimal.on('click', '.searchItem', function(e){
      This.minimal.find("#headMalSearch").val('').trigger("input").parent().parent().removeClass('is-dirty');
    });

    this.minimal.find("#book").click(function() {
      if(This.minimal.find('#material.pop-over #malList').length){
        This.minimal.find("#book").toggleClass('open');
        This.minimal.find('#material').removeClass('pop-over');
      }else{
        This.minimal.find("#book").toggleClass('open');
        This.minimal.find('#material').addClass('pop-over');
        This.bookmarks();
      }
    });

  }

  isPopup(){
    if(j.$('#Mal-Sync-Popup').length) return true;
    return false;
  }

  updateDom(){
    this.minimal.find("head").click();
  }

  injectCss(){
    this.minimal.find("head").append(j.$('<style>')
        .html(require('./minimalStyle.less').toString()));
  }

  fill(url: string|null){
    if(url == null){
      this.minimal.find('#material').addClass('settings-only');
      if(this.isPopup()){
        this.minimal.find('#book').first().click();
      }
      return false;
    }
    if(/^https:\/\/myanimelist.net\/(anime|manga)\//i.test(url)){
      this.loadOverview(new animeType(url));
      return true;
    }
    this.minimal.find('#material').addClass('settings-only');
    if(this.isPopup()){
      this.minimal.find('#book').first().click();
    }
    return false;
  }

  fillBase(url: string){
    con.log('Fill Base', url, this.history);
    if(!this.history.length){
      this.fill(url);
    }else if(this.history[0] !== url){
      while(this.history.length > 0) {
          this.history.pop();
      }
      this.fill(url);
    }
  }

  private pageSync;

  setPageSync(page){
    this.pageSync = page;
    var This = this;

    var malUrl = '';
    var title = 'Not Found';
    if(typeof page.malObj != 'undefined'){
      malUrl = page.malObj.url;
      title = page.malObj.name;
    }

    var html =
    ` <div class="mdl-card__title mdl-card--border">
        <h2 class="mdl-card__title-text">
          ${title}
        </h2>
        <a href="https://github.com/lolamtisch/MALSync/wiki/Troubleshooting" style="margin-left: auto;">Help</a>
      </div>
      <div class="mdl-list__item">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
          <input class="mdl-textfield__input" style="padding-right: 18px;" type="number" step="1" id="malOffset" value="${page.getOffset()}">
          <label class="mdl-textfield__label" for="malOffset">Episode Offset</label>
          ${utils.getTooltip('Input the episode offset, if an anime has 12 episodes, but uses the numbers 0-11 rather than 1-12, you simply type " +1 " in the episode offset.','float: right; margin-top: -17px;','left')}
        </div>
      </div>
      <div class="mdl-list__item" style="padding-bottom: 0;padding-top: 0;">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
          <input class="mdl-textfield__input" style="padding-right: 18px;" type="text" id="malUrlInput" value="${malUrl}">
          <label class="mdl-textfield__label" for="malUrlInput">MyAnimeList Url</label>
          ${utils.getTooltip('Only change this URL if it points to the wrong anime page on MAL.','float: right; margin-top: -17px;','left')}
        </div>
      </div>

      <div class="mdl-list__item" style="padding-bottom: 0;padding-top: 0;">
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
          <label class="mdl-textfield__label" for="malSearch">
            Correction Search
          </label>
          <input class="mdl-textfield__input" style="padding-right: 18px;" type="text" id="malSearch">
          ${utils.getTooltip('This field is for finding an anime, when you need to correct the "MyAnimeList Url" shown above.<br>To make a search, simply begin typing the name of an anime, and a list with results will automatically appear as you type.','float: right; margin-top: -17px;','left')}
        </div>
      </div>
      <div class="mdl-list__item" style="min-height: 0; padding-bottom: 0; padding-top: 0;">
        <div class="malResults" id="malSearchResults"></div>
      </div>

      <div class="mdl-list__item">
        <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" id="malSubmit">Update</button>
        <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" id="malReset" style="margin-left: 5px;">Reset</button>
        <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect" id="malNotOnMal" style="margin-left: 5px; float: right; margin-left: auto;" title="If the Anime/Manga can't be found on MAL">No MAL</button>
      </div>`;
    this.minimal.find('#page-config').html(html).show();

    this.minimal.find("#malOffset").on("input", function(){
      var Offset = This.minimal.find("#malOffset").val();
      if(Offset !== null){
        if(Offset !== ''){
          page.setOffset(Offset);
          utils.flashm("New Offset ("+Offset+") set.");
        }else{
          page.setOffset("0");
          utils.flashm("Offset reset");
        }
      }
    });

    this.minimal.find("#malNotOnMal").click( function(){
      This.minimal.find('#malUrlInput').val('');
      This.minimal.find("#malSubmit").click();
    });

    this.minimal.find("#malReset").click( function(){
      page.deleteCache();
      utils.flashm( "MyAnimeList url reset" , false);
      page.handlePage();
      This.minimal.find("#close-info-popup").trigger( "click" );
    });

    this.minimal.find("#malSubmit").click( function(){
      var murl = This.minimal.find("#malUrlInput").val();
      var toDatabase:boolean|'correction' = false;
      if (typeof page.page.database != 'undefined' && confirm('Submit database correction request?')) {
          toDatabase = 'correction';
      }
      page.setCache(murl, toDatabase);
      utils.flashm( "new url '"+murl+"' set." , false);
      page.handlePage();
      This.fillBase(murl);
    });

    var listType = 'anime';
    if(typeof This.pageSync != 'undefined'){
      listType = This.pageSync.page.type;
    }
    var timer;
    this.minimal.find("#malSearch").on("input", function(){
      clearTimeout(timer);
      timer = setTimeout(function(){
        This.searchMal(This.minimal.find("#malSearch").val(), listType, '.malResults', function(){

          This.minimal.find("#malSearchResults select").first().after(`
            <a class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--2dp mdl-grid searchItem" href="" style="cursor: pointer;">
            <div style="margin: -8px 0px -8px -8px; height: 100px; width: 64px; background-color: grey;"/>
            <div style="flex-grow: 100; cursor: pointer; margin-top: 0; margin-bottom: 0;" class="mdl-cell">
              <span style="font-size: 20px; font-weight: 400; line-height: 1;">
              No entry on MyAnimeList</span>
              <p style="margin-bottom: 0; line-height: 20px; padding-top: 3px;">
              If the Anime/Manga can't be found on MAL</p>
            </div>
            </a>
          `);

         This.minimal.find("#malSearchResults .searchItem").unbind('click').click(function(e) {
          e.preventDefault();
          // @ts-ignore
          This.minimal.find('#malUrlInput').val(j.$(this).attr('href'));
          This.minimal.find('#malSearch').val('');
          This.minimal.find('#malSearchResults').html('');
          This.minimal.find('#malSubmit').click();
          });
        });
      }, 300);
    });

    this.updateDom();

    if(typeof page.malObj != 'undefined' && page.malObj.wrong){
      con.log('config click');
      this.minimal.find('.mdl-layout__tab.settingsTab span').trigger( "click" );
      this.minimal.find('#page-config').css('border', '1px solid red');
    }

  }

  loadOverview(overviewObj){
    var This = this;
    this.minimal.find("#book.open").toggleClass('open');
    this.minimal.find('#material').removeClass('settings-only').removeClass('pop-over');
    this.minimal.find('.mdl-layout__tab:eq(0) span').trigger( "click" );
    this.history.push(overviewObj.url);
    if(this.history.length > 1) this.backbuttonShow();
    this.minimal.find('#loadOverview, #loadReviews, #loadRecommendations').show();
    this.minimal.find('#fixed-tab-1 .page-content, #fixed-tab-2 .page-content, #fixed-tab-3 .page-content').html('');
    overviewObj.init()
      .then(() => {

        this.minimal.find('.reviewsTab').off("click").one('click', function(){
          overviewObj.reviews(This.minimal)
            .then((html) => {
              This.minimal.find('#fixed-tab-2 .page-content').html(html);
              This.minimal.find('#loadReviews').hide();
              overviewObj.lazyLoadReviews(This.minimal);
            })
        });

        this.minimal.find('.recommendationTab').off("click").one('click', function(){
          overviewObj.recommendations(This.minimal)
            .then((html) => {
              This.minimal.find('#fixed-tab-3 .page-content').html(html);
              This.minimal.find('#loadRecommendations').hide();
              overviewObj.lazyLoadRecommendations(This.minimal);
            })
        });

        return overviewObj.overview(this.minimal);
      }).then((html) => {
        this.minimal.find('#fixed-tab-1 .page-content').html(html);
        this.minimal.find('#loadOverview').hide();
        overviewObj.lazyLoadOverview(this.minimal);
      });
  }

  backbuttonShow(){
    this.minimal.find("#backbutton").show();
    this.minimal.find('#SearchButton').css('margin-left', '-17px');
    this.minimal.find('#book').css('left', '40px');
  }

  backbuttonHide(){
    this.minimal.find("#backbutton").hide();
    this.minimal.find('#SearchButton').css('margin-left', '-57px');
    this.minimal.find('#book').css('left', '0px');
  }

  loadSettings(){
    var This = this;
    var listener: (() => void)[] = [];
    var settingsUI = `
    <ul class="demo-list-control mdl-list" style="margin: 0px; padding: 0px;">
      <div class="mdl-grid">
        <div id="page-config" class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp" style="display: none;"></div>

        <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
          <div class="mdl-card__title mdl-card--border">
            <h2 class="mdl-card__title-text">General</h2>
          </div>
          ${materialCheckbox('autoTracking','Autotracking'+utils.getTooltip('Autotracking is the function where this script automatically updates the anime`s you watch with your MAL account.','','bottom'))}
          <li class="mdl-list__item">
            <span class="mdl-list__item-primary-content">
              Mode
            </span>
            <span class="mdl-list__item-secondary-action">
              <select name="myinfo_score" id="syncMode" class="inputtext mdl-textfield__input" style="outline: none;">
                <option value="MAL">MyAnimeList</option>
                <option value="ANILIST">AniList [ALPHA]</option>
              </select>
            </span>
          </li>
          <li class="mdl-list__item anilistShow" style="display: none;">
            <span class="mdl-list__item-primary-content">
              AniList
            </span>
            <span class="mdl-list__item-secondary-action">
              <a target="_blank" href="https://anilist.co/api/v2/oauth/authorize?client_id=1487&response_type=token">Authenticate</a>
            </span>
          </li>
          <li class="mdl-list__item">
              <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
                  <input class="mdl-textfield__input" type="number" step="1" id="malDelay" value="${api.settings.get('delay')}">
              <label class="mdl-textfield__label" for="malDelay">Autotracking delay (Seconds)</label>
              </div>
          </li>
        </div>

        <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
          <div class="mdl-card__title mdl-card--border">
            <h2 class="mdl-card__title-text">Streaming Site Links</h2>
            ${utils.getTooltip('If disabled, the streaming site will no longer appear in an animes sidebar on MAL.')}
          </div>
          ${materialCheckbox('Kissanime','KissAnime')}
          ${materialCheckbox('Masterani','MasterAnime')}
          ${materialCheckbox('9anime','9anime')}
          ${materialCheckbox('Crunchyroll','Crunchyroll')}
          ${materialCheckbox('Gogoanime','Gogoanime')}
          ${materialCheckbox('Twistmoe','twist.moe')}
          ${materialCheckbox('Anime4you','Anime4You (Ger)')}
          ${materialCheckbox('Kissmanga','KissManga')}
          ${materialCheckbox('Mangadex','MangaDex')}
          ${materialCheckbox('Mangarock','Mangarock')}
        </div>

        <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
          <div class="mdl-card__title mdl-card--border">
            <h2 class="mdl-card__title-text">MyAnimeList</h2>
          </div>
          <li class="mdl-list__item">
            <span class="mdl-list__item-primary-content">
              Thumbnails
              ${utils.getTooltip('The option is for resizing the thumbnails on MAL.<br>Like thumbnails for characters, people, recommendations, etc.')}
            </span>
            <span class="mdl-list__item-secondary-action">
              <select name="myinfo_score" id="malThumbnail" class="inputtext mdl-textfield__input" style="outline: none;">
                <option value="144">Large</option>
                <option value="100">Medium</option>
                <option value="60">Small</option>
                <option value="0">MAL Default</option>
              </select>
            </span>
          </li>
          ${materialCheckbox('friendScore','Friend scores on detail page')}
          ${materialCheckbox('epPredictions','Estimate episode number')}
          ${materialCheckbox('malTags','Use Tags/Notes'+utils.getTooltip('If enabled: On your MAL Anime List and the bookmark list in miniMAL, an icon-link will be added to the last used streaming site you were using to watch an anime.<br>Simply click the icon to continue watching the anime.','','bottom'))}
          ${materialCheckbox('malContinue','Continue watching links')}
          ${materialCheckbox('malResume','Resume watching links')}
        </div>

        <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
          <div class="mdl-card__title mdl-card--border">
            <h2 class="mdl-card__title-text">miniMAL</h2>
            <!--<span style="margin-left: auto; color: #7f7f7f;">Shortcut: Ctrl + m</span>-->
          </div>
          <li class="mdl-list__item">
            <span class="mdl-list__item-primary-content">
              Display to the
            </span>
            <span class="mdl-list__item-secondary-action">
              <select name="myinfo_score" id="posLeft" class="inputtext mdl-textfield__input" style="outline: none;">
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </span>
          </li>
          <!--${materialCheckbox('miniMALonMal','Display on MyAnimeList')/*TODO*/}
          ${materialCheckbox('displayFloatButton','Floating menu button')}
          ${materialCheckbox('outWay','Move video out of the way')}-->
          <li class="mdl-list__item" style="display: inline-block; width: 49%;">
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
              <input class="mdl-textfield__input" type="text" step="1" id="miniMalHeight" value="${api.settings.get('miniMalHeight')}">
              <label class="mdl-textfield__label" for="miniMalHeight">Height (px / %)
              </label>
            </div>
          </li>
          <li class="mdl-list__item" style="display: inline-block; width: 50%;">
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 100%;">
              <input class="mdl-textfield__input" type="text" step="1" id="miniMalWidth" value="${api.settings.get('miniMalWidth')}">
              <label class="mdl-textfield__label" for="miniMalWidth">Width (px / %)</label>
            </div>
          </li>
        </div>

        <div id="updateCheck" class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp" style="display: none;">
          <div class="mdl-card__title mdl-card--border">
            <h2 class="mdl-card__title-text">Update Check</h2>
            ${utils.getTooltip('Checks for new episodes in the background.')}
            <div id="updateCheckAgo" style="margin-left: auto;"></div>
          </div>

          <li class="mdl-list__item">
            <span class="mdl-list__item-primary-content">
              Interval
            </span>
            <span class="mdl-list__item-secondary-action">
              <select name="updateCheckTime" id="updateCheckTime" class="inputtext mdl-textfield__input" style="outline: none;">
                <option value="0">Off</option>
                <option value="60">1h</option>
                <option value="240">4h</option>
                <option value="720">12h</option>
                <option value="1440">24h</option>
                <option value="2880">48h</option>
              </select>
            </span>
          </li>
          <span class="updateCheckEnable" style="display: none;">${materialCheckbox('updateCheckNotifications','Notifications')}<span>
          <li class="mdl-list__item updateCheckEnable" style="display: none;"><button type="button" id="updateCheckUi" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored">Debugging</button></li>
        </div>

        <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
          <div class="mdl-card__title mdl-card--border">
            <h2 class="mdl-card__title-text">ETC</h2>
          </div>
          <span class="option-extension" style="display: none;">${materialCheckbox('userscriptMode','Userscript mode'+utils.getTooltip('Disables the content script. This makes it possible to have the extension and userscript enabled at the same time.','','bottom'))}</span>
          <span class="option-extension-popup" style="display: none;">${materialCheckbox('strictCookies','Strict Cookies',false,false)}</span>
          <li class="mdl-list__item"><button type="button" id="clearCache" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored">Clear Cache</button></li>
        </div>
        <div id="contributer" class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp"></div>
        <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">

          <li class="mdl-list__item">

            <div style="line-height: 30px;">

              <a href="https://malsync.lolamtisch.de/changelog#${api.storage.version()}">
                <img src="https://img.shields.io/badge/Changelog-${api.storage.version()}-green.svg?style=flat-square&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAtxQTFRFAAAARj1Hw158LyQzRDRBVF54Ew0ZXqvnIx4labLsQEFTdsD7ZpPC////VE1SNCg3Nik7PS1CSzBKWjRXczBXjjBUsTZd0WuILSUyMiU2MiI2Nyc9dypNoClRbC5INTQ+YXKMMCQ7PyQ/WitFKx4vFxchT16CRStIPSY6TSQ6jjhScb33TViCpCROni9VYKzqTlN+qDBZXK3sYi5JXbHyQzNGXLLzTTZOW6/wQC5EX67sNSw7Y67qWa3vLCUzMCo1uc3fXq3rWa/yLCgxSEdKZa7nV6rrWrDyKCEsMzA1aLDpYbLyYbj6SUJgPj5VLy87e8D6csP+c8r/d9L/fNT+esnydLbgcKfOa5vDdJ/MQi5GSjFLTTFOYi9PWS1NUS9OTTFPRzFLSDJMTTBMXjBPaS5NZzBVgTdjczVfbjVhXjVaTjRTQzJMSzRNTzVOTzNLai1ShzJcjjNdiDNeejRhbDVhWzZbSzRRQzFKQjJKUDNMiyxPYy9UlzBfyDBlpjJgcjJbajNfXDVaTDNRPzBHPTBHVDJNrDBZxSpaV1aBajBZkDNipzNjnTNjdDJdYzJcXDRZTzRQPzFHRzJHZTJNcS9MZ2WUcS9VcDNdezRgcjJeezNgZTNaTjNRRDFLQzJJQjNHQjJGWDJLUjJKYoK4cS5NWTFTWzRaWDJVbjRbWDNVSzNQRjJMUTRLSTVHSzRJjjZbfDdZYqXlhEZwVS5MSzRUVTNUczVbTjJRSTNOUDRMSTNLQTJISTNGczZUXjVRWrH0W3+1Ri9OSDJSSzNSTDNTRzJRRzNRSTNNQzJLPzFKPjJGPjFCOSw/W67vTWOORi5NSjJRSzNVTDRURTJRQTBNQTFKQzJKPjFINSw9XKrpSVyIQCxLRS9QRjJSQjJPRzRQUTROQjBFLyc1W6rrS22ePTRVQSxLSjNVSzZYTzZWUTJPOSw+Z778YqPWWnGcV1F/UkZxT0Nm////ch6M6QAAAFp0Uk5TAAAAAAAAAAAAAAAAAAABKH2/3+bIjTgFCm7a/f7nhRILifn9nRJx+v6JBC3b6UV//aPB3OTz5/bL3Y6oNuLuTAGA/ZsIEp79shwRhervmxwFQqDd+frjqksImWc25wAAAAFiS0dEDfa0YfUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEbSURBVBjTARAB7/4AAAABDg8QERITFBUWFwIAAAAAAxgZGhtaW1xdHB0eHwQAAAUgISJeX2BhYmNkZSMkJQYAACYnZmdoaWprbG1ubygpKgArLHBxcnN0dXZ3eHl6ey0uAC8wfH1+f4CBgoOEhYaHiDEAMomKi4yNjo+QkZKSk5SVMwA0lpeYmZqbnJ2en6ChoqM1ADakpaanqKmqq6ytrq+wsTcAOLKztLW2t7i5uru8vb6/OQA6wMHCw8TFxsfIycrLzM07ADw9zs/Q0dLT1NXW19jZPj8AQEFC2tvc3d7U3+Dh4uNDRAAHRUZH5OXm5+jp6uvsSEkIAAAJSktM7e7v8PHyTU5PCgAAAAALUFFSU1RVVldYWQwNAEGXdELuOiRkAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE4LTA1LTE2VDEzOjM2OjI0KzAwOjAwK9TuQgAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0wNS0xNlQxMzozNjoyNCswMDowMFqJVv4AAABGdEVYdHNvZnR3YXJlAEltYWdlTWFnaWNrIDYuNy44LTkgMjAxNC0wNS0xMiBRMTYgaHR0cDovL3d3dy5pbWFnZW1hZ2ljay5vcmfchu0AAAAAGHRFWHRUaHVtYjo6RG9jdW1lbnQ6OlBhZ2VzADGn/7svAAAAGHRFWHRUaHVtYjo6SW1hZ2U6OmhlaWdodAAxOTIPAHKFAAAAF3RFWHRUaHVtYjo6SW1hZ2U6OldpZHRoADE5MtOsIQgAAAAZdEVYdFRodW1iOjpNaW1ldHlwZQBpbWFnZS9wbmc/slZOAAAAF3RFWHRUaHVtYjo6TVRpbWUAMTUyNjQ3Nzc4NGTqj8oAAAAPdEVYdFRodW1iOjpTaXplADBCQpSiPuwAAABWdEVYdFRodW1iOjpVUkkAZmlsZTovLy9tbnRsb2cvZmF2aWNvbnMvMjAxOC0wNS0xNi82ODRlZmQxYzBmMTdmMzAxMjIzMWFmNzQ4YzhmYjJjYy5pY28ucG5nP6GaiQAAAABJRU5ErkJggg=="/>
              </a><br/>

              <a href="https://discordapp.com/invite/cTH4yaw">
                <img src="https://img.shields.io/discord/358599430502481920.svg?style=flat-square&logo=discord&label=Chat%20%2F%20Support&colorB=7289DA"/>
              </a><br/>

              <a href="https://github.com/lolamtisch/MALSync">
                <img src="https://img.shields.io/github/last-commit/lolamtisch/malsync.svg?style=flat-square&logo=github&logoColor=white&label=Github"/>
              </a><br/>

              <a href="https://github.com/lolamtisch/MALSync/issues">
                <img src="https://img.shields.io/github/issues/lolamtisch/MALSync.svg?style=flat-square&logo=github&logoColor=white"/>
              </a><br/>

              <a href="https://chrome.google.com/webstore/detail/mal-sync/kekjfbackdeiabghhcdklcdoekaanoel?hl=en">
                <img src="https://img.shields.io/badge/Chrome-Download-brightgreen.svg?style=flat-square&label=Chrome&logo=google%20chrome&logoColor=white"/>
              </a><br/>

              <a href="https://addons.mozilla.org/en-US/firefox/addon/mal-sync">
                <img src="https://img.shields.io/badge/Firefox-Download-brightgreen.svg?style=flat-square&label=Firefox&logo=mozilla%20firefox&logoColor=white"/>
              </a><br/>

              <a href="https://greasyfork.org/de/scripts/372847-mal-sync">
                <img src="https://img.shields.io/badge/Userscript-Download-brightgreen.svg?style=flat-square&label=Userscript&logo=javascript&logoColor=white"/>
              </a>

            </div>
          </li>
        </div>



      </div>
    </ul>
    `;
    this.minimal.find('#malConfig').html(settingsUI);

    // Listener
    this.minimal.find("#posLeft").val(api.settings.get('posLeft'));
    this.minimal.find("#posLeft").change(function(){
      // @ts-ignore
      api.settings.set('posLeft', j.$(this).val());
      // @ts-ignore
      j.$('#modal-content').css('right', 'auto').css('left', 'auto').css(j.$(this).val(), '0');
    });

    this.minimal.find("#miniMalWidth").on("input", function(){
        var miniMalWidth = This.minimal.find("#miniMalWidth").val();
        if(miniMalWidth !== null){
            if(miniMalWidth === ''){
                miniMalWidth = '30%';
                utils.flashm( "Width reset" );
            }
            api.settings.set( 'miniMalWidth', miniMalWidth );
        }
        j.$("#modal-content").css('width', miniMalWidth);
    });

    this.minimal.find("#syncMode").change(function(){
      // @ts-ignore
      var value = j.$(this).val();
      api.settings.set('syncMode', value);
      if(value == 'ANILIST'){
        This.minimal.find('.anilistShow').show();
      }else{
        This.minimal.find('.anilistShow').hide();
      }

    });
    this.minimal.find("#syncMode").val(api.settings.get('syncMode')).change();

    this.minimal.find("#miniMalHeight").on("input", function(){
        var miniMalHeight = This.minimal.find("#miniMalHeight").val();
        if(miniMalHeight !== null){
            if(miniMalHeight === ''){
                miniMalHeight = '90%';
                utils.flashm( "Height reset" );
            }
            api.settings.set( 'miniMalHeight', miniMalHeight );
        }
        j.$("#modal-content").css('height', miniMalHeight);
    });

    this.minimal.find("#malThumbnail").val(api.settings.get('malThumbnail'));
    this.minimal.find("#malThumbnail").change(function(){
      api.settings.set( 'malThumbnail', This.minimal.find("#malThumbnail").val() );
    });

    this.minimal.find('#clearCache').click(async function(){
      var cacheArray = await api.storage.list();
      var deleted = 0;

      j.$.each( cacheArray, function( index, cache){
        if(!utils.syncRegex.test(index)){
          api.storage.remove(index);
          deleted++;
        }
      });

      utils.flashm("Cache Cleared ["+deleted+"]");
    });

    this.minimal.find("#malDelay").on("input", function(){
        var tempDelay = This.minimal.find("#malDelay").val();
        if(tempDelay !== null){
            if(tempDelay !== ''){
                api.settings.set( 'delay', tempDelay );
                utils.flashm( "New delay ("+tempDelay+") set." );
            }else{
                api.settings.set( 'delay', 0 );
                utils.flashm( "Delay reset" );
            }
        }
    });

    listener.forEach(function(fn) {
      fn();
    });

    if(api.type == 'webextension'){
      this.minimal.find('.option-extension').show();
    }

    if(api.type == 'webextension' && this.isPopup()){
      this.minimal.find('.option-extension-popup').show();
    }

    if(api.type == 'webextension' && this.isPopup()){
      chrome.alarms.get("updateCheck", (a:any) => {
        con.log(a);
        interval = 0;
        if(typeof a !== 'undefined'){
          var interval = a!.periodInMinutes;
          this.minimal.find('.updateCheckEnable').show();
        }
        this.minimal.find('#updateCheckTime').val(interval);

        if(interval){

          setUpdateCheckLast();
          setInterval(function(){
            setUpdateCheckLast();
          }, 60 * 1000);

          function setUpdateCheckLast(){
            api.storage.get("updateCheckLast").then((updateCheckTime) => {
              if(isNaN(updateCheckTime)) return;
              var delta = Math.abs(updateCheckTime - Date.now()) / 1000;
              var text = '';

              var diffDays = Math.floor(delta / 86400);
              delta -= diffDays * 86400;
              if(diffDays){
                text += diffDays+'d ';
              }

              var diffHours = Math.floor(delta / 3600) % 24;
              delta -= diffHours * 3600;
              if(diffHours){
                text += diffHours+'h ';
              }

              var diffMinutes = Math.floor(delta / 60) % 60;
              delta -= diffMinutes * 60;
              if(!diffDays){
                text += diffMinutes+'min ';
              }

              if(text != ''){
                text += 'ago';
                $('#updateCheckAgo').text(text);
              }

            });
          }

        }
      });

      this.minimal.find("#updateCheckTime").change(() => {
        var updateCheckTime = this.minimal.find('#updateCheckTime').val();
        api.storage.set( 'updateCheckTime', updateCheckTime );
        if(updateCheckTime != 0 && updateCheckTime != '0' ){
          this.minimal.find('.updateCheckEnable').show();
          chrome.alarms.create("updateCheck", {
            periodInMinutes: parseInt(updateCheckTime)
          });
          if(!utils.canHideTabs()){
            chrome.permissions.request({
              permissions: ["webRequest", "webRequestBlocking"],
              origins: chrome.runtime.getManifest().optional_permissions!.filter((permission) => {return (permission != 'webRequest' && permission != 'webRequestBlocking' && permission != 'cookies')})
            }, function(granted) {
              con.log('optional_permissions', granted);
            });
          };
          chrome.alarms.create("updateCheckNow", {
            when: Date.now() + 1000
          });
        }else{
          this.minimal.find('.updateCheckEnable').hide();
          chrome.alarms.clear("updateCheck");
        }
      });
      this.minimal.find('#updateCheck').show();
    }
    this.minimal.find('#updateCheckUi').click(() => {
      this.updateCheckUi();
    })

    try{
      if(api.type == 'webextension'){
        chrome.permissions.contains({
          permissions: ['cookies']
        }, (result) => {
          if(result){
            if (!this.minimal.find('#strictCookies')[0].checked) {
              this.minimal.find('#strictCookies').trigger('click');
            }
          }
          this.minimal.find('#strictCookies').change(() => {
            if (this.minimal.find('#strictCookies')[0].checked) {
              con.log('strictCookies checked');
              chrome.permissions.request({
                permissions: ["webRequest", "webRequestBlocking", "cookies"],
                origins: [],
              }, function(granted) {
                con.log('optional_permissions', granted);
              });
            }else{
              con.log('strictCookies not checked');
              chrome.permissions.remove({
                permissions: ["cookies"],
                origins: [],
              }, function(remove) {
                con.log('optional_permissions_remove', remove);
              });
            }
          })
        });
      }
    }catch(e){
      con.error(e);
    }

    api.storage.get('tempVersion')
      .then((version) => {
        var versionMsg = '';

        if(version != api.storage.version()){
          versionMsg = 'Updated to version '+api.storage.version()+' [<a class="close" target="_blank" href="https://malsync.lolamtisch.de/changelog#'+api.storage.version()+'">CHANGELOG</a>]';
        }
        con.log(version);
        if(typeof version == 'undefined'){
          versionMsg = `
            <div style="
              text-align: left;
              margin-left: auto;
              margin-right: auto;
              display: inline-block;
              padding: 10px 15px;
              background-color: #3d4e9a;
              margin-top: -5px;
            ">
              <span style="text-decoration: underline; font-size: 15px;">Thanks for installing MAL-Sync</span><br>
              <br>
              Having Questions?<br>
              <a target="_blank" href="https://discordapp.com/invite/cTH4yaw">
                <img alt="Discord" src="https://img.shields.io/discord/358599430502481920.svg?style=flat-square&amp;logo=discord&amp;label=Discord&amp;colorB=7289DA">
              </a><br>
              <a target="_blank" href="https://github.com/lolamtisch/MALSync/issues">
                <img alt="Github Issues" src="https://img.shields.io/github/issues/lolamtisch/MALSync.svg?style=flat-square&amp;logo=github&amp;logoColor=white">
              </a><br>
              <br>
              Open Source Code:<br>
              <a target="_blank" href="https://github.com/lolamtisch/MALSync">
                <img alt="Github" src="https://img.shields.io/github/last-commit/lolamtisch/malsync.svg?style=flat-square&amp;logo=github&amp;logoColor=white&amp;label=Github">
              </a>
            </div>
          `;
        }
        if(versionMsg != ''){
          this.flashm(versionMsg, function(){
            api.storage.set('tempVersion', api.storage.version());
          });
        }
      });

      api.request.xhr('GET', 'https://kissanimelist.firebaseio.com/Data2/Notification/Contributer.json').then((response) => {
        try{
          var contr = JSON.parse(response.responseText.replace(/(^"|"$)/gi,'').replace(/\\"/g, '"'));
        }catch(e){
          con.error('Contributer Could not be retieved', e);
          return;
        }
        con.log('Contributer', contr);

        var html = '';

        for (var group in contr){
          html += `<div class="group">${group}</div>`;
          for(var user in contr[group]){
            var userVal = contr[group][user];

            if(typeof userVal.subText != 'undefined' && userVal.subText){
              userVal.subText = `<div class="subtext">${userVal.subText}</div>`;
            }else{
              userVal.subText = '';
            }
            if(typeof userVal.gif != 'undefined' && userVal.gif){
              userVal.gif = `<img data-src="${userVal.gif}" class="lazy init gif">`;
            }else{
              userVal.gif = '';
            }
            html += `
              <div class="user">
                <div class="image align-middle">
                  ${userVal.gif}
                  <img data-src="${userVal.image}" class="lazy init">
                </div>
                <div class="text align-middle">
                  <div class="name" style="color: ${userVal.color}" title="${userVal.name}">
                    ${userVal.name}
                  </div>
                  ${userVal.subText}
                </div>
              </div>
            `;
          }
        }

        This.minimal.find('#contributer').html(html).click(()=>{
          This.minimal.find('#contributer').toggleClass("open");
        });

        utils.lazyload(This.minimal);

      }, 100)


    //helper

    function materialCheckbox(option, text, header = false, value:any = null){
      var check = '';
      var sty = '';
      if(value === null){
        value = api.settings.get(option);
      }
      if(value) check = 'checked';
      if(header) sty = 'font-size: 24px; font-weight: 300; line-height: normal;';
      var item = `
      <li class="mdl-list__item">
        <span class="mdl-list__item-primary-content" style="${sty}">
          ${text}
        </span>
        <span class="mdl-list__item-secondary-action">
          <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="${option}">
            <input type="checkbox" id="${option}" class="mdl-switch__input" ${check} />
          </label>
        </span>
      </li>`;

      listener.push(function(){
        This.minimal.find('#'+option).change(function(){
            if(This.minimal.find('#'+option).is(":checked")){
                api.settings.set(option, true);
            }else{
                api.settings.set(option, false);
            }
        });
      });
      return item;
    }
  }

  searchMal(keyword, type = 'all', selector, callback){
    var This = this;

    this.minimal.find(selector).html('');
    api.request.xhr('GET', 'https://myanimelist.net/search/prefix.json?type='+type+'&keyword='+keyword+'&v=1').then((response) => {
      var searchResults = j.$.parseJSON(response.responseText);
      this.minimal.find(selector).append('<div class="mdl-grid">\
          <select name="myinfo_score" id="searchListType" class="inputtext mdl-textfield__input mdl-cell mdl-cell--12-col" style="outline: none; background-color: white; border: none;">\
            <option value="anime">Anime</option>\
            <option value="manga">Manga</option>\
          </select>\
        </div>');
      this.minimal.find('#searchListType').val(type);
      this.minimal.find('#searchListType').change(function(event) {
        This.searchMal(keyword, This.minimal.find('#searchListType').val(), selector, callback);
      });

      j.$.each(searchResults, (i, value) => {
        j.$.each(value, (i, value) => {
          j.$.each(value, (i, value) => {
            if(typeof value !== 'object') return;
            j.$.each(value, (i, value) => {
              if(typeof value['name'] != 'undefined'){
                This.minimal.find(selector+' > div').append('<a class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--2dp mdl-grid searchItem" href="'+value['url']+'" style="cursor: pointer;">\
                  <img src="'+value['image_url']+'" style="margin: -8px 0px -8px -8px; height: 100px; width: 64px; background-color: grey;"></img>\
                  <div style="flex-grow: 100; cursor: pointer; margin-top: 0; margin-bottom: 0;" class="mdl-cell">\
                    <span style="font-size: 20px; font-weight: 400; line-height: 1;">'+value['name']+'</span>\
                    <p style="margin-bottom: 0; line-height: 20px; padding-top: 3px;">Type: '+value['payload']['media_type']+'</p>\
                    <p style="margin-bottom: 0; line-height: 20px;">Score: '+value['payload']['score']+'</p>\
                    <p style="margin-bottom: 0; line-height: 20px;">Year: '+value['payload']['start_year']+'</p>\
                  </div>\
                  </a>');
              }
            });
          });
        });
      });
      callback();
    });
  }

  bookmarks(state = 1, localListType = 'anime'){
    this.minimal.find('#fixed-tab-4 #malSearchPopInner').html('<div id="malList"></div>');
    this.minimal.find('#loadMalSearchPop').show();

    var element = this.minimal.find('#malSearchPopInner')
    var This = this;

    var localPlanTo = 'Plan to Watch';
    var localWatching = 'Watching'
    if(localListType != 'anime'){
        localPlanTo = 'Plan to Read';
        localWatching = 'Reading'
    }
    var firstEl = 1;

    provider.userList(state, localListType,
    {
      singleCallback: function(el, index, total){
      if(firstEl){
        firstEl = 0;
        var bookmarkHtml = '<div class="mdl-grid" id="malList" style="justify-content: space-around;">';
        bookmarkHtml +='<select name="myinfo_score" id="userListType" class="inputtext mdl-textfield__input mdl-cell mdl-cell--12-col" style="outline: none; background-color: white; border: none;">\
                          <option value="anime">Anime</option>\
                          <option value="manga">Manga</option>\
                        </select>';
        bookmarkHtml +='<select name="myinfo_score" id="userListState" class="inputtext mdl-textfield__input mdl-cell mdl-cell--12-col" style="outline: none; background-color: white; border: none;">\
                          <option value="7">All</option>\
                          <option value="1" selected>'+localWatching+'</option>\
                          <option value="2">Completed</option>\
                          <option value="3">On-Hold</option>\
                          <option value="4">Dropped</option>\
                          <option value="6">'+localPlanTo+'</option>\
                        </select>';
        //flexbox placeholder
        for(var i=0; i < 10; i++){
            bookmarkHtml +='<div class="listPlaceholder mdl-cell mdl-cell--2-col mdl-cell--4-col-tablet mdl-cell--6-col-phone mdl-shadow--2dp mdl-grid "  style="cursor: pointer; height: 250px; padding: 0; width: 210px; height: 0px; margin-top:0; margin-bottom:0; visibility: hidden;"></div>';
        }
        bookmarkHtml += '</div>'
        element.html( bookmarkHtml );

        This.minimal.find('#malSearchPopInner #userListType').val(localListType);
        This.minimal.find('#malSearchPopInner #userListType').change(function(event) {
          This.bookmarks(state, This.minimal.find('#malSearchPopInner #userListType').val() );
        });

        This.minimal.find('#malSearchPopInner #userListState').val(state);
        This.minimal.find('#malSearchPopInner #userListState').change(function(event) {
          This.bookmarks(This.minimal.find('#malSearchPopInner #userListState').val(), localListType);
        });
      }

      if(!el){
        element.find('#malList .listPlaceholder').first().before( '<span class="mdl-chip" style="margin: auto; margin-top: 16px; display: table;"><span class="mdl-chip__text">No Entries</span></span>');
        element.find('#malList .listPlaceholder').remove();
        return;
      }

      var bookmarkElement = '';
      var streamUrl = utils.getUrlFromTags(el.tags);
      var imageHi = el.image;
      var regexDimensions = /\/r\/\d*x\d*/g;
      if ( regexDimensions.test(imageHi) ) {
        imageHi = imageHi.replace(/v.jpg$/g, '.jpg').replace(regexDimensions, '');
      }
      var progressProcent = ( el.watchedEp / el.totalEp ) * 100;
      bookmarkElement +='<div class="mdl-cell mdl-cell--2-col mdl-cell--4-col-tablet mdl-cell--6-col-phone mdl-shadow--2dp mdl-grid bookEntry e'+el.id+'" malhref="'+el.url+'" maltitle="'+el.title+'" malimage="'+el.image+'" style="position: relative; cursor: pointer; height: 250px; padding: 0; width: 210px; height: 293px;">';
        bookmarkElement +='<div class="data title lazyBack init" data-src="'+imageHi+'" style="background-image: url(); background-color: grey; background-size: cover; background-position: center center; background-repeat: no-repeat; width: 100%; position: relative; padding-top: 5px;">';
          bookmarkElement +='<span class="mdl-shadow--2dp" style="position: absolute; bottom: 0; display: block; background-color: rgba(255, 255, 255, 0.9); padding-top: 5px; display: inline-flex; align-items: center; justify-content: space-between; left: 0; right: 0; padding-right: 8px; padding-left: 8px; padding-bottom: 8px;">'+el.title;
            bookmarkElement +='<div id="p1" class="mdl-progress" series_episodes="'+el.totalEp+'" style="position: absolute; top: -4px; left: 0;"><div class="progressbar bar bar1" ep="'+el.watchedEp+'" style="width: '+progressProcent+'%;"></div><div class="bufferbar bar bar2" style="width: calc(100% + 1px);"></div><div class="auxbar bar bar3" style="width: 0%;"></div></div>';
            bookmarkElement +='<div class="data progress mdl-chip mdl-chip--contact mdl-color--indigo-100" style="float: right; line-height: 20px; height: 20px; padding-right: 4px; margin-left: 5px;">';
              bookmarkElement +='<div class="link mdl-chip__contact mdl-color--primary mdl-color-text--white" style="line-height: 20px; height: 20px; margin-right: 0;">'+el.watchedEp+'</div>';
            bookmarkElement +='</div>';
          bookmarkElement +='</span>';
          bookmarkElement +='<div class="tags" style="display: none;">'+el.tags+'</div>';
        bookmarkElement +='</div>';
      bookmarkElement +='</div>';

      if(el.airingState == 1 && state == 1){
        element.find('#malList #userListState').after( bookmarkElement );
      }else{
        element.find('#malList .listPlaceholder').first().before( bookmarkElement );
      }

      var domE = element.find('#malList .e'+el.id).first();

      domE.click(function(event) {
        // @ts-ignore
        if(!This.fill(j.$(this).attr('malhref'))){
          con.error('Something is wrong');
        }
      });

      utils.epPredictionUI(el.id, localListType, function(prediction){
        var pre = prediction.prediction;
        var color = 'orange';
        if(prediction.color != ''){
          color = prediction.color;
        }
        if(prediction.tagEpisode){
          var progressBar = domE.find('.mdl-progress');
          var totalEps = progressBar.attr('series_episodes');

          var predictionProgress = ( prediction.tagEpisode / totalEps ) * 100;

          if(parseInt(totalEps) == 0){
            predictionProgress = 80;
            progressBar.find('.bar2').css('background', 'transparent');
            var watchedEp = progressBar.find('.bar1').attr('ep');
            var watchedProgress = ( watchedEp / prediction.tagEpisode ) * predictionProgress;
            progressBar.find('.bar1').css('width', watchedProgress+'%');
          }

          progressBar.prepend('<div class="predictionbar bar kal-ep-pre" ep="'+(prediction.tagEpisode)+'" style="width: '+predictionProgress+'%; background-color: '+color+'; z-index: 1; left: 0;"></div>');
          domE.attr('title', prediction.text);
        }
        if(prediction.text != "" && prediction.text){
          domE.find('.data.title').prepend(`
            <div class="mdl-shadow--2dp" style="
              position: absolute;
              top: 0;
              right: 0;
              background-color: rgba(255, 255, 255, 0.9);
              padding: 0px 5px;
              margin: 5px 0;
              text-align: center;
            ">
              ${preTexter(pre)}
            </div>
          `);
        }

        function preTexter(pre){
          //Round hours
          if(pre.diffDays > 1 && pre.diffHours > 12){
            pre.diffDays++;
          }

          var text = '';
          if(pre.diffDays > 1){
            return text+pre.diffDays+' Days';
          }
          if(pre.diffDays == 1){
            text += pre.diffDays+' Day ';
          }

          if(pre.diffHours > 1){
            return text+pre.diffHours+' Hours';
          }
          if(pre.diffHours == 1){
            text += pre.diffHours+' Hour ';
          }

          return text+pre.diffMinutes+' mins';
        }

      });

      streamUI();
      async function streamUI(){
        if(typeof streamUrl !== 'undefined'){
          con.log(streamUrl);
          domE.find('.data.progress').append(`
            <a class="mal-sync-stream" title="${streamUrl.split('/')[2]}" target="_blank" style="margin: 0 5px;" href="${streamUrl}">
              <img src="${utils.favicon(streamUrl.split('/')[2])}">
            </a>`);

          var id = utils.urlPart(el.url, 4);
          var type = utils.urlPart(el.url, 3);
          var resumeUrlObj = await utils.getResumeWaching(type, id);
          var continueUrlObj = await utils.getContinueWaching(type, id);
          var curEp = parseInt(el.watchedEp.toString());

          con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
          if(typeof continueUrlObj !== 'undefined' && continueUrlObj.ep === (curEp+1)){
            domE.find('.data.progress').append(
              `<a class="nextStream" title="Continue watching" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${continueUrlObj.url}">
                <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16">
              </a>`
              );
          }else if(typeof resumeUrlObj !== 'undefined' && resumeUrlObj.ep === curEp){
            domE.find('.data.progress').append(
              `<a class="resumeStream" title="Resume watching" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" href="${resumeUrlObj.url}">
                <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16">
              </a>`
              );
          }
        }
      }

    }
    ,finishCallback: function(){
      This.minimal.find('#loadMalSearchPop').hide();
      utils.lazyload(This.minimal);
    },
    continueCall: function(continueCall){
      utils.lazyload(This.minimal);
      if(state == 1){
        continueCall();
        return;
      }
      var scrollable = This.minimal.find('.simplebar-scroll-content');
      var scrollDone = 0;
      This.minimal.find('#loadMalSearchPop').hide();
      scrollable.scroll(function() {
        if(scrollDone) return;
        // @ts-ignore
        if(scrollable.scrollTop() + scrollable.height() > scrollable.find('.simplebar-content').height() - 100) {
          scrollDone = 1;
          con.log('[Bookmarks]','Loading next part');
          This.minimal.find('#loadMalSearchPop').show();
          continueCall();
        }
      });
    }
    });
  }

  updateCheckUi(type = 'anime'){
    this.minimal.find('#material').addClass('pop-over');
    if(!this.minimal.find('.refresh-updateCheck').length){
      this.minimal.find('#fixed-tab-4 #malSearchPopInner').html('');
    }

    var refreshTo = setTimeout(() => {
      if(this.minimal.find('.refresh-updateCheck').length && this.minimal.find('#fixed-tab-4').css('display') != 'none'){
        this.updateCheckUi(type);
      }
    }, 5000)

    provider.userList(1, type, {fullListCallback: async (list) => {
      var html = `
      <button class="mdl-button mdl-js-button mdl-button--primary refresh-updateCheck">
        Refresh
      </button>
      <button class="mdl-button mdl-js-button mdl-button--accent startCheck-updateCheck">
        Start Check
      </button>
      <button class="mdl-button mdl-js-button mdl-button--accent notification-updateCheck">
        Notification Check
      </button>
      <select style="float: right;" class="typeSelect-updateCheck">
        <option value="anime">Anime</option>
        <option value="manga"${(type == 'manga') ? 'selected="selected"' : ''}>Manga</option>
      </select>
      <table class="mdl-data-table mdl-js-data-table mdl-data-table__cell--non-numeric mdl-shadow--2dp">
        <tr>
          <th class="mdl-data-table__cell--non-numeric"></th>
          <th>Episode</th>
          <th>Message</th>
        </tr>`;

      for (var i = 0; i < list.length; i++) {
        var el = list[i];
        var episode = '';
        var error = '';
        var trColor = '';
        con.log('el', el);
        var elCache = await api.storage.get('updateCheck/'+type+'/'+el.id);
        con.log('elCache', elCache);
        if(typeof elCache != 'undefined'){
          episode = elCache['newestEp']+'/'+el.totalEp;
          trColor = 'orange';
          if(elCache['finished']){
            error = 'finished';
            trColor = 'green';
          }
          if(typeof elCache['error'] != 'undefined'){
            error = elCache['error'];
            trColor = 'red';
          }
        }
        html += `
        <tr style="background-color: ${trColor};">
          <th class="mdl-data-table__cell--non-numeric">
            <button class="mdl-button mdl-js-button mdl-button--icon delete-updateCheck" data-delete="${'updateCheck/'+type+'/'+el.id}"><i class="material-icons">delete</i></button>
            <a href="${el.url}" style="color: black;">
              ${el.title}
            </a>
          </th>
          <th>${episode}</th>
          <th>${error}</th>
        </tr>
        `;
      }

      html += '</table>';
      this.minimal.find('#fixed-tab-4 #malSearchPopInner').html(html);

      this.minimal.find('.refresh-updateCheck').click(() => {
        clearTimeout(refreshTo);
        this.updateCheckUi(type);
      });

      this.minimal.find('.notification-updateCheck').click(() => {
        utils.notifications(
          'https://malsync.lolamtisch.de/',
          'MyAnimeList-Sync',
          'by lolamtisch',
          'https://cdn.myanimelist.net/images/anime/5/65187.jpg'
        );
      });

      this.minimal.find('.startCheck-updateCheck').click(() => {
        chrome.alarms.create("updateCheckNow", {
          when: Date.now() + 1000
        });
        utils.flashm("Check started");
      });

      this.minimal.find('.delete-updateCheck').click(function(){
        //@ts-ignore
        var thisEl = $(this);
        var delData = thisEl.data('delete');
        con.log('delete', delData);
        api.storage.remove(delData);
        thisEl.parent().parent().css('background-color', 'black');
      });

      this.minimal.find('.typeSelect-updateCheck').change(() => {
        clearTimeout(refreshTo);
        this.updateCheckUi(this.minimal.find('.typeSelect-updateCheck').val());
      })
    }});

  }

  flashm(text, closefn = function(){}){
    var mess =`
      <div style="
        background-color: #3f51b5;
        text-align: center;
        padding: 5px 24px;
        color: white;
        border-top: 1px solid #fefefe;
      ">
        ${text}
        <i class="material-icons close" style="
          float: right;
          font-size: 24px;
          margin-top: -2px;
          margin-right: -24px;
          margin-bottom: -5px;
        ">close</i>
      </div>
    `;

    var flashmDiv = j.$(mess).appendTo(this.minimal.find('.mdl-layout'));
    flashmDiv.find('.close').click(function(){
      flashmDiv.slideUp(100, function(){
        flashmDiv.remove();
        closefn();
      });
    });
    return flashmDiv;
  }

}
