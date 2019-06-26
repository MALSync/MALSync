import * as helper from "./helper";

export class entryClass{

  id: number;
  simklId: number = NaN;
  readonly type: "anime"|"manga";

  name: string = "";
  totalEp: number = NaN;
  totalVol?: number;
  addAnime: boolean = false;
  login: boolean = false;
  wrong: boolean = false;

  private animeInfo;

  constructor(public url:string, public miniMAL:boolean = false, public silent:boolean = false){
    this.type = utils.urlPart(url, 3);
    if(typeof url !== 'undefined' && url.indexOf("myanimelist.net") > -1){
      this.id = utils.urlPart(url, 4);
    }else if(typeof url !== 'undefined' && url.indexOf("simkl.com") > -1){
      this.id = NaN;
      this.simklId = utils.urlPart(url, 4);
    }else{
      this.id = NaN;
    }
  }

  init(){
    return this.update();
  };

  getDisplayUrl(){
    return 'https://simkl.com/'+this.type+'/'+this.simklId;
  }

  getMalUrl(){
    if(!isNaN(this.id)){
      return 'https://myanimelist.net/'+this.type+'/'+this.id+'/'+encodeURIComponent(this.name.replace(/\//,'_'));
    }
    return null;
  }

  async update(){
    con.log('Update Kitsu info', this.id? 'MAL: '+this.id : 'Simkl: '+this.simklId);
    if(isNaN(this.id)){
      var de = {id: this.simklId};
    }else{
      var de = {malId: this.id};
    }

    return helper.getSingle(de)
    .then((res) => {
      con.log(res);
      this.login = true;
      //helper.errorHandling(res, this.silent);
      this.animeInfo = res;

      this.addAnime = false;
      if(!this.animeInfo){
        this.addAnime = true;
      }

      if(isNaN(this.simklId)){
        this.simklId = this.animeInfo.show.ids.simkl
      }

      if(this.getEpisode() === NaN) this.setEpisode(0);
      this.setScore(this.getScore());

      this.name = this.animeInfo.show.title;
      this.totalEp = this.animeInfo.total_episodes_count;
    });

  }

  getEpisode(){
    return helper.getEpisode(this.animeInfo.last_watched);
  }

  setEpisode(ep:number){
    if(ep+'' === '') ep = 0;
    if(parseInt(ep+'') > this.totalEp && this.totalEp) ep = this.totalEp;
    this.animeInfo.last_watched = ep;
  }

  getVolume(){
    return false;
  }

  setVolume(ep:number){
    con.error('You cant set Volumes for animes');
  }

  getStatus(){
    if(this.addAnime) return 0;
    return helper.translateList(this.animeInfo.status);
  }

  setStatus(status:number){
    this.animeInfo.status = helper.translateList(status, parseInt(status.toString()));
  }

  getScore():any{
    var score = this.animeInfo.user_rating;
    if(score === 0) return '';
    return score;
  }

  setScore(score:any){
    this.animeInfo.user_rating = score;
  }

  getRewatching(): 1|0{
    return 0;
  }

  setRewatching(rewatching:1|0){

  }

  setCompletionDateToNow(){
  }

  setStartingDateToNow(){
  }

  getStreamingUrl(){
    var tags = this.animeInfo.private_memo;
    return utils.getUrlFromTags(tags);
  }

  setStreamingUrl(url:string){
    var tags = this.animeInfo.private_memo;

    tags = utils.setUrlInTags(url, tags);

    this.animeInfo.private_memo = tags;
  }

  async getRating(){
    return 'N/A';
  }

  getCacheKey(){
    return helper.getCacheKey(this.id, this.simklId);
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
    return 'https://simkl.in/posters/'+this.animeInfo.show.poster+'_ca.jpg';
  }

  clone() {
      const copy = new (this.constructor as { new () })();
      Object.assign(copy, this);
      copy.animeInfo = Object.assign( {},this.animeInfo);
      return copy;
  }

  sync(){
    /*var status = utils.status;
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
                    Add "${this.name}" to Kitsu?`;
        }

        if(this.type == 'anime'){
          url = "https://myanimelist.net/ownlist/anime/add?selected_series_id="+this.id;
          utils.flashConfirm(flashConfirmText, 'add', function(){
            continueCall();
          }, function(){
            wrongCall();
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
      async function continueCall(){
        var variables:any = {
          data:{
            attributes: {
              notes: This.listI().attributes.notes,
              progress: This.listI().attributes.progress,
              volumesOwned: This.listI().attributes.volumesOwned,
              reconsuming: This.listI().attributes.reconsuming,
              reconsumeCount: This.listI().attributes.reconsumeCount,
              ratingTwenty: This.listI().attributes.ratingTwenty,
              status: This.listI().attributes.status
            },
            type: "library-entries",
          }
        };
        ​if(!This.addAnime){
          var updateUrl = 'https://kitsu.io/api/edge/library-entries/'+This.listI().id;
          variables.data.id = This.listI().id;
          var post = 'PATCH';
        }else{
          var updateUrl = 'https://kitsu.io/api/edge/library-entries/';
          variables.data.relationships = {
            [This.type]: {
              data: {
                type: This.type,
                id: This.kitsuId
              }
            },
            user: {
              data: {
                type: "users",
                id: await helper.userId()
              }
            }
          }
          var post = 'POST';
        }

        con.log('[SET] Object:', variables);

        api.request.xhr(post, {
          url: updateUrl,
          headers: {
            'Authorization': 'Bearer ' + helper.accessToken(),
            'Content-Type': 'application/vnd.api+json',
            'Accept': 'application/vnd.api+json',
          },
          data: JSON.stringify(variables)
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
    });*/
  }

}
