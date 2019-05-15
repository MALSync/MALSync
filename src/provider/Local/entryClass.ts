// local://crunchyroll/anime/nogamenolife

export class entryClass{

  readonly id: number;
  readonly type: "anime"|"manga";

  url = '';

  name: string = "";
  totalEp: number = NaN;
  totalVol?: number;
  addAnime: boolean = false;
  login: boolean = false;
  wrong: boolean = false;
  pending: boolean = false;

  private animeInfo;

  constructor(private key:string, public miniMAL:boolean = false, private state:any = null){
    this.url = key;
    this.id = utils.urlPart(key, 4);
    this.type = utils.urlPart(key, 3);
  }

  init(){
    return this.update();
  };

  getDisplayUrl(){
    return this.key;
  }

  getMalUrl(){
    return null;
  }

  async update(){
    con.log('Update MAL info', this.key, this.state);
    this.login = true;
    this.addAnime = false;


    this.totalEp = 0;
    this.totalVol = 0;

    this.animeInfo = await api.storage.get(this.key , null);

    if(this.animeInfo === 'undefined' || this.animeInfo === null || !this.animeInfo){
      if(this.state == null){
        con.error('No state found')
        this.state = {
          title: 'Unknown',
        }
      }
      this.addAnime = true;
      this.animeInfo = {
        name: this.state!.title,
        tags: "",
        progress: 0,
        volumeprogress: 0,
        rewatching: false,
        rewatchingCount: 0,
        score: '',
        status: 6
      }
    }else if(this.state !== null){
      this.animeInfo.name = this.state!.title;
    }

    this.name = this.animeInfo.name;

    con.error('lol', this.animeInfo);
  }

  getEpisode(){
    return this.animeInfo.progress;
  }

  setEpisode(ep:number){
    if(ep+'' === '') ep = 0;
    this.animeInfo.progress = parseInt(ep+'');
  }

  getVolume(){
    if(this.type == "manga"){
      return this.animeInfo.volumeprogress;
    }
    return false;
  }

  setVolume(ep:number){
    if(this.type == "manga"){
      this.animeInfo.volumeprogress = ep;
      return;
    }
    con.error('You cant set Volumes for animes');
  }

  getStatus(){
    return this.animeInfo.status;
  }

  setStatus(status:number){
    this.animeInfo.status = status;
  }

  getScore(){
    return this.animeInfo.score;
  }

  setScore(score:number){
    this.animeInfo.score = score;
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
  }

  setStartingDateToNow(){
  }

  getStreamingUrl(){
    var tags = this.animeInfo.tags;
    return utils.getUrlFromTags(tags);
  }

  setStreamingUrl(url:string){
    var tags = this.animeInfo.tags;
    tags = utils.setUrlInTags(url, tags);
    this.animeInfo.tags = tags;
  }

  async getRating(){
    return 'Local';
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
    return api.storage.assetUrl('questionmark.gif');
  }

  clone() {
      const copy = new (this.constructor as { new () })();
      Object.assign(copy, this);
      copy.animeInfo = Object.assign( {},this.animeInfo);
      return copy;
  }

  delete(){
    return api.storage.remove(this.key);
  }

  sync(){
    var status = utils.status;
    return new Promise((resolve, reject) => {
      var This = this;
      if(this.addAnime){
        var imgSelector = 'malSyncImg'+this.id;

        var flashConfirmText = `Add "${this.name}" to MAL?`;

        utils.flashConfirm(flashConfirmText, 'add', function(){
          continueCall();
        }, function(){
          wrongCall();
        });


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
      async function continueCall(){
        con.log('[SET] Object:', This.animeInfo);

        await api.storage.set(This.key , This.animeInfo);

        resolve();

      }
    });
  }
}
