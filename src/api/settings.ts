export var settingsObj = {
  options: {
    autoTrackingModeanime: 'video',
    autoTrackingModemanga: 'instant',
    forceEn: false,
    userscriptMode: false,
    syncMode: 'MAL',
    localSync: true,
    delay: 0,
    videoDuration: 85,
    malTags: true,
    malContinue: true,
    malResume: true,
    epPredictions: true,

    theme: 'light',
    minimalWindow: false,
    posLeft: 'left',
    miniMALonMal: false,
    floatButtonStealth: false,
    floatButtonHide: false,
    autoCloseMinimal: false,
    outWay: true,
    miniMalWidth: '500px',
    miniMalHeight: '90%',
    malThumbnail: 100,
    friendScore: true,

    SiteSearch: true,
    '9anime': true,
    Crunchyroll: true,
    Gogoanime: true,
    Kissanime: true,
    Masterani: true,
    Animeheaven: true,
    Twistmoe: true,
    Anime4you: true,
    Kissmanga: true,
    Mangadex: true,
    Mangarock: true,
    Netflix: true,
    Proxeranime: true,
    Proxermanga: true,
    Novelplanet: true,

    autofull: false,
    autoresume: false,
    introSkip: 85,

    updateCheckNotifications: true,

    'anilistToken': '',
    'kitsuToken': '',
    'simklToken': ''
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

      api.storage.storageOnChanged((changes, namespace) => {
        if(namespace === 'sync'){
          for (var key in changes) {
            var storageChange = changes[key];
            if(/^settings\//i.test(key)){
              this.options[key.replace('settings/','')] = storageChange.newValue;
              con.info('Update '+key+' option to '+storageChange.newValue);
            }
          }
        }
      });

    });
  },

  get: function(name: string){
    return this.options[name];
  },

  set: function(name: string, value: any){
    if(this.options.hasOwnProperty(name)){
      this.options[name] = value;
      return api.storage.set('settings/'+name, value);
    }else{
      con.error(name+' is not a defined option');
    }
  },

  getAsync: async function(name: string){
    var value = await api.storage.get('settings/'+name);
    if(typeof value === 'undefined' && typeof this.options[name] !== undefined) return this.options[name];
    return value;
  }

}
