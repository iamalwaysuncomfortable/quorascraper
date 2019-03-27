require('dotenv').config();
const argv = require('yargs').option('args',{ string : true}).option('includeCategories', {
    type: 'array',
    desc: 'build options'
}).option('excludeCategories', {
    type: 'array',
    desc: 'build options'
}).argv;
const scraper = require('./quoraScraper');
const poster = require('./quoraPoster');

console.log(argv);

if ("scrape" in argv && !("post" in argv)) {
    (async () => {
        if ("myQuestions" in argv){
            await scraper.beginScrape("myQuestions")
        } else if ("topQuestions" in argv) {
            await scraper.beginScrape("topQuestions");
        }
    })();
} else if ("post" in argv && !("scrape" in argv) && ("numQuestions" in argv && Number.isInteger(argv["numQuestions"]))) {
    (async () => {
        let numQuestions;
        let excludeCategories;
        let includeCategories;
        if ("numQuestions" in argv) {
            numQuestions = argv["numQuestions"]
        }
        if ("excludeCategories" in argv && Array.isArray(argv["excludeCategories"]) && argv["excludeCategories"].length > 0) {
            excludeCategories = argv["excludeCategories"]
        }
        if ("includeCategories" in argv && Array.isArray(argv["includeCategories"]) && argv["includeCategories"].length > 0) {
            includeCategories = argv["includeCategories"]
        }
        poster.initializePosting(numQuestions, includeCategories, excludeCategories);

    })();
} else {
    console.log("\nERROR: Task execution failed, only one behavior type (--scrape or --post behavior) can be used at once " +
        "\nUSAGE: node jobExecutor.js --options \n" +
        " \n" +
        "QUESTION SCRAPING OPTIONS: \n" +
        " --scrape: specify this flag \n" +
        " --myQuestions: scrape my own questions \n"+
        "QUESTION POSTING OPTIONS: \n" +
        " --post: post questions on quora.com \n" +
        " --post:  \n" +
        " --numQuestions: number of questions to post ex. --numQuestions 50 \n" +
        " --excludeCategories: categories to exclude ex. --excludeCategory 'gossip'   \n" +
        " --includeCategories: categories to include ex. --includeCategory 'language' 'IT'" +
        " \n");
    console.log("args specified were:", argv, '\n');
}
