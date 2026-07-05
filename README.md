# GAINZ — Personal Training, Logged

**New to this?** Skip straight to [`GETTING_STARTED.md`](./GETTING_STARTED.md)
— a complete, no-terminal walkthrough to get this deployed and live.

A full multi-user fitness app: onboarding builds a personalized workout split
and calorie/macro targets, then two daily tabs (**Workout** and **Fuel**) track
progress. Food can be logged by photo (Gemini reads the picture and estimates
calories/macros) or manually. Everything is free to run — no paid API keys,
no paid database, no paid hosting.

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **NextAuth.js** — email/password accounts (so this works for you and friends,
  each person sees only their own data)
- **Prisma + PostgreSQL** — stores accounts, profiles, and daily logs (free
  tier via Vercel's Storage marketplace or Neon directly)
- **Google Gemini API** — reads food photos server-side, free tier, no
  credit card (your key never touches the browser)

## Deploying

See [`GETTING_STARTED.md`](./GETTING_STARTED.md) for the full walkthrough:
get a free Gemini key, upload the code to GitHub, import into Vercel, add
a free Postgres database from Vercel's Storage tab, deploy. The build
script (`prisma generate && prisma db push && next build`) creates your
database tables automatically — no manual database commands needed.

Want to test changes on your own machine first? See
[`LOCAL_DEV.md`](./LOCAL_DEV.md) (optional, requires Node.js + terminal).

## How it works

- **Onboarding** (`/onboarding`) asks age, sex, height, weight, goal
  (lose fat / cut / maintain / recomp / gain muscle / bulk), activity level,
  training days per week, and any other exercise you already do. It computes
  calorie and macro targets (Mifflin-St Jeor + activity multiplier + a
  goal-based adjustment) and generates a split — full body, upper/lower,
  or push/pull/legs depending on days per week.
- **Workout tab** shows the next day in your rotation, lets you check off
  each exercise, and a plate-stack progress bar fills in as you go. Skip a
  day and it just picks up where you left off next time you open it — no
  workout is lost.
- **Fuel tab** — tap "Scan Food Photo," and the photo is sent to Gemini,
  which estimates name/calories/protein/carbs/fat. You get an editable card
  to fix anything before it's added to your daily log. Manual entry is also
  available. A scoreboard bar shows today's totals against your targets.
- Everything is stored per-user in Postgres, so it persists across devices
  and sessions — not just in one browser.

## Customizing

- **Exercise pool / split logic**: `src/lib/workoutGenerator.ts` and
  `src/lib/exercises.ts`
- **Calorie/macro formula**: `src/lib/nutrition.ts`
- **Food-scan model or prompt**: `src/app/api/food/scan/route.ts`
- **Colors/fonts/visual style**: `tailwind.config.ts` and `src/app/globals.css`

## Notes

- Passwords are hashed with bcrypt before storage; nothing is stored in
  plain text.
- The Gemini API key stays server-side (used only inside the
  `/api/food/scan` route) — it's never sent to the browser.
- Everything here fits in free tiers: Vercel Hobby, a free Postgres
  database, and Gemini's free API quota. If you outgrow the free database
  storage limit or Gemini's daily request cap (unlikely for personal/
  friend use), that's the only point you'd ever pay anything.
