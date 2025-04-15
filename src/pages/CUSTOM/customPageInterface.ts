import { collectorConfig } from '../../utils/mangaProgress/ModeFactory';

interface customMangaProgressConfig {
  condition?: string | boolean;
  current: collectorConfig;
  total: collectorConfig;
}

export interface customPageInterface {
  style?: string;
  isOverviewPage?: boolean;
  getImage?: boolean;
  sync: {
    getVolume?: boolean;
    nextEpUrl?: boolean;
    uiSelector?: boolean;
    getMalUrl?: boolean;
    readerConfig?: customMangaProgressConfig[]; // (optional) Usd to get the current reading progress of a manga chapter
  };
  overview?: {
    getMalUrl?: boolean;
    list?: {
      offsetHandler: boolean;
      elementUrl?: boolean;
      paginationNext?: boolean;
      handleListHook?: boolean;
      getTotal?: boolean;
    };
  };
}
