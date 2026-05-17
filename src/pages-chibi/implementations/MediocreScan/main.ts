import type { PageInterface } from '../../pageInterface';

export const MediocreScan: PageInterface = {
  name: 'MediocreScan',
  domain: 'https://mediocrescan.com',
  languages: ['Portuguese'],
  type: 'manga',
  urls: {
    match: ['*://mediocrescan.com/*'],
  },
  features: {
    requestProxy: true,
  },
  search:
    'https://mediocrescan.com/pesquisar?formato=1%2C3%2C4%2C5%2C13&pagina=1&busca={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.url().matches('/capitulo/\\d+').run();
    },
    getEpisode($c) {
      return $c.getGlobalVariable('currentEpisode').run();
    },
    getOverviewUrl($c) {
      return $c
        .string('https://mediocrescan.com/obra/')
        .concat($c.getGlobalVariable('workId').run())
        .urlAbsolute()
        .run();
    },
    getTitle($c) {
      return $c.getGlobalVariable('workTitle').run();
    },
    getIdentifier($c) {
      return $c.getGlobalVariable('workId').run();
    },
    getImage($c) {
      return $c.getGlobalVariable('workImage').run();
    },
    uiInjection($c) {
      return $c.querySelector('nav').uiAfter().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().matches('/obra/\\d+').run();
    },
    getTitle($c) {
      return $c.getGlobalVariable('workTitle').run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    uiInjection($c) {
      return $c
        .querySelector('.md\\:hidden')
        .getComputedStyle('display')
        .equals('none')
        .ifThen($c =>
          $c.querySelector('.flex.flex-wrap.items-center.gap-3.mb-8').uiAfter().return().run(),
        )
        .ifNotReturn($c.querySelector('.md\\:hidden .space-y-3').uiAfter().run())
        .run();
    },
    getImage($c) {
      return $c.getGlobalVariable('workImage').run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#capitulos a[href*="/capitulo/"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').split('?').first().urlAbsolute().run();
    },
    elementEp($c) {
      return $c
        .getAttribute('href')
        .regex('/capitulo/(\\d+)', 1)
        .number()
        .setVariable('capIdFromUrl')
        .getGlobalVariable<any[]>('capitulos')
        .arrayFind($el =>
          $el.get('cap_id').number().equals($c.getVariable<number>('capIdFromUrl').run()).run(),
        )
        .get('cap_num')
        .number()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .requestProxy($c =>
          $c
            .setVariable('request')
            .get('url')
            .setVariable('requestUrl')
            .getVariable('requestUrl')
            .string()
            .matches('back\\.mediocrescan\\.com/obras/\\d+')
            .ifThen($c =>
              $c
                .getVariable('request')
                .get('data')
                .setVariable('obraData')
                .getVariable('obraData')
                .get('obr_titulos_alternativos')
                .ifNotReturn($c.array([]).run())
                .arrayFind($el => $el.string().trim().equals('').not().run())
                .ifNotReturn($c.getVariable('obraData').get('obr_nome').run())
                .ifNotReturn($c.getVariable('obraData').get('obr_titulo').run())
                .ifNotReturn($c.getVariable('obraData').get('nome').run())
                .ifNotReturn($c.string('').run())
                .string()
                .trim()
                .replaceRegex('^\\["|"\\]$', '')
                .regex('^([^"]+)', 1)
                .trim()
                .setGlobalVariable('workTitle')
                .getVariable('obraData')
                .get('obr_id')
                .ifNotReturn($c.string('').run())
                .string()
                .setGlobalVariable('workId')
                .getVariable('obraData')
                .get('obr_imagem')
                .ifNotReturn($c.string('').run())
                .string()
                .setVariable('imgPath')
                .string('https://cdn.mediocrescan.com/obras/')
                .concat($c.getGlobalVariable('workId').run())
                .concat('/')
                .concat($c.getVariable('imgPath').run())
                .setGlobalVariable('workImage')
                .getVariable('obraData')
                .get('capitulos')
                .ifNotReturn($c.array([]).run())
                .setGlobalVariable('capitulos')
                .run(),
            )
            .getVariable('requestUrl')
            .string()
            .matches('back\\.mediocrescan\\.com/(capitulos|capitulo)/\\d+')
            .ifThen($c =>
              $c
                .getVariable('request')
                .get('data')
                .setVariable('chapterData')
                .getVariable('chapterData')
                .get('cap_num')
                .number()
                .setGlobalVariable('currentEpisode')
                .getVariable('chapterData')
                .get('obra')
                .setVariable('obraInfo')
                .getVariable('obraInfo')
                .get('id')
                .ifNotReturn($c.getVariable('obraInfo').get('obr_id').run())
                .string()
                .setGlobalVariable('workId')
                .getVariable('obraInfo')
                .get('obr_titulos_alternativos')
                .ifNotReturn($c.array([]).run())
                .arrayFind($el => $el.string().trim().equals('').not().run())
                .ifNotReturn($c.getVariable('obraInfo').get('obr_nome').run())
                .ifNotReturn($c.getVariable('obraInfo').get('nome').run())
                .ifNotReturn($c.string('').run())
                .string()
                .trim()
                .replaceRegex('^\\["|"\\]$', '')
                .regex('^([^"]+)', 1)
                .trim()
                .setGlobalVariable('workTitle')
                .getVariable('obraInfo')
                .get('imagem')
                .ifNotReturn($c.getVariable('obraInfo').get('obr_imagem').run())
                .ifNotReturn($c.string('').run())
                .string()
                .setVariable('imgPath')
                .string('https://cdn.mediocrescan.com/obras/')
                .concat($c.getGlobalVariable('workId').run())
                .concat('/')
                .concat($c.getVariable('imgPath').run())
                .setGlobalVariable('workImage')
                .getVariable('obraInfo')
                .get('capitulos')
                .ifNotReturn($c.array([]).run())
                .setGlobalVariable('capitulos')
                .run(),
            )
            .run(),
        )
        .detectURLChanges($c.trigger().run())
        .detectChanges(
          $c.querySelector('.md\\:hidden').getComputedStyle('display').run(),
          $c.trigger().run(),
        )
        .domReady()
        .trigger()
        .run();
    },
    syncIsReady($c) {
      return $c
        .detectChanges($c.getGlobalVariable('workId').run(), $c.trigger().run())
        .detectChanges($c.getGlobalVariable('currentEpisode').run(), $c.trigger().run())
        .domReady()
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c
        .detectChanges($c.getGlobalVariable('workId').run(), $c.trigger().run())
        .detectChanges(
          $c.querySelectorAll('#capitulos a[href*="/capitulo/"]').length().run(),
          $c.trigger().run(),
        )
        .detectChanges(
          $c
            .querySelector('#capitulos a[href*="/capitulo/"]')
            .ifThen($c => $c.getAttribute('href').run())
            .ifNotReturn($c.string('').run())
            .run(),
          $c.trigger().run(),
        )
        .waitUntilTrue(
          $c.querySelectorAll('#capitulos a[href*="/capitulo/"]').length().greaterThan(0).run(),
        )
        .domReady()
        .trigger()
        .run();
    },
  },
};
