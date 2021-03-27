from get_document_info import Character, CharacterReference, DocumentInfo


def get_question_info(prompt_text: str, ref: CharacterReference) -> dict:
    return {'character': ref.full_str,
            'prompt_text': prompt_text,
            'start_idx': ref.full_start_idx,
            'end_idx': ref.full_end_idx}


def get_char_phys_descr_question(char: Character, is_story: bool) -> dict:
    first_ref = char.references[0]
    if is_story:
        if char.is_singular:
            question = "What do you know about this character's physical appearance?"
        else:
            question = "What do you know about this character's physical appearance?"
    else:
        if char.is_singular:
            question = "Is there anything you want to tell the reader about this character's appearance?"
        else:
            question = "Is there anything you want to tell the reader about these characters' appearances?"
    return get_question_info(question, first_ref)


def get_char_emotion_question(ref: CharacterReference, char: Character, is_story: bool) -> dict:
    if is_story:
        if char.is_singular:
            question = f'Why is this character feeling {ref.emotion}?'
        else:
            question = f'Why are these characters feeling {ref.emotion}?'
    else:
        if char.is_singular:
            question = f'How could you show the reader why this character is feeling {ref.emotion}?'
        else:
            question = f'How could you show the reader why these characters are feeling {ref.emotion}?'
    return get_question_info(question, ref)


def get_all_questions(document_info: DocumentInfo, is_story: bool) -> list:
    characters = document_info.chars
    char_refs = document_info.char_ref_for_loc

    questions = []
    for id, char in characters.items():
        if char.is_singular:
            question = get_char_phys_descr_question(char, is_story)
            questions.append(question)

    for sent_num, refs in char_refs.items():
        for tok_num, ref in refs.items():
            if ref.emotion:
                char = characters[ref.char_id]
                question = get_char_emotion_question(ref, char, is_story)
                questions.append(question)

    return questions