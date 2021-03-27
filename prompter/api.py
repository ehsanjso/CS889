import sys

# insert at 1, 0 is the script path (or '' in REPL)
sys.path.insert(1, './config')

import flask
from flask import request, jsonify, render_template
from cerberus import Validator
from settings import DefaultConfig
from stanza_prompter import get_prompt

# Validators for requests
v = Validator(require_all=True)
get_all_prompts_schema = {'user_text': {'type': 'string'},
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
    return render_template('index.html', is_story=True, is_debug=is_debug)


@app.route('/submit', methods=['POST'])
def submit():
    prompt_type = request.form['prompt_type']
    is_story = prompt_type == 'story'
    text = request.form['text']
    prompts = get_prompt(text, prompt_type, app.config['CORENLP_SERVER'])
    is_debug = app.config['DEBUG']
    return render_template('index.html', prompts=prompts, input=text, is_story=is_story, s_debug=is_debug)


@app.route('/api/get_all_prompts', methods=['GET'])
def get_all_prompts():
    args = dict(request.args)
    if not v.validate(args, get_all_prompts_schema):
        return f'Error: {v.errors}'
    user_text = args['user_text']
    prompt_type = args['prompt_type']
    prompts = get_prompt(user_text, prompt_type, app.config['CORENLP_SERVER'])
    return jsonify(prompts)


app.run(host=app.config['BIND'])
