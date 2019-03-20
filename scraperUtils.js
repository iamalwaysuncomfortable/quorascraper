const puppeteer = require('puppeteer');

async function launchBrowser(){
    let browser = await puppeteer.launch({headless:false, userDataDir: './browserdata'});
    let currentPage = await browser.newPage();
    await currentPage.goto('https://quora.com/partners');
    return currentPage;
}

module.exports.launchBrowser = launchBrowser;
