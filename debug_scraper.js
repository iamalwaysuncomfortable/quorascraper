const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
let $;

async function debug_scraper(page){
    let bodyHandle = await page.$('body');
    let html = await page.evaluate(body => body.innerHTML, bodyHandle);
    let $ = cheerio.load(html);
    return $;
}


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
let questionCards;
(async () => {
    let browser = await puppeteer.launch({headless:true, userDataDir: './browserdata'});
    let page = await browser.newPage();
    await page.goto('file:///home/salty/Quora/MyQuestions0320/pq.html');
    $ = await debug_scraper(page);
    //scrapeDownloadedPages(page2, 'myQuestions', '/home/salty/Quora/MyQuestions0320')
    await browser.close();
    i = 0;
    questionCards = $('div.paged_list_wrapper')[1].children;
    titleObject = $(questionCards[i]).find(".ui_content_title");
    linkObject = $(questionCards[i]).find(".question_link");
    answerObject = $(questionCards[i]).find(".answer_count");
    earningsObject = $(questionCards[i]).find(".earnings_amount");
    metaDataObject = $(questionCards[i]).find(".meta_items");
    dateObject = $(questionCards[i]).find(".ask_date");
    topicObject = $(questionCards[i]).find(".TopicNameSpan");
    trafficObject = $(questionCards[i]).find(".external_traffic");
    askObject = $(questionCards[i]).find(".AskToAnswerModalLink");
})();
