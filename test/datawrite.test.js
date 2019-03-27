require('dotenv').config();
process.env.REDISCACHETABLENAME = 'testcache';
process.env.UPSERTCLAUSE = 'upsertQuestionsDev';
process.env.TARGETTABLE = 'questionsdev';
process.env.CACHERECORDLIMIT = 100;
const redis = require("async-redis");
const {checksum} = require('../mathlib');
const assert = require('assert');
const assert_ext = require('chai');
const redisTableName = process.env.REDISCACHETABLENAME;
const dbwriter = require('../dbwriter');
const dbreader = require('../dbreader_test');
const testData1 = require("../testdata/question1.json");
const testData2 = require("../testdata/question2.json");
const testData3 = require("../testdata/question3.json");
//const testData3mod = require("../testdata/question3mod.json");
const badHashQuestion = require("../testdata/badquestion.json");
const testData1Cached = 'b56857169fbcab5074a80d131c817213|SPLIT|{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}|SPLIT|{}'
const testData2Cached = '8d8d87ee0ff8ca37cf549478dbfc8c1b|SPLIT|{"md5":"8d8d87ee0ff8ca37cf549478dbfc8c1b","question":"Test 2 What blafwew ? awefa23 afeawe 12332. afw32f ser sergegseg 2434g3, awefawe!!","quora_categories":["Test3","Test4","Test5"],"views":540,"answers":3,"question_url":"https://quora.com/what_is_life","ad_impressions":30,"earnings":0.01,"traffic_ext":0.07,"first_question_date":123,"type":"Type1","supercategory":"Test","supercategory2":"Test2","structure":"Declarative","sentences":1,"characters":50}|SPLIT|{}';
const testData3Cached = 'f5617715e7764a5231c9b7abcc34e5d7|SPLIT|{"md5":"f5617715e7764a5231c9b7abcc34e5d7","question":"Do you eat butt?","quora_categories":["Ass Eating","Butt Munching","Anal Feastings"],"views":940,"answers":2,"question_url":"https://quora.com/do_you_eat_ass","ad_impressions":4,"earnings":0.02,"traffic_ext":0.4,"first_question_date":121243,"type":"Type2","supercategory":"Test5","supercategory2":"Test9","structure":"Nominative","sentences":1,"characters":16}|SPLIT|{}';
const badTestCacheData1 = '2f3e46fd9vs3bn52wf549478dfq24e25|SPLIT|{"md5":"2f3e46fd9vs3bn52wf549478dfq24e25","question":"Do you eat butt?","quora_categories":["Ass Eating","Butt Munching","Anal Feastings"],"views":940,"answers":2,"question_url":"https://quora.com/do_you_eat_ass","ad_impressions":4,"earnings":0.02,"traffic_ext":0.4,"first_question_date":121243,"type":"Type2","supercategory":"Test5","supercategory2":"Test9","structure":"Nominative","sentences":1,"characters":16}|SPLIT|{}';
const badTestCacheData2 = '2f3e46fd9vs3b|SPLIT|{"md5":"2f3e46fd9vs3b","question":"Do you eat butt?","quora_categories":["Ass Eating","Butt Munching","Anal Feastings"],"views":940,"answers":2,"question_url":"https://quora.com/do_you_eat_ass","ad_impressions":4,"earnings":0.02,"traffic_ext":0.4,"first_question_date":121243,"type":"Type2","supercategory":"Test5","supercategory2":"Test9","structure":"Nominative","sentences":1,"characters":16}|SPLIT|{}';
const badTestCacheData3 = 'f5617715e7764a5231c9b7abcc34e5d7|SPLIT|{"md5":"f5617715e7764a5231c9b7abcc34e5d7,"question":"Do you eat butt?","quora_categories":["Ass Eating","Butt Munching","Anal Feastings"],"answers":2,"question_url":"https://quora.com/do_you_eat_ass","ad_impressions":4,"earnings":0.02,"traffic_ext":0.4,"first_question_date":121243,"type":"Type2","supercategory":"Test5","supercategory2":"Test9","structure":"Nominative","sentences":1,"characters":16}|SPLIT|{}';
const badTestCacheData4 = 'f5617715e7764a5231c9b7abcc34e5d7|SPLIT|{"md5":"f5617715e7764a5231c9b7abcc34e5d7,"question":"Do you eat butt?","quora_categories":["Ass Eating","Butt Munching","Anal Feastings"],"answers":2,"question_url":"https://quora.com/do_you_eat_ass","ad_impressions":4,"earnings":0.02,"traffic_ext":0.4,"first_question_date":121243,"type":"Type2","supercategory":"Test5","supercategory2":"Test9","structure":"Nominative","sentences":1,"characters":16}';
const badTestCacheData5 = 'f5617715e7764a5231c9b7abcc34e5d7|SPLIT|{"md5":"f5617715e7764a5231c9b7abcc34e5d7,"question":"Do you eat butt?","quora_categories":["Ass Eating","Butt Munching","Anal Feastings"],"answers":2,"question_url":"https://quora.com/do_you_eat_ass","ad_impressions":4,"earnings":0.02,"traffic_ext":0.4,"first_question_date":121243,"type":"Type2","supercategory":"Test5","supercategory2":"Test9","structure":"Nominative","sentences":1,"characters":16}|SPLIT|3';
const badTestCacheData6 = 'a,b,c';
const redisClient = redis.createClient();

describe('Only valid documents are added to redis', () => {
    beforeEach("Clear any existing redis cache info", async () => {
        await redisClient.del(process.env.REDISCACHETABLENAME);
    });

    it('Writes a single record redis cache correctly', async () => {
        await dbwriter.pushRecords(testData1);
        let cachedData = await redisClient.lrange(redisTableName, 0, -1);
        assert.equal(cachedData[0], testData1Cached);
        redisClient.del(process.env.REDISCACHETABLENAME);
    });
    it("Writes an array of records to redis cache and excludes records in that array which don't pass validation", async () => {
        await dbwriter.pushRecords([testData1, testData2, testData3, badHashQuestion]);
        let cachedData = await redisClient.lrange(redisTableName, 0, -1);
        assert.equal(cachedData.length, 3);
        assert.equal(cachedData[0], testData1Cached);
        assert.equal(cachedData[1], testData2Cached);
        assert.equal(cachedData[2], testData3Cached);
        redisClient.del(process.env.REDISCACHETABLENAME);
    });
    it("Doesn't allow any bad or malformed queries to be inserted into the database", async () => {
        await dbwriter.pushRecords([testData1, badHashQuestion]);
        let cachedData = await redisClient.lrange(redisTableName, 0, -1);
        assert.equal(cachedData[0], testData1Cached);
        assert.equal(cachedData.length, 1);
        redisClient.del(process.env.REDISCACHETABLENAME);
    });

});

describe('Postgres Write Operations', () => {
    beforeEach("Clear any existing redis cache info", async () => {
        await redisClient.del(process.env.REDISCACHETABLENAME);
    });
    it('Only allows valid queries to be inserted into postgres', async () => {
        await dbwriter.pushRecords([testData1, testData2]);
        await redisClient.rpush(process.env.REDISCACHETABLENAME, badTestCacheData1);
        await redisClient.rpush(process.env.REDISCACHETABLENAME, badTestCacheData2);
        await redisClient.rpush(process.env.REDISCACHETABLENAME, badTestCacheData3);
        await redisClient.rpush(process.env.REDISCACHETABLENAME, badTestCacheData4);
        await dbwriter.pushRecords(testData3);
        await dbwriter.writeRecords();
        let res = await dbreader.readAll();
        let rows = res.rows;
        assert.equal(rows.length, 3);
        assert.equal(rows[0].qhash, checksum(rows[0]['data']['question'], 'md5'));
        assert.equal(rows[1].qhash, checksum(rows[1]['data']['question'], 'md5'));
        assert.equal(rows[2].qhash, checksum(rows[2]['data']['question'], 'md5'));
        let cacheLength = await redisClient.llen(redisTableName);
        assert.equal(cacheLength,0);
    });

    it("Write cache operation doesn't allow 2 cached tasks intended for the same question to be written. Only writes the 1st", async () => {
        await dbwriter.pushRecords([testData1, testData1, testData2, testData2, testData3, testData3]);
        await dbwriter.writeRecords();
        let res = await dbreader.readAll();
        let rows = res.rows;
        assert.equal(rows.length, 3);
        assert.equal(rows[0].qhash, checksum(rows[0]['data']['question'], 'md5'));
        assert.equal(rows[1].qhash, checksum(rows[1]['data']['question'], 'md5'));
        assert.equal(rows[2].qhash, checksum(rows[2]['data']['question'], 'md5'));
        let cacheLength = await redisClient.llen(redisTableName);
        assert.equal(cacheLength,0);

    });

    it("Write cache operation check doesn't allow malformed cache data to be executed against postgres", async () => {
        await redisClient.rpush(process.env.REDISCACHETABLENAME, badTestCacheData5);
        await redisClient.rpush(process.env.REDISCACHETABLENAME, badTestCacheData6);
        await dbwriter.pushRecords([testData1, testData2, testData3]);
        await dbwriter.writeRecords();
        let res = await dbreader.readAll();
        let rows = res.rows;
        assert.equal(rows.length, 3);
        assert.equal(rows[0].qhash, checksum(rows[0]['data']['question'], 'md5'));
        assert.equal(rows[1].qhash, checksum(rows[1]['data']['question'], 'md5'));
        assert.equal(rows[2].qhash, checksum(rows[2]['data']['question'], 'md5'));
        let cacheLength = await redisClient.llen(redisTableName);
        assert.equal(cacheLength,0);
    });
});
