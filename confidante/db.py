import sqlite3
import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional

from .config import DB_PATH


@dataclass
class ThoughtRow:
    id: int
    body: str
    tags: list[str]
    embedding: Optional[bytes]
    created_at: str


def init_db() -> None:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS thoughts (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                body        TEXT    NOT NULL,
                tags        TEXT    NOT NULL DEFAULT '[]',
                embedding   BLOB,
                created_at  TEXT    NOT NULL,
                updated_at  TEXT    NOT NULL
            )
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_thoughts_created
            ON thoughts(created_at)
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS meta (
                key   TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        """)
        conn.commit()


def insert_thought(
    body: str,
    tags: Optional[list[str]] = None,
    embedding: Optional[bytes] = None,
    created_at: Optional[str] = None,
) -> int:
    if tags is None:
        tags = []
    if created_at is None:
        created_at = datetime.now().isoformat()

    tags_json = json.dumps(tags)
    now = datetime.now().isoformat()

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO thoughts (body, tags, embedding, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (body, tags_json, embedding, created_at, now),
        )
        conn.commit()
        return cursor.lastrowid


def update_thought(
    thought_id: int,
    tags: Optional[list[str]] = None,
    embedding: Optional[bytes] = None,
) -> None:
    updates = []
    params = []

    if tags is not None:
        updates.append("tags = ?")
        params.append(json.dumps(tags))
    if embedding is not None:
        updates.append("embedding = ?")
        params.append(embedding)

    if not updates:
        return

    updates.append("updated_at = ?")
    params.append(datetime.now().isoformat())
    params.append(thought_id)

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        query = f"UPDATE thoughts SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(query, params)
        conn.commit()


def get_all_thoughts() -> list[ThoughtRow]:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, body, tags, embedding, created_at FROM thoughts ORDER BY created_at DESC"
        )
        rows = cursor.fetchall()

    return [
        ThoughtRow(
            id=row[0],
            body=row[1],
            tags=json.loads(row[2]),
            embedding=row[3],
            created_at=row[4],
        )
        for row in rows
    ]


def get_thought(thought_id: int) -> Optional[ThoughtRow]:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, body, tags, embedding, created_at FROM thoughts WHERE id = ?",
            (thought_id,),
        )
        row = cursor.fetchone()

    if row is None:
        return None

    return ThoughtRow(
        id=row[0],
        body=row[1],
        tags=json.loads(row[2]),
        embedding=row[3],
        created_at=row[4],
    )


def delete_thought(thought_id: int) -> bool:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM thoughts WHERE id = ?", (thought_id,))
        conn.commit()
        return cursor.rowcount > 0


def get_thoughts_in_range(start_iso: str, end_iso: str) -> list[ThoughtRow]:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, body, tags, embedding, created_at
            FROM thoughts
            WHERE created_at >= ? AND created_at <= ?
            ORDER BY created_at DESC
            """,
            (start_iso, end_iso),
        )
        rows = cursor.fetchall()

    return [
        ThoughtRow(
            id=row[0],
            body=row[1],
            tags=json.loads(row[2]),
            embedding=row[3],
            created_at=row[4],
        )
        for row in rows
    ]


def search_by_tag(tag: str) -> list[ThoughtRow]:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, body, tags, embedding, created_at
            FROM thoughts
            WHERE tags LIKE ?
            ORDER BY created_at DESC
            """,
            (f'%"{tag}"%',),
        )
        rows = cursor.fetchall()

    return [
        ThoughtRow(
            id=row[0],
            body=row[1],
            tags=json.loads(row[2]),
            embedding=row[3],
            created_at=row[4],
        )
        for row in rows
    ]


def get_tag_counts() -> dict[str, int]:
    thoughts = get_all_thoughts()
    counts = {}
    for thought in thoughts:
        for tag in thought.tags:
            counts[tag] = counts.get(tag, 0) + 1
    return counts


def count_thoughts() -> int:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM thoughts")
        result = cursor.fetchone()
    return result[0] if result else 0


def get_latest_thought() -> Optional[ThoughtRow]:
    thoughts = get_all_thoughts()
    return thoughts[0] if thoughts else None
