# VAANI — AI Voice Agent Web App

Vaani phones the people you love, has a real conversation, and tells you how they're doing — so a busy week never turns into a quiet month. Always honest about being an AI. Always on your behalf.

---

## Supabase Database Setup Instructions

Follow these exact steps to run the SQL migration in your Supabase project:

1. **Log in to Supabase**:
   Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard) and open your project.

2. **Open the SQL Editor**:
   In the left sidebar menu, click on the **SQL Editor** tab (the `>_` icon).

3. **Create a New Query**:
   Click **+ New Query** at the top of the SQL Editor.

4. **Paste the Migration Script**:
   Open [`supabase/migrations/001_init.sql`](./supabase/migrations/001_init.sql) in this repository, copy the entire contents, and paste them into the SQL Editor input area.
   Next, run [`supabase/migrations/002_demo.sql`](./supabase/migrations/002_demo.sql) to add the `is_demo` column to `calls`.

5. **Run the Script**:
   Click the green **Run** button (or press `Cmd + Enter` / `Ctrl + Enter`).
   You should see `Success. No rows returned` in the output pane.

6. **Verify Tables and Auth Settings**:
   - Go to **Table Editor** in the left sidebar and confirm that all 5 tables are created:
     - `profiles` (with `onboarded` column)
     - `people`
     - `calls` (with `is_demo` column)
     - `call_events`
     - `memories`
   - Go to **Authentication -> Providers -> Email** and ensure Email provider is enabled.
   - Go to **Authentication -> Providers -> Anonymous Sign-Ins** and toggle **Enable Anonymous Sign-Ins** to ON (required for guest mode).

7. **Configure Local Environment**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from **Project Settings -> API**.

8. **Seed Sample Data (Optional)**:
   Once signed up, you can seed realistic calls, memories, and schedule for your account:
   ```bash
   npm run seed -- your-email@example.com
   ```
