export class minimal{
  constructor(public minimal){
    var material = `
      <div id="material" style="height: 100%;">
        <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-tabs">
          <header class="mdl-layout__header" style="min-height: 0;">
            <button class="mdl-layout__drawer-button" id="backbutton" style="display: none;"><i class="material-icons">arrow_back</i></button>
            <div class="mdl-layout__header-row">
              <button class="mdl-button mdl-js-button mdl-button--icon mdl-layout__drawer-button" id="book" style="">
                <i class="material-icons" class="material-icons md-48">book</i>
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
          <main class="mdl-layout__content" data-simplebar>
            <section class="mdl-layout__tab-panel is-active" id="fixed-tab-1">
              <div id="loadOverview" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: absolute;"></div>
              <div class="page-content">
                <div class="mdl-grid">
                  <div class="mdl-cell mdl-cell--1-col mdl-cell--8-col-tablet mdl-cell--6-col-phone mdl-shadow--4dp stats-block malClear" style="min-width: 120px;">

                  </div>
                  <div class="mdl-grid mdl-cell mdl-shadow--4dp coverinfo malClear" style="display:block; flex-grow: 100; min-width: 70%;">
                    <div class="mdl-card__media mdl-cell mdl-cell--2-col" style="background-color: transparent; float:left; padding-right: 16px;">
                      <img class="malImage malClear" style="width: 100%; height: auto;"></img>
                    </div>
                    <div class="mdl-cell mdl-cell--12-col">
                      <a class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect malClear malLink" href="" style="float: right;" target="_blank"><i class="material-icons">open_in_new</i></a>
                      <h1 class="malTitle mdl-card__title-text malClear" style="padding-left: 0px; overflow:visible;"></h1>
                      <div class="malAltTitle mdl-card__supporting-text malClear" style="padding: 10px 0 0 0px; overflow:visible;"></div>
                    </div>
                    <div class="malDescription malClear mdl-cell mdl-cell--10-col" style="overflow: hidden;"></div>
                  </div>
                  <div class="mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp data-block mdl-grid mdl-grid--no-spacing malClear">

                  </div>
                  <div class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp related-block alternative-list mdl-grid malClear">

                  </div>
                  <div style="display: none;" class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp mdl-grid alternative-list stream-block malClear">
                    <ul class="mdl-list stream-block-inner">

                    </ul>
                  </div>
                  <div class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col mdl-shadow--4dp characters-block mdl-grid malClear" style="display: none;"></div>
                  <div class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col mdl-shadow--4dp info-block mdl-grid malClear">

                  </div>
                </div>
              </div>
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
              <div id="loadEpisode" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: absolute;"></div>
              <div class="page-content malClear" id="malEpisodes"></div>
            </section>
            <section class="mdl-layout__tab-panel" id="fixed-tab-5">
              <div class="page-content malClear" id="malConfig"></div>
            </section></main>
          </div>
          <div id="malSearchPop" style="display: none; z-index: 10; position: fixed;">
            <div data-simplebar style="height: calc(100% - 60px); z-index: 10; width: 100%; position: fixed !important; top: 60px; background-color: #f9f9f9; width: 100%;position: fixed; top: 60px; background-color: #f9f9f9;">
              <div id="malSearchPopInner"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    this.minimal.find("body").append(material);

    this.uiListener();
    this.injectCss();
    this.loadSettings();
    this.updateDom();

  }

  uiListener(){
    var modal = document.getElementById('info-popup');
    var This = this;

    this.minimal.find("#close-info-popup").click( function(){
        if(This.isPopup()){
          window.close();
        }else{
          modal!.style.display = "none";
          $('.floatbutton').fadeIn();
        }
    });

    this.minimal.find("#material-fullscreen").click( function(){
        if($('.modal-content-kal.fullscreen').length){
            $(".modal-content-kal").removeClass('fullscreen');
            // @ts-ignore
            $(this).find('i').text('fullscreen');
        }else{
            $(".modal-content-kal").addClass('fullscreen');
            // @ts-ignore
            $(this).find('i').text('fullscreen_exit');
        }
    });
  }

  isPopup(){
    if($('#Mal-Sync-Popup').length) return true;
    return false;
  }

  updateDom(){
    this.minimal.find("head").click();
  }

  injectCss(){
    this.minimal.find("head").append($('<style>')
        .html(require('./minimalStyle.less').toString()));
  }

  loadSettings(){//:array<function>
    var This = this;
    var listener: (() => void)[] = [];
    var settingsUI = `
    <ul class="demo-list-control mdl-list" style="margin: 0px; padding: 0px;">
      <div class="mdl-grid">
        <div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp">
          <div class="mdl-card__title mdl-card--border">
            <h2 class="mdl-card__title-text">General</h2>
          </div>
          ${materialCheckbox('test','testText')}
          ${materialCheckbox('test2','testText2')}
        </div>
      </div>
    </ul>
    `;
    this.minimal.find('#malConfig').html(settingsUI);

    listener.forEach(function(fn) {
      fn();
    });

    //helper

    function materialCheckbox(option, text, header = false){
      var check = '';
      var sty = '';
      var value = api.settings.get(option);
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
}
