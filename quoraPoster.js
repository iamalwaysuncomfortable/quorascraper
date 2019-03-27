require('dotenv').config();
const dbwriter = require('./dbwriter');
const dbreader = require('./dbreader');
const {getRandomInt} = require('./mathlib');
const puppeteer = require('puppeteer');

async function writeQuestion(question, page){
    await page.waitFor(getRandomInt(10000, 30000));
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
    await page.waitFor(getRandomInt(3500, 5000));
    await page.mouse.click(getRandomInt(2,50),getRandomInt(300,400));
    if (getRandomInt(0,2) > 0){
        await page.waitFor(getRandomInt(2500, 5000));
        await page.mouse.click(30,325);
        await page.waitFor(getRandomInt(2500, 5000));
        await page.mouse.click(30,325);
    }
}

async function cleanUp(page, browser) {
    page.close();
    browser.close();
}

async function closeCategoryPopup(page) {
    page.evaluate(() => {
            let elements = document.getElementsByClassName('ui_button_icon');
            for (let element of elements) {
                if (element.clientHeight > 10 && element.clientWidth > 10) {
                    element.click();
                }
            }
        }
    );
}

async function writeQuestionBatch(questions, page) {
    let stopInterval = getRandomInt(60 ,70);
    for (let i = 0; i < questions.length; i++){
        await writeQuestion(questions[i],page);
        page.waitFor(getRandomInt(60000, 120000));
        await page.mouse.click(getRandomInt(30,50),getRandomInt(300,400));
        if (i > 0 && i % stopInterval === 0){
            await dbwriter.upsertAskedQuestions(questions.slice(i-stopInterval, i));
            await page.waitFor(getRandomInt(600000, 1200000));
            stopInterval = getRandomInt(60,70);
        }
    }
    await dbwriter.upsertAskedQuestions(questions);
}

async function getQuestions(amount, inclusiveCategories, exclusiveCategories) {
    let questions = await dbreader.readRandomResults(amount, inclusiveCategories, exclusiveCategories);
    if (Array.isArray(questions) && questions.length > 0) {
        return questions;
    } else {
        throw "Query failed or list of questions was empty, please specify valid categories and a number greater than zero"
    }
}

async function initializePosting(numQuestions, categoriesToInclude, categoriesToExclude){
    let browser = await puppeteer.launch({headless:false, userDataDir: './browserdata'});
    const page = await browser.newPage();
    await page.goto('https://quora.com/partners');
    try {
        const questions = await getQuestions(numQuestions, categoriesToInclude, categoriesToExclude);
        await writeQuestionBatch(questions, page);
    } catch (e){
        console.log(e);
    } finally {
        await cleanUp(browser, page);
    }

}

module.exports.initializePosting = initializePosting;
module.exports.getQuestions = getQuestions;
