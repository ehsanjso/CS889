from dataclasses import dataclass
from enum import Enum
from typing import List, Dict

# from nltk.corpus import wordnet as wn
# from nltk.corpus.reader.wordnet import WordNetError


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
    num: str
    gender: Gender
    references: List[CharacterReference]

    def __init__(self, mention, sentences):
        self.id = mention.corefClusterID
        self.is_named = is_named_mention(mention)
        self.person = mention.headString.capitalize() if self.is_named else mention.person
        self.num = get_num(mention)
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
    """
    if mention.nerString == 'PERSON':
        return True

    #This is necessary because 'His' and 'Her' can make it this far but aren't nouns
    isNoun = 'n' in [ss.pos() for ss in wn.synsets(mention.headString)]
    if isNoun:
        try:
            #Check if the mentioned word is of the organism synset
            isOrganism = wn.synset('organism.n.01') in wn.synset(f'{mention.headString}.n.01').lowest_common_hypernyms(wn.synset('organism.n.01'))
            return mention.animacy == 'ANIMATE' and isOrganism
        except WordNetError:
            print(f'{mention.headString} is not in the wordnet corpus.')
        
    return False
    """
    return mention.animacy == 'ANIMATE'



def get_num(mention) -> str:
    return 'sing' if mention.number == 'SINGULAR' else 'plur'


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
