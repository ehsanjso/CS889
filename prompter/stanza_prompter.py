from stanza.server import CoreNLPClient, StartServer
from get_document_info import Character, CharacterReference, DocumentInfo
from get_questions import get_all_questions


# NOTES:
#   - all dialogue must be in double quotes
def get_prompts(text, prompt_type, server='localhost'):
    with CoreNLPClient(endpoint=f'http://{server}:9000',
                       start_server=StartServer.DONT_START,
                       annotators=['coref', 'openie', 'parse']) as client:
        document = client.annotate(text)
        document_info = DocumentInfo(document)
        return get_all_questions(document_info, prompt_type)
