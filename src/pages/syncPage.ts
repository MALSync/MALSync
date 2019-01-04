import {pages} from "./pages";
import {pageInterface, pageState} from "./pageInterface";
import {mal} from "./../utils/mal";
import {initIframeModal} from "./../minimal/iframe";

export class syncPage{
  page: pageInterface;
  malObj;
  oldMalObj;

  constructor(public url){
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
  }

  private getPage(url){
    for (var key in pages) {
      var page = pages[key];
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
        if( url.indexOf(utils.urlPart(domain, 2).split('.').slice(-2, -1)[0] +'.') > -1 ){
          return true;
        }
        return false;
      }

    }
    return null;
  }

  async handlePage(){
    var state: pageState;
    var This = this;
    this.url = window.location.href;

    this.loadUI();
    if(this.page.isSyncPage(this.url)){
      state = {
        title: this.page.sync.getTitle(this.url),
        identifier: this.page.sync.getIdentifier(this.url)
      };
      this.offset = await api.storage.get(this.page.name+'/'+state.identifier+'/Offset');
      state.episode = +parseInt(this.page.sync.getEpisode(this.url)+'')+parseInt(this.getOffset());
      if (typeof(this.page.sync.getVolume) != "undefined"){
        state.volume = this.page.sync.getVolume(this.url)
      }
      con.log('Sync', state);
    }else{
      if (typeof(this.page.overview) == "undefined"){
        con.log('No overview definition');
        return;
      }
      state = {
        title: this.page.overview.getTitle(this.url),
        identifier: this.page.overview.getIdentifier(this.url)
      };
      this.offset = await api.storage.get(this.page.name+'/'+state.identifier+'/Offset');
      con.log('Overview', state);
    }

    var malUrl = await this.getMalUrl(state.identifier, state.title, this.page);

    if(malUrl === null){
      j.$("#MalInfo").text("Not Found!");
      con.log('Not on mal');
    }else if(!malUrl){
      j.$("#MalInfo").text("Nothing Found!");
      con.log('Nothing found');
    }else{
      con.log('MyAnimeList', malUrl);
      this.malObj = new mal(malUrl);
      await this.malObj.init();
      this.oldMalObj = this.malObj.clone();


      //fillUI
      this.fillUI();

      if(!this.malObj.login){
        utils.flashm( "Please log in on <a target='_blank' href='https://myanimelist.net/login.php'>MyAnimeList!<a>", {error: true});
        return;
      }

      //sync
      if(this.page.isSyncPage(this.url)){
        if(await this.handleAnimeUpdate(state)){
          con.log('Start Sync ('+api.settings.get('delay')+' Seconds)');

          if(api.settings.get('autoTracking')){
            setTimeout(()=>{
              sync();
            }, api.settings.get('delay') * 1000);
          }else{
            if(This.page.type == 'anime'){
              var epis = 'episode: '+state.episode;
            }else{
              var epis = 'chapter: <b>'+state.episode+'</b>';
            }
            var message = '<button class="sync" style="margin-bottom: 8px; background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px;cursor: pointer;">Update MAL to '+epis+'</button>';
            utils.flashm( message , {hoverInfo: true, error: true, type: 'update'}).find('.sync').on('click', function(){
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
              statusString = utils.watching(This.page.type);
              break;
            case 2:
              statusString = 'Completed';
              break;
            case 3:
              statusString = 'On-Hold';
              break;
            case 4:
              statusString = 'Dropped';
              break;
            case 6:
              statusString = utils.planTo(This.page.type);
              break;
          }
          message += split + statusString;
          split = ' | '
        }
        if(This.page.type == 'manga' && ( typeof This.oldMalObj == "undefined" || This.malObj.getVolume() != This.oldMalObj.getVolume() )){
          message += split + 'Volume: ' + This.malObj.getVolume()+"/"+totalVol;
          split = ' | '
        }
        if(typeof This.oldMalObj == "undefined" || This.malObj.getEpisode() != This.oldMalObj.getEpisode()){
          message += split + 'Episode: ' + This.malObj.getEpisode()+"/"+totalEp;
          split = ' | '
        }
        if(typeof This.oldMalObj == "undefined" || This.malObj.getScore() != This.oldMalObj.getScore() && This.malObj.getScore() != ''){
          message += split + 'Rating: ' + This.malObj.getScore();
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
            message += '<br><button class="undoButton" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px;cursor: pointer;">Undo</button>';
          }
          utils.flashm(message, {hoverInfo: true, type: 'update'}).find('.undoButton').on('click', function(this){
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
        utils.flashm( "Update failed" , {error: true});
        return;
      });
  }

  private async handleAnimeUpdate(state){
    var status = utils.status;
    if(
      this.malObj.getEpisode() >= state.episode &&
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
    this.malObj.setStreamingUrl(this.page.sync.getOverviewUrl(this.url));
    this.malObj.setStartingDateToNow();

    if(this.malObj.getStatus() !== status.completed && parseInt(state.episode) === this.malObj.totalEp && parseInt(state.episode) != 0 ){
      if (await utils.flashConfirm('Set as completed?', 'complete')) {
        this.malObj.setStatus(status.completed);
        this.malObj.setCompletionDateToNow()
        return true;
      }
    }

    if(this.malObj.getStatus() !== status.watching && this.malObj.getStatus() !== status.completed && state.status !== status.completed){
      if (await utils.flashConfirm('Start '+utils.watching(this.page.type).toLowerCase()+'?', 'start')) {
        this.malObj.setStatus(status.watching);
      }else{
        return false;
      }
    }

    return true;
  }

  fillUI(){
    j.$('.MalLogin').css("display","initial");
    j.$('#AddMalDiv').remove();

    j.$("#malRating").attr("href", this.malObj.url);
    this.malObj.getRating().then((rating)=>{j.$("#malRating").text(rating);});

    if(!this.malObj.login){
      j.$('.MalLogin').css("display","none");
      j.$("#MalData").css("display","flex");
      j.$("#MalInfo").text("");
      j.$("#malRating").after("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id='LoginMalDiv'>Please log in on <a target='_blank' id='login' href='https://myanimelist.net/login.php'>MyAnimeList!<a></span>");
      return;
    }

    if(this.malObj.addAnime){
      j.$('.MalLogin').css("display","none");
      j.$("#malRating").after("<span id='AddMalDiv'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' id='AddMal' onclick='return false;'>Add to MAL</a></span>")
      var This = this;
      j.$('#AddMal').click(function() {
        This.malObj.setStatus(6);
        This.syncHandling()
          .then(() => {
            return This.malObj.update();
          }).then(() => {
            This.fillUI();
          });
      });
    }else{
      j.$("#malTotal, #malTotalCha").text(this.malObj.totalEp);
      if(this.malObj.totalEp == 0){
         j.$("#malTotal, #malTotalCha").text('?');
      }

      j.$("#malTotalVol").text(this.malObj.totalVol);
      if(this.malObj.totalVol == 0){
         j.$("#malTotalVol").text('?');
      }

      j.$("#malEpisodes").val(this.malObj.getEpisode());
      j.$("#malVolumes").val(this.malObj.getVolume());

      j.$("#malStatus").val(this.malObj.getStatus());
      j.$("#malUserRating").val(this.malObj.getScore());
    }
    j.$("#MalData").css("display","flex");
    j.$("#MalInfo").text("");

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
        var elementUrl = this.page.overview.list.elementUrl;
        con.log("Episode List", j.$.map( epList, function( val, i ) {if(typeof(val) != "undefined"){return elementUrl(val)}return '-';}));
        var curEp = epList[this.malObj.getEpisode()];
        if (typeof(curEp) != "undefined" && curEp){
          curEp.addClass('mal-sync-active');
        }else if(this.malObj.getEpisode() && searchCurrent && reTry < 10 && typeof this.page.overview.list.paginationNext !== 'undefined'){
          con.log('Pagination next');
          var This = this;
          if(this.page.overview.list.paginationNext()){
            setTimeout(function(){
              reTry++;
              This.handleList(true, reTry);
            }, 500);
          }
        }

        var nextEp = epList[this.malObj.getEpisode() + 1];
        if (typeof(nextEp) != "undefined" && nextEp && !this.page.isSyncPage(this.url)){
          var message = '<a href="'+elementUrl(nextEp)+'">'+utils.episode(this.page.type)+' '+( this.malObj.getEpisode()+1 )+'</a>';
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
      this.page.overview.list.elementsSelector().each( function(index, el) {
        try{
          var elEp = parseInt(elementEp(j.$(el))+"")+parseInt(This.getOffset());
          elementArray[elEp] = j.$(el);
        }catch(e){
          con.info(e);
        }

      });
      return elementArray;
    }
  }

  cdn(){

  }

  async getMalUrl(identifier: string, title: string, page){
    var This = this;
    var cache = await api.storage.get(this.page.name+'/'+identifier+'/Mal' , null);
    if(typeof(cache) != "undefined"){
      con.log('Cache', this.page.name+'/'+identifier, cache);
      return cache;
    }

    if(typeof page.database != "undefined"){
      var firebaseVal = await firebase();
      if(firebaseVal !== false){
        return firebaseVal;
      }
    }

    var malSearchVal = await malSearch();
    if(malSearchVal !== false){
      return malSearchVal;
    }

    return false;

    function firebase(){
      var url = 'https://kissanimelist.firebaseio.com/Data2/'+page.database+'/'+encodeURIComponent(titleToDbKey(identifier)).toLowerCase()+'/Mal.json';
      con.log("Firebase", url);
      return api.request.xhr('GET', url).then((response) => {
        con.log("Firebase response",response.responseText);
        if(response.responseText !== 'null' && !(response.responseText.indexOf("error") > -1)){
          var returnUrl:any = '';
          if(response.responseText.split('"')[1] == 'Not-Found'){
            returnUrl = null;
          }else{
            returnUrl = 'https://myanimelist.net/'+page.type+'/'+response.responseText.split('"')[1]+'/'+response.responseText.split('"')[3];
          }
          This.setCache(returnUrl, false, identifier);
          return returnUrl;
        }else{
          return false;
        }
      });
    }

    function malSearch(){
      var url = "https://myanimelist.net/"+page.type+".php?q=" + encodeURI(title);
      con.log("malSearch", url);
      return api.request.xhr('GET', url).then((response) => {
        if(response.responseText !== 'null' && !(response.responseText.indexOf("  error ") > -1)){
          try{
            var link = response.responseText.split('<a class="hoverinfo_trigger" href="')[1].split('"')[0];
            This.setCache(link, true, identifier);
            return link
          }catch(e){
            con.error(e);
            try{
              var link = response.responseText.split('class="picSurround')[1].split('<a')[1].split('href="')[1].split('"')[0];
              This.setCache(link, true, identifier);
              return link
            }catch(e){
              con.error(e);
              return false;
            }
          }

        }else{
          return false;
        }
      });
    }

    //Helper
    function titleToDbKey(title) {
      if( window.location.href.indexOf("crunchyroll.com") > -1 ){
          return encodeURIComponent(title.toLowerCase().split('#')[0]).replace(/\./g, '%2E');
      }
      return title.toLowerCase().split('#')[0].replace(/\./g, '%2E');
    };

  }

  public setCache(url, toDatabase:boolean|'correction', identifier:any = null){
    if(identifier == null){
      if(this.page.isSyncPage(this.url)){
        identifier = this.page.sync.getIdentifier(this.url);
      }else{
        identifier = this.page.overview!.getIdentifier(this.url);
      }
    }

    api.storage.set(this.page.name+'/'+identifier+'/Mal' , url);

    this.databaseRequest(url, toDatabase, identifier);
  }

  public databaseRequest(malurl, toDatabase:boolean|'correction', identifier, kissurl:any = null){
    if(typeof this.page.database != 'undefined' && toDatabase){
      if(kissurl == null){
        if(this.page.isSyncPage(this.url)){
          kissurl = this.page.sync.getOverviewUrl(this.url);
        }else{
          kissurl = this.url;
        }
      }
      var param = { Kiss: kissurl, Mal: malurl};
      if(toDatabase == 'correction'){
        param['newCorrection'] = true;
      }
      var url = 'https://kissanimelist.firebaseio.com/Data2/Request/'+this.page.database+'Request.json';
      api.request.xhr('POST', {url: url, data: JSON.stringify(param)}).then((response) => {
        if(response.responseText !== 'null' && !(response.responseText.indexOf("error") > -1)){
          con.log("[DB] Send to database:", param);
        }else{
          con.error("[DB] Send to database:", response.responseText);
        }

      });

    }
  }


  public deleteCache(){
    var getIdentifier;
    if(this.page.isSyncPage(this.url)){
      getIdentifier = this.page.sync.getIdentifier;
    }else{
      getIdentifier = this.page.overview!.getIdentifier;
    }

    api.storage.remove(this.page.name+'/'+getIdentifier(this.url)+'/Mal');
  }

  private offset;

  getOffset(){
    if(typeof this.offset == 'undefined') return 0;
    return this.offset;
  }

  async setOffset(value:number){
    this.offset = value;
    var getIdentifier;
    if(this.page.isSyncPage(this.url)){
      getIdentifier = this.page.sync.getIdentifier;
    }else{
      getIdentifier = this.page.overview!.getIdentifier;
      this.handleList();
    }
    var returnValue = api.storage.set(this.page.name+'/'+getIdentifier(this.url)+'/Offset', value);
    if(typeof this.malObj != 'undefined'){
      api.storage.remove('updateCheck/'+this.malObj.type+'/'+this.malObj.id)
    }
    return returnValue;
  }

  UILoaded:boolean = false;
  private loadUI(){
    if(this.UILoaded) return;
    this.UILoaded = true;
    var wrapStart = '<span style="display: inline-block;">';
    var wrapEnd = '</span>';

    var ui = '<p id="malp">';
    ui += '<span id="MalInfo">Loading</span>';

    ui += '<span id="MalData" style="display: none; justify-content: space-between; flex-wrap: wrap;">';

    ui += wrapStart;
    ui += '<span class="info">MAL Score: </span>';
    ui += '<a id="malRating" style="min-width: 30px;display: inline-block;" target="_blank" href="">____</a>';
    ui += wrapEnd;

    //ui += '<span id="MalLogin">';
    wrapStart = '<span style="display: inline-block; display: none;" class="MalLogin">';

    ui += wrapStart;
    ui += '<span class="info">Status: </span>';
    ui += '<select id="malStatus">';
    //ui += '<option value="0" ></option>';
    ui += '<option value="1" >'+utils.watching(this.page.type)+'</option>';
    ui += '<option value="2" >Completed</option>';
    ui += '<option value="3" >On-Hold</option>';
    ui += '<option value="4" >Dropped</option>';
    ui += '<option value="6" >'+utils.planTo(this.page.type)+'</option>';
    ui += '</select>';
    ui += wrapEnd;

    if(this.page.type == 'anime'){
        var middle = '';
        middle += wrapStart;
        middle += '<span class="info">Episode: </span>';
        middle += '<span style=" text-decoration: none; outline: medium none;">';
        middle += '<input id="malEpisodes" value="0" type="text" size="1" maxlength="4">';
        middle += '/<span id="malTotal">0</span>';
        middle += '</span>';
        middle += wrapEnd;

    }else{
        var middle = '';
        middle += wrapStart;
        middle += '<span class="info">Volume: </span>';
        middle += '<span style=" text-decoration: none; outline: medium none;">';
        middle += '<input id="malVolumes" value="0" type="text" size="1" maxlength="4">';
        middle += '/<span id="malTotalVol">0</span>';
        middle += '</span>';
        middle += wrapEnd;


        middle += wrapStart;
        middle += '<span class="info">Chapter: </span>';
        middle += '<span style=" text-decoration: none; outline: medium none;">';
        middle += '<input id="malEpisodes" value="0" type="text" size="1" maxlength="4">';
        middle += '/<span id="malTotalCha">0</span>';
        middle += '</span>';
        middle += wrapEnd;
    }

    ui += middle;


    ui += wrapStart;
    ui += '<span class="info">Your Score: </span>';
    ui += '<select id="malUserRating"><option value="" >Select</option>';
    ui += '<option value="10" >(10) Masterpiece</option>';
    ui += '<option value="9" >(9) Great</option>';
    ui += '<option value="8" >(8) Very Good</option>';
    ui += '<option value="7" >(7) Good</option>';
    ui += '<option value="6" >(6) Fine</option>';
    ui += '<option value="5" >(5) Average</option>';
    ui += '<option value="4" >(4) Bad</option>';
    ui += '<option value="3" >(3) Very Bad</option>';
    ui += '<option value="2" >(2) Horrible</option>';
    ui += '<option value="1" >(1) Appalling</option>';
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
    });

    j.$( "#malEpisodes, #malVolumes" ).on('input', function(){
      //@ts-ignore
      var el = $(this);
      var numberlength = el.val()!.toString().length;
      if(numberlength < 1) numberlength = 1;
      var numberWidth = (numberlength * 7.7) + 3;
      el.css('width', numberWidth+'px');
    }).trigger('input');

  }

  private buttonclick(){
    this.malObj.setEpisode(j.$("#malEpisodes").val());
    if( j.$("#malVolumes").length ) this.malObj.setVolume(j.$("#malVolumes").val());
    this.malObj.setScore(j.$("#malUserRating").val());
    this.malObj.setStatus(j.$("#malStatus").val());

    this.syncHandling()
      .then(() => {
        return this.malObj.update();
      }).then(() => {
        this.fillUI();
      });
  }

}

