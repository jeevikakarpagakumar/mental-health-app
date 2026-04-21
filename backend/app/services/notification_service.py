"""Notification stubs — replace with Resend / SendGrid when API key is provided.
MOCKED: currently just prints to stdout (visible in /var/log/supervisor/backend.out.log).
"""


def send_doctor_approved(email: str, name: str):
    print(f"[MOCKED EMAIL] → {email} ({name}): Your Aura doctor account is approved.", flush=True)


def send_doctor_rejected(email: str, name: str):
    print(f"[MOCKED EMAIL] → {email} ({name}): Your Aura doctor registration was not approved.", flush=True)


def send_appointment_booked(patient_email: str, doctor_email: str, date: str, time_slot: str):
    print(
        f"[MOCKED EMAIL] appointment booked · patient={patient_email} "
        f"doctor={doctor_email} date={date} time={time_slot}",
        flush=True,
    )


def send_appointment_cancelled(patient_email: str, doctor_email: str, date: str, time_slot: str):
    print(
        f"[MOCKED EMAIL] appointment cancelled · patient={patient_email} "
        f"doctor={doctor_email} date={date} time={time_slot}",
        flush=True,
    )
