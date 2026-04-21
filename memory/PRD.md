# Aura — Mental Health AI Platform (PRD)

## Original Problem Statement
"Help me build frontend for the backend provided using React. Also, in Login/Signup, we are
authenticating using Firebase and also add an option of signing or logging in using Google."

Backend (user-provided): FastAPI Mental Health platform with Patient / Doctor / Admin roles,
Firebase auth, mood tracking, AI emotion journaling, PHQ-9/GAD-7 assessments, chatbot, risk
detection, analytics, and doctor appointment booking with admin approval.

## Architecture
- **Backend** (`/app/backend`): FastAPI + SQLAlchemy + SQLite. All routes under `/api`. Firebase
  Admin SDK verifies ID tokens from the frontend. `emergentintegrations` (GPT-4o-mini) powers
  the AI emotion classifier and the Aura chatbot.
- **Frontend** (`/app/frontend`): React + CRA + Tailwind + Shadcn UI. Firebase web SDK handles
  email/password + Google sign-in. Routes are role-aware via `ProtectedRoute`.

## User Personas
- **Patient** — tracks mood, journals, chats with Aura, takes assessments, books doctors.
- **Doctor** — registers with credentials; remains invisible until admin approves; sees own
  appointments once approved.
- **Admin** — approves/rejects doctors, monitors high-risk patients, oversees appointments.

## Implemented (Feb 2026 — initial MVP)
- Firebase Email/Password AND Google Sign-In (web popup)
- Role selection screen; role defaults to `null` on first login so new users *must* choose
- Patient: Dashboard (bento grid with risk banner, insights, mood, recent journals, CTAs),
  Mood Log (slider + emotion chips), Journal (+ AI emotion chip & confidence), Chat (context-
  aware Aura), Assessment wizard for PHQ-9 & GAD-7 (severity + helplines), Analytics
  (recharts line + pie), Book Appointment (doctor cards + calendar + slots), Appointments list
- Doctor: Registration form, Pending approval screen, Dashboard with upcoming/past visits
- Admin: Console with stats, pending doctors (approve/reject), all doctors, all users,
  high-risk monitor
- Earthy "Organic" design (Deep Forest Green + Terracotta + Sand) with Outfit/Manrope fonts,
  glass header, bento layouts, card hover motion, recharts analytics
- Backend endpoints: /api/user/{me,set-role}, /api/mood, /api/journal, /api/insights,
  /api/chat, /api/analytics, /api/risk, /api/assessment, /api/patient/profile,
  /api/doctor/{register,me,list}, /api/admin/{stats,doctors/pending,doctors,approve,
  reject,users,high-risk}, /api/appointments/{,patient,doctor,slots}

## Testing
- Backend: 22/22 pytest assertions pass
- Frontend: E2E for patient/doctor/admin flows pass (testing_agent_v3 iteration 1)
- Known limitation: Google Sign-In button tested for render only (requires real Google
  account interaction)

## Backlog (next)
- **P1** Patient profile page (age/gender/medical_history) — backend endpoint exists
- **P1** Doctor "My patients" list with risk context when viewing an appointment
- **P2** Admin cancel/reschedule appointments
- **P2** Email notification on doctor approval + appointment booking (Resend)
- **P2** Doctor image upload (currently URL input; migrate to object storage)
- **P2** Password reset flow (Firebase sendPasswordResetEmail)
- **P3** Localisation + theme switch (dark mode already tokenised)
