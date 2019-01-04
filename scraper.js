const puppeteer = require('puppeteer');
require('dotenv').config();
const {getRandomInt} = require('./mathlib');
let myclass = "text header_login_text_box ignore_interaction";
let browser;
let page;
let element;
let cookies;
let testData1 = require("./testdata/question1.json");
let testData2 = require("./testdata/question2.json");

(async () => {
    let client = new pg.Client();
    let testData1 = require("./testdata/question1.json");
    let testData2 = require("./testdata/question2.json");
    let questionID = checksum(testData1['Question'].toLowerCase(),'md5');
    let questionData = JSON.stringify(testData1);
    let text = 'INSERT INTO questions(qhash, data) VALUES($1, $2) RETURNING *';
    let values = [questionID, questionData];
    await client.connect();
    const res = await client.query(text, values);
    console.log(res.rows[0].message); // Hello world!
    await client.end()
    })();


(async () => {
    const browser = await puppeteer.launch({headless:false, userDataDir: './browserdata'});
    const page = await browser.newPage();
    await page.goto('https://quora.com/partners');
    await page.type('[placeholder="Email"]', process.env.QUORA_ID, {delay: getRandomInt(5,12)});
    await page.type('[placeholder="Password"]', process.env.QUORA_PASS, {delay: getRandomInt(5,12)});
    await page.click('[value=Login]', {delay: getRandomInt(15,60)});
})();


(async () => {browser = await puppeteer.launch({headless:false, userDataDir: './browserdata'});})();
(async () => {page = await browser.newPage();})();
(async () => {await page.goto('https://quora.com/partners');})();
(async () => {await page.select('select[name=email]')})();
(async () => {await page.type('input[placeholder="Email"]', process.env.QUORA_ID, {delay: 100})})();
(async () => {await page.type('input[placeholder="Password"]', process.env.QUORA_PASS, {delay: 10})})();
(async () => {await page.click('[value=Login]')})();
{}


(async () => {await client.llen('mylist', function(err, reply) {answer = reply; console.log(answer)});})();
(async () => {})();
(async () => {})();


(async () => {})();
(async () => {})();

    (async () => {
        try {
            console.log("trying");
            element = await page.evaluate(() => {
                let meclass = "text header_login_text_box ignore_interaction";
                return document.getElementsByName("email");
            });
        }
        catch (e){
            console.log("error message:");
            console.log(e);
        }
    })();

(async () => {element = await page.$eval('.header login_text_box ignore_interaction', e => e);})();
(async () => {})();