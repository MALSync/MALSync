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
          identifier: 'Ai-Mai-Mi Mousou Catastrophe'
        }
      },
      {
        url: 'https://www.crunchyroll.com/de/ai-mai-mi-mousou-catastrophe/episode-3-untitled-658389',
        expected: {
          sync: true,
          title: 'Ai-Mai-Mi Mousou Catastrophe',
          identifier: 'Ai-Mai-Mi Mousou Catastrophe',
          episode: 3
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
          identifier: 'No-Game-No-Life'
        }
      },
      {
        url: 'https://kissanime.ru/Anime/No-Game-No-Life-Dub/Episode-004?id=112019&s=rapidvideo',
        expected: {
          sync: true,
          title: 'No Game No Life (Dub)',
          identifier: 'No-Game-No-Life-Dub',
          episode: 4
        }
      },
    ]
  },

  {
    title: '9anime',
    url: 'https://www2.9anime.to/',
    testCases: [
      {
        url: 'https://www2.9anime.to/watch/no-game-no-life-dub.y2p0/mlkqnp',
        expected: {
          sync: true,
          title: 'No Game, No Life (Dub)',
          identifier: 'y2p0',
          episode: 4
        }
      },
    ]
  },

  {
    title: 'MasterAnime',
    url: 'https://www.masterani.me/',
    testCases: [
      {
        url: 'https://www.masterani.me/anime/info/55-no-game-no-life',
        expected: {
          sync: false,
          title: 'no-game-no-life',
          identifier: '55-no-game-no-life'
        }
      },
      {
        url: 'https://www.masterani.me/anime/watch/55-no-game-no-life/4',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: '55-no-game-no-life',
          episode: 4
        }
      },
    ]
  },

  {
    title: 'Gogoanime',
    url: 'https://gogoanimes.co',
    testCases: [
      {
        url: 'https://gogoanimes.co/category/no-game-no-life',
        expected: {
          sync: false,
          title: 'no-game-no-life',
          identifier: 'no-game-no-life'
        }
      },
      {
        url: 'https://gogoanimes.co/no-game-no-life-episode-5',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          episode: 5
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
          episode: 4
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
          title: 'No Game No LifeGerSub',
          identifier: '781'
        }
      },
      {
        url: 'https://www.anime4you.one/show/1/aid/779/epi/4/#vidplayer',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: '779',
          episode: 4
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
          identifier: 'no-game-no-life'
        }
      },
      {
        url: 'http://www.turkanime.tv/video/no-game-no-life-6-bolum',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'no-game-no-life',
          episode: 6
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
          identifier: 'No-Game-No-Life'
        }
      },
      {
        url: 'https://kissmanga.com/Manga/No-Game-No-Life/Ch-003--Game-003?id=167047',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: 'No-Game-No-Life',
          episode: 3
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
          identifier: '8173'
        }
      },
      {
        url: 'https://mangadex.org/chapter/57332',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: '8173',
          episode: 4
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
          identifier: '179306'
        }
      },
      {
        url: 'https://mangarock.com/manga/mrs-serie-179306/chapter/mrs-chapter-179312',
        expected: {
          sync: true,
          title: 'No Game No Life',
          identifier: '179306',
          episode: 6
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
        }
      })
    });
  });
})
