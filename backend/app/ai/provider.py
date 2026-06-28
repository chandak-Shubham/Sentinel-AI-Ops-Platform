import json

from google import genai

from app.core.config import (
    GEMINI_API_KEY,
    AI_MODEL
)

client = genai.Client(
    api_key=GEMINI_API_KEY
)


def generate_response(
    system_prompt: str,
    user_prompt: str
):

    try:

        response = client.models.generate_content(

            model=AI_MODEL,

            contents=f"""
{system_prompt}

{user_prompt}
""",

            config={
                "temperature": 0.1,
                "response_mime_type": "application/json"
            }
        )

        return response.text

    except Exception as e:

        raise Exception(
            f"Gemini Error: {str(e)}"
        )