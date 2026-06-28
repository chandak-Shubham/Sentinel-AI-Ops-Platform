def validate_ai_decision(webhook, analysis):

    # AI unavailable -> fallback to log level
    if analysis.summary == "AI analysis unavailable.":

        return webhook.level.upper() in {
            "ERROR",
            "CRITICAL"
        }

    if not analysis.should_create_incident:
        return False

    if analysis.confidence < 0.75:
        return False

    if webhook.level.upper() == "INFO":
        return False

    return True