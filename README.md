🃏 DuelUP

Challenge. Answer. Dominate.

DuelUP is a real-time multiplayer educational card game where two players face off in a fast-paced quiz battle.

Instead of simply answering questions from a traditional quiz, players use cards as weapons: choose a card from your hand, reveal the question, and challenge your opponent to answer before time runs out.

The project combines competitive gaming mechanics, educational content and real-time multiplayer into a compact web application.

🎮 How it works
        PLAYER A
           │
           │ Challenge
           ▼
     ┌─────────────┐
     │ Game Request│
     └──────┬──────┘
            │
            │ Accept
            ▼
     ┌─────────────┐
     │     GAME    │
     └──────┬──────┘
            │
            ▼
      🃏 🃏 🃏 🃏 🃏 🃏
            │
            │ Select card
            ▼
       ┌───────────┐
       │  QUESTION │
       └─────┬─────┘
             │
             │ 30 seconds
             ▼
        ┌──────────┐
        │  ANSWER  │
        └────┬─────┘
             │
        ┌────┴────┐
        ▼         ▼
      ✓ Correct   ✕ Wrong
        │         │
        └────┬────┘
             ▼
        Next Turn
             │
             ▼
        🏆 Winner
The basic game loop
A player sees other active players from Home.
The player challenges an opponent.
The opponent receives the challenge in real time.
The opponent accepts or rejects it.
If accepted, DuelUP creates a game.
Six questions are randomly assigned to the game.
The starting player is selected.
Six cards are displayed face-down.
The active player selects a card.
The card is revealed and its question appears.
The opponent has 30 seconds to answer.
The answer is evaluated.
The turn passes to the other player.
After the six cards are used, the score is calculated.
If there is a tie, a sudden-death round determines the winner.
The winner receives XP and the game is finalized.
✨ Features
👤 Authentication
Email/password authentication
User registration
Google OAuth
Protected routes
Public routes
User profiles
XP system

Authentication is handled through Supabase Auth.

⚔️ Real-time challenges

Players can challenge other active players directly from Home.

Challenge states:

pendiente
aceptado
rechazado
expirado

Supabase Realtime is used so the receiving player doesn't need to refresh the page to see a new challenge.

🃏 Card-based gameplay

The core gameplay is built around six hidden cards.

Each card represents a question.

Initially:

🂠  🂠  🂠  🂠  🂠  🂠

The question remains hidden until the active player selects a card.

Then:

🂠
 ↓
QUESTION
 ↓
4 ANSWERS

This turns a traditional quiz into a competitive game.

⏱️ Timed answers

Once a question is revealed, the opponent has:

30 seconds

to answer.

The game records response time in milliseconds, allowing the system to determine who answered faster when required.

The frontend displays the countdown, while the backend/database remains the authority for validating the actual time limit.

🏆 Tie-break system

If both players finish with the same score, DuelUP enters a sudden-death round.

The rules are:

Both players receive the same question
                ↓
          10 seconds
                ↓
        ┌───────┴───────┐
        │               │
     Correct          Wrong
        │               │
        ▼               ▼
      Winner          Loser

If both answer correctly:

The player with the lowest response time wins.

If both answer incorrectly or neither answers:

Another sudden-death question is played.

🧠 Question System

Questions are stored globally and can be reused across different games.

Available categories:

📖 Reading — lectura
🔢 Mathematics — matematicas
🇬🇧 English — ingles
🌎 General Knowledge — cultura general

Each question contains four possible answers, with one marked as correct.

The database separates:

questions
    │
    └── answers

from:

games
    │
    └── game_questions

This allows the same question to be used in multiple games without duplicating the original question.

🏗️ Architecture

DuelUP follows a simple layered frontend architecture:

┌───────────────┐
│   Component   │
└───────┬───────┘
        ↓
┌───────────────┐
│     Hook      │
└───────┬───────┘
        ↓
┌───────────────┐
│    Service    │
└───────┬───────┘
        ↓
┌───────────────┐
│    Supabase   │
└───────────────┘

The goal is to keep UI, state management and database operations separated without overengineering the project.

🛠️ Tech Stack
Frontend
Technology	Purpose
React	UI
Vite	Development/build tooling
React Router	Routing
Tailwind CSS	Styling
React Query	Server state/cache
React Hook Form	Forms
Zod	Validation
Lucide React	Icons
Motion	Animations
Sonner	Notifications
Backend / Infrastructure
Technology	Purpose
Supabase Auth	Authentication
PostgreSQL	Database
Supabase Realtime	Multiplayer synchronization
Row Level Security	Data protection

The visual direction aims for:

Gaming + Competition + Education + Premium Card Game

without relying on traditional casino clichés.

🗄️ Database

The main entities are:

profiles
    │
    ├── game_requests
    │
    └── games
           │
           ├── game_questions
           │       │
           │       └── questions
           │               │
           │               └── answers
           │
           └── game_answers

DuelUP uses Row Level Security (RLS) to protect game data.

Important security principles:

Users can only interact with games they belong to.
Players cannot modify another player's answers.
Players cannot arbitrarily change the game winner.
Players cannot select cards during another player's turn.
Answers cannot be submitted after the time limit.
The correct answer should not be exposed to the client before it is needed.
service_role is never exposed to the frontend.

Sensitive game operations can be handled through secure PostgreSQL functions/RPCs when atomicity is required.

📁 Project Structure

The frontend follows a modular structure similar to:

src/
├── components/
│   ├── ui/
│   ├── game/
│   ├── cards/
│   └── users/
│
├── layouts/
│   ├── AuthLayout.jsx
│   └── AppLayout.jsx
│
├── pages/
│   ├── Login/
│   ├── Register/
│   ├── Home/
│   ├── Games/
│   │   ├── Games.jsx
│   │   └── Game.jsx
│   ├── Profile/
│   └── Settings/
│
├── hooks/
│   ├── useAuth.js
│   ├── useProfile.js
│   ├── useGame.js
│   └── useRealtimeGame.js
│
├── services/
│   ├── auth.js
│   ├── games.js
│   ├── requests.js
│   └── questions.js
│
├── schemas/
│   ├── auth.js
│   └── profile.js
│
├── lib/
│   ├── supabase.js
│   └── queryClient.js
│
└── App.jsx

The exact structure may evolve as development continues, but the core principle remains:

UI
 ↓
Hooks
 ↓
Services
 ↓
Supabase
🚀 Getting Started
Requirements

Before running the project, make sure you have:

Node.js
npm
A Supabase project
Installation

Clone the repository:

git clone <repository-url>

Enter the project:

cd duelUP

Install dependencies:

npm install
Environment variables

Create a .env file:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

⚠️ Never expose the Supabase service_role key in the frontend.

Run development server
npm run dev

Then open the URL shown by Vite.

Build

To verify the production build:

npm run build


A game moves through several states:

┌────────────┐
│  EN ESPERA │
└─────┬──────┘
      ↓
┌────────────┐
│   ACTIVO   │
└─────┬──────┘
      ↓
┌────────────┐
│   TURNOS   │
└─────┬──────┘
      ↓
┌────────────┐
│ 6 PREGUNTAS│
└─────┬──────┘
      ↓
 ┌────┴─────┐
 ↓          ↓
WINNER     TIE
 ↓          ↓
 │       SUDDEN DEATH
 │          ↓
 └──────┬───┘
        ↓
┌────────────┐
│ FINALIZADO │
└────────────┘
💡 Why DuelUP?

Traditional educational quizzes usually look like:

Question → Answer → Next question.

DuelUP tries something different:

Choose your card → challenge your opponent → answer under pressure → take the next turn.

The goal is to make learning feel less like an exam and more like a competitive game.

📌 Project Goals

DuelUP is designed as a compact but technically meaningful project that demonstrates:

React architecture
Real-time multiplayer
PostgreSQL relational modeling
Supabase
Authentication
OAuth
RLS
Realtime synchronization
Server-authoritative game logic
Race-condition handling
State management
Form validation
Responsive UI
Game mechanics
Secure client/server interaction

The project intentionally avoids unnecessary complexity while still solving real multiplayer problems.

🤝 Contributing

This project is currently being developed as a personal project.

If you find a bug or have an idea for improving DuelUP, feel free to open an issue or submit a pull request.
