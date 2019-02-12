import * as provider from "./../provider/provider.ts";
import Vue from 'vue';
import minimalApp from './minimalApp.vue';

export class minimal{
  private history:(string)[] = [];
  private minimalVue;

  constructor(public minimal){
    this.minimal.find("body").append('<div id="minimalApp"></div>');
    this.minimalVue = new Vue({
      el: this.minimal.find("#minimalApp").get(0),
      render: h => h(minimalApp)
    })
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
    return this.minimalVue.$children[0].fill(url);
  }

  fillBase(url: string){
    return this.minimalVue.$children[0].fillBase(url);
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
      setTimeout(() => {//TODO: Fix
        this.minimalVue.$children[0].selectTab('settings');
      });
      this.minimal.find('#page-config').css('border', '1px solid red');
    }

  }

  loadSettings(){
    var This = this;
    var listener: (() => void)[] = [];


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
              var delta = Math.abs(updateCheckTime - Date.now());

              var text = utils.timeDiffToText(delta);

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

        html += `
          <div class="user pop">
            <div class="image align-middle">
              <i class="material-icons" style="color: white; padding: 4px 4px; cursor: pointer;">
                arrow_right_alt
              </i>
            </div>
          </div>
          <a href="https://discordapp.com/invite/cTH4yaw" class="discord">
            <div style="height: 20px; margin: -15px; margin-top: 15px; background: -webkit-linear-gradient(top, #ffffff 0%,#738bd7 74%);"></div>
            <div style="background: linear-gradient(to bottom, #738bd7 0%,#738bd7 64%,#697ec4 64%,#697ec4 100%); background-color: #697ec4; position: relative; overflow: hidden; margin-left: -15px; margin-right: -15px; margin-bottom: -15px; margin-top: 15px;">
              <img style="margin: auto; display: block;" src="https://discordapp.com/api/guilds/358599430502481920/widget.png?style=banner3">
            </div>
          </a>
        `;

        This.minimal.find('#contributer').html(html).click(()=>{
          This.minimal.find('#contributer').toggleClass("open");
        });

        utils.lazyload(This.minimal);

      }, 100)
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

  updateCheckUi(type = 'anime'){
    this.minimalVue.$children[0].openPopOver();
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

      html += '</table><div class="history"></div>';
      this.minimal.find('#fixed-tab-4 #malSearchPopInner').html(html);

      api.storage.get('notificationHistory').then((history) => {
        var historyHtml = '<h3>Notification History</h3>';
        history.reverse().forEach((entry) => {
          var timeDiff:any = Date.now() - entry.timestamp;

          timeDiff = utils.timeDiffToText(timeDiff);
          timeDiff += 'ago';

          historyHtml += `
          <a href="${entry.url}" class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--2dp mdl-grid" style="text-decoration: none !important; color: black;">
            <img src="${entry.iconUrl}" style="margin: -8px 0px -8px -8px; height: 100px; width: 64px; background-color: grey;">
            <div style="flex-grow: 100; cursor: pointer; margin-top: 0; margin-bottom: 0;" class="mdl-cell">
              <span style="font-size: 20px; font-weight: 400; line-height: 1;">${entry.title}</span>
              <p style="margin-bottom: 0; line-height: 20px; padding-top: 3px;">${entry.message}</p>
              <p style="margin-bottom: 0; line-height: 20px;">${timeDiff}</p>
            </div>
          </a>
          `;
          this.minimal.find('#fixed-tab-4 #malSearchPopInner .history').first().html(historyHtml);
            console.log(entry);
        });
      });

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
