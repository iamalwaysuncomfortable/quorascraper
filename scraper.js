require('dotenv').config();
let dbwriter = require('./dbwriter');
//dbwriter.writeRecords();
const puppeteer = require('puppeteer');
let html_data_extractor = require('./html_data_extractor');
let browser;
let currentPage;
let debugquestions;

async function parseData(page, collectionType){
    const bodyHandle = await currentPage.$('body');
    const html = await currentPage.evaluate(body => body.innerHTML, bodyHandle);
    await bodyHandle.dispose();

    if (collectionType === "myQuestions"){
        let questions = html_data_extractor.scrapeMyQuestions(html);
        dbwriter.pushRecords(questions);
    }
    if (collectionType === "topQuestions"){
        let questions = html_data_extractor.scrapeTopQuestions(html);
        debugquestions = questions;
        dbwriter.pushRecords(questions);
    }
}

(async () => {
    browser = await puppeteer.launch({headless:false, userDataDir: './browserdata'});
    currentPage = await browser.newPage();
    await currentPage.goto('file:///home/salty/Downloads/Quora/Question%20Value%20Insights%20-%20Quora100plus_011418_6mo.html');
    await parseData(currentPage,'topQuestions');
})();

(async () => {
    browser = await puppeteer.launch({headless:false, userDataDir: './browserdata'});
    currentPage = await browser.newPage();
    await currentPage.goto('file:///home/salty/Downloads/Quora/MyQuestionsRecent.html');
    await parseData(currentPage,'myQuestions');
})();


(async () => {

    browser = await puppeteer.launch({headless:false, userDataDir: './browserdata'});
    currentPage = await browser.newPage();
    await currentPage.goto('file:///home/salty/Downloads/Quora/MyQuestions011419.html');

})();

(async () => {await parseData(currentPage,'myQuestions');})();


async function scroll(page){
    await page.evaluate(async () => {window.scrollBy(0, 450)});
}


//(async () => {})();