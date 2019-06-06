export class entryClass{

  readonly id: number;
  readonly type: "anime"|"manga";

  name: string = "";
  totalEp: number = NaN;
  totalVol?: number;
  addAnime: boolean = false;
  login: boolean = false;
  wrong: boolean = false;
  pending: boolean = false;

  renderNoImage: boolean = true;

  private animeInfo;

  constructor(public url:string, public miniMAL:boolean = false, public silent:boolean = false){
    this.id = utils.urlPart(url, 4);
    this.type = utils.urlPart(url, 3);
  }

  init(){
    return this.update();
  };

  getDisplayUrl(){
    return this.url;
  }

  getMalUrl(){
    return this.getDisplayUrl();
  }

  getDetailUrl(){
    return `https://myanimelist.net/ownlist/${this.type}/${this.id}/edit`;
  }

  update(){
    var editUrl = 'https://myanimelist.net/ownlist/'+this.type+'/'+this.id+'/edit?hideLayout';
    con.log('Update MAL info', editUrl);
    return api.request.xhr('GET', editUrl).then((response) => {
      if(response.finalUrl.indexOf("myanimelist.net/login.php") > -1 || response.responseText.indexOf("Unauthorized") > -1) {
        this.login = false;
        con.error("User not logged in");
        return;
      }
      this.login = true;
      this.animeInfo = this.getObject(response.responseText);
    });
  }

  getEpisode(){
    if(this.type == "manga"){
      return this.animeInfo[".add_manga[num_read_chapters]"];
    }
    return this.animeInfo[".add_anime[num_watched_episodes]"];
  }

  setEpisode(ep:number){
    if(ep+'' === '') ep = 0;
    if(this.type == "manga"){
      this.animeInfo[".add_manga[num_read_chapters]"] = parseInt(ep+'');
    }
    this.animeInfo[".add_anime[num_watched_episodes]"] = parseInt(ep+'');
  }

  getVolume(){
    if(this.type == "manga"){
      return this.animeInfo[".add_manga[num_read_volumes]"];
    }
    return false;
  }

  setVolume(ep:number){
    if(this.type == "manga"){
      this.animeInfo[".add_manga[num_read_volumes]"] = ep;
      return;
    }
    con.error('You cant set Volumes for animes');
  }

  getStatus(){
    if(this.type == "manga"){
      return this.animeInfo[".add_manga[status]"];
    }
    return this.animeInfo[".add_anime[status]"];
  }

  setStatus(status:number){
    if(this.type == "manga"){
      this.animeInfo[".add_manga[status]"] = status;
    }
    this.animeInfo[".add_anime[status]"] = status;
  }

  getScore(){
    if(this.type == "manga"){
      return this.animeInfo[".add_manga[score]"];
    }
    return this.animeInfo[".add_anime[score]"];
  }

  setScore(score:number){
    if(score === 0) score = "";
    if(this.type == "manga"){
      this.animeInfo[".add_manga[score]"] = score;
    }
    this.animeInfo[".add_anime[score]"] = score;
  }

  getRewatching(): 1|0{
    if(this.type == "manga"){
      return this.animeInfo[".add_manga[is_rereading]"];
    }
    return this.animeInfo[".add_anime[is_rewatching]"];
  }

  setRewatching(rewatching:1|0){
    if(this.type == "manga"){
      this.animeInfo[".add_manga[is_rereading]"] = rewatching;
    }
    this.animeInfo[".add_anime[is_rewatching]"] = rewatching;
  }

  setCompletionDateToNow(){
    var Datec = new Date();
    if(this.animeInfo['.add_anime[finish_date][day]'] === '' || this.animeInfo['.add_manga[finish_date][day]'] === ''){
      if(this.type == "manga"){
        this.animeInfo['.add_manga[finish_date][year]'] = Datec.getFullYear();
        this.animeInfo['.add_manga[finish_date][month]'] = Datec.getMonth()+1;
        this.animeInfo['.add_manga[finish_date][day]'] = Datec.getDate();
      }
      this.animeInfo['.add_anime[finish_date][year]'] = Datec.getFullYear();
      this.animeInfo['.add_anime[finish_date][month]'] = Datec.getMonth()+1;
      this.animeInfo['.add_anime[finish_date][day]'] = Datec.getDate();
    }else{
      con.error('Completion date already set');
    }
  }

  setStartingDateToNow(){
    var Datec = new Date();
    if(this.animeInfo['.add_anime[start_date][day]'] === '' || this.animeInfo['.add_manga[start_date][day]'] === ''){
      if(this.type == "manga"){
        this.animeInfo['.add_manga[start_date][year]'] = Datec.getFullYear();
        this.animeInfo['.add_manga[start_date][month]'] = Datec.getMonth()+1;
        this.animeInfo['.add_manga[start_date][day]'] = Datec.getDate();
      }
      this.animeInfo['.add_anime[start_date][year]'] = Datec.getFullYear();
      this.animeInfo['.add_anime[start_date][month]'] = Datec.getMonth()+1;
      this.animeInfo['.add_anime[start_date][day]'] = Datec.getDate();
    }else{
      con.info('Start date already set');
    }
  }

  getStreamingUrl(){
    var tags = this.animeInfo[".add_anime[tags]"];
    if(this.type == "manga"){
      tags = this.animeInfo[".add_manga[tags]"];
    }
    return utils.getUrlFromTags(tags);
  }

  setStreamingUrl(url:string){
    var tags = this.animeInfo[".add_anime[tags]"];
    if(this.type == "manga"){
      tags = this.animeInfo[".add_manga[tags]"];
    }

    tags = utils.setUrlInTags(url, tags);

    if(this.type == "manga"){
      this.animeInfo[".add_manga[tags]"] = tags;
      return;
    }
    this.animeInfo[".add_anime[tags]"] = tags;
  }

  async getRating(){
    return new Promise((resolve, reject) => {
      var url = '';
      if(this.type == 'anime'){
        url = 'https://myanimelist.net/includes/ajax.inc.php?t=64&id='+this.id;
      }else{
        url = 'https://myanimelist.net/includes/ajax.inc.php?t=65&id='+this.id;
      }
      api.request.xhr('GET', url).then((response) => {
        try{
          resolve(response.responseText.split('Score:</span>')[1].split('<')[0]);
        }catch(e){
          con.error('Could not get rating', e);
          reject();
        }
      });
    });
  }

  getCacheKey(){
    return this.id;
  }

  async setResumeWaching(url:string, ep:number){
    return utils.setResumeWaching(url, ep, this.type, this.getCacheKey());
  }

  async getResumeWaching():Promise<{url:string, ep:number}>{
    return utils.getResumeWaching(this.type, this.getCacheKey())
  }

  async setContinueWaching(url:string, ep:number){
    return utils.setContinueWaching(url, ep,this.type, this.getCacheKey())
  }

  async getContinueWaching():Promise<{url:string, ep:number}>{
    return utils.getContinueWaching(this.type, this.getCacheKey())
  }

  async getImage():Promise<string>{
    return api.request.xhr('GET', this.url).then((response) => {
      var data = response.responseText;
      var image = '';
      try{
          image = data.split('js-scrollfix-bottom')[1].split('<img src="')[1].split('"')[0];
      }catch(e) {console.log('[mal.ts] Error:',e);}
      return image;
    });
  }

  clone() {
      const copy = new (this.constructor as { new () })();
      Object.assign(copy, this);
      copy.animeInfo = Object.assign( {},this.animeInfo);
      return copy;
  }

  sync(){
    var status = utils.status;
    return new Promise((resolve, reject) => {
      var This = this;
      var url = "https://myanimelist.net/ownlist/"+this.type+"/"+this.id+"/edit";
      if(this.pending){
        utils.flashm('This '+this.type+' is currently pending approval. It can´t be saved to mal for now')
        return;
      }
      if(this.addAnime){
        if(this.silent){
          if(this.type == 'anime'){
            url = "https://myanimelist.net/ownlist/anime/add?selected_series_id="+this.id;
          }else{
            url = "https://myanimelist.net/ownlist/manga/add?selected_manga_id="+this.id;
          }
          continueCall();
          return;
        }
        var imgSelector = 'malSyncImg'+this.id;
        var flashConfirmText = `
          ${api.storage.lang("syncPage_flashConfirm_Anime_Correct", [this.name])}
          <br>
          <img id="${imgSelector}" style="
            height: 200px;
            min-height: 200px;
            min-width: 144px;
            border: 1px solid;
            margin-top: 10px;
            display: inline;
          " src="" />
          <br>
          <!--<a style="margin-left: -2px;" target="_blank" href="https://github.com/lolamtisch/MALSync/wiki/Troubleshooting#myanimeentry-entry-is-not-correct">[How to correct entries]</a>-->
        `;

        if(This.miniMAL){
          flashConfirmText = `
                    Add "${this.name}" to MAL?`;
        }

        if(this.type == 'anime'){
          url = "https://myanimelist.net/ownlist/anime/add?selected_series_id="+this.id;
          utils.flashConfirm(flashConfirmText, 'add', function(){
            continueCall();
          }, function(){
            wrongCall();
              /*if(change['checkIncrease'] == 1){TODO
                  episodeInfo(change['.add_anime[num_watched_episodes]'], actual['malurl']);
              }*/
          });
        }else{
          url = "https://myanimelist.net/ownlist/manga/add?selected_manga_id="+this.id;
          utils.flashConfirm(flashConfirmText, 'add', function(){
            continueCall();
          }, function(){
            wrongCall();
          });
        }

        if(!This.miniMAL){
          this.getImage().then((image) => {
            j.$('#'+imgSelector).attr('src', image);
          })

          j.$('.Yes').text(api.storage.lang("Yes"));
          j.$('.Cancel').text(api.storage.lang("No"));
        }

        return;
      }else{
        //Rewatching
        var watchCounter = '.add_anime[num_watched_times]';
        var rewatchText = 'Rewatch Anime?';
        var rewatchFinishText = 'Finish rewatching?';
        if(this.type == "manga"){
          watchCounter = '.add_manga[num_read_times]';
          rewatchText = 'Reread Manga?';
          rewatchFinishText = 'Finish rereading?';
        }

        if(
          this.getStatus() == status.completed &&
          this.getEpisode() === 1 &&
          this.totalEp !== 1 &&
          this.getRewatching() !== 1
        ){
          utils.flashConfirm(rewatchText, 'add', () => {
            this.setRewatching(1);
            continueCall();
          }, function(){
            con.log('Rewatching denial');
          });
          return;
        }

        if(
          this.getStatus() == status.completed &&
          this.getEpisode() === this.totalEp &&
          this.getRewatching() === 1
        ){

          utils.flashConfirm(rewatchFinishText, 'add', () => {
            this.setRewatching(0);

            if(this.animeInfo[watchCounter] === ''){
                this.animeInfo[watchCounter] = 1;
            }else{
                this.animeInfo[watchCounter] = parseInt(this.animeInfo[watchCounter])+1;
            }

            continueCall();
          }, function(){
            continueCall();
          });

          return;
        }
      }

      function wrongCall(){
        This.wrong = true;
        if(!This.miniMAL){
          var miniButton = j.$('button.open-info-popup');
          if(miniButton.css('display') != 'none'){
            miniButton.click();
          }else{
            miniButton.click();
            miniButton.click();
          }
        }
      }

      continueCall();
      function continueCall(){
        var parameter = "";
        j.$.each( This.animeInfo, function( index, value ){
            if(index.toString().charAt(0) == "."){
                if(!( (index === '.add_anime[is_rewatching]' || index === '.add_manga[is_rereading]') && parseInt(value) === 0)){
                    parameter += encodeURIComponent (index.toString().substring(1))+"="+encodeURIComponent (value)+"&";
                }
            }
        });

        con.log('[SET] URL:', url);
        con.log('[SET] Object:', This.animeInfo);

        api.request.xhr('POST', {url: url, data: parameter, headers: {"Content-Type": "application/x-www-form-urlencoded"} }).then((response) => {
          if(response.responseText.indexOf('Successfully') >= 0){
            con.log('Update Succeeded');
            resolve();
          }else{
            con.error('Update failed');
            reject();
          }
          //This.animeInfo = This.getObject(response.responseText);
        });
      }
    });
  }

  private getObject(data){
    var getselect = utils.getselect;
    if (typeof data.split('<form name="')[1] === "undefined" && (this.url.indexOf('/manga/') !== -1 || this.url.indexOf('/anime/') !== -1)) {
      throw new Error("MAL is down or otherwise giving bad data");
    }

    this.addAnime = false;
    this.pending = false;

    if(this.type == 'anime'){
      var anime = {};
      anime['.csrf_token'] =  data.split('\'csrf_token\'')[1].split('\'')[1].split('\'')[0];
      if(data.indexOf('Add Anime') > -1) {
        this.addAnime = true;
      }
      if(data.indexOf('pending approval') > -1){
        this.pending = true;
      }
      data = data.split('<form name="')[1].split('</form>')[0];

      this.totalEp = parseInt(data.split('id="totalEpisodes">')[1].split('<')[0]);
      this.name = data.split('<a href="')[1].split('">')[1].split('<')[0];
      anime['.anime_id'] = parseInt(data.split('name="anime_id"')[1].split('value="')[1].split('"')[0]); //input
      anime['.aeps'] = parseInt(data.split('name="aeps"')[1].split('value="')[1].split('"')[0]);
      anime['.astatus'] = parseInt(data.split('name="astatus"')[1].split('value="')[1].split('"')[0]);
      anime['.add_anime[status]'] = parseInt(getselect(data,'add_anime[status]'));
      //Rewatching
      if(data.split('name="add_anime[is_rewatching]"')[1].split('>')[0].indexOf('checked="checked"') >= 0){
          anime['.add_anime[is_rewatching]'] = 1;
      }
      //
      anime['.add_anime[num_watched_episodes]'] = parseInt(data.split('name="add_anime[num_watched_episodes]"')[1].split('value="')[1].split('"')[0]);
      if( isNaN(anime['.add_anime[num_watched_episodes]']) ){ anime['.add_anime[num_watched_episodes]'] = ''; }
      anime['.add_anime[score]'] = getselect(data,'add_anime[score]');
      anime['.add_anime[start_date][month]'] = getselect(data,'add_anime[start_date][month]');
      anime['.add_anime[start_date][day]'] = getselect(data,'add_anime[start_date][day]');
      anime['.add_anime[start_date][year]'] = getselect(data,'add_anime[start_date][year]');
      anime['.add_anime[finish_date][month]'] = getselect(data,'add_anime[finish_date][month]');
      anime['.add_anime[finish_date][day]'] = getselect(data,'add_anime[finish_date][day]');
      anime['.add_anime[finish_date][year]'] = getselect(data,'add_anime[finish_date][year]');
      anime['.add_anime[tags]'] = data.split('name="add_anime[tags]"')[1].split('>')[1].split('<')[0];//textarea
      anime['.add_anime[priority]'] = getselect(data,'add_anime[priority]');
      anime['.add_anime[storage_type]'] = getselect(data,'add_anime[storage_type]');
      anime['.add_anime[storage_value]'] = data.split('name="add_anime[storage_value]"')[1].split('value="')[1].split('"')[0];
      anime['.add_anime[num_watched_times]'] = data.split('name="add_anime[num_watched_times]"')[1].split('value="')[1].split('"')[0];
      anime['.add_anime[rewatch_value]'] = getselect(data,'add_anime[rewatch_value]');
      anime['.add_anime[comments]'] = data.split('name="add_anime[comments]"')[1].split('>')[1].split('<')[0];
      anime['.add_anime[is_asked_to_discuss]'] = getselect(data,'add_anime[is_asked_to_discuss]');
      if(anime['.add_anime[is_asked_to_discuss]'] == '') anime['.add_anime[is_asked_to_discuss]'] = 0; //#15
      anime['.add_anime[sns_post_type]'] = getselect(data,'add_anime[sns_post_type]');
      anime['.submitIt'] = data.split('name="submitIt"')[1].split('value="')[1].split('"')[0];
      con.log('[GET] Object:',anime);
      return anime;
    }else{
      var anime = {};
      anime['.csrf_token'] =  data.split('\'csrf_token\'')[1].split('\'')[1].split('\'')[0];
      if(data.indexOf('Add Manga') > -1) {
          this.addAnime = true;
      }
      if(data.indexOf('pending approval') > -1){
        this.pending = true;
      }
      data = data.split('<form name="')[1].split('</form>')[0];

      this.totalEp = parseInt(data.split('id="totalChap">')[1].split('<')[0]);
      this.totalVol = parseInt(data.split('id="totalVol">')[1].split('<')[0]);
      this.name = data.split('<a href="')[1].split('">')[1].split('<')[0];
      anime['.entry_id'] = parseInt(data.split('name="entry_id"')[1].split('value="')[1].split('"')[0]);
      anime['.manga_id'] = parseInt(data.split('name="manga_id"')[1].split('value="')[1].split('"')[0]); //input
      anime['volumes'] = parseInt(data.split('id="volumes"')[1].split('value="')[1].split('"')[0]);
      anime['mstatus'] = parseInt(data.split('id="mstatus"')[1].split('value="')[1].split('"')[0]);
      anime['.add_manga[status]'] = parseInt(getselect(data,'add_manga[status]'));
      //Rewatching
      if(data.split('name="add_manga[is_rereading]"')[1].split('>')[0].indexOf('checked="checked"') >= 0){
          anime['.add_manga[is_rereading]'] = 1;
      }
      //
      anime['.add_manga[num_read_volumes]'] = parseInt(data.split('name="add_manga[num_read_volumes]"')[1].split('value="')[1].split('"')[0]);
      if( isNaN(anime['.add_manga[num_read_volumes]']) ){ anime['.add_manga[num_read_volumes]'] = ''; }
      anime['.add_manga[num_read_chapters]'] = parseInt(data.split('name="add_manga[num_read_chapters]"')[1].split('value="')[1].split('"')[0]);
      if( isNaN(anime['.add_manga[num_read_chapters]']) ){ anime['.add_manga[num_read_chapters]'] = ''; }
      anime['.add_manga[score]'] = getselect(data,'add_manga[score]');
      anime['.add_manga[start_date][month]'] = getselect(data,'add_manga[start_date][month]');
      anime['.add_manga[start_date][day]'] = getselect(data,'add_manga[start_date][day]');
      anime['.add_manga[start_date][year]'] = getselect(data,'add_manga[start_date][year]');
      anime['.add_manga[finish_date][month]'] = getselect(data,'add_manga[finish_date][month]');
      anime['.add_manga[finish_date][day]'] = getselect(data,'add_manga[finish_date][day]');
      anime['.add_manga[finish_date][year]'] = getselect(data,'add_manga[finish_date][year]');
      anime['.add_manga[tags]'] = data.split('name="add_manga[tags]"')[1].split('>')[1].split('<')[0];//textarea
      anime['.add_manga[priority]'] = getselect(data,'add_manga[priority]');
      anime['.add_manga[storage_type]'] = getselect(data,'add_manga[storage_type]');
      anime['.add_manga[num_retail_volumes]'] = data.split('name="add_manga[num_retail_volumes]"')[1].split('value="')[1].split('"')[0];
      anime['.add_manga[num_read_times]'] = data.split('name="add_manga[num_read_times]"')[1].split('value="')[1].split('"')[0];
      anime['.add_manga[reread_value]'] = getselect(data,'add_manga[reread_value]');
      anime['.add_manga[comments]'] = data.split('name="add_manga[comments]"')[1].split('>')[1].split('<')[0];
      anime['.add_manga[is_asked_to_discuss]'] = getselect(data,'add_manga[is_asked_to_discuss]');
      if(anime['.add_manga[is_asked_to_discuss]'] == '') anime['.add_manga[is_asked_to_discuss]'] = 0; //#15
      anime['.add_manga[sns_post_type]'] = getselect(data,'add_manga[sns_post_type]');
      anime['.submitIt'] = data.split('name="submitIt"')[1].split('value="')[1].split('"')[0];
      con.log('[GET] Object:', anime);
      return anime;
    }
  }
}
