import * as helper from "./helper";

export class entryClass{

  id: number;
  private kitsuSlug: string = '';
  private kitsuId: number = NaN;
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
    }else if(typeof url !== 'undefined' && url.indexOf("kitsu.io") > -1){
      this.id = NaN;
      this.kitsuSlug = utils.urlPart(url, 4);
    }else{
      this.id = NaN;
    }
  }

  init(){
    return this.update();
  };

  getDisplayUrl(){
    return 'https://kitsu.io/'+this.type+'/'+this.animeI().attributes.slug;
  }

  listI(){
    return this.animeInfo.data[0];
  }

  animeI(){
    return this.animeInfo.included[0];
  }

  async update(){
    con.log('Update Kitsu info', this.id? 'MAL: '+this.id : 'Kitsu: '+this.kitsuId);
    if(isNaN(this.kitsuId)){
       var kitsuRes = await helper.malToKitsu(this.id, this.type);
       this.kitsuId = kitsuRes.data[0].relationships.item.data.id;
    }

    return api.request.xhr('GET', {
      url: 'https://kitsu.io/api/edge/library-entries?filter[user_id]=137140&filter[kind]='+this.type+'&filter['+this.type+'_id]='+this.kitsuId+'&page[limit]=1&page[limit]=1&include='+this.type+'&fields['+this.type+']=slug,titles,averageRating,posterImage,'+(this.type == 'anime'? 'episodeCount': 'chapterCount,volumeCount'),
      headers: {
        'Authorization': 'Bearer ' + helper.accessToken(),
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      data: {},
    }).then((response) => {
      var res = JSON.parse(response.responseText);
      con.log(res);
      this.login = true;
      helper.errorHandling(res, this.silent);
      this.animeInfo = res;

      this.addAnime = false;
      if(!this.animeInfo.data.length){
        this.addAnime = true;
        this.animeInfo.data[0] = {
          attributes: {
            notes: "",
            progress: 0,
            volumesOwned: 0,
            reconsuming: false,
            reconsumeCount: false,
            ratingTwenty: null,
            status: 'planned'
          }
        }
        this.animeInfo.included = kitsuRes.included;
      }

      this.name = this.animeI().attributes.titles.en;
      this.totalEp = this.animeI().attributes.episodeCount? this.animeI().attributes.episodeCount: this.animeI().attributes.chapterCount;
      if(this.animeI().attributes.volumeCount){
        this.totalVol = this.animeI().attributes.volumeCount;
      }
    });

  }

  getEpisode(){
    return this.listI().attributes.progress;
  }

  setEpisode(ep:number){
    if(ep+'' === '') ep = 0;
    this.listI().attributes.progress = parseInt(ep+'');
  }

  getVolume(){
    if(this.type == "manga"){
      return this.listI().attributes.volumesOwned;
    }
    return false;
  }

  setVolume(ep:number){
    if(this.type == "manga"){
      this.listI().attributes.volumesOwned = ep;
      return;
    }
    con.error('You cant set Volumes for animes');
  }

  getStatus(){
    if(this.addAnime) return 0;
    return helper.translateList(this.listI().attributes.status);
  }

  setStatus(status:number){
    this.listI().attributes.status = helper.translateList(status, parseInt(status.toString()));
  }

  getScore(){
    return this.listI().attributes.ratingTwenty/2;
  }

  setScore(score:number){
    if(score == 0){
      this.listI().attributes.ratingTwenty = null;
      return;
    }
    this.listI().attributes.ratingTwenty = score*2;
  }

  getRewatching(): 1|0{
    if(this.listI().attributes.reconsuming){
      return 1;
    }
    return 0;
  }

  setRewatching(rewatching:1|0){
    if(rewatching == 1){
      this.listI().attributes.reconsuming = true;
      return;
    }
    this.listI().attributes.reconsuming = false;
  }

  setCompletionDateToNow(){
  }

  setStartingDateToNow(){
  }

  getStreamingUrl(){
    var tags = this.listI().attributes.notes;
    return utils.getUrlFromTags(tags);
  }

  setStreamingUrl(url:string){
    var tags = this.listI().attributes.notes;

    tags = utils.setUrlInTags(url, tags);

    this.listI().attributes.notes = tags;
  }

  async getRating(){
    if(this.animeI().attributes.averageRating == null) return 'N/A';
    return this.animeI().attributes.averageRating+'%';
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
    return this.animeI().attributes.posterImage.large;
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
                    Add "${this.name}" to Kitsu?`;
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
            anime: {
              data: {
                type: This.type,
                id: This.kitsuId
              }
            },
            user: {
              data: {
                type: "users",
                id: "137140"
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
        });

      }
    });
  }

}
