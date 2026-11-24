import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    with TestClient(app) as client:
        print("--- 1. Health Check ---")
        res = client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        assert res.json()["status"] == "ok"
        print("Health check OK!")

        print("--- 2. Barbers API ---")
        res = client.get("/api/barbers")
        assert res.status_code == 200, f"Get barbers failed: {res.text}"
        barbers = res.json()
        assert len(barbers) >= 3, f"Expected at least 3 barbers, got {len(barbers)}"
        barber_names = [b["name"] for b in barbers]
        assert "Ravi" in barber_names and "Amit" in barber_names and "Imran" in barber_names
        print(f"Barbers verified: {barber_names}")

        print("--- 3. Services API ---")
        res = client.get("/api/services")
        assert res.status_code == 200
        services = res.json()
        assert len(services) >= 6
        service_ids = [s["id"] for s in services]
        print(f"Services verified: {len(services)} services loaded ({service_ids[:3]}...)")

        print("--- 4. Active Queue API ---")
        res = client.get("/api/queue")
        assert res.status_code == 200
        queue_data = res.json()
        print(f"Initial waiting count: {queue_data['waiting_count']}, active entries: {len(queue_data['active_entries'])}")

        print("--- 5. Join Queue & Validation Rules ---")
        # Valid join
        join_payload = {
            "customer_name": "Tirth Shah",
            "customer_phone": "9822334455",
            "service_ids": ["s-haircut", "s-beard"],
            "preferred_barber_id": "b-ravi",
            "is_walk_in": False
        }
        res = client.post("/api/queue/join", json=join_payload)
        assert res.status_code == 201, f"Valid join failed: {res.text}"
        new_entry = res.json()
        new_token = new_entry["token"]
        print(f"Joined queue successfully with token: {new_token}")

        # Duplicate phone rejection rule
        res_dup = client.post("/api/queue/join", json=join_payload)
        assert res_dup.status_code == 409, f"Expected 409 Conflict for duplicate phone, got: {res_dup.status_code}"
        print(f"Duplicate phone properly rejected with 409: {res_dup.json()['detail']}")

        # More than 3 services validation
        bad_services = {
            "customer_name": "Test Overlimit",
            "customer_phone": "9900112233",
            "service_ids": ["s-haircut", "s-beard", "s-spa", "s-facial"],
            "is_walk_in": False
        }
        res_over = client.post("/api/queue/join", json=bad_services)
        assert res_over.status_code in [400, 422], f"Expected 400/422 for >3 services, got {res_over.status_code}"
        print("Max 3 services rule enforced!")

        # Invalid phone validation
        bad_phone = {
            "customer_name": "Test Bad Phone",
            "customer_phone": "12345",
            "service_ids": ["s-haircut"],
            "is_walk_in": False
        }
        res_phone = client.post("/api/queue/join", json=bad_phone)
        assert res_phone.status_code in [400, 422], f"Expected 422 for bad phone, got {res_phone.status_code}"
        print("Invalid phone pattern enforced!")

        print("--- 6. Status Transitions & Barber Workflows ---")
        # Check entry status
        res = client.get(f"/api/queue/{new_token}")
        assert res.status_code == 200
        assert res.json()["status"] == "Waiting"

        # Start service directly should only work if called or waiting
        res = client.post(f"/api/queue/{new_token}/start")
        assert res.status_code == 200
        assert res.json()["status"] == "In Chair"
        print(f"Token {new_token} transitioned to In Chair")

        # Complete service
        res = client.post(f"/api/queue/{new_token}/done")
        assert res.status_code == 200
        assert res.json()["status"] == "Completed"
        print(f"Token {new_token} completed successfully")

        # Cancellation rule check: Cancel should fail for completed
        res_cancel_fail = client.post(f"/api/queue/{new_token}/cancel")
        assert res_cancel_fail.status_code == 400, f"Expected cancel fail on Completed, got {res_cancel_fail.status_code}"
        print("Cancellation only in 'Waiting' status verified!")

        print("--- 7. Walk-in & Barber Preference Assignment ---")
        # Join another customer for Imran
        walkin_payload = {
            "customer_name": "Aakash Mehta",
            "customer_phone": "9833445566",
            "service_ids": ["s-haircut"],
            "preferred_barber_id": "b-imran",
            "is_walk_in": True
        }
        res_walkin = client.post("/api/queue/join", json=walkin_payload)
        assert res_walkin.status_code == 201
        imran_token = res_walkin.json()["token"]

        # Toggle Imran break off (Imran starts On Break)
        res_break = client.post("/api/barbers/b-imran/break")
        assert res_break.status_code == 200
        assert res_break.json()["status"] == "Available"
        print("Toggled Imran from On Break to Available")

        # Call Next for Imran
        res_call = client.post("/api/queue/call-next", json={"barber_id": "b-imran"})
        assert res_call.status_code == 200
        called = res_call.json()
        assert called["token"] == imran_token, f"Expected Imran's preferred customer {imran_token}, got {called['token']}"
        print(f"Call Next properly assigned preferred customer {called['token']} to Imran")

        # Mark No-show
        res_noshow = client.post(f"/api/queue/{imran_token}/no-show")
        assert res_noshow.status_code == 200
        assert res_noshow.json()["status"] == "No-show"
        print(f"Marked {imran_token} as No-show")

        print("--- 8. Settings & Online Queue Closure ---")
        # Close queue
        res_settings = client.post("/api/settings", json={"is_queue_open": False})
        assert res_settings.status_code == 200
        assert res_settings.json()["is_queue_open"] is False

        # Attempt online join when closed
        res_closed_join = client.post("/api/queue/join", json={
            "customer_name": "Late Customer",
            "customer_phone": "9844556677",
            "service_ids": ["s-haircut"],
            "is_walk_in": False
        })
        assert res_closed_join.status_code == 400
        print(f"Online join properly rejected when queue closed: {res_closed_join.json()['detail']}")

        # Walk-in allowed even when online queue is closed
        res_closed_walkin = client.post("/api/queue/join", json={
            "customer_name": "Salon Walkin",
            "customer_phone": "9844556677",
            "service_ids": ["s-haircut"],
            "is_walk_in": True
        })
        assert res_closed_walkin.status_code == 201
        print("Walk-in successfully accepted while online queue is closed!")

        # Re-open queue
        client.post("/api/settings", json={"is_queue_open": True})

        print("--- 9. Stats API ---")
        res_stats = client.get("/api/stats")
        assert res_stats.status_code == 200
        stats = res_stats.json()
        print(f"Today stats: Served={stats['served_count']}, In Queue={stats['in_queue_count']}, No-Shows={stats['no_show_count']}, Revenue=Rs.{stats['total_revenue']}")

        print("\nALL BACKEND DATABASE AND API TESTS PASSED SUCCESSFULLY! 🎉")

if __name__ == "__main__":
    run_tests()
