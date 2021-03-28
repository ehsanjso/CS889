from get_document_info import Character, CharacterReference, DocumentInfo
from general_question_templates import GENERAL_QUESTIONS
from emotion_question_templates import EMOTION_QUESTIONS, TMP_EMOTION
import random


def get_question_info(prompt_text: str, ref: CharacterReference) -> dict:
    return {'character': ref.full_str,
            'prompt_text': prompt_text,
            'start_idx': ref.full_start_idx,
            'end_idx': ref.full_end_idx}


def get_general_character_questions(characters: dict, prompt_type: str) -> list[dict]:
    general_questions = []
    for id, char in characters.items():
        first_ref = char.references[0]
        for questions in GENERAL_QUESTIONS:
            question_text = questions[prompt_type][char.num]
            if question_text != "N/A":
                question_info = get_question_info(question_text, first_ref)
                general_questions.append(question_info)
    return general_questions


def get_emotion_character_questions(characters: dict, character_refs: dict, prompt_type: str) -> list[dict]:
    emotion_questions = []
    for sent_num, refs in character_refs.items():
        for tok_num, ref in refs.items():
            if ref.emotion:
                char = characters[ref.char_id]
                for questions in EMOTION_QUESTIONS:
                    question_text = questions[prompt_type][char.num]
                    if question_text != "N/A":
                        question_text = question_text.replace(TMP_EMOTION, ref.emotion)
                        question_info = get_question_info(question_text, ref)
                        emotion_questions.append(question_info)
    return emotion_questions


def get_all_questions(document_info: DocumentInfo, prompt_type: str) -> list[dict]:
    characters = document_info.chars
    char_refs = document_info.char_ref_for_loc

    general_questions = get_general_character_questions(characters, prompt_type)
    emotion_questions = get_emotion_character_questions(characters, char_refs, prompt_type)

    return general_questions + emotion_questions


def get_next_question(document_info: DocumentInfo, prompt_type: str) -> dict:
    all_questions = get_all_questions(document_info, prompt_type)
    return random.choice(all_questions)
