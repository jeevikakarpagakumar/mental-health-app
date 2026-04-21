"""Notification stubs — replace with Resend / SendGrid when API key is provided.
MOCKED: currently just logs to stdout.
"""
import logging

logger = logging.getLogger(__name__)


def send_doctor_approved(email: str, name: str):
    logger.info(f"[MOCKED EMAIL] → {email} ({name}): Your Aura doctor account is approved.")


def send_doctor_rejected(email: str, name: str):
    logger.info(f"[MOCKED EMAIL] → {email} ({name}): Your Aura doctor registration was not approved.")


def send_appointment_booked(patient_email: str, doctor_email: str, date: str, time_slot: str):
    logger.info(
        f"[MOCKED EMAIL] appointment booked · patient={patient_email} "
        f"doctor={doctor_email} date={date} time={time_slot}"
    )


def send_appointment_cancelled(patient_email: str, doctor_email: str, date: str, time_slot: str):
    logger.info(
        f"[MOCKED EMAIL] appointment cancelled · patient={patient_email} "
        f"doctor={doctor_email} date={date} time={time_slot}"
    )
