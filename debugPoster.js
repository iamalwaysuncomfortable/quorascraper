const dbwriter = require('./dbwriter');
const dbreader = require('./dbreader');
const {getRandomInt} = require('./mathlib');
const puppeteer = require('puppeteer');
const questionAreaSelector = 'textarea.TextInput___StyledTextarea-sc-9srrla-1';
const submitButtonSelector = 'div.cKuMZv';
const submitButtonTextSelector = 'div.puppeteer_test_button_text'
const askQuestionSelector = 'a.AskQuestionButton';
let browser;
let page;

(async () => {
    browser = await puppeteer.launch({headless:false, userDataDir: './browserdata'});
    page = await browser.newPage();
    await page.goto('https://quora.com/partners');
})();

async function clickAddQuestion(){
        await page.evaluate((askQuestionSelector) => document.querySelector(askQuestionSelector).click(), askQuestionSelector);
}

async function typeQuestion(question){
    await page.type(questionAreaSelector, question, {delay: getRandomInt(20, 45)});
}

async function clickSubmitButton() {
    await page.evaluate((submitButtonSelector) => document.querySelector(submitButtonSelector).click(), submitButtonSelector)
}

async function clickUseSuggestionButton(){
    let buttonCandidates = await page.$$(submitButtonTextSelector);
    for (let i = 0; i < buttonCandidates.length; i++){
        let width = await page.evaluate(element => element.clientWidth, buttonCandidates[i]);
        if (width > 0){
            buttonCandidates
        }
    }
}

async function clickSpellCheck() {
    let buttonCandidates = await page.$$(submitButtonTextSelector);
    for (let i = 0; i < buttonCandidates.length; i++){
        let text = await page.evaluate(element => element.textContent, buttonCandidates[i]);
        let width = await page.evaluate(element => element.clientWidth, buttonCandidates[i]);
        if ((text === 'Use suggestion') && (width > 0))
        {
            await page.evaluate((button) => button.click(), buttonCandidates[i])
        }
    }
}

async function isSimilarQuestionAlreadyAsked(){
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

(async () => {
    await page.waitFor(getRandomInt(1500, 3000));
    await clickAddQuestion();
    await page.waitFor(getRandomInt(1500, 3000));
    await typeQuestion('How do you do ecommerce internationally');
    await page.waitFor(getRandomInt(1500, 3000));
    await clickSubmitButton();
    await page.waitFor(getRandomInt(11500, 13000));
    await clickSpellCheck();
    await isSimilarQuestionAlreadyAsked();
})();



