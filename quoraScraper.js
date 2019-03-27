require('dotenv').config();
let dbwriter = require('./dbwriter');
let {getRandomInt} = require('./mathlib');
const puppeteer = require('puppeteer');
const SAVEDIRECTORY = process.env.SAVEDIRECTORY;
let html_data_extractor = require('./html_data_extractor');
let fs = require('fs');

async function clickViewMoreButton(page){
    page.evaluate(() => {
            let elements = document.getElementsByClassName('ui_section_footer');
            for (let element of elements) {
                if (element.clientHeight > 0) {
                    element.click();
                }
            }
        }
    );
}

async function scrollWithInterval(page, scrollInterval=1000) {
    let allResultsScraped = false;
    let numberOfScrollFailures = 0;

    while (allResultsScraped === false){
        await page.waitFor(1000);

        let previousHeight = await page.evaluate('document.body.scrollHeight');

        try {
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        } catch (e){
            console.log("Scroll failed")
        }

        try {
            await page.waitForFunction('document.body.scrollHeight > ${previousHeight}', {timeout: 5000});
        } catch (e){
            numberOfScrollFailures =+ 1;
            await clickViewMoreButton(page, scrollInterval);
            await page.waitFor(scrollInterval);
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


async function savePageToFile(page) {
    const html = await page.content();
    let d = new Date();
    let date = new Date().toString().split(d.getUTCFullYear());
    date = (((date[0].replace(/\ /g,'_') + d.getUTCFullYear()).replace('_',' ')).split(' '))[1];
    let filepath = SAVEDIRECTORY + '/' + date + '/myQuestions.html';
    fs.writeFileSync(filepath, html);
}

async function scrapeMyQuestions(){
    let browser = await puppeteer.launch({headless:false, userDataDir: './browserdata'});
    let page = await browser.newPage();
    await page.goto('https://quora.com/partners');
    await scrollWithInterval(page, 1000);
    await savePageToFile(page);
    try{
        await parseData(page, "myQuestions");
    } catch (e) {
        console.log(e);
    }
    await cleanUp(page, browser);
}

async function scrapeTopQuestions(){
    console.log("Functionality not implemented yet, will be in future")
}

//Scrape
async function beginScrape (questionType, local=false) {
    if (questionType === "myQuestions" && local===false){
        await scrapeMyQuestions();
    } else if (questionType === "topQuestions" && local===false) {
        await scrapeTopQuestions();
    } else {
        throw ("question type specified not supported")
    }

}

module.exports.beginScrape = beginScrape;




