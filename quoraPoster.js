const dbwriter = require('./dbwriter');
const dbreader = require('./dbreader');
const {getRandomInt} = require('./mathlib');
const puppeteer = require('puppeteer');
const questionAreaSelector = 'textarea.TextInput___StyledTextarea-sc-9srrla-1';
const submitButtonSelector = 'div.cKuMZv';
const submitButtonTextSelector = 'div.puppeteer_test_button_text'
const askQuestionSelector = 'a.AskQuestionButton';

///Information Gathering Functions
async function determineQuestionDialogIsLoaded(page){
    let isLoaded = false;
    isLoaded = await page.evaluate(() => {
            let elements = document.querySelectorAll( 'textarea.TextInput___StyledTextarea-sc-9srrla-1' );
            for (let element of elements) {
                if (element.clientHeight > 0) {
                    element.click();
                    return true;
                }
            }
        }
    );
    return isLoaded;
}

async function determineIfDialogsArePresent(page){
    let openDialog = "none";
    let possibleDialogs = ["EditTopicsModalStep","A2aModalStep"];
    openDialog = await page.evaluate(() => {
            let elements = document.querySelectorAll( 'textarea.TextInput___StyledTextarea-sc-9srrla-1' );
            for (let element of elements) {
                if (element.clientHeight > 0) {
                    return "questionAuthorBox";
                }
            }
            return "none"
        }
    );
    console.log(openDialog);
    if (openDialog === "questionAuthorBox") return openDialog;

    for (let dialog of possibleDialogs) {
        openDialog = await page.evaluate((dialog) => {
                let elements = document.getElementsByClassName(dialog);
                for (let element of elements) {
                    if (element.clientHeight > 0) {
                        return dialog;
                    }
                }
                return "none"
            }
        ,dialog);
        console.log(openDialog);
        if (possibleDialogs.includes(openDialog)) return openDialog;
    }
    console.log(openDialog);
    return openDialog;

}

async function isSimilarQuestionAlreadyAsked(page){
    let buttonCandidates = await page.$$(submitButtonTextSelector);
    for (let i = 0; i < buttonCandidates.length; i++){
        let text = await page.evaluate(element => element.textContent, buttonCandidates[i]);
        let width = await page.evaluate(element => element.clientWidth, buttonCandidates[i]);
        if ((text === 'Add new question' || text === 'View question') && (width > 0))
        {
            console.log(true);
            return true;
        }
    }
    console.log(false);
    return false;
}


///Interaction Functions

async function clickAddQuestion(page){
    console.log(askQuestionSelector);
    await page.evaluate((askQuestionSelector) => document.querySelector(askQuestionSelector).click(), askQuestionSelector);
}

async function typeQuestion(page, question){
    await page.type(questionAreaSelector, question, {delay: getRandomInt(20, 45)});
}

async function clickSubmitButton(page) {
    await page.evaluate((submitButtonSelector) => document.querySelector(submitButtonSelector).click(), submitButtonSelector);
}

async function clickSpellCheck(page) {
    let buttonCandidates = await page.$$(submitButtonTextSelector);
    for (let i = 0; i < buttonCandidates.length; i++){
        let text = await page.evaluate(element => element.textContent, buttonCandidates[i]);
        let width = await page.evaluate(element => element.clientWidth, buttonCandidates[i]);
        if ((text === 'Use suggestion') && (width > 0))
        {
            await page.evaluate((button) => button.click(), buttonCandidates[i]);
        }
    }
}

async function writeQuestion(question, page){
    try {
        await page.waitFor(getRandomInt(10000, 30000));
        await clickAddQuestion(page);
        for (let k = 0; k < 6; k++) {
            let isLoaded = false;
            await page.waitFor(getRandomInt(5000, 6500));
            isLoaded = await determineQuestionDialogIsLoaded(page);
            if (isLoaded === true) {
                await clickAddQuestion(page);
                await page.waitFor(getRandomInt(1500, 3500));
                await typeQuestion(page, question);
                await page.waitFor(getRandomInt(1500, 3500));
                await clickSubmitButton(page);
                await page.waitFor(getRandomInt(9000, 13500));
                clickSpellCheck(page);
                break
            }
            if (k === 5) return false;
        }
        await page.waitFor(getRandomInt(3500, 5000));
        await page.mouse.click(30, 325);
        await page.waitFor(getRandomInt(2500, 5000));
        await page.mouse.click(30, 325);
        for (let j = 0; j < 6; j++){
            let dialogPresent = await determineIfDialogsArePresent(page);
            if (dialogPresent === "none"){
                break
            } else if (j === 5){
                return false;
            } else {
                await page.waitFor(getRandomInt(2500, 5000));
                await page.mouse.click(30, 325);
            }
        }
        return true;
    }
    catch (e){
        console.log(e);
        return false;
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
        let success = await writeQuestion(questions[i],page);
        if (success === false) {
            try {
                let response = await page.reload(30);
                if (!response.ok()) {
                    let startingIndex = 0;
                    if (i - stopInterval > 0){
                        startingIndex = i - stopInterval;
                    }
                    await dbwriter.upsertAskedQuestions(questions.slice(startingIndex, i));
                    return
                }
            }
            catch(e){
                console.log(e);
            }
        }
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
