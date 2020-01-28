import {compareTwoStrings} from 'string-similarity';

interface searchResult {
  url: string;
  offset: number;
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

  static similarity(externalTitle, title) {
    var simi = compareTwoStrings(title.toLowerCase(), externalTitle.toLowerCase());
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
          similarity: 1,
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

  protected identifierToDbKey(title) {
    if( this.page.database === 'Crunchyroll' ){
        return encodeURIComponent(title.toLowerCase().split('#')[0]).replace(/\./g, '%2E');
    }
    return title.toLowerCase().split('#')[0].replace(/\./g, '%2E');
  };

}
