import json

import spacy
from dframcy import DframCy

import pandas as pd


def process(text):
    nlp = spacy.load("en_core_web_sm")
    doc = nlp(text)

    dframcy = DframCy(nlp)
    dfdoc = dframcy.nlp(text)
    df = dframcy.to_dataframe(dfdoc)
    df = add_explanations(df)
    prompts = load_prompts()

    nouns = getNounsFromDoc(doc)
    print(df)

    for noun in nouns:
        for template in prompts['nounGeneral']:
            print(writeToTemplate(template,noun))            
    
    

'''
Extract nouns from target doc
'''
def getNounsFromDoc(doc):
    nouns = []
    for token in doc:
        if token.pos_ in ["NOUN","PROPN"]:
            compounds = [child.text for child in token.children if child.dep_ in ["compound","det"]]
            
            if compounds:
                compounds.append(token.text)
                nouns.append(' '.join(compounds))
            elif token.dep_ in ["nsubj","pobj"]:
                nouns.append(token.text)
    
    return nouns

'''
Load text into templated sentence
'''
def writeToTemplate(template,value,key='{subject}'):
    return template.replace(key,value)

'''
Load prompts from prompts.json file
'''
def load_prompts():
    with open('prompts.json') as f:
        data = json.load(f)

    return data

'''
Adds explanation for the spacy tags
'''
def add_explanations(df):
    tag_expl = []
    dep_expl = []
    for idx,row in df.iterrows():
        tag_expl.append(spacy.explain(row.token_tag_))
        dep_expl.append(spacy.explain(row.token_dep_))
    
    df['tag_meaning'] = tag_expl
    df['dep_meaning'] = dep_expl

    return df