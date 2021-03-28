from stanza.server import CoreNLPClient, StartServer
from get_document_info import Character, CharacterReference, DocumentInfo
from get_questions import get_all_questions
from copy import deepcopy
import random

from sql_layer import SqlLayer

SUGGESTED_PROMPTS_FOR_USER = {}
SUGGESTED_PROMPT_TEXTS_FOR_USER = {}


def storable_question(question):
    return f"{question['character']} - {question['prompt_text']}"


def get_next_question_sql(user_id, all_questions):    
    sql = SqlLayer('prompt_history.db')
    sql_user = sql.addUser(user_id)

    #Load all the prompts into the prompts table and record their ids
    #This returns prompt ids that already exist if possible
    prompt_ids = []
    for prompt in all_questions:
        prompt_id,_,_ = sql.addPrompt(prompt['character'], prompt['prompt_text'])
        prompt_ids.append(prompt_id)

    userPrompts = sql.getUserPrompts(user_id, prompt_ids)
    used_prompt_ids = [pid for (_,_,pid) in userPrompts]

    #Get a list of all prompt_ids in the prompts table that aren't paired
    #with this user in the user_prompt table (probably could have done a join here)
    unused_prompt_ids = list(set(prompt_ids).difference(used_prompt_ids))    
    if len(unused_prompt_ids) <= 0:
        print('Out of prompts')
        return {}

    random_prompt_id = random.choice(unused_prompt_ids)
    prompt = sql.getPromptById(random_prompt_id)
    if prompt == None:
        return {}
    else:
        prompt_id,character,prompt_text = prompt

        # Add a record to the DB to show we've exhausted this prompt
        sql.addUserPrompt(user_id,prompt_id)
        return {
            "character":character,
            "prompt_text":prompt_text
        }

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
        document_info = DocumentInfo(document)
        all_questions = get_all_questions(document_info, prompt_type)

        return all_questions if show_all else get_next_question_sql(user_id, all_questions)
