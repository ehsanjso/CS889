from dataclasses import dataclass
from enum import Enum
from typing import List, Dict

from stanza.server import CoreNLPClient, StartServer

emotion_list = ['angry', 'irritated', 'enraged', 'annoyed', 'upset', 'resentful', 'incensed', 'infuriated', 'fuming',
                'indignant', 'disgusted', 'depressed', 'disappointed', 'discouraged', 'ashamed', 'powerless', 'guilty',
                'dissatisfied', 'miserable', 'confused', 'uncertain', 'perplexed', 'embarrassed', 'shy', 'skeptical',
                'distrustful', 'uneasy', 'pessimistic', 'tense', 'distressed', 'indifferent', 'weary', 'bored',
                'afraid', 'fearful', 'terrified', 'anxious', 'alarmed', 'panicked', 'nervous', 'scared', 'worried',
                'frightened', 'restless', 'hurt', 'tormented', 'pained', 'dejected', 'offended', 'heartbroken',
                'agonized', 'appalled', 'humiliated', 'sad', 'tearful', 'sorrowful', 'pained', 'unhappy', 'lonely',
                'mournful', 'dismayed', 'lonely', 'amazed', 'happy', 'joyous', 'delighted', 'overjoyed', 'ecstatic',
                'elated', 'energetic', 'optimistic', 'impulsive', 'thrilled', 'excited', 'calm', 'peaceful', 'pleased',
                'encouraged', 'surprised', 'relaxed', 'interested', 'concerned', 'fascinated', 'shocked']


class Gender(Enum):
    MAL = 1
    FEM = 2
    UNK = 3


@dataclass
class CharacterReference:
    char_id: int
    ref_str: str
    full_str: str
    sent_num: int
    tok_num: int
    full_start_tok: int
    full_end_tok: int
    start_idx: int
    end_idx: int
    full_start_idx: int
    full_end_idx: int
    emotion: str = ''

    def __init__(self, mention, sentences):
        self.sent_num = mention.sentNum
        self.tok_num = mention.headIndex
        sentence = sentences[self.sent_num]
        token = sentence.token[self.tok_num]
        self.char_id = mention.corefClusterID
        self.ref_str = capitalize_token(token)
        self.start_idx = token.beginChar
        self.end_idx = token.endChar
        self.full_start_tok = mention.startIndex
        self.full_end_tok = mention.endIndex
        full_tokens = sentence.token[self.full_start_tok:self.full_end_tok]
        full_strings = [capitalize_token(t) for t in full_tokens]
        self.full_str = ' '.join(full_strings)
        self.full_start_idx = full_tokens[0].beginChar
        self.full_end_idx = full_tokens[-1].endChar


@dataclass
class Character:
    id: int
    person: str
    is_named: bool
    is_singular: bool
    gender: Gender
    references: List[CharacterReference]

    def __init__(self, mention, sentences):
        self.id = mention.corefClusterID
        self.is_named = is_named_mention(mention)
        self.person = mention.headString.capitalize() if self.is_named else mention.person
        self.is_singular = is_singular(mention)
        self.gender = get_gender(mention)
        self.references = [CharacterReference(mention, sentences)]

    def update(self, mention, sentences):
        self.references.append(CharacterReference(mention, sentences))
        if not self.is_named and is_named_mention(mention):
            self.is_named = True
            self.person = mention.headString.capitalize()
        gender = get_gender(mention)
        if self.gender == Gender.UNK and gender != Gender.UNK:
            self.gender = gender


@dataclass
class DocumentInfo:
    chars: Dict[int, Character]
    char_ref_for_loc: Dict[int, Dict[int, CharacterReference]]

    def __init__(self, document):
        self.chars, self.char_ref_for_loc = {}, {}
        for mention in self._get_animate_mentions(document):
            self._add_char(mention, document.sentence)
        self._add_emotions(document.sentence)

    def has_char_at_loc(self, sent_num, tok_num):
        return sent_num in self.char_ref_for_loc and tok_num in self.char_ref_for_loc[sent_num]

    def _get_animate_mentions(self, document):
        coref_mentions = document.mentionsForCoref
        if has_mentions(document):
            return [m for m in coref_mentions if is_animate(m)]
        else:
            return []

    def _add_char(self, mention, sentences):
        char_id = mention.corefClusterID
        if char_id not in self.chars:
            self.chars[char_id] = Character(mention, sentences)
        else:
            self.chars[char_id].update(mention, sentences)
        self._add_latest_char_ref(char_id)

    def _add_latest_char_ref(self, char_id):
        char_ref = self.chars[char_id].references[-1]
        sent_num = char_ref.sent_num
        tok_num = char_ref.tok_num
        if sent_num not in self.char_ref_for_loc:
            self.char_ref_for_loc[sent_num] = {}
        self.char_ref_for_loc[sent_num][tok_num] = char_ref

    def _add_emotions(self, sentences):
        for sent in sentences:
            for triple in sent.openieTriple:
                obj = triple.object.lower()
                if obj in emotion_list:
                    subj = triple.subject.lower()
                    subj_tokens = triple.subjectTokens
                    sent_num = subj_tokens[0].sentenceIndex
                    tok_nums = [s.tokenIndex for s in subj_tokens]
                    for tok_num in tok_nums:
                        if self.has_char_at_loc(sent_num, tok_num):
                            char_ref = self.char_ref_for_loc[sent_num][tok_num]
                            if char_ref.full_str.lower() == subj:
                                char_ref.emotion = obj
                                break


def has_mentions(document) -> bool:
    return len(document.mentionsForCoref) > 0


def is_animate(mention) -> bool:
    return mention.animacy == 'ANIMATE'


def is_singular(mention) -> bool:
    return mention.number == 'SINGULAR'


def is_named_mention(mention) -> bool:
    return mention.nerString == 'PERSON'


def is_named_token(token) -> bool:
    return token.fineGrainedNER == 'PERSON'


def capitalize(text, is_named) -> str:
    do_capitalize = is_named or text.upper() == 'I'
    return text.capitalize() if do_capitalize else text.lower()


def capitalize_token(token) -> str:
    return capitalize(token.originalText, is_named_token(token))


def capitalize_mention(mention) -> str:
    return capitalize(mention.headString, is_named_mention(mention))


def get_gender(mention) -> Gender:
    gender = mention.gender
    if gender == 'MALE':
        return Gender.MAL
    if gender == 'FEMALE':
        return Gender.FEM
    if gender == 'UNKNOWN':
        return Gender.UNK


def print_tree(parse_tree, level):
    if parse_tree.value:
        print(' ' * level, level, parse_tree.value)
        for child in parse_tree.child:
            print_tree(child, level + 1)


def get_question_info(prompt_text: str, ref: CharacterReference) -> dict:
    return {'character': ref.full_str,
            'prompt_text': prompt_text,
            'start_idx': ref.full_start_idx,
            'end_idx': ref.full_end_idx}


def get_char_phys_descr_question(char: Character, prompt_type: str) -> dict:
    first_ref = char.references[0]
    if prompt_type == 'story':
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


def get_char_emotion_question(ref: CharacterReference, char: Character, prompt_type: str) -> dict:
    if prompt_type == 'story':
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


# NOTES:
#   - all dialogue must be in double quotes
def get_prompt(text, prompt_type, server='localhost'):
    with CoreNLPClient(endpoint=f'http://{server}:9000', start_server=StartServer.DONT_START,
                       annotators=['coref', 'openie', 'parse']) as client:

        document = client.annotate(text)

        document_info = DocumentInfo(document)
        characters = document_info.chars
        char_refs = document_info.char_ref_for_loc
        print(document.sentence[0].openieTriple)

        questions = []
        for id, char in characters.items():
            if char.is_singular:
                question = get_char_phys_descr_question(char, prompt_type)
                questions.append(question)

        for sent_num, refs in char_refs.items():
            for tok_num, ref in refs.items():
                if ref.emotion:
                    char = characters[ref.char_id]
                    question = get_char_emotion_question(ref, char, prompt_type)
                    questions.append(question)

        return questions