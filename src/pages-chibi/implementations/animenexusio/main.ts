import { PageInterface } from "src/pages-chibi/pageInterface";

export const animenexusio: PageInterface = {
  name: "animenexusio",
  domain: "https://anime-nexus.io",
  languages: ["Romanian"],
  type: "anime",
  urls: {
    match: ["*://*.anime-nexus.io/*"],
  },
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(6).boolean().run();
    },
    getTitle($c) {
      return $c.querySelector("h1").text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(5).run();
    },
    getOverviewUrl($c) {
      return $c.url().split("/").slice(0, 6).join("/").run();
    },
    getEpisode($c) {
      return $c.url().urlPart(6).number().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(5).isNil().not().run();
    },
    getTitle($c) {
      return $c.querySelector("h1").text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(5).run();
    },
    uiInjection($c) {
      return $c.querySelector("h1").uiAfter().run();
    },
    getImage($c) {
      return $c.querySelector("img.top-image.brand-image").getAttribute("src").urlAbsolute().ifNotReturn().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require("./style.less?raw").toString()).run();
    },
    ready($c) {
      return $c
        .title()
        .contains("Error 404")
        .ifThen(($c) => $c.string("404").log().return().run())
        .domReady()
        .trigger()
        .run();
    },
  },
};
