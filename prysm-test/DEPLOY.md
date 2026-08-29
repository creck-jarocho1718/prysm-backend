# PRYSM Backend Deployment Guide

## Backend API URL
**IMPORTANT**: Currently, the frontend is configured to call `http://localhost:3001` which only works locally.

To make PRYSM work in production, you need to deploy the backend publicly.

## Option 1: Deploy to Railway (Recommended)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Deploy the backend**:
   ```bash
   cd /workspace/prysm-test/server
   railway init
   railway up
   ```

4. **Set OpenAI API Key**:
   ```bash
   railway variables set OPENAI_API_KEY=your-api-key-here
   ```

5. **Get the public URL**:
   ```bash
   railway domain
   ```

## Option 2: Deploy to Render

1. **Create a Render account** at https://render.com

2. **Connect your GitHub repository** or create a Web Service

3. **Set environment variables**:
   - `OPENAI_API_KEY`: your OpenAI API key
   - `PORT`: 3001

4. **Deploy** from the Render dashboard

## Option 3: Deploy to Vercel (Serverless Functions)

1. Create a `api/` directory in your Vercel project
2. Convert the Express routes to Vercel serverless functions
3. Set `OPENAI_API_KEY` in Vercel environment variables

## After Deployment

Once you have the backend URL (e.g., `https://your-backend.railway.app`):

1. **Update the frontend**:
   Edit `src/services/api.ts` and update `VITE_TEST_API_URL`:
   ```typescript
   const API_BASE_URL = TEST_MODE
     ? (import.meta.env.VITE_TEST_API_URL || 'https://your-backend.railway.app')
     : (import.meta.env.VITE_API_URL || 'https://your-backend.railway.app');
   ```

2. **Set the environment variable**:
   - For deployment: `VITE_TEST_API_URL=https://your-backend.railway.app`

3. **Rebuild and redeploy the frontend**

## Current Backend Status

The backend code is ready at:
- `/workspace/prysm-test/server/index.js`
- Uses `OPENAI_API_KEY` from environment (never exposed to frontend)
- Endpoint: `POST /api/analyze`
- Health check: `GET /api/health`

## Testing the Backend

To test locally:
```bash
cd /workspace/prysm-test/server
node index.js
```

Then:
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "q1": "Profesional y sofisticada",
      "q2": "Reloj de arena",
      "q3": "Medio",
      "q4": ["Negro", "Gris", "Azul marino"],
      "q5": "Oro",
      "q6": ["Clásico"],
      "q7": ["Oficina", "Citas"],
      "q8": "Woman in Charge"
    }
  }'
```
