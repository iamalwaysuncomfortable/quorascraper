const {checksum} = require('./mathlib');
const pg = require('pg');
const redis = require('redis');
const redisClient = redis.createClient({port:parseInt(process.env.REDIS_PORT,10), host:process.env.REDIS_HOST});
const Validator = require('jsonschema').Validator;
const validator = new Validator();
const redisTableName = process.env.REDISCACHETABLENAME;
const validationSchema = process.env.VALIDATIONSCHEMA;
const format = require('pg-format');
const pgqueries = require('./validationData/pgqueries.json');
const upsertclause = pgqueries[process.env.UPSERTCLAUSE];
const EventEmitter = require('events');
class RedisEmitter extends EventEmitter {}
const redisEmitter = new RedisEmitter();
let pool;
const validationSchemas = require('./validationData/docDataValidators.json');
validator.addSchema(validationSchemas[validationSchema], '/' + validationSchema);
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


async function openPool(){
    if (typeof pool === "undefined") {
        pool = new pg.Pool();
        pool.on('error', (err, client) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    } else {
        console.log("An existing pool is still active or pool variable has another artifact, " +
            "please close call close pool protocol before proceeding");
    }
}

async function closePool(){
    if (typeof pool === "object" && typeof pool.domain === "object") {
        pool.removeAllListeners();
        await pool.end();
        pool = undefined;
    } else {
        console.log("No pool was active, pool variable cleared, new pool can now be initialized");
        pool = undefined;
    }
}

async function executeQuery(query){
    console.log(query);
    await openPool();
    let status = "failure";
    try {
        const res = await pool.query(query);
        console.log(res.rows[0]);
        status = "success";
    } catch (e) {
        console.log(e);
        status = "failure";
    } finally {
        await closePool();
    }
    return status;
}

async function writeRecords() {
    redisClient.lrange(redisTableName, 0, -1, async function(err, data) {
        if (data instanceof Array){
            let results = [];
            let keys = {};
            for(let i = 0, l = data.length; i < l; ++i){
                let result = data[i].split('|SPLIT|');
                if(!keys.hasOwnProperty(result[0]) && eval(validationSchemas[validationSchema+'-db'])) {
                    results.push(result);
                    keys[result[0]] = true;
                }
            }
            let query = format(upsertclause, results);
            let queryResult = await executeQuery(query);
            if (queryResult === "success"){
                redisClient.del(redisTableName);
            } else {
                console.log("Record write failed");
            }
        }

    });
}

function preValidateCachedRecord(jsonb){
    try {
        let jsonb = JSON.parse(jsonb);
        if (typeof jsonb === "object") {
            return (validateRecord(jsonb) === 'string');
        }
    }
    catch (e) { console.log(e) }
    return false;
}

function validateRecord(data) {
    if (data instanceof Object && typeof data.question === "string"){
        try {
            if (validator.validate(data, validationSchemas[validationSchema]).errors.length <= 0){
                console.log("in validator statement");
                if (data['md5'] === checksum(data[validationSchema],'md5') && data['md5'].length === 32){
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

async function pushRecords(data) {
    if(data instanceof Array) {
        for (let i = 0; i < data.length; i++){
            cacheFunctions[validationSchema](data[i]);
        }
    } else if(data instanceof Object && !(data instanceof Array)){
        cacheFunctions[validationSchema](data);
    }

    redisClient.llen(redisTableName, function(err, length) {
        if (length > process.env.CACHERECORDLIMIT) {
            console.log("Begin Write");
            redisEmitter.emit('beginWrite');
        }
    })
}

function forceWrite(){
    redisEmitter.emit("beginWrite");
}

redisEmitter.on('beginWrite', writeRecords);

module.exports.pushRecords = pushRecords;
module.exports.validateRecord = validateRecord;
module.exports.writeRecords = writeRecords;
module.exports.forceWrite = forceWrite;