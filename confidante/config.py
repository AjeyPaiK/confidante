from pathlib import Path

DATA_DIR = Path.home() / ".local" / "share" / "confidante"
DB_PATH = DATA_DIR / "journal.db"

OLLAMA_BASE = "http://localhost:11434"
EMBED_MODEL = "nomic-embed-text"
TAG_MODEL = "gemma3:4b"

EMBED_DIM = 768
TAG_MAX_TOKENS = 80

DATA_DIR.mkdir(parents=True, exist_ok=True)
