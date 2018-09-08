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
    $(document).ready(function(){
      initIframeModal(This);
    });
    this.page.init(this);
  }

  private getPage(url){
    for (var key in pages) {
      var page = pages[key];
      if( url.indexOf(utils.urlPart(page.domain, 2).split('.').slice(-2, -1)[0] +'.') > -1 ){
        return page;
      }
    }
    return null;
  }

  async handlePage(){
    var state: pageState;

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
      con.error('Not on mal');
    }else if(!malUrl){
      con.error('Nothing found');
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
        if(this.handleAnimeUpdate(state)){
          alert('sync');
          this.malObj.setResumeWaching(this.url, state.episode);
          if(typeof this.page.sync.nextEpUrl !== 'undefined'){
            var continueWatching = this.page.sync.nextEpUrl(this.url);
            if(continueWatching) this.malObj.setContinueWaching(continueWatching, state.episode! + 1);
          }

          this.syncHandling(true);
        }else{
          alert('noSync');
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
                    $('.info-Mal-undo').remove();
                    if($('.flashinfo>div').text() == ''){
                        $('.flashinfo').remove();
                    }
                });
            }*/
          if(typeof This.oldMalObj != "undefined"){
            message += '<br><button class="undoButton" style="background-color: transparent; border: none; color: rgb(255,64,129);margin-top: 10px;cursor: pointer;">Undo</button>';
          }
          utils.flashm(message, {hoverInfo: true}).find('.undoButton').on('click', function(this){
            this.closest('.flash').remove();
            This.malObj = This.oldMalObj;
            This.oldMalObj = undefined;
            This.syncHandling();
          });
        }else{
          utils.flashm(message);
        }

        return;
      }).catch(function(e){
        con.error(e);
        utils.flashm( "Anime update failed" , {error: true});
        return;
      });
  }

  private handleAnimeUpdate(state){
    if(this.malObj.getEpisode() >= state.episode){
      return false;
    }
    this.malObj.setEpisode(state.episode);
    this.malObj.setStreamingUrl(this.page.sync.getOverviewUrl(this.url));
    //TODO: Add the Startwatching/Endwatching/Rewatching Handling
    return true;
  }

  fillUI(){
    $('.MalLogin').css("display","initial");
    $('#AddMalDiv').remove();

    $("#malRating").attr("href", this.malObj.url);
    this.malObj.getRating().then((rating)=>{$("#malRating").text(rating);});

    if(!this.malObj.login){
      $('.MalLogin').css("display","none");
      $("#MalData").css("display","flex");
      $("#MalInfo").text("");
      $("#malRating").after("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id='LoginMalDiv'>Please log in on <a target='_blank' id='login' href='https://myanimelist.net/login.php'>MyAnimeList!<a></span>");
      return;
    }

    if(this.malObj.addAnime){
      $('.MalLogin').css("display","none");
      $("#malRating").after("<span id='AddMalDiv'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' id='AddMal' onclick='return false;'>Add to MAL</a></span>")
      var This = this;
      $('#AddMal').click(function() {
        This.malObj.setStatus(6);
        This.syncHandling()
          .then(() => {
            return This.malObj.update();
          }).then(() => {
            This.fillUI();
          });
      });
    }else{
      $("#malTotal, #malTotalCha").text(this.malObj.totalEp);
      if(this.malObj.totalEp == 0){
         $("#malTotal, #malTotalCha").text('?');
      }

      $("#malTotalVol").text(this.malObj.totalVol);
      if(this.malObj.totalVol == 0){
         $("#malTotalVol").text('?');
      }

      $("#malEpisodes").val(this.malObj.getEpisode());
      $("#malVolumes").val(this.malObj.getVolume());

      $("#malStatus").val(this.malObj.getStatus());
      $("#malUserRating").val(this.malObj.getScore());
    }
    $("#MalData").css("display","flex");
    $("#MalInfo").text("");

    this.handleList();
  }

  handleList(){
    $('.mal-sync-active').removeClass('mal-sync-active');
    if (typeof(this.page.overview) != "undefined" && typeof(this.page.overview.list) != "undefined"){
      var epList = this.getEpList();
      if (typeof(epList) != "undefined"){
        var elementUrl = this.page.overview.list.elementUrl;
        con.log("Episode List", $.map( epList, function( val, i ) {if(typeof(val) != "undefined"){return elementUrl(val)}return '-';}));
        var curEp = epList[this.malObj.getEpisode()];
        if (typeof(curEp) != "undefined" && curEp){
          curEp.addClass('mal-sync-active');
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
          var elEp = parseInt(elementEp($(el))+"")+parseInt(This.getOffset());
          elementArray[elEp] = $(el);
        }catch(e){
          con.info(e);
        }

      });
      return elementArray;
    }
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
        if(response.responseText !== 'null' && !(response.responseText.indexOf("error") > -1)){
          try{
            var link = response.responseText.split('<a class="hoverinfo_trigger" href="')[1].split('"')[0];
            This.setCache(link, false, identifier);
            return link
          }catch(e){
            con.error(e);
            return false;
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
    if(identifier == null) identifier = this.page.sync.getIdentifier(this.url);
    api.storage.set(this.page.name+'/'+identifier+'/Mal' , url);
  }

  public deleteCache(){
    api.storage.remove(this.page.name+'/'+this.page.sync.getIdentifier(this.url)+'/Mal');
  }

  private offset;

  getOffset(){
    if(typeof this.offset == 'undefined') return 0;
    return this.offset;
  }

  async setOffset(value:number){
    this.offset = value;
    return api.storage.set(this.page.name+'/'+this.page.sync.getIdentifier(this.url)+'/Offset', value);
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
    ui += '<select id="malStatus" style="font-size: 12px;background: transparent; border-width: 1px; border-color: grey;  text-decoration: none; outline: medium none;">';
    //ui += '<option value="0" style="background: #111111;"></option>';
    ui += '<option value="1" style="background: #111111;">'+utils.watching(this.page.type)+'</option>';
    ui += '<option value="2" style="background: #111111;">Completed</option>';
    ui += '<option value="3" style="background: #111111;">On-Hold</option>';
    ui += '<option value="4" style="background: #111111;">Dropped</option>';
    ui += '<option value="6" style="background: #111111;">'+utils.planTo(this.page.type)+'</option>';
    ui += '</select>';
    ui += wrapEnd;

    if(this.page.type == 'anime'){
        var middle = '';
        middle += wrapStart;
        middle += '<span class="info">Episodes: </span>';
        middle += '<span style=" text-decoration: none; outline: medium none;">';
        middle += '<input id="malEpisodes" value="0" style="background: transparent; border-width: 1px; border-color: grey; text-align: right;  text-decoration: none; outline: medium none;" type="text" size="1" maxlength="4">';
        middle += '/<span id="malTotal">0</span>';
        middle += '</span>';
        middle += wrapEnd;

    }else{
        var middle = '';
        middle += wrapStart;
        middle += '<span class="info">Volumes: </span>';
        middle += '<span style=" text-decoration: none; outline: medium none;">';
        middle += '<input id="malVolumes" value="0" style="background: transparent; border-width: 1px; border-color: grey; text-align: right;  text-decoration: none; outline: medium none;" type="text" size="1" maxlength="4">';
        middle += '/<span id="malTotalVol">0</span>';
        middle += '</span>';
        middle += wrapEnd;


        middle += wrapStart;
        middle += '<span class="info">Chapters: </span>';
        middle += '<span style=" text-decoration: none; outline: medium none;">';
        middle += '<input id="malEpisodes" value="0" style="background: transparent; border-width: 1px; border-color: grey; text-align: right;  text-decoration: none; outline: medium none;" type="text" size="1" maxlength="4">';
        middle += '/<span id="malTotalCha">0</span>';
        middle += '</span>';
        middle += wrapEnd;
    }

    ui += middle;


    ui += wrapStart;
    ui += '<span class="info">Your Score: </span>';
    ui += '<select id="malUserRating" style="font-size: 12px;background: transparent; border-width: 1px; border-color: grey;  text-decoration: none; outline: medium none;"><option value="" style="background: #111111;">Select</option>';
    ui += '<option value="10" style="background: #111111;">(10) Masterpiece</option>';
    ui += '<option value="9" style="background: #111111;">(9) Great</option>';
    ui += '<option value="8" style="background: #111111;">(8) Very Good</option>';
    ui += '<option value="7" style="background: #111111;">(7) Good</option>';
    ui += '<option value="6" style="background: #111111;">(6) Fine</option>';
    ui += '<option value="5" style="background: #111111;">(5) Average</option>';
    ui += '<option value="4" style="background: #111111;">(4) Bad</option>';
    ui += '<option value="3" style="background: #111111;">(3) Very Bad</option>';
    ui += '<option value="2" style="background: #111111;">(2) Horrible</option>';
    ui += '<option value="1" style="background: #111111;">(1) Appalling</option>';
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
        this.page.sync.uiSelector($(ui));
      }
    }else{
      if (typeof(this.page.overview) != "undefined"){
        this.page.overview.uiSelector($(ui));
      }
    }

    var This = this;
    $( "#malEpisodes, #malVolumes, #malUserRating, #malStatus" ).change(function() {
        This.buttonclick();
    });
  }

  private buttonclick(){
    this.malObj.setEpisode($("#malEpisodes").val());
    if( $("#malVolumes").length ) this.malObj.setVolume($("#malVolumes").val());
    this.malObj.setScore($("#malUserRating").val());
    this.malObj.setStatus($("#malStatus").val());

    this.syncHandling()
      .then(() => {
        return this.malObj.update();
      }).then(() => {
        this.fillUI();
      });
  }

}

