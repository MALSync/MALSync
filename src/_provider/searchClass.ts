import {compareTwoStrings} from 'string-similarity';

import {search as pageSearch} from '../provider/provider';

import correctionApp from './correctionApp.vue';

import Vue from 'vue';

interface searchResult {
  url: string;
  offset: number;
  provider: 'firebase'|'mal'|'page';
  similarity: {
    same: boolean,
    value: number
  };
}

export class searchClass {
  private sanitizedTitel;
  private page;

  constructor(protected title: string, protected type: 'anime'|'manga'|'novel', protected identifier: string) {
    this.sanitizedTitel = this.sanitizeTitel(this.title);
  }

  setPage(page) {
    this.page = page;
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

  static similarity(externalTitle, title, titleArray: string[] = []) {
    var simi = compareTwoStrings(title.toLowerCase(), externalTitle.toLowerCase());
    titleArray.forEach((el) => {
      if(el) {
        var tempSimi = compareTwoStrings(title.toLowerCase(), el.toLowerCase());
        if(tempSimi > simi) simi = tempSimi;
      }
    })
    var found = false;
    if(simi > 0.5) {
      found = true;
    }
    console.log(simi);
    return {
      same: found,
      value: simi
    };
  }

  public async searchForIt(): Promise<searchResult | false> {
    var result: searchResult | false = false;

    result = searchCompare(result, await this.firebase());

    if( (result && result.provider !== 'firebase') || !result ) {
      result = searchCompare(result, await this.malSearch());
    }

    if( (result && result.provider !== 'firebase') || !result ) {
      result = searchCompare(result, await this.pageSearch(), 0.5);
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
        }catch(e){
          con.error(e);
        }

      }

      return {
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
        url: url? url: retEl.url,
        offset: 0,
        provider: 'page',
        similarity: best.similarity
      }
    }

    return false;
  }

  public openCorrection() {
    var flasmessage = utils.flashm('<div class="shadow"></div>', {permanent: true, position: "top", type: 'correction'});

    var shadow = flasmessage.find('.shadow').get(0)!.attachShadow({mode: 'open'});

    shadow.innerHTML = (`
      <style>
        ${require('!to-string-loader!css-loader!less-loader!./correctionStyle.less').toString()}
      </style>
      <div id="correctionApp"></div>
      `);
    let element = flasmessage.find('.shadow').get(0)!.shadowRoot!.querySelector('#correctionApp')!;
    var minimalVue = new Vue({
      el: element ,
      render: h => h(correctionApp)
    })
  }

  protected identifierToDbKey(title) {
    if( this.page.database === 'Crunchyroll' ){
        return encodeURIComponent(title.toLowerCase().split('#')[0]).replace(/\./g, '%2E');
    }
    return title.toLowerCase().split('#')[0].replace(/\./g, '%2E');
  };

}
