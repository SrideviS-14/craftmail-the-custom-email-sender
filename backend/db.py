import sqlite3

def init_db():
    conn = sqlite3.connect('email_tracking.db')
    cursor = conn.cursor()
    
    # Create user table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE
        )
    ''')
    
    # Create email_history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS email_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            recipient_email TEXT NOT NULL,
            subject TEXT NOT NULL,
            body TEXT NOT NULL,
            status TEXT NOT NULL,
            delivery_status TEXT,
            opened TEXT DEFAULT 'No',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES user(id)
        )
    ''')
    
    conn.commit()
    conn.close()

def add_user(name, email):
    conn = sqlite3.connect('email_tracking.db')
    cursor = conn.cursor()
    cursor.execute("INSERT INTO user (name, email) VALUES (?, ?)", (name, email))
    conn.commit()
    conn.close()

def add_email_history(user_email, subject, body, status):
    conn = sqlite3.connect('email_tracking.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM user WHERE email = ?", (user_email,))
    user_id = cursor.fetchone()
    
    if user_id:
        user_id = user_id[0]
        cursor.execute('''
            INSERT INTO email_history (user_id, recipient_email, subject, body, status)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, user_email, subject, body, status))
        conn.commit()
    conn.close()
