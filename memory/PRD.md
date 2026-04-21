# Aura — Mental Health AI Platform (PRD)

## Original Problem Statement
"Help me build frontend for the backend provided using React. Also, in Login/Signup, we are
authenticating using Firebase and also add an option of signing or logging in using Google."

Backend (user-provided): FastAPI Mental Health platform with Patient / Doctor / Admin roles,
Firebase auth, mood tracking, AI emotion journaling, PHQ-9/GAD-7 assessments, chatbot, risk
detection, analytics, and doctor appointment booking with admin approval.

## Architecture
- **Backend** (`/app/backend`): FastAPI + SQLAlchemy + SQLite. All routes under `/api`. Firebase
  Admin SDK verifies ID tokens. `emergentintegrations` (GPT-4o-mini) powers emotion classification
  and the Aura chatbot. Emergent **object storage** for doctor profile images.
- **Frontend** (`/app/frontend`): React + CRA + Tailwind + Shadcn UI. Firebase web SDK for
  email/password + Google sign-in + password reset. Role-aware routing via `ProtectedRoute`.

## User Personas
- **Patient** — tracks mood, journals, chats with Aura, takes assessments, books doctors, manages profile.
- **Doctor** — registers with credentials+uploaded avatar; invisible until admin-approved;
  sees own appointments and "My patients" list with risk context.
- **Admin** — approves/rejects doctors, monitors high-risk patients, manages (cancel/reschedule) appointments.

## Implemented
### Iteration 1 (Feb 2026)
- Firebase email/password + Google sign-in, role selection
- Patient: Dashboard, Mood Log, Journal (with AI emotion), Chat, Assessment wizard (PHQ-9, GAD-7),
  Analytics (recharts), Book Appointment, Appointments list
- Doctor: Registration, Pending screen, Dashboard
- Admin: Console with stats + pending doctors + users + high-risk tabs
- All 12 `/api/*` routers, Firebase JWT verification, emergentintegrations AI

### Iteration 2 (Feb 2026)
- **Patient Profile** page (age/gender/medical history) at `/patient/profile`
- **Doctor "My Patients"** with risk-sorted list at `/doctor/patients`
- **Doctor Appointments** tab at `/doctor/appointments`
- **Admin Appointments** tab: list + Cancel + Reschedule dialog
- **Firebase password reset** dialog from the sign-in form
- **Doctor profile image upload** via Emergent object storage (replaces URL input);
  public `/api/files/{path}` download route for avatars visible to all patients
- **Mocked email notifications** on doctor approval/rejection + appointment booking/cancellation
  (prints `[MOCKED EMAIL] ...` to backend stdout — swap in Resend/SendGrid later)

## Testing (all green)
- Backend: 32/32 pytest pass (iteration 1+2 combined)
- Frontend E2E: all 3 roles, all core flows, admin cancel/reschedule — all pass
- Known: Google Sign-In tested render-only; real OAuth requires manual test

## Backlog
- **P1** Real email provider: Resend (needs API key) — replace `notification_service.py` stubs
- **P1** Wire `send_appointment_booked` on POST /api/appointments/ (already added)
- **P2** Doctor calendar view (week/month) instead of flat list
- **P2** Admin "analytics" tab with overall mood/risk trends
- **P3** Weekly progress PDF the patient can share with their therapist (revenue idea)
- **P3** Dark mode toggle (tokens already support it)
- **P3** Voice journaling (Whisper) + TTS replies for the chatbot
