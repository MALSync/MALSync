import { PageInterface } from './pageInterface';

import { animeav1 } from './implementations/animeav1/main';
import { anicrush } from './implementations/anicrush/main';
import { mangaNato } from './implementations/mangaNato/main';
import { gojo } from './implementations/gojo/main';
import { animeLib } from './implementations/animeLib/main';
import { mangaLib } from './implementations/mangaLib/main';
import { ranobeLib } from './implementations/ranobeLib/main';
import { anizm } from './implementations/anizm/main';
import { toonily } from './implementations/toonily/main';
import { voidScans } from './implementations/VoidScans/main';
import { AniXL } from './implementations/AniXL/main';
import { bato } from './implementations/bato/main';
import { Crunchyroll } from './implementations/Crunchyroll/main';
import { animevost } from './implementations/animevost/main';
import { AnimeKAI } from './implementations/AnimeKAI/main';
import { WeebCentral } from './implementations/WeebCentral/main';

export const pages: { [key: string]: PageInterface } = {
  animeav1,
  anicrush,
  mangaNato,
  gojo,
  animeLib,
  mangaLib,
  ranobeLib,
  anizm,
  toonily,
  voidScans,
  AniXL,
  bato,
  Crunchyroll,
  animevost,
  AnimeKAI,
  WeebCentral,
};
