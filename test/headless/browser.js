// Browser helpers shared by test/headless/test.js and test/chibiDev/cli.js
const fs = require('fs');
const path = require('path');
const { PuppeteerBlocker } = require('@ghostery/adblocker-puppeteer');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const jquery = fs.readFileSync(path.join(__dirname, '../../node_modules/jquery/dist/jquery.min.js'), 'utf8');
const chromeStub = fs.readFileSync(path.join(__dirname, 'chromeStub.js'), 'utf8');

async function openPage(b) {
  const page = await b.newPage();

  const blocker = await PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch);
  await blocker.enableBlockingInPage(page);

  await page.setViewport({ width: 1920, height: 1080 });

  return page;
}

// Adds jQuery and the chrome api stub that testCode.js and chibiDev.js expect
async function injectTestEnvironment(page) {
  const testJquery = () => page.evaluate(() => {
    if (typeof jQuery === 'undefined') throw 'jquery could not be loaded';
  })

  await page
    .addScriptTag({
      content: jquery,
    })
    .then(() => {
      return testJquery();
    }).catch(async () => {
      await page.evaluate(jquery);
      await testJquery();
    });

  await page.evaluate(() => console.log(`Adding chrome api`));
  await page.addScriptTag({ content: chromeStub });
}

module.exports = {
  jquery,
  chromeStub,
  openPage,
  injectTestEnvironment,
};
