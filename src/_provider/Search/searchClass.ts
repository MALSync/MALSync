/*
  Only create instances of this class in tests. Please use vueSearchClass instead if used in code.
 */

import {compareTwoStrings} from 'string-similarity';

import {search as pageSearch} from '../../provider/provider';

interface searchResult {
  id?: number;
  url: string;
  offset: number;
  provider: 'firebase'|'mal'|'page'|'user'|'sync';
  cache?: boolean;
  similarity: {
    same: boolean,
    value: number
  };
}

export class searchClass {
  private sanitizedTitel;
  private page;
  private syncPage;

  protected state: searchResult|false = false;

  changed: boolean = false;

  constructor(protected title: string, protected type: 'anime'|'manga'|'novel', protected identifier: string) {
    this.sanitizedTitel = this.sanitizeTitel(this.title);
  }

  setPage(page) {
    this.page = page;
  }

  setSyncPage(syncPage) {
    this.syncPage = syncPage;
  }

  getSyncPage() {
    return this.syncPage;
  }

  getUrl(): string|null {
    if(this.state) {
      return this.state.url;
    }
    return null;
  }

  setUrl(url, id = 0) {
    if(this.state) {
      if(this.state.url !== url) this.changed = true;
      this.state.provider = 'user';
      this.state.url = url;
      this.state.id = id;
      this.state.cache = false;
      this.state.similarity = {
        same: true,
        value: 1
      }
    }else{
      this.changed = true;
      this.state = {
        id: id,
        url: url,
        offset: 0,
        provider: 'user',
        similarity: {
          same: true,
          value: 1
        }
      }
    }

    this.setCache(this.state);
  }

  getOffset(): number {
    if(this.state) {
      return this.state.offset;
    }
    return 0;
  }

  setOffset(offset: number) {
    if(this.state) {
      if(this.state.offset !== offset) this.changed = true;
      this.state.offset = offset;
    }
    this.setCache(this.state);
  }

  async getCachedOffset(): Promise<number> {
    this.state = await this.getCache();
    if(this.state) {
      return this.state.offset;
    }
    return 0;
  }

  getId() {
    if(this.state && this.state.id) return this.state.id;
    return 0;
  }

  getSanitizedTitel() {
    return this.sanitizedTitel;
  }

  getNormalizedType() {
    if(this.type === 'anime') return 'anime';
    return 'manga';
  }

  public sanitizeTitel(title) {
    title = title.replace(/ *(\(dub\)|\(sub\)|\(uncensored\)|\(uncut\))/i, '');
    title = title.replace(/ *\([^\)]+audio\)/i, '');
    title = title.replace(/ BD( |$)/i, '');
    title = title.trim();
    return title;
  }

  public async search() {
    this.state = await this.getCache();

    if(!this.state) {
      this.state = await this.searchForIt();
    }

    if(!this.state || (this.state && !['user', 'firebase', 'sync'].includes(this.state.provider))) {
      var tempRes = await this.onsiteSearch();
      if(tempRes) this.state = tempRes;
    }

    if(this.state) {
      await this.setCache(this.state);
    }

    con.log('[SEARCH] Result', this.state);

    return this.state;
  }

  protected async getCache() {
    return api.storage.get(this.page.name+'/'+this.identifier+'/Search', null).then((state) => {
      if(state) state.cache = true;
      return state;
    });
  }

  protected setCache(cache) {
    cache = JSON.parse(JSON.stringify(cache));
    setTimeout(() => {
      this.databaseRequest();
    }, 200);
    return api.storage.set(this.page.name+'/'+this.identifier+'/Search', cache);
  }

  static similarity(externalTitle, title, titleArray: string[] = []) {
    var simi = compareTwoStrings(title.toLowerCase(), externalTitle.toLowerCase());
    titleArray.forEach((el) => {
      if(el) {
        var tempSimi = compareTwoStrings(title.toLowerCase(), el.toLowerCase());
        if(tempSimi > simi) simi = tempSimi;
      }
    })
    var found = false;
    if(simi > 0.6) {
      found = true;
    }

    return {
      same: found,
      value: simi
    };
  }

  public async searchForIt(): Promise<searchResult | false> {
    var result: searchResult | false = false;

    try {
      result = searchCompare(result, await this.malSync());
    }catch(e) {
      con.error('MALSync api down', e);
      result = searchCompare(result, await this.firebase());
    }


    if( (result && result.provider !== 'firebase') || !result ) {
      result = searchCompare(result, await this.malSearch());
    }

    if( (result && result.provider !== 'firebase') || !result ) {
      result = searchCompare(result, await this.pageSearch(), 0.5);
    }

    if(result && result.provider === 'firebase' && api.settings.get('syncMode') !== 'MAL' && !result.url) {
      var temp = await this.pageSearch();
      if(temp && !(temp.url.indexOf('myanimelist.net') !== -1) && temp.similarity.same) {
        con.log('[SEARCH] Ignore Firebase', result);
        result = temp;
      }
    }

    return result;

    function searchCompare(curVal, newVal, threshold = 0){

      if(curVal !== false && newVal !== false && newVal.similarity.value > threshold) {
        if(curVal.similarity.value >= newVal.similarity.value) return curVal;
        return newVal;
      }
      if(curVal !== false) return curVal;
      return newVal;
    }

  }

  public async firebase(): Promise<searchResult | false>{
    if(!this.page || !this.page.database) return false;
    var url = 'https://kissanimelist.firebaseio.com/Data2/'+this.page.database+'/'+encodeURIComponent(this.identifierToDbKey(this.identifier)).toLowerCase()+'/Mal.json';
    con.log("Firebase", url);
    return api.request.xhr('GET', url).then((response) => {
      con.log("Firebase response",response.responseText);
      if(response.responseText !== 'null' && !(response.responseText.indexOf("error") > -1)){
        var returnUrl:any = '';
        if(response.responseText.split('"')[1] == 'Not-Found'){
          returnUrl = '';
        }else{
          returnUrl = 'https://myanimelist.net/'+this.page.type+'/'+response.responseText.split('"')[1]+'/'+response.responseText.split('"')[3];
        }
        return {
          url: returnUrl,
          offset: 0,
          provider: 'firebase',
          similarity: {
            same: true,
            value: 1
          },
        };
      }else{
        return false;
      }
    });
  }

  public async malSync(): Promise<searchResult | false>{
    if(!this.page) return false;
    var dbPl = this.page.database ? this.page.database : this.page.name;
    var url = 'https://api.malsync.moe/page/'+dbPl+'/'+encodeURIComponent(this.identifierToDbKey(this.identifier)).toLowerCase();
    con.log("malSync", url);
    return api.request.xhr('GET', url).then((response) => {
      con.log("malSync response",response);
      if(response.status === 400 || response.status === 200) {
        if(response.status === 200 && response.responseText && !(response.responseText.indexOf("error") > -1)){
          var res = JSON.parse(response.responseText);
          if(typeof res.malUrl !== 'undefined') {
            return {
              url: res.malUrl,
              offset: 0,
              provider: 'firebase',
              similarity: {
                same: true,
                value: 1
              },
            };
          }else{
            return false;
          }
        }else{
          return false;
        }
      }else{
        throw 'malsync offline';
      }
    });
  }

  public malSearch(): Promise<searchResult | false>{
    var url = "https://myanimelist.net/"+this.getNormalizedType()+".php?q=" + encodeURI(this.sanitizedTitel);
    if(this.type === 'novel'){
      url = "https://myanimelist.net/"+this.getNormalizedType()+".php?type=2&q=" + encodeURI(this.sanitizedTitel);
    }
    con.log("malSearch", url);
    return api.request.xhr('GET', url).then((response) => {
      if(response.responseText !== 'null' && !(response.responseText.indexOf("  error ") > -1)){
        return handleResult(response, 1, this);
      }else{
        return false;
      }
    });

    function handleResult(response, i = 1, This){
      var link = getLink(response, i);
      var id = 0;
      var sim = {same: false, value: 0};
      if(link !== false){
        try{
          if(This.type === 'manga'){
            var typeCheck = response.responseText.split('href="'+link+'" id="si')[1].split('</tr>')[0];
            if(typeCheck.indexOf("Novel") !== -1){
              con.log('Novel Found check next entry')
              return handleResult(response, i+1, This);
            }
          }

          var malTitel = getTitle(response, link);
          sim = searchClass.similarity(malTitel, This.sanitizedTitel);
          id = parseInt(link.split('/')[4]);
        }catch(e){
          con.error(e);
        }

      }

      return {
        id: id,
        url: link,
        offset: 0,
        provider: 'mal',
        similarity: sim
      }
    }

    function getLink(response, i){
      try{
        return response.responseText.split('<a class="hoverinfo_trigger" href="')[i].split('"')[0];
      }catch(e){
        con.error(e);
        try{
          return response.responseText.split('class="picSurround')[i].split('<a')[1].split('href="')[1].split('"')[0];
        }catch(e){
          con.error(e);
          return false;
        }
      }
    }

    function getTitle(response, link){
      try{
        var id = link.split('/')[4];
        return response.responseText.split('rel="#sinfo'+id+'"><strong>')[1].split('<')[0];
      }catch(e){
        con.error(e);
        return '';
      }
    }
  }

  public async pageSearch(): Promise<searchResult | false>{
    const searchResult = await pageSearch(this.sanitizedTitel, this.getNormalizedType());
    var best:any = null;
    for(var i=0; i < searchResult.length && i < 5;i++) {
      var el = searchResult[i];
      const sim = searchClass.similarity(el.name, this.sanitizedTitel, el.altNames);
      var tempBest = {
        index: i,
        similarity: sim
      }
      if(
        (this.type === 'manga' && !el.isNovel) ||
        (this.type === 'novel' && el.isNovel) ||
        this.type === 'anime'
      ) {
        if(!best || sim.value > best.similarity.value) {
          best = tempBest;
        }
      }

    }

    if(best) {
      var retEl = searchResult[best.index];
      var url = await retEl.malUrl();
      return {
        id: retEl.id,
        url: url? url: retEl.url,
        offset: 0,
        provider: 'page',
        similarity: best.similarity
      }
    }

    return false;
  }

  public databaseRequest(){
    if(this.page && this.page.database && this.syncPage && this.state){
      if(this.state.cache) return;
      if(this.state.provider === 'user' && !this.changed) return;
      if(this.state.provider === 'firebase') return;

      var kissurl;
      if(!kissurl){
        if(this.page.isSyncPage(this.syncPage.url)){
          kissurl = this.page.sync.getOverviewUrl(this.syncPage.url);
        }else{
          kissurl = this.syncPage.url;
        }
      }
      var param = { Kiss: kissurl, Mal: this.state.url};
      if(this.state.provider === 'user'){
        if(!confirm(api.storage.lang('correction_DBRequest'))) return;
        param['newCorrection'] = true;
      }
      param['similarity'] = this.state.similarity;
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

  public async onsiteSearch(): Promise<false|searchResult> {
    if(this.page && this.syncPage && this.syncPage.curState && this.syncPage.curState.on){
      var result: false|string = false;
      if(this.syncPage.curState.on === 'OVERVIEW') {
        if(this.page.overview && this.page.overview.getMalUrl) {
          result = await this.page.overview.getMalUrl(api.settings.get('syncMode'));
        }
      }else{
        if(this.page.sync && this.page.sync.getMalUrl) {
          result = await this.page.sync.getMalUrl(api.settings.get('syncMode'));
        }
      }
      if(result) {
        con.log('[SEARCH]', 'Overwrite by onsite url', result);
        return {
          url: result,
          offset: 0,
          provider: 'sync',
          similarity: {
            same: true,
            value: 1
          },
        };
      }
    }
    return false;
  }

  public openCorrection() {
    /*Implemented in vueSearchClass*/
  }

  protected identifierToDbKey(title) {
    if( this.page.database === 'Crunchyroll' ){
        return encodeURIComponent(title.toLowerCase().split('#')[0]).replace(/\./g, '%2E');
    }
    return title.toLowerCase().split('#')[0].replace(/\./g, '%2E');
  };

}
