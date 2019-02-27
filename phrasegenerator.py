from pathlib import Path
data_folder = Path('workingData')

def read_txt(filename):
    file_to_open = data_folder / filename
    return open(file_to_open).read().splitlines()

def write_array_to_txt(file_name, data):
    file_to_open = data_folder / file_name
    with open(file_to_open, "w") as output:
        for item in data:
            output.write("%s\n" % item)

def how_do_you_say(phrase_file, language_file, to_dir='results.txt', write_out=True):
    questions = []
    phrases = read_txt(phrase_file)
    languages = read_txt(language_file)
    for phrase in phrases:
        for language in languages:
            questions.append('How do you say "'+phrase+'" in '+language)
    if write_out == False:
        return questions
    else:
        write_array_to_txt(to_dir, questions)

how_do_you_say('english_phrase_corpus.txt','languages.txt')
