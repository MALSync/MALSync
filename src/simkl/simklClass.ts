export class simklClass{
  constructor(public url:string){
    utils.urlChangeDetect(() => {
      this.url = window.location.href;
      this.init();
    });

    api.storage.addStyle(require('./style.less').toString());
  }

  init(){
    con.log(this.url);
  }

}
