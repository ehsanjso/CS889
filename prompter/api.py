import flask
from flask import request, jsonify

from stanza_prompter import get_prompt

app = flask.Flask(__name__)
app.config["DEBUG"] = True


@app.route('/', methods=['GET'])
def index():
    return "<h1>Test</h1>"


@app.route('/api/get_prompt', methods=['GET'])
def prompter():
    params = request.args

    if 'text' in params:
        text = params['text']
    else:
        return "No input text specified."

    prompts = get_prompt(text)

    return jsonify(prompts)

    


app.run()
