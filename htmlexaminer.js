require('dotenv').config();
const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const cheerio = require('cheerio');
let fs = require('fs');
const {getScrapedQuoraDateInUTS, getScrapedQuoraDateInUTC, getDayDelta} = require('./timeutil');
const myQuestionsTarget = process.env.HOME + '/Quora/MyQuestions2';
const topQuestionsTarget = process.env.HOME + '/Quora/TopQuestionsTest';
let {getRandomInt, checksum} = require('./mathlib');
const puppeteer = require('puppeteer');
let html;
let browser;
let currentPage;
let questionCards;
let $;

(async () => {
    browser = await puppeteer.launch({headless:true, userDataDir: './browserdata'});
    currentPage = await browser.newPage();
    console.log("New browser page opened");
    let files = fs.readdirSync(myQuestionsTarget);
    console.log("Files loaded");
    if (files[0].substr(files[0].length - 5) === '.html'){
        await currentPage.goto('file://' + myQuestionsTarget + '/' + files[0], {timeout: 0});
        console.log("Get body html");
        let bodyHandle = await currentPage.$('body');
        console.log("Body handle obtained");
        html = await currentPage.evaluate(body => body.innerHTML, bodyHandle);
        await bodyHandle.dispose();
        console.log("Loading into cherrio");
        $ = cheerio.load(html);
        let questionCards = $('div.paged_list_wrapper')[0].children;
    }
})();
