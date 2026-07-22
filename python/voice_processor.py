import re

class VoiceNoteNLUProcessor:
    """
    NLU Processor for transcribing WhatsApp voice notes and extracting
    educational topics, student learning progress, and challenges.
    """

    SUBJECT_KEYWORDS = {
        "Math": ["math", "fractions", "division", "addition", "subtraction", "algebra", "geometry", "numbers"],
        "English": ["english", "reading", "grammar", "vocabulary", "phonics", "spelling", "story", "comprehension"],
        "Science": ["science", "plants", "solar", "body", "experiment", "physics", "chemistry", "biology"],
    }

    def process_transcript(self, raw_transcript: str) -> dict:
        """
        Parses raw text or transcribed audio into structured session logs.
        """
        transcript_lower = raw_transcript.lower()

        # 1. Detect Primary Subject
        detected_subject = "General Learning"
        for subject, keywords in self.SUBJECT_KEYWORDS.items():
            if any(kw in transcript_lower for kw in keywords):
                detected_subject = subject
                break

        # 2. Extract Topic Covered
        topic = raw_transcript.strip()
        if len(topic) > 80:
            topic = topic[:77] + "..."

        # 3. Detect Flagged Students needing support
        # Scans for sentences containing 'need', 'struggl', 'extra help'
        student_concerns = []
        sentences = re.split(r'[.!?]', raw_transcript)
        for sentence in sentences:
            if any(w in sentence.lower() for w in ["need", "struggl", "extra help", "slow", "difficulty"]):
                student_concerns.append(sentence.strip())

        # 4. Sentiment Assessment
        if any(w in transcript_lower for w in ["struggled", "difficult", "noisy", "hard"]):
            sentiment = "CONCERNED"
        elif any(w in transcript_lower for w in ["great", "excelled", "good", "improved"]):
            sentiment = "POSITIVE"
        else:
            sentiment = "NEUTRAL"

        return {
            "subject": detected_subject,
            "topic_covered": topic,
            "student_concerns": student_concerns if student_concerns else ["No critical student issues reported."],
            "sentiment": sentiment,
            "extracted_log": f"[{detected_subject}] {raw_transcript}"
        }

if __name__ == "__main__":
    processor = VoiceNoteNLUProcessor()
    sample_voice_text = "We covered long division and basic fractions with Grade 6 today. Rohan and Diya needed extra help with remainder steps, but overall they improved!"
    res = processor.process_transcript(sample_voice_text)
    print("Voice NLU Output:", res)
