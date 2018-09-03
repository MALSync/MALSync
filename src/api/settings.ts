export var settingsObj = {
  options: {
    test: 1,
    test2: 2,
  },

  init: async function (){
    return new Promise(async (resolve, reject) => {
      for (var key in this.options) {
        var store = await api.storage.get('settings/'+key);
        if(typeof store != 'undefined'){
          this.options[key] = store;
        }
      }
      con.log('Settings', this.options);
      resolve(this);
    });
  },

  get: function(name: string){
    return this.options[name];
  },

  set: function(name: string, value: any){
    if(this.options.hasOwnProperty(name)){
      this.options[name] = value;
      api.storage.set('settings/'+name, value);
    }else{
      con.error(name+' is not a defined option');
    }
  }

}
