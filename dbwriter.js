const {checksum} = require('./mathlib');
const pg = require('pg');
const redis = require("async-redis");
const redisClient = redis.createClient({port:parseInt(process.env.REDIS_PORT,10), host:process.env.REDIS_HOST});
const Validator = require('jsonschema').Validator;
const validator = new Validator();
const redisTableName = process.env.REDISCACHETABLENAME;
const validationSchema = process.env.VALIDATIONSCHEMA;
const format = require('pg-format');
const pgqueries = require('./appData/pgqueries.json');
const upsertclause = pgqueries[process.env.UPSERTCLAUSE];
const EventEmitter = require('events');
class RedisEmitter extends EventEmitter {}
const redisEmitter = new RedisEmitter();
const pool = new pg.Pool();
const validationSchemas = require('./appData/docDataValidators.json');
validator.addSchema(validationSchemas[validationSchema], '/' + validationSchema);
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
const cacheFunctions = {
    "question":async (data) => {let categories = '{}';
    if (data['categories'] instanceof Array) categories = '{' + String(data['categories']) + '}';
    delete data['categories'];
    let record = validateRecord(data);
    if (typeof record === 'string')  {redisClient.rpush(redisTableName, data['md5'] + "|SPLIT|" + record + '|SPLIT|' + categories)}},
    "skill":async (data) => {let categories = '{}';
    if (data['categories'] instanceof Array) categories = '{' + String(data['categories']) + '}';
    delete data['categories'];
    let record = validateRecord(data);
    if (typeof record === 'string')  {redisClient.rpush(redisTableName, data['md5'] + "|SPLIT|" + record + '|SPLIT|' + categories)}}
};

async function executeQuery(query){
    let status = "failure";
    let client = await pool.connect();
    try {
        let res = await client.query(query);
        status = "success";
        console.log("data write successful")
    } catch (e) {
        console.log("query execution failed");
        console.log("error was:");
        console.log(e);
        status = "failure";
    } finally {
        await client.release();
        return status;
    }
}

async function writeRecords() {
    let data = await redisClient.lrange(redisTableName, 0, -1);
    if (data instanceof Array){
        let results = [];
        let keys = {};
        for(let i = 0, l = data.length; i < l; ++i){
            let result = data[i].split('|SPLIT|');
            if(!keys.hasOwnProperty(result[0]) && eval(validationSchemas[validationSchema+'-db'])) {
                result[2] = result[2].split('"').join('');
                results.push(result);
                keys[result[0]] = true;
            }
        }
        if (results.length > 0) {
            let query = format(upsertclause, results);
            let queryResult = await executeQuery(query);
            if (queryResult === "success"){
                await redisClient.del(redisTableName);
            } else {
                console.log("Record write failed");
            }
        } else {
            console.log("Record Write Failed Because there were no valid results");
        }

    }

}

function preValidateCachedRecord(jsonb){
    let isValid = false;
    try {
        let result = JSON.parse(jsonb);
        if (typeof result === "object") {
            isValid = (typeof validateRecord(result) === 'string');
        }
    }
    catch (e) {}
    return isValid;
}

function validateRecord(data) {
    if (data instanceof Object && typeof data.question === "string"){
        try {
            if (validator.validate(data, validationSchemas[validationSchema]).errors.length <= 0){
                if (data['md5'] === checksum(data[validationSchema],'md5') && data['md5'].length === 32){
                    try {
                        return JSON.stringify(data);
                    } catch (e) {
                        console.log("JSON Validation failed!");
                        return null
                    }
                }
                else{
                    //console.log('md5 checksum did not match question title checksum');
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

async function pushRecords(data) {
    if(data instanceof Array) {
        for (let i = 0; i < data.length; i++){
            cacheFunctions[validationSchema](data[i]);
        }
    } else if(data instanceof Object && !(data instanceof Array)){
        cacheFunctions[validationSchema](data);
    }

    let length = await redisClient.llen(redisTableName);
    if (length >= process.env.CACHERECORDLIMIT) {
        redisEmitter.emit('beginWrite');
    }
}

function forceWrite(){
    redisEmitter.emit("beginWrite");
}

redisEmitter.on('beginWrite', writeRecords);

module.exports.pushRecords = pushRecords;
module.exports.validateRecord = validateRecord;
module.exports.writeRecords = writeRecords;
module.exports.forceWrite = forceWrite;