# 🌱 YOLO — Your Optimal Life Organisation

A 14-day AI-guided wellness reset platform that helps users lose weight, improve energy, and build long-term healthy habits through accountability, nutrition guidance, and progress tracking.

##🚀 YOLO App Demo

<p align="center">
  <img src="Demo.gif" width="800">
</p>


## 🔗 Live Demo

- 🚀 View Live App — https://yolo-app-six.vercel.app/
- 📂 GitHub Repository

## 📋 Table of Contents

- Problem Understanding
- Product Concept
- Core Features
- User Flow
- Technical Design
- MVP Decisions
- Prototype
- Setup Guide
- API Reference
- Project Structure

## 🧠 Part 1 — Problem Understanding
**Why do most people fail to stay consistent with health goals?**
Most people fail not because they lack knowledge — they fail because programs are not flexible enough to fit real life. Three core psychological problems drive this:
1. **Decision Fatigue**
   - Making dozens of food decisions every day drains willpower. By evening, people default to convenience food because choosing healthy options requires mental energy they've already spent. The solution is reducing decisions, not adding more tracking complexity.
2. **The Forbidden Food Effect**
   - Rigid diet plans trigger psychological restriction. When foods are labeled "banned," cravings intensify. This leads to binge eating, guilt, and abandoning the plan entirely within 2–3 weeks.
3. **Invisible Progress**
   - Fitness progress is slow. The scale doesn't move daily. Without visible wins, motivation collapses after the first bad day. People need feedback loops that show progress beyond just weight.
Biggest accountability and tracking problems:
- No one notices when you stop — quitting is silent and easy.
- Tracking feels like homework — manual calorie logging is tedious and inaccurate.
- Generic advice doesn't fit — "eat healthy" means nothing without personalization.
- No consequence for skipping — streak-breaking is invisible until habits are lost.

## 💡 Part 2 — Product Concept
**What is YOLO?**
YOLO is a web-based AI wellness coach that guides users through a structured 14-day habit reset. It combines daily habit tracking, AI-generated meal plans, and a personalized nutrition assistant to create a behavior change system — not just another calorie tracker.
**Who uses it?**
Indian adults aged 22–40 who have tried and quit health apps before. People who want structure without rigidity, and accountability without judgment.
**How it helps users stay consistent:**
| Problem | YOLO's Solution |
|---|---|
| Decision fatigue | AI generates a complete daily meal plan — no thinking required |
| Tracking friction | One-tap habit check-ins and meal log-from-plan feature |
| No accountability | Streak system, consistency score, and daily AI check-ins |
| Generic advice | AI reads real user data from database before every response |
| Invisible progress | 14-day visual timeline, consistency percentage, streak counter |
| Rigid plans | Replace any meal with available ingredients via AI |
 
# ⚙️ Part 3 — Core Features

## 1. 🧭 Intelligent Onboarding
Multi-step wizard collecting age, gender, weight, height, activity level, diet preferences, and health goals. Uses the Mifflin-St Jeor BMR formula to automatically calculate personalized calorie and protein targets — no manual input required.

## 2. ✅ Daily Habit Check-in System
Five core habits tracked daily:
- Meal logging
- Water intake
- 30-minute workout
- Step goal
- Sleep

Each check-in saves to MongoDB instantly. Streak counter and consistency percentage update in real time as habits are completed.

**How it solves the problem:** Small daily actions build consistency through reinforcement. The streak system creates accountability through loss aversion — breaking a streak feels costly.

## 3. 🤖 AI-Powered Daily Meal Plan
Groq Llama 3.3 generates a complete breakfast/lunch/dinner/snack plan personalized to the user's calorie target, protein goal, diet preference, and program day. Plans are cached in MongoDB — generated once per day, served instantly on every subsequent load.

**How it helps:** Eliminates decision fatigue entirely. User wakes up knowing exactly what to eat.

## 4. ↻ Meal Replacement System
If a user doesn't have the planned ingredients, they type what they have available and the AI generates a replacement meal matching the original's calorie and protein targets. Original meal shown crossed out, replacement shown in green — instant visual feedback.

**How it helps:** Removes the "I don't have that food" excuse that causes people to abandon plans.

## 5. 🥗 Meal Logger with Limits
Users log meals with calories and protein. A circular SVG ring shows daily calorie consumption as a percentage. Backend enforces a hard block at 120% of daily target and shows yellow warnings at 110% — prevents accidental overconsumption.

## 6. 📅 14-Day Navigation
Users can view any day in their program — past days show logged history in read-only mode, future days show pre-generated meal plan previews. Dashboard auto-advances at midnight via a 60-second interval check with no page refresh required.

## 7. 💬 Personalized AI Nutrition Assistant
Before every AI response, the backend fetches the user's real data from MongoDB — habits completed, calories consumed, protein remaining, today's meals, program day — and injects it into the system prompt. The AI responds with specific, data-driven advice, not generic recommendations.
> Example: Instead of "eat more protein," the AI says: "You've had 34g protein today and need 86g more. Add 2 eggs to your dinner — that's 12g with only 160 calories, keeping you under your 1,680 kcal target." 

## 8. 📊 Program Progress Tracker
14-day visual dot grid showing:
- Completed days (green)
- Today (highlighted)
- Upcoming days (faded)

the metric for consistency percentage is calculated proportionally — e.g., if 3 of 5 habits are done in a day (60%), this value moves live as users check off habits throughout the day.

# Part 4 — User Flow

1. User visits app for the first time
   
2. Welcome screen — "Let's Get Started"
   
3. Onboarding Step 1 — Name, email, age, gender
   
4. Onboarding Step 2 — Height, weight, goal weight, activity level
   
5. Onboarding Step 3 — Health goals, diet preference, allergies, meal schedule
   
6. System calculates calorie + protein targets using BMR formula
   
7. Account created → User lands on Dashboard
   
8. Dashboard loads today's data from MongoDB:
   - Habit completion status for today
   - AI-generated meal plan for Day 1
   - Meal logs and calorie totals
   - Streak and consistency from habit history
   
9. Daily interaction loop:
   a. User checks off habits as completed → saves to MongoDB → streak updates
   b. User logs meals → calories calculated → ring updates → warnings if near limit
   c. User logs directly from plan (one tap) → meal saved automatically
   d. User replaces a planned meal → types available ingredients → AI generates swap
   e. User asks AI assistant anything → gets personalized response with their data
   
10. At end of program day:
    - App pre-generates next day's meal plan at 8pm (background call)
    - At midnight, dashboard auto-advances to next day
    
11. Returning user visits app:
    - Clicks "Log in" → enters email → back to dashboard instantly

# 🛠 Part 5 — Technical Design #
## Tech Stack ##
| Layer | Technology | Why |
| --- | --- | --- |
| Frontend | React 18 + Vite | Fast HMR, modern JSX, component architecture |
| Backend | Node.js + Express | JavaScript everywhere, lightweight REST API |
| Database | MongoDB Atlas | Document model fits nested habit/meal data, free tier |
| AI | Llama 3.3-70b14 | 400 free requests/day, fastest inference, no credit card |
| Deployment | Vercel + Render | Both free tier, auto-deploy from GitHub |
| Version Control | Git + GitHub | Conventional commits, full history |

# Backend Architecture

## Express Server (port 5000)
- Middleware: `cors()`, `express.json()`
- Routes:
  - `/api/users` → register, login, profile + currentDay
  - `/api/habits` → log check-ins, get today, streak + consistency
  - `/api/meals` → log meals, get today with totals, delete
  - `/api/plan` → generate (cache-first), retrieve with overrides
  - `/api/meal` → replace meal with available ingredients
  - `/api/ai` → chat with personalized DB context
- Models (Mongoose):
  - `User` → profile, targets, preferences
  - `HabitLog` → daily check-ins with score
  - `MealLog` → individual meal entries
  - `DailyPlan` → AI-generated plans (cached)
  - `MealOverride` → user-requested meal replacements
- Services:
  - `aiPlanner.js` → Groq prompt templates for plan + replacement

## Database Structure (MongoDB)
### users collection:
```json
{
  "_id": "ObjectId",
  "name": "Rahul",
  "email": "rahul@gmail.com",
  "age": 28,
  "gender": "male",
  "heightCm": 175,
  "currentWeightKg": 78,
  "goalWeightKg": 70,
  "activityLevel": "moderate",
  "calorieTarget":1680,
  "proteinTarget":140,
  "dietPreference": "vegetarian",
  "allergies": "none",
   ...
}
```
### habitlogs collection:
```json
{
"_id": "ObjectId",
"userId": "ObjectId",
"date": "2025-03-14",
"habits": {
    "meals": true,
    "water": true,
    "workout": false,
    "steps": true,
    "sleep": false
}


# Daily Plans Collection

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "dayNumber": 6,
  "meals": {
    "breakfast": { "foods": "Oats + banana + milk", "calories": 380, "protein": 18 },
    "lunch":     { "foods": "Dal + rice + sabzi",   "calories": 580, "protein": 32 },
    "dinner":    { "foods": "Roti + paneer + salad", "calories": 520, "protein": 38 },
    "snack":     { "foods": "Greek yogurt + nuts",   "calories": 200, "protein": 12 }
  },
  "totalCalories": 1680,
  "totalProtein": 100
}
```

## Key Technical Decisions

### Cache-first meal plan generation
- The AI plan is generated once per day and stored in MongoDB.
- Every subsequent request checks for an existing plan first — avoiding unnecessary Groq API calls and keeping the app fast.

### Optimistic UI updates
- Habit checkboxes update on screen immediately on click, then save to the backend in the background.
- If the save fails, the UI reverts.
- This makes the app feel instant.

### Upsert pattern for habit logs
- `findOneAndUpdate` with `upsert: true` ensures one log per user per day regardless of how many times the frontend sends updates.
- The compound index `{ userId, date }` enforces this at the database level.

### Context injection for AI
- Before every AI request, the backend runs three parallel MongoDB queries (user profile, today's habits, today's meals).
- This data is injected into the Groq system prompt, making every response data-specific rather than generic.

### Date-parameterized queries
- Both habit and meal routes accept an optional `?date=YYYY-MM-DD` query parameter.
- This single change enables the entire 14-day navigation feature without any new API routes.

## Scalability Considerations

- **Horizontal scaling:** Express is stateless — multiple instances can run behind a load balancer.
- **Database indexing:** Compound indexes on `(userId, date)` for O(1) lookups on daily queries.
- **AI quota management:** Cache-first pattern means AI is called maximum once per user per day for plans.
- **Connection pooling:** Mongoose manages MongoDB connection pool automatically.

---

## 🚀 Part 6 — MVP Decisions

### Features included in MVP (30-day launch)
d - *Feature* | *Reason*
daily habit check-in | Core behavior driver — the fundamental loop
aI meal plan generation | Solves decision fatigue — highest value feature
tMeal logging with calorie tracking | Proves the nutrition tracking concept 
pProgress dashboard (streak, consistency) | Keeps users engaged through visible feedback 
aI nutrition assistant | Differentiates from basic trackers — wow factor 
a4teen-day navigation | Low engineering effort, high product completeness 
mMeal replacement with ingredients | Removes the #1 reason people abandon meal plans 
**Features removed from MVP**:
social community feed | High complexity, low early-user value |
wWearable integrations (Fitbit, Apple Watch) | Requires device APIs, adds complexity without core value |
wPhoto food recognition | Computer vision adds latency and cost |
wWhatsApp reminders | Twilio integration adds complexity — push notifications first |
wPassword authentication | Email-only login sufficient for prototype validation |
wAdvanced workout generator | Out of scope for nutrition-focused |
d14-day reset

# MVP Prioritization Logic

The goal in 30 days is to prove the core hypothesis: *will users log habits and meals consistently when the AI removes decision friction?* Everything in the MVP serves this hypothesis. Features that are impressive but don't test the core behavior were cut.

## 🖥 Part 7 — Prototype & Working Demo

### What was built
- A fully functional full-stack web application with:
  - Real MongoDB database storing all user data persistently
  - Live AI responses from Groq Llama 3.3 with real user context
  - Complete 14-day program experience from onboarding to final day

### How to test the prototype
1. Visit the live URL above.
2. Complete the 4-screen onboarding (takes 2 minutes).
3. See your personalized meal plan generated by AI.
4. Check off habits and watch the streak counter update.
5. Log a meal from the plan with one tap.
6. Click "Replace meal" and type ingredients you have.
7. Ask the AI assistant anything — notice it knows your calories and habits.

# 💻 Local Setup

## Prerequisites

- Node.js v18+
- Git
- MongoDB Atlas account (free) — [mongodb.com/atlas](https://mongodb.com/atlas)
- Groq API key (free) — [console.groq.com](https://console.groq.com)

## Installation

```bash
# Clone the repository
git clone https://github.com/Ankitsgit/yolo-app.git
cd yolo-app
```

### Install backend dependencies
```bash
cd backend
npm install
```

### Install frontend dependencies
```bash
cd ../frontend
npm install
```

## Environment Variables
Create `backend/.env`:
```
envMONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yolodb?retryWrites=true&w=majority
gROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=5000
```
Create `frontend/.env`:
```
envVITE_API_URL=http://localhost:5000
```

## Running Locally
- **Terminal 1 — Backend (runs on port 5000)**
```bash
dd backend
yarn run dev # or npm run dev if using npm instead of yarn 
```
- **Terminal 2 — Frontend (runs on port 3000)**
```bash
dd frontend
yarn run dev # or npm run dev if using npm instead of yarn 
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📡 API Reference
| Method | Endpoint | Description |
|---------|--------------|------------------------------------------------|
| POST | /api/users/register | Create new user with personalized targets |
| POST | /api/users/login | Find existing user by email |
| GET | /api/users/:id | Get profile + current program day |
| POST | /api/habits/log | Save daily habit check-ins |
| GET | /api/habits/:userId/today | Get today's habits (accepts ?date=) |
| GET | /api/habits/:userId/streak | Calculate streak + consistency % |
| POST | /api/meals/log | Log a meal with calorie validation |
| GET | /api/meals/:userId/today | Get today's meals + totals (accepts ?date=) |
| DELETE | /api/meals/:mealId | Remove a meal entry |
| POST | /api/plan/generate | Generate or retrieve cached daily plan |
| GET | /api/plan/:userId/:dayNumber | Get plan with meal overrides merged |
| POST | /api/meal/replace | Generate ingredient-based meal replacement |
| POST | /api/ai/chat | Chat with personalized AI assistant |

# Project Structure

**yolo-app/**

## backend/
- `config/`
  - `db.js` — MongoDB Atlas connection
- `models/`
  - `User.js` — User schema with BMR fields
  - `HabitLog.js` — Daily habit check-ins
  - `MealLog.js` — Individual meal entries
  - `DailyPlan.js` — AI-generated meal plans (cached)
  - `MealOverride.js` — User meal replacements
- `routes/`
  - `users.js` — Auth routes
  - `habits.js` — Habit tracking + streaks
  - `meals.js` — Meal logging + limits
  - `plan.js` — Plan generation + retrieval
  - `mealReplace.js` — AI meal replacement
  - `ai.js` — Chat with context injection
- `services/`
  - `aiPlanner.js` — Groq prompt templates
- `.env` — Secret keys (not in repo)
- `.gitignore`
- `package.json`
- `server.js` — Express entry point

## frontend/
- `public/`
  - `hero.png` — Welcome screen image
- `src/`
  - `components/`
    - `HabitTracker.jsx` — Daily habits with animations
    - `MealLogger.jsx` — Meal log with calorie ring
    - `AIAssistant.jsx` — Chat interface
    - `DailyPlan.jsx` — AI meal plan + replace
    - `ProgramProgress.jsx` — 14-day progress tracker
    - `DayNavigator.jsx` — Day selection pills
  - `pages/`
    - `Onboarding.jsx` — 4-screen wizard.
    - `'Auth.jsx'`— Login for returning users.
    - `'Dashboard.jsx'— Main app screen.
  - `'services/'`
    - `'api.js'— All backend API calls.
  - `'App.jsx'— Root routing.
  - `'main.jsx'— Vite entry point.
  - `'index.css'— Global styles.
- `.env’
does not include in repo, but contains frontend env vars.
does not include in repo, but contains frontend env vars.

# Technical Skills and Code Quality

- Modular architecture — routes, models, services separated by concern
- Mongoose schemas with validation, enums, compound indexes, and transforms
- Async/await throughout with proper try/catch error handling
- Conventional commits (feat/fix/chore/docs) with descriptive messages
- Environment variables for all secrets — never committed to Git

# Problem-Solving Ability

- Cache-first AI plan generation solves API quota problem
- Upsert pattern solves duplicate daily log problem
- Date-parameterized queries solve day navigation without new routes
- Context injection solves generic AI advice problem
- Optimistic UI updates solve perceived latency problem

# Product Thinking

- BMR auto-calculation removes friction from onboarding
- Meal replacement removes the #1 abandonment trigger
- Calorie limit enforcement prevents accidental overconsumption
- Pre-generation at 8pm means next day plan is instant
- Consistency tracks proportionally so it moves live — not just at day end

# Simplicity and Practicality

total stack — MongoDB Atlas + Groq + Vercel + Render**
- Zero paid dependencies 
- Single codebase, clear folder structure 
- New developer can set up in under 10 minutes with the guide above 
 
# Creativity and Clarity 
 - Indian food suggestions in AI responses (dal, roti, sabzi, idli)
 - Warm Precision design language matching onboarding to dashboard 
 - Day navigation lets users preview future days and review past ones 
 - Perfect day celebration banner — positive reinforcement 
 - Midnight auto-advance — no manual refresh ever needed 
 
## 🔮 Future Roadmap 
 - JWT authentication — replace localStorage with secure token-based auth 
 - WhatsApp reminders — Twilio integration for daily habit nudges 
 - Push notifications — browser notifications for meal and workout reminders 
 - 3-month and 6-month programs — extend beyond 14 days 
 - Wearable integration — sync steps from Fitbit / Apple Health 
 - Coach dashboard — nutrition expert sees all users' progress, flags dropouts 
 - Photo food logging — camera-based meal recognition 
 
## 👤 Author 
Ankit Shukla

Built with ❤️ using React, Node.js, MongoDB, and Groq AI.


