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
    url: 'https://www.branitube.net/',
    testCases: [
      {
        url: 'https://www.branitube.net/animes/no-game-no-life',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          uiSelector: true,
        }
      },
      {
        url: 'https://www.branitube.net/watch/1818',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          overviewUrl: 'https://branitube.net/animes/no-game-no-life',
          nextEpUrl: 'https://www.branitube.net/watch/1819',
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
        url: 'https://kawaiifu.com/season/spring-2015/plastic-memories-bluray-ver-hd-720p.html?ep=4',
        expected: {
          sync: true,
          title: 'Plastic Memories (Bluray Ver.)',
          identifier: 'plastic-memories-bluray-ver-hd-720p',
          overviewUrl: 'https://kawaiifu.com/season/spring-2015/plastic-memories-bluray-ver-hd-720p.html',
          episode: 4,
          nextEpUrl: 'https://kawaiifu.com/season/spring-2015/plastic-memories-bluray-ver-hd-720p.html?ep=5',
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
          nextEpUrl: 'https://4anime.to/no-game-no-life-episode-05/?id=10621',
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
    skip: true, //Changing identifier
    testCases: [
      {
        url: 'https://www11.animeultima.eu/a/no-game-no-life_797937/episode-4_521521-sub',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life_797937',
          overviewUrl: 'https://www10.animeultima.eu/a/no-game-no-life_797937',
          episode: 4,
          uiSelector: false,
        }
      },
      {
        url: 'https://www10.animeultima.eu/a/no-game-no-life_797937',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life_797937',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'aniflix',
    url: 'https://www1.aniflix.tv/',
    testCases: [
      {
        url: 'https://www1.aniflix.tv/show/noragami/ger-sub/season/1/episode/6',
        expected: {
          sync: true,
          title: 'Noragami',
          identifier: 'noragami?s=1',
          overviewUrl: 'https://www1.aniflix.tv/show/noragami',
          episode: 6,
          uiSelector: false,
        }
      },
      {
        url: 'https://www1.aniflix.tv/show/noragami/ger-sub/season/2/episode/7',
        expected: {
          sync: true,
          title: 'Noragami season 2',
          identifier: 'noragami?s=2',
          overviewUrl: 'https://www1.aniflix.tv/show/noragami',
          episode: 7,
          uiSelector: false,
        }
      },
      {
        url: 'https://www1.aniflix.tv/show/noragami',
        expected: {
          sync: false,
          title: 'Noragami',
          identifier: 'noragami?s=1',
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
          nextEpUrl: 'https://animedaisuki.moe/watch/6381/initial-d-first-stage-6',
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
          overviewUrl: 'https://animefreak.tv/watch/mahouka-koukou-no-rettousei',
          episode: 23,
          nextEpUrl: 'https://animefreak.tv/watch/mahouka-koukou-no-rettousei/episode/episode-24',
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
        url: 'https://www.riie.net/tate-no-yuusha-no-nariagari-episode-1-subtitle-indonesia/',
        expected: {
          sync: true,
          title: 'Tate no Yuusha no Nariagari',
          identifier: 'tate-no-yuusha-no-nariagari',
          overviewUrl: 'https://www.riie.net/anime/tate-no-yuusha-no-nariagari/',
          episode: 1,
          nextEpUrl: 'https://riie.net/tate-no-yuusha-no-nariagari-episode-2-subtitle-indonesia/',
          uiSelector: false,
        }
      },
      {
        url: 'https://www.riie.net/tate-no-yuusha-no-nariagari-episode-23-subtitle-indonesia/',
        expected: {
          sync: true,
          title: 'Tate no Yuusha no Nariagari',
          identifier: 'tate-no-yuusha-no-nariagari',
          overviewUrl: 'https://www.riie.net/anime/tate-no-yuusha-no-nariagari/',
          episode: 23,
          nextEpUrl: 'https://riie.net/tate-no-yuusha-no-nariagari-episode-24-subtitle-indonesia/',
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
          title: 'Phantom: Requiem for the Phantom',
          identifier: 'phantom-requiem-for-the-phantom',
          overviewUrl: 'https://animekisa.tv/phantom-requiem-for-the-phantom',
          episode: 9,
          nextEpUrl: 'https://animekisa.tv/phantom-requiem-for-the-phantom-episode-10',
          uiSelector: false,
        }
      },
      {
       url: 'https://animekisa.tv/phantom-requiem-for-the-phantom',
        expected: {
          sync: false,
          title: 'Phantom: Requiem for the Phantom',
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
          nextEpUrl: 'http://animeindo.moe/zankyou-no-terror-episode-07.html',
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
  {
    title: 'Shinden',
    url: 'https://shinden.pl/',
    skip: true, // does not work because of geoblocking
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
        }
      },
      {
        url: 'http://voiranime.com/boku-no-hero-academia-my-hero-academia-saison-2-04-vf/',
        expected: {
          sync: true,
          title: 'Boku no Hero Academia (My Hero Academia) (Saison 2)',
          identifier: 'boku-no-hero-academia-my-hero-academia',
          overviewUrl: 'http://voiranime.com/boku-no-hero-academia-my-hero-academia',
          nextEpUrl: 'http://voiranime.com/boku-no-hero-academia-my-hero-academia-saison-2-05-vf/',
          episode: 4,
          uiSelector: false,
        }
      },
      {
       url: 'http://voiranime.com/no-game-no-life/',
        expected: {
          sync: false,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          uiSelector: true,
        }
      }
    ]
  },
  {
    title: 'hanime', //nsfw
    url: 'https://hanime.tv/',
    testCases: [
      {
        url: 'https://hanime.tv/hentai-videos/majuu-jouka-shoujo-utea-2',
        expected: {
          sync: true,
          title: 'Majuu Jouka Shoujo Utea',
          identifier: 'majuu-jouka-shoujo-utea',
          overviewUrl: 'https://hanime.tv/hentai-videos/majuu-jouka-shoujo-utea-1',
          episode: 2,
          uiSelector: false,
        }
      },
    ]
  },
  {
    title: 'hentaihaven', //nsfw
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
        }
      },
      {
        url: 'https://hentaihaven.org/series/rape-gouhouka/',
        expected: {
          sync: false,
          title: 'Rape Gouhouka!!!',
          identifier: 'rape-gouhouka',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'hentaigasm', //nsfw
    url: 'http://hentaigasm.com/',
    testCases: [
      {
        url: 'http://hentaigasm.com/pinkerton-3-subbed/',
        expected: {
          sync: true,
          title: 'Pinkerton',
          identifier: 'pinkerton',
          overviewUrl: 'http://hentaigasm.com/category/pinkerton/',
          episode: 3,
          uiSelector: false,
        }
      },
      {
        url: 'http://hentaigasm.com/category/pinkerton/',
        expected: {
          sync: false,
          title: 'Pinkerton',
          identifier: 'pinkerton',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'KissHentai', //nsfw
    url: 'http://kisshentai.net/',
    testCases: [
      {
        url: 'http://kisshentai.net/Hentai/Bloods-Inraku-no-Ketsuzoku-2/Episode-001?id=51',
        expected: {
          sync: true,
          title: 'Bloods: Inraku no Ketsuzoku 2',
          identifier: 'Bloods-Inraku-no-Ketsuzoku-2',
          overviewUrl: 'http://kisshentai.net/Hentai/Bloods-Inraku-no-Ketsuzoku-2',
          episode: 1,
          uiSelector: false,
        }
      },
      {
        url: 'http://kisshentai.net/Hentai/Bloods-Inraku-no-Ketsuzoku-2',
        expected: {
          sync: false,
          title: 'Bloods: Inraku no Ketsuzoku 2',
          identifier: 'Bloods-Inraku-no-Ketsuzoku-2',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'UnderHentai', //nsfw
    url: 'https://www.underhentai.net/',
    testCases: [
    //this part seems broken
     /* {
        url: 'https://www.underhentai.net/watch/?id=647&ep=2',
        expected: {
          sync: true,
          title: 'Resort Boin',
          identifier: 'resort-boin',
          overviewUrl: 'https://www.underhentai.net/resort-boin',
          episode: 2,
          uiSelector: false,
        }
      },*/
      {
        url: 'https://www.underhentai.net/resort-boin/',
        expected: {
          sync: false,
          title: 'Resort Boin',
          identifier: 'resort-boin',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'dubbedanime',
    url: 'https://ww5.dubbedanime.net/',
    testCases: [
      {//check for ova
        url: 'https://ww5.dubbedanime.net/episode/89274-golden-boy-ova-3-english-dubbed#',
        expected: {
          sync: true,
          title: 'Golden Boy',
          identifier: '796-golden-boy',
          overviewUrl: 'https://ww5.dubbedanime.net/anime/796-golden-boy/#episodes',
          episode: 3,
          uiSelector: false,
        }
      },
      {//check for movie
        url: 'https://ww5.dubbedanime.net/episode/182304-a-silent-voice-movie-english-dubbed',
        expected: {
          sync: true,
          title: 'A Silent Voice MOVIE',
          identifier: '2678-a-silent-voice',
          overviewUrl: 'https://ww5.dubbedanime.net/anime/2678-a-silent-voice/#episodes',
          episode: 1,
          uiSelector: false,
        }
      },
      {//check for anime/episode
        url: 'https://ww5.dubbedanime.net/episode/177318-golgo-13-episode-36-english-dubbed',
        expected: {
          sync: true,
          title: 'Golgo 13',
          identifier: '3072-golgo-13',
          overviewUrl: 'https://ww5.dubbedanime.net/anime/3072-golgo-13/#episodes',
          episode: 36,
          uiSelector: false,
        }
      },
      {//overview
        url: 'https://ww5.dubbedanime.net/anime/3072-golgo-13',
        expected: {
          sync: false,
          title: 'Golgo 13',
          identifier: '3072-golgo-13',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'viz',
    url: 'https://www.viz.com/',
    skip: true,
    testCases: [
      {//overview
        url: 'https://www.viz.com/shonenjump/chapters/one-piece',
        expected: {
          sync: false,
          title: 'One Piece',
          identifier: 'one-piece',
          uiSelector: true,
        }
      },
    ]
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
          episode: 114,
          uiSelector: false,
        }
      },
      {
        url: 'https://manganelo.com/manga/dr_stone',
        expected: {
          sync: false,
          title: 'Dr. Stone',
          identifier: 'dr_stone',
          uiSelector: true,
        }
      },
    ]
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
          episode: 203,
          uiSelector: false,
        }
      },
      {
        url: 'https://mangakakalot.com/manga/domestic_na_kanojo',
        expected: {
          sync: false,
          title: 'Domestic na Kanojo',
          identifier: 'domestic_na_kanojo',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'NekoSama',
    url: 'https://www.neko-sama.fr/',
    testCases: [
      {
        url: 'https://www.neko-sama.fr/anime/episode/3458-hagane-no-renkinjutsushi-fullmetal-alchemist-03-vostfr',
        expected: {
          sync: true,
          title: 'Fullmetal Alchemist: Brotherhood',
          identifier: '3458',
          overviewUrl: 'https://www.neko-sama.fr/anime/info/3458-hagane-no-renkinjutsushi-fullmetal-alchemist',
          nextEpUrl: 'https://www.neko-sama.fr/anime/episode/3458-hagane-no-renkinjutsushi-fullmetal-alchemist-04-vostfr',
          episode: 3,
          uiSelector: false,
        }
      },
      {
        url: 'https://www.neko-sama.fr/anime/info/3458-hagane-no-renkinjutsushi-fullmetal-alchemist',
        expected: {
          sync: false,
          title: 'Fullmetal Alchemist: Brotherhood ',
          identifier: '3458',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'AnimeZone',
    url: 'https://www.animezone.pl/',
    testCases: [
      {
        url: 'https://www.animezone.pl/odcinek/cop-craft/1',
        expected: {
          sync: true,
          title: 'Cop Craft',
          identifier: 'cop-craft',
          overviewUrl: 'https://www.animezone.pl/odcinki/cop-craft',
          nextEpUrl: 'https://www.animezone.pl/odcinek/cop-craft/2',
          episode: 1,
          uiSelector: false,
        }
      },
      {
        url: 'https://www.animezone.pl/odcinki/cop-craft',
        expected: {
          sync: false,
          title: 'Cop Craft',
          identifier: 'cop-craft',
          uiSelector: true,
        }
      },
    ]
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
        }
      },
      {
        url: 'https://anime-odcinki.pl/anime/cop-craft',
        expected: {
          sync: false,
          title: 'Cop Craft',
          identifier: 'cop-craft',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'Animeflix',
    url: 'https://animeflix.io/',
    testCases: [
      {
        url: 'https://animeflix.io/shows/quanzhi-gaoshou/episode-7-928035/sub',
        expected: {
          sync: true,
          title: 'Quanzhi Gaoshou',
          identifier: 'quanzhi-gaoshou',
          overviewUrl: 'https://animeflix.io/shows/quanzhi-gaoshou',
          episode: 7,
          uiSelector: false,
        }
      },
      {
        url: 'https://animeflix.io/shows/quanzhi-gaoshou',
        expected: {
          sync: false,
          title: 'Quanzhi Gaoshou',
          identifier: 'quanzhi-gaoshou',
          uiSelector: true,
        }
      },
    ]
  },
  {
    title: 'AnimeFever',
    url: 'https://www.animefever.tv/',
    testCases: [
      {
        url: 'https://www.animefever.tv/anime/10344-a-certain-magical-index/episode/37351-episode-13-accelerator-one-way',
        expected: {
          sync: true,
          title: 'A Certain Magical Index',
          identifier: '10344-a-certain-magical-index',
          overviewUrl: 'https://www.animefever.tv/anime/10344-a-certain-magical-index',
          episode: 13,
          uiSelector: false,
        }
      },
      {
        url: 'https://www.animefever.tv/anime/10344-a-certain-magical-index',
        expected: {
          sync: false,
          title: 'A Certain Magical Index',
          identifier: '10344-a-certain-magical-index',
          uiSelector: true,
        }
      },
    ]
  },
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
    if(typeof testPage.skip !== 'undefined' && testPage.skip) doSkip = true;
    it('Online', async function () {
      if(doSkip) this.skip();
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
