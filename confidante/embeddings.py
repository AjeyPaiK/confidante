import httpx
import numpy as np

from .config import OLLAMA_BASE, EMBED_MODEL, EMBED_DIM


def embed(text: str) -> tuple[bytes, int]:
    """
    Embed text using nomic-embed-text via Ollama.
    Returns (normalized embedding as float32 bytes, total_tokens).
    """
    url = f"{OLLAMA_BASE}/api/embed"
    payload = {
        "model": EMBED_MODEL,
        "input": text,
    }

    response = httpx.post(url, json=payload, timeout=30)
    response.raise_for_status()

    data = response.json()
    embeddings = data.get("embeddings", [])

    if not embeddings or not embeddings[0]:
        raise ValueError("No embedding returned from Ollama")

    embedding = np.array(embeddings[0], dtype=np.float32)

    # Normalize to unit vector for cosine similarity
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm

    # Get token count
    tokens = data.get("prompt_eval_count", 0)

    return embedding.tobytes(), tokens


def embedding_from_bytes(data: bytes) -> np.ndarray:
    """Reconstruct embedding from bytes."""
    return np.frombuffer(data, dtype=np.float32)


def check_ollama_available() -> bool:
    """Check if Ollama is running and accessible."""
    try:
        response = httpx.get(f"{OLLAMA_BASE}/api/tags", timeout=2)
        return response.status_code == 200
    except Exception:
        return False
