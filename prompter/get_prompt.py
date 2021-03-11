import argparse, sys

from paragraph import extract_keywords
from sentence import process

input_types=['sentence','paragraph']
if __name__ == "__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument('--type', type=str, default='sentence', help='sentence or paragraph (default: sentence)')
    parser.add_argument('--text', type=str, help='text to analyze')
    args=parser.parse_args()

    if args.text == None:
        raise Exception('No argument \'text\' was passed.')

    if args.type not in input_types:
        raise Exception('Invalid argument \'type\'. Value should be \'paragraph\' or \'sentence\' (Default: \'sentence\').')
    

    if args.type == 'sentence':
        test = process(args.text)
    elif args.type == 'paragraph':
        keywords = extract_keywords(args.text)
        print(keywords)