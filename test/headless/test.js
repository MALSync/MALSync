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

      expect(200).to.equal(parseInt(response.headers().status));
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
