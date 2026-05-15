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


def extract_tags(text: str) -> tuple[list[str], int]:
    """
    Extract factual topic tags from thought text using gemma3:4b.
    Returns (tags, total_tokens). Returns ([], 0) on any failure (never blocks a write).
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

        response = httpx.post(url, json=payload, timeout=60)
        response.raise_for_status()

        data = response.json()
        output = data.get("response", "").strip()

        # Get token counts from Ollama response
        prompt_tokens = data.get("prompt_eval_count", 0)
        response_tokens = data.get("eval_count", 0)
        total_tokens = prompt_tokens + response_tokens

        # Extract JSON array from output
        start_idx = output.find("[")
        end_idx = output.rfind("]")

        if start_idx == -1 or end_idx == -1:
            # Model didn't return JSON, try whole output
            try:
                tags = json.loads(output)
                if isinstance(tags, list):
                    parsed_tags = [str(tag).strip().lower() for tag in tags if tag][:5]
                    return parsed_tags, total_tokens
            except (json.JSONDecodeError, ValueError):
                pass
            return [], total_tokens

        json_str = output[start_idx : end_idx + 1]
        tags = json.loads(json_str)

        if not isinstance(tags, list):
            return [], total_tokens

        # Normalize: lowercase, strip whitespace
        tags = [str(tag).strip().lower() for tag in tags if tag]

        return tags[:5], total_tokens  # Limit to 5 tags

    except Exception as e:
        # Silent fallback: never block a write due to tagging failure
        return [], 0
