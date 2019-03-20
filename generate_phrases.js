let filename = '/home/salty/Development/QuoraScraper/workingData/combinedresults.txt';
let dbwriter = require('./dbwriter');
let fs = require('fs');
let {shuffleArray, getRandomInt} = require('./mathlib');
let zodiacList = ["Aquarius", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn"];

function singleNounPhraseGenerator(nouns, phraseList, replaceCharacter) {
    const consonants = ['a', 'A','e','E','i','I','o','O','u','U'];
    let phrases = [];
    for (let i = 0; i < nouns.length; i++){
        let index = getRandomInt(0,phraseList.length - 1);
        let splitChar = phraseList[index].split(replaceCharacter)[0].substr(-3);
        let phrase = ((consonants.includes(nouns[i][0])) && (splitChar === " a ")) ?
            phraseList[index].replace(" _","n " + nouns[i]) : phraseList[index].replace(replaceCharacter,nouns[i]);
        phrases.push(phrase);
    }
    return phrases
}


let q = singleNounPhraseGenerator(zodiacList, qq, '_');

function zodiacLove(zodiacList){
    let phrases = [];
    for (let i = 0; i < zodiacList.length; i++){
        let an = " ";
        if (i === 1 || i === 0){
            an = "n "
        }

        let phrase1 = (getRandomInt(0,2) === 1) ? "What are a" + an + zodiacList[i] + "'s love languages" : getRandomInt(0,1) === 1 ? "What are the love languages of a" + an  + zodiacList[i] :"What love languages do" + an + zodiacList[i] + "'s have";
        phrases.push(phrase1);
        let phrase2 = (getRandomInt(0, 2) === 1) ? "What does a" + an + zodiacList[i] + " man do when they like you" : getRandomInt(0,1) === 1 ? "How can you tell when a" + an + zodiacList[i] + " man likes you": "How does a" + an + zodiacList[i] + " man show they like you";
        phrases.push(phrase2);
        let phrase3 = (getRandomInt(0, 2) === 1) ? "Will a" + an + zodiacList[i] + " man stay faithful to you in a relationship" : getRandomInt(0,1) === 1 ? "Is a" + an + zodiacList[i] + " man likely to cheat on you": "How likely is it that a" + an + zodiacList[i] + " man will cheat on you";
        phrases.push(phrase3);
        let phrase4 = (getRandomInt(0, 2) === 1) ? "How can you get a" + an + zodiacList[i] + " man to express his feelings to you" : getRandomInt(0,1) === 1 ? "How can you get a" + an + zodiacList[i] + " man to open up to you" : "How can I get my" + zodiacList[i] + " boyfriend to open up to me";
        phrases.push(phrase4);
        let phrase5 = (getRandomInt(0, 2) === 1) ? "How does a" + an + zodiacList[i] + " man flirt" : getRandomInt(0,1) === 1 ? "How can you tell if a" + an + zodiacList[i] + " is flirting with you" : "How do I know when a" + an + zodiacList[i] + " man is flirting with me";
        phrases.push(phrase5);
        let phrase6 = (getRandomInt(0, 2) === 1) ? "What kind of things does a" + an + zodiacList[i] + " find appealing in a partner" : getRandomInt(0,1) === 1 ? "How can I attract a" + an + zodiacList[i] + " man" : "What do" + zodiacList[i] + " men want in a parnter";
        phrases.push(phrase6);
        let phrase7 = (getRandomInt(0, 2) === 1) ? "What are the ways in which a" + an + zodiacList[i] + " man shows affection" : getRandomInt(0,1) === 1 ? "What are the ways in which a" + an + zodiacList[i] + " man expresses intimacy" : "How affectionate are " + zodiacList[i] + " men" ;
        phrases.push(phrase7);
        let phrase8 = (getRandomInt(0, 2) === 1) ? "Do " + zodiacList[i] + " men make loving and loyal partners" : getRandomInt(0,1) === 1 ? "Are " + zodiacList[i] + " men dedicated in a relationship" : "Are " + zodiacList[i] + " men deeply commmitted to their partners";
        phrases.push(phrase8);
        let phrase9 = (getRandomInt(0, 2) === 1) ? "What signs are likely to have problems with " + zodiacList[i] + " men" : getRandomInt(0,1) === 1 ? "How do I know if my sign will have trouble with a" + an + zodiacList[i] + " man" : "What signs will have the most turbulent relationship with a" + an + zodiacList[i] + " man";
        phrases.push(phrase9);
    }
    phrases = shuffleArray(phrases);
    return phrases;
}

dbwriter.stageNewQuestions(zodiacLove(zodiacList));

function prepArrayForFileOutput(questionArray){
    let questions = shuffleArray(questionArray);
    let output = JSON.stringify(questions, "",'*');
    output = output.replace(/\"/g, "");
    output = output.replace(/\,/g, "");
    output = output.replace(/\*/g, "");
    output = output.replace(/\[/g, "");
    output = output.replace(/\]/g, "");
    return output

}

function writeQuestionArrayToFile(questionArray){
    fs.writeFile(filename, prepArrayForFileOutput(questionArray), function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log('File written!');
        }
    });

}
