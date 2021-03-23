import sys
# insert at 1, 0 is the script path (or '' in REPL)
sys.path.insert(1, './config')

import flask
from flask import request, jsonify, render_template
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
    is_debug = app.config['DEBUG']
    return render_template('index.html', is_debug=is_debug)


@app.route('/submit', methods=['POST'])
def submit():
    text = request.form['text']
    prompts = get_prompt(text, app.config['CORENLP_SERVER'])
    is_debug = app.config['DEBUG']
    return render_template('index.html', prompts=prompts, input=text, is_debug=is_debug)


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
