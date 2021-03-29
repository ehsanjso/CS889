from stanza.server import CoreNLPClient, StartServer
from get_document_info import Character, CharacterReference, DocumentInfo
from get_questions import get_all_questions
from copy import deepcopy
import random

SUGGESTED_PROMPTS_FOR_USER = {}
SUGGESTED_PROMPT_TEXTS_FOR_USER = {}


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

        return all_questions if show_all else get_next_question(user_id, all_questions)
