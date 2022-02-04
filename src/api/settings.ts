export const settingsObj = {
  options: {
    autoTrackingModeanime: 'video',
    autoTrackingModemanga: 'instant',
    enablePages: {},
    forceEn: false,
    rpc: true,
    presenceLargeImage: 'cover',
    presenceShowButtons: true,
    userscriptModeButton: false,
    syncMode: 'MAL',
    syncModeSimkl: 'MAL',
    localSync: true,
    delay: 0,
    videoDuration: 85,
    malTags: false,
    malContinue: true,
    malResume: true,
    usedPage: true,
    epPredictions: true,

    theme: 'auto',
    minimalWindow: false,
    posLeft: 'left',
    miniMALonMal: false,
    floatButtonStealth: false,
    minimizeBigPopup: false,
    floatButtonCorrection: false,
    floatButtonHide: false,
    autoCloseMinimal: false,
    outWay: true,
    miniMalWidth: '500px',
    miniMalHeight: '90%',
    malThumbnail: 100,
    friendScore: true,
    loadPTWForProgress: false,

    quicklinks: [
      '9anime',
      'Crunchyroll',
      'Gogoanime',
      'Twistmoe',
      'Mangadex',
      'MangaNato',
      'AnimeSimple',
      'MangaFox',
      'MangaSee',
      'YugenAnime',
      'AniMixPlay',
      'Zoro',
      'Funimation',
      'Hulu',
      'Netflix',
      'Hidive',
      'Vrv',
      'VIZ',
      'MangaPlus',
      'MangaReader',
    ],
    quicklinksPosition: 'default',

    autofull: false,
    autoresume: false,
    autoNextEp: false,
    highlightAllEp: false,
    checkForFiller: true,
    crashReport: true,

    introSkip: 85,
    introSkipFwd: [17, 39],
    introSkipBwd: [17, 37],
    nextEpShort: [],
    correctionShort: [67],
    syncShort: [],

    progressInterval: 120,
    progressIntervalDefaultAnime: 'en/sub',
    progressIntervalDefaultManga: 'en/sub',
    progressNotifications: true,

    bookMarksList: false,

    customDomains: [],

    anilistToken: '',
    anilistOptions: {
      displayAdultContent: true,
      scoreFormat: 'POINT_10',
    },
    kitsuToken: '',
    kitsuOptions: {
      titleLanguagePreference: 'canonical',
      sfwFilter: false,
      ratingSystem: 'regular',
    },
    simklToken: '',

    malToken: '',
    malRefresh: '',
  },

  async init() {
    const tempSettings = [];
    for (const key in this.options) {
      const store = await api.storage.get(`settings/${key}`);
      if (typeof store !== 'undefined') {
        this.options[key] = store;
        tempSettings[key] = /(token|refresh)/i.test(key) && store ? '********' : store;
      }
    }
    con.log('Settings', tempSettings);

    let rateDebounce;

    api.storage.storageOnChanged((changes, namespace) => {
      if (namespace === 'sync') {
        for (const key in changes) {
          const storageChange = changes[key];
          if (/^settings\//i.test(key)) {
            this.options[key.replace('settings/', '')] = storageChange.newValue;
            con.info(`Update ${key} option to ${storageChange.newValue}`);
          }
        }
      }
      if (namespace === 'local' && changes.rateLimit) {
        try {
          clearTimeout(rateDebounce);
          if (changes.rateLimit.newValue) {
            con.log('Rate limited');
            if (!$('.type-rate').length) {
              utils.flashm('Rate limited. Retrying in a moment', {
                error: true,
                type: 'rate',
                permanent: true,
              });
            }
          } else {
            rateDebounce = setTimeout(() => {
              con.log('No Rate limited');
              $('.type-rate').remove();
            }, 5000);
          }
        } catch (e) {
          con.error(e);
        }
      }
    });

    return this;
  },

  get(name: string) {
    return this.options[name];
  },

  set(name: string, value: any) {
    if (!Object.prototype.hasOwnProperty.call(this.options, name)) {
      const err = Error(`${name} is not a defined option`);
      con.error(err);
      throw err;
    }

    this.options[name] = value;
    return api.storage.set(`settings/${name}`, value);
  },

  async getAsync(name: string) {
    const value = await api.storage.get(`settings/${name}`);
    if (typeof value === 'undefined' && typeof this.options[name] !== 'undefined') return this.options[name];
    return value;
  },
};
