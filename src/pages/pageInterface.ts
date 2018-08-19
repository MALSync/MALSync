export interface pageInterface {
    domain: string,
    type: "anime"|"manga",
    isSyncPage: () => boolean,
    sync:{
      getTitle: () => string,
      getIdentifier: () => string,
      getEpisode: () => number,
      getVolume?: () => number,
    }
}
