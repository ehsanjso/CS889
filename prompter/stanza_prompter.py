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
    sent_num: int
    tok_num: int
    emotion: str = ''

    def __init__(self, mention):
        self.char_id = mention.corefClusterID
        self.ref_str = mention.headString.capitalize()
        self.sent_num = mention.sentNum
        self.tok_num = mention.headIndex


@dataclass
class Character:
    id: int
    person: str
    is_named: bool
    is_singular: bool
    gender: Gender
    references: List[CharacterReference]

    def __init__(self, mention):
        self.id = mention.corefClusterID
        self.is_named = is_named_person(mention)
        self.person = mention.headString if self.is_named else mention.person
        self.person = self.person.capitalize()
        self.is_singular = is_singular(mention)
        self.gender = get_gender(mention)
        self.references = [CharacterReference(mention)]

    def update(self, mention):
        self.references.append(CharacterReference(mention))
        if not self.is_named and is_named_person(mention):
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
            self._add_char(mention)
        self._add_emotions(document)

    def has_char_at_loc(self, sent_num, tok_num):
        return sent_num in self.char_ref_for_loc and tok_num in self.char_ref_for_loc[sent_num]

    def _get_animate_mentions(self, document):
        coref_mentions = document.mentionsForCoref
        if has_mentions(document):
            return [m for m in coref_mentions if is_animate(m)]
        else:
            return []

    def _add_char(self, mention):
        char_id = mention.corefClusterID
        if char_id not in self.chars:
            self.chars[char_id] = Character(mention)
        else:
            self.chars[char_id].update(mention)
        self._add_laterst_char_ref(char_id)

    def _add_laterst_char_ref(self, char_id):
        char_ref = self.chars[char_id].references[-1]
        sent_num = char_ref.sent_num
        tok_num = char_ref.tok_num
        if sent_num not in self.char_ref_for_loc:
            self.char_ref_for_loc[sent_num] = {}
        self.char_ref_for_loc[sent_num][tok_num] = char_ref

    def _add_emotions(self, document):
        for sent in document.sentence:
            for triple in sent.openieTriple:
                emotion = triple.object.lower()
                if emotion in emotion_list:
                    subject = triple.subjectTokens[0]
                    sent_num = subject.sentenceIndex
                    tok_num = subject.tokenIndex
                    if self.has_char_at_loc(sent_num, tok_num):
                        self.char_ref_for_loc[sent_num][tok_num].emotion = emotion


def has_mentions(document) -> bool:
    return len(document.mentionsForCoref) > 0


def is_animate(mention) -> bool:
    return mention.animacy == 'ANIMATE'


def is_singular(mention) -> bool:
    return mention.number == 'SINGULAR'


def is_named_person(mention) -> bool:
    return mention.nerString == 'PERSON'


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


def get_char_phys_descr_question(char: Character) -> str:
    first_mention = char.references[0].ref_str
    if char.is_singular:
        question = 'What does this character look like?'
    else:
        question = 'What do these characters look like?'
    return f'{first_mention}: {question}'


def get_char_emotion_question(ref: CharacterReference, char: Character) -> str:
    if char.is_singular:
        question = 'Why is this character feeling this way?'
    else:
        question = 'Why are these characters feeling this way?'
    return f'{ref.ref_str}: {question} ({ref.emotion})'


# NOTES:
#   - all dialogue must be in double quotes
#   - this takes a while to run the first time
def get_prompt(text, server='localhost'):
    with CoreNLPClient(endpoint=f'http://{server}:9000', start_server=StartServer.DONT_START,
                       annotators=['coref', 'openie', 'parse']) as client:

        document = client.annotate(text)

        document_info = DocumentInfo(document)
        characters = document_info.chars
        char_refs = document_info.char_ref_for_loc

        description_questions = []
        for id, char in characters.items():
            if char.is_singular:
                phys_question = get_char_phys_descr_question(char)
                description_questions.append(phys_question)

        emotion_questions = []
        for sent_num, refs in char_refs.items():
            for tok_num, ref in refs.items():
                if ref.emotion:
                    char = characters[ref.char_id]
                    emotion_question = get_char_emotion_question(ref, char)
                    emotion_questions.append(emotion_question)

        return {'description_qs': description_questions,
                'emotion_qs': emotion_questions}
