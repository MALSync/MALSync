import {compareTwoStrings} from 'string-similarity';

interface searchResult {
  url: string;
  offset: number;
  similarity: number;
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

  protected identifierToDbKey(title) {
    if( this.page.database === 'Crunchyroll' ){
        return encodeURIComponent(title.toLowerCase().split('#')[0]).replace(/\./g, '%2E');
    }
    return title.toLowerCase().split('#')[0].replace(/\./g, '%2E');
  };

}
