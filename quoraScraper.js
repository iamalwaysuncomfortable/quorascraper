require('dotenv').config();
let dbwriter = require('./dbwriter');
let {getRandomInt} = require('./mathlib');
const puppeteer = require('puppeteer');
let html_data_extractor = require('./html_data_extractor');
let fs = require('fs');

async function scroll(page, scrollInterval){
    await page.evaluate(async (scrollInterval) => {window.scrollBy(0, scrollInterval)}, scrollInterval);
}

async function clickViewMoreButton(page){
    let elements = await page.$$('.ui_section_footer');
    for (let element of elements) {
        if (element.clientHeight > 0) {
            element.click();
        }
    }
}

async function scrollWithInterval(page, scrollInterval=1000) {
    let allResultsScraped = false;
    let numberOfScrollFailures = 0;

    while (allResultsScraped === false){

        await page.waitFor(getRandomInt(300, 800));
        let previouseDocHeight = await page.evaluate(() => {return document.body.scrollHeight});
        console.log(previouseDocHeight)
        scroll(page, scrollInterval);
        let postScrollDocHeight = await page.evaluate(() => {return document.body.scrollHeight});
        let estimatedDocHeight = previouseDocHeight + scrollInterval - 50;

        console.log(estimatedDocHeight);
        console.log(postScrollDocHeight);
        if (estimatedDocHeight >  postScrollDocHeight) {

            numberOfScrollFailures =+ 1;

            await page.waitFor(getRandomInt(5000, 10000));
            let preClickHeight = await page.evaluate(() => {return document.body.scrollHeight});
            await clickViewMoreButton(page);
            await page.waitFor(getRandomInt(7000, 10000));
            let postClickHeight = await page.evaluate(() => {return document.body.scrollHeight});
            if (postClickHeight > preClickHeight){
                numberOfScrollFailures = 0;
            }
        }

        if (numberOfScrollFailures > 5) {
            allResultsScraped = true;
        }
    }
    return true;
}


async function parseData(page, collectionType){
    const bodyHandle = await page.$('body');
    const html = await page.evaluate(body => body.innerHTML, bodyHandle);
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

async function cleanUp(page, browser) {
    page.close();
    browser.close();
}


async function scrapeMyQuestions(scrollInterval){
    let browser = await puppeteer.launch({headless:false, userDataDir: './browserdata'});
    let page = await browser.newPage();
    await page.goto('https://quora.com/partners');
//    await scrollWithInterval(page, scrollInterval);
    //Download it
//    await parseData(page, "myQuestions");
//    cleanUp(page, browser);
}

async function scrapeDownloadedPages(page, pageType, target, date){
    let files = fs.readdirSync(target);
    for (let i = 0; i < files.length; i++) {
        if (files[i].substr(files[i].length - 5) === '.html'){
            await page.goto('file://' + target + '/' + files[i], {timeout: 0});
            await parseData(page, pageType);
        }
    }
    await dbwriter.writeRecords(date);
}



(async () => {
    browser = await puppeteer.launch({headless:false, userDataDir: './browserdata'});
    page = await browser.newPage();
    await page.goto('https://quora.com/partners');
})();


(async () => {


})();
