# MailCraft — AI Email Assistant

Paraphrase emails with the right tone + generate job application emails using Gemini AI.

## Project Structure

```
mailcraft/
├── public/
│   └── index.html          ← Main app (Vue.js + Tailwind)
├── netlify/
│   └── functions/
│       └── gemini.js       ← Serverless proxy (hides API key)
├── netlify.toml            ← Netlify config
└── README.md
```

## Setup (5 minutes)

### 1. Get a free Gemini API key
- Go to https://aistudio.google.com/app/apikey
- Click "Create API Key" — it's free, no credit card needed
- Copy the key

### 2. Generate a CHAT_SECRET
- Go to https://1password.com/password-generator/
- Generate a random 20-char password
- Copy it

### 3. Deploy to Netlify
- Push this folder to a GitHub repo
- Go to https://app.netlify.com → "Add new site" → "Import from Git"
- Select your repo → Deploy

### 4. Set Environment Variables in Netlify
Go to: Site → Site Configuration → Environment Variables → Add variable

| Key | Value |
|---|---|
| `GEMINI_API_KEY` | your Gemini API key |
| `CHAT_SECRET` | your generated secret |
| `ALLOWED_ORIGIN` | https://your-site-name.netlify.app |

### 5. Update the frontend
In `public/index.html` find:
```javascript
const CHAT_SECRET = "PASTE_YOUR_CHAT_SECRET_HERE";
```
Replace with your actual CHAT_SECRET value.

### 6. Redeploy
Push to Git again → Netlify auto-deploys → Done! ✅

## Features
- ✦ Email Paraphraser — 4 tones: Professional, Formal, Friendly, Concise
- ✦ Auto-Apply — Cover letter, Follow-up, Cold outreach emails
- ✦ History — Last 20 results saved in localStorage
- ✦ Secured — Netlify Function proxy, rate limiting, origin check