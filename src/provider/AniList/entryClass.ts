import * as helper from "./helper";

export class entryClass{

  id: number;
  private aniId: number = NaN;
  readonly type: "anime"|"manga";

  name: string = "";
  totalEp: number = NaN;
  totalVol?: number;
  addAnime: boolean = false;
  login: boolean = false;
  wrong: boolean = false;

  private displayUrl: string = '';

  private animeInfo;

  constructor(public url:string, public miniMAL:boolean = false, public silent:boolean = false){
    this.type = utils.urlPart(url, 3);
    if(typeof url !== 'undefined' && url.indexOf("myanimelist.net") > -1){
      this.id = utils.urlPart(url, 4);
    }else if(typeof url !== 'undefined' && url.indexOf("anilist.co") > -1){
      this.id = NaN;
      this.aniId = utils.urlPart(url, 4);
    }else{
      this.id = NaN;
    }
  }

  init(){
    return this.update();
  };

  getDisplayUrl(){
    return this.displayUrl !== '' && this.displayUrl != null ? this.displayUrl : this.url;
  }

  getMalUrl(){
    if(!isNaN(this.id)){
      return 'https://myanimelist.net/'+this.type+'/'+this.id+'/'+encodeURIComponent(this.name.replace(/\//,'_'));
    }
    return null;
  }

  update(){
    con.log('Update AniList info', this.id? 'MAL: '+this.id : 'AniList: '+this.aniId);
    var selectId = this.id;
    var selectQuery = 'idMal';
    if(isNaN(this.id)){
      selectId = this.aniId;
      selectQuery = 'id';
    }

    var query = `
    query ($id: Int, $type: MediaType) {
      Media (${selectQuery}: $id, type: $type) {
        id
        idMal
        siteUrl
        episodes
        chapters
        volumes
        averageScore
        coverImage{
          large
        }
        title {
          userPreferred
        }
        mediaListEntry {
          status
          progress
          progressVolumes
          score(format: POINT_10)
          repeat
          notes
        }
      }
    }
    `;
    ​
    var variables = {
      id: selectId,
      type: this.type.toUpperCase()
    };

    return api.request.xhr('POST', {
      url: 'https://graphql.anilist.co',
      headers: {
        'Authorization': 'Bearer ' + helper.accessToken(),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: JSON.stringify({
        query: query,
        variables: variables
      })
    }).then((response) => {
      var res = JSON.parse(response.responseText);
      con.log(res);
      this.login = true;
      helper.errorHandling(res, this.silent);
      this.animeInfo = res.data.Media;

      this.aniId = this.animeInfo.id;
      if(isNaN(this.id) && this.animeInfo.idMal){
        this.id = this.animeInfo.idMal;
      }
      this.displayUrl = this.animeInfo.siteUrl;
      this.addAnime = false;
      if(this.animeInfo.mediaListEntry === null){
        this.addAnime = true;
        this.animeInfo.mediaListEntry = {
          notes: "",
          progress: 0,
          progressVolumes: 0,
          repeat: 0,
          score: 0,
          status: 'PLANNING'
        }
      }

      this.name = this.animeInfo.title.userPreferred;
      this.totalEp = this.animeInfo.episodes? this.animeInfo.episodes: this.animeInfo.chapters;
      if(this.totalEp == null) this.totalEp = 0;
      if(typeof this.animeInfo.volumes != 'undefined'){
        this.totalVol = this.animeInfo.volumes;
        if(this.totalVol == null) this.totalVol = 0;
      }
    });

  }

  getEpisode(){
    return this.animeInfo.mediaListEntry.progress;
  }

  setEpisode(ep:number){
    if(ep+'' === '') ep = 0;
    this.animeInfo.mediaListEntry.progress = parseInt(ep+'');
  }

  getVolume(){
    if(this.type == "manga"){
      return this.animeInfo.mediaListEntry.progressVolumes;
    }
    return false;
  }

  setVolume(ep:number){
    if(this.type == "manga"){
      this.animeInfo.mediaListEntry.progressVolumes = ep;
      return;
    }
    con.error('You cant set Volumes for animes');
  }

  getStatus(){
    if(this.addAnime) return 0;
    return helper.translateList(this.animeInfo.mediaListEntry.status);
  }

  setStatus(status:number){
    if(this.animeInfo.mediaListEntry.status == 'REPEATING' && parseInt(status.toString()) == 1) return;
    this.animeInfo.mediaListEntry.status = helper.translateList(status, parseInt(status.toString()));
  }

  getScore(){
    if(this.animeInfo.mediaListEntry.score === 0) return '';
    return this.animeInfo.mediaListEntry.score;
  }

  setScore(score:any){
    if(score === '') score = 0;
    this.animeInfo.mediaListEntry.score = score;
  }

  getRewatching(): 1|0{
    if(this.animeInfo.mediaListEntry.status == 'REPEATING'){
      return 1;
    }
    return 0;
  }

  setRewatching(rewatching:1|0){
    if(rewatching == 1){
      this.animeInfo.mediaListEntry.status = 'REPEATING';
    }
  }

  setCompletionDateToNow(){
  }

  setStartingDateToNow(){
  }

  getStreamingUrl(){
    var tags = this.animeInfo.mediaListEntry.notes;
    return utils.getUrlFromTags(tags);
  }

  setStreamingUrl(url:string){
    var tags = this.animeInfo.mediaListEntry.notes;

    tags = utils.setUrlInTags(url, tags);

    this.animeInfo.mediaListEntry.notes = tags;
  }

  async getRating(){
    if(this.animeInfo.averageScore == null) return 'N/A';
    return this.animeInfo.averageScore;
  }

  getCacheKey(){
    return helper.getCacheKey(this.id, this.aniId);
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
    return this.animeInfo.coverImage.large;
  }

  clone() {
      const copy = new (this.constructor as { new () })();
      Object.assign(copy, this);
      copy.animeInfo = Object.assign( {},this.animeInfo);
      copy.animeInfo.mediaListEntry = Object.assign( {},this.animeInfo.mediaListEntry);
      return copy;
  }

  sync(){
    var status = utils.status;
    return new Promise((resolve, reject) => {
      var This = this;
      var url = "https://myanimelist.net/ownlist/"+this.type+"/"+this.id+"/edit";
      if(this.addAnime){
        if(this.silent){
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
                    Add "${this.name}" to AniList?`;
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
            continueCall();
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

        var query = `
          mutation ($mediaId: Int, $status: MediaListStatus, $progress: Int, $scoreRaw: Int, $notes: String) {
            SaveMediaListEntry (mediaId: $mediaId, status: $status, progress: $progress, scoreRaw: $scoreRaw, notes: $notes) {
              id
              status
              progress
            }
          }
        `;
        ​
        var variables = {
            "mediaId": This.aniId,
            "status": This.animeInfo.mediaListEntry.status,
            "progress": This.animeInfo.mediaListEntry.progress,
            "scoreRaw": This.animeInfo.mediaListEntry.score * 10,
            "notes": This.animeInfo.mediaListEntry.notes
        };

        if(This.type == 'manga'){
          query = `
            mutation ($mediaId: Int, $status: MediaListStatus, $progress: Int, $scoreRaw: Int, $notes: String, $volumes: Int) {
              SaveMediaListEntry (mediaId: $mediaId, status: $status, progress: $progress, scoreRaw: $scoreRaw, notes: $notes, progressVolumes: $volumes) {
                id
                status
                progress
                progressVolumes
              }
            }
          `;
          variables['volumes'] = This.animeInfo.mediaListEntry.progressVolumes;
        }

        con.log('[SET] Object:', variables);

        api.request.xhr('POST', {
          url: 'https://graphql.anilist.co',
          headers: {
            'Authorization': 'Bearer ' + helper.accessToken(),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          data: JSON.stringify({
            query: query,
            variables: variables
          })
        }).then((response) => {
          var res = JSON.parse(response.responseText);
          con.log(res);
          helper.errorHandling(res, This.silent);
          con.log('Update Succeeded');
          resolve();
        }).catch((e)=>{
          reject(e);
        });

      }
    });
  }

}
