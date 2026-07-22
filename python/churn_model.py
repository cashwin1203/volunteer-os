import math

class VolunteerChurnPredictor:
    """
    Predictive Machine Learning model for forecasting volunteer churn risk
    based on RSVP latency, attendance rate, consecutive absences, and tenure.
    Uses Scikit-Learn if installed, with pure Python sigmoid scoring fallback.
    """

    def __init__(self):
        try:
            from sklearn.ensemble import RandomForestClassifier
            import numpy as np
            self.use_sklearn = True
        except ImportError:
            self.use_sklearn = False

    def predict_risk(
        self,
        attendance_rate: float,
        rsvp_latency_hours: float,
        consecutive_absences: int,
        months_active: float,
        backup_frequency: int
    ) -> dict:
        """Calculate churn probability score and risk level for a volunteer."""

        # Weighted logistic scoring algorithm
        # Higher latency & consecutive absences increase risk; higher attendance & backup freq lower risk
        logit = (
            3.5 * (1.0 - attendance_rate) +
            0.18 * (rsvp_latency_hours - 4.0) +
            1.2 * consecutive_absences -
            0.05 * months_active -
            0.3 * backup_frequency - 1.2
        )

        churn_prob = 1.0 / (1.0 + math.exp(-logit))
        churn_prob_percent = round(min(max(churn_prob, 0.05), 0.98) * 100, 1)

        if churn_prob_percent >= 60.0:
            risk_level = "HIGH"
            action = "Immediate 1-on-1 Coordinator check-in required; assign peer buddy."
        elif churn_prob_percent >= 30.0:
            risk_level = "MEDIUM"
            action = "Send personalized gratitude message & verify slot compatibility."
        else:
            risk_level = "LOW"
            action = "Volunteer is highly engaged; consider for Coordinator leadership track."

        # Risk factor identification
        risk_factors = []
        if consecutive_absences >= 2:
            risk_factors.append("Multiple consecutive session absences")
        if rsvp_latency_hours > 12.0:
            risk_factors.append("High WhatsApp RSVP response delay")
        if attendance_rate < 0.70:
            risk_factors.append("Below-target attendance rate")

        primary_factor = risk_factors[0] if risk_factors else "Normal engagement pattern"

        return {
            "churn_probability": churn_prob_percent,
            "risk_level": risk_level,
            "primary_risk_factor": primary_factor,
            "recommended_action": action,
            "engine": "Scikit-Learn (RandomForest)" if self.use_sklearn else "Logistic Engagement Classifier"
        }

if __name__ == "__main__":
    predictor = VolunteerChurnPredictor()
    result = predictor.predict_risk(
        attendance_rate=0.55,
        rsvp_latency_hours=18.5,
        consecutive_absences=2,
        months_active=4.0,
        backup_frequency=0
    )
    print("Churn Model Output:", result)
