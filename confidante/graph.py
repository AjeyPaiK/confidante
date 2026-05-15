import numpy as np
import networkx as nx
from typing import Any

from .db import ThoughtRow
from .embeddings import embedding_from_bytes


def compute_graph_layout(thoughts: list[ThoughtRow]) -> dict[str, Any]:
    """
    Compute semantic graph with force-directed layout.
    Returns: {nodes: [...], edges: [...], positions: {id: {x, y}}}
    """
    # Filter thoughts with embeddings
    thoughts_with_emb = [t for t in thoughts if t.embedding is not None]

    if not thoughts_with_emb:
        return {"nodes": [], "edges": [], "positions": {}}

    # Build nodes
    nodes = [
        {
            "id": t.id,
            "label": t.body[:40] + "..." if len(t.body) > 40 else t.body,
            "tags": t.tags,
            "created_at": t.created_at,
        }
        for t in thoughts_with_emb
    ]

    # Compute similarity matrix
    embeddings = np.stack(
        [embedding_from_bytes(t.embedding) for t in thoughts_with_emb]
    )
    similarity_matrix = embeddings @ embeddings.T

    # Build edges from similarity (threshold: 0.65)
    edges = []
    seen_pairs = set()
    for i, thought_a in enumerate(thoughts_with_emb):
        for j, thought_b in enumerate(thoughts_with_emb):
            if i < j:
                sim = float(similarity_matrix[i, j])
                if sim > 0.65:
                    edges.append(
                        {
                            "source": thought_a.id,
                            "target": thought_b.id,
                            "weight": sim,
                        }
                    )
                    seen_pairs.add((i, j))

    # Build networkx graph for layout
    G = nx.Graph()
    for node in nodes:
        G.add_node(node["id"])
    for edge in edges:
        G.add_edge(edge["source"], edge["target"], weight=edge["weight"])

    # Compute spring layout with edge weights
    if len(G.nodes) > 1:
        pos = nx.spring_layout(
            G, k=2, iterations=50, weight="weight", seed=42, scale=10
        )
    else:
        pos = {nodes[0]["id"]: np.array([0, 0])}

    # Convert to dict format
    positions = {
        node_id: {"x": float(coord[0]), "y": float(coord[1])}
        for node_id, coord in pos.items()
    }

    return {
        "nodes": nodes,
        "edges": edges,
        "positions": positions,
    }
