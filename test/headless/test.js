const {expect} = require('chai');
const puppeteer = require('puppeteer');
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
    url: 'https://www4.9anime.to/',
    testCases: [
      {
        url: 'https://www4.9anime.to/watch/no-game-no-life-dub.y2p0/mlkqnp',
        expected: {
          sync: true,
          title: 'No Game, No Life (Dub)',
          identifier: 'y2p0',
          overviewUrl: 'https://www4.9anime.to/watch/no-game-no-life-dub.y2p0',
          nextEpUrl: 'https://9anime.to/watch/no-game-no-life-dub.y2p0/79qwl7',
          episode: 4,
          uiSelector: true,
        }
      },
    ]
  },

  {
    title: 'Gogoanime',
    url: 'https://www2.gogoanime.io',
    testCases: [
      {
        url: 'https://www2.gogoanime.io/category/no-game-no-life',
        expected: {
          sync: false,
          title: 'no-game-no-life',
          identifier: 'no-game-no-life',
          uiSelector: true,
        }
      },
      {
        url: 'https://www2.gogoanime.io/no-game-no-life-episode-5',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          overviewUrl: 'https://www2.gogoanime.io/category/no-game-no-life',
          nextEpUrl: 'https://www2.gogoanime.io/no-game-no-life-episode-6',
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

  /*{
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
  },*/

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
    ]
  },
];

// Define global variables
let browser
let page

before(async function () {
  browser = await puppeteer.launch()
  page = await browser.newPage()
})

beforeEach(async function () {
  page = await browser.newPage()
})

afterEach(async function () {
  await page.close()
})

after(async function () {
  await browser.close()
})

testsArray.forEach(function(testPage) {
  describe(testPage.title, function () {

    it('Online', async function () {
      const [response] = await Promise.all([
        page.goto(testPage.url, {timeout:0}),
        page.waitForNavigation({timeout:0}),
      ]);

      if(parseInt(response.headers().status) != 200){
        console.log('    X Online '+response.headers().status);
      }
    })

    testPage.testCases.forEach(function(testCase) {
      it(testCase.url, async function () {
        const [response] = await Promise.all([
          page.goto(testCase.url, {timeout:0}),
          page.waitForNavigation({timeout:0}),
        ]);
        await page.addScriptTag({url: 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js'}).catch(() => page.addScriptTag({url: 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js'}));
        await page.addScriptTag({content: script});
        const text = await page.evaluate(() => MalSyncTest())

        if(text == 'retry'){
          this.retries(3);
          await new Promise(function(resolve, reject) {setTimeout(()=>{resolve()}, 7000)});
        }

        expect(text.sync).to.equal(testCase.expected.sync);
        expect(text.title).to.equal(testCase.expected.title);
        expect(text.identifier).to.equal(testCase.expected.identifier);
        if(text.sync){
          expect(text.episode).to.equal(testCase.expected.episode);
          expect(text.overviewUrl).to.equal(testCase.expected.overviewUrl);
          expect(text.nextEpUrl).to.equal(testCase.expected.nextEpUrl);
        }
        if(typeof text.uiSelector != 'undefined'){
          expect(text.uiSelector === 'TEST-UI').to.equal(testCase.expected.uiSelector);
        }
      })
    });
  });
})
