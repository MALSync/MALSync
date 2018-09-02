export class settingsClass{
  options = {
    test: 1,
    test2: 2,
  }

  async init(){
    for (var key in this.options) {
      var store = await api.storage.get('settings/'+key);
      if(typeof store != 'undefined'){
        this.options[key] = store;
        con.error(store);
      }
    }
    return this;
  }

  get(name: string){
    return this.options[name];
  }

  set(name: string, value: any){
    if(this.options.hasOwnProperty(name)){
      this.options[name] = value;
      api.storage.set('settings/'+name, value);
    }else{
      con.error(name+' is not a defined option');
    }
  }

}
