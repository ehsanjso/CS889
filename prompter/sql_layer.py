
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
    def addPrompt(self, character, question):
        prompt = self.checkPromptExists(character,question)
        if prompt is not None:
            return prompt

        with sqlite3.connect(self.db) as conn:
            cursor = conn.cursor()
            print(question)
            cursor.execute("INSERT INTO prompts (character,question) VALUES (?,?)", (character,question,))
            conn.commit()
        
        return self.checkPromptExists(character, question)

    def checkPromptExists(self, character,question):
        with sqlite3.connect(self.db) as conn:
            cursor = conn.cursor()
            rs = cursor.execute('SELECT * FROM prompts WHERE character=? AND question=?', (character,question,))
            return cursor.fetchone()
    
    def getPromptById(self, prompt_id):
        with sqlite3.connect(self.db) as conn:
            cursor = conn.cursor()
            rs = cursor.execute('SELECT * FROM prompts WHERE id = ?', (prompt_id,))
            return cursor.fetchone()

    ###
    #  UserPrompts
    ###
    def addUserPrompt(self, user_id,prompt_id):
        user_prompt = self.checkUserPromptExists(user_id, prompt_id)

        if user_prompt is not None:
            return user_prompt

        with sqlite3.connect(self.db) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO user_prompts (user_id,prompt_id) VALUES (?,?)", (user_id, prompt_id,))
            conn.commit()
        
        return self.checkUserPromptExists(user_id, prompt_id)

    def checkUserPromptExists(self, user_id,prompt_id):
        with sqlite3.connect(self.db) as conn:
            cursor = conn.cursor()
            rs = cursor.execute('SELECT * FROM user_prompts WHERE user_id=? AND prompt_id=?', (user_id,prompt_id,))
            return cursor.fetchone()
    
    def getUserPrompts(self, user_id, prompt_ids):
        with sqlite3.connect(self.db) as conn:
            cursor = conn.cursor()
            query_params = ','.join(['?'] * len(prompt_ids))
            query = f'SELECT * FROM user_prompts WHERE user_id=? AND prompt_id in ({query_params})'
            args = prompt_ids.copy()
            args.insert(0,user_id)
            rs = cursor.execute(query, args)
            return cursor.fetchall()
