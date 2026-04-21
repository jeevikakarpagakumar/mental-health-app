"""Transactional emails via Resend.

If RESEND_API_KEY is missing, falls back to a `print [MOCKED EMAIL] ...` stub
so development still works without credentials.
"""
import os
import logging
import resend

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def _send(to: str, subject: str, html: str):
    if not to:
        return
    if not RESEND_API_KEY:
        print(f"[MOCKED EMAIL] → {to} · {subject}", flush=True)
        return
    try:
        resend.Emails.send({
            "from": SENDER_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
        })
        print(f"[EMAIL SENT] → {to} · {subject}", flush=True)
    except Exception as e:
        logger.error(f"Resend failed for {to}: {e}")
        print(f"[EMAIL FAIL] → {to} · {subject} · {e}", flush=True)


def _wrap(body_html: str, title: str) -> str:
    return f"""
<!doctype html>
<html><body style="margin:0;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F7F5F2;padding:24px;">
  <table align="center" cellpadding="0" cellspacing="0" width="560" style="background:#fff;border:1px solid #E2E0D9;border-radius:8px;overflow:hidden;">
    <tr><td style="padding:24px 32px;border-bottom:1px solid #E2E0D9;">
      <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#5C665F;">Aura</div>
      <div style="font-size:22px;color:#2C4C3B;margin-top:6px;font-weight:500;">{title}</div>
    </td></tr>
    <tr><td style="padding:28px 32px;color:#1A1D1A;font-size:14px;line-height:1.6;">
      {body_html}
    </td></tr>
    <tr><td style="padding:16px 32px;border-top:1px solid #E2E0D9;color:#5C665F;font-size:11px;">
      Aura — Mental Health AI Companion. Not a substitute for professional advice.
    </td></tr>
  </table>
</body></html>"""


def send_doctor_approved(email: str, name: str):
    html = _wrap(
        f"<p>Hi {name or 'there'},</p>"
        f"<p>Good news — your Aura doctor account has been <strong>approved</strong>. "
        f"You can now sign in and start seeing patients.</p>",
        "You're approved",
    )
    _send(email, "Your Aura doctor account is approved", html)


def send_doctor_rejected(email: str, name: str):
    html = _wrap(
        f"<p>Hi {name or 'there'},</p>"
        f"<p>Thank you for applying. After review, we were unable to approve your "
        f"registration at this time. You're welcome to reach out with additional credentials.</p>",
        "Registration update",
    )
    _send(email, "Update on your Aura doctor registration", html)


def send_appointment_booked(patient_email: str, doctor_email: str, date: str, time_slot: str):
    body = (
        f"<p>An appointment has been booked.</p>"
        f"<p><strong>Date:</strong> {date}<br/>"
        f"<strong>Time:</strong> {time_slot}</p>"
    )
    if patient_email:
        _send(patient_email, f"Appointment booked · {date} at {time_slot}", _wrap(body, "Appointment confirmed"))
    if doctor_email:
        _send(doctor_email, f"New appointment · {date} at {time_slot}", _wrap(body, "New appointment"))


def send_appointment_cancelled(patient_email: str, doctor_email: str, date: str, time_slot: str):
    body = (
        f"<p>Your appointment on <strong>{date}</strong> at <strong>{time_slot}</strong> "
        f"has been cancelled by an admin. Please book a new slot at your convenience.</p>"
    )
    if patient_email:
        _send(patient_email, "Your Aura appointment was cancelled", _wrap(body, "Appointment cancelled"))
    if doctor_email:
        _send(doctor_email, "An appointment was cancelled", _wrap(body, "Appointment cancelled"))
