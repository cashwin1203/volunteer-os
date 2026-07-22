from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from churn_model import VolunteerChurnPredictor
from voice_processor import VoiceNoteNLUProcessor

app = FastAPI(
    title="Volunteer OS AI & ML Microservice",
    description="Python microservice providing predictive churn analytics and WhatsApp voice note NLU processing.",
    version="1.0.0"
)

# Initialize ML Model & NLU Processor
churn_predictor = VolunteerChurnPredictor()
voice_processor = VoiceNoteNLUProcessor()

class ChurnRequest(BaseModel):
    attendance_rate: float
    rsvp_latency_hours: float
    consecutive_absences: int
    months_active: float
    backup_frequency: int

class VoiceNoteRequest(BaseModel):
    transcript: str

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Volunteer OS Python ML Engine"}

@app.post("/predict-churn")
def predict_churn(req: ChurnRequest):
    try:
        result = churn_predictor.predict_risk(
            attendance_rate=req.attendance_rate,
            rsvp_latency_hours=req.rsvp_latency_hours,
            consecutive_absences=req.consecutive_absences,
            months_active=req.months_active,
            backup_frequency=req.backup_frequency
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-voice-note")
def process_voice_note(req: VoiceNoteRequest):
    try:
        result = voice_processor.process_transcript(req.transcript)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
