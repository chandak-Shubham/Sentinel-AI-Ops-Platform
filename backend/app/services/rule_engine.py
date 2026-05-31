def classify_event(event_type: str):

    if event_type == "github_commit":
        return "INFO"

    elif event_type == "deployment_started":
        return "INFO"

    elif event_type == "high_cpu":
        return "WARNING"

    elif event_type == "memory_spike":
        return "WARNING"

    elif event_type == "deployment_failed":
        return "ERROR"

    elif event_type == "database_down":
        return "CRITICAL"

    return "INFO"