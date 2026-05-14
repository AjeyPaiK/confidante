import json
import httpx

from .config import OLLAMA_BASE, TAG_MODEL, TAG_MAX_TOKENS

TAGGING_PROMPT = """\
TASK: Extract 2-5 topic tags as a JSON array only. No other text.
Format: ["tag1", "tag2", "tag3"]

Rules:
- Tags are nouns/noun phrases (1-3 words)
- Tags name subjects: "job", "family", "sleep", "money", not emotions
- No adjectives describing feelings
- No explanations or preamble

Text: {text}

Tags:"""


def extract_tags(text: str) -> list[str]:
    """
    Extract factual topic tags from thought text using gemma3:4b.
    Returns empty list on any failure (never blocks a write).
    """
    try:
        prompt = TAGGING_PROMPT.format(text=text)
        url = f"{OLLAMA_BASE}/api/generate"
        payload = {
            "model": TAG_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": TAG_MAX_TOKENS,
                "temperature": 0.1,
            },
        }

        response = httpx.post(url, json=payload, timeout=30)
        response.raise_for_status()

        data = response.json()
        output = data.get("response", "").strip()

        # Extract JSON array from output
        start_idx = output.find("[")
        end_idx = output.rfind("]")

        if start_idx == -1 or end_idx == -1:
            return []

        json_str = output[start_idx : end_idx + 1]
        tags = json.loads(json_str)

        if not isinstance(tags, list):
            return []

        # Normalize: lowercase, strip whitespace
        tags = [str(tag).strip().lower() for tag in tags if tag]

        return tags[:5]  # Limit to 5 tags

    except Exception:
        # Silent fallback: never block a write due to tagging failure
        return []
