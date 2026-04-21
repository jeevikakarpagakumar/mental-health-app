def calculate_score(test_type, answers):
    score = sum(answers)

    if test_type == "PHQ9":
        if score <= 4:
            severity = "minimal"
        elif score <= 9:
            severity = "mild"
        elif score <= 14:
            severity = "moderate"
        elif score <= 19:
            severity = "moderately severe"
        else:
            severity = "severe"
    elif test_type == "GAD7":
        if score <= 4:
            severity = "minimal"
        elif score <= 9:
            severity = "mild"
        elif score <= 14:
            severity = "moderate"
        else:
            severity = "severe"
    else:
        severity = "unknown"

    return score, severity


def get_recommendations(severity):
    if severity in ["moderately severe", "severe"]:
        return {
            "message": "Seek professional help immediately.",
            "helplines": ["AASRA: +91-9820466726", "Kiran: 1800-599-0019"],
        }
    elif severity == "moderate":
        return {
            "message": "Consider therapy or counseling.",
            "helplines": ["Kiran: 1800-599-0019"],
        }
    return {
        "message": "Maintain self-care and monitor yourself.",
        "helplines": [],
    }
