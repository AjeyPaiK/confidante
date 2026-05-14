import json
import sys
from datetime import datetime, timedelta
from typing import Optional
from collections import Counter
import typer

from .db import (
    init_db,
    insert_thought,
    get_all_thoughts,
    delete_thought,
    get_thought,
    update_thought,
)
from .display import (
    print_thought,
    print_thought_list,
    print_error,
    print_success,
    print_warning,
    print_tag_frequency,
    print_timeline,
)

app = typer.Typer(help="Confidante — private thought journal for emotional self-assessment")

init_db()


def parse_since(since_str: str) -> str:
    """Parse --since flag (e.g. '7d', '30d') into ISO timestamp."""
    if not since_str or since_str[-1] != "d":
        return since_str

    try:
        days = int(since_str[:-1])
        start = datetime.now() - timedelta(days=days)
        return start.isoformat()
    except ValueError:
        return since_str


def output_json(obj) -> None:
    """Output JSON to stdout without Rich formatting."""
    sys.stdout.write(json.dumps(obj) + "\n")
    sys.stdout.flush()


@app.command()
def write(
    text: str = typer.Argument(..., help="Your thought"),
    no_tag: bool = typer.Option(False, "--no-tag", help="Skip AI tagging"),
    no_embed: bool = typer.Option(False, "--no-embed", help="Skip embedding"),
    at: Optional[str] = typer.Option(
        None, "--at", help="Backdate entry (YYYY-MM-DD HH:MM format)"
    ),
    json_out: bool = typer.Option(False, "--json", help="Output machine-readable JSON"),
) -> None:
    """Store a thought without AI response."""
    if not text.strip():
        if json_out:
            output_json({"status": "error", "message": "Thought cannot be empty."})
        else:
            print_error("Thought cannot be empty.")
        raise typer.Exit(1)

    created_at = None
    if at:
        try:
            dt = datetime.strptime(at, "%Y-%m-%d %H:%M")
            created_at = dt.isoformat()
        except ValueError:
            if json_out:
                output_json({"status": "error", "message": "Invalid date format. Use YYYY-MM-DD HH:MM"})
            else:
                print_error("Invalid date format. Use YYYY-MM-DD HH:MM")
            raise typer.Exit(1)

    thought_id = insert_thought(body=text, created_at=created_at)
    tags = []

    try:
        if not no_tag:
            from .tagger import extract_tags
            if json_out:
                output_json({"status": "tagging"})
            try:
                tags = extract_tags(text)
            except Exception as e:
                if not json_out:
                    print_warning(f"Tagging failed: {e}")
                tags = []

        if not no_embed:
            if json_out:
                output_json({"status": "embedding"})
            try:
                from .embeddings import embed
                embedding_bytes = embed(text)
                update_thought(thought_id, embedding=embedding_bytes)
            except Exception as e:
                if not json_out:
                    print_warning(f"Embedding failed: {e}")

        if tags:
            update_thought(thought_id, tags=tags)

        if json_out:
            output_json({"status": "done", "id": thought_id, "tags": tags})
        else:
            if tags:
                tags_display = " ".join(f"[magenta]{tag}[/magenta]" for tag in tags)
                print_success(f"Logged #{thought_id}. Tags: {tags_display}")
            else:
                print_success(f"Logged #{thought_id}.")
    except Exception as e:
        if json_out:
            output_json({"status": "error", "message": str(e)})
        else:
            print_error(f"Error: {e}")
        raise typer.Exit(1)


@app.command()
def search(
    query: str = typer.Argument(..., help="Search query"),
    top: int = typer.Option(5, "--top", help="Number of results to show"),
    since: Optional[str] = typer.Option(None, "--since", help="Show results from last Nd days"),
    tag: Optional[str] = typer.Option(None, "--tag", help="Filter by tag before searching"),
    json_out: bool = typer.Option(False, "--json", help="Output machine-readable JSON"),
) -> None:
    """Search thoughts semantically."""
    from .search import semantic_search

    thoughts = get_all_thoughts()

    if not thoughts:
        if json_out:
            output_json([])
        else:
            print_warning("No thoughts yet.")
        return

    if since:
        since_dt = parse_since(since)
        thoughts = [t for t in thoughts if t.created_at >= since_dt]

    if tag:
        thoughts = [t for t in thoughts if tag in t.tags]

    if not thoughts:
        if json_out:
            output_json([])
        else:
            print_warning("No thoughts match your filters.")
        return

    results = semantic_search(query, thoughts, top_k=top)

    if not results:
        if json_out:
            output_json([])
        else:
            print_warning("No relevant thoughts found.")
        return

    if json_out:
        result_list = [
            {
                "id": thought.id,
                "body": thought.body,
                "tags": thought.tags,
                "created_at": thought.created_at,
                "score": float(score),
            }
            for score, thought in results
        ]
        output_json(result_list)
    else:
        scores = [score for score, _ in results]
        result_thoughts = [thought for _, thought in results]
        print_thought_list(result_thoughts, scores=scores)


@app.command()
def log(
    limit: int = typer.Option(20, "--limit", help="Number of entries to show"),
    since: Optional[str] = typer.Option(None, "--since", help="Show entries from last Nd days"),
    tag: Optional[str] = typer.Option(None, "--tag", help="Filter by tag"),
    today: bool = typer.Option(False, "--today", help="Show only today's entries"),
    json_out: bool = typer.Option(False, "--json", help="Output machine-readable JSON"),
) -> None:
    """View your thoughts chronologically."""
    thoughts = get_all_thoughts()

    if not thoughts:
        if json_out:
            output_json([])
        else:
            print_warning("No thoughts yet.")
        return

    if today:
        today_str = datetime.now().date().isoformat()
        thoughts = [t for t in thoughts if t.created_at.startswith(today_str)]

    if since:
        since_dt = parse_since(since)
        thoughts = [t for t in thoughts if t.created_at >= since_dt]

    if tag:
        thoughts = [t for t in thoughts if tag in t.tags]

    thoughts = thoughts[:limit]

    if not thoughts:
        if json_out:
            output_json([])
        else:
            print_warning("No thoughts match your filters.")
        return

    if json_out:
        result_list = [
            {"id": t.id, "body": t.body, "tags": t.tags, "created_at": t.created_at}
            for t in thoughts
        ]
        output_json(result_list)
    else:
        print_thought_list(thoughts)


@app.command()
def show(thought_id: int = typer.Argument(..., help="Entry ID")) -> None:
    """Show a single entry in full."""
    thought = get_thought(thought_id)
    if not thought:
        print_error(f"Entry #{thought_id} not found.")
        raise typer.Exit(1)

    print_thought(thought)


@app.command()
def delete(thought_id: int = typer.Argument(..., help="Entry ID")) -> None:
    """Delete an entry (cannot be undone)."""
    thought = get_thought(thought_id)
    if not thought:
        print_error(f"Entry #{thought_id} not found.")
        raise typer.Exit(1)

    confirm = typer.confirm(f"Really delete entry #{thought_id}? This cannot be undone.")
    if not confirm:
        print_warning("Cancelled.")
        return

    delete_thought(thought_id)
    print_success(f"Deleted entry #{thought_id}.")


@app.command()
def themes(
    top: int = typer.Option(15, "--top", help="Number of tags to show"),
    since: Optional[str] = typer.Option(None, "--since", help="Show themes from last Nd days"),
    json_out: bool = typer.Option(False, "--json", help="Output machine-readable JSON"),
) -> None:
    """View topic frequency analysis."""
    thoughts = get_all_thoughts()

    if not thoughts:
        if json_out:
            output_json({})
        else:
            print_warning("No thoughts yet.")
        return

    if since:
        since_dt = parse_since(since)
        thoughts = [t for t in thoughts if t.created_at >= since_dt]

    tag_counts = {}
    for thought in thoughts:
        for tag in thought.tags:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1

    if json_out:
        output_json(tag_counts)
    else:
        print_tag_frequency(tag_counts, top_n=top)


@app.command()
def timeline(
    since: Optional[str] = typer.Option("30d", "--since", help="Show last Nd days (default 30d)"),
    tag: Optional[str] = typer.Option(None, "--tag", help="Filter by tag"),
    json_out: bool = typer.Option(False, "--json", help="Output machine-readable JSON"),
) -> None:
    """View entries timeline with frequency chart."""
    thoughts = get_all_thoughts()

    if not thoughts:
        if json_out:
            output_json({})
        else:
            print_warning("No thoughts yet.")
        return

    since_dt = parse_since(since)
    thoughts = [t for t in thoughts if t.created_at >= since_dt]

    if tag:
        thoughts = [t for t in thoughts if tag in t.tags]

    if not thoughts:
        if json_out:
            output_json({})
        else:
            print_warning("No thoughts in this range.")
        return

    date_counts = Counter()
    for thought in thoughts:
        date = thought.created_at.split("T")[0]
        date_counts[date] += 1

    if json_out:
        output_json(dict(date_counts))
    else:
        print_timeline(dict(date_counts))


@app.command()
def reindex(
    missing_only: bool = typer.Option(False, "--missing-only", help="Only reindex entries without embeddings")
) -> None:
    """Rebuild embeddings for entries."""
    from .embeddings import embed

    thoughts = get_all_thoughts()

    if missing_only:
        thoughts = [t for t in thoughts if t.embedding is None]

    if not thoughts:
        print_warning("No thoughts to reindex.")
        return

    with typer.progressbar(length=len(thoughts), label="Reindexing") as progress:
        for thought in thoughts:
            try:
                embedding_bytes = embed(thought.body)
                update_thought(thought.id, embedding=embedding_bytes)
            except Exception as e:
                print_warning(f"Failed to embed #{thought.id}: {e}")
            progress.update(1)

    print_success(f"Reindexed {len(thoughts)} entries.")


@app.command()
def status(json_out: bool = typer.Option(False, "--json", help="Output machine-readable JSON")) -> None:
    """Check system status and Ollama connectivity."""
    from .config import DB_PATH
    from .db import count_thoughts, get_latest_thought
    from rich.console import Console

    count = count_thoughts()
    latest = get_latest_thought()

    latest_id = latest.id if latest else None
    latest_at = latest.created_at if latest else None

    ollama_available = False
    try:
        import httpx
        from .config import OLLAMA_BASE
        response = httpx.get(f"{OLLAMA_BASE}/api/tags", timeout=2)
        ollama_available = response.status_code == 200
    except Exception:
        pass

    if json_out:
        output_json({
            "entries": count,
            "latest_id": latest_id,
            "latest_at": latest_at,
            "ollama": ollama_available,
        })
    else:
        console = Console()

        console.print("\n[bold]Confidante Status[/bold]")
        console.print(f"Database: {DB_PATH}")
        console.print(f"Entries: {count}")

        if latest:
            dt = datetime.fromisoformat(latest.created_at)
            console.print(f"Latest: {dt.strftime('%Y-%m-%d %H:%M')} (#{latest.id})")

        if ollama_available:
            console.print(f"\n[green]✓ Ollama: Connected[/green]")
            try:
                import httpx
                from .config import OLLAMA_BASE
                response = httpx.get(f"{OLLAMA_BASE}/api/tags", timeout=2)
                data = response.json()
                models = [m["name"] for m in data.get("models", [])]
                for model in models:
                    console.print(f"  - {model}")
            except Exception:
                pass
        else:
            console.print(f"\n[red]✗ Ollama: Not available[/red]")

        console.print()


if __name__ == "__main__":
    app()
