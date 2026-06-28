import json

from app.ai.provider import generate_response

from app.ai.prompts import SYSTEM_PROMPT

from app.ai.schemas import AIAnalysis


def analyze_log(
    service: str,
    level: str,
    message: str,
    payload: dict
):

    user_prompt = f"""
Service:
{service}

Level:
{level}

Message:
{message}

Payload:
{json.dumps(payload, indent=2)}
"""

    response = generate_response(
        SYSTEM_PROMPT,
        user_prompt
    )

    try:

        response = json.loads(response)

        return AIAnalysis(**response)

    except Exception as e:

        raise Exception(
            f"AI Parsing Error: {str(e)}"
        )