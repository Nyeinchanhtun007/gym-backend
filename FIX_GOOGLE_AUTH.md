# How to Fix "Access blocked: Authorization Error" (Error 401: invalid_client)

The error you are seeing means the `GOOGLE_CLIENT_ID` in your backend `.env` file is either incorrect, deleted, or not registered in the Google Cloud Console.

To fix this, you need to generate a valid **Google Client ID** and **Client Secret**.

## Step 1: Go to Google Cloud Console
1.  Open [Google Cloud Console](https://console.cloud.google.com/).
2.  Sign in with your Google account.
3.  **Create a New Project** (or select an existing one):
    *   Click on the project dropdown at the top left.
    *   Click **New Project**.
    *   Name it `YGN Gym` (or similar) and click **Create**.

## Step 2: Configure OAuth Consent Screen
1.  In the left sidebar, go to **APIs & Services** > **OAuth consent screen**.
2.  Select **External** (for testing) and click **Create**.
3.  Fill in the required fields:
    *   **App Name**: `YGN Gym`
    *   **User Support Email**: Your email.
    *   **Developer Contact Information**: Your email.
4.  Click **Save and Continue** (you can skip Scopes and Test Users for now, or add yourself as a test user).

## Step 3: Create Credentials
1.  In the left sidebar, click **Credentials**.
2.  Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3.  **Application Type**: Select **Web application**.
4.  **Name**: `YGN Gym Backend`.
5.  **Authorized JavaScript origins**:
    *   Add `http://localhost:3000`
    *   Add `http://localhost:5173`
6.  **Authorized redirect URIs** (Crucial Step):
    *   Add `http://localhost:3000/auth/google/callback`
7.  Click **Create**.

## Step 4: Update Your `.env` File
1.  Copy the **Client ID** and **Client Secret** from the popup.
2.  Open your backend `.env` file: `c:\Users\Dell\Desktop\ygn-gym\backend-main\.env`
3.  Replace the existing values with the new ones:

```env
GOOGLE_CLIENT_ID=your-new-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-new-client-secret
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
```

4.  **Restart your backend server**:
    *   Stop the terminal running the backend (`Ctrl+C`).
    *   Run `npm run dev` again.

## Step 5: Test Login
1.  Go to your frontend login page.
2.  Click "Sign in with Google".
3.  It should now direct you to the Google permission screen instead of the error page.
