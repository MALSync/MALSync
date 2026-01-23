const { expect } = require('chai');
const puppeteer = require('puppeteer');
const { PuppeteerBlocker } = require('@ghostery/adblocker-puppeteer');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const fs = require('fs');
const dir = require('node-dir');

const script = fs.readFileSync(`${__dirname}/../dist/testCode.js`, 'utf8');

const testsArray = [];
let changedFiles = [];
let OnlyPage = null;

if (process.argv && process.argv.length > 2) {
  console.log('Page to test:', process.argv[2]);
  OnlyPage = process.argv[2];
}

if (process.env.FILES) {
  changedFiles = JSON.parse(process.env.FILES.replace(/\\/g, '/'));
  console.log('Changed Files:', changedFiles);
}

// Define global variables
let browser;
const debugging = false;
let headless = OnlyPage ? false : true;
let buildFailed = false;
const mode = {
  quiet: false,
  parallel: true,
  blockLog: true,
};

if (process.env.CI && !changedFiles.length) mode.quiet = true;

async function getBrowser() {
  if (browser) return browser;

  const tempBrowser = await puppeteer.launch({ headless: headless ? 'new' : false, args: ['--disable-web-security'] });
  browser = tempBrowser;

  return tempBrowser;
}

async function closeBrowser() {
  if (browser) await browser.close();
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
      if (page.isClosed()) {
        reject('Page closed');
        return;
      }
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

function safeFileName(filename) {
  return encodeURIComponent(filename.replace(/(^\/|\/$| )/g, '').replace(/\//g, '_')).toLowerCase();
}

function getRequestName(message) {
  let url;
  let requestBody = '';

  if (typeof message.url === 'object') {
    url = message.url.url;
    if (message.url.data) {
      requestBody = JSON.stringify(message.url.data);
    }
  } else {
    url = message.url;
  }

  const urlObj = new URL(url);
  return safeFileName(urlObj.pathname + urlObj.search + urlObj.hash + requestBody);
}

async function PreparePage(block, page, url, testPage) {
  const urlObj = new URL(url);
  let name = safeFileName(urlObj.pathname + urlObj.search + urlObj.hash);

  checkIfFolderExists(block, name);
  const pagePath = path.join(__dirname, '../dist/headless/clear/', block, name);
  const filePath = path.join(pagePath, 'index.html');

  if (fs.existsSync(filePath)) {
    log(block, 'Cached', 2);

    await page.setRequestInterception(true);
    await page.setBypassServiceWorker(true);

    page.on('request', (request) => {
      if (!request.isInterceptResolutionHandled()) {
        if (request.url().startsWith('https://chibi.malsync.moe/config/')) {
          const pathPart = request
            .url()
            .replace('https://chibi.malsync.moe/config/', '')
            .split('?')[0];
          const listJsonPath = path.join(__dirname, '../../dist/webextension/chibi/', pathPart);
          const listJsonContent = fs.readFileSync(listJsonPath, 'utf8');
          return request.respond({
            status: 200,
            contentType: 'application/json',
            body: listJsonContent,
          });
        }
        if (request.headers()['x-malsync-test']) {
          const requestMessage = JSON.parse(request.headers()['x-malsync-test']);
          let requestName = getRequestName(requestMessage);
          requestPath = path.join(pagePath, 'requests', requestName, 'data.json');
          if (!fs.existsSync(requestPath)) {
            return request.abort();
          }
          const content = fs.readFileSync(requestPath, 'utf8');
          return request.respond({ status: 200, body: content });
        } else if (request.url() === url || request.url() === url.replace(/#.*/, '')) {
          const content = fs.readFileSync(filePath, 'utf8');
          return request.respond({ status: 200, body: content, contentType: 'text/html' });
        } else if (request.resourceType() === 'image') {
          return request.respond({
            status: 200,
            body: fs.readFileSync(path.join(__dirname, '../../assets/icons/icon128.png')),
            contentType: 'image/png'
          });
        } else {
          return request.abort();
        }
      }
    });
    try {
      const [response] = await Promise.all([
        page.goto(url, { timeout: 0 }),
        page.waitForNavigation({ timeout: 30000 }),
      ]);
    } catch (e) {
      await page.evaluate(() => window.stop());
    }

    return null;
  } else {
    await page.setBypassCSP(true);
    await page.setRequestInterception(true);

    const requestData = {};

    page.on('request', (request) => {
      if (!request.isInterceptResolutionHandled()) {
        if (request.url().startsWith('https://chibi.malsync.moe/config/')) {
          const pathPart = request
            .url()
            .replace('https://chibi.malsync.moe/config/', '')
            .split('?')[0];
          const listJsonPath = path.join(__dirname, '../../dist/webextension/chibi/', pathPart);
          const listJsonContent = fs.readFileSync(listJsonPath, 'utf8');
          const headers = request.headers();
          delete headers['x-malsync-test'];
          return request.respond({
            headers,
            status: 200,
            contentType: 'application/json',
            body: listJsonContent,
          });
        }
      }
    });

    page.on('response', async (interceptedResponse) => {
      if (interceptedResponse.request().headers()['x-malsync-test']) {
        const requestMessage = JSON.parse(
          interceptedResponse.request().headers()['x-malsync-test'],
        );
        const data = await interceptedResponse.text();
        let requestName = getRequestName(requestMessage);

        requestData[requestName] = data;

        const requestFolder = path.join(pagePath, 'requests');
        if (!fs.existsSync(requestFolder)) {
          fs.mkdirSync(requestFolder);
        }

        const requestPath = path.join(pagePath, 'requests', requestName);
        if (!fs.existsSync(requestPath)) {
          fs.mkdirSync(requestPath);
        }
      }
    });

    try {
      const [response] = await Promise.all([
        page.goto(url, { timeout: 0 }),
        page.waitForNavigation({ timeout: 30000 }),
      ]);
    } catch (e) {
      log(block, 'Page loads too long', 2);
      await page.evaluate(() => window.stop());
    }

    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 10000);
    })

    // Makes sure selected is set in dropdowns
    await page.evaluate(() => {
      const selects = document.querySelectorAll('select');
      selects.forEach(select => {
        const value = select.value;
        select.querySelectorAll('option').forEach(option => {
          if (option.value === value) {
            option.setAttribute('selected', 'selected');
          } else {
            option.removeAttribute('selected');
          }
        });
      });
    });

    let content = await page.content();

    if (testPage.variables && testPage.variables.length) {
      content += '<script>';

      for (const variable of testPage.variables) {
        varData = await page.evaluate((variable) => {
          return JSON.stringify(window[variable]);
        }, variable);
        content += `window.${variable} = ${varData};`;
      }

      content += '</script>';
    }

    return async () => {
      // Wait for requests to finish
      await new Promise(resolve => setTimeout(resolve, 5000));
      fs.writeFileSync(filePath, content);
      for (const key in requestData) {
        fs.writeFileSync(path.join(pagePath, 'requests', key, 'data.json'), requestData[key]);
      }
    }
  }
}

function checkIfFolderExists(block, name) {
  const root = path.join(__dirname, '../dist/headless/');

  if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
  }

  const clearPath = path.join(root, 'clear');
  if (!fs.existsSync(clearPath)) {
    fs.mkdirSync(clearPath);
  }

  const folderPath = path.join(clearPath, block);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  const filePath = path.join(folderPath, name);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
}

async function singleCase(block, test, page, testPage, retry = 0) {
  const saveCallback = await PreparePage(block, page, test.url, testPage);
  const testJquery = () => page.evaluate(() => {
    if (typeof jQuery === 'undefined') throw 'jquery could not be loaded';
  })

  await page
    .addScriptTag({
      content: fs.readFileSync(`./node_modules/jquery/dist/jquery.min.js`, 'utf8'),
    })
    .then(() => {
      return testJquery();
    }).catch(async () => {
      await page.evaluate(fs.readFileSync(`./node_modules/jquery/dist/jquery.min.js`, 'utf8'));
      await testJquery();
    });

  const loadContent = await page.evaluate(() => document.body.innerHTML);

  if (loadContent.indexOf('>nginx<') !== -1) {
    log(block, 'nginx error', 2);
    throw 'Blocked';
  }

  await page.evaluate(() => console.log(`Adding chrome api`));
  await page.addScriptTag({
    content: `
      window.chrome = {
        runtime: {
          onMessage: {
            addListener: function(callback) {
              console.log('chrome.runtime.onMessage.addListener', callback);
            }
          },
          sendMessage: function(message, callback) {
            console.log('chrome.runtime.sendMessage', message, callback);
          },
          getURL: function(path) {
            console.log('chrome.runtime.getURL', path);
            return '';
          },
          getManifest: function() {
            console.log('chrome.runtime.getManifest');
            return {
              version: '10.1.1',
            };
          }
        },
        storage: {
          local: {
            get: function(keys, callback) {
              console.log('chrome.storage.local.get', keys, callback);
              callback({});
            },
            set: function(items, callback) {
              console.log('chrome.storage.local.set', items, callback);
              if (callback) {
                callback();
              }
            }
          }
        },
      };
    `,
  });

  await page.evaluate(() => console.log(`Adding script`));
  await page.addScriptTag({ content: script });

  await page.evaluate(() => console.log(`Evaluating script`));
  const text = await page.evaluate(() => MalSyncTest());

  if (OnlyPage) console.log(text);

  if (text.sync === 'cdn') {
    if (retry > 2) throw 'Max retries';
    log(block, `Retry ${text.type}`, 2);
    await cdn(page, text.type);
    retry++;
    return singleCase(block, test, page, testPage, retry);
  }

  if (text === 'Page Not Found') {
    throw 'Page Not Found';
  }

  expect(text.sync, 'Sync').to.equal(test.expected.sync);
  expect(text.title, 'Title').to.equal(test.expected.title);
  expect(text.identifier, 'Identifier').to.equal(test.expected.identifier);
  expect(text.image, 'Image').to.equal(test.expected.image);
  if (text.sync) {
    expect(text.episode, 'Episode').to.equal(test.expected.episode);
    if (test.expected.volume) {
      expect(text.volume, 'Volume').to.equal(test.expected.volume);
    }
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
  if (typeof test.expected.epList !== 'undefined') {
    expect(text.epList, 'Episode List Empty').to.not.be.undefined;
    expect(Object.keys(text.epList).length, 'Episode List Empty').to.not.equal(0);
    for (const key in test.expected.epList) {
      if (!text.epList[key]) throw `Episode url ${key} is ${text.epList[key]}`;
      expect(test.expected.epList[key].replace(/www[^.]*\./, ''), `EP${key}`).to.equal(
        text.epList[key].replace(/www[^.]*\./, ''),
      );
    }
  }

  if (saveCallback) await saveCallback();
}

async function testPageCase(block, testPage, b) {
  log(block, '');
  log(block, testPage.title);
  if (testPage.unreliable) logC(block, 'Unreliable', 1, 'yellow');
  let passed = 1;

  if (typeof testPage.offline === 'undefined') testPage.offline = false;
  if (testPage.offline) {
    logC(block, 'Offline', 1, 'yellow');
    return;
  }

  for (const testCase of testPage.testCases) {
    const page = await openPage(b);
    try {
      logC(block, testCase.url, 1);
      await Promise.race([
        singleCase(block, testCase, page, testPage),
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
    await page.close();
  }

  if (!mode.quiet || (mode.quiet && !passed)) printLogBlock(block);
  if (!passed && !testPage.unreliable && !testPage.offline) buildFailed = true;
  if (passed && testPage.offline) {
    console.log('      Reset offline');
    resetOnline(testPage.path);
  }
}

async function loopEl(testPage, headless = true) {
  if (OnlyPage && testPage.title !== OnlyPage) return;
  if (!testPage.enabled && typeof testPage.enabled !== 'undefined') return;
  const b = await getBrowser(headless);

  try {
    await testPageCase(testPage.title, testPage, b);
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
}

async function openPage(b) {
  const page = await b.newPage();

  const blocker = await PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch);
  await blocker.enableBlockingInPage(page);

  await page.setViewport({ width: 1920, height: 1080 });

  return page;
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
                cleanChanged !== 'src/pages-chibi/' &&
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
