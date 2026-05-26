export const Animetsu: PageInterface = {
  name: "Animetsu",
  domain: "https://Animetsu.net",
  languages: ["English"],
  type: "anime",
  urls: {
    match: ["*://*.Animetsu.net/*"],
  },
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(4).boolean().run();
    },
    getTitle($c) {
      return $c.querySelector(".title").text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.url().split("/").slice(0, 5).join("/").run();

      return $c
        .string("/series/")
        .concat($c.this("sync.getIdentifier").run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .url()
        .urlPart(5)
        .regex("episode[_-](\\d+)", 1)
        .number()
        .run();
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
