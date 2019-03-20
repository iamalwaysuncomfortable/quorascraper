require('dotenv').config();
process.env.REDISCACHETABLENAME = 'testcache';
process.env.UPSERTCLAUSE = 'upsertQuestionsDev';
process.env.TARGETTABLE = 'questionsdev';
process.env
const pg = require('pg');
const pool = pg.Pool();
let targetTable = process.env.TARGETTABLE;

///HACK: Redo database testing and reading soon to be production level
async function readAll(){
    const query = "select * from " + targetTable;
    let status = "failure";
    let client = await pool.connect();
    try {
        status = await client.query(query);
    } catch (e) {
        console.log(e);
        status = "failure";
    } finally {
        await client.release();
        return status;
    }
}


module.exports.readAll = readAll;
