INSERT INTO devdata.lastupdated (_id, _at) VALUES(%s, %s) ON CONFLICT (_id) DO UPDATE SET (_at) = (EXCLUDED._at)

-- GET All data for a JSON value
select * from questions WHERE data->>'views' >= '230';

-- SINGLE INSERT STATEMENT PRODUCTION USING NODE-POSTGRES
INSERT INTO questions(qhash, data, categories) VALUES($1, $2, $3) ON CONFLICT DO
UPDATE questions SET data = data || $2, categories = (SELECT ARRAY(SELECT DISTINCT UNNEST(categories || $3) FROM questions WHERE qhash = $1)) WHERE qhash = $1;
RETURNING *

-- MULTIPLE INSERT STATEMENT PRODUCTION USING NODE-POSTGRES and PG-FORMAT
INSERT INTO questions(qhash, data, categories) VALUES %L ON CONFLICT (qhash) DO UPDATE SET data = questions.data || EXCLUDED.data, categories = (SELECT ARRAY(SELECT DISTINCT UNNEST(questions.categories || EXCLUDED.categories) FROM questions WHERE questions.qhash = EXCLUDED.qhash)) WHERE questions.qhash = EXCLUDED.qhash RETURNING *

INSERT INTO questions(qhash, data, categories) VALUES(SELECT DISTINCT ON(qhash) * FROM VALUES %L) ON CONFLICT (qhash) DO UPDATE SET data = questions.data || EXCLUDED.data, categories = (SELECT ARRAY(SELECT DISTINCT UNNEST(questions.categories || EXCLUDED.categories) FROM questions WHERE questions.qhash = EXCLUDED.qhash)) WHERE questions.qhash = EXCLUDED.qhash RETURNING *


-- GET ONE COLUMN FROM JSONB
select data->>'Question' as Question,data->>'Answers' as answers from questions WHERE data->>'Views' >= '230';

-- REPLACE VALUES
UPDATE questions SET data = data || '{"Views":"550", "Answers":9}' WHERE qhash = 'a335d7c58f1141cd3f93fc4bcf39785b';

-- REPLACE ONE QUESTION JSON FIELD WHOLESALE
UPDATE questions SET data = '{"md5":"a335d7c58f1141cd3f93fc4bcf39785b", "question":"Test 2 awefawe!!","quora_categories":["Test3", "Test4", "Test5"],"views":540,"answers":3,"question_url":"https://quora.com/what_is_life","ad_impressions":30,"earnings":0.01,"traffic_ext":0.07,"first_question_date":123,"type":"Type1","supercategory":"Test","supercategory2":"Test2","structure":"Declarative","sentences":1,"characters":50}'

-- REPLACE JSON FIELD AND ARRAY
UPDATE questions SET data = data || '{"views":"550", "answers":9}', categories = (SELECT ARRAY(SELECT DISTINCT UNNEST(categories || '{8, 9, 10}') FROM questions WHERE qhash = 'a335d7c58f1141cd3f93fc4bcf39785b')) WHERE qhash = 'a335d7c58f1141cd3f93fc4bcf39785b';

WHERE qhash = 'a335d7c58f1141cd3f93fc4bcf39785b';

'{"md5":"8d8d87ee0ff8ca37cf549478dbfc8c1b", "question":"Test 2 What blafwew ? awefa23 afeawe 12332. afw32f ser sergegseg 2434g3, awefawe!!","quora_categories":["Test3", "Test4", "Test5"],"views":540,"answers":3,"question_url":"https://quora.com/what_is_life","ad_impressions":30,"earnings":0.01,"traffic_ext":0.07,"first_question_date":123,"type":"Type1","supercategory":"Test","supercategory2":"Test2","structure":"Declarative","sentences":1,"characters":50}'

-- UPDATE ARRAY
UPDATE questions SET data = jsonb_set(data, array['quora_categories'], data->'quora_categories' || '["newString"]') WHERE qhash = 'a335d7c58f1141cd3f93fc4bcf39785b';

UPDATE questions SET data = jsonb_set(data, array['quora_categories'], data->'quora_categories' - 'newString') WHERE qhash = 'a335d7c58f1141cd3f93fc4bcf39785b';

SELECT DISTINCT jsonb_array_elements_text(data->'quora_categories') FROM questions WHERE qhash = 'a335d7c58f1141cd3f93fc4bcf39785b';

-- Half finished statements
UPDATE questions SET data = (SELECT array_to_json(array(SELECT DISTINCT jsonb_array_elements(data->'quora_categories')))
FROM questions WHERE qhash = 'a335d7c58f1141cd3f93fc4bcf39785b')
WHERE qhash = 'a335d7c58f1141cd3f93fc4bcf39785b';

SELECT array_to_json(SELECT DISTINCT jsonb_array_elements(data->'quora_categories') FROM questions WHERE qhash = 'a335d7c58f1141cd3f93fc4bcf39785b');

UPDATE questions SET data = data || 'quora_categories' SELECT DISTINCT jsonb_array_elements(data->'quora_categories') FROM questions WHERE qhash = 'a335d7c58f1141cd3f93fc4bcf39785b';

UPDATE questions SET data = data || '{"Views":"550", "Answers":9', categories = categories qhash = 'a335d7c58f1141cd3f93fc4bcf39785b';
UPDATE questions SET categories = categories || '{7}' WHERE qhash = 'a335d7c58f1141cd3f93fc4bcf39785b';

UPDATE questions SET categories = SELECT ARRAY(SELECT DISTINCT UNNEST(categories || '{7}'), data = data || '{"Views":"550", "Answers":9}' FROM questions WHERE qhash = 'a335d7c58f1141cd3f93fc4bcf39785b');

create table questions_time(qhash char(32), data jsonb, record_date DATE NOT NULL DEFAULT CURRENT_DATE, primary key (qhash, record_date));


INSERT INTO questions(qhash, data, categories) VALUES (SELECT DISTINCT ON (1) FROM * ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}'), ('8d8d87ee0ff8ca37cf549478dbfc8c1b','{"md5":"8d8d87ee0ff8ca37cf549478dbfc8c1b","question":"Test 2 What blafwew ? awefa23 afeawe 12332. afw32f ser sergegseg 2434g3, awefawe!!","quora_categories":["Test3","Test4","Test5"],"views":540,"answers":3,"question_url":"https://quora.com/what_is_life","ad_impressions":30,"earnings":0.01,"traffic_ext":0.07,"first_question_date":123,"type":"Type1","supercategory":"Test","supercategory2":"Test2","structure":"Declarative","sentences":1,"characters":50}','{}'), ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}'), ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}'), ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}'), ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}'), ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}'), ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}'), ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}')) ON CONFLICT (qhash) DO UPDATE SET data = questions.data || EXCLUDED.data, categories = (SELECT ARRAY(SELECT DISTINCT UNNEST(questions.categories || EXCLUDED.categories) FROM questions WHERE questions.qhash = EXCLUDED.qhash)) WHERE questions.qhash = EXCLUDED.qhash RETURNING *;
SELECT DISTINCT ON (1) * FROM ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}'), ('8d8d87ee0ff8ca37cf549478dbfc8c1b','{"md5":"8d8d87ee0ff8ca37cf549478dbfc8c1b","question":"Test 2 What blafwew ? awefa23 afeawe 12332. afw32f ser sergegseg 2434g3, awefawe!!","quora_categories":["Test3","Test4","Test5"],"views":540,"answers":3,"question_url":"https://quora.com/what_is_life","ad_impressions":30,"earnings":0.01,"traffic_ext":0.07,"first_question_date":123,"type":"Type1","supercategory":"Test","supercategory2":"Test2","structure":"Declarative","sentences":1,"characters":50}','{}'), ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}'), ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}'), ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}'), ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}'), ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}'), ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}'), ('b56857169fbcab5074a80d131c817213','{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{}');

insert into mclovin(qhash, data, categories) VALUES('b56857169fbcab5074a80d131c817213', '{"md5": "b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1", "Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}','{ass, butt}')

INSERT INTO questionsdev(qhash, data, categories) VALUES ('b56857169fbcab5074a80d131c817213', '{"md5":"b56857169fbcab5074a80d131c817213","question":"Testy McTest Test?","quora_categories":["Test1","Test2"],"views":230,"answers":3,"question_url":"https://quora.com/what_is_life"}', '{}'), ('8d8d87ee0ff8ca37cf549478dbfc8c1b', '{"md5":"8d8d87ee0ff8ca37cf549478dbfc8c1b","question":"Test 2 What blafwew ? awefa23 afeawe 12332. afw32f ser sergegseg 2434g3, awefawe!!","quora_categories":["Test3","Test4","Test5"],"views":540,"answers":3,"question_url":"https://quora.com/what_is_life","ad_impressions":30,"earnings":0.01,"traffic_ext":0.07,"first_question_date":123,"type":"Type1","supercategory":"Test","supercategory2":"Test2","structure":"Declarative","sentences":1,"characters":50}', '{}') ON CONFLICT (qhash) DO UPDATE SET data = questionsdev.data || EXCLUDED.data, categories = (SELECT ARRAY(SELECT DISTINCT UNNEST(questionsdev.categories || EXCLUDED.categories) FROM questionsdev WHERE questionsdev.qhash = EXCLUDED.qhash)) WHERE questionsdev.qhash = EXCLUDED.qhash RETURNING *;

SELECT *
FROM  (
    SELECT DISTINCT 1 + trunc(random() * 4)::integer AS qhash
    FROM   generate_series(1, 1100) g
    ) r
JOIN  questionsasked USING (qhash)
LIMIT  10;

SELECT DISTINCT 1 + trunc(random() * 500)::integer AS qhash
FROM   generate_series(1, 100) g;
