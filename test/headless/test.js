const { expect } = require('chai');
const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

const fs = require('fs');

const script = fs.readFileSync(`${__dirname}/../dist/testCode.js`, 'utf8');
const skipTest = process.env.SKIPTEST;

if (skipTest) {
  console.log('Skiptest');
}

const testsArray = [
  {
    title: 'Crunchyroll',
    url: 'https://www.crunchyroll.com/',
    testCases: [
      {
        url: 'https://www.crunchyroll.com/de/ai-mai-mi-mousou-catastrophe',
        expected: {
          sync: false,
          title: 'Ai-Mai-Mi Mousou Catastrophe',
          identifier: 'Ai-Mai-Mi Mousou Catastrophe',
          uiSelector: true,
          epList: {
            5: 'https://www.crunchyroll.com/de/ai-mai-mi-mousou-catastrophe/episode-5-untitled-658393',
          },
        },
      },

      {
        url:
          'https://www.crunchyroll.com/de/ai-mai-mi-mousou-catastrophe/episode-3-untitled-658389',
        expected: {
          sync: true,
          title: 'Ai-Mai-Mi Mousou Catastrophe',
          identifier: 'Ai-Mai-Mi Mousou Catastrophe',
          overviewUrl:
            'https://www.crunchyroll.com/ai-mai-mi-mousou-catastrophe?season=Ai-Mai-Mi Mousou Catastrophe',
          nextEpUrl:
            'https://www.crunchyroll.com/de/ai-mai-mi-mousou-catastrophe/episode-4-untitled-658391',
          episode: 3,
          uiSelector: false,
        },
      },
      {
        url:
          'https://www.crunchyroll.com/de/katana-maidens-toji-no-miko/episode-125-short-version-digest-758955',
        expected: {
          sync: true,
          title: '(OmU) Katana Maidens ~ Toji No Miko',
          identifier: '(OmU) Katana Maidens ~ Toji No Miko',
          episode: 12,
          overviewUrl:
            'https://www.crunchyroll.com/katana-maidens-toji-no-miko?season=(OmU) Katana Maidens ~ Toji No Miko',
          nextEpUrl:
            'https://www.crunchyroll.com/de/katana-maidens-toji-no-miko/episode-13-hero-of-the-next-generation-768501',
        },
      },
    ],
  },

  {
    title: 'Kissanime',
    url: 'https://kissanime.ru/',
    skip: true,
    testCases: [
      {
        url: 'https://kissanime.ru/Anime/No-Game-No-Life',
        expected: {
          sync: false,
          title: 'No Game No Life (Sub)',
          identifier: 'No-Game-No-Life',
          uiSelector: true,
          epList: {
            5: 'https://kissanime.ru/Anime/No-Game-No-Life/Episode-005?id=67493',
          },
        },
      },
      {
        url:
          'https://kissanime.ru/Anime/No-Game-No-Life-Dub/Episode-004?id=112019&s=hydrax',
        expected: {
          sync: true,
          title: 'No Game No Life (Dub)',
          identifier: 'No-Game-No-Life-Dub',
          overviewUrl: 'https://kissanime.ru/Anime/No-Game-No-Life-Dub',
          nextEpUrl:
            'https://kissanime.ru/Anime/No-Game-No-Life-Dub/Episode-005?id=112020',
          episode: 4,
          uiSelector: false,
        },
      },
    ],
  },

  {
    title: '9anime',
    url: 'https://9anime.ru/',
    testCases: [
      {
        url: 'https://9anime.ru/watch/no-game-no-life-dub.y2p0/6m2170',
        expected: {
          sync: true,
          title: 'No Game, No Life (Dub)',
          identifier: 'y2p0',
          overviewUrl: 'https://9anime.ru/watch/no-game-no-life-dub.y2p0',
          nextEpUrl: 'https://9anime.to/watch/no-game-no-life-dub.y2p0/q457ww',
          episode: 4,
          uiSelector: true,
          epList: {
            5: 'https://9anime.to/watch/no-game-no-life-dub.y2p0/q457ww',
          },
        },
      },
    ],
  },

  {
    title: 'Gogoanime',
    url: 'https://www4.gogoanime.io',
    testCases: [
      {
        url: 'https://www4.gogoanime.io/category/no-game-no-life',
        expected: {
          sync: false,
          title: 'no-game-no-life',
          identifier: 'no-game-no-life',
          uiSelector: true,
          epList: {
            6: 'https://www4.gogoanime.io/no-game-no-life-episode-6',
          },
        },
      },
      {
        url: 'https://www4.gogoanime.io/no-game-no-life-episode-5',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          overviewUrl: 'https://www4.gogoanime.io/category/no-game-no-life',
          nextEpUrl: 'https://www4.gogoanime.io/no-game-no-life-episode-6',
          episode: 5,
          uiSelector: false,
          epList: {
            6: 'https://www4.gogoanime.io/no-game-no-life-episode-6',
          },
        },
      },
    ],
  },

  {
    title: 'twist.moe',
    url: 'https://twist.moe/a/no-game-no-life/4',
    skip: true,
    testCases: [
      {
        url: 'https://twist.moe/a/no-game-no-life/4',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          overviewUrl: 'https://twist.moe/a/no-game-no-life/1',
          nextEpUrl: 'https://twist.moe/a/no-game-no-life/5',
          episode: 4,
          uiSelector: true,
          epList: {
            5: 'https://twist.moe/a/no-game-no-life/5',
          },
        },
      },
    ],
  },

  {
    title: 'anime4you',
    url: 'https://www.anime4you.one/',
    testCases: [
      {
        url: 'https://www.anime4you.one/show/1/aid/781/',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: '781',
          uiSelector: true,
          epList: {
            5: 'https://www.anime4you.one/show/1/aid/781/epi/5/#vidplayer',
          },
        },
      },
      // captcha
      // {
      //   url: 'https://www.anime4you.one/show/1/aid/779/epi/4/#vidplayer',
      //   expected: {
      //     sync: true,
      //     title: 'No Game No Life',
      //     identifier: '779',
      //     overviewUrl: 'https://www.anime4you.one/show/1/aid/779',
      //     nextEpUrl: 'https://www.anime4you.one/show/1/aid/779/epi/5/?host=#vidplayer',
      //     episode: 4,
      //     uiSelector: true,
      //     epList: {
      //       5: 'https://www.anime4you.one/show/1/aid/779/epi/5/#vidplayer'
      //     }
      //   }
      // },
    ],
  },

  {
    title: 'Turkanime',
    url: 'http://www.turkanime.tv',
    testCases: [
      {
        url: 'http://www.turkanime.tv/anime/no-game-no-life',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          uiSelector: true,
          epList: {
            5: 'http://www.turkanime.net/video/no-game-no-life-special-5-bolum',
          },
        },
      },
      {
        url: 'http://www.turkanime.tv/video/no-game-no-life-6-bolum',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          overviewUrl: 'http://www.turkanime.tv/anime/no-game-no-life',
          nextEpUrl: 'http://www.turkanime.tv/video/no-game-no-life-7-bolum',
          episode: 6,
          uiSelector: false,
        },
      },
    ],
  },

  {
    title: 'Kissmanga',
    url: 'https://kissmanga.com/',
    skip: true,
    testCases: [
      {
        url: 'https://kissmanga.com/Manga/No-Game-No-Life',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'No-Game-No-Life',
          uiSelector: true,
          epList: {
            5: 'https://kissmanga.com/Manga/No-Game-No-Life/Ch-005--Game-005?id=178265',
          },
        },
      },
      {
        url:
          'https://kissmanga.com/Manga/No-Game-No-Life/Ch-003--Game-003?id=167047',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'No-Game-No-Life',
          overviewUrl: 'https://kissmanga.com/Manga/No-Game-No-Life',
          nextEpUrl:
            'https://kissmanga.com/Manga/No-Game-No-Life/Ch-004--Game-004?id=169936',
          episode: 3,
          uiSelector: false,
        },
      },
    ],
  },

  {
    title: 'Mangadex',
    url: 'https://mangadex.org/manga/8173/no-game-no-life',
    testCases: [
      {
        url: 'https://mangadex.org/manga/8173/no-game-no-life',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: '8173',
          uiSelector: true,
          epList: {
            5: 'https://www.mangadex.org/chapter/808449',
          },
        },
      },
      {
        url: 'https://mangadex.org/chapter/808444',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: '8173',
          overviewUrl: 'https://www.mangadex.org/title/8173/no-game-no-life',
          nextEpUrl: 'https://www.mangadex.org/chapter/808449',
          episode: 4,
          uiSelector: false,
        },
      },
      {
        // oneshot
        url: 'https://mangadex.org/chapter/38989/3',
        expected: {
          sync: true,
          title: 'High Spec Lovers',
          identifier: '9270',
          overviewUrl: 'https://mangadex.org/title/9270/high-spec-lovers',
          nextEpUrl: undefined,
          episode: 1,
          uiSelector: false,
        },
      },
    ],
  },

  {
    title: 'Branitube',
    url: 'https://www.branitube.net/',
    skip: true, // somehow doesnt work
    testCases: [
      {
        // anime overview
        url: 'https://www.branitube.net/animes/197/no-game-no-life',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: '197?anime',
          uiSelector: true,
          epList: {
            5: 'https://www.branitube.net/watch/1818/no-game-no-life',
          },
        },
      },
      {
        // ova overview
        url: 'https://www.branitube.net/animes/73/high-school-dxd/ovas',
        expected: {
          sync: false,
          title: 'High School DxD ova',
          identifier: '73?ova',
          uiSelector: true,
          epList: {
            2: 'https://www.branitube.net/watch/536/high-school-dxd',
          },
        },
      },
      {
        // special overview
        url: 'https://www.branitube.net/animes/73/high-school-dxd/especiais',
        expected: {
          sync: false,
          title: 'High School DxD special',
          identifier: '73?special',
          uiSelector: true,
          epList: {
            5: 'https://www.branitube.net/watch/533/high-school-dxd',
          },
        },
      },
      {
        // anime watch
        url: 'https://www.branitube.net/watch/1820/no-game-no-life',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: '197?anime',
          overviewUrl: 'https://www.branitube.net/animes/197/no-game-no-life',
          nextEpUrl: 'https://www.branitube.net/watch/1821/no-game-no-life',
          episode: 7,
          uiSelector: false,
        },
      },
      {
        // ova watch
        url: 'https://www.branitube.net/watch/536/high-school-dxd',
        expected: {
          sync: true,
          title: 'High School DxD ova',
          identifier: '73?ova',
          overviewUrl:
            'https://www.branitube.net/animes/73/high-school-dxd/ovas',
          nextEpUrl: undefined,
          episode: 2,
          uiSelector: false,
        },
      },
      {
        // special watch
        url: 'https://www.branitube.net/watch/533/high-school-dxd',
        expected: {
          sync: true,
          title: 'High School DxD special',
          identifier: '73?special',
          overviewUrl:
            'https://www.branitube.net/animes/73/high-school-dxd/especiais',
          nextEpUrl: 'https://www.branitube.net/watch/534/high-school-dxd',
          episode: 5,
          uiSelector: false,
        },
      },
      {
        // film watch
        url: 'https://www.branitube.net/watch/10370/one-piece',
        expected: {
          sync: true,
          title: 'One Piece movie 8"',
          identifier: '21?movie8',
          overviewUrl: 'https://www.branitube.net/animes/21/one-piece/filmes',
          nextEpUrl: undefined,
          episode: 1,
          uiSelector: false,
        },
      },
    ],
  },

  {
    title: 'Animepahe',
    url: 'https://animepahe.com',
    testCases: [
      {
        url: 'https://animepahe.com/anime/no-game-no-life',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          uiSelector: true,
          epList: {
            5: 'https://animepahe.com/anime/no-game-no-life/52827',
          },
        },
      },
      {
        url: 'https://animepahe.com/anime/no-game-no-life/52832',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          overviewUrl: 'https://animepahe.com/anime/no-game-no-life',
          nextEpUrl: 'https://animepahe.com/anime/no-game-no-life/52834',
          episode: 8,
          uiSelector: true,
        },
      },
    ],
  },

  {
    title: 'Animeflv',
    url: 'https://animeflv.net',
    testCases: [
      {
        url: 'https://animeflv.net/anime/3825/no-game-no-life',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: '3825/no-game-no-life',
          uiSelector: true,
          epList: {
            5: 'https://animeflv.net/ver/24662/no-game-no-life-5',
          },
        },
      },
      {
        url: 'https://animeflv.net/ver/25681/no-game-no-life-11',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: '3825/no-game-no-life',
          overviewUrl: 'https://animeflv.net/anime/3825/no-game-no-life',
          nextEpUrl: 'https://animeflv.net/ver/25904/no-game-no-life-12',
          episode: 11,
          uiSelector: true,
        },
      },
    ],
  },

  {
    title: 'Jkanime',
    url: 'https://jkanime.net',
    testCases: [
      {
        url: 'https://jkanime.net/no-game-no-life/',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          uiSelector: true,
          epList: {
            5: 'https://jkanime.net/no-game-no-life/5',
          },
        },
      },
      {
        url: 'https://jkanime.net/no-game-no-life/11/',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          overviewUrl: 'https://jkanime.net/no-game-no-life/',
          nextEpUrl: 'https://jkanime.net/no-game-no-life/12/',
          episode: 11,
          uiSelector: true,
        },
      },
    ],
  },

  {
    title: 'Proxer',
    url: 'https://proxer.me/',
    skip: true,
    testCases: [
      {
        url: 'https://proxer.me/watch/6587/2/gerdub',
        expected: {
          sync: true,
          identifier: '6587',
          episode: 2,
          title: 'No Game No Life',
          overviewUrl: 'https://proxer.me/info/6587/list',
          nextEpUrl: 'https://proxer.me/watch/6587/3/gerdub',
        },
      },
      {
        url: 'https://proxer.me/info/6587',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: '6587',
          uiSelector: true,
        },
      },
      {
        url: 'https://proxer.me/info/6587/list',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: '6587',
          uiSelector: false,
          epList: {
            5: 'https://proxer.me/watch/6587/5/gerdub',
          },
        },
      },
    ],
  },

  {
    title: 'Novelplanet',
    url: 'https://novelplanet.com',
    testCases: [
      {
        url: 'https://novelplanet.com/Novel/No-Game-No-Life',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'No-Game-No-Life',
          uiSelector: true,
          epList: {
            5: 'https://novelplanet.com/Novel/No-Game-No-Life/Volume-5-Prologue?id=125835',
          },
        },
      },
      {
        url:
          'https://novelplanet.com/Novel/No-Game-No-Life/Volume-1-Chapter-3?id=125572',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'No-Game-No-Life',
          overviewUrl: 'https://novelplanet.com/Novel/No-Game-No-Life',
          episode: 3,
          nextEpUrl:
            'https://novelplanet.com/Novel/No-Game-No-Life/Volume-1-Chapter-4?id=125591',
          uiSelector: true,
        },
      },
    ],
  },

  {
    title: '4anime',
    url: 'https://4anime.to/',
    testCases: [
      {
        url: 'https://4anime.to/no-game-no-life-episode-04?id=10620',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          overviewUrl: 'https://4anime.to/anime/no-game-no-life',
          episode: 4,
          nextEpUrl: 'https://4anime.to/no-game-no-life-episode-05/?id=10621',
          uiSelector: false,
          epList: {
            5: 'https://4anime.to/no-game-no-life-episode-05/?id=10621',
          },
        },
      },
      {
        url: 'https://4anime.to/anime/no-game-no-life',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          uiSelector: true,
          epList: {
            5: 'https://4anime.to/no-game-no-life-episode-05/?id=10621',
          },
        },
      },
    ],
  },

  {
    title: 'Dream Animes',
    url: 'https://dreamanimes.com.br/',
    testCases: [
      {
        url:
          'https://dreamanimes.com.br/online/legendado/no-game-no-life/episodio/4',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          overviewUrl: 'https://dreamanimes.com.br/anime-info/no-game-no-life',
          episode: 4,
          uiSelector: false,
        },
      },
      {
        url: 'https://dreamanimes.com.br/anime-info/no-game-no-life',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          uiSelector: true,
        },
      },
    ],
  },

  {
    title: 'animeultima',
    url: 'https://www10.animeultima.eu/',
    skip: true, // Changing identifier
    testCases: [
      {
        url:
          'https://www11.animeultima.eu/a/no-game-no-life_797937/episode-4_521521-sub',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life_797937',
          overviewUrl: 'https://www10.animeultima.eu/a/no-game-no-life_797937',
          episode: 4,
          uiSelector: false,
        },
      },
      {
        url: 'https://www10.animeultima.eu/a/no-game-no-life_797937',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life_797937',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'aniflix',
    url: 'https://www2.aniflix.tv/',
    testCases: [
      {
        url:
          'https://www2.aniflix.tv/show/assassination-classroom/ger-sub/season/1/episode/12',
        expected: {
          sync: true,
          title: 'Assassination Classroom',
          identifier: 'assassination-classroom?s=1',
          overviewUrl: 'https://www2.aniflix.tv/show/assassination-classroom',
          episode: 12,
          uiSelector: false,
        },
      },
      {
        url:
          'https://www2.aniflix.tv/show/assassination-classroom/ger-sub/season/2/episode/15',
        expected: {
          sync: true,
          title: 'Assassination Classroom season 2',
          identifier: 'assassination-classroom?s=2',
          overviewUrl: 'https://www2.aniflix.tv/show/assassination-classroom',
          episode: 15,
          uiSelector: false,
        },
      },
      {
        url: 'https://www2.aniflix.tv/show/assassination-classroom',
        expected: {
          sync: false,
          title: 'Assassination Classroom',
          identifier: 'assassination-classroom?s=1',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'animedaisuki',
    url: 'https://animedaisuki.moe/',
    testCases: [
      {
        url: 'https://animedaisuki.moe/watch/6380/initial-d-first-stage-5',
        expected: {
          sync: true,
          title: 'Initial D: First Stage',
          identifier: 'initial-d-first-stage',
          overviewUrl:
            'https://animedaisuki.moe/anime/524/initial-d-first-stage',
          episode: 5,
          nextEpUrl:
            'https://animedaisuki.moe/watch/6381/initial-d-first-stage-6',
          uiSelector: false,
        },
      },
      {
        url: 'https://animedaisuki.moe/anime/524/initial-d-first-stage',
        expected: {
          sync: false,
          title: 'Initial D: First Stage',
          identifier: 'initial-d-first-stage',
          uiSelector: true,
          epList: {
            5: 'https://animedaisuki.moe/watch/6380/initial-d-first-stage-5',
          },
        },
      },
    ],
  },
  {
    title: 'animefreak',
    url: 'https://www.animefreak.tv/',
    testCases: [
      {
        url:
          'https://www.animefreak.tv/watch/mahouka-koukou-no-rettousei/episode/episode-23',
        expected: {
          sync: true,
          title: 'Mahouka Koukou no Rettousei',
          identifier: 'mahouka-koukou-no-rettousei',
          overviewUrl:
            'https://animefreak.tv/watch/mahouka-koukou-no-rettousei',
          episode: 23,
          nextEpUrl:
            'https://animefreak.tv/watch/mahouka-koukou-no-rettousei/episode/episode-24',
          uiSelector: false,
        },
      },
      {
        url: 'https://www.animefreak.tv/watch/mahouka-koukou-no-rettousei',
        expected: {
          sync: false,
          title: 'Mahouka Koukou no Rettousei',
          identifier: 'mahouka-koukou-no-rettousei',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'animeplanet',
    url: 'https://www.anime-planet.com/',
    testCases: [
      {
        url:
          'https://www.anime-planet.com/anime/the-rising-of-the-shield-hero/videos/229861',
        expected: {
          sync: true,
          title: 'The Rising of the Shield Hero',
          identifier: 'the-rising-of-the-shield-hero',
          overviewUrl:
            'https://www.anime-planet.com/anime/the-rising-of-the-shield-hero/videos',
          episode: 3,
          uiSelector: true,
        },
      },
      {
        url: 'https://www.anime-planet.com/anime/the-rising-of-the-shield-hero',
        expected: {
          sync: false,
          title: 'The Rising of the Shield Hero',
          identifier: 'the-rising-of-the-shield-hero',
          uiSelector: true,
        },
      },
      {
        url:
          'https://www.anime-planet.com/anime/the-rising-of-the-shield-hero/videos',
        expected: {
          sync: false,
          title: 'The Rising of the Shield Hero',
          identifier: 'the-rising-of-the-shield-hero',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'kickassanime',
    url: 'https://www.kickassanime.rs/',
    testCases: [
      // {
      //   url: 'https://www17.kickassanime.io/anime/overlord-iii-954770/episode-10-439507',
      //   expected: {
      //     sync: true,
      //     title: 'Overlord III',
      //     identifier: 'overlord-iii-954770',
      //     overviewUrl: 'https://www17.kickassanime.io/anime/overlord-iii-954770',
      //     episode: 10,
      //     uiSelector: false,
      //   }
      // },
      {
        url: 'https://www.kickassanime.rs/anime/overlord-iii-591772',
        expected: {
          sync: false,
          title: 'Overlord III',
          identifier: 'overlord-iii-591772',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'AnimeKisa',
    url: 'https://animekisa.tv/',
    testCases: [
      {
        url: 'https://animekisa.tv/phantom-requiem-for-the-phantom-episode-9',
        expected: {
          sync: true,
          title: 'Phantom: Requiem for the Phantom',
          identifier: 'phantom-requiem-for-the-phantom',
          overviewUrl: 'https://animekisa.tv/phantom-requiem-for-the-phantom',
          episode: 9,
          nextEpUrl:
            'https://animekisa.tv/phantom-requiem-for-the-phantom-episode-10',
          uiSelector: false,
        },
      },
      {
        url: 'https://animekisa.tv/phantom-requiem-for-the-phantom',
        expected: {
          sync: false,
          title: 'Phantom: Requiem for the Phantom',
          identifier: 'phantom-requiem-for-the-phantom',
          uiSelector: true,
          epList: {
            5: 'https://animekisa.tv/phantom-requiem-for-the-phantom-episode-5',
          },
        },
      },
    ],
  },
  {
    title: 'Wakanim',
    url: 'https://www.wakanim.tv',
    testCases: [
      // {
      //   url: 'https://www.wakanim.tv/de/v2/catalogue/episode/8787/afterlost-omu-staffel-1-folge-4-omu',
      //   expected: {
      //     sync: true,
      //     title: 'AFTERLOST (OmU.)',
      //     identifier: '493',
      //     overviewUrl: 'https://www.wakanim.tv/de/v2/catalogue/show/493/afterlost-omu',
      //     nextEpUrl: 'https://www.wakanim.tv/de/v2/catalogue/episode/8788/afterlost-omu-staffel-1-folge-5-omu',
      //     episode: 4,
      //     uiSelector: false,
      //   }
      // },
      {
        url: 'https://www.wakanim.tv/de/v2/catalogue/show/493/afterlost-omu',
        expected: {
          sync: false,
          title: 'AFTERLOST',
          identifier: '493',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'AnimeIndo',
    url: 'http://animeindo.moe/',
    testCases: [
      {
        url: 'http://animeindo.moe/zankyou-no-terror-episode-06.html',
        expected: {
          sync: true,
          title: 'Zankyou no Terror',
          identifier: 'zankyou-no-terror',
          overviewUrl: 'http://animeindo.moe/anime/zankyou-no-terror',
          episode: 6,
          nextEpUrl: 'http://animeindo.moe/zankyou-no-terror-episode-07.html',
          uiSelector: false,
        },
      },
      {
        url: 'http://animeindo.moe/anime/zankyou-no-terror',
        expected: {
          sync: false,
          title: 'Zankyou no Terror',
          identifier: 'zankyou-no-terror',
          uiSelector: true,
          epList: {
            5: 'http://animeindo.moe/zankyou-no-terror-episode-05.html',
          },
        },
      },
    ],
  },
  {
    title: 'Shinden',
    url: 'https://shinden.pl/',
    skip: true, // does not work because of geoblocking
    testCases: [
      {
        url:
          'https://shinden.pl/episode/16238-mahouka-koukou-no-rettousei/view/117041',
        expected: {
          sync: true,
          title: 'Mahouka Koukou no Rettousei',
          identifier: '16238-mahouka-koukou-no-rettousei',
          overviewUrl:
            'https://shinden.pl/series/16238-mahouka-koukou-no-rettousei',
          episode: 14,
          uiSelector: false,
        },
      },
      {
        url: 'https://shinden.pl/series/16238-mahouka-koukou-no-rettousei',
        expected: {
          sync: false,
          title: 'Mahouka Koukou no Rettousei',
          identifier: '16238-mahouka-koukou-no-rettousei',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'Voiranime',
    url: 'http://voiranime.com',
    testCases: [
      {
        url: 'http://voiranime.com/no-game-no-life-06-vostfr/',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          overviewUrl: 'http://voiranime.com/no-game-no-life',
          nextEpUrl: 'http://voiranime.com/no-game-no-life-07-vostfr/',
          episode: 6,
          uiSelector: false,
          epList: {
            5: 'http://voiranime.com/no-game-no-life-05-vostfr/',
          },
        },
      },
      {
        url:
          'http://voiranime.com/boku-no-hero-academia-my-hero-academia-saison-2-04-vf/',
        expected: {
          sync: true,
          title: 'Boku no Hero Academia (My Hero Academia) (Saison 2)',
          identifier: 'boku-no-hero-academia-my-hero-academia',
          overviewUrl:
            'http://voiranime.com/boku-no-hero-academia-my-hero-academia',
          nextEpUrl:
            'http://voiranime.com/boku-no-hero-academia-my-hero-academia-saison-2-05-vf/',
          episode: 4,
          uiSelector: false,
          epList: {
            5: 'http://voiranime.com/boku-no-hero-academia-my-hero-academia-saison-2-05-vf/',
          },
        },
      },
      {
        url: 'http://voiranime.com/no-game-no-life/',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'hanime', // nsfw
    url: 'https://hanime.tv/',
    testCases: [
      {
        url: 'https://hanime.tv/videos/hentai/itadaki-seieki',
        expected: {
          sync: true,
          title: 'Itadaki! Seieki',
          identifier: 'itadaki-seieki',
          overviewUrl: 'https://hanime.tv/videos/hentai/itadaki-seieki',
          episode: 1,
          uiSelector: false,
        },
      },
      {
        url:
          'https://hanime.tv/videos/hentai/mesu-kyoushi-4-kegasareta-kyoudan-4',
        expected: {
          sync: true,
          title: 'Mesu Kyoushi 4: Kegasareta Kyoudan',
          identifier: 'mesu-kyoushi-4-kegasareta-kyoudan',
          overviewUrl:
            'https://hanime.tv/videos/hentai/mesu-kyoushi-4-kegasareta-kyoudan-1',
          episode: 4,
          uiSelector: false,
        },
      },
    ],
  },
  {
    title: 'hentaihaven', // nsfw
    url: 'https://hentaihaven.org/',
    testCases: [
      {
        url: 'https://hentaihaven.org/rape-gouhouka-episode-2/',
        expected: {
          sync: true,
          title: 'Rape Gouhouka!!!',
          identifier: 'rape-gouhouka',
          overviewUrl: 'https://hentaihaven.org/series/rape-gouhouka/',
          episode: 2,
          uiSelector: false,
        },
      },
      {
        url: 'https://hentaihaven.org/series/rape-gouhouka/',
        expected: {
          sync: false,
          title: 'Rape Gouhouka!!!',
          identifier: 'rape-gouhouka',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'hentaigasm', // nsfw
    url: 'http://hentaigasm.com/',
    testCases: [
      {
        url: 'http://hentaigasm.com/2017/03/16/pinkerton-3-subbed/',
        expected: {
          sync: true,
          title: 'Pinkerton',
          identifier: 'pinkerton',
          overviewUrl: 'http://hentaigasm.com/hentai/pinkerton/',
          episode: 3,
          uiSelector: false,
        },
      },
      {
        url: 'http://hentaigasm.com/hentai/pinkerton/',
        expected: {
          sync: false,
          title: 'Pinkerton',
          identifier: 'pinkerton',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'KissHentai', // nsfw
    url: 'http://kisshentai.net/',
    testCases: [
      {
        url:
          'http://kisshentai.net/Hentai/Bloods-Inraku-no-Ketsuzoku-2/Episode-001?id=51',
        expected: {
          sync: true,
          title: 'Bloods: Inraku no Ketsuzoku 2',
          identifier: 'Bloods-Inraku-no-Ketsuzoku-2',
          overviewUrl:
            'http://kisshentai.net/Hentai/Bloods-Inraku-no-Ketsuzoku-2',
          episode: 1,
          uiSelector: false,
        },
      },
      {
        url: 'http://kisshentai.net/Hentai/Bloods-Inraku-no-Ketsuzoku-2',
        expected: {
          sync: false,
          title: 'Bloods: Inraku no Ketsuzoku 2',
          identifier: 'Bloods-Inraku-no-Ketsuzoku-2',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'UnderHentai', // nsfw
    url: 'https://www.underhentai.net/',
    testCases: [
      // this part seems broken
      // {
      //   url: 'https://www.underhentai.net/watch/?id=647&ep=2',
      //   expected: {
      //     sync: true,
      //     title: 'Resort Boin',
      //     identifier: 'resort-boin',
      //     overviewUrl: 'https://www.underhentai.net/resort-boin',
      //     episode: 2,
      //     uiSelector: false,
      //   }
      // },
      {
        url: 'https://www.underhentai.net/resort-boin/',
        expected: {
          sync: false,
          title: 'Resort Boin',
          identifier: 'resort-boin',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'dubbedanime',
    url: 'https://ww5.dubbedanime.net/',
    testCases: [
      {
        // check for ova
        url:
          'https://ww5.dubbedanime.net/episode/89274-golden-boy-ova-3-english-dubbed#',
        expected: {
          sync: true,
          title: 'Golden Boy',
          identifier: '796-golden-boy',
          overviewUrl:
            'https://ww5.dubbedanime.net/anime/796-golden-boy/#episodes',
          nextEpUrl:
            'https://ww5.dubbedanime.net/episode/89275-golden-boy-ova-4-english-dubbed',
          episode: 3,
          uiSelector: false,
        },
      },
      {
        // check for movie
        url:
          'https://ww5.dubbedanime.net/episode/182304-a-silent-voice-movie-english-dubbed',
        expected: {
          sync: true,
          title: 'A Silent Voice MOVIE',
          identifier: '2678-a-silent-voice',
          overviewUrl:
            'https://ww5.dubbedanime.net/anime/2678-a-silent-voice/#episodes',
          nextEpUrl: undefined,
          episode: 1,
          uiSelector: false,
        },
      },
      {
        // check for anime/episode
        url:
          'https://ww5.dubbedanime.net/episode/177318-golgo-13-episode-36-english-dubbed',
        expected: {
          sync: true,
          title: 'Golgo 13',
          identifier: '3072-golgo-13',
          overviewUrl:
            'https://ww5.dubbedanime.net/anime/3072-golgo-13/#episodes',
          nextEpUrl:
            'https://ww5.dubbedanime.net/episode/177319-golgo-13-episode-37-english-dubbed',
          episode: 36,
          uiSelector: false,
        },
      },
      {
        // overview
        url: 'https://ww5.dubbedanime.net/anime/3072-golgo-13',
        expected: {
          sync: false,
          title: 'Golgo 13',
          identifier: '3072-golgo-13',
          uiSelector: true,
          epList: {
            5: 'https://ww5.dubbedanime.net/episode/177287-golgo-13-episode-5-english-dubbed',
            43: 'https://ww5.dubbedanime.net/episode/177325-golgo-13-episode-43-english-dubbed',
          },
        },
      },
    ],
  },
  {
    title: 'viz',
    url: 'https://www.viz.com/',
    skip: true,
    testCases: [
      {
        // overview
        url: 'https://www.viz.com/shonenjump/chapters/one-piece',
        expected: {
          sync: false,
          title: 'One Piece',
          identifier: 'one-piece',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'manganelo',
    url: 'https://manganelo.com/',
    testCases: [
      {
        url: 'https://manganelo.com/chapter/dr_stone/chapter_114',
        expected: {
          sync: true,
          title: 'Dr. Stone',
          identifier: 'dr_stone',
          overviewUrl: 'https://manganelo.com/manga/dr_stone',
          nextEpUrl: 'https://manganelo.com/chapter/dr_stone/chapter_115',
          episode: 114,
          uiSelector: false,
        },
      },
      {
        url: 'https://manganelo.com/manga/dr_stone',
        expected: {
          sync: false,
          title: 'Dr. Stone',
          identifier: 'dr_stone',
          uiSelector: true,
          epList: {
            5: 'https://manganelo.com/chapter/dr_stone/chapter_5',
            121: 'https://manganelo.com/chapter/dr_stone/chapter_121',
          },
        },
      },
    ],
  },
  {
    title: 'mangakakalot',
    url: 'https://mangakakalot.com/',
    testCases: [
      {
        url: 'https://mangakakalot.com/chapter/domestic_na_kanojo/chapter_203',
        expected: {
          sync: true,
          title: 'Domestic na Kanojo',
          identifier: 'domestic_na_kanojo',
          overviewUrl: 'https://mangakakalot.com/manga/domestic_na_kanojo',
          nextEpUrl:
            'https://mangakakalot.com/chapter/domestic_na_kanojo/chapter_204',
          episode: 203,
          uiSelector: false,
        },
      },
      {
        url: 'https://mangakakalot.com/manga/domestic_na_kanojo',
        expected: {
          sync: false,
          title: 'Domestic na Kanojo',
          identifier: 'domestic_na_kanojo',
          uiSelector: true,
          epList: {
            5: 'https://mangakakalot.com/chapter/domestic_na_kanojo/chapter_5',
            121: 'https://mangakakalot.com/chapter/domestic_na_kanojo/chapter_121',
          },
        },
      },
    ],
  },
  {
    title: 'NekoSama',
    url: 'https://www.neko-sama.fr/',
    testCases: [
      {
        url:
          'https://www.neko-sama.fr/anime/episode/3458-hagane-no-renkinjutsushi-fullmetal-alchemist-03-vostfr',
        expected: {
          sync: true,
          title: 'Fullmetal Alchemist: Brotherhood',
          identifier: '3458',
          overviewUrl:
            'https://www.neko-sama.fr/anime/info/3458-hagane-no-renkinjutsushi-fullmetal-alchemist',
          nextEpUrl:
            'https://www.neko-sama.fr/anime/episode/3458-hagane-no-renkinjutsushi-fullmetal-alchemist-04-vostfr',
          episode: 3,
          uiSelector: false,
        },
      },
      {
        url:
          'https://www.neko-sama.fr/anime/info/3458-hagane-no-renkinjutsushi-fullmetal-alchemist',
        expected: {
          sync: false,
          title: 'Fullmetal Alchemist: Brotherhood ',
          identifier: '3458',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'AnimeZone',
    url: 'https://www.animezone.pl/',
    skip: true,
    testCases: [
      {
        url: 'https://www.animezone.pl/odcinek/cop-craft/1',
        expected: {
          sync: true,
          title: 'Cop Craft',
          identifier: 'cop-craft',
          overviewUrl: 'https://www.animezone.pl/anime/cop-craft',
          nextEpUrl: 'https://www.animezone.pl/odcinek/cop-craft/2',
          episode: 1,
          uiSelector: false,
        },
      },
      {
        url: 'https://www.animezone.pl/anime/cop-craft',
        expected: {
          sync: false,
          title: 'Cop Craft',
          identifier: 'cop-craft',
          uiSelector: true,
          epList: {
            5: 'https://www.animezone.pl/odcinek/cop-craft/5',
          },
        },
      },
    ],
  },
  {
    title: 'AnimeOdcinki',
    url: 'https://anime-odcinki.pl/',
    testCases: [
      {
        url: 'https://anime-odcinki.pl/anime/cop-craft/1',
        expected: {
          sync: true,
          title: 'Cop Craft',
          identifier: 'cop-craft',
          overviewUrl: 'https://anime-odcinki.pl/anime/cop-craft',
          nextEpUrl: 'https://anime-odcinki.pl/anime/cop-craft/2',
          episode: 1,
          uiSelector: false,
        },
      },
      {
        url: 'https://anime-odcinki.pl/anime/cop-craft',
        expected: {
          sync: false,
          title: 'Cop Craft',
          identifier: 'cop-craft',
          uiSelector: true,
          epList: {
            5: 'https://anime-odcinki.pl/anime/cop-craft/5',
          },
        },
      },
    ],
  },
  {
    title: 'Animeflix',
    url: 'https://animeflix.io/',
    testCases: [
      {
        url: 'https://animeflix.io/shows/bleach/episode-358-927911/sub',
        expected: {
          sync: true,
          title: 'Bleach',
          identifier: 'bleach',
          overviewUrl: 'https://animeflix.io/shows/bleach',
          episode: 358,
          uiSelector: false,
        },
      },
      {
        url: 'https://animeflix.io/shows/bleach',
        expected: {
          sync: false,
          title: 'Bleach',
          identifier: 'bleach',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'serimanga',
    url: 'https://serimanga.com/',
    testCases: [
      {
        url: 'https://serimanga.com/manga/boku-no-hero-academia/224',
        expected: {
          sync: true,
          title: 'Boku no Hero Academia',
          identifier: 'boku-no-hero-academia',
          overviewUrl: 'https://serimanga.com/manga/boku-no-hero-academia',
          nextEpUrl: 'https://serimanga.com/manga/boku-no-hero-academia/225',
          episode: 224,
          uiSelector: false,
        },
      },
      {
        url: 'https://serimanga.com/manga/boku-no-hero-academia',
        expected: {
          sync: false,
          title: 'Boku no Hero Academia',
          identifier: 'boku-no-hero-academia',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'mangadenizi',
    url: 'https://mangadenizi.com/',
    testCases: [
      {
        url: 'https://mangadenizi.com/manga/one-piece/0769/2',
        expected: {
          sync: true,
          title: 'One Piece',
          identifier: 'one-piece',
          overviewUrl: 'https://mangadenizi.com/manga/one-piece',
          episode: 769,
          nextEpUrl: 'https://mangadenizi.com/manga/one-piece/0770',
          uiSelector: false,
        },
      },
      {
        url: 'https://mangadenizi.com/manga/one-piece',
        expected: {
          sync: false,
          title: 'One Piece',
          identifier: 'one-piece',
          uiSelector: true,
          epList: {
            826: 'https://mangadenizi.com/manga/one-piece/0826',
          },
        },
      },
    ],
  },
  {
    title: 'moeclip',
    url: 'https://moeclip.com/',
    testCases: [
      {
        url: 'https://moeclip.com/high-school-dxd-hero-05-sub-indo/',
        expected: {
          sync: true,
          title: 'High School DxD S4',
          identifier: 'high-school-dxd-hero',
          overviewUrl: 'https://moeclip.com/anime/high-school-dxd-hero',
          nextEpUrl: 'https://moeclip.com/high-school-dxd-hero-06-sub-indo/',
          episode: 5,
          uiSelector: false,
        },
      },
      {
        url: 'https://moeclip.com/anime/high-school-dxd-hero-sub-indo/',
        expected: {
          sync: false,
          title: 'High School DxD S4',
          identifier: 'high-school-dxd-hero',
          uiSelector: true,
          epList: {
            5: 'https://moeclip.com/high-school-dxd-hero-05-sub-indo/',
          },
        },
      },
    ],
  },
  {
    title: 'tmofans',
    url: 'https://lectortmo.com/',
    testCases: [
      {
        url: 'https://lectortmo.com/library/manga/50/one-piece',
        expected: {
          sync: false,
          title: 'One Piece',
          identifier: 'one-piece',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'unionmangas',
    url: 'https://unionmangas.top/',
    testCases: [
      {
        url: 'https://unionleitor.top/leitor/Solo_Leveling/76',
        expected: {
          sync: true,
          title: 'Solo Leveling',
          identifier: 'solo-leveling',
          overviewUrl: 'https://unionleitor.top/manga/solo-leveling',
          episode: 76,
          nextEpUrl: 'https://unionleitor.top/leitor/Solo_Leveling/77',
          uiSelector: false,
        },
      },
      {
        url: 'https://unionleitor.top/perfil-manga/solo-leveling',
        expected: {
          sync: false,
          title: 'Solo Leveling',
          identifier: 'solo-leveling',
          uiSelector: true,
          epList: {
            5: 'https://unionleitor.top/leitor/Solo_Leveling/05',
            87: 'https://unionleitor.top/leitor/Solo_Leveling/87',
            101: 'https://unionleitor.top/leitor/Solo_Leveling/101',
          },
        },
      },
    ],
  },
  {
    title: 'MangaPlus',
    url: 'https://mangaplus.shueisha.co.jp/',
    testCases: [
      {
        url: 'https://mangaplus.shueisha.co.jp/viewer/1000393',
        expected: {
          sync: true,
          title: 'My Hero Academia',
          identifier: '100017',
          overviewUrl: 'https://mangaplus.shueisha.co.jp/titles/100017',
          episode: 4,
          uiSelector: false,
        },
      },
      {
        url: 'https://mangaplus.shueisha.co.jp/titles/100017',
        expected: {
          sync: false,
          title: 'My Hero Academia',
          identifier: '100017',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'JapScan',
    url: 'https://www.japscan.co/',
    testCases: [
      {
        url: 'https://www.japscan.co/lecture-en-ligne/one-punch-man/119/',
        expected: {
          sync: true,
          title: 'One Punch Man',
          identifier: 'one-punch-man',
          overviewUrl: 'https://www.japscan.co/manga/one-punch-man/',
          nextEpUrl:
            'https://www.japscan.co/lecture-en-ligne/one-punch-man/120/',
          episode: 119,
          uiSelector: false,
        },
      },
      {
        // manga overview
        url: 'https://www.japscan.co/manga/one-punch-man/',
        expected: {
          sync: false,
          title: 'One Punch Man',
          identifier: 'one-punch-man',
          uiSelector: true,
          epList: {
            5: 'https://www.japscan.co/lecture-en-ligne/one-punch-man/5/',
            166: 'https://www.japscan.co/lecture-en-ligne/one-punch-man/166/',
          },
        },
      },
      {
        // manhwa overview
        url: 'https://www.japscan.co/manga/solo-leveling/',
        expected: {
          sync: false,
          title: 'Solo Leveling',
          identifier: 'solo-leveling',
          uiSelector: true,
          epList: {
            5: 'https://www.japscan.co/lecture-en-ligne/solo-leveling/5/',
            92: 'https://www.japscan.co/lecture-en-ligne/solo-leveling/92/',
          },
        },
      },
    ],
  },
  {
    title: 'MangaKisa',
    url: 'https://mangakisa.com/',
    testCases: [
      {
        url: 'https://mangakisa.com/solo-leveling-chapterid-4318',
        expected: {
          sync: true,
          title: 'Solo Leveling',
          identifier: 'solo-leveling',
          overviewUrl: 'https://mangakisa.com/solo-leveling',
          nextEpUrl: 'https://mangakisa.com/solo-leveling-chapterid-4228',
          episode: 59,
          uiSelector: false,
        },
      },
      {
        url: 'https://mangakisa.com/solo-leveling',
        expected: {
          sync: false,
          title: 'Solo Leveling',
          identifier: 'solo-leveling',
          uiSelector: true,
          epList: {
            5: 'https://mangakisa.com/solo-leveling-chapterid-9457',
            92: 'https://mangakisa.com/solo-leveling-chapterid-500210',
          },
        },
      },
    ],
  },
  {
    title: 'HentaiKisa',
    url: 'https://hentaikisa.com/',
    testCases: [
      {
        url: 'https://hentaikisa.com/joshi-luck!-episode-1',
        expected: {
          sync: true,
          title: 'Joshi Luck!',
          identifier: 'joshi-luck!',
          overviewUrl: 'https://hentaikisa.com/joshi-luck!',
          episode: 1,
          nextEpUrl: 'https://hentaikisa.com/joshi-luck!-episode-2',
          uiSelector: false,
        },
      },
      {
        url: 'https://hentaikisa.com/joshi-luck!',
        expected: {
          sync: false,
          title: 'Joshi Luck!',
          identifier: 'joshi-luck!',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'AnimesVision',
    url: 'https://www.animesvision.com.br/',
    skip: true, // geolock
    testCases: [
      {
        // anime
        url:
          'https://www.animesvision.com.br/animes/strike-the-blood-3/episodio-04/legendado',
        expected: {
          sync: true,
          title: 'Strike the Blood 3',
          identifier: 'strike-the-blood-3',
          overviewUrl:
            'https://www.animesvision.com.br/animes/strike-the-blood-3',
          nextEpUrl:
            'https://www.animesvision.com.br/animes/strike-the-blood-3/episodio-05/legendado',
          episode: 4,
          uiSelector: false,
        },
      },
      {
        // anime overview
        url: 'https://www.animesvision.com.br/animes/strike-the-blood-3',
        expected: {
          sync: false,
          title: 'Strike the Blood 3',
          identifier: 'strike-the-blood-3',
          uiSelector: true,
          epList: {
            5: 'https://www.animesvision.com.br/animes/strike-the-blood-3/episodio-05/legendado',
          },
        },
      },
      {
        // movie
        url:
          'https://www.animesvision.com.br/animes/mahouka-koukou-no-rettousei-movie-hoshi-wo-yobu-shoujo/filme-legendado/legendado',
        expected: {
          sync: true,
          title: 'Mahouka Koukou no Rettousei Movie: Hoshi wo Yobu Shoujo',
          identifier: 'mahouka-koukou-no-rettousei-movie-hoshi-wo-yobu-shoujo',
          overviewUrl:
            'https://www.animesvision.com.br/animes/mahouka-koukou-no-rettousei-movie-hoshi-wo-yobu-shoujo',
          nextEpUrl: undefined,
          episode: 1,
          uiSelector: false,
        },
      },
      {
        // movie overview
        url:
          'https://www.animesvision.com.br/filmes/mahouka-koukou-no-rettousei-movie-hoshi-wo-yobu-shoujo',
        expected: {
          sync: false,
          title: 'Mahouka Koukou no Rettousei Movie: Hoshi wo Yobu Shoujo',
          identifier: 'mahouka-koukou-no-rettousei-movie-hoshi-wo-yobu-shoujo',
          uiSelector: true,
        },
      },
      {
        // dub
        url:
          'https://www.animesvision.com.br/animes/nanatsu-no-taizai-dublado/episodio-06/dublado',
        expected: {
          sync: true,
          title: 'Nanatsu no Taizai',
          identifier: 'nanatsu-no-taizai-dublado',
          overviewUrl:
            'https://www.animesvision.com.br/animes/nanatsu-no-taizai-dublado',
          nextEpUrl:
            'https://www.animesvision.com.br/animes/nanatsu-no-taizai-dublado/episodio-07/dublado',
          episode: 6,
          uiSelector: false,
        },
      },
      {
        // dub overview
        url: 'https://www.animesvision.com.br/animes/nanatsu-no-taizai-dublado',
        expected: {
          sync: false,
          title: 'Nanatsu no Taizai',
          identifier: 'nanatsu-no-taizai-dublado',
          uiSelector: true,
          epList: {
            5: 'https://www.animesvision.com.br/animes/nanatsu-no-taizai-dublado/episodio-05/dublado',
          },
        },
      },
    ],
  },
  {
    title: 'FallenAngels',
    url: 'https://manga.fascans.com/',
    testCases: [
      {
        url: 'https://manga.fascans.com/manga/plunderer/53/2',
        expected: {
          sync: true,
          title: 'Plunderer',
          identifier: 'plunderer',
          overviewUrl: 'https://manga.fascans.com/manga/plunderer',
          episode: 53,
          nextEpUrl: 'https://manga.fascans.com/manga/plunderer/54',
          uiSelector: false,
        },
      },
      {
        url: 'https://manga.fascans.com/manga/plunderer',
        expected: {
          sync: false,
          title: 'Plunderer',
          identifier: 'plunderer',
          uiSelector: true,
          epList: {
            53: 'https://manga.fascans.com/manga/plunderer/53',
            18: 'https://manga.fascans.com/manga/plunderer/18',
          },
        },
      },
    ],
  },
  {
    title: 'animestrue',
    url: 'https://www.animestrue.site/',
    testCases: [
      {
        // season 1 syncpage
        url:
          'https://www.animestrue.site/anime/highschool-dxd/temporada1/episodio2',
        expected: {
          sync: true,
          title: 'Highschool DxD',
          identifier: 'highschool-dxd?s=1',
          overviewUrl:
            'https://www.animestrue.site/anime/highschool-dxd/temporada1',
          episode: 2,
          nextEpUrl:
            'https://www.animestrue.site/anime/highschool-dxd/temporada1/episodio3',
          uiSelector: false,
        },
      },
      {
        // season 1 overview
        url: 'https://www.animestrue.site/anime/highschool-dxd/temporada1',
        expected: {
          sync: false,
          title: 'Highschool DxD',
          identifier: 'highschool-dxd?s=1',
          uiSelector: true,
          epList: {
            5: 'https://www.animestrue.site/anime/highschool-dxd/temporada1/episodio5',
          },
        },
      },
      {
        // season 4 syncpage
        url:
          'https://www.animestrue.site/anime/highschool-dxd/temporada4/episodio2',
        expected: {
          sync: true,
          title: 'Highschool DxD season 4',
          identifier: 'highschool-dxd?s=4',
          overviewUrl:
            'https://www.animestrue.site/anime/highschool-dxd/temporada4',
          episode: 2,
          nextEpUrl:
            'https://www.animestrue.site/anime/highschool-dxd/temporada4/episodio3',
          uiSelector: false,
        },
      },
      {
        // season 4 overview
        url: 'https://www.animestrue.site/anime/highschool-dxd/temporada4',
        expected: {
          sync: false,
          title: 'Highschool DxD season 4',
          identifier: 'highschool-dxd?s=4',
          uiSelector: true,
          epList: {
            5: 'https://www.animestrue.site/anime/highschool-dxd/temporada4/episodio5',
          },
        },
      },
    ],
  },
  {
    title: 'PrimeVideo',
    url: 'https://www.primevideo.com/',
    skip: true,
    testCases: [
      {
        // season 1 overview
        url: 'https://www.primevideo.com/detail/0HSUS652VW673MGGPPLZXZ6O8C',
        expected: {
          sync: false,
          title: 'BEATLESS',
          identifier: '0HSUS652VW673MGGPPLZXZ6O8C',
          uiSelector: true,
        },
      },
      {
        // season 2 overview
        url: 'https://www.primevideo.com/detail/0K1UMWRFQ63FY6Z8PC9BK376J8',
        expected: {
          sync: false,
          title: "Chi's Sweet Adventure Season 2",
          identifier: '0K1UMWRFQ63FY6Z8PC9BK376J8',
          uiSelector: true,
        },
      },
      {
        // season 3 overview
        url: 'https://www.primevideo.com/detail/0GMA6H790B7EMLNVN83K54XMRA',
        expected: {
          sync: false,
          title: 'PSYCHO-PASS 3',
          identifier: '0GMA6H790B7EMLNVN83K54XMRA',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'MangaKatana',
    url: 'http://mangakatana.com/',
    testCases: [
      {
        // obfuscated manga
        url: 'http://mangakatana.com/manga/solo-leveling.21708/c103',
        expected: {
          sync: true,
          title: 'Solo Leveling',
          identifier: 'solo-leveling.21708',
          overviewUrl: 'http://mangakatana.com/manga/solo-leveling.21708',
          episode: 103,
          nextEpUrl: 'http://mangakatana.com/manga/solo-leveling.21708/c104',
          uiSelector: false,
        },
      },
      {
        // obfuscated overview
        url: 'http://mangakatana.com/manga/solo-leveling.21708',
        expected: {
          sync: false,
          title: 'Solo Leveling',
          identifier: 'solo-leveling.21708',
          uiSelector: true,
          epList: {
            102: 'http://mangakatana.com/manga/solo-leveling.21708/c102',
            2: 'http://mangakatana.com/manga/solo-leveling.21708/c2',
          },
        },
      },
      {
        // manga
        url:
          'http://mangakatana.com/manga/mahouka-koukou-no-rettousei-yokohama-souran-hen.9014/c4',
        expected: {
          sync: true,
          title: 'Mahouka Koukou no Rettousei - Yokohama Souran Hen',
          identifier: 'mahouka-koukou-no-rettousei-yokohama-souran-hen.9014',
          overviewUrl:
            'http://mangakatana.com/manga/mahouka-koukou-no-rettousei-yokohama-souran-hen.9014',
          episode: 4,
          nextEpUrl:
            'http://mangakatana.com/manga/mahouka-koukou-no-rettousei-yokohama-souran-hen.9014/c5',
          uiSelector: false,
        },
      },
      {
        // overview
        url:
          'http://mangakatana.com/manga/mahouka-koukou-no-rettousei-yokohama-souran-hen.9014',
        expected: {
          sync: false,
          title: 'Mahouka Koukou no Rettousei - Yokohama Souran Hen',
          identifier: 'mahouka-koukou-no-rettousei-yokohama-souran-hen.9014',
          uiSelector: true,
          epList: {
            4: 'http://mangakatana.com/manga/mahouka-koukou-no-rettousei-yokohama-souran-hen.9014/c4',
          },
        },
      },
    ],
  },
  {
    title: 'manga4life',
    url: 'https://manga4life.com/',
    testCases: [
      {
        url:
          'https://manga4life.com/read-online/Solo-Leveling-chapter-105-page-1.html',
        expected: {
          sync: true,
          title: 'Solo Leveling',
          identifier: 'Solo-Leveling',
          overviewUrl: 'https://manga4life.com/manga/Solo-Leveling',
          episode: 105,
          uiSelector: false,
        },
      },
      {
        url: 'https://manga4life.com/manga/Solo-Leveling',
        expected: {
          sync: false,
          title: 'Solo Leveling',
          identifier: 'Solo-Leveling',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'bato',
    url: 'https://bato.to/',
    testCases: [
      {
        url: 'https://bato.to/chapter/1403185',
        expected: {
          sync: true,
          title: 'Solo Leveling',
          identifier: '72860',
          overviewUrl: 'https://bato.to/series/72860',
          nextEpUrl: 'https://bato.to/chapter/1405642',
          episode: 104,
          uiSelector: false,
        },
      },
      {
        url: 'https://bato.to/series/72860',
        expected: {
          sync: false,
          title: 'Solo Leveling',
          identifier: '72860',
          uiSelector: true,
          epList: {
            5: 'https://bato.to/chapter/1284843',
            105: 'https://bato.to/chapter/1405642',
          },
        },
      },
    ],
  },
  {
    title: 'DreamSub',
    url: 'https://dreamsub.stream/',
    testCases: [
      {
        url: 'https://dreamsub.stream/anime/one-piece/59',
        expected: {
          sync: true,
          title: 'One Piece',
          identifier: 'one-piece',
          overviewUrl: 'https://dreamsub.stream/anime/one-piece',
          nextEpUrl: 'https://dreamsub.stream/anime/one-piece/60',
          episode: 59,
          uiSelector: false,
          epList: {
            5: 'https://dreamsub.stream/anime/one-piece/5',
            914: 'https://dreamsub.stream/anime/one-piece/914',
          },
        },
      },
      {
        url: 'https://dreamsub.stream/anime/one-piece',
        expected: {
          sync: false,
          title: 'One Piece',
          identifier: 'one-piece',
          uiSelector: true,
          epList: {
            5: 'https://dreamsub.stream/anime/one-piece/5',
            914: 'https://dreamsub.stream/anime/one-piece/914',
          },
        },
      },
    ],
  },
  {
    title: 'MangaPark',
    url: 'https://mangapark.net/',
    testCases: [
      {
        url:
          'https://mangapark.net/manga/grand-blue-inoue-kenji/i2086171/v5/c20/1',
        expected: {
          sync: true,
          title: 'Grand Blue',
          identifier: 'grand-blue-inoue-kenji',
          overviewUrl: 'https://mangapark.net/manga/grand-blue-inoue-kenji',
          nextEpUrl:
            'https://mangapark.net/manga/grand-blue-inoue-kenji/i2086169/v5/c21/1',
          episode: 20,
          uiSelector: false,
        },
      },
      {
        url: 'https://mangapark.net/manga/grand-blue-inoue-kenji',
        expected: {
          sync: false,
          title: 'Grand Blue',
          identifier: 'grand-blue-inoue-kenji',
          uiSelector: true,
        },
      },
    ],
  },
  {
    // nsfw
    title: 'Nhentai',
    url: 'https://nhentai.net/',
    testCases: [
      {
        url: 'https://nhentai.net/g/306629/1',
        expected: {
          sync: true,
          title: 'Tamamo no Ushiro',
          identifier: '306629',
          overviewUrl: 'https://nhentai.net/g/306629',
          episode: 1,
          uiSelector: false,
        },
      },
      {
        url: 'https://nhentai.net/g/306629/',
        expected: {
          sync: false,
          title: 'Tamamo no Ushiro',
          identifier: '306629',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'AnimeXin',
    url: 'https://animexin.xyz/',
    testCases: [
      {
        url:
          'https://animexin.xyz/the-daily-life-of-the-immortal-king-episode-8-subbed/',
        expected: {
          sync: true,
          title: 'The Daily Life of the Immortal King',
          identifier: 'the-daily-life-of-the-immortal-king',
          overviewUrl:
            'https://animexin.xyz/anime/the-daily-life-of-the-immortal-king/',
          nextEpUrl:
            'https://animexin.xyz/the-daily-life-of-the-immortal-king-episode-9-subbed/',
          episode: 8,
          uiSelector: false,
        },
      },
      {
        url: 'https://animexin.xyz/anime/the-daily-life-of-the-immortal-king/',
        expected: {
          sync: false,
          title: 'The Daily Life of the Immortal King',
          identifier: 'the-daily-life-of-the-immortal-king',
          uiSelector: true,
          epList: {
            8: 'https://animexin.xyz/the-daily-life-of-the-immortal-king-episode-8-subbed/',
          },
        },
      },
    ],
  },
  {
    title: 'MonosChinos',
    url: 'https://monoschinos.com/',
    testCases: [
      {
        url: 'https://monoschinos.com/ver/toaru-kagaku-no-railgun-t-episodio-8',
        expected: {
          sync: true,
          title: 'Toaru Kagaku no Railgun T',
          identifier: 'toaru-kagaku-no-railgun-t-sub-espanol',
          overviewUrl:
            'https://monoschinos.com/anime/toaru-kagaku-no-railgun-t-sub-espanol',
          nextEpUrl:
            'https://monoschinos.com/ver/toaru-kagaku-no-railgun-t-episodio-9',
          episode: 8,
          uiSelector: false,
        },
      },
      {
        url:
          'https://monoschinos.com/anime/toaru-kagaku-no-railgun-t-sub-espanol',
        expected: {
          sync: false,
          title: 'Toaru Kagaku no Railgun T',
          identifier: 'toaru-kagaku-no-railgun-t-sub-espanol',
          uiSelector: true,
          epList: {
            8: 'https://monoschinos.com/ver/toaru-kagaku-no-railgun-t-episodio-8',
          },
        },
      },
    ],
  },
  {
    title: 'AnimeFire',
    url: 'https://animefire.net/',
    testCases: [
      {
        url: 'https://animefire.net/animes/high-school-dxd-born/6',
        expected: {
          sync: true,
          title: 'high school dxd born',
          identifier: 'high-school-dxd-born',
          overviewUrl:
            'https://animefire.net/animes/high-school-dxd-born-todos-os-episodios',
          nextEpUrl: 'https://animefire.net/animes/high-school-dxd-born/7',
          episode: 6,
          uiSelector: false,
        },
      },
    ],
  },
  {
    title: 'OtakuFR',
    url: 'https://www.otakufr.com/',
    testCases: [
      {
        url: 'https://www.otakufr.com/Ahiru-no-Sora-Vostfr/21/',
        expected: {
          sync: true,
          title: 'Ahiru no Sora',
          identifier: 'Ahiru-no-Sora-Vostfr',
          overviewUrl: 'https://www.otakufr.com/Ahiru-no-Sora-Vostfr/',
          nextEpUrl: 'https://www.otakufr.com/Ahiru-no-Sora-Vostfr/22/',
          episode: 21,
          uiSelector: false,
        },
      },
      {
        url: 'https://www.otakufr.com/Ahiru-no-Sora-Vostfr/',
        expected: {
          sync: false,
          title: 'Ahiru no Sora',
          identifier: 'Ahiru-no-Sora-Vostfr',
          uiSelector: true,
        },
      },
    ],
  },
  {
    title: 'Samehadaku',
    url: 'https://samehadaku.vip/',
    testCases: [
      {
        url: 'https://samehadaku.vip/tower-of-god-episode-3/',
        expected: {
          sync: true,
          title: 'Tower of God',
          identifier: 'tower-of-god',
          overviewUrl: 'https://samehadaku.vip/anime/tower-of-god/',
          nextEpUrl: 'https://samehadaku.vip/tower-of-god-episode-4/',
          episode: 3,
          uiSelector: false,
        },
      },
      {
        url: 'https://samehadaku.vip/anime/tower-of-god/',
        expected: {
          sync: false,
          title: 'Tower of God',
          identifier: 'tower-of-god',
          uiSelector: true,
          epList: {
            3: 'https://samehadaku.vip/tower-of-god-episode-3/',
          },
        },
      },
    ],
  },
  {
    title: 'Tsuki Mangás',
    url: 'https://www.tsukimangas.com/',
    testCases: [
      {
        url: 'https://www.tsukimangas.com/leitor/boku-no-hero-academia/257#1',
        expected: {
          sync: true,
          title: 'Boku no Hero Academia',
          identifier: 'boku-no-hero-academia',
          overviewUrl:
            'https://www.tsukimangas.com/manga/boku-no-hero-academia',
          nextEpUrl:
            'https://www.tsukimangas.com/leitor/boku-no-hero-academia/258',
          episode: 257,
          uiSelector: false,
        },
      },
      {
        url: 'https://www.tsukimangas.com/manga/boku-no-hero-academia',
        expected: {
          sync: false,
          title: 'Boku no Hero Academia',
          identifier: 'boku-no-hero-academia',
          uiSelector: true,
          epList: {
            269: 'https://www.tsukimangas.com/leitor/boku-no-hero-academia/269',
          },
        },
      },
    ],
  },
  {
    title: 'mangatx',
    url: 'https://mangatx.com/',
    testCases: [
      {
        url: 'https://mangatx.com/manga/solo-leveling-manhwa-free/chapter-108/',
        expected: {
          sync: true,
          title: 'Solo Leveling',
          identifier: 'solo-leveling-manhwa-free',
          overviewUrl: 'https://mangatx.com/manga/solo-leveling-manhwa-free/',
          nextEpUrl:
            'https://mangatx.com/manga/solo-leveling-manhwa-free/chapter-109/',
          episode: 108,
          uiSelector: false,
        },
      },
      {
        url: 'https://mangatx.com/manga/solo-leveling-manhwa-free/',
        expected: {
          sync: false,
          title: 'Solo Leveling',
          identifier: 'solo-leveling-manhwa-free',
          uiSelector: true,
          epList: {
            1: 'https://mangatx.com/manga/solo-leveling-manhwa-free/chapter-1/',
            108: 'https://mangatx.com/manga/solo-leveling-manhwa-free/chapter-108/',
          },
        },
      },
    ],
  },

  // IconCaptcha in use
  // Should only be used with `headless: false`
  // and manuel captcha validation is required
  // {
  //   title: 'TRanimeizle',
  //   url: 'https://www.tranimeizle.com',
  //   testCases: [
  //     {
  //       url: 'https://www.tranimeizle.com/anime/one-punch-man-izle-hd',
  //       expected: {
  //         sync: false,
  //         title: 'One Punch Man İzle',
  //         identifier: 'one-punch-man-izle-hd',
  //         uiSelector: true,
  //         epList: {
  //           9: 'https://www.tranimeizle.com/one-punch-man-9-bolum-izle'
  //         }
  //       }
  //     },
  //     {
  //       url: 'https://www.tranimeizle.com/one-punch-man-2-bolum-izle',
  //       expected: {
  //         sync: true,
  //         title: 'One Punch Man İzle',
  //         identifier: 'one-punch-man-izle-hd',
  //         overviewUrl: 'https://www.tranimeizle.com/anime/one-punch-man-izle-hd',
  //         nextEpUrl: 'https://www.tranimeizle.com/one-punch-man-3-bolum-izle',
  //         episode: 2,
  //         uiSelector: false,
  //       }
  //     },
  //   ]
  // },
];

// Define global variables
let browser;
let page;
const debugging = false;
// var caseTitle = 'Proxer';

before(async () => {
  puppeteer.use(pluginStealth());
  puppeteer.use(AdblockerPlugin());
  browser = await puppeteer.launch({ headless: true });
});

beforeEach(async () => {
  page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
});

afterEach(async () => {
  await page.close();
});

after(async () => {
  await browser.close();
});

testsArray.forEach((testPage) => {
  if (typeof caseTitle !== 'undefined' && caseTitle !== testPage.title) return;
  describe(testPage.title, () => {
    let doSkip = false;
    if (typeof testPage.skip !== 'undefined' && testPage.skip) doSkip = true;
    if (skipTest) doSkip = !doSkip;

    it('Online', async function () {
      if (doSkip) this.skip();
      const [response] = await Promise.all([
        page.goto(testPage.url, { timeout: 0 }),
        page.waitForNavigation({ timeout: 0 }),
      ]);

      if (parseInt(response.headers().status) !== 200) {
        console.log(`    X Online ${response.headers().status}`);

        const content = await page.evaluate(() => document.body.innerHTML);
        if (content.indexOf('Why do I have to complete a CAPTCHA?') !== -1) {
          console.log('    X CAPTCHA');
          doSkip = true;
          this.skip();
        }
      }
    });

    testPage.testCases.forEach((testCase) => {
      it(testCase.url, async function () {
        if (doSkip) this.skip();
        const [response] = await Promise.all([
          page.goto(testCase.url, { timeout: 0 }),
          page.waitForNavigation({ timeout: 0 }),
        ]);
        await page
          .addScriptTag({
            url:
              'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js',
          })
          .catch(() => page.addScriptTag({
              url:
                'https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js',
            }));
        await page.addScriptTag({ content: script });
        const text = await page.evaluate(() => MalSyncTest());

        if (debugging) console.log(text);

        if (text === 'retry') {
          this.retries(3);
          await new Promise(((resolve, reject) => {
            setTimeout(async () => {
              const content = await page.evaluate(
                () => document.body.innerHTML,
              );
              if (
                content.indexOf('Why do I have to complete a CAPTCHA?') !== -1
              ) {
                console.log('    X CAPTCHA');
                doSkip = true;
              }
              resolve();
            }, 7000);
          }));
        }

        expect(text.sync, 'Sync').to.equal(testCase.expected.sync);
        expect(text.title, 'Title').to.equal(testCase.expected.title);
        expect(text.identifier, 'Identifier').to.equal(
          testCase.expected.identifier,
        );
        if (text.sync) {
          expect(text.episode, 'Episode').to.equal(testCase.expected.episode);
          var textOverview = typeof text.overviewUrl !== 'undefined'
              ? text.overviewUrl.replace(/www[^.]*\./, '')
              : text.overviewUrl;
          var testCaseOverview = typeof testCase.expected.overviewUrl !== 'undefined'
              ? testCase.expected.overviewUrl.replace(/www[^.]*\./, '')
              : testCase.expected.overviewUrl;
          expect(textOverview, 'Overview Url').to.equal(
            testCase.expected.overviewUrl.replace(/www[^.]*\./, ''),
          );
          var textOverview = typeof text.nextEpUrl !== 'undefined'
              ? text.nextEpUrl.replace(/www[^.]*\./, '')
              : text.nextEpUrl;
          var testCaseOverview = typeof testCase.expected.nextEpUrl !== 'undefined'
              ? testCase.expected.nextEpUrl.replace(/www[^.]*\./, '')
              : testCase.expected.nextEpUrl;
          expect(textOverview, 'Next Episode').to.equal(testCaseOverview);
        }
        if (typeof text.uiSelector !== 'undefined') {
          expect(text.uiSelector === 'TEST-UI', 'UI').to.equal(
            testCase.expected.uiSelector,
          );
        }
        if (
          typeof text.epList !== 'undefined'
          && typeof testCase.expected.epList !== 'undefined'
        ) {
          for (const key in testCase.expected.epList) {
            expect(
              testCase.expected.epList[key].replace(/www[^.]*\./, ''),
              `EP${key}`,
            ).to.equal(text.epList[key].replace(/www[^.]*\./, ''));
          }
        }
      });
    });
  });
});
