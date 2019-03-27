const cheerio = require('cheerio');
const {checksum} = require('./mathlib');
const {getScrapedQuoraDateInUTS, getScrapedQuoraDateInUTC, getDayDelta} = require('./timeutil');


function scrapeMyQuestions(html, referenceDate, newest=true) {
    let questions = [];
    let $ = cheerio.load(html);
    let questionGroups = $('div.paged_list_wrapper');
    let selectedIndex = 0;
    for (let c = 1; c < questionGroups.length; c++){
        if (questionGroups[c].children.length > questionGroups[c-1].children.length){
            selectedIndex = c;
        }
    }

    let questionCards = $('div.paged_list_wrapper')[selectedIndex].children;
    for (let i = 0; i < questionCards.length; i++)
    {
        try {
            if (questionCards[i].children.length <= 0) {
                continue
            }
            let question = {"categories": []};
            let titleObject = $(questionCards[i]).find(".ui_content_title");
            let linkObject = $(questionCards[i]).find(".question_link");
            let answerObject = $(questionCards[i]).find(".answer_count");
            let earningsObject = $(questionCards[i]).find(".earnings_amount");
            let metaDataObject = $(questionCards[i]).find(".meta_items");
            let dateObject = $(questionCards[i]).find(".ask_date");
            let topicObject = $(questionCards[i]).find(".TopicNameSpan");
            let trafficObject = $(questionCards[i]).find(".external_traffic");
            let askObject = $(questionCards[i]).find(".AskToAnswerModalLink");
            if (titleObject.length > 0) {
                question.md5 = checksum(titleObject[0].children[0].children[0].data, 'md5');
                question.question = titleObject[0].children[0].children[0].data;
                console.log(question.question);
            }
            if (linkObject.length > 0) {
                question.link = linkObject[0].attribs.href;
            }
            if (answerObject.length > 0) {
                question.answers = Number(answerObject[0].children[0].data.split(' ')[0]);
            }
            if (earningsObject.length > 0) {
                question.earnings = Number(earningsObject[0].children[0].data.replace(/[^0-9.-]+/g, ""));
            }
            if (metaDataObject.length > 0) {
                if (newest === true){
                    question.followers = Number(metaDataObject[0].children[0].children[0].children[1].children[0].data.split(',').join(''));
                    question.views = Number(metaDataObject[0].children[0].children[1].children[1].children[0].data.split(',').join(''));
                    question.adimpressions = Number(metaDataObject[0].children[0].children[2].children[1].children[0].data.split(',').join(''));
                } else {
                    question.followers = Number(metaDataObject[0].children[0].children[1].children[0].data.split(',').join(''));
                    question.views = Number(metaDataObject[0].children[1].children[1].children[0].data.split(',').join(''));
                    question.adimpressions = Number(metaDataObject[0].children[2].children[1].children[0].data.split(',').join(''));
                }

            }
            if (dateObject.length > 0){
                let time = dateObject[0].children[0].data.replace('Asked ','');
                question.date = getScrapedQuoraDateInUTC(time, referenceDate);
                question.uts = getScrapedQuoraDateInUTS(time, referenceDate);
            }
            if (topicObject.length > 0) {
                for (let j = 0; j < topicObject.length; j++) {
                    question['categories'].push(topicObject[j].children[0].data);
                }
            }
            if (askObject.length > 0) {
                try {
                    if (isNaN(Number(askObject[0].children[1].children[0].data)) === false) {
                        question.requests = Number(askObject[1].children[1].children[0].data);
                    }
                }
                catch {
                    //Do nothing
                }
            }
            if (trafficObject.length > 0) {
                question.internal = Number($(questionCards[i]).find(".internal_traffic")[0].children[0].children[0].data.split(' ')[0].replace('%', ''));
                question.external = Number(trafficObject[0].children[0].children[0].data.split(' ')[0].replace('%', ''));
            }
            question.iasked = true;
            questions.push(question);
        } catch (e) {
            console.log("Record not written, skipping. Error message was");
            console.log(e);
        }
    }
    return questions
}

function scrapeTopQuestions(html, newest=true){
    let questions = [];
    let $ = cheerio.load(html);
    let questionGroups = $('div.paged_list_wrapper');
    let selectedIndex = 0;
    for (let c = 1; c < questionGroups.length; c++){
        if (questionGroups[c].children.length > questionGroups[c-1].children.length){
            selectedIndex = c;
        }
    }
    let questionCards = $('div.paged_list_wrapper')[selectedIndex].children;
    for (let i = 0; i < questionCards.length; i++)
    {
        try {
            if (questionCards[i].children.length <= 0) {
                continue
            }
            let question = {"categories": []};
            let titleObject = $(questionCards[i]).find(".ui_content_title");
            let linkObject = $(questionCards[i]).find(".question_link");
            let answerObject = $(questionCards[i]).find(".answer_count");
            let earningsObject = $(questionCards[i]).find(".earnings_amount");
            let metaDataObject = $(questionCards[i]).find(".meta_items");
            let dateObject = $(questionCards[i]).find(".ask_date");
            let topicObject = $(questionCards[i]).find(".TopicNameSpan");
            let trafficObject = $(questionCards[i]).find(".external_traffic");
            if (titleObject.length > 0) {
                question.md5 = checksum(titleObject[0].children[0].children[0].data, 'md5');
                question.question = titleObject[0].children[0].children[0].data;
                console.log(question.question);
            }
            if (linkObject.length > 0) {
                question.link = linkObject[0].attribs.href;
            }
            if (answerObject.length > 0) {
                question.answers = Number(answerObject[0].children[0].data.split(' ')[0]);
            }
            if (earningsObject.length > 0) {
                question.earnings = Number(earningsObject[0].children[0].data.replace(/[^0-9.-]+/g, ""));
            }
            if (metaDataObject.length > 0) {
                if (newest === true){
                    question.followers = Number(metaDataObject[0].children[0].children[0].children[1].children[0].data.split(',').join(''));
                    question.views = Number(metaDataObject[0].children[0].children[1].children[1].children[0].data.split(',').join(''));
                    question.adimpressions = Number(metaDataObject[0].children[0].children[2].children[1].children[0].data.split(',').join(''));
                } else {
                    question.followers = Number(metaDataObject[0].children[0].children[1].children[0].data.split(',').join(''));
                    question.views = Number(metaDataObject[0].children[1].children[1].children[0].data.split(',').join(''));
                    question.adimpressions = Number(metaDataObject[0].children[2].children[1].children[0].data.split(',').join(''));
                }
            }
            if (dateObject.length > 0){
                let time = dateObject[0].children[0].data.replace('Asked ','');
                question.date = getScrapedQuoraDateInUTC(time);
                question.uts = getScrapedQuoraDateInUTS(time);
            }
            if (topicObject.length > 0) {
                for (let j = 0; j < topicObject.length; j++) {
                    question['categories'].push(topicObject[j].children[0].data);
                }
            }
            if (trafficObject.length > 0) {
                question.internal = Number($(questionCards[i]).find(".internal_traffic")[0].children[0].children[0].data.split(' ')[0].replace('%', ''));
                question.external = Number(trafficObject[0].children[0].children[0].data.split(' ')[0].replace('%', ''));
            }
            question.iasked = false;
            questions.push(question);
        } catch (e) {
            console.log("Record not written, skipping. Error message was");
            console.log(e);
        }
    }
    return questions
}


module.exports.scrapeMyQuestions = scrapeMyQuestions;
module.exports.scrapeTopQuestions = scrapeTopQuestions;
