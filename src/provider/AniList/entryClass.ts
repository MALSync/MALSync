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
      if(this.animeInfo.volumes){
        this.totalVol = this.animeInfo.volumes;
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
    return this.animeInfo.mediaListEntry.score;
  }

  setScore(score:number){
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
    return this.animeInfo.averageScore;
  }

  async setResumeWaching(url:string, ep:number){
    return utils.setResumeWaching(url, ep, this.type, this.id);
  }

  async getResumeWaching():Promise<{url:string, ep:number}>{
    return utils.getResumeWaching(this.type, this.id)
  }

  async setContinueWaching(url:string, ep:number){
    return utils.setContinueWaching(url, ep,this.type, this.id)
  }

  async getContinueWaching():Promise<{url:string, ep:number}>{
    return utils.getContinueWaching(this.type, this.id)
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
        var imgSelector = 'malSyncImg'+this.id;
        var flashConfirmText = `
          Is "${this.name}" correct?
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

          j.$('.Yes').text('YES');
          j.$('.Cancel').text('NO');
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


        //TODO progressVolumes
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
        });

      }
    });
  }

}
