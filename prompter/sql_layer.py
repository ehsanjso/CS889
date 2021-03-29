
import glob
import sqlite3
 

class SqlLayer:
    def __init__(self,db_name):
        self.db = db_name
        try:
            self.createDatabase('./migrations')
        except:
            print('Tables already exist.')
    ###
    #  Table creation, only run one time. There's no error handling for when tables already exists :^)
    ###
    def createDatabase(self, migrations_dir):
        with sqlite3.connect(self.db) as conn:
            migrations = glob.glob(f"{migrations_dir}/*.migration")
            
            cursor = conn.cursor()
            for m in migrations:
                with open(m) as f:
                    query = ''.join(f.readlines())
                print(f'Running migration {m}')
                cursor.execute(query)
    
    ###
    #  Users
    ###
    def addUser(self, user_id):
        user = self.checkUserExists(user_id)

        if user is not None:
            return user
        
        with sqlite3.connect(self.db) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO users (mongo_id) VALUES (?)", (user_id,))
            conn.commit()
        
        return self.checkUserExists(user_id)

    def checkUserExists(self, mongo_id):
        with sqlite3.connect(self.db) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM users WHERE mongo_id = ?', (mongo_id,))
            return cursor.fetchone()

    ###
    #  Prompts
    ###
    def addPrompt(self, prompt_text):
        prompt = self.checkPromptExists(prompt_text)
        if prompt is not None:
            return prompt

        with sqlite3.connect(self.db) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO prompts (prompt_text) VALUES (?)", (prompt_text,))
            conn.commit()
        
        return self.checkPromptExists(prompt_text)

    def checkPromptExists(self, prompt_text):
        with sqlite3.connect(self.db) as conn:
            cursor = conn.cursor()
            rs = cursor.execute('SELECT * FROM prompts WHERE prompt_text=?', (prompt_text,))
            return cursor.fetchone()
    
    def getPromptById(self, prompt_id):
        with sqlite3.connect(self.db) as conn:
            cursor = conn.cursor()
            rs = cursor.execute('SELECT * FROM prompts WHERE id = ?', (prompt_id,))
            return cursor.fetchone()

    ###
    #  UserPrompts
    ###
    def addUserPrompt(self, user_id,prompt_id,character):
        user_prompt = self.checkUserPromptExists(user_id, prompt_id, character)

        if user_prompt is not None:
            return user_prompt

        with sqlite3.connect(self.db) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO user_prompts (user_id,prompt_id,character) VALUES (?,?,?)", (user_id, prompt_id,character))
            conn.commit()
        
        return self.checkUserPromptExists(user_id, prompt_id,character)

    def checkUserPromptExists(self, user_id,prompt_id, character):
        with sqlite3.connect(self.db) as conn:
            cursor = conn.cursor()
            rs = cursor.execute('SELECT * FROM user_prompts WHERE user_id=? AND prompt_id=? AND character=?', (user_id,prompt_id,character))
            return cursor.fetchone()
    
    def getUserPrompts(self, user_id, prompt_ids, character = None):
        with sqlite3.connect(self.db) as conn:
            cursor = conn.cursor()
            query_params = ','.join(['?'] * len(prompt_ids))
            args = prompt_ids.copy()
            character_query = ''
            
            if character is not None:
                args.insert(0,character)
                character_query = 'AND character=?'

            args.insert(0,user_id)
            query = f'SELECT * FROM user_prompts WHERE user_id=? {character_query} AND prompt_id in ({query_params})'
            rs = cursor.execute(query, args)
            return cursor.fetchall()
