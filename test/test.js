const {expect} = require('chai');
const puppeteer = require('puppeteer');

describe('Headless Tests:', function () {
  // Define global variables
  let browser
  let page

  before(async function () {
    browser = await puppeteer.launch()
    page = await browser.newPage()
  })

  beforeEach(async function () {
    page = await browser.newPage()
    await page.goto('https://myanimelist.net/')
  })

  afterEach(async function () {
    await page.close()
  })

  after(async function () {
    await browser.close()
  })

  it('MyAnimeList logo text', async function () {
    const expectedInput = 'MyAnimeList.net'

    const text = await page.evaluate(() => $('.link-mal-logo').text().trim())
    expect(text).to.equal(expectedInput);
  })
})
