# Running GAINZ locally (optional)

You don't need this to deploy the app — see `GETTING_STARTED.md` for that.
This is only if you want to run it on your own computer to test changes
before pushing them live.

## Requirements

- **Node.js** — download from https://nodejs.org (the "LTS" button)
- A terminal (Mac: Terminal app. Windows: PowerShell)

## Steps

1. Open a terminal and navigate into the project folder:
   ```
   cd path/to/gainz
   ```
   (Type `cd ` then drag the folder into the terminal window to
   auto-fill the path.)

2. Copy the example environment file:
   ```
   cp .env.example .env
   ```

3. Open `.env` in a text editor and fill in:
   - `DATABASE_URL` — if you already deployed and added a database in
     Vercel, go to your Vercel project → Storage → click your database →
     find the connection string there and paste it here. Otherwise, sign
     up free at https://neon.tech, create a project, and copy the
     connection string it gives you.
   - `NEXTAUTH_SECRET` — any random string, or generate one at
     https://generate-secret.vercel.app/32
   - `NEXTAUTH_URL` — leave as `http://localhost:3000`
   - `GEMINI_API_KEY` — your key from https://aistudio.google.com/apikey

4. Install dependencies and set up the database tables:
   ```
   npm install
   npx prisma db push
   ```

5. Start the app:
   ```
   npm run dev
   ```

6. Open **http://localhost:3000** in your browser.

To stop the app, go back to the terminal and press `Ctrl + C`.

## Pushing changes live

If you edit code locally, upload the changed files to your GitHub repo
(via GitHub's website, or `git add . && git commit -m "update" && git push`
if you're comfortable with git) — Vercel automatically redeploys
whenever you push to the `main` branch.
