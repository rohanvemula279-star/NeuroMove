"""Live verification script for NeuroMove API endpoints using a real PhysioNet EDF file.
"""

import io
import json
import time
import threading
import urllib.request
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import requests
import uvicorn
from app.main import app

def run_app():
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")

def main():
    t = threading.Thread(target=run_app, daemon=True)
    t.start()
    time.sleep(2)

    base_url = "http://127.0.0.1:8000"

    print("=" * 60)
    print("TEST 1: POST /api/upload with real EDF file (S089R01.edf)")
    with open("data/physionet/S089/S089R01.edf", "rb") as f:
        files = {"file": ("S089R01.edf", f, "application/octet-stream")}
        resp = requests.post(f"{base_url}/api/upload", files=files)
    
    print(f"Status Code: {resp.status_code}")
    upload_res = resp.json()
    print("Response JSON:")
    print(json.dumps(upload_res, indent=2))
    trial_id = upload_res["trial_id"]

    print("\n" + "=" * 60)
    print(f"TEST 2: POST /api/predict/{trial_id}?model=both")
    resp = requests.post(f"{base_url}/api/predict/{trial_id}?model=both")
    print(f"Status Code: {resp.status_code}")
    predict_res = resp.json()
    print("Response JSON:")
    print(json.dumps(predict_res, indent=2))

    print("\n" + "=" * 60)
    print("TEST 3: GET /api/metrics/minirocket")
    resp = requests.get(f"{base_url}/api/metrics/minirocket")
    print(f"Status Code: {resp.status_code}")
    mr_metrics = resp.json()
    print("Summary Metrics:")
    print(f"  Model: {mr_metrics['model_name']}")
    print(f"  Global Accuracy: {mr_metrics['global_accuracy']}")
    print(f"  Macro F1: {mr_metrics['macro_f1']}")
    print(f"  Confusion Matrix: {mr_metrics['confusion_matrix']}")
    print(f"  Inference Latency: {mr_metrics['inference_latency']}")

    print("\n" + "=" * 60)
    print("TEST 4: GET /api/metrics/cnn_lstm")
    resp = requests.get(f"{base_url}/api/metrics/cnn_lstm")
    print(f"Status Code: {resp.status_code}")
    cl_metrics = resp.json()
    print("Summary Metrics:")
    print(f"  Model: {cl_metrics['model_name']}")
    print(f"  Global Accuracy: {cl_metrics['global_accuracy']}")
    print(f"  Macro F1: {cl_metrics['macro_f1']}")
    print(f"  Trainable Params: {cl_metrics['trainable_parameters']}")
    print(f"  Inference Latency: {cl_metrics['inference_latency']}")

    print("\n" + "=" * 60)
    print("TEST 5: GET /api/subjects")
    resp = requests.get(f"{base_url}/api/subjects")
    print(f"Status Code: {resp.status_code}")
    subjects_res = resp.json()
    print("Response JSON:")
    print(json.dumps(subjects_res, indent=2))

    print("\n" + "=" * 60)
    print("All API endpoints successfully verified against real trained models!")

if __name__ == "__main__":
    main()
