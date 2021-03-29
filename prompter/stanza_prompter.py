from stanza.server import CoreNLPClient, StartServer
from get_document_info import Character, CharacterReference, DocumentInfo
from get_questions import get_all_questions
from copy import deepcopy
import random

from sql_layer import SqlLayer

SUGGESTED_PROMPTS_FOR_USER = {}
SUGGESTED_PROMPT_TEXTS_FOR_USER = {}

def get_next_question_sql(user_id, all_questions):
    sql = SqlLayer('prompt_history.db')
    sql_user = sql.addUser(user_id)
    characters = [{ "character": question['character'], "start_idx": question['start_idx'], "end_idx": question['end_idx'] } for question in all_questions]

    #Load all the prompts into the prompts table and record their ids
    #This returns prompt ids that already exist if possible
    prompt_ids = []
    for prompt in all_questions:
        prompt_id,_ = sql.addPrompt(prompt['prompt_text'])
        prompt_ids.append(prompt_id)
    
    userPrompts = sql.getUserPrompts(user_id, prompt_ids)
    used_prompt_ids = [pid for (_,_,pid,_) in userPrompts]
    unused_prompt_ids = list(set(prompt_ids).difference(used_prompt_ids))
    
    # If there are unused prompt texts
    if len(unused_prompt_ids) > 0:
        random_prompt_id = random.choice(unused_prompt_ids)
        prompt_id, prompt_text = sql.getPromptById(random_prompt_id)
        original_prompt = [p for p in all_questions if p['prompt_text'] == prompt_text][0]

        sql.addUserPrompt(user_id,prompt_id,original_prompt['character'])
        return {
            "character":original_prompt['character'],
            "prompt_text":prompt_text,
            "start_idx": original_prompt['start_idx'],
            "end_idx": original_prompt['end_idx']
        }

    else:
        distinct_characters = list(set([character['character'] for character in characters]))
        random.shuffle(distinct_characters)

        for character in distinct_characters:
            charUserPrompts = sql.getUserPrompts(user_id, prompt_ids, character)
            used_char_prompt_ids = [pid for (_,_,pid,_) in charUserPrompts]
            unused_char_prompt_ids = list(set(prompt_ids).difference(used_char_prompt_ids))
            
            while len(unused_char_prompt_ids) > 0:
                random_char_prompt_id = random.choice(unused_char_prompt_ids)
                prompt = sql.getPromptById(random_char_prompt_id)
                prompt_id,prompt_text = prompt

                original_prompts = [p for p in all_questions if p['prompt_text'] == prompt_text and p['character'] == character]
                
                if len(original_prompts) > 0:
                    original_prompt = original_prompts[0]
                    sql.addUserPrompt(user_id,prompt_id,original_prompt['character'])
                    return {
                        "character":original_prompt['character'],
                        "prompt_text":prompt_text,
                        "start_idx": original_prompt['start_idx'],
                        "end_idx": original_prompt['end_idx']
                    }
                else:
                    unused_char_prompt_ids.remove(random_char_prompt_id)
            
            print(f"Out of prompts for {character}")
            

                
                

    
    return {}

def storable_question(question):
    return f"{question['character']} - {question['prompt_text']}"

def get_next_question(user_id, all_questions):

    if user_id not in SUGGESTED_PROMPTS_FOR_USER:
        SUGGESTED_PROMPTS_FOR_USER[user_id] = []
        SUGGESTED_PROMPT_TEXTS_FOR_USER[user_id] = []

    suggested_prompts = SUGGESTED_PROMPTS_FOR_USER[user_id]
    suggested_prompt_texts = SUGGESTED_PROMPT_TEXTS_FOR_USER[user_id]

    remaining_prompts_with_unique_text = [q for q in all_questions if q['prompt_text'] not in suggested_prompt_texts]
    if len(remaining_prompts_with_unique_text) > 0:
        question = random.choice(remaining_prompts_with_unique_text)
        SUGGESTED_PROMPTS_FOR_USER[user_id].append(storable_question(question))
        SUGGESTED_PROMPT_TEXTS_FOR_USER[user_id].append(question['prompt_text'])
        return question

    remaining_unique_prompts = [q for q in all_questions if storable_question(q) not in suggested_prompts]
    if len(remaining_unique_prompts) > 0:
        question = random.choice(remaining_unique_prompts)
        SUGGESTED_PROMPTS_FOR_USER[user_id].append(storable_question(question))
        return question

    return {}  # TODO: change this?

# NOTES:
#   - all dialogue must be in double quotes
def get_prompts(text, prompt_type, user_id='', show_all=True, server='localhost'):
    with CoreNLPClient(endpoint=f'http://{server}:9000',
                       start_server=StartServer.DONT_START,
                       annotators=['coref', 'openie']) as client:
        document = client.annotate(text)
        document_info = DocumentInfo(document, text)
        all_questions = get_all_questions(document_info, prompt_type)

        return all_questions if show_all else get_next_question_sql(user_id, all_questions)
