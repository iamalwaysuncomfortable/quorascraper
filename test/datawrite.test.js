require('dotenv').config();
process.env.REDISCACHETABLENAME = 'testcache';
process.env.UPSERTCLAUSE = 'upsertQuestionsDev';
process.env.CACHERECORDLIMIT = 5;
const assert = require('assert');
const assert_ext = require('chai');
const redisTableName = 'testcache';
const dbmanager = require('../dbmanager');
const testData1 = require("../testdata/question1.json");
const testData2 = require("../testdata/question2.json");
const testData3 = require("../testdata/question3.json");
const testData3mod = require("../testdata/question3mod.json");
const badHashQuestion = require("../testdata/badquestion.json");
const testData1Cached = 'b56857169fbcab5074a80d131c817213|SPLIT|{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}|SPLIT|{}'
const testData2Cached = '8d8d87ee0ff8ca37cf549478dbfc8c1b|SPLIT|{"md5":"8d8d87ee0ff8ca37cf549478dbfc8c1b","question":"Test 2 What blafwew ? awefa23 afeawe 12332. afw32f ser sergegseg 2434g3, awefawe!!","quora_categories":["Test3","Test4","Test5"],"views":540,"answers":3,"question_url":"https://quora.com/what_is_life","ad_impressions":30,"earnings":0.01,"traffic_ext":0.07,"first_question_date":123,"type":"Type1","supercategory":"Test","supercategory2":"Test2","structure":"Declarative","sentences":1,"characters":50}|SPLIT|{}';
const testData3Cached = 'f5617715e7764a5231c9b7abcc34e5d7|SPLIT|{"md5":"f5617715e7764a5231c9b7abcc34e5d7","question":"Do you eat butt?","quora_categories":["Ass Eating","Butt Munching","Anal Feastings"],"views":940,"answers":2,"question_url":"https://quora.com/do_you_eat_ass","ad_impressions":4,"earnings":0.02,"traffic_ext":0.4,"first_question_date":121243,"type":"Type2","supercategory":"Test5","supercategory2":"Test9","structure":"Nominative","sentences":1,"characters":16}|SPLIT|{}';
const asyncRedis = require("async-redis");
const redisClient = asyncRedis.createClient();

describe('Only valid documents are added to redis', () => {
    it('Writes a single record redis cache correctly', async () => {
        await dbmanager.pushRecords(testData1);
        let cachedData = await redisClient.lrange(redisTableName, 0, -1);
        assert.equal(cachedData[0], testData1Cached);
        redisClient.del('testcache');
    });
    it("Writes an array of records to redis cache and excludes records in that array which don't pass validation", async () => {
        await dbmanager.pushRecords([testData1, testData2, testData3, badHashQuestion]);
        let cachedData = await redisClient.lrange(redisTableName, 0, -1);
        assert.equal(cachedData.length, 3);
        assert.equal(cachedData[0], testData1Cached);
        assert.equal(cachedData[1], testData2Cached);
        assert.equal(cachedData[2], testData3Cached);
        redisClient.del(process.env.REDISCACHETABLENAME);
    });
    it("Doesn't allow any bad or malformed queries to be inserted into the database", async () => {
        await dbmanager.pushRecords([testData1, badHashQuestion]);
        let cachedData = await redisClient.lrange(redisTableName, 0, -1);
        assert.equal(cachedData[0], testData1Cached);
        assert.equal(cachedData.length, 1);
        redisClient.del(process.env.REDISCACHETABLENAME);
    });

});

describe('Postgres Write Operations', () => {
    it('Forces write attempt correctly', async () => {
        await dbmanager.pushRecords([testData1, testData2]);
        let cacheBeforeLength = await redisClient.llen(process.env.REDISCACHETABLENAME);
        dbmanager.forceWrite();
        let cacheAfterLength = await redisClient.llen(process.env.REDISCACHETABLENAME);
        assert.equal(cacheBeforeLength, 2);
        assert.equal(cacheAfterLength, 0);
    });
    it('Only allows valid queries to be inserted into postgres', async () => {

    });
    it("Write cache operation doesn't allow 2 cached tasks intended for the same question to be written. Only writes the 1st", async () => {

    });
    it("Write cache operation check doesn't allow malformed queries to be executed against postgres", async () => {

    });
    it("Writes all valid records", async () => {

    });
    it("Successfully attempts write after specified cache record limit is reached, writes all valid records and clears cache", async () => {

    });
    it("Leaves no remaining clients open", async () => {

    });

});