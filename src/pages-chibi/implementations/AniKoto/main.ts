import type { ChibiGenerator, ChibiJson } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';
import { anikoto as anikotoSite } from './anikoto';
import { kotoplay } from './kotoplay';

const FRONTEND_KEY = 'anikotoIsKotoplay';

function isKotoplay($c: ChibiGenerator<unknown>) {
  return $c.getGlobalVariable(FRONTEND_KEY).boolean().run();
}

function route<T>(
  $c: ChibiGenerator<unknown>,
  kotoplayScript: ChibiJson<T>,
  anikotoScript: ChibiJson<T>,
) {
  return $c.if(isKotoplay($c), kotoplayScript, anikotoScript).run();
}

function routeElement<T>(
  $c: ChibiGenerator<Element>,
  kotoplayFn: ($c: ChibiGenerator<Element>) => ChibiJson<T>,
  anikotoFn: ($c: ChibiGenerator<Element>) => ChibiJson<T>,
) {
  return $c
    .if(
      isKotoplay($c as ChibiGenerator<unknown>),
      $c.target().ifThen(kotoplayFn).run() as ChibiJson<T>,
      $c.target().ifThen(anikotoFn).run() as ChibiJson<T>,
    )
    .run();
}

export const anikoto: PageInterface = {
  name: 'AniKoto',
  domain: 'https://anikoto.cz',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: [...anikotoSite.urls.match, ...kotoplay.urls.match],
    player: {
      megaplay: ['*://vidwish.live/*', '*://megaplay.buzz/*'],
      vidtube: ['*://vidtube.site/*'],
    },
  },
  search: 'https://anikoto.cz/filter?keyword={searchtermPlus}',
  sync: {
    isSyncPage: $c => route($c, kotoplay.sync.isSyncPage($c), anikotoSite.sync.isSyncPage($c)),
    getTitle: $c => route($c, kotoplay.sync.getTitle($c), anikotoSite.sync.getTitle($c)),
    getIdentifier: $c =>
      route($c, kotoplay.sync.getIdentifier($c), anikotoSite.sync.getIdentifier($c)),
    getOverviewUrl: $c =>
      route($c, kotoplay.sync.getOverviewUrl($c), anikotoSite.sync.getOverviewUrl($c)),
    getEpisode: $c => route($c, kotoplay.sync.getEpisode($c), anikotoSite.sync.getEpisode($c)),
    getImage: $c => route($c, kotoplay.sync.getImage!($c), anikotoSite.sync.getImage!($c)),
    uiInjection: $c => route($c, kotoplay.sync.uiInjection!($c), anikotoSite.sync.uiInjection!($c)),
    nextEpUrl: $c => route($c, kotoplay.sync.nextEpUrl!($c), anikotoSite.sync.nextEpUrl!($c)),
    getMalUrl: $c => route($c, kotoplay.sync.getMalUrl!($c), anikotoSite.sync.getMalUrl!($c)),
  },
  list: {
    elementsSelector: $c =>
      route($c, kotoplay.list!.elementsSelector($c), anikotoSite.list!.elementsSelector($c)),
    elementUrl: $c => routeElement($c, kotoplay.list!.elementUrl!, anikotoSite.list!.elementUrl!),
    elementEp: $c => routeElement($c, kotoplay.list!.elementEp, anikotoSite.list!.elementEp),
  },
  lifecycle: {
    setup: $c =>
      $c
        .setGlobalVariable(FRONTEND_KEY, $c.url().urlPart(2).contains('kotoplay').run())
        .if(isKotoplay($c), kotoplay.lifecycle.setup($c), anikotoSite.lifecycle.setup($c))
        .run(),
    ready: $c => route($c, kotoplay.lifecycle.ready($c), anikotoSite.lifecycle.ready($c)),
    syncIsReady: $c =>
      route($c, kotoplay.lifecycle.syncIsReady!($c), anikotoSite.lifecycle.syncIsReady!($c)),
  },
};
