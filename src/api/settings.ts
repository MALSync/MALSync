export var settingsObj = {
  options: {
    autoTrackingModeanime: 'video',
    autoTrackingModemanga: 'instant',
    enablePages: {},
    forceEn: false,
    presenceHidePage: false,
    userscriptMode: false,
    strictCookies: false,
    syncMode: 'MAL',
    syncModeSimkl: 'MAL',
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
    minimizeBigPopup: false,
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
    MangaNelo: true,
    Netflix: true,
    Proxeranime: true,
    Proxermanga: true,
    Novelplanet: true,
    Aniwatch: true,

    autofull: false,
    autoresume: false,
    autoNextEp: false,
    highlightAllEp: false,

    introSkip: 85,
    introSkipFwd: [17,39],
    introSkipBwd: [17,37],
    nextEpShort: [],
    correctionShort: [67],

    updateCheckNotifications: true,

    'anilistToken': '',
    'anilistOptions': {
      displayAdultContent: true,
      scoreFormat: 'POINT_10',
    },
    'kitsuToken': '',
    'kitsuOptions': {
      titleLanguagePreference: 'canonical',
      sfwFilter: false,
      ratingSystem: "regular"
    },
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
        if(namespace === 'local' && changes['rateLimit']) {
          try {
            if(changes['rateLimit'].newValue){
              con.log("Rate limited");
              utils.flashm("Rate limited. Retrying in a moment", {
                error: true,
                type: 'rate',
                permanent: true,
              })
            }else{
              con.log("No Rate limited");
              $('.type-rate').remove();
            }
          } catch(e) {
            con.error(e);
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
