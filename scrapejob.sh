33 11 * * * export DISPLAY=:0 && cd /home/salty/Development/QuoraScraper; /home/linuxbrew/.linuxbrew/bin/node jobExecutor.js --post --numQuestions 2 --includeCategories 'language'
/home/linuxbrew/.linuxbrew/bin/node jobExecutor.js --post --numQuestions 50 --includeCategories 'tiktok'
15 16 * * * export DISPLAY=:0 && cd /home/salty/Development/QuoraScraper; /home/linuxbrew/.linuxbrew/bin/node jobExecutor.js --scrape --myQuestions
node jobExecutor.js --post --numQuestions 2 --includeCategories 'language'
