import sys
# insert at 1, 0 is the script path (or '' in REPL)
sys.path.insert(1, './config')

import flask
from flask import request, jsonify
from settings import DefaultConfig
from stanza_prompter import get_prompt

app = flask.Flask(__name__)

# Load the default configuration
app.config.from_object(DefaultConfig)

try:
    app.config.from_envvar('flask_settings')
except:
    print("Environment Variable config not found. Using default configuration.")


@app.route('/', methods=['GET'])
def index():
    return f"<h1> {app.config['DEBUG']} </h1>"


@app.route('/api/get_prompt', methods=['GET'])
def prompter():
    params = request.args

    if 'text' in params:
        text = params['text']
    else:
        return "No input text specified."

    prompts = get_prompt(text, app.config['CORENLP_SERVER'])

    return jsonify(prompts)

    


app.run(host=app.config['BIND'])
