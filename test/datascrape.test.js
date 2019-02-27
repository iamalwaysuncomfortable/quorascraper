require('dotenv').config();
const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const cheerio = require('cheerio');
let fs = require('fs');
const {getScrapedQuoraDateInUTS, getScrapedQuoraDateInUTC, getDayDelta} = require('../timeutil');
const myQuestionsTarget = process.env.HOME + '/Quora/MyQuestionsTest';
const topQuestionsTarget = process.env.HOME + '/Quora/TopQuestionsTest';
let {getRandomInt, checksum} = require('../mathlib');
const puppeteer = require('puppeteer');
let html;
let browser;
let currentPage;
let $;
let titleObject;
let linkObject;
let answerObject;
let earningsObject;
let metaDataObject;
let dateObject;
let topicObject;
let trafficObject;
let askObject;


describe('Data scraping logic passes for my questions', () => {
    before("Load scraped page into memory", async () => {
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
            titleObject = $(questionCards[0]).find(".ui_content_title");
            linkObject = $(questionCards[0]).find(".question_link");
            answerObject = $(questionCards[0]).find(".answer_count");
            earningsObject = $(questionCards[0]).find(".earnings_amount");
            metaDataObject = $(questionCards[0]).find(".meta_items");
            dateObject = $(questionCards[0]).find(".ask_date");
            topicObject = $(questionCards[0]).find(".TopicNameSpan");
            trafficObject = $(questionCards[0]).find(".external_traffic");
            askObject = $(questionCards[0]).find(".AskToAnswerModalLink");
        }
    });

    it('Scrapes title correctly', async () => {
        assert.notEqual(typeof titleObject, 'undefined');
        if (typeof titleObject !== 'undefined'){
            expect(titleObject.length).to.be.above(0);
        }
    });

    it('Scrapes link correctly', async () => {
        assert.notEqual(typeof linkObject, 'undefined');
        if (typeof linkObject !== 'undefined'){
            expect(linkObject.length).to.be.above(0);
        }
    });

    it('Scrapes answer correctly', async () => {
        assert.notEqual(typeof answerObject, 'undefined');
        if (typeof answerObject !== 'undefined'){
            expect(answerObject.length).to.be.above(0);
        }

    });

    it('Scrapes earnings correctly', async () => {
        assert.notEqual(typeof earningsObject, 'undefined');
        if (typeof earningsObject !== 'undefined'){
            expect(earningsObject.length).to.be.above(0);
        }
    });

    it('Scrapes followers, views, and ads correctly', async () => {
        assert.notEqual(typeof metaDataObject, 'undefined');
        if (typeof metaDataObject !== 'undefined'){
            expect(metaDataObject.length).to.be.above(0);
        }

    });

    it('Scrapes date correctly', async () => {
        assert.notEqual(typeof dateObject, 'undefined');
        if (typeof dateObject !== 'undefined'){
            expect(dateObject.length).to.be.above(0);
        }

    });

    it('Scrapes topics correctly', async () => {
        assert.notEqual(typeof topicObject, 'undefined');
        if (typeof topicObject !== 'undefined'){
            expect(topicObject.length).to.be.above(0);
        }
    });

    it('Scrapes traffic stats correctly', async () => {
        assert.notEqual(typeof trafficObject, 'undefined');
        if (typeof trafficObject !== 'undefined'){
            expect(trafficObject.length).to.be.above(0);
        }
    });

    it('Scrapes ask object correctly', async () => {
        assert.notEqual(typeof askObject, 'undefined');
        if (typeof askObject !== 'undefined'){
            expect(askObject.length).to.be.above(0);
        }
    });

});
