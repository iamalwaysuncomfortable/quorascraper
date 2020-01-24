require('dotenv').config();
const argv = require('yargs').option('args',{ string : true}).option('includeCategories', {
    type: 'array',
    desc: 'build options'
}).option('excludeCategories', {
    type: 'array',
    desc: 'build options'
}).argv;

if ("port" in argv && "user" in argv && "database" in argv && "host" in argv){
    process.env['PGUSER'] = argv["user"];
    process.env['PGHOST'] = argv["host"];
    process.env['PGDATABASE'] = argv["database"];
    process.env['PGPORT'] = argv["port"];
} else {
    process.env['PGUSER'] = 'postgres';
    process.env['PGHOST'] = 'localhost';
    process.env['PGDATABASE'] = 'quorastats';
    process.env['PGPORT'] = '5432';
    process.env['PGPASSWORD'] = 'test';
}

const scraper = require('./quoraScraper');
const poster = require('./quoraPoster');

console.log(argv);

if ("scrape" in argv && !("post" in argv)) {
    (async () => {
        if ("myQuestions" in argv && !("topQuestions" in argv)){
            if ("localDirectory" in argv && typeof(argv["localDirectory"]) === "string") {
                await scraper.beginScrape("myQuestions", argv["localDirectory"], argv["date"]);
            }
            else {
                await scraper.beginScrape("myQuestions");
            }
        } else if ("topQuestions" in argv && !("myQuestions" in argv)) {
            if ("localDirectory" in argv && typeof(argv["localDirectory"]) === "string") {
                await scraper.beginScrape("topQuestions", argv["localDirectory"], argv["date"]);
            }
            else {
                await scraper.beginScrape("topQuestions");
            }
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
