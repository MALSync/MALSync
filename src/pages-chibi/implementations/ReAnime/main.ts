import { PageInterface } from '../../pageInterface';

export const ReAnime: PageInterface = {
  name: "Re:ANIME",
  domain: "https://reanime.to",
  languages: ["English"],
  type: "anime",

  urls: {
  match: ["*://*.reanime.to/*"],

  player: {
    flixcloud: ["https://flixcloud.cc/e/*"],
  },
},

  search: "https://reanime.to/search?q={searchterm}",

  sync: {
    isSyncPage($c) {
  return $c
    .url()
    .urlParam("ep")
    .boolean()
    .run();
},

    getTitle($c) {
      return $c.querySelector('meta[name="keywords"]').getAttribute("content").regex("^[^,]+").ifNotReturn().trim().run();
    },

    getIdentifier($c) {
      return $c
        .url()
        .regex("/watch/([^/?#]+)", 1)
        .run();
    },

    getOverviewUrl($c) {
      return $c
        .string("/anime/")
        .concat($c.this("sync.getIdentifier").run())
        .urlAbsolute()
        .run();
    },

    getEpisode($c) {
      return $c
        .url()
        .urlParam("ep")
        .number()
        .run();
    },

    nextEpUrl($c) {
      return $c
        .coalesce(
          $c.querySelector('[data-next-episode]').run(),
          $c.querySelector('a[rel="next"], .next a').run(),
        )
        .ifNotReturn()
        .getAttribute("href")
        .urlAbsolute()
        .run();
    },

    uiInjection($c) {
      return $c
        .querySelector("h2")
        .parent()
        .uiAfter()
        .run();
    },

  },

  list: {
    elementsSelector($c) {
      return $c
        .querySelectorAll(
          "[data-episode], .episode-list a, .episode-item a"
        )
        .run();
    },

    elementUrl($c) {
      return $c
        .getAttribute("href")
        .urlAbsolute()
        .run();
    },

    elementEp($c) {
      return $c
        .getAttribute("data-episode")
        .number()
        .run();
    },
  },

  lifecycle: {
    setup($c) {
      return $c
        .addStyle(require("./style.less?raw").toString())
        .run();
    },

    ready($c) {
      return $c
        .domReady()
        .detectURLChanges($c.trigger().run())
        .run();
    },

    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector("[data-episodes-container]").ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};