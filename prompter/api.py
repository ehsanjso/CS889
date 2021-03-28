import sys

# insert at 1, 0 is the script path (or '' in REPL)
sys.path.insert(1, './config')

import flask
from flask import request, jsonify, render_template
from cerberus import Validator
from settings import DefaultConfig
from stanza_prompter import get_prompts


# Validators for requests
v = Validator(require_all=True)
get_all_prompts_schema = {'user_text': {'type': 'string'},
                          'prompt_type': {'type': 'string', 'allowed': ['story', 'reader']}}

get_next_prompt_schema = {'user_id': {'type': 'string'},
                          'user_text': {'type': 'string'},
                          'prompt_type': {'type': 'string', 'allowed': ['story', 'reader']}}

app = flask.Flask(__name__)

# Load the default configuration
app.config.from_object(DefaultConfig)

try:
    app.config.from_envvar('flask_settings')
except:
    print("Environment Variable config not found. Using default configuration.")


@app.route('/', methods=['GET'])
def index():
    is_debug = app.config['DEBUG']
    return render_template('index.html', is_story=True, show_all_prompts=True, is_debug=is_debug)


@app.route('/submit', methods=['POST'])
def submit():
    is_debug = app.config['DEBUG']
    prompt_type = request.form['prompt_type']
    is_story = prompt_type == 'story'
    api_type = request.form['api_type']
    show_all_prompts = api_type == 'all_prompts'
    user_id = request.form['user_id']
    text = request.form['text']
    prompts = get_prompts(text, prompt_type, show_all=show_all_prompts, server=app.config['CORENLP_SERVER'])
    prompts = prompts if show_all_prompts else [prompts]
    return render_template('index.html', prompts=prompts, input=text, is_story=is_story,
                           show_all_prompts=show_all_prompts, user_id=user_id, is_debug=is_debug)


@app.route('/api/get_all_prompts', methods=['GET'])
def get_all_prompts():
    args = dict(request.args)
    if not v.validate(args, get_all_prompts_schema):
        return f'Error: {v.errors}'
    user_text = args['user_text']
    prompt_type = args['prompt_type']
    prompts = get_prompts(user_text, prompt_type, server=app.config['CORENLP_SERVER'])
    return jsonify(prompts)


@app.route('/api/get_next_prompt', methods=['GET'])
def get_next_prompt():
    args = dict(request.args)
    if not v.validate(args, get_next_prompt_schema):
        return f"Error: {v.errors}"
    user_id = args['user_id']
    user_text = args['user_text']
    prompt_type = args['prompt_type']
    prompt = get_prompts(user_text, prompt_type, show_all=False, server=app.config['CORENLP_SERVER'])
    return jsonify(prompt)


app.run(host=app.config['BIND'])
