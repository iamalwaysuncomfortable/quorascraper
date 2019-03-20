const pg = require('pg');
const pool = pg.Pool();

///HACK: Redo database testing and reading soon to be production level

function validateInput(input){
    let validated = false;
    while (validated === false){
        validated = /^([A-z0-9])$/.test(input.substr(-1));
        if (validated === true){
            return input;
        }
        else{
            input = input.substr(0,input.length-1);
        }
    }
}

async function readRandomResults(amount, inclusiveCategories, exclusiveCategories) {
    let query = "select question from questionsasked where asked='f' ";
    if (Array.isArray(inclusiveCategories)) {
        for (let i = 0; i < inclusiveCategories.length; i++){
            if (typeof inclusiveCategories[i] === "string") {
                query = query + " AND '" + inclusiveCategories[i] + "' = ANY(categories) "
            }
        }

    } else if (typeof inclusiveCategories === "string") {
        query = query + " AND '" + inclusiveCategories + "' = ANY(categories) "
    }

    if (Array.isArray(exclusiveCategories)) {
        for (let i = 0; i < exclusiveCategories.length; i++){
            if (typeof exclusiveCategories[i] === "string") {
                query = query + " AND '" + exclusiveCategories[i] + "' != ALL(categories) "
            }
        }

    } else if (typeof exclusiveCategories === "string") {
        query = query + " AND '" + exclusiveCategories + "' != ALL(categories) "
    }

    query = query + "order by random()";

    query = query + " limit " + amount.toString();
    console.log(query);

    let result = "failure";
    let client = await pool.connect();
    try {
        result = [];
        let results = await client.query(query);
        for (let i = 0; i < results.rows.length; i++){
            result.push(validateInput(results.rows[i].question));
        }
    } catch (e) {
        console.log(e);
        status = "failure";
    } finally {
        await client.release();
        return result;
    }
}


module.exports.readRandomResults = readRandomResults;
