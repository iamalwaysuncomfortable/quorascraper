let data = require("./workingData/dev-v2.0.json");
let {shuffleArray} = require('./mathlib');
let fs = require('fs');
let filename = '/home/salty/Development/QuoraScraper/workingData/corpusresults.txt';
let questions = [];
let output;

for (let i = 1; i < data['data'].length; i++) {
    if (i === 1 || i === 2 || i === 6 || i === 7 || i === 10) {
        for (let j = 0; j < data['data'][i]['paragraphs'].length; j++) {
            for (let k = 0; k < data['data'][i]['paragraphs'][j]['qas'].length; k++) {
                let str = data['data'][i]['paragraphs'][j]['qas'][k]['question'];
                questions.push(str.substring(0, str.length - 1));
            }
        }
    }
}




function prepArray(questionArray){
    let questions = shuffleArray(questionArray);
    output = JSON.stringify(questions, "",'*');
    output = output.replace(/\"/g, "");
    output = output.replace(/\,/g, "");
    output = output.replace(/\*/g, "");
    return questions

}

function writeFile(filename, output)
{
    fs.writeFile(filename, output, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log('File written!');
        }
    });
}
