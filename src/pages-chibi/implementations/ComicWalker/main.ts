import { PageInterface } from '../../pageInterface';

export const ComicWalker: PageInterface = {
  name: 'ComicWalker',
  domain: 'https://comic-walker.com/',
  languages: ['Japanese'],
  type: 'manga',
  urls: {
    match: ['*://comic-walker.com/*'],
  },
  search: 'https://comic-walker.com/search?keyword={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('detail').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('[class*="EpisodeTitleArea_title_"]')
        .text()
        .replaceRegex('^.*?】', '')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('[class*="WorkDetailsSection_thumbnail"] img')
        .getAttribute('src')
        .urlAbsolute()
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .string('https://comic-walker.com/detail/{id}')
        .replace('{id}', $c.this('sync.getIdentifier').run())
        .run();
    },
    getEpisode($c) {
      const episodeTitle = $c.querySelector('[class*="EpisodeTitleArea_title_"]').text().run();
      return grpRegex($c.setVariable('Ep', episodeTitle)).run();
    },
    nextEpUrl($c) {
      const CurrentEp = $c.querySelector('[class*="EpisodeThumbnail_isReading"]').parent().run();
      return $c
        .if(
          $c.url().urlParam('episodeType').equals('latest').run(),
          $c.fn(CurrentEp).prev().find('a').ifNotReturn().getAttribute('href').run(),
          $c.fn(CurrentEp).next().find('a').ifNotReturn().getAttribute('href').run(),
        )
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('[class*="EpisodesTabContents_root"]').uiBefore().run();
    },
    readerConfig: [
      {
        condition: $c => $c.querySelector('[class*="_scrollViewport_"]').boolean().run(),
        current: $c =>
          $c.querySelectorAll('[class*="_scrollViewport_"] [class*="_page_"]').countAbove().run(),
        total: $c =>
          $c.querySelectorAll('[class*="_scrollViewport_"] [class*="_page_"]').length().run(),
      },
      {
        current: $c => pageFind($c).regex('(\\d+)\\s?/\\s?(\\d+)', 1).number().run(),
        total: $c => pageFind($c).regex('(\\d+)\\s?/\\s?(\\d+)', 2).number().run(),
      },
    ],
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('[class*="EpisodeThumbnail_episodeThumbnail"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return grpRegex(
        $c.setVariable('Ep', $c.target().find('[class*="EpisodeThumbnail_title_"]').text().run()),
      ).run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .detectChanges(
          $c.querySelector('[class*="EpisodeThumbnail_isReading"]').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .domReady()
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('[class*="EpisodesTabContents_episodeList"]').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};

function pageFind($c) {
  return $c
    .querySelectorAll('button[class*="_button"]')
    .arrayFind($page => $page.text().matches('\\d+\\s?/\\s?\\d+').run())
    .text();
}
function grpRegex($c) {
  return $c.coalesce(
    $c
      .getVariable('Ep')
      .regex('(?:第|#|_|e.|Chapter\\s?)(\\d+)', 1)
      .ifThen($c => $c.number().run())
      .run(),
    $c
      .getVariable('Ep')
      .regex('(\\d+)品', 1)
      .ifThen($c => $c.number().run())
      .run(),
    $c
      .getVariable('Ep')
      .regex('[零〇一二三四五六七八九十百千万億兆]+')
      .ifThen($c => $c.JPtoNumeral().run())
      .run(),
  );
}
