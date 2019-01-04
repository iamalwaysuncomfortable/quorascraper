const {checksum} = require('./mathlib');
const pg = require('pg');
const redis = require('redis');
const client = redis.createClient({port:parseInt(process.env.REDIS_PORT,10), host:process.env.REDIS_HOST});
const Validator = require('jsonschema').Validator;
const validator = new Validator();
const redisTableName = "questions";
const format = require('pg-format');
const queryclause = 'INSERT INTO questions(qhash, data) VALUES %L';
const EventEmitter = require('events');
class RedisEmitter extends EventEmitter {}
const redisEmitter = new RedisEmitter();
let testData1 = require("./testdata/question1.json");
let testData2 = require("./testdata/question2.json");
const questionSchema = {
    "id": "/Question",
    "type": "object",
    "properties": {
        "md5": {"type": "string"},
        "question": {"type": "string"},
        "views": {"type": "number"}
    },
    "required": ["md5","question","views"]
};
validator.addSchema(questionSchema, '/Question');

function writeRecords() {
    console.log("Record write beginning");
    client.lrange('questions', 0, -1, async function(err, data) {
        if (data instanceof Array){
            let results;
            console.log("Formatting beginning");
            results = data.map(x => [x.slice(0,32),x.slice(33,-1)]);
            console.log("format beginning");
            console.log(format(queryclause, results));
        }
    });
}



function validateRecord(data) {
    if (data instanceof Object && typeof data.question === "string"){
        try {
            if (validator.validate(data, questionSchema).errors.length <= 0){
                console.log("in validator statement");
                if (data['md5'] === checksum(data['question'],'md5') && data['md5'].length === 32){
                    try {
                        return JSON.stringify(data);
                    } catch (e) {
                        console.log("JSON Validation failed!");
                        return null
                    }
                }
                else{
                    console.log('md5 checksum did not match question title checksum');
                    return null
                }
            }
            else {
                console.log("Validation of data schema failed, each question must contain an md5 checksum, question, and number of views");
                return null
            }
        } catch (e) {
            console.log("Validation of data schema failed with error, record will not be recorded error was:\n" + e);
            return null
        }
    } else {
        console.log("data passed must be in object format, question key must be in string format, value of question was " + data.question);
        return null
    }
}

function pushRecords(data) {
    if(data instanceof Array) {
        for (let i = 0; i < data.length; i++){
            let record = validateRecord(data[i]);
            if (typeof record === 'string')  {client.rpush(redisTableName, data[i]['md5'] + "," + record)}
        }
    } else if(data instanceof Object && !(data instanceof Array)){
        let record = validateRecord(data);
        if (typeof record === 'string')  {client.rpush(redisTableName, data['md5'] + "," + record)}
    }

    client.llen(redisTableName, function(err, length) {
        console.log(length);
        if (length >= 2) {
            console.log("Begin Write");
            redisEmitter.emit('beginWrite');
        }
    })
}

redisEmitter.on('beginWrite', writeRecords);


let testData = [testData1,testData2];
pushRecords(testData);
///Code that reliably updates database
/*(async () => {
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
})();*/
