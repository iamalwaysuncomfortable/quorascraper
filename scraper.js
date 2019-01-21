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

async function parseData(page, collectionType){
    const bodyHandle = await currentPage.$('body');
    const html = await currentPage.evaluate(body => body.innerHTML, bodyHandle);
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

///Scrape Local Questions
(async () => {
    browser = await puppeteer.launch({headless:true, userDataDir: './browserdata'});
    currentPage = await browser.newPage();
    scrapeDownloadedPages('topQuestions', process.env.HOME + '/Quora/TopQuestions');
    scrapeDownloadedPages('myQuestions', process.env.HOME + '/Quora/MyQuestions');
})();

async function scrapeDownloadedPages(pageType, target){
    let files = fs.readdirSync(target);
    for (let i = 0; i < files.length; i++) {
        if (files[i].substr(files[i].length - 5) === '.html'){
            await currentPage.goto('file://' + target + '/' + files[i]);
            await parseData(currentPage, pageType);
        }
    }
    await dbwriter.writeRecords();
}

async function initializeBrowserPage(){
    //Should check browser is initialized, and page points to browser page
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