const { expect } = require('chai');
const puppeteer = require('puppeteer');
const { PuppeteerBlocker } = require('@cliqz/adblocker-puppeteer');
const fetch = require('cross-fetch');

const fs = require('fs');
const dir = require('node-dir');

const script = fs.readFileSync(`${__dirname}/../dist/testCode.js`, 'utf8');

const testsArray = [];
let changedFiles = [];

if (process.env.FILES) {
  changedFiles = JSON.parse(process.env.FILES.replace(/\\/g, '/'));
  console.log('Changed Files:', changedFiles);
}

// Define global variables
let browser;
let browserFull;
const debugging = false;
let buildFailed = false;
const mode = {
  quiet: false,
  parallel: true,
  blockLog: true,
};

if (process.env.CI && !changedFiles.length) mode.quiet = true;

async function getBrowser(headless = true) {
  if (browser && headless) return browser;
  if (browserFull && !headless) return browserFull;

  const tempBrowser = await puppeteer.launch({ headless: headless ? 'new' : false });
  if (headless) {
    browser = tempBrowser;
  } else {
    browserFull = tempBrowser;
  }
  return tempBrowser;
}

async function closeBrowser() {
  if (browser) await browser.close();
  if (browserFull) await browserFull.close();
}

const logBlocks = {};
function log(block, text, indetion = 0) {
  for (let i = 0; i <= indetion; i++) {
    text = `  ${text}`;
  }
  if (mode.blockLog) {
    if (!logBlocks[block]) logBlocks[block] = [];
    logBlocks[block].push(text);
  } else {
    console.log(text);
  }
}

function logEr(block, text, indetion = 0) {
  for (let i = 0; i <= indetion; i++) {
    text = `  ${text}`;
  }
  if (mode.blockLog) {
    if (!logBlocks[block]) logBlocks[block] = [];
    logBlocks[block].push(text);
  } else {
    console.error(text);
  }
}

function logC(block, text, indetion = 0, color = 'blue') {
  let nColor = 0;
  switch (color) {
    case 'red':
      nColor = 31;
      break;
    case 'blue':
      nColor = 36;
      break;
    case 'green':
      nColor = 32;
      break;
    case 'yellow':
      nColor = 33;
      break;
  }
  text = `\x1b[${nColor}m${text}\x1b[0m`;
  log(block, text, indetion);
}

function printLogBlock(block) {
  if (mode.blockLog && logBlocks[block]) {
    logBlocks[block].forEach(el => {
      console.log(el);
    });
  }
}

async function cdn(page, type) {
  return new Promise(async (resolve, reject) => {
    if (type === 'captcha') reject('Captcha');
    if (type === 'blocked') reject('Blocked');

    let cdnTimeout = 7000;
    const bVersion = await page.browser().version();
    if (!bVersion.includes('Headless')) {
      cdnTimeout = 50000;
    }

    const loadContent = await page.evaluate(() => document.body.innerHTML);
    if (loadContent.indexOf('Access denied') !== -1) {
      reject('Blocked');
    }

    setTimeout(async () => {
      const content = await page.evaluate(() => document.body.innerHTML);
      if (content.indexOf('Why do I have to complete a CAPTCHA?') !== -1) {
        reject('Captcha');
      }
      resolve();
    }, cdnTimeout);
  });
}

async function onlineTest(url, page) {
  const [response] = await Promise.all([await page.goto(url, { waitUntil: 'networkidle0' })]);

  if (parseInt(response.status()) !== 200) {
    const content = await page.evaluate(() => document.body.innerHTML);
    if (content.indexOf('Why do I have to complete a CAPTCHA?') !== -1) {
      throw 'Captcha';
    }
    throw response.status();
  }
}

async function singleCase(block, test, page, retry = 0) {
  try {
    const [response] = await Promise.all([
      page.goto(test.url, { timeout: 0 }),
      page.waitForNavigation({ timeout: 30000 }),
    ]);
  } catch (e) {
    log(block, 'Page loads too long', 2);
    await page.evaluate(() => window.stop());
  }

  await page
    .addScriptTag({
      content: fs.readFileSync(`./node_modules/jquery/dist/jquery.min.js`, 'utf8'),
    })
    .catch(() => {
      throw 'jquery could not be loaded';
    });

  const loadContent = await page.evaluate(() => document.body.innerHTML);

  if (loadContent.indexOf('>nginx<') !== -1) {
    log(block, 'nginx error', 2);
    throw 'Blocked';
  }

  await page.addScriptTag({ content: script });
  const text = await page.evaluate(() => MalSyncTest());

  if (text.sync === 'cdn') {
    if (retry > 2) throw 'Max retries';
    log(block, `Retry ${text.type}`, 2);
    await cdn(page, text.type);
    retry++;
    return singleCase(block, test, page, retry);
  }

  expect(text.sync, 'Sync').to.equal(test.expected.sync);
  expect(text.title, 'Title').to.equal(test.expected.title);
  expect(text.identifier, 'Identifier').to.equal(test.expected.identifier);
  if (text.sync) {
    expect(text.episode, 'Episode').to.equal(test.expected.episode);
    var textOverview =
      typeof text.overviewUrl !== 'undefined' ? text.overviewUrl.replace(/www[^.]*\./, '') : text.overviewUrl;
    var testOverview =
      typeof test.expected.overviewUrl !== 'undefined'
        ? test.expected.overviewUrl.replace(/www[^.]*\./, '')
        : test.expected.overviewUrl;
    expect(textOverview, 'Overview Url').to.equal(test.expected.overviewUrl.replace(/www[^.]*\./, ''));
    var textOverview = text.nextEpUrl ? text.nextEpUrl.replace(/www[^.]*\./, '') : '';
    var testOverview = test.expected.nextEpUrl ? test.expected.nextEpUrl.replace(/www[^.]*\./, '') : '';
    expect(textOverview, 'Next Episode').to.equal(testOverview);
  }
  if (typeof text.uiSelector !== 'undefined') {
    expect(text.uiSelector === 'TEST-UI', 'UI').to.equal(test.expected.uiSelector);
  }
  if (typeof text.epList !== 'undefined' && typeof test.expected.epList !== 'undefined') {
    for (const key in test.expected.epList) {
      expect(test.expected.epList[key].replace(/www[^.]*\./, ''), `EP${key}`).to.equal(
        text.epList[key].replace(/www[^.]*\./, ''),
      );
    }
  }
}

async function testPageCase(block, testPage, page) {
  log(block, '');
  log(block, testPage.title);
  if (testPage.unreliable) logC(block, 'Unreliable', 1, 'yellow');
  let passed = 1;

  if (typeof testPage.offline === 'undefined') testPage.offline = false;
  if (testPage.offline) logC(block, 'Offline', 1, 'yellow');

  try {
    await onlineTest(testPage.url, page);
    logC(block, 'Online', 1);
  } catch (e) {
    logC(block, 'Offline', 1);
    log(block, e, 2);
  }
  for (const testCase of testPage.testCases) {
    try {
      logC(block, testCase.url, 1);
      await Promise.race([
        singleCase(block, testCase, page),
        new Promise((_, reject) => setTimeout(() => reject('timeout'), 100 * 1000)),
      ]);
      logC(block, 'Passed', 2, 'green');
    } catch (e) {
      logC(block, 'Failed', 2, 'red');
      if (typeof e.showDiff !== 'undefined') {
        log(block, e.message, 3);
        log(block, `Recieved: ${e.actual}`, 4);
        log(block, `Expected: ${e.expected}`, 4);
      } else {
        logEr(block, e, 3);
        if (e === 'Captcha') {
          throw 'Captcha';
        }
        if (e === 'Blocked') {
          throw 'Blocked';
        }
      }
      passed = 0;
    }
  }

  if (!mode.quiet || (mode.quiet && !passed)) printLogBlock(block);
  if (!passed && !testPage.unreliable && !testPage.offline) buildFailed = true;
  if (passed && testPage.offline) {
    console.log('      Reset offline');
    resetOnline(testPage.path);
  }
}

async function loopEl(testPage, headless = true) {
  // if(testPage.title !== 'Kissmanga') return;
  if (!testPage.enabled && typeof testPage.enabled !== 'undefined') return;
  const b = await getBrowser(headless);
  const page = await b.newPage();

  const blocker = await PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch);
  await blocker.enableBlockingInPage(page);

  await page.setViewport({ width: 1920, height: 1080 });

  try {
    await testPageCase(testPage.title, testPage, page);
  } catch (e) {
    if (e === 'Captcha') {
      if (!process.env.CI && headless === true) {
        await loopEl(testPage, false);
      } else {
        printLogBlock(testPage.title);
      }
    } else if (e === 'Blocked') {
      printLogBlock(testPage.title);
    } else {
      console.error(e);
    }
  }

  await page.close();
}

async function initTestsArray() {
  new Promise((resolve, reject) => {
    dir.readFiles(
      `${__dirname}/../../src/`,
      {
        match: /^tests.json$/,
      },
      (err, content, file, next) => {
        if (err) throw err;
        if (changedFiles && changedFiles.length) {

          const found = changedFiles.find(
            changed => {
              const cleanChanged = changed.replace(/[^\/]+\.(less|ts|json)$/, '');
              const cleanFile = file.replace('tests.json', '').replace(/\\/g, '/')

              return (
                changed &&
                cleanChanged &&
                cleanChanged !== 'src/' &&
                cleanChanged !== 'src/pages/' &&
                cleanFile.includes(cleanChanged)
              );
            }

          );

          if (!found) {
            next();
            return;
          }
        }
        try {
          eval(`var s = ${content.replace(/^[^{]*/g, '')}`);
          s.path = file;
          testsArray.push(s);
        } catch (e) {
          console.log(content);
          throw e;
        }

        next();
      },
      (err, files) => {
        if (err) throw err;
        console.log('Test files:', testsArray.map(t => t.path));
        resolve();
      },
    );
  });
}

async function resetOnline(path) {
  fs.readFile(path, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    const result = data.replace(/"offline" *: *true *,/g, `"offline": false,`);

    fs.writeFile(path, result, 'utf8', function(err) {
      if (err) return console.log(err);
    });
  });
}

main();
async function main() {
  const awaitArray = [];
  let running = 0;
  await initTestsArray();
  if (mode.parallel) {
    await getBrowser();
    for (const testPage of testsArray) {
      await new Promise((resolve, reject) => {
        let int;
        int = setInterval(() => {
          if (running < 5) {
            clearInterval(int);
            resolve();
          }
        }, 1);
      });
      running++;
      awaitArray.push(
        loopEl(testPage).then(() => {
          running--;
        }),
      );
    }
    await Promise.all(awaitArray);
  } else {
    for (const testPage of testsArray) {
      await loopEl(testPage);
    }
  }

  await closeBrowser();
  // if (buildFailed) console.error('BUILD FAILED');
  if (buildFailed) process.exit(1);
  process.exit();
}
