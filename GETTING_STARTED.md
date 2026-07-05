# GAINZ — Complete Beginner Setup Guide

Good news: this works almost exactly like your last app —
**download folder → GitHub → Vercel → done.** The only additions are one
free API key (for reading food photos) and one free database (to store
everyone's accounts and logs, since this version supports multiple
people). No terminal, no coding required. About 20 minutes.

---

## Step 1: Get a free Gemini API key

This is what "reads" food photos and estimates calories. It's Google's AI,
and it's free — no credit card needed.

1. Go to **https://aistudio.google.com/apikey**
2. Sign in with any Google account.
3. Click **Create API Key**.
4. Copy the key that appears (starts with `AIza...`). Paste it somewhere
   safe for a minute — like a Notes app — you'll need it in Step 3.

---

## Step 2: Put the code on GitHub

1. Unzip the file you downloaded. You'll get a folder — rename it to
   `gainz` if you like.
2. Go to **https://github.com** and sign up (free) if you don't have an
   account.
3. Click the **+** icon in the top-right corner → **New repository**.
4. Name it `gainz`. Choose **Private** or **Public**, doesn't matter.
   Leave every checkbox unchecked. Click **Create repository**.
5. On the next page, look for a small link that says
   **"uploading an existing file"** (it's in the paragraph of text under
   the big command boxes — click that link, not the commands).
6. Open your `gainz` folder, select everything inside it (Ctrl+A on
   Windows, Cmd+A on Mac), and drag those files into the GitHub upload box
   — drag what's *inside* the folder, not the folder itself.
7. Scroll down, click **Commit changes**.
8. Wait for the upload to finish, then refresh the page — you should see
   all your files listed on GitHub.

---

## Step 3: Deploy to Vercel

1. Go to **https://vercel.com** and click **Sign Up** → **Continue with
   GitHub**. This links the two accounts.
2. Click **Add New...** → **Project**.
3. Find your `gainz` repo in the list and click **Import**.
4. **Don't click Deploy yet.** First expand **Environment Variables** and
   add these two (paste the name on the left, value on the right, click
   **Add** after each):
   - `NEXTAUTH_SECRET` → go to
     **https://generate-secret.vercel.app/32** in a new tab, copy the
     random string it shows you, paste it as the value.
   - `GEMINI_API_KEY` → the key you copied in Step 1.
5. Now click **Deploy**. It'll fail the first time — that's expected,
   because there's no database yet. That's fine, keep going.

---

## Step 4: Add a free database

1. Once the deploy finishes (even though it failed), you'll land on your
   project's dashboard. Click the **Storage** tab at the top.
2. Click **Create Database**, choose **Postgres** (it'll be powered by a
   provider like Neon — that's normal, and still free).
3. Follow the prompts, accepting the defaults, and click **Connect** to
   link it to your `gainz` project. This automatically creates the
   `DATABASE_URL` environment variable for you — you don't need to copy
   or paste any connection string yourself.

---

## Step 5: Fix the URL and redeploy

1. Go to your project's **Settings** → **Environment Variables**.
2. Add one more: `NEXTAUTH_URL` → go to the **Deployments** tab first,
   copy your project's live URL (something like
   `https://gainz-yourname.vercel.app`), then come back and paste it as
   the value (no trailing slash).
3. Go to **Deployments**, click the **•••** menu on the most recent one,
   click **Redeploy**.
4. Wait for it to finish — this time it'll succeed, since the database
   and URL are both set up now.

---

## You're done

Open your live URL. Sign up, go through onboarding, try logging a food
photo. Send the link to friends — everyone who signs up gets their own
account, their own workout split, and their own food log.

## If something goes wrong

- Click **Deployments** → click the failed one → view the build log to
  see the actual error message.
- **Build fails mentioning "DATABASE_URL"** → you deployed before adding
  the database in Step 4. Just redeploy after Step 4 is done.
- **Login redirects in a loop / errors out** → double-check
  `NEXTAUTH_URL` in Settings matches your real URL exactly, then redeploy.
- **Food photo scan fails or returns nothing** → double check
  `GEMINI_API_KEY` was pasted correctly with no extra spaces. Google's
  free tier has a daily limit — if you've scanned a lot of photos in one
  day, wait until tomorrow.
- **Want to test changes on your own computer before they go live?** That
  needs Node.js and a terminal — see `LOCAL_DEV.md` for that (totally
  optional, only for tinkering with the code).
