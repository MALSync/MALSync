export class myanimelistClass{
  readonly page: "detail"|null = null;

  //detail
  readonly id: number|null = null;
  readonly type: "anime"|"manga"|null = null;


  constructor(public url:string){
    var urlpart = utils.urlPart(url, 3);
    if(urlpart == 'anime' || urlpart == 'manga'){
      this.page = 'detail';
      this.id = utils.urlPart(url, 4);
      this.type = urlpart;
    }
  }

  init(){
    switch(this.page) {
      case 'detail':
        con.log(this);
        break;
      default:
        con.log('This page has no scipt')
    }
  }
}
