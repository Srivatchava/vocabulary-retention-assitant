- about the project
    
    # Project Context — Vocabulary Retention Assistant
    
    **Problem:**
    People working in technical fields (especially AI/software development) frequently encounter unfamiliar words while reading documentation, articles, or LLM-generated content. Manually noting these words and reviewing them later is tedious, and traditional flashcard tools are often ignored or forgotten over time, so vocabulary that could improve reading speed and comprehension is lost.
    
    **Solution:**
    A web application that lets users quickly save new words they encounter (just the word, with optional context), automatically resolves the correct meaning using AI (handling ambiguous words by picking the sense that fits the given context), and auto-organizes words into categories without requiring manual tagging. Each day, the app generates short AI-written practice paragraphs that naturally use the user's saved words, letting them test recall by clicking on words to reveal meanings and self-rating only the words they actually looked up. A lightweight spaced-repetition system — driven by simple practice/forgotten counters rather than a rigid algorithm — ensures weaker words resurface more often, while daily email reminders help maintain consistency.
    
    **Target user:**
    Developers, AI practitioners, students, and technical readers who regularly encounter new terminology and want a low-friction way to build vocabulary retention into their daily routine, without the overhead of manual flashcard maintenance.
    
    **Core value proposition:**
    Unlike generic flashcard apps, this tool captures vocabulary passively at the point of encounter, minimizes user effort (no categorization, no manual scheduling), and uses AI specifically where it adds real value — natural-language practice generation and meaning disambiguation — while keeping the core spaced-repetition logic simple, transparent, and fully under the app's control.
    
    **Scope for prototype (6–9 hours):**
    Core loop — word add with AI meaning/category, daily 3-paragraph AI-generated practice, click-to-reveal + rate, familiarity tracking, dashboard, and basic email reminders — is fully buildable; deeper analytics, category cleanup/merging, and advanced SRS algorithms are reasonable stretch/postponed items.
    
- plan of the developement
    
    # Vocabulary Retention Assistant — Full Development Plan
    
    **Stack confirmed:** React + Tailwind CSS (frontend) | Express.js + Node.js (backend) | MySQL (database) | Sequelize or Prisma (ORM) | Claude/OpenAI API (AI)
    
    ---
    
    ## Database Schema (MySQL, via ORM models)
    
    ### **users**
    
    | Column | Type | Notes |
    | --- | --- | --- |
    | id | INT, PK, AUTO_INCREMENT |  |
    | email | VARCHAR(255), UNIQUE |  |
    | password_hash | VARCHAR(255) |  |
    | streak_count | INT, DEFAULT 0 |  |
    | last_login | DATETIME |  |
    | created_at | DATETIME |  |
    
    ### **categories**
    
    | Column | Type | Notes |
    | --- | --- | --- |
    | id | INT, PK, AUTO_INCREMENT |  |
    | user_id | INT, FK → users.id |  |
    | name | VARCHAR(100) |  |
    | created_at | DATETIME |  |
    
    ### **words**
    
    | Column | Type | Notes |
    | --- | --- | --- |
    | id | INT, PK, AUTO_INCREMENT |  |
    | user_id | INT, FK → users.id |  |
    | category_id | INT, FK → categories.id |  |
    | word_text | VARCHAR(100) |  |
    | context | VARCHAR(150), NULLABLE | user-entered, one line |
    | meaning | TEXT | confirmed meaning |
    | times_practiced | INT, DEFAULT 0 |  |
    | times_forgotten | INT, DEFAULT 0 |  |
    | familiarity_level | ENUM('new','learning','familiar','mastered'), DEFAULT 'new' |  |
    | last_practiced_date | DATE, NULLABLE |  |
    | created_at | DATETIME |  |
    
    ### **sessions**
    
    | Column | Type | Notes |
    | --- | --- | --- |
    | id | INT, PK, AUTO_INCREMENT |  |
    | user_id | INT, FK → users.id |  |
    | session_date | DATE |  |
    | paragraphs | JSON | array of 3 paragraph texts |
    | words_included | JSON | array of word_ids used, mapped per paragraph |
    | completion_status | BOOLEAN, DEFAULT false |  |
    | created_at | DATETIME |  |
    
    ### **reminders**
    
    | Column | Type | Notes |
    | --- | --- | --- |
    | id | INT, PK, AUTO_INCREMENT |  |
    | user_id | INT, FK → users.id |  |
    | reminder_date | DATE |  |
    | reminder_sent | BOOLEAN, DEFAULT false |  |
    | practice_completed | BOOLEAN, DEFAULT false |  |
    
    **Relationships:** users 1→N categories, users 1→N words, categories 1→N words, users 1→N sessions, users 1→N reminders.
    
    ---
    
    ## Development Phases (each independently reviewable/runnable)
    
    ### **Phase 1 — Project Setup & DB Connection**
    
    - Initialize React (Vite) + Tailwind frontend; initialize Express + Node backend.
    - Set up ORM (Sequelize/Prisma), connect to local MySQL, define all 5 models above.
    - Run migrations, verify tables are created correctly.
    - **Check:** DB connects, tables exist, can insert/query a dummy row via a test script.
    
    ### **Phase 2 — User Authentication**
    
    - Backend: signup/login routes, password hashing, JWT issue/verify middleware.
    - Frontend: signup/login forms, store token, protected route wrapper.
    - **Check:** Can create a user, log in, get a valid token, access a protected test route.
    
    ### **Phase 3 — Word Add + AI Meaning/Category (core AI integration)**
    
    - Backend: POST /words route — takes word_text + optional context, calls AI API for meaning(s) + category assignment (passing existing categories), creates category if needed, saves word.
    - Frontend: "Add Word" form, shows meaning confirmation UI if multiple meanings returned.
    - **Check:** Add a word, verify meaning + category auto-populate correctly in DB; test with an ambiguous word and a context-given word separately.
    
    ### **Phase 4 — Daily Session Generation (selection logic + AI paragraphs)**
    
    - Backend: POST /session/generate — selects 3 categories (random if >3), selects words per category by familiarity, calls AI once for 3 paragraphs, saves session.
    - Also: GET /session/today — returns existing session if already generated that day.
    - **Check:** Generate a session, verify 3 paragraphs are saved with correct word lists; reload doesn't regenerate.
    
    ### **Phase 5 — Interactive Practice View + Rating**
    
    - Frontend: Render paragraphs with clickable words → shows meaning on click, shows "Got it!"/"Still learning" buttons only for clicked words.
    - Backend: PATCH /words/:id/rate — updates times_practiced, times_forgotten, familiarity_level.
    - **Check:** Click a word, meaning shows, rate it, confirm counters/familiarity update correctly in DB.
    
    ### **Phase 6— Session Completion + Streak**
    
    - Backend: mark session completion_status = true when all clicked words are rated (or user clicks "Finish"); update user streak_count.
    - **Check:** Complete a session, verify completion flag and streak update.
    
    ### **Phase 7— Dashboard (Read Operations)**
    
    - Backend: GET /words (with category, familiarity), GET /categories.
    - Frontend: Dashboard page — list words, filter by category/familiarity level.
    - **Check:** Words display correctly with category names and familiarity levels; filters work.
    
    ### **Phase 8 — Email Reminders**
    
    - Backend: cron job (node-cron) — daily, checks reminders table, sends email (Nodemailer + Resend/SendGrid) to users with practice_completed = false.
    - **Check:** Manually trigger the cron function, verify email sends and reminder record updates.
    
    ### **Phase 9 — Practice History & Stats**
    
    - Backend: GET /sessions/history, GET /stats (mastered count, learning count, streak, category breakdown).
    - Frontend: History page + stats summary on dashboard.
    - **Check:** Past sessions list correctly; stats numbers match actual DB data.
    
    ### **Phase 10 — Polish & Edge Cases**
    
    - Handle: <3 categories, <5 words in a category, AI failure fallback (reuse previous paragraphs), duplicate word check.
    - Final UI pass with Tailwind styling.
    - **Check:** Test each edge case manually (new user with 1 word, AI call failure simulation, duplicate word add).
    
    ---
    
    Each phase produces a runnable, testable slice — you can demo Phase 3 alone (AI word add) or Phase 5 alone (paragraph generation) without needing later phases built yet, which is useful if time runs short and you need to stop at a working subset.