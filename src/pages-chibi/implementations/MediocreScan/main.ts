import type { PageInterface } from '../../pageInterface';

export const MediocreScan: PageInterface = {
  name: 'MediocreToons',
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
      return $c.querySelector('header').uiAfter().run();
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
        .querySelectorAll('.md\\:hidden')
        .length()
        .greaterThan(0)
        .ifThen($c =>
          $c
            .querySelector('.md\\:hidden')
            .getComputedStyle('display')
            .equals('none')
            .ifThen($c => $c.querySelector('.mb-8.space-y-3').uiAfter().return().run())
            .ifNotReturn($c.querySelector('.md\\:hidden .space-y-3').uiAfter().return().run())
            .run(),
        )
        .ifNotReturn($c.querySelector('.mb-8.space-y-3').uiAfter().run())
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
        .coalesce($c.getGlobalVariable<Record<string, any>[]>('capitulos').run(), $c.array([]).run())
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
                .coalesce(
                  $c
                    .getVariable('obraData')
                    .get('obr_titulos_alternativos')
                    .setVariable('titulosAltData')
                    .if(
                      $c
                        .coalesce($c.getVariable('titulosAltData').run(), $c.string('').run())
                        .string()
                        .equals('')
                        .run(),
                      $c.getVariable('titulosAlt_undefined').run(),
                      $c
                        .if(
                          $c.getVariable('titulosAltData').string().equals('null').run(),
                          $c.getVariable('titulosAlt_undefined').run(),
                          $c
                            .if(
                              $c.getVariable('titulosAltData').string().matches('^\\[').run(),
                              $c
                                .if(
                                  $c
                                    .getVariable('titulosAltData')
                                    .string()
                                    .matches('^\\[\\s*\\]')
                                    .run(),
                                  $c.getVariable('titulosAlt_undefined').run(),
                                  $c
                                    .getVariable('titulosAltData')
                                    .string()
                                    .regex('^\\[\\s*"((?:[^"\\\\]|\\\\.)*)"', 1)
                                    .run(),
                                )
                                .run(),
                              $c
                                .getVariable('titulosAltData')
                                .arrayFind($el => $el.string().trim().equals('').not().run())
                                .run(),
                            )
                            .run(),
                        )
                        .run(),
                    )
                    .run(),
                  $c.getVariable('obraData').get('obr_nome').run(),
                  $c.getVariable('obraData').get('obr_titulo').run(),
                  $c.getVariable('obraData').get('nome').run(),
                  $c.string('').run(),
                )
                .string()
                .trim()
                .setGlobalVariable('workTitle')
                .coalesce($c.getVariable('obraData').get('obr_id').run(), $c.string('').run())
                .string()
                .setGlobalVariable('workId')
                .coalesce($c.getVariable('obraData').get('obr_imagem').run(), $c.string('').run())
                .string()
                .setVariable('imgPath')
                .if(
                  $c.getVariable('imgPath').equals('').not().run(),
                  $c
                    .string('https://back.mediocrescan.com/media/obras/')
                    .concat($c.getGlobalVariable('workId').run())
                    .concat('/capa?f=')
                    .concat($c.getVariable('imgPath').run())
                    .run(),
                  $c.string('').run(),
                )
                .setGlobalVariable('workImage')
                .coalesce($c.getVariable('obraData').get('capitulos').run(), $c.array([]).run())
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
                .coalesce(
                  $c.getVariable('obraInfo').get('id').run(),
                  $c.getVariable('obraInfo').get('obr_id').run(),
                  $c.string('').run(),
                )
                .string()
                .setGlobalVariable('workId')
                .coalesce(
                  $c
                    .if(
                      $c
                        .coalesce(
                          $c.getVariable('obraInfo').get('obr_titulos_alternativos').run(),
                          $c.array([]).run(),
                        )
                        .string()
                        .matches('^\\[\\s*"')
                        .run(),
                      $c
                        .coalesce(
                          $c.getVariable('obraInfo').get('obr_titulos_alternativos').run(),
                          $c.array([]).run(),
                        )
                        .string()
                        .regex('^\\[\\s*"((?:[^"\\\\]|\\\\.)*)"', 1)
                        .run(),
                      $c
                        .if(
                          $c
                            .coalesce(
                              $c.getVariable('obraInfo').get('obr_titulos_alternativos').run(),
                              $c.array([]).run(),
                            )
                            .string()
                            .matches('^\\[\\s*\\]$')
                            .run(),
                          $c.getVariable('titulosAlt_undefined').run(),
                          $c
                            .coalesce(
                              $c.getVariable('obraInfo').get('obr_titulos_alternativos').run(),
                              $c.array([]).run(),
                            )
                            .arrayFind($el => $el.string().trim().equals('').not().run())
                            .run(),
                        )
                        .run(),
                    )
                    .run(),
                  $c.getVariable('obraInfo').get('obr_nome').run(),
                  $c.getVariable('obraInfo').get('nome').run(),
                  $c.string('').run(),
                )
                .string()
                .trim()
                .replaceRegex('^\\["|"\\]$', '')
                .regex('^([^"]+)', 1)
                .trim()
                .setGlobalVariable('workTitle')
                .coalesce(
                  $c.getVariable('obraInfo').get('imagem').run(),
                  $c.getVariable('obraInfo').get('obr_imagem').run(),
                  $c.string('').run(),
                )
                .string()
                .setVariable('imgPath')
                .if(
                  $c.getVariable('imgPath').equals('').not().run(),
                  $c
                    .string('https://back.mediocrescan.com/media/obras/')
                    .concat($c.getGlobalVariable('workId').run())
                    .concat('/capa?f=')
                    .concat($c.getVariable('imgPath').run())
                    .run(),
                  $c.string('').run(),
                )
                .setGlobalVariable('workImage')
                .coalesce($c.getVariable('obraInfo').get('capitulos').run(), $c.array([]).run())
                .setGlobalVariable('capitulos')
                .run(),
            )
            .run(),
        )
        .detectURLChanges($c.trigger().run())
        .detectChanges(
          $c
            .if(
              $c.querySelectorAll('.md\\:hidden').length().greaterThan(0).run(),
              $c.querySelector('.md\\:hidden').getComputedStyle('display').run(),
              $c.string('').run(),
            )
            .run(),
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
            .if(
              $c.querySelectorAll('#capitulos a[href*="/capitulo/"]').length().greaterThan(0).run(),
              $c.querySelector('#capitulos a[href*="/capitulo/"]').getAttribute('href').run(),
              $c.string('').run(),
            )
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
