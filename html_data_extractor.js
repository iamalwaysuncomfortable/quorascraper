const cheerio = require('cheerio');
const {checksum} = require('./mathlib');

function checkClassExistence(classSelector){
    if (classSelector.length > 0){
        return classSelector
    }

}

function scrapeMyQuestions(html){
    let questions = [];
    let $ = cheerio.load(html);
    let questionCards = $('div.paged_list_wrapper')[0].children;
    for (let i = 0; i < questionCards.length; i++)
    {
        try {
            if (questionCards[i].children.length <= 0) {
                continue
            }
            let question = {"categories": []};
            if ($(questionCards[i]).find(".ui_story_title").length > 0) {
                question.md5 = checksum($(questionCards[i]).find(".ui_story_title")[0].children[0].children[0].data, 'md5');
                question.question = $(questionCards[i]).find(".ui_story_title")[0].children[0].children[0].data;
                console.log(question.question);
            }
            if ($(questionCards[i]).find(".question_link").length > 0) {
                question.link = $(questionCards[i]).find(".question_link")[0].attribs.href;
            }
            if ($(questionCards[i]).find(".answer_count").length > 0) {
                question.answers = Number($(questionCards[i]).find(".answer_count")[0].children[0].data.split(' ')[0]);
            }
            if ($(questionCards[i]).find(".earnings_amount").length > 0) {
                question.earnings = Number($(questionCards[i]).find(".earnings_amount")[0].children[0].data.replace(/[^0-9.-]+/g, ""));
            }
            if ($(questionCards[i]).find(".meta_items").length > 0) {
                question.followers = Number($(questionCards[i]).find(".meta_items")[0].children[0].children[1].children[0].data.replace(',', ''));
                question.views = Number($(questionCards[i]).find(".meta_items")[0].children[1].children[1].children[0].data.replace(',', ''));
                question.adimpressions = Number($(questionCards[i]).find(".meta_items")[0].children[2].children[1].children[0].data.replace(',', ''));
            }
            if ($(questionCards[i]).find(".TopicNameSpan").length > 0) {
                let categorydata = $(questionCards[i]).find(".TopicNameSpan");
                for (let j = 0; j < categorydata.length; j++) {
                    question['categories'].push(categorydata[j].children[0].data);
                }
            }
            if ($(questionCards[i]).find(".AskToAnswerModalLink").length === 0 && (isNaN(Number($(questionCards[i]).find(".AskToAnswerModalLink")[1].children[1].children[0].data))) === false) {
                question.requests = Number($(questionCards[i]).find(".AskToAnswerModalLink")[1].children[1].children[0].data)
            }
            if ($(questionCards[i]).find(".external_traffic").length > 0) {
                question.internal = Number($(questionCards[i]).find(".internal_traffic")[0].children[0].children[0].data.split(' ')[0].replace('%', ''));
                question.external = Number($(questionCards[i]).find(".external_traffic")[0].children[0].children[0].data.split(' ')[0].replace('%', ''));
            }
            questions.push(question);
        } catch (e) {
            console.log("Record not written, skipping. Error message was");
            console.log(e);
        }
    }
    return questions
}

function scrapeTopQuestions(html){
    let questions = [];
    let $ = cheerio.load(html);
    let questionCards = $('div.paged_list_wrapper')[0].children;
    for (let i = 0; i < questionCards.length; i++)
    {
        try {
            if (questionCards[i].children.length <= 0) {
                continue
            }
            let question = {"categories": []};
            if ($(questionCards[i]).find(".ui_story_title").length > 0) {
                question.md5 = checksum($(questionCards[i]).find(".ui_story_title")[0].children[0].children[0].data, 'md5');
                question.question = $(questionCards[i]).find(".ui_story_title")[0].children[0].children[0].data;
                console.log(question.question);
            }
            if ($(questionCards[i]).find(".question_link").length > 0) {
                question.link = $(questionCards[i]).find(".question_link")[0].attribs.href;
            }
            if ($(questionCards[i]).find(".answer_count").length > 0) {
                question.answers = Number($(questionCards[i]).find(".answer_count")[0].children[0].data.split(' ')[0]);
            }
            if ($(questionCards[i]).find(".earnings_amount").length > 0) {
                question.earnings = Number($(questionCards[i]).find(".earnings_amount")[0].children[0].data.replace(/[^0-9.-]+/g, ""));
            }
            if ($(questionCards[i]).find(".meta_items").length > 0) {
                question.followers = Number($(questionCards[i]).find(".meta_items")[0].children[0].children[1].children[0].data.split(',').join(''));
                question.views = Number($(questionCards[i]).find(".meta_items")[0].children[1].children[1].children[0].data.split(',').join(''));
                question.adimpressions = Number($(questionCards[i]).find(".meta_items")[0].children[2].children[1].children[0].data.split(',').join(''));
            }
            if ($(questionCards[i]).find(".TopicNameSpan").length > 0) {
                let categorydata = $(questionCards[i]).find(".TopicNameSpan");
                for (let j = 0; j < categorydata.length; j++) {
                    question['categories'].push(categorydata[j].children[0].data);
                }
            }
            if ($(questionCards[i]).find(".external_traffic").length > 0) {
                question.internal = Number($(questionCards[i]).find(".internal_traffic")[0].children[0].children[0].data.split(' ')[0].replace('%', ''));
                question.external = Number($(questionCards[i]).find(".external_traffic")[0].children[0].children[0].data.split(' ')[0].replace('%', ''));
            }
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