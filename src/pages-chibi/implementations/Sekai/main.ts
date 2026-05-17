import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

function getSlug($c: ChibiGenerator<unknown>) {
  return $c.url().urlPart(3).ifNotReturn($c.string('').run());
}

function getVisibleElement($c: ChibiGenerator<unknown>, selector: string) {
  return $c.coalesce(
    $c
      .querySelectorAll(selector)
      .arrayFind($el => $el.getComputedStyle('display').equals('none').not().run())
      .run(),
    $c.querySelector(selector).run(),
  );
}

function getVisibleParagraphText($c: ChibiGenerator<unknown>, selector: string) {
  return $c
    .coalesce(
      getVisibleElement($c, selector).ifNotReturn().find('p').text().trim().run(),
      $c.querySelector(`${selector} p`).ifNotReturn().text().trim().run(),
    )
    .ifNotReturn($c.string('').run());
}

function getActivePlaylistId($c: ChibiGenerator<unknown>) {
  return $c
    .coalesce(
      getVisibleElement($c, '.playlistIframe').ifNotReturn().getAttribute('id').run(),
      $c.querySelector('.playlistIframe').ifNotReturn().getAttribute('id').run(),
    )
    .ifNotReturn($c.string('').run());
}

function getDefaultEpisode($c: ChibiGenerator<unknown>) {
  const episodeLabel = getVisibleParagraphText($c, '.num-episode');
  return $c.if(
    episodeLabel.matches('(\\d+)').run(),
    episodeLabel.regex('(\\d+)', 1).number().run(),
    $c.number(1).run(),
  );
}

function getTitle($c: ChibiGenerator<unknown>) {
  return $c
    .coalesce(
      $c
        .querySelector('meta[property="og:title"]')
        .ifNotReturn()
        .getAttribute('content')
        .ifNotReturn()
        .run(),
      $c.title().run(),
      getSlug($c).run(),
    )
    .ifNotReturn()
    .replaceRegex('^Sekai\\s*-\\s*', '')
    .replaceRegex('\\b(?:Streaming|Vostfr|Vf)\\b', ' ')
    .replaceRegex('\\s+', ' ')
    .trim();
}

function getChangeToken($c: ChibiGenerator<unknown>) {
  return getActivePlaylistId($c)
    .concat('|')
    .concat(getVisibleParagraphText($c, '.num-episode').run())
    .concat('|')
    .concat(getVisibleParagraphText($c, '.titre-episode').run());
}

export const Sekai: PageInterface = {
  name: 'Sekai',
  domain: 'https://sekai.one',
  languages: ['French'],
  type: 'anime',
  urls: {
    match: ['*://sekai.one/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.querySelector('.playlistIframe').boolean().run(),
          $c.querySelector('.num-episode').boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return getTitle($c).run();
    },
    getIdentifier($c) {
      return getSlug($c)
        .replaceRegex('-streaming.*$', '')
        .replaceRegex('-(vf|vostfr)$', '')
        .replaceRegex('[^a-z0-9-]', '')
        .toLowerCase()
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .if(
          $c.url().urlPart(4).boolean().run(),
          $c.string('/').concat(getSlug($c).run()).urlAbsolute('https://sekai.one').run(),
          $c
            .string('/')
            .concat($c.this('sync.getIdentifier').run())
            .urlAbsolute('https://sekai.one')
            .run(),
        )
        .run();
    },
    getEpisode($c) {
      const defaultEpisode = getDefaultEpisode($c);
      const kaiEpisode = $c
        .querySelector('#listeKai .image-container.active')
        .ifNotReturn()
        .getAttribute('id')
        .ifNotReturn()
        .regex('listKai(\\d+)', 1)
        .number();

      return $c
        .if(
          getActivePlaylistId($c).equals('playlistKai').run(),
          $c.coalesce(kaiEpisode.run(), defaultEpisode.run()).run(),
          defaultEpisode.run(),
        )
        .run();
    },
    uiInjection($c) {
      return $c
        .querySelector('.titre-episode')
        .ifNotReturn($c.querySelector('body').uiAppend().run())
        .uiAfter()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('.num-episode p').boolean().run())
        .trigger()
        .detectChanges(getChangeToken($c).run(), $c.trigger().run())
        .run();
    },
  },
};
