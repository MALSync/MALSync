const {expect} = require('chai');
const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");

const fs = require('fs');
const script = fs.readFileSync(__dirname + '/../dist/testCode.js', 'utf8');

var testsArray = [
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
        }
      },

      {
        url: 'https://www.crunchyroll.com/de/ai-mai-mi-mousou-catastrophe/episode-3-untitled-658389',
        expected: {
          sync: true,
          title: 'Ai-Mai-Mi Mousou Catastrophe',
          identifier: 'Ai-Mai-Mi Mousou Catastrophe',
          overviewUrl: 'https://www.crunchyroll.com/ai-mai-mi-mousou-catastrophe?season=Ai-Mai-Mi Mousou Catastrophe',
          nextEpUrl: 'http://www.crunchyroll.com/de/ai-mai-mi-mousou-catastrophe/episode-4-untitled-658391',
          episode: 3,
          uiSelector: false,
        }
      },
      {
        url: 'https://www.crunchyroll.com/de/katana-maidens-toji-no-miko/episode-125-short-version-digest-758955',
        expected: {
          sync: true,
          title: 'Katana Maidens ~ Toji No Miko',
          identifier: 'Katana Maidens ~ Toji No Miko',
          episode: 12,
          overviewUrl: 'https://www.crunchyroll.com/katana-maidens-toji-no-miko?season=Katana Maidens ~ Toji No Miko',
          nextEpUrl: 'http://www.crunchyroll.com/de/katana-maidens-toji-no-miko/episode-13-hero-of-the-next-generation-768501'
        }
      },
    ]
  },

  {
    title: 'Kissanime',
    url: 'https://kissanime.ru/',
    testCases: [
      {
        url: 'https://kissanime.ru/Anime/No-Game-No-Life',
        expected: {
          sync: false,
          title: 'No Game No Life (Sub)',
          identifier: 'No-Game-No-Life',
          uiSelector: true,
        }
      },
      {
        url: 'https://kissanime.ru/Anime/No-Game-No-Life-Dub/Episode-004?id=112019&s=rapidvideo',
        expected: {
          sync: true,
          title: 'No Game No Life (Dub)',
          identifier: 'No-Game-No-Life-Dub',
          overviewUrl: 'https://kissanime.ru/Anime/No-Game-No-Life-Dub',
          nextEpUrl: 'https://kissanime.ru/Anime/No-Game-No-Life-Dub/Episode-005?id=112020',
          episode: 4,
          uiSelector: false,
        }
      },
    ]
  },

  {
    title: '9anime',
    url: 'https://www1.9anime.nl/',
    testCases: [
      {
        url: 'https://www1.9anime.nl/watch/no-game-no-life-dub.y2p0/mlkqnp',
        expected: {
          sync: true,
          title: 'No Game, No Life (Dub)',
          identifier: 'y2p0',
          overviewUrl: 'https://www1.9anime.nl/watch/no-game-no-life-dub.y2p0',
          nextEpUrl: 'https://9anime.to/watch/no-game-no-life-dub.y2p0/79qwl7',
          episode: 4,
          uiSelector: true,
        }
      },
    ]
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
        }
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
        }
      },
    ]
  },

  {
    title: 'twist.moe',
    url: 'https://twist.moe/a/no-game-no-life/4',
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
        }
      },
    ]
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
        }
      },
      {
        url: 'https://www.anime4you.one/show/1/aid/779/epi/4/#vidplayer',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: '779',
          overviewUrl: 'https://www.anime4you.one/show/1/aid/779',
          nextEpUrl: 'https://www.anime4you.one/show/1/aid/779/epi/5/?host=#vidplayer',
          episode: 4,
          uiSelector: true,
        }
      },
    ]
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
        }
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
        }
      },
    ]
  },

  {
    title: 'Kissmanga',
    url: 'https://kissmanga.com/',
    testCases: [
      {
        url: 'https://kissmanga.com/Manga/No-Game-No-Life',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'No-Game-No-Life',
          uiSelector: true,
        }
      },
      {
        url: 'https://kissmanga.com/Manga/No-Game-No-Life/Ch-003--Game-003?id=167047',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'No-Game-No-Life',
          overviewUrl: 'https://kissmanga.com/Manga/No-Game-No-Life',
          episode: 3,
          uiSelector: false,
        }
      },
    ]
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
        }
      },
      {
        url: 'https://mangadex.org/chapter/57332',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: '8173',
          overviewUrl: 'https://www.mangadex.org/title/8173/no-game-no-life',
          episode: 4,
          uiSelector: false,
        }
      },
    ]
  },

  {
    title: 'Mangarock',
    url: 'https://mangarock.com/',
    testCases: [
      {
        url: 'https://mangarock.com/manga/mrs-serie-179306',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: '179306',
          uiSelector: true,
        }
      },
      {
        url: 'https://mangarock.com/manga/mrs-serie-179306/chapter/mrs-chapter-179312',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: '179306',
          overviewUrl: 'https://mangarock.com/manga/mrs-serie-179306',
          episode: 6,
          uiSelector: false,
        }
      },
    ]
  },

  {
    title: 'Branitube',
    url: 'https://www.branitube.org/',
    testCases: [
      {
        url: 'https://www.branitube.org/animes/no-game-no-life',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          uiSelector: true,
        }
      },
      {
        url: 'https://www.branitube.org/assistir/no-game-no-life/episodio/005',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          overviewUrl: 'https://branitube.org/animes/no-game-no-life',
          nextEpUrl: 'https://branitube.org/assistir/no-game-no-life/episodio/006',
          episode: 5,
          uiSelector: false,
        }
      },
    ]
  },

  {
    title: 'Otakustream',
    url: 'https://otakustream.tv',
    testCases: [
      {
        url: 'https://otakustream.tv/anime/no-game-no-life/',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          uiSelector: true,
        }
      },
      {
        url: 'https://otakustream.tv/anime/no-game-no-life/episode-10/',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          overviewUrl: 'https://otakustream.tv/anime/no-game-no-life',
          nextEpUrl: 'https://otakustream.tv/anime/no-game-no-life/episode-11/',
          episode: 10,
          uiSelector: false,
        }
      },
    ]
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
        }
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
        }
      },
    ]
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
        }
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
        }
      },
    ]
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
        }
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
        }
      },
    ]
  },

  {
    title: 'Proxer',
    url: 'https://proxer.me/',
    testCases: [
      {
        url: 'https://proxer.me/watch/6587/2/gerdub',
        expected: {
          sync: true,
          identifier: '6587',
          episode: 2,
          title: 'No Game No Life',
          overviewUrl: 'https://proxer.me/info/6587/list',
          nextEpUrl: 'https://proxer.me/watch/6587/3/gerdub'
        }
      },
      {
        url: 'https://proxer.me/info/6587',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: '6587',
          uiSelector: true,
        }
      },
      {
        url: 'https://proxer.me/info/6587/list',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: '6587',
          uiSelector: false,
        }
      },
    ]
  },

  {
    title: 'Animevibe',
    url: 'https://animevibe.xyz',
    testCases: [
      {
        url: 'https://animevibe.xyz/a/no-game-no-life/4/',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          overviewUrl: 'https://animevibe.tv/a/no-game-no-life/1',
          episode: 4,
          uiSelector: false,
        }
      },
    ]
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
        }
      },
      {
        url: 'https://novelplanet.com/Novel/No-Game-No-Life/Volume-1-Chapter-3?id=125572',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'No-Game-No-Life',
          overviewUrl: 'https://novelplanet.com/Novel/No-Game-No-Life',
          episode: 3,
          uiSelector: true,
        }
      },
    ]
  },

  {
    title: 'Kawaiifu',
    url: 'https://kawaiifu.com/',
    testCases: [
      {
        url: 'https://kawaiifu.com/season/spring-2015/plastic-memories-bluray-ver-720p.html?ep=4',
        expected: {
          sync: true,
          title: 'Plastic Memories (Bluray Ver.)',
          identifier: 'plastic-memories-bluray-ver-720p',
          overviewUrl: 'https://kawaiifu.com/season/spring-2015/plastic-memories-bluray-ver-720p.html',
          episode: 4,
          uiSelector: true,
        }
      },
    ]
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
          uiSelector: false,
        }
      },
      {
        url: 'https://4anime.to/anime/no-game-no-life',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          uiSelector: true,
        }
      },
    ]
  },

  {
    title: 'Dreamanimes',
    url: 'https://dreamanimes.com.br/',
    testCases: [
      {
        url: 'https://dreamanimes.com.br/online/legendado/no-game-no-life/episodio/4',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          overviewUrl: 'https://dreamanimes.com.br/anime-info/no-game-no-life',
          episode: 4,
          uiSelector: false,
        }
      },
      {
        url: 'https://dreamanimes.com.br/anime-info/no-game-no-life',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          uiSelector: true,
        }
      },
    ]
  },

  {
    title: 'animeultima',
    url: 'https://www10.animeultima.eu/',
    testCases: [
      {
        url: 'https://www10.animeultima.eu/a/no-game-no-life_804789/episode-4_760357-sub',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life_804789',
          overviewUrl: 'https://www10.animeultima.eu/a/no-game-no-life_804789',
          episode: 4,
          uiSelector: false,
        }
      },
      {
        url: 'https://www10.animeultima.eu/a/no-game-no-life_804789',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life_804789',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'aniflix',
    url: 'https://www.aniflix.tv/',
    testCases: [
      {
        url: 'https://www.aniflix.tv/stream/no-game-no-life-folge-4-ger-dub/',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          overviewUrl: 'https://www.aniflix.tv/anime/tv/no-game-no-life-ger-dub/',
          episode: 4,
          uiSelector: true,
        }
      },
      {
        url: 'https://www.aniflix.tv/anime/tv/no-game-no-life-ger-dub/',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          uiSelector: true,
        }
      },
    ]
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
          overviewUrl: 'https://animedaisuki.moe/anime/524/initial-d-first-stage',
          episode: 5,
          uiSelector: false,
        }
      },
      {
        url: 'https://animedaisuki.moe/anime/524/initial-d-first-stage',
        expected: {
          sync: false,
          title: 'Initial D: First Stage',
          identifier: 'initial-d-first-stage',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'animefreak',
    url: 'https://www.animefreak.tv/',
    testCases: [
      {
        url: 'https://www.animefreak.tv/watch/mahouka-koukou-no-rettousei/episode/episode-23',
        expected: {
          sync: true,
          title: 'Mahouka Koukou no Rettousei',
          identifier: 'mahouka-koukou-no-rettousei',
          overviewUrl: 'https://www.animefreak.tv/watch/mahouka-koukou-no-rettousei',
          episode: 23,
          uiSelector: false,
        }
      },
      {
        url: 'https://www.animefreak.tv/watch/mahouka-koukou-no-rettousei',
        expected: {
          sync: false,
          title: 'Mahouka Koukou no Rettousei',
          identifier: 'mahouka-koukou-no-rettousei',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'animeplanet',
    url: 'https://www.anime-planet.com/',
    testCases: [
      {
        url: 'https://www.anime-planet.com/anime/the-rising-of-the-shield-hero/videos/229861',
        expected: {
          sync: true,
          title: 'The Rising of the Shield Hero',
          identifier: 'the-rising-of-the-shield-hero',
          overviewUrl: 'https://www.anime-planet.com/anime/the-rising-of-the-shield-hero/videos',
          episode: 3,
          uiSelector: true,
        }
      },
      {
        url: 'https://www.anime-planet.com/anime/the-rising-of-the-shield-hero',
        expected: {
          sync: false,
          title: 'The Rising of the Shield Hero',
          identifier: 'the-rising-of-the-shield-hero',
          uiSelector: true,
        }
      },
      {
        url: 'https://www.anime-planet.com/anime/the-rising-of-the-shield-hero/videos',
        expected: {
          sync: false,
          title: 'The Rising of the Shield Hero',
          identifier: 'the-rising-of-the-shield-hero',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'kickassanime',
    url: 'https://www17.kickassanime.io/',
    testCases: [
      /*{
        url: 'https://www17.kickassanime.io/anime/overlord-iii-954770/episode-10-439507',
        expected: {
          sync: true,
          title: 'Overlord III',
          identifier: 'overlord-iii-954770',
          overviewUrl: 'https://www17.kickassanime.io/anime/overlord-iii-954770',
          episode: 10,
          uiSelector: false,
        }
      },*/
      {
        url: 'https://www17.kickassanime.io/anime/overlord-iii-954770',
        expected: {
          sync: false,
          title: 'Overlord III',
          identifier: 'overlord-iii-954770',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'RiiE',
    url: 'https://www.riie.net/',
    testCases: [
      {
        url: 'https://www.riie.net/tate-no-yuusha-no-nariagari-episode-23-subtitle-indonesia/',
        expected: {
          sync: true,
          title: 'Tate no Yuusha no Nariagari',
          identifier: 'tate-no-yuusha-no-nariagari',
          overviewUrl: 'https://www.riie.net/anime/tate-no-yuusha-no-nariagari/',
          episode: 23,
          uiSelector: false,
        }
      },
      {
        url: 'https://www.riie.net/anime/tate-no-yuusha-no-nariagari/',
        expected: {
          sync: false,
          title: 'tate no yuusha no nariagari',
          identifier: 'tate-no-yuusha-no-nariagari',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'AnimeKisa',
    url: 'https://animekisa.tv/',
    testCases: [
      {
        url: 'https://animekisa.tv/phantom-requiem-for-the-phantom-episode-9',
        expected: {
          sync: true,
          title: 'Phantom Requiem for the Phantom',
          identifier: 'phantom-requiem-for-the-phantom',
          overviewUrl: 'https://animekisa.tv/phantom-requiem-for-the-phantom',
          episode: 9,
          uiSelector: false,
        }
      },
      {
       url: 'https://animekisa.tv/phantom-requiem-for-the-phantom',
        expected: {
          sync: false,
          title: 'Phantom Requiem for the Phantom',
          identifier: 'phantom-requiem-for-the-phantom',
          uiSelector: true,
        }
      }
    ]
  },
  {
    title: 'Wakanim',
    url: 'https://www.wakanim.tv',
    testCases: [
      /*{
        url: 'https://www.wakanim.tv/de/v2/catalogue/episode/8787/afterlost-omu-staffel-1-folge-4-omu',
        expected: {
          sync: true,
          title: 'AFTERLOST (OmU.)',
          identifier: '493',
          overviewUrl: 'https://www.wakanim.tv/de/v2/catalogue/show/493/afterlost-omu',
          nextEpUrl: 'https://www.wakanim.tv/de/v2/catalogue/episode/8788/afterlost-omu-staffel-1-folge-5-omu',
          episode: 4,
          uiSelector: false,
        }
      },*/
      {
       url: 'https://www.wakanim.tv/de/v2/catalogue/show/493/afterlost-omu',
        expected: {
          sync: false,
          title: 'AFTERLOST',
          identifier: '493',
          uiSelector: true,
        }
      }
    ]
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
          uiSelector: false,
        }
      },
      {
       url: 'http://animeindo.moe/anime/zankyou-no-terror',
        expected: {
          sync: false,
          title: 'Zankyou no Terror',
          identifier: 'zankyou-no-terror',
          uiSelector: true,
        }
      }
    ]
  },
  // does not work because of geoblocking
  /*{
    title: 'Shinden',
    url: 'https://shinden.pl/',
    testCases: [
      {
        url: 'https://shinden.pl/episode/16238-mahouka-koukou-no-rettousei/view/117041',
        expected: {
          sync: true,
          title: 'Mahouka Koukou no Rettousei',
          identifier: '16238-mahouka-koukou-no-rettousei',
          overviewUrl: 'https://shinden.pl/series/16238-mahouka-koukou-no-rettousei',
          episode: 14,
          uiSelector: false,
        }
      },
      {
       url: 'https://shinden.pl/series/16238-mahouka-koukou-no-rettousei',
        expected: {
          sync: false,
          title: 'Mahouka Koukou no Rettousei',
          identifier: '16238-mahouka-koukou-no-rettousei',
          uiSelector: true,
        }
      }
    ]
  },*/
];

// Define global variables
let browser
let page
let debugging = false;
//var caseTitle = 'Turkanime';

before(async function () {
  puppeteer.use(pluginStealth());
  browser = await puppeteer.launch({ headless: true })
})

beforeEach(async function () {
  page = await browser.newPage()
  await page.setViewport({ width: 800, height: 600 })
})

afterEach(async function () {
  await page.close()
})

after(async function () {
  await browser.close()
})

testsArray.forEach(function(testPage) {
  if(typeof caseTitle !== 'undefined' && caseTitle !== testPage.title) return;
  describe(testPage.title, function () {
    var doSkip = false;
    it('Online', async function () {
      const [response] = await Promise.all([
        page.goto(testPage.url, {timeout:0}),
        page.waitForNavigation({timeout:0}),
      ]);

      if(parseInt(response.headers().status) != 200){
        console.log('    X Online '+response.headers().status);

        var content = await page.evaluate(() => document.body.innerHTML);
        if(content.indexOf('Why do I have to complete a CAPTCHA?') !== -1){
          console.log('    X CAPTCHA');
          doSkip = true;
          this.skip();
        }
      }
    })

    testPage.testCases.forEach(function(testCase) {
      it(testCase.url, async function () {
        if(doSkip) this.skip();
        const [response] = await Promise.all([
          page.goto(testCase.url, {timeout:0}),
          page.waitForNavigation({timeout:0}),
        ]);
        await page.addScriptTag({url: 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js'}).catch(() => page.addScriptTag({url: 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js'}));
        await page.addScriptTag({content: script});
        const text = await page.evaluate(() => MalSyncTest())

        if(debugging) console.log(text);

        if(text == 'retry'){
          this.retries(3);
          await new Promise(function(resolve, reject) {
            setTimeout(async ()=>{
              var content = await page.evaluate(() => document.body.innerHTML);
              if(content.indexOf('Why do I have to complete a CAPTCHA?') !== -1){
                console.log('    X CAPTCHA');
                doSkip = true;
              }
              resolve()
            }, 7000)
          });
        }

        expect(text.sync, 'Sync').to.equal(testCase.expected.sync);
        expect(text.title, 'Title').to.equal(testCase.expected.title);
        expect(text.identifier, 'Identifier').to.equal(testCase.expected.identifier);
        if(text.sync){
          expect(text.episode, 'Episode').to.equal(testCase.expected.episode);
          var textOverview = typeof text.overviewUrl !== 'undefined'? text.overviewUrl.replace(/www[^.]*\./,'') : text.overviewUrl;
          var testCaseOverview = typeof testCase.expected.overviewUrl !== 'undefined'? testCase.expected.overviewUrl.replace(/www[^.]*\./,'') : testCase.expected.overviewUrl;
          expect(textOverview, 'Overview Url').to.equal(testCase.expected.overviewUrl.replace(/www[^.]*\./,''));
          var textOverview = typeof text.nextEpUrl !== 'undefined'? text.nextEpUrl.replace(/www[^.]*\./,'') : text.nextEpUrl;
          var testCaseOverview = typeof testCase.expected.nextEpUrl !== 'undefined'? testCase.expected.nextEpUrl.replace(/www[^.]*\./,'') : testCase.expected.nextEpUrl;
          expect(textOverview, 'Next Episode').to.equal(testCaseOverview);
        }
        if(typeof text.uiSelector != 'undefined'){
          expect(text.uiSelector === 'TEST-UI', 'UI').to.equal(testCase.expected.uiSelector);
        }
      })
    });
  });
})
