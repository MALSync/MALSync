import {pageInterface, pageState} from "./pageInterface";
import {getSingle} from "./../_provider/singleFactory";
import {initIframeModal} from "./../minimal/iframe";
import {providerTemplates} from "./../provider/templates";
import {getPlayerTime} from "./../utils/player";
import {searchClass} from "./../_provider/Search/vueSearchClass.ts";

declare var browser: any;

var extensionId = "agnaejlkbiiggajjmnpmeheigkflbnoo"; //Chrome
if(typeof browser !== 'undefined' && typeof chrome !== "undefined"){
  extensionId = "{57081fef-67b4-482f-bcb0-69296e63ec4f}"; //Firefox
}

export class syncPage{
  page: pageInterface;
  malObj;
  oldMalObj;
  searchObj;
  singleObj;

  public novel = false;

  constructor(public url, public pages){
    this.page = this.getPage(url);
    if (this.page == null) {
      throw new Error('Page could not be recognized');
    }
  }

  init(){
    var This = this;
    j.$(document).ready(function(){
      initIframeModal(This);
    });
    this.page.init(this);

    if(api.type === 'webextension'){//Discord Presence
      try{
        chrome.runtime.onMessage.addListener((info, sender, sendResponse) => {this.presence(info, sender, sendResponse)});
      }catch(e){
        con.error(e);
      }
    }
  }

  private getPage(url){
    for (var key in this.pages) {
      var page = this.pages[key];
      if(j.$.isArray(page.domain)){
        for (var k in page.domain) {
          var singleDomain = page.domain[k];
          if(checkDomain(singleDomain)){
            page.domain = singleDomain;
            return page;
          }
        }
      }else{
        if(checkDomain(page.domain)){
          return page;
        }
      }

      function checkDomain(domain){
        if(url.indexOf(utils.urlPart(domain, 2).replace(".com.br", ".br").split('.').slice(-2, -1)[0] +'.') > -1){
          return true;
        }
        return false;
      }

    }
    return null;
  }

  public openNextEp(){
    if(typeof this.page.sync.nextEpUrl !== 'undefined'){
      if(this.page.isSyncPage(this.url)){
        var nextEp = this.page.sync.nextEpUrl(this.url);
        if(nextEp){
          location.href = nextEp;
          return;
        }
      }
      utils.flashm(api.storage.lang('nextEpShort_no_nextEp'), {error: true, type: 'EpError'})
      return;
    }
    utils.flashm(api.storage.lang('nextEpShort_no_support'), {error: true, type: 'EpError'})
  }

  public setVideoTime(item, timeCb){
    var syncDuration = api.settings.get('videoDuration');
    var progress = item.current / (item.duration * ( syncDuration / 100 ) ) * 100;
    if(j.$('#malSyncProgress').length){
      if(progress < 100){
        j.$('.ms-progress').css('width', progress+'%');
        j.$('#malSyncProgress').removeClass('ms-loading').removeClass('ms-done');
      }else{
        j.$('#malSyncProgress').addClass('ms-done');
        j.$('.flash.type-update .sync').click();
      }
    }
    this.handleVideoResume(item, timeCb);
    this.autoNextEp(item);
  }

  autoNextEpRun = false;
  public autoNextEp(item) {
    if(api.settings.get("autoNextEp") && !this.autoNextEpRun && item.current == item.duration) {
      this.autoNextEpRun = true;
      this.openNextEp();
    }
  }

  private handleVideoResume(item, timeCb){
    if(typeof this.curState === 'undefined' || typeof this.curState.identifier === 'undefined' || typeof this.curState.episode === 'undefined') return;
    var This = this;
    var localSelector = this.curState.identifier+'/'+this.curState.episode;

    this.curState.lastVideoTime = item;

    //@ts-ignore
    if(typeof this.curState.videoChecked !== 'undefined' && this.curState.videoChecked){
      if(this.curState.videoChecked > 1){
        con.info('Set Resume',item.current);
        localStorage.setItem(localSelector, item.current);
        this.curState.videoChecked = true;
        setTimeout(() => {
          this.curState.videoChecked = 2;
        }, 10000)
      }

    }else{
      var localItem = localStorage.getItem(localSelector);
      con.info('Resume', localItem);
      if(localItem !== null && (parseInt(localItem) - 30) > item.current && parseInt(localItem) > 30){
        if(!j.$('#MALSyncResume').length) j.$('#MALSyncResume').parent().parent().remove();
        var resumeTime = Math.round(parseInt(localItem));
        var resumeTimeString = '';

        if(api.settings.get('autoresume')){
          timeCb(resumeTime);
          This.curState.videoChecked = 2;
          return;
        }else{
          var delta = resumeTime;
          var minutes = Math.floor(delta / 60);
          delta -= minutes * 60;
          var sec = delta+"";
          while (sec.length < 2) sec = "0" + sec;
          resumeTimeString = minutes+':'+sec;

          var resumeMsg = utils.flashm(
            '<button id="MALSyncResume" class="sync" style="margin-bottom: 2px; background-color: transparent; border: none; color: rgb(255,64,129);cursor: pointer;">'+api.storage.lang("syncPage_flashm_resumeMsg",[resumeTimeString])+'</button><br><button class="resumeClose" style="background-color: transparent; border: none; color: white;margin-top: 10px;cursor: pointer;">Close</button>' ,
            {
              permanent: true,
              error: false,
              type: 'resume',
              minimized: false,
              position: "top"
            }
          );

          resumeMsg.find('.sync').on('click', function(){
            timeCb(resumeTime);
            This.curState.videoChecked = 2;
            //@ts-ignore
            j.$(this).parent().parent().remove();
          });

          resumeMsg.find('.resumeClose').on('click', function(){
            This.curState.videoChecked = 2;
            //@ts-ignore
            j.$(this).parent().parent().remove();
          });
        }

      }else{
        setTimeout(() => {
          this.curState.videoChecked = 2;
        }, 15000)
      }

      //@ts-ignore
      this.curState.videoChecked = true;
    }
  }

  curState:any = undefined;
  tempPlayer:any = undefined;

  async handlePage(curUrl = window.location.href){
    var state: pageState;
    this.curState = undefined;
    this.searchObj = undefined;
    var This = this;
    this.url = curUrl;
    this.browsingtime = Date.now();

    this.loadUI();
    if(this.page.isSyncPage(this.url)){
      state = {
        on: 'SYNC',
        title: this.page.sync.getTitle(this.url),
        identifier: this.page.sync.getIdentifier(this.url)
      };

      this.searchObj = new searchClass(state.title, this.novel? 'novel': this.page.type, state.identifier);
      this.searchObj.setPage(this.page);
      this.searchObj.setSyncPage(this);
      this.curState = state;
      await this.searchObj.search();

      state.episode = +parseInt(this.page.sync.getEpisode(this.url)+'')+parseInt(this.getOffset());
      if(!state.episode && state.episode !== 0){
        if (this.page.type == 'anime'){
          state.episode = 1;
        }else{
          state.episode = 0;
        }
      }
      if (typeof(this.page.sync.getVolume) != "undefined"){
        state.volume = this.page.sync.getVolume(this.url)
      }
      if(this.page.type == 'anime'){
        getPlayerTime((item, player) => {
          this.tempPlayer = player;
          this.setVideoTime(item, (time) => {
            if(typeof player === 'undefined'){
              con.error('No player Found');
              return;
            }
            if(typeof time !== 'undefined'){
              player.play();
              player.currentTime = time;
              return;
            }
          });
        });
      }
      con.log('Sync', state);
    }else{
      if (typeof(this.page.overview) == "undefined"){
        con.log('No overview definition');
        return;
      }
      state = {
        on: 'OVERVIEW',
        title: this.page.overview.getTitle(this.url),
        identifier: this.page.overview.getIdentifier(this.url)
      };

      this.searchObj = new searchClass(state.title, this.novel? 'novel': this.page.type, state.identifier);
      this.searchObj.setPage(this.page);
      this.searchObj.setSyncPage(this);
      this.curState = state;
      await this.searchObj.search();

      con.log('Overview', state);
    }

    this.curState = state;

    var malUrl = this.searchObj.getUrl();

    if((malUrl === null || !malUrl) && api.settings.get('localSync')){
      con.log('Local Fallback');
      malUrl = 'local://'+this.page.name+'/'+this.page.type+'/'+state.identifier;
    }

    if(malUrl === null){
      j.$("#MalInfo").text(api.storage.lang('Not_Found'));
      j.$("#MalData").css("display","none");
      con.log('Not on mal');
    }else if(!malUrl){
      j.$("#MalInfo").text(api.storage.lang('NothingFound'));
      j.$("#MalData").css("display","none");
      con.log('Nothing found');
    }else{
      con.log('MyAnimeList', malUrl);
      this.singleObj = getSingle(malUrl);
      try {
        await this.singleObj.update();
      }catch(e) {
        //TODO:
        throw e;
        if(e.code = 415 && api.settings.get('localSync')){
          con.log('Local Fallback');
          malUrl = 'local://'+this.page.name+'/'+this.page.type+'/'+state.identifier;
          this.malObj = getSingle(malUrl);
          await this.malObj.update();
        }
      }

      //Discord Presence
      if(api.type === 'webextension'){
        try{
          chrome.runtime.sendMessage(extensionId, {mode: 'active'}, function(response) {
            con.log('Presence registred', response);
          });
        }catch(e){
          con.error(e);
        }
      }

      //fillUI
      this.fillUI();

      //sync
      if(this.page.isSyncPage(this.url)){

        var rerun = await this.searchObj.openCorrectionCheck();

        if(rerun) {//If malUrl changed
          this.handlePage(curUrl);
          return;
        }

        if(await this.singleObj.checkSync(state.episode, state.volume, this.novel)){
          con.log('Start Sync ('+api.settings.get('delay')+' Seconds)');

          if(api.settings.get('autoTrackingMode'+this.page.type) === 'instant'){
            setTimeout(()=>{
              sync();
            }, api.settings.get('delay') * 1000);
          }else{
            var message = '<button class="sync" style="margin-bottom: 8px; background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px;cursor: pointer;">'+api.storage.lang("syncPage_flashm_sync_"+This.page.type, [providerTemplates(malUrl).shortName, state.episode])+'</button>';
            var options = {hoverInfo: true, error: true, type: 'update', minimized: false}

            if(api.settings.get('autoTrackingMode'+this.page.type) === 'video' && this.page.type == 'anime'){
              message = `
                <div id="malSyncProgress" class="ms-loading" style="background-color: transparent; position: absolute; top: 0; left: 0; right: 0; height: 4px;">
                  <div class="ms-progress" style="background-color: #2980b9; width: 0%; height: 100%; transition: width 1s;"></div>
                </div>
              `+message;
              options = {hoverInfo: true, error: false, type: 'update', minimized: true}
            }

            utils.flashm( message , options).find('.sync').on('click', function(){
              j.$('.flashinfo').remove();
              sync();
            });
            //Debugging
            con.log('overviewUrl', This.page.sync.getOverviewUrl(This.url));
            if(typeof This.page.sync.nextEpUrl !== 'undefined'){
              con.log('nextEp', This.page.sync.nextEpUrl(This.url));
            }
          }

          function sync(){
            This.malObj.setResumeWaching(This.url, state.episode);
            if(typeof This.page.sync.nextEpUrl !== 'undefined'){
              var continueWatching = This.page.sync.nextEpUrl(This.url);
              if(continueWatching && !(continueWatching.indexOf('undefined') != -1)){
                This.malObj.setContinueWaching(continueWatching, state.episode! + 1);
              }
            }
            This.syncHandling(true);
          }

        }else{
          con.log('Nothing to Sync');
        }
      }

    }
  }

  public openCorrectionUi() {
    if(this.searchObj) {
      return this.searchObj.openCorrection().then((rerun) => {
        if(rerun){
          this.handlePage();
        }
      });
    }
  }

  private syncHandling(hoverInfo = false){
    var This = this;
    return this.malObj.sync()
      .then(function(){
        var message = This.malObj.name;
        var split = '<br>';
        var totalVol = This.malObj.totalVol;
        if (totalVol == 0) totalVol = '?';
        var totalEp = This.malObj.totalEp;
        if (totalEp == 0) totalEp = '?';
        if(typeof This.oldMalObj == "undefined" || This.malObj.getStatus() != This.oldMalObj.getStatus()){
          var statusString = "";
          switch (parseInt(This.malObj.getStatus())) {
            case 1:
              statusString = api.storage.lang("UI_Status_watching_"+This.page.type);
              break;
            case 2:
              statusString = api.storage.lang("UI_Status_Completed");
              break;
            case 3:
              statusString = api.storage.lang("UI_Status_OnHold");
              break;
            case 4:
              statusString = api.storage.lang("UI_Status_Dropped");
              break;
            case 6:
              statusString = api.storage.lang("UI_Status_planTo_"+This.page.type);
              break;
          }
          message += split + statusString;
          split = ' | '
        }
        if(This.page.type == 'manga' && ( typeof This.oldMalObj == "undefined" || This.malObj.getVolume() != This.oldMalObj.getVolume() )){
          message += split + api.storage.lang("UI_Volume") + ' ' + This.malObj.getVolume()+"/"+totalVol;
          split = ' | '
        }
        if(typeof This.oldMalObj == "undefined" || This.malObj.getEpisode() != This.oldMalObj.getEpisode()){
          message += split + utils.episode(This.page.type)+ ' ' + This.malObj.getEpisode()+"/"+totalEp;
          split = ' | '
        }
        if(typeof This.oldMalObj == "undefined" || This.malObj.getScore() != This.oldMalObj.getScore() && This.malObj.getScore() != ''){
          message += split + api.storage.lang("UI_Score") + ' ' + This.malObj.getScore();
          split = ' | '
        }
        if(hoverInfo){
            /*if(episodeInfoBox){//TODO
                episodeInfo(change['.add_anime[num_watched_episodes]'], actual['malurl'], message, function(){
                    undoAnime['checkIncrease'] = 0;
                    setanime(thisUrl, undoAnime, null, localListType);
                    j.$('.info-Mal-undo').remove();
                    if(j.$('.flashinfo>div').text() == ''){
                        j.$('.flashinfo').remove();
                    }
                });
            }*/
          if(typeof This.oldMalObj != "undefined"){
            message += `
              <br>
              <button class="undoButton" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px;cursor: pointer;">
                `+api.storage.lang("syncPage_flashm_sync_undefined_undo")+`
              </button>
              <button class="wrongButton" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px;cursor: pointer;">
                `+api.storage.lang("syncPage_flashm_sync_undefined_wrong")+`
              </button>`;
          }
          var flashmItem = utils.flashm(message, {hoverInfo: true, type: 'update'})
          flashmItem.find('.undoButton').on('click', function(this){
            this.closest('.flash').remove();
            This.malObj = This.oldMalObj;
            This.oldMalObj = undefined;
            This.syncHandling();
          });
          flashmItem.find('.wrongButton').on('click', function(this){
            This.openCorrectionUi();
            this.closest('.flash').remove();
            This.malObj = This.oldMalObj;
            This.oldMalObj = undefined;
            This.syncHandling();
          });
        }else{
          utils.flashm(message);
        }

        This.fillUI();

        return;
      }).catch(function(e){
        con.error(e);
        utils.flashm( api.storage.lang("syncPage_flashm_failded") , {error: true});
        return;
      });
  }

  private async handleAnimeUpdate(state){
    var status = utils.status;

    if(
      this.malObj.getEpisode() >= state.episode &&
      // Novel Volume
      !(
        this.novel &&
        typeof(state.volume) != "undefined" &&
        state.volume > this.malObj.getVolume()
      ) &&
      //Rewatching
      !(
        this.malObj.getStatus() == status.completed &&
        state.episode === 1 &&
        this.malObj.totalEp !== 1 &&
        this.malObj.getRewatching() !== 1
      )
    ){
      return false;
    }
    this.malObj.setEpisode(state.episode);
    if( typeof(state.volume) != "undefined" && state.volume > this.malObj.getVolume()) this.malObj.setVolume(state.volume);
    this.malObj.setStreamingUrl(this.page.sync.getOverviewUrl(this.url));
    this.malObj.setStartingDateToNow();

    if(this.malObj.getStatus() !== status.completed && parseInt(state.episode) === this.malObj.totalEp && parseInt(state.episode) != 0 ){
      var currentScore = parseInt(this.malObj.getScore());
      if (await utils.flashConfirm(api.storage.lang("syncPage_flashConfirm_complete")+
        `<div><select id="finish_score" style="margin-top:5px; color:white; background-color:#4e4e4e; border: none;">
        <option value="0" ${(!currentScore) ? 'selected' : ''}>${api.storage.lang("UI_Score_Not_Rated")}</option>
        <option value="10" ${(currentScore == 10) ? 'selected' : ''}>${api.storage.lang("UI_Score_Masterpiece")}</option>
        <option value="9" ${(currentScore == 9) ? 'selected' : ''}>${api.storage.lang("UI_Score_Great")}</option>
        <option value="8" ${(currentScore == 8) ? 'selected' : ''}>${api.storage.lang("UI_Score_VeryGood")}</option>
        <option value="7" ${(currentScore == 7) ? 'selected' : ''}>${api.storage.lang("UI_Score_Good")}</option>
        <option value="6" ${(currentScore == 6) ? 'selected' : ''}>${api.storage.lang("UI_Score_Fine")}</option>
        <option value="5" ${(currentScore == 5) ? 'selected' : ''}>${api.storage.lang("UI_Score_Average")}</option>
        <option value="4" ${(currentScore == 4) ? 'selected' : ''}>${api.storage.lang("UI_Score_Bad")}</option>
        <option value="3" ${(currentScore == 3) ? 'selected' : ''}>${api.storage.lang("UI_Score_VeryBad")}</option>
        <option value="2" ${(currentScore == 2) ? 'selected' : ''}>${api.storage.lang("UI_Score_Horrible")}</option>
        <option value="1" ${(currentScore == 1) ? 'selected' : ''}>${api.storage.lang("UI_Score_Appalling")}</option>
        </select>
        </div>`, 'complete')) {
        this.malObj.setStatus(status.completed);
        this.malObj.setCompletionDateToNow();
        if(j.$("#finish_score").val() !== undefined && j.$("#finish_score").val() > 0) {
          console.log("finish_score: " + j.$('#finish_score :selected').val());
          this.malObj.setScore(j.$("#finish_score :selected").val());
        }
        return true;
      }
    }

    if(this.malObj.getStatus() !== status.watching && this.malObj.getStatus() !== status.completed && state.status !== status.completed){
      if (await utils.flashConfirm(api.storage.lang("syncPage_flashConfirm_start_"+this.page.type), 'start')) {
        this.malObj.setStatus(status.watching);
      }else{
        return false;
      }
    }

    return true;
  }

  fillUI(){
    j.$('.MalLogin').css("display","initial");
    j.$('#AddMalDiv, #LoginMalDiv').remove();

    j.$("#malRating").attr("href", this.singleObj.getDisplayUrl());
    this.singleObj.getRating().then((rating)=>{j.$("#malRating").text(rating);});

    if(this.singleObj.getLastError()){
      j.$('.MalLogin').css("display","none");
      j.$("#MalData").css("display","flex");
      j.$("#MalInfo").text("");
      j.$("#malRating").after("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id='LoginMalDiv'>"+this.singleObj.getLastErrorMessage()+"</span>");
      return;
    }

    if(!this.singleObj.isOnList()){
      j.$('.MalLogin').css("display","none");
      j.$("#malRating").after("<span id='AddMalDiv'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' id='AddMal' onclick='return false;'>"+api.storage.lang(`syncPage_malObj_addAnime`,[this.singleObj.shortName])+"</a></span>")
      var This = this;
      j.$('#AddMal').click(async function() {
        This.malObj.setStatus(6);
        if(!This.page.isSyncPage(This.url)){
          This.malObj.setStreamingUrl(This.url);
        }

        var rerun = await This.searchObj.openCorrectionCheck();

        if(rerun) {//If malUrl changed
          This.handlePage();
          return;
        }

        This.syncHandling()
          .then(() => {
            return This.malObj.update();
          }).then(() => {
            This.fillUI();
          });
      });
    }else{
      j.$("#malTotal, #malTotalCha").text(this.singleObj.getTotalEpisodes());
      if(this.singleObj.getTotalEpisodes() == 0){
         j.$("#malTotal, #malTotalCha").text('?');
      }

      j.$("#malTotalVol").text(this.singleObj.getTotalVolumes());
      if(this.singleObj.getTotalVolumes() == 0){
         j.$("#malTotalVol").text('?');
      }

      j.$("#malEpisodes").val(this.singleObj.getEpisode());
      j.$("#malVolumes").val(this.singleObj.getVolume());

      j.$("#malStatus").val(this.singleObj.getStatus());
      j.$("#malUserRating").val(this.singleObj.getScore());
    }
    j.$("#MalData").css("display","flex");
    j.$("#MalInfo").text("");

    this.calcSelectWidth(j.$( "#malEpisodes, #malVolumes, #malUserRating, #malStatus" ));
    j.$( "#malEpisodes, #malVolumes" ).trigger('input');

    try{
      this.handleList(true);
    }catch(e){
      con.error(e)
    }
  }

    handleList(searchCurrent = false, reTry = 0){
    j.$('.mal-sync-active').removeClass('mal-sync-active');
    if (typeof(this.page.overview) != "undefined" && typeof(this.page.overview.list) != "undefined"){
      var epList = this.getEpList();
      if (typeof(epList) != "undefined" && epList.length > 0){
        this.offsetHandler(epList);
        var elementUrl = this.page.overview.list.elementUrl;
        con.log("Episode List", j.$.map( epList, function( val, i ) {if(typeof(val) != "undefined"){return elementUrl(val)}return '-';}));
        if(typeof(this.page.overview.list.handleListHook) !== "undefined") this.page.overview.list.handleListHook(this.singleObj.getEpisode(), epList);
        var curEp = epList[parseInt(this.singleObj.getEpisode())];
        if(typeof(curEp) == "undefined" && !curEp && this.singleObj.getEpisode() && searchCurrent && reTry < 10 && typeof this.page.overview.list.paginationNext !== 'undefined'){
          con.log('Pagination next');
          var This = this;
          if(this.page.overview.list.paginationNext(false)){
            setTimeout(function(){
              reTry++;
              This.handleList(true, reTry);
            }, 500);
          }
        }

        var nextEp = epList[this.singleObj.getEpisode() + 1];
        if (typeof(nextEp) != "undefined" && nextEp && !this.page.isSyncPage(this.url)){
          var message = '<a href="'+elementUrl(nextEp)+'">'+api.storage.lang("syncPage_malObj_nextEp_"+this.page.type, [this.singleObj.getEpisode()+1])+'</a>';
          utils.flashm( message , {hoverInfo: true, type: 'nextEp'});
        }

      }
    }
  }

  getEpList(){
    var This = this;
    if (typeof(this.page.overview) != "undefined" && typeof(this.page.overview.list) != "undefined"){
      var elementEp = this.page.overview.list.elementEp;
      var elementArray = [] as JQuery<HTMLElement>[];
      var currentEpisode = 0;
      if(this.malObj) {
        currentEpisode = parseInt(this.malObj.getEpisode());
      }

      this.page.overview.list.elementsSelector().each( function(index, el) {
        try{
          var elEp = parseInt(elementEp(j.$(el))+"")+parseInt(This.getOffset());
          elementArray[elEp] = j.$(el);
          if((api.settings.get("highlightAllEp") && elEp <= currentEpisode) || elEp == currentEpisode)  {
            j.$(el).addClass('mal-sync-active')
          }
        }catch(e){
          con.info(e);
        }

      });
      return elementArray;
    }
  }

  offsetHandler(epList){
    if(!this.page.overview!.list!.offsetHandler) return;
    if(this.getOffset()) return;
    if(!this.searchObj || this.searchObj.provider === 'user') return;
    for (var i = 0; i < epList.length; ++i) {
      if (typeof epList[i] !== 'undefined') {
        con.log('Offset', i);
        if(i > 1){
          var calcOffset = 1 - i;
          utils.flashConfirm(api.storage.lang("syncPage_flashConfirm_offsetHandler_1", [calcOffset]), 'offset', () => {
            this.setOffset(calcOffset);
          }, () => {
            this.setOffset(0);
          });
        }
        return;
      }
    }
  }

  cdn(){
    api.storage.addStyle(`
      .bubbles {
        display: none !important;
      }
      div#cf-content:before {
        content: '';
        background-image: url(https://raw.githubusercontent.com/lolamtisch/MALSync/master/assets/icons/icon128.png);
        height: 64px;
        width: 64px;
        display: block;
        background-size: cover;
        animation: rotate 3s linear infinite;
        background-color: #251e2b;
        border-radius: 50%;
      }
      @keyframes rotate{ to{ transform: rotate(360deg); } }
    `);
  }

  getOffset(){
    if(this.searchObj && this.searchObj.getOffset()) {
      return this.searchObj.getOffset();
    }
    return 0;
  }

  async setOffset(value:number){
    if(this.searchObj){
      this.searchObj.setOffset(value);
    }
    if(typeof this.malObj != 'undefined'){
      api.storage.remove('updateCheck/'+this.malObj.type+'/'+this.malObj.getCacheKey())
    }
    return;
  }

  UILoaded:boolean = false;
  private loadUI(){
    var This = this;
    if(this.UILoaded) return;
    this.UILoaded = true;
    var wrapStart = '<span style="display: inline-block;">';
    var wrapEnd = '</span>';

    var ui = '<p id="malp">';
    ui += '<span id="MalInfo">'+api.storage.lang("Loading")+'</span>';

    ui += '<span id="MalData" style="display: none; justify-content: space-between; flex-wrap: wrap;">';

    ui += wrapStart;
    ui += '<span class="info">'+api.storage.lang("search_Score")+' </span>';
    ui += '<a id="malRating" style="min-width: 30px;display: inline-block;" target="_blank" href="">____</a>';
    ui += wrapEnd;

    //ui += '<span id="MalLogin">';
    wrapStart = '<span style="display: inline-block; display: none;" class="MalLogin">';

    ui += wrapStart;
    ui += '<span class="info">'+api.storage.lang("UI_Status")+' </span>';
    ui += '<select id="malStatus">';
    //ui += '<option value="0" ></option>';
    ui += '<option value="1" >'+api.storage.lang("UI_Status_watching_"+this.page.type)+'</option>';
    ui += '<option value="2" >'+api.storage.lang("UI_Status_Completed")+'</option>';
    ui += '<option value="3" >'+api.storage.lang("UI_Status_OnHold")+'</option>';
    ui += '<option value="4" >'+api.storage.lang("UI_Status_Dropped")+'</option>';
    ui += '<option value="6" >'+api.storage.lang("UI_Status_planTo_"+this.page.type)+'</option>';
    ui += '</select>';
    ui += wrapEnd;

    if(this.page.type == 'anime'){
        var middle = '';
        middle += wrapStart;
        middle += '<span class="info">'+api.storage.lang("UI_Episode")+' </span>';
        middle += '<span style=" text-decoration: none; outline: medium none;">';
        middle += '<input id="malEpisodes" value="0" type="text" size="1" maxlength="4">';
        middle += '/<span id="malTotal">0</span>';
        middle += '</span>';
        middle += wrapEnd;

    }else{
        var middle = '';
        middle += wrapStart;
        middle += '<span class="info">'+api.storage.lang("UI_Volume")+' </span>';
        middle += '<span style=" text-decoration: none; outline: medium none;">';
        middle += '<input id="malVolumes" value="0" type="text" size="1" maxlength="4">';
        middle += '/<span id="malTotalVol">0</span>';
        middle += '</span>';
        middle += wrapEnd;


        middle += wrapStart;
        middle += '<span class="info">'+api.storage.lang("UI_Chapter")+' </span>';
        middle += '<span style=" text-decoration: none; outline: medium none;">';
        middle += '<input id="malEpisodes" value="0" type="text" size="1" maxlength="4">';
        middle += '/<span id="malTotalCha">0</span>';
        middle += '</span>';
        middle += wrapEnd;
    }

    ui += middle;


    ui += wrapStart;
    ui += '<span class="info">'+api.storage.lang("UI_Score")+'</span>';
    ui += '<select id="malUserRating"><option value="0">'+api.storage.lang("UI_Score_Not_Rated")+'</option>';
    ui += '<option value="10" >'+api.storage.lang("UI_Score_Masterpiece")+'</option>';
    ui += '<option value="9" >'+api.storage.lang("UI_Score_Great")+'</option>';
    ui += '<option value="8" >'+api.storage.lang("UI_Score_VeryGood")+'</option>';
    ui += '<option value="7" >'+api.storage.lang("UI_Score_Good")+'</option>';
    ui += '<option value="6" >'+api.storage.lang("UI_Score_Fine")+'</option>';
    ui += '<option value="5" >'+api.storage.lang("UI_Score_Average")+'</option>';
    ui += '<option value="4" >'+api.storage.lang("UI_Score_Bad")+'</option>';
    ui += '<option value="3" >'+api.storage.lang("UI_Score_VeryBad")+'</option>';
    ui += '<option value="2" >'+api.storage.lang("UI_Score_Horrible")+'</option>';
    ui += '<option value="1" >'+api.storage.lang("UI_Score_Appalling")+'</option>';
    ui += '</select>';
    ui += wrapEnd;

    //ui += '</span>';
    ui += '</span>';
    ui += '</p>';

    var uihead ='';
    uihead += '<p class="headui" style="float: right; margin: 0; margin-right: 10px">';
    uihead += '';
    uihead += '</p>';

    var uiwrong ='';

    uiwrong += '<button class="open-info-popup mdl-button" style="display:none; margin-left: 6px;">MAL</button>';

    if(this.page.isSyncPage(this.url)){
      if (typeof(this.page.sync.uiSelector) != "undefined"){
        this.page.sync.uiSelector(j.$(ui));
      }
    }else{
      if (typeof(this.page.overview) != "undefined"){
        this.page.overview.uiSelector(j.$(ui));
      }
    }

    var This = this;
    j.$( "#malEpisodes, #malVolumes, #malUserRating, #malStatus" ).change(function() {
        This.buttonclick();
        //@ts-ignore
        var el = j.$(this);
        This.calcSelectWidth(el)
    });

    j.$( "#malEpisodes, #malVolumes" ).on('input', function(){
      //@ts-ignore
      var el = j.$(this);
      var numberlength = el.val()!.toString().length;
      if(numberlength < 1) numberlength = 1;
      var numberWidth = (numberlength * 7.7) + 3;
      el.css('width', numberWidth+'px');
    }).trigger('input');

  }

  private calcSelectWidth(selectors){
    selectors.each(function(index, selector) {
      var text = j.$(selector).find('option:selected').text();
      var aux = j.$('<select style="width: auto;"/>').append(j.$('<option/>').text(text));
      j.$('#malp').append(aux);
      j.$(selector).width(aux.width()+5);
      aux.remove();
    });
  }

  private async buttonclick(){
    this.malObj.setEpisode(j.$("#malEpisodes").val());
    if( j.$("#malVolumes").length ) this.malObj.setVolume(j.$("#malVolumes").val());
    this.malObj.setScore(j.$("#malUserRating").val());
    this.malObj.setStatus(j.$("#malStatus").val());
    if(!this.page.isSyncPage(this.url)){
      this.malObj.setStreamingUrl(this.url);
    }

    var rerun = await this.searchObj.openCorrectionCheck();

    if(rerun) {//If malUrl changed
      this.handlePage();
      return;
    }

    this.syncHandling()
      .then(() => {
        return this.malObj.update();
      }).then(() => {
        this.fillUI();
      });
  }

  private browsingtime = Date.now();

  private presence(info, sender, sendResponse) {
    try{
      if(info.action === 'presence'){
        console.log('Presence requested', info, this.curState);

        if (!api.settings.get("presenceHidePage")) {
          var largeImageKeyTemp = this.page.name.toLowerCase();
          var largeImageTextTemp = this.page.name;
        }else{
          var largeImageKeyTemp = 'malsync';
          var largeImageTextTemp = "MAL-Sync";
        }

        var pres:any = {
          clientId: '606504719212478504',
          presence: {
            details: this.curState.title,
            largeImageKey: largeImageKeyTemp,
            largeImageText: largeImageTextTemp,
            instance: true,
          }
        };

        if(this.curState){
          if(typeof this.curState.episode !== 'undefined'){
            var ep = this.curState.episode;
            var totalEp = this.malObj.totalEp;
            if(!totalEp) totalEp = '?';

            pres.presence.state = utils.episode(this.page.type) + ' '+ep+' of '+totalEp;

            if(typeof this.curState.lastVideoTime !== 'undefined'){
              if(this.curState.lastVideoTime.paused){
                pres.presence.smallImageKey = 'pause';
                pres.presence.smallImageText = 'pause';
              }else{
                var timeleft = this.curState.lastVideoTime.duration - this.curState.lastVideoTime.current;
                pres.presence.endTimestamp = Date.now() + (timeleft * 1000);
                pres.presence.smallImageKey = 'play';
                pres.presence.smallImageText = 'playing';
              }

            }else{
              if(typeof this.curState.startTime === 'undefined'){
                this.curState.startTime = Date.now();
              }
              pres.presence.startTimestamp = this.curState.startTime;
            }
            sendResponse(pres);
            return;
          }else{
            if (!api.settings.get("presenceHidePage")) {
             var browsingTemp = this.page.name;
            }else{
             var browsingTemp = '';
            }
            pres.presence.startTimestamp = this.browsingtime;
            pres.presence.state = api.storage.lang("Discord_rpc_browsing", [browsingTemp]);
            sendResponse(pres);
            return;
          }
        }
      }
    }catch(e){
      con.error(e);
    }
    sendResponse({});

  }

}

