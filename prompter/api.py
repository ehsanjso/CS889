import flask
from flask import request, jsonify, render_template

from stanza_prompter import get_prompt

app = flask.Flask(__name__)
app.config["DEBUG"] = True


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/submit', methods=['POST'])
def submit():
    text = request.form['text']
    prompts = get_prompt(text)
    return  render_template('index.html', prompts=prompts, input=text)


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
