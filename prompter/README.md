# CS889 -- Prompter
## How to use

Use a virtual env:
```bash
python -m venv {env_name}
source {env_name}/bin/activate
```

Install requirements:
```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

How to put in a sentence and get a prompt:
```
python ./prompter/get_prompt.py --text="The autumn breeze swept the leaves across the tarmac."
```

runpy.js contains some code to run the python script from javascript. It's not a complete module yet but it should be good enough to get started.
```
node runpy.js
```