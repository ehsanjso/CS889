from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict

from stanza.server import CoreNLPClient, StartServer

emotion_list = ['angry', 'irritated', 'enraged', 'annoyed', 'upset', 'resentful', 'incensed', 'infuriated', 'fuming', 'indignant', 'disgusted'
                'depressed', 'disappointed', 'discouraged', 'ashamed', 'powerless', 'guilty', 'dissatisfied', 'miserable',
                'confused', 'uncertain', 'perplexed', 'embarrassed', 'shy', 'skeptical', 'distrustful', 'uneasy', 'pessimistic', 'tense',
                'distressed'
                'indifferent', 'weary', 'bored', 
                'afraid', 'fearful', 'terrified', 'anxious', 'alarmed', 'panicked', 'nervous', 'scared', 'worried', 'frightened', 'restless',
                'hurt', 'tormented', 'pained', 'dejected', 'offended', 'heartbroken', 'agonized', 'appalled', 'humiliated',
                'sad', 'tearful', 'sorrowful', 'pained', 'unhappy', 'lonely', 'mournful', 'dismayed', 'lonely',
                'amazed',
                'happy', 'joyous', 'delighted', 'overjoyed', 'ecstatic', 'elated',
                'energetic', 'optimistic', 'impulsive', 'thrilled', 'excited',
                'calm', 'peaceful', 'pleased', 'encouraged', 'surprised', 'relaxed',
                'interested', 'concerned', 'fascinated', 'shocked']

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
  is_singular:bool
  gender: Gender
  references: List[CharacterReference]

  def __init__(self, mention):
    self.id = mention.corefClusterID
    self.is_named = is_named_person(mention)
    self.person =  mention.headString if self.is_named else mention.person
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

# def get_mention_name(document, mention):
#   start = mention.startIndex
#   end = mention.endIndex
#   sent = mention.sentNum
#   words = [token.word for token in document.sentence[sent].token[start:end]]
#   name = ' '.join(words)
#   return name

# def get_char_phys_descr_question(document, mention):
#   name = get_mention_name(document, mention)
#   if is_singular(mention):
#     question = 'What does this character look like?'
#   else:
#     question = 'What do these characters look like?'
#   return f'{name}: {question}'

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


# text = """It was the first day of school. I was so excited to go. I got ready so fast, and my mom dropped me off. 
# When I got to class, I was so surprised to see a monkey sitting at a desk. I asked my teacher why there was a monkey in our class.
# She said he was a new student. I started to laugh. Then, all of a sudden, the monkey started to laugh too. We were both so shocked.
# We were both fascinated by each other."""

# text = """
# The teacher was upset. I noticed that she looked really lonely. Sam noticed I looked confused and angry. I had never been so angry in my life.
# """
def get_prompt(text):
  with CoreNLPClient(endpoint='http://165.227.42.195:9000',start_server=StartServer.DONT_START) as client:


      #text = "I got ready so fast."
      document = client.annotate(text)

      document_info = DocumentInfo(document)
      characters = document_info.chars
      char_refs = document_info.char_ref_for_loc
      document.sentence[0].openieTriple


      description_questions = []
      #print("Description Questions")
      for id, char in characters.items():
          if char.is_singular:
              #print('  - ', char)
              phys_question = get_char_phys_descr_question(char)
              #print('  -  Q: ',phys_question)
              #print()
              description_questions.append(phys_question)


      #print()
      #print("Emotion Questions")

      for sent_num, refs in char_refs.items():
          for tok_num, ref in refs.items():
              if ref.emotion:
                  char = characters[ref.char_id]
                  print('  - ', ref)
                  print('  - ', char)
                  emotion_question = get_char_emotion_question(ref, char)
                  print('  Q ',emotion_question)
                  print()

      # print("The first time the character is mentioned, ask about physical appearance:\n")

      """
      for id, char_info in get_char_clusters(document).items():
          if char_info['is_singular']: # Only ask questions about single characters 
              print('Character Information:')
              print('  ', char_info)
              phys_question = get_char_phys_descr_question(char_info)
              print('    Q: ',phys_question)
              print()

              # TODO: can dependencies be across sentences?
              for ref in char_info['references']:
                  sent_num = ref['sent']
                  tok_num = ref['tok']
                  ref_str = ref['str']
      """
          
      
      # char_deps = [dep for dep in document.sentence[sent_num].basicDependencies.edge if dep.target == tok_num + 1]

      # for dep in char_deps:
      #   if dep.dep == 'nsubj':
      #     source = document.sentence[sent_num].token[dep.source - 1]
      #     if source.pos == 'JJ' and source.lemma in emotion_list:
      #       emotion_info = {'emotion': source.lemma, 'sent': sent_num, 'tok': dep.source-1}
      #       # print(source)
      #       print(' '.join([token.word for token in document.sentence[sent_num].token]))
      #       print(f'{ref} -> {emotion_info}')
      #       print('    Why is the character feeling this way?')
      #       print(f"    Why is the character {emotion_info['emotion']}?")
      #       print(f"    Why is the character {emotion_info['emotion']}?")
      #       print()


      #parse_tree = document.sentence[0].parseTree
      #print_tree(parse_tree, 0)

      return description_questions