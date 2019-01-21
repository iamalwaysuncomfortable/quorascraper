const years = ['2017', '2018', '2019'];
const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'tues', 'weds', 'thurs', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']


function getScrapedQuoraDateInUTC(date, referenceDate, jsonformat=true) {
    if (!(typeof date === 'string')) {throw("Date must be in string")};
    let utcdate;
    if (years.includes(date.substr(date.length - 4))) {
        utcdate = new Date(date);
    } else if (weekDays.includes(date.toLowerCase())) {
        let finalDate =  (typeof referenceDate === 'undefined') ? new Date() : new Date(referenceDate);
        let fromDay = finalDate.getDay();
        finalDate.setDate(finalDate.getDate() - Math.abs(getDayDelta(date.toLowerCase(), fromDay) - fromDay));
        utcdate = finalDate;
    } else if (date.length > 4 && date.length <= 7) {
        let now = new Date();
        utcdate = new Date(date + ' 2019');
        if (utcdate > now){
            utcdate = new Date(date + ' 2018');
        }
    } else {
        throw ("Date format invalid for quora date formatter");
    }
    if (jsonformat === true) {
        return utcdate.toJSON();
    }
    else{
        return utcdate;
    }
}


function getScrapedQuoraDateInUTS(date, referenceDate) {
    return parseInt(getScrapedQuoraDateInUTC(date, referenceDate, false).valueOf()/1000)
}

function getDayDelta(day, referenceDay){
    if (referenceDay === 1) {
        let dayHashMap = {
            'sun': 1,
            'sunday': 1,
            'mon': 0,
            'monday': 0,
            'tues': 6,
            'tue': 6,
            'tuesday': 6,
            'weds': 5,
            'wed': 5,
            'wednesday': 5,
            'thursday': 4,
            'thurs': 4,
            'thu': 4,
            'fri': 3,
            'friday': 3,
            'saturday': 2,
            'sat': 2
        };
        return dayHashMap[day];
    } else if (referenceDay === 2){
        let dayHashMap = {
            'sun': 2,
            'sunday': 2,
            'mon': 1,
            'monday': 1,
            'tues': 0,
            'tue': 0,
            'tuesday': 0,
            'weds': 6,
            'wed': 6,
            'wednesday': 6,
            'thursday': 5,
            'thurs': 5,
            'thu': 5,
            'fri': 4,
            'friday': 4,
            'saturday': 3,
            'sat': 3
        };
        return dayHashMap[day];
    } else if (referenceDay === 3){

        let dayHashMap = {
            'sun': 3,
            'sunday': 3,
            'mon': 2,
            'monday': 2,
            'tues': 1,
            'tue': 1,
            'tuesday': 1,
            'weds': 0,
            'wed': 0,
            'wednesday': 0,
            'thursday': 6,
            'thurs': 6,
            'thu': 6,
            'fri': 5,
            'friday': 5,
            'saturday': 4,
            'sat': 4
        };
        return dayHashMap[day];
    } else if (referenceDay === 4){

        let dayHashMap = {
            'sun': 4,
            'sunday': 4,
            'mon': 3,
            'monday': 3,
            'tues': 2,
            'tue': 2,
            'tuesday': 2,
            'weds': 1,
            'wed': 1,
            'wednesday': 1,
            'thursday': 0,
            'thurs': 0,
            'thu': 0,
            'fri': 6,
            'friday': 6,
            'saturday': 5,
            'sat': 5
        };
        return dayHashMap[day];
    } else if (referenceDay === 5){

        let dayHashMap = {
            'sun': 5,
            'sunday': 5,
            'mon': 4,
            'monday': 4,
            'tues': 3,
            'tue': 3,
            'tuesday': 3,
            'weds': 2,
            'wed': 2,
            'wednesday': 2,
            'thursday': 1,
            'thurs': 1,
            'thu': 1,
            'fri': 0,
            'friday': 0,
            'saturday': 6,
            'sat': 6
        };
        return dayHashMap[day];

    } else if (referenceDay === 6){

        let dayHashMap = {
            'sun': 6,
            'sunday': 6,
            'mon': 5,
            'monday': 5,
            'tues': 4,
            'tue': 4,
            'tuesday': 4,
            'weds': 3,
            'wed': 3,
            'wednesday': 3,
            'thursday': 2,
            'thurs': 2,
            'thu': 2,
            'fri': 1,
            'friday': 1,
            'saturday': 0,
            'sat': 0
        };
        return dayHashMap[day];
    } else if (referenceDay === 0){
        let dayHashMap = {
            'sun': 0,
            'sunday': 0,
            'mon': 1,
            'monday': 1,
            'tues': 2,
            'tue': 2,
            'tuesday': 2,
            'weds': 3,
            'wed': 3,
            'wednesday': 3,
            'thursday': 4,
            'thurs': 4,
            'thu': 4,
            'fri': 5,
            'friday': 5,
            'saturday': 6,
            'sat': 6
        };
        return dayHashMap[day];
    }
}


module.exports.getScrapedQuoraDateInUTC = getScrapedQuoraDateInUTC;
module.exports.getScrapedQuoraDateInUTS = getScrapedQuoraDateInUTS;
module.exports.getDayDelta = getDayDelta;