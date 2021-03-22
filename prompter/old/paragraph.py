from rake_nltk import Rake

def extract_keywords(text):
    rake = Rake()
    rake.extract_keywords_from_text(text)
    keywords = rake.get_ranked_phrases()
    return keywords


