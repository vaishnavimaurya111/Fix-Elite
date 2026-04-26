# Deployment Instructions

I have separated your project into two distinct folders in the `deployment_ready` directory. Follow these steps to deploy each part.

---

## 1. Backend Deployment (Node.js)
**Folder**: `deployment_ready/backend`
**Recommended Platforms**: Render, Railway, or Heroku.

### Steps:
1.  **Environment Variables**: In your hosting dashboard, set the following variables:
    *   `MONGO_URI`: Your MongoDB Atlas connection string (see section 3).
    *   `JWT_SECRET`: A long random string.
    *   `PORT`: `5000` (or leave blank if the platform provides it).
    *   `CLIENT_URL`: The URL of your deployed frontend (e.g., `https://your-app.vercel.app`).
    *   `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`: Your Razorpay credentials.
    *   `OPENAI_API_KEY`: Your OpenAI API key.
2.  **Command**: Set the start command to `npm start`.

---

## 2. Frontend Deployment (React/Vite)
**Folder**: `deployment_ready/frontend`
**Recommended Platforms**: Vercel, Netlify, or AWS Amplify.

### Steps:
1.  **Environment Variables**: In your hosting dashboard, set:
    *   `VITE_API_URL`: The URL of your **deployed backend** (e.g., `https://your-backend.onrender.com`).
2.  **Build Command**: `npm run build`
3.  **Output Directory**: `dist`

---

## 3. Database Setup (MongoDB Atlas)
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2.  Create a new Cluster.
3.  Under "Database Access", create a user with a password.
4.  Under "Network Access", allow access from `0.0.0.0/0` (for deployment).
5.  Click "Connect" -> "Connect your application" and copy the connection string.
6.  Replace `<password>` with your actual database password in the string.

---

## 4. Local Testing
To test the separated folders locally:
*   **Backend**: `cd deployment_ready/backend && npm install && npm start`
*   **Frontend**: `cd deployment_ready/frontend && npm install && npm run dev`
