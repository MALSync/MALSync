export class simklClass{

  private interval;

  constructor(public url:string){
    utils.urlChangeDetect(() => {
      con.log(this.url);
      this.interval = utils.waitUntilTrue(function(){
        return (!$('#global_div').length || parseInt($('#global_div').css('opacity')) === 1) &&
        (!$('#tvMainTable').length || parseInt($('#tvMainTable').css('opacity')) === 1);
      }, () => {
        this.url = window.location.href;
        this.init();
      }, 1000)
    });

    api.storage.addStyle(require('./style.less').toString());
    this.init();
  }

  init(){
    con.info('Init');
  }

}
