select data->>'Question' as Question,data->>'Answers' as answers from questions WHERE data->>'Views' >= '230';
