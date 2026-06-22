# 🚀 Deployment Guide - Carbon Footprint Awareness Platform

## Quick Start Deployment to Vercel

### Prerequisites
- GitHub account connected to Vercel
- GEMINI_API_KEY from Google AI Studio
- Firebase credentials (API keys, Project ID, etc.)

---

## Step 1: Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New → Project**
3. Select your GitHub repository: `anandydv123/Carbon-Footprint-Awareness-Platform`
4. Click **Import**

---

## Step 2: Add Environment Variables

In the Vercel dashboard, go to **Settings → Environment Variables** and add:

### Required Variables:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### Firebase Variables:
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

> **Note:** Get these from your Firebase Console and Google AI Studio

---

## Step 3: Deploy

1. Click **Deploy** button
2. Wait for build to complete (2-3 minutes)
3. Get your production URL: `https://your-project-name.vercel.app`

---

## Step 4: Test AI Coach

1. Open your Vercel URL in browser
2. Go to **AI Coach** section
3. Ask a question like: *"Based on my activity logs, what is my highest source of carbon emissions?"*
4. AI Coach should respond with personalized sustainability tips

---

## Local Development

```bash
# Install dependencies
cd carbon-footprint-awareness-platform
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Troubleshooting

### AI Coach Returns Error
- ✅ Verify `GEMINI_API_KEY` is set in Vercel environment variables
- ✅ Check Google AI Studio for active API key
- ✅ Restart deployment after adding env vars

### Build Fails
- ✅ Run `npm install` locally first
- ✅ Check `package.json` dependencies are correct
- ✅ Verify Node version compatibility (v20+)

### Firebase Not Connecting
- ✅ Verify all `VITE_FIREBASE_*` variables are set
- ✅ Check Firebase project is active
- ✅ Clear browser cache and reload

---

## API Endpoints Available

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/ai-coach` | POST | AI Sustainability Coach |

---

## Production URL
🔗 **[Your App URL](https://your-project.vercel.app)**

---

## Support
For issues, check:
- [Vercel Docs](https://vercel.com/docs)
- [Google Generative AI Docs](https://ai.google.dev/docs)
- [Firebase Docs](https://firebase.google.com/docs)
