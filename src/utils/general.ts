export function urlPart(url:string, part:number){
  try{
      return url.split("/")[part].split("?")[0];
    }catch(e){
      return undefined;
    }

}

export function getMalUrl(identifier: string, title: string, type: string, database: string){
  return firebase();

  function firebase(){
    var url = 'https://kissanimelist.firebaseio.com/Data2/'+database+'/'+encodeURIComponent(titleToDbKey(identifier)).toLowerCase()+'/Mal.json';
    con.log("Firebase", url);
    return api.request.xhr('GET', url).then((response) => {
      con.log("Firebase response",response.responseText);
      if(response.responseText !== 'null' && !(response.responseText.indexOf("error") > -1)){
        if(response.responseText.split('"')[1] == 'Not-Found'){
            return null;
        }
        return 'https://myanimelist.net/'+type+'/'+response.responseText.split('"')[1]+'/'+response.responseText.split('"')[3];;
      }else{
        return false;
      }
    });
  }

  //Helper
  function titleToDbKey(title) {
    if( window.location.href.indexOf("crunchyroll.com") > -1 ){
        return encodeURIComponent(title.toLowerCase().split('#')[0]).replace(/\./g, '%2E');
    }
    return title.toLowerCase().split('#')[0].replace(/\./g, '%2E');
  };
}

export function getselect(data, name){
    var temp = data.split('name="'+name+'"')[1].split('</select>')[0];
    if(temp.indexOf('selected="selected"') > -1){
        temp = temp.split('<option');
        for (var i = 0; i < temp.length; ++i) {
            if(temp[i].indexOf('selected="selected"') > -1){
                return temp[i].split('value="')[1].split('"')[0];
            }
        }
    }else{
        return '';
    }
}
