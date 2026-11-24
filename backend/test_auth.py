import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.db.session import engine
from app.models.base import Base
from app.db.init_db import init_db

def run_auth_tests():
    # Fresh test state
    Base.metadata.drop_all(bind=engine)
    init_db()

    with TestClient(app) as client:
        print("=== 1. Test Admin Login ===")
        res = client.post("/api/auth/login", json={"username": "admin", "pin": "9999"})
        assert res.status_code == 200, f"Admin login failed: {res.text}"
        admin_data = res.json()
        assert admin_data["user"]["role"] == "admin"
        admin_token = admin_data["access_token"]
        print("Admin login OK! Role:", admin_data["user"]["role"])

        print("=== 2. Test Reception Login ===")
        res = client.post("/api/auth/login", json={"username": "reception", "pin": "1234"})
        assert res.status_code == 200
        rec_data = res.json()
        assert rec_data["user"]["role"] == "receptionist"
        print("Receptionist login OK! Role:", rec_data["user"]["role"])

        print("=== 3. Test Barber Personalized Logins ===")
        # Ravi
        res_ravi = client.post("/api/auth/login", json={"username": "ravi", "pin": "1111"})
        assert res_ravi.status_code == 200
        ravi_data = res_ravi.json()
        assert ravi_data["user"]["role"] == "barber"
        assert ravi_data["user"]["barber_id"] == "b-ravi"
        print("Barber Ravi login OK! Chair:", ravi_data["user"]["barber_id"])

        # Amit
        res_amit = client.post("/api/auth/login", json={"username": "amit", "pin": "2222"})
        assert res_amit.status_code == 200
        amit_data = res_amit.json()
        assert amit_data["user"]["role"] == "barber"
        assert amit_data["user"]["barber_id"] == "b-amit"
        print("Barber Amit login OK! Chair:", amit_data["user"]["barber_id"])

        # Imran
        res_imran = client.post("/api/auth/login", json={"username": "imran", "pin": "3333"})
        assert res_imran.status_code == 200
        imran_data = res_imran.json()
        assert imran_data["user"]["role"] == "barber"
        assert imran_data["user"]["barber_id"] == "b-imran"
        print("Barber Imran login OK! Chair:", imran_data["user"]["barber_id"])

        print("=== 4. Test Customer Phone Login ===")
        res_cust = client.post("/api/auth/login", json={"username": "9876543210", "pin": "1234"})
        assert res_cust.status_code == 200
        cust_data = res_cust.json()
        assert cust_data["user"]["role"] == "customer"
        assert cust_data["user"]["name"] == "Kunal Patel"
        print("Customer login OK! Name:", cust_data["user"]["name"])

        print("=== 5. Test Invalid Credentials ===")
        res_bad = client.post("/api/auth/login", json={"username": "admin", "pin": "wrongpin"})
        assert res_bad.status_code == 401
        print("Invalid PIN properly rejected with 401:", res_bad.json()["detail"])

        print("=== 6. Test Customer Registration ===")
        new_cust_phone = "9812345678"
        res_reg = client.post("/api/auth/customer-register", json={
            "name": "Manish Sharma",
            "phone": new_cust_phone,
            "pin": "5555"
        })
        assert res_reg.status_code == 201
        new_cust_data = res_reg.json()
        assert new_cust_data["user"]["role"] == "customer"
        assert new_cust_data["user"]["username"] == new_cust_phone
        print("Customer registration OK! User:", new_cust_data["user"]["name"])

        # Duplicate registration fails
        res_reg_dup = client.post("/api/auth/customer-register", json={
            "name": "Another Person",
            "phone": new_cust_phone,
            "pin": "5555"
        })
        assert res_reg_dup.status_code == 409
        print("Duplicate customer registration properly rejected with 409!")

        print("=== 7. Test /api/auth/me Profile ===")
        # Authenticated
        res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert res_me.status_code == 200
        assert res_me.json()["username"] == "admin"
        print("Auth me profile verified for Admin!")

        # Unauthenticated
        res_unauth = client.get("/api/auth/me")
        assert res_unauth.status_code == 401
        print("Unauthenticated request properly rejected with 401!")

        print("\nALL RBAC AUTHENTICATION TESTS PASSED PERFECTLY! 🎉")

if __name__ == "__main__":
    run_auth_tests()
