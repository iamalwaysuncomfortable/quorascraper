require('dotenv').config();
let dbwriter = require('./dbwriter');
let {getRandomInt} = require('./mathlib');
const puppeteer = require('puppeteer');
const quoraPageTargets = require('./appData/quoraPageTargets.json');
let html_data_extractor = require('./html_data_extractor');
const EventEmitter = require('events');
class ScrapeEmitter extends EventEmitter {}
const scrapeEmitter = new ScrapeEmitter();
let fs = require('fs');
let browser;
let currentPage;
let debugquestions;
let debughtml;

async function writeQuestion(question, page){
    await page.waitFor(getRandomInt(2000, 7000));
    await page.evaluate(() => document.querySelector( 'a.AskQuestionButton' ).click() );
    await page.waitFor(getRandomInt(2000, 5000));
    await page.evaluate(() => document.querySelector( 'textarea.selector_input' ).click() );
    await page.waitFor(getRandomInt(500, 3000));
    await page.type('textarea.selector_input', question,{delay: getRandomInt(20,45)});
    await page.waitFor(getRandomInt(500, 1000));
    let submitButtonCandidates = await page.$$('.submit_button');
    for (let i = 0; i < submitButtonCandidates.length; i++){
        let id = submitButtonCandidates[i]['_remoteObject']['description'];
        let width = await page.evaluate((id) => {return document.querySelector( id ).clientWidth}, id);
        if (width > 50){
            await page.$eval(id, btn => btn.click() );
            break;
        }
    }
    await page.waitFor(getRandomInt(2500, 5000));
    await page.mouse.click(getRandomInt(2,50),getRandomInt(2,50))
}

(async () => {
    browser = await puppeteer.launch({headless:false, userDataDir: './browserdata'});
    currentPage = await browser.newPage();
    await currentPage.goto('https://quora.com/partners');
    let results = fs.readFileSync('./workingData/results.txt').toString().split('\n');
    for (let i = 0; i < 41; i++){
        await writeQuestion(results[i],currentPage);
        currentPage.waitFor(getRandomInt(100, 3000));
        await currentPage.mouse.click(getRandomInt(2,50),getRandomInt(2,50))
    }

})();

async function parseData(page, collectionType){
    const bodyHandle = await currentPage.$('body');
    const html = await currentPage.evaluate(body => body.innerHTML, bodyHandle);
    debughtml = html;
    await bodyHandle.dispose();

    if (collectionType === "myQuestions"){
        let questions = html_data_extractor.scrapeMyQuestions(html);
        debugquestions = questions;
        dbwriter.pushRecords(questions);
    }
    if (collectionType === "topQuestions"){
        let questions = html_data_extractor.scrapeTopQuestions(html);
        debugquestions = questions;
        dbwriter.pushRecords(questions);
    }
}

async function scrapeDownloadedPages(pageType, target, date){
    let files = fs.readdirSync(target);
    for (let i = 0; i < files.length; i++) {
        if (files[i].substr(files[i].length - 5) === '.html'){
            await currentPage.goto('file://' + target + '/' + files[i], {timeout: 0});
            await parseData(currentPage, pageType);
        }
    }
    await dbwriter.writeRecords(date);
}

///Scrape Local Questions
(async () => {
    browser = await puppeteer.launch({headless:true, userDataDir: './browserdata'});
    currentPage = await browser.newPage();
    //scrapeDownloadedPages('topQuestions', process.env.HOME + '/Quora/TopQuestions');
    scrapeDownloadedPages('myQuestions', process.env.HOME + '/Quora/MyQuestions0214', '2019-02-14');
    scrapeDownloadedPages('myQuestions', process.env.HOME + '/Quora/MyQuestions0215', '2019-02-15');
    scrapeDownloadedPages('myQuestions', process.env.HOME + '/Quora/MyQuestions0213', '2019-02-13');
    scrapeDownloadedPages('myQuestions', process.env.HOME + '/Quora/MyQuestions0217', '2019-02-17');
    scrapeDownloadedPages('myQuestions', process.env.HOME + '/Quora/MyQuestions2');
})();



(async () => {

    //scrapeDownloadedPages('myQuestions', process.env.HOME + '/Quora/MyQuestions2');
})();


(async () => {
    await currentPage.goto('https://quora.com/partners');
})();





(async () => {
    await page.mouse.click(getRandomInt(0,100),getRandomInt(0,100))
})();




async function initializeBrowserPage(){
    await page.mouse.click(getRandomInt(0,100),getRandomInt(0,100))
}

async function scrapeMyRecentQuestions() {
    let page = initializeBrowserPage(quoraPageTargets['myQuestionsRecent']);
    scrollWithInterval(page, 2000, 800, getRandomInt(50000, 90000));
}

async function scrollWithInterval(currentPage, scrollLoTime, scrollHiTime, timeout){
    let intervalId = setInterval(scheduleRandomScroll,1000,currentPage, scrollLoTime, scrollHiTime);
    setTimeout(clearInterval, timeout, intervalId);
    setTimeout(scrapeEmitter.emit, timeout + 20000, "myRecentQuestionsParsefinished")
}

async function scheduleRandomScroll(currentPage, scrollLoTime, scrollHiTime){
    setTimeout(scroll, getRandomInt(scrollLoTime, scrollHiTime), currentPage);
}

async function scroll(page){
    await page.evaluate(async () => {window.scrollBy(0, 450)});
}


