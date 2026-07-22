# Volunteer OS — Python ML & NLU Engine

This module provides predictive analytics and WhatsApp voice note processing for Volunteer OS.

---

## 📦 Features

1. **Predictive Churn Classifier (`churn_model.py`):**
   - Calculates a 0-100% volunteer churn risk probability based on attendance frequency, Friday WhatsApp RSVP latency, consecutive absences, and tenure.
   - Recommends targeted coordinator intervention strategies.

2. **WhatsApp Voice Note Processor (`voice_processor.py`):**
   - Parses raw voice note transcripts into structured educational session logs.
   - Extracts subject (`Math`, `English`, `Science`), topics taught, and flags students needing extra help.

3. **FastAPI Microservice (`main.py`):**
   - REST API endpoints (`/predict-churn`, `/process-voice-note`, `/health`).

---

## 🚀 Execution

Run individual modules:
```bash
python python/churn_model.py
python python/voice_processor.py
```

Run FastAPI server:
```bash
uvicorn python.main:app --reload --port 8000
```
