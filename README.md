# CraftMail: Email Automation and Scheduling Tool

CraftMail is a powerful email automation and scheduling platform that streamlines email management. It allows users to upload CSV files, customize email prompts, generate previews, schedule deliveries, and send emails effortlessly. CraftMail integrates seamlessly with popular Email Service Providers (ESP) like SendGrid, utilizes the Groq API for content generation, and offers secure user authentication through Google OAuth2.

---

## Table of Contents

1. [Features](#features)  
2. [Setup and Configuration](#setup-and-configuration)  
   - [Prerequisites](#prerequisites)  
   - [Installation](#installation)  
   - [Backend Configuration](#backend-configuration)  
   - [API Key Configuration](#api-key-configuration)  
3. [Usage Instructions](#usage-instructions)  
4. [Screenshots](#screenshots)  

---

## Features

- **CSV File Upload**: Upload recipient email addresses and dynamic fields.  
- **Customizable Email Templates**: Create email subjects and bodies using placeholders from CSV columns.  
- **Preview Feature**: Review and refine email templates before sending.  
- **Google OAuth2 Authentication**: Secure user login using Google OAuth2.  
- **Email Scheduling**: Schedule emails for immediate or future delivery.  
- **Throttling Support**: Ensure compliance with ESP rate limits.  

---

## Setup and Configuration

### Prerequisites

- **Node.js** and **npm** installed  
- **Python 3.x** installed  
- ESP API credentials (e.g., SendGrid, SMTP, or Groq API)  
- **Google Cloud Console** access for OAuth2 setup  
- Docker (optional for containerized deployment)  

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/SrideviS-14/custom-email-sender.git
    cd custom-email-sender
    ```

2. Install frontend dependencies:
    ```bash
    cd frontend
    npm install
    ```

3. Install backend dependencies:
    ```bash
    cd ../backend
    pip install -r requirements.txt
    ```

### Backend Configuration

1. Navigate to the `backend` directory.  
2. Set up a `.env` file for your Flask server:
    ```env
    FLASK_APP=app.py
    FLASK_ENV=development
    SENDGRID_API_KEY=your_sendgrid_api_key
    GROQ_API_KEY=your_groq_api_key
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    ```
3. Start the Flask server:
    ```bash
    flask run
    ```

### API Key Configuration

#### 1. **SendGrid API Key**
- Visit the [SendGrid API Key Management](https://app.sendgrid.com/settings/api_keys).  
- Log in or create an account.  
- Click **Create API Key** and choose permissions (Full Access is recommended for development).  
- Copy the generated key and add it to your `.env` file under `SENDGRID_API_KEY`.

#### 2. **Groq API Key**
- Visit the [Groq Dashboard](https://console.groq.com/keys).  
- Create an account or log in.  
- Navigate to **API Keys** under **Settings**.  
- Generate a new key and copy it.  
- Add the key to your `.env` file under `GROQ_API_KEY`.

#### 3. **Google OAuth2 Client ID and Secret**
- Go to the [Google Cloud Console](https://console.cloud.google.com/).  
- Create a new project or select an existing one.  
- Navigate to **APIs & Services > Credentials**.  
- Click **Create Credentials > OAuth 2.0 Client IDs**.  
- Set the application type to **Web Application**.  
- Add the redirect URI for your app, e.g., `http://localhost:5000/auth/callback`.  
- Copy the **Client ID** and **Client Secret**, and add them to your `.env` file under `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.  

---

## Usage Instructions

1. **Login with Google**  
   - Click the **Login with Google** button on the homepage.  
   - Authenticate using your Google account.  

2. **Upload CSV File**  
   - Navigate to the "Upload CSV" page.  
   - Upload a CSV file containing email addresses and any additional columns for placeholders.  

3. **Customize Email Prompt**  
   - Enter a custom email prompt in the text field.  
   - Use placeholders like `{column_name}` to dynamically replace fields with CSV values.  

4. **Generate Email Preview**  
   - Review and edit the auto-generated subject and body before proceeding.  

5. **Schedule Emails**  
   - Choose to send the emails immediately or at a scheduled time.  

6. **Send Emails**  
   - Confirm the email content and recipient details before sending.  

---

## Screenshots

### Login Page
![image](https://github.com/user-attachments/assets/ccab1e02-b69b-4e2f-8236-60c7bc626c98)

### Home Page
![image](https://github.com/user-attachments/assets/05aff76f-0304-4f1f-848d-e62a47c36dc5)

### Dashboard 
![image](https://github.com/user-attachments/assets/41d18898-d4bf-47b2-9b06-44de647046da)

### Profile Page
![image](https://github.com/user-attachments/assets/6540f4d7-6bca-49f6-b86a-264a54589ec3)

### About Page
![image](https://github.com/user-attachments/assets/005c193e-6a2d-4dd0-9e79-98530c980fcd)

### Contact Page
![image](https://github.com/user-attachments/assets/f20537ab-1b0e-478a-94bc-72dda9d25f18)

---

