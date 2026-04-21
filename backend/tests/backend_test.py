"""Backend API tests for Mental Health AI (public + auth-protected endpoints).

Auth is Firebase — we cannot mint Firebase ID tokens from inside pytest without
real Firebase creds, so protected endpoints are validated only for their
"rejects missing/invalid token" behaviour. Full authenticated flows are
exercised via the frontend E2E Playwright run.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback for running inside the container where frontend .env may not be exported
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

assert BASE_URL, "REACT_APP_BACKEND_URL missing"


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health ----------
class TestHealth:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        assert "Mental Health" in r.json()["message"]


# ---------- Firebase protected endpoints reject unauthenticated requests ----------
class TestAuthGuards:
    @pytest.mark.parametrize("path,method", [
        ("/api/user/me", "GET"),
        ("/api/user/set-role", "POST"),
        ("/api/doctor/register", "POST"),
        ("/api/doctor/me", "GET"),
        ("/api/appointments/", "POST"),
        ("/api/appointments/patient", "GET"),
        ("/api/appointments/doctor", "GET"),
        ("/api/admin/stats", "GET"),
        ("/api/admin/doctors/pending", "GET"),
        ("/api/admin/high-risk", "GET"),
        ("/api/journal/", "POST"),
        ("/api/mood/", "POST"),
        ("/api/chat/", "POST"),
        ("/api/assessment/", "POST"),
        ("/api/analytics/", "GET"),
        ("/api/risk/", "GET"),
        # iteration 2 – new endpoints
        ("/api/patient/profile", "GET"),
        ("/api/patient/profile", "POST"),
        ("/api/doctor/patients", "GET"),
        ("/api/admin/appointments", "GET"),
        ("/api/admin/appointments/1", "PATCH"),
        ("/api/admin/appointments/1", "DELETE"),
        ("/api/upload/image", "POST"),
    ])
    def test_no_token_rejected(self, api, path, method):
        r = api.request(method, f"{BASE_URL}{path}", json={})
        assert r.status_code in (401, 403), f"{method} {path} -> {r.status_code}"

    def test_bad_token_rejected(self, api):
        r = api.get(
            f"{BASE_URL}/api/user/me",
            headers={"Authorization": "Bearer not-a-real-token"},
        )
        assert r.status_code == 401


# ---------- Public endpoints ----------
class TestPublic:
    def test_doctor_list_returns_array(self, api):
        r = api.get(f"{BASE_URL}/api/doctor/list")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # Each doctor should have basic shape if any exist
        for doc in data:
            assert "id" in doc
            assert "full_name" in doc or "name" in doc

    def test_appointment_slots_unknown_doctor(self, api):
        r = api.get(f"{BASE_URL}/api/appointments/slots/99999?date=2026-02-01")
        # Should 404 because doctor does not exist
        assert r.status_code == 404

    def test_appointment_slots_missing_date(self, api):
        r = api.get(f"{BASE_URL}/api/appointments/slots/1")
        # FastAPI should 422 on missing required query param
        assert r.status_code in (422, 400, 404)


# ---------- 404 for unknown route ----------
class TestUnknownRoute:
    def test_unknown(self, api):
        r = api.get(f"{BASE_URL}/api/does-not-exist")
        assert r.status_code == 404


# ---------- Iteration 2: Public file download endpoint (no auth) ----------
class TestPublicFiles:
    def test_files_unknown_returns_404_not_401(self, api):
        # Must be public (no auth) and return 404 for a missing object, NOT 401/403
        r = api.get(f"{BASE_URL}/api/files/nonexistent/path/xyz.png")
        assert r.status_code == 404, f"expected 404 public, got {r.status_code}"

    def test_files_no_auth_header_not_rejected(self, api):
        # Even without any Authorization header it should go through to download_file
        r = requests.get(f"{BASE_URL}/api/files/does/not/exist.jpg")
        assert r.status_code == 404


# ---------- Iteration 2: Upload rejects wrong content type (after auth) ----------
class TestUploadGuards:
    def test_upload_image_no_auth(self, api):
        # multipart/form-data, no Authorization → still 401/403
        s = requests.Session()
        r = s.post(
            f"{BASE_URL}/api/upload/image",
            files={"file": ("x.png", b"\x89PNG\r\n", "image/png")},
        )
        assert r.status_code in (401, 403)
