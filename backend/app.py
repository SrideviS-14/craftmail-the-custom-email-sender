from flask import Flask, jsonify, redirect, url_for, session, request
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
import pandas as pd
import secrets
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from groq import Groq
from db import init_db, add_user, add_email_history  # Import your db functions
import sqlite3
import re
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = 'random_secret_key'  # Replace with a secure key in production
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})
oauth = OAuth(app)
init_db()
print(datetime.now())
api_key = "API_KEY"
current_user = None
csv_data = {}
email_statuses = {}
scheduler = BackgroundScheduler()
scheduler.start()

def draft_msg(content, role='user'):
    return {
        "role": role,
        "content": content,
    }

google = oauth.register(
    name='google',
    client_id='CLIENT_ID',
    client_secret='CLIENT_SECRET',
    client_kwargs={'scope': 'openid email profile'},
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
)

@app.route('/')
def index():
    global current_user
    user = session.get('user')
    if user:
        current_user = user  # Store the user info in the global variable
        return jsonify({"email": user["email"], "name": user["given_name"]})
    return jsonify({"message": "Not logged in"}), 401

@app.route('/login')
def login():
    # Generate and store nonce in session for security
    session['nonce'] = secrets.token_urlsafe()
    redirect_uri = url_for('authorize', _external=True)
    return google.authorize_redirect(redirect_uri, nonce=session['nonce'])

@app.route('/authorize')
def authorize():
    try:
        # Exchange the authorization code for an access token
        token = google.authorize_access_token()
        # Retrieve and verify the nonce from session
        nonce = session.pop('nonce', None)
        if not nonce:
            return jsonify({"error": "Session expired or nonce missing"}), 400
        
        # Validate the token issuer with nonce for security
        claims_options = {
            "iss": {"values": ["https://accounts.google.com"]}
        }
        userinfo = google.parse_id_token(token, nonce=nonce, claims_options=claims_options)
        
        # Add user to the database if not already present
        conn = sqlite3.connect('email_tracking.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user WHERE email = ?", (userinfo['email'],))
        existing_user = cursor.fetchone()
        
        if not existing_user:
            add_user(userinfo['given_name'], userinfo['email'])  # Save new user to DB
            
        # Store user information in session
        session['user'] = userinfo
        return redirect('http://localhost:3000/')  # Redirect to React app after login
    except Exception as e:
        print(f"Error during authorization: {e}")
        return jsonify({"error": "Authorization failed"}), 500

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect('http://localhost:3000/')  # Redirect to React app after logout

# Endpoint for CSV upload
@app.route('/api/upload-csv', methods=['POST'])
def upload_csv():
    global csv_data
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    data = pd.read_csv(file)
    
    # Save each column as a key in csv_data with its corresponding values
    csv_data = data.to_dict(orient='list')
    
    # Extract column names for placeholders
    columns = list(data.columns)
    email_data = data.to_dict(orient='records')
    
    return jsonify({"status": "File processed successfully", "columns": columns, "data": email_data}), 200

@app.route('/api/gen-email', methods=['POST'])
def gen_email():
    client = Groq(api_key=api_key)
    messages = [
        {
            'role': 'system',
            'content': 'You are a student who writes professional emails based on customized prompts.'
        }
    ]
    
    data = request.get_json()
    prompt = data.get("prompt", "")
    
    if not isinstance(prompt, str) or not prompt.strip():
        return jsonify({"error": "Invalid or missing prompt"}), 400
    
    personalized_prompt = f"Write an email with the following details: \n" \
                          f"Sender: {current_user['given_name']}\n" \
                          f"Message: {prompt}"

    messages.append(draft_msg(personalized_prompt))
    
    try:
        # Generate chat completion
        chat_completion = client.chat.completions.create(
            temperature=1.0,
            n=1,
            model="mixtral-8x7b-32768",
            max_tokens=10000,
            messages=messages
        )
        
        # Parse generated email content
        generated_content = chat_completion.choices[0].message.content

        # Simple parsing logic to separate subject, body, and regards
        lines = generated_content.splitlines()
        subject = ""
        body = ""

        for line in lines:
            if line.startswith("Subject:"):
                subject = line.replace("Subject:", "").strip()
            elif line.strip():  # Add non-empty lines to body if not in regards section
                body += line + "\n"

        # Save the email history to the database
        if current_user:
            add_email_history(current_user['email'], subject, body, 'Pending')

        return jsonify({
            "subject": subject,
            "body": body.strip(),
        }), 200
        
    except Exception as e:
        print(f"Error generating email: {e}")
        return jsonify({"error": "Failed to generate email"}), 500

@app.route('/api/send-email', methods=['POST'])
def send_email():
    data = request.get_json()
    email_content = data.get('emailContent', {})
    subject = email_content.get('subject', 'Default Subject')
    body = email_content.get('body', 'Default Body')
    send_time = data.get('sendTime')  # Expecting ISO 8601 format (e.g., "2024-11-16T14:00:00")
    if not send_time:
        send_time = (datetime.now() + timedelta(minutes=1)).strftime('%Y-%m-%d %H:%M:%S')
    try:
        # Convert send_time to datetime
        send_time_dt = datetime.fromisoformat(send_time)
        if send_time_dt < datetime.now():
            print("1")
            return jsonify({"error": "Send time must be in the future"}), 400

        # Schedule email sending
        scheduler.add_job(
            func=send_email_task,
            trigger=DateTrigger(run_date=send_time_dt),
            args=[subject, body],
            id=f"send_email_{send_time}",
            replace_existing=True  # Avoid duplicate jobs with the same ID
        )
        return jsonify({"message": "Email scheduled successfully"}), 200
    except ValueError:
        print("2")
        return jsonify({"error": "Invalid time format"}), 400
    except Exception as e:
        print(f"Error scheduling email: {e}")
        return jsonify({"error": "Failed to schedule email"}), 500

def send_email_task(subject, body):
    failed_emails = []

    for i, recipient_email in enumerate(csv_data['email']):
        # Personalization logic remains the same
        personalized_subject = subject
        personalized_body = body

        placeholders = re.findall(r'\{(.*?)\}', subject + " " + body)
        for placeholder in placeholders:
            if placeholder in csv_data:
                value = csv_data[placeholder][i]
                personalized_subject = personalized_subject.replace(f'{{{placeholder}}}', str(value))
                personalized_body = personalized_body.replace(f'{{{placeholder}}}', str(value))

        message = Mail(
            from_email=current_user['email'],
            to_emails=recipient_email,
            subject=personalized_subject,
            plain_text_content=personalized_body
        )

        try:
            sendgrid_client = SendGridAPIClient("SENDGRID_API_KEY")
            response = sendgrid_client.send(message)
            email_status = "Sent" if response.status_code == 202 else "Failed"
        except Exception as e:
            email_status = "Failed"
            failed_emails.append(recipient_email)

        email_statuses[recipient_email] = {
            "email": recipient_email,
            "status": email_status,
            "delivery_status": "Pending",
            "opened": "No"
        }
        if current_user:
            add_email_history(current_user['email'], personalized_subject, personalized_body, email_status)

    print(f"Emails sent with {len(failed_emails)} failures.")

@app.route('/api/email-status-count', methods=['GET'])
def get_email_status_count():
    # Get the current user's email
    email = current_user.get('email')
    
    if not email:
        return jsonify({"error": "User not logged in"}), 401

    # Connect to the database
    conn = sqlite3.connect('email_tracking.db')
    cursor = conn.cursor()

    # Get user ID from the 'user' table
    cursor.execute("SELECT id FROM user WHERE email = ?", (email,))
    user_data = cursor.fetchone()
    
    if not user_data:
        return jsonify({"error": "User not found"}), 404
    
    user_id = user_data[0]

    # Count the number of emails for each status for this user
    status_counts = {
        "Sent": 0,
        "Scheduled": 0,
        "Pending": 0,
        "Failed": 0
    }
    
    cursor.execute("SELECT status FROM email_history WHERE user_id = ?", (user_id,))
    email_statuses = cursor.fetchall()

    # Count the occurrences of each status
    for status in email_statuses:
        status = status[0]  # Get the status from the tuple
        if status in status_counts:
            status_counts[status] += 1

    return jsonify(status_counts), 200

@app.route('/api/email-status', methods=['GET'])
def get_email_status():
    return jsonify(email_statuses), 200

# Sample route to update delivery/open status, you could connect this to SendGrid webhook
@app.route('/api/update-email-status', methods=['POST'])
def update_email_status():
    data = request.get_json()
    email = data['email']
    status = data.get('delivery_status')
    opened = data.get('opened', 'No')

    if email in email_statuses:
        email_statuses[email]["delivery_status"] = status
        email_statuses[email]["opened"] = opened

    return jsonify({"message": "Status updated"}), 200
    
@app.route('/api/user-details', methods=['GET'])
def user_details():
    email =  current_user['email']

    if not email:
        return jsonify({"error": "Email not provided"}), 400

    # Fetch the user's details from the database based on the email
    conn = sqlite3.connect('email_tracking.db')
    cursor = conn.cursor()
    
    # Get user details from the 'user' table
    cursor.execute("SELECT id, name, email FROM user WHERE email = ?", (email,))
    user_data = cursor.fetchone()
    
    if not user_data:
        return jsonify({"error": "User not found"}), 404
    
    user_id, name, email = user_data

    # Get email history from the 'email_history' table for this user
    cursor.execute("SELECT recipient_email, subject, body, status, delivery_status, opened, timestamp FROM email_history WHERE user_id = ?", (user_id,))
    email_history = cursor.fetchall()
    
    # Prepare the email history as a list of dictionaries
    email_history_list = []
    for record in email_history:
        email_history_list.append({
            "recipient_email": record[0],
            "subject": record[1],
            "body": record[2],
            "status": record[3],
            "delivery_status": record[4],
            "opened": record[5],
            "timestamp": record[6]
        })
    
    # Return user details along with email history
    return jsonify({
        "user": {
            "name": name,
            "email": email
        },
        "email_history": email_history_list
    }), 200

if __name__ == '__main__':
    app.run(debug=True)

