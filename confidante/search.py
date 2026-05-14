import numpy as np
from .db import ThoughtRow
from .embeddings import embed, embedding_from_bytes


def semantic_search(
    query: str,
    thoughts: list[ThoughtRow],
    top_k: int = 5,
) -> list[tuple[float, ThoughtRow]]:
    """
    Semantic search across thoughts using cosine similarity.
    Returns list of (score, thought) tuples, sorted by score descending.
    """
    # Embed query
    query_bytes = embed(query)
    query_vec = embedding_from_bytes(query_bytes)

    # Filter thoughts with embeddings
    thoughts_with_emb = [(t, embedding_from_bytes(t.embedding)) for t in thoughts if t.embedding]

    if not thoughts_with_emb:
        return []

    # Build matrix and compute scores
    embeddings_matrix = np.stack([emb for _, emb in thoughts_with_emb])
    scores = embeddings_matrix @ query_vec  # Already normalized, so this is cosine similarity

    # Filter by relevance threshold and sort
    results = [
        (float(score), thought)
        for score, (thought, _) in zip(scores, thoughts_with_emb)
        if score > 0.55  # Filter out very low similarity
    ]

    results.sort(key=lambda x: x[0], reverse=True)
    return results[:top_k]
