from datetime import datetime
from typing import Optional
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from .db import ThoughtRow

console = Console()


def print_thought(thought: ThoughtRow, show_id: bool = True) -> None:
    timestamp = datetime.fromisoformat(thought.created_at).strftime("%Y-%m-%d %H:%M")

    if thought.tags:
        tags_str = " ".join(f"[magenta]{tag}[/magenta]" for tag in thought.tags)
    else:
        tags_str = "[dim]no tags[/dim]"

    title = f"#{thought.id} — {timestamp}" if show_id else timestamp
    content = f"{thought.body}\n\n{tags_str}"

    panel = Panel(content, title=title, expand=False)
    console.print(panel)


def print_thought_list(
    thoughts: list[ThoughtRow],
    scores: Optional[list[float]] = None,
) -> None:
    if not thoughts:
        console.print("[yellow]No thoughts found.[/yellow]")
        return

    for i, thought in enumerate(thoughts):
        timestamp = datetime.fromisoformat(thought.created_at).strftime("%Y-%m-%d %H:%M")
        tags_str = " ".join(f"[magenta]{tag}[/magenta]" for tag in thought.tags) if thought.tags else ""

        score_str = ""
        if scores and i < len(scores):
            score = scores[i]
            if score > 0.85:
                score_str = " [green]very relevant[/green]"
            elif score > 0.70:
                score_str = " [cyan]relevant[/cyan]"
            elif score > 0.55:
                score_str = " [yellow]somewhat related[/yellow]"

        console.print(f"#{thought.id}  {timestamp}  {tags_str}{score_str}")
        console.print(f"  {thought.body[:100]}..." if len(thought.body) > 100 else f"  {thought.body}")
        console.print()


def print_error(msg: str) -> None:
    console.print(f"[red]✗ {msg}[/red]")


def print_warning(msg: str) -> None:
    console.print(f"[yellow]⚠ {msg}[/yellow]")


def print_success(msg: str) -> None:
    console.print(f"[green]✓ {msg}[/green]")


def print_tag_frequency(tag_counts: dict[str, int], top_n: int = 15) -> None:
    if not tag_counts:
        console.print("[yellow]No tags found.[/yellow]")
        return

    sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:top_n]

    table = Table(title="Topic Frequency")
    table.add_column("Rank", style="dim")
    table.add_column("Tag")
    table.add_column("Count", justify="right")
    table.add_column("", width=20)

    max_count = sorted_tags[0][1] if sorted_tags else 1

    for rank, (tag, count) in enumerate(sorted_tags, 1):
        bar_width = int((count / max_count) * 20)
        bar = "█" * bar_width
        table.add_row(str(rank), tag, str(count), bar)

    console.print(table)


def print_timeline(date_counts: dict[str, int]) -> None:
    if not date_counts:
        console.print("[yellow]No entries in this range.[/yellow]")
        return

    sorted_dates = sorted(date_counts.items())

    max_count = max(date_counts.values()) if date_counts else 1

    console.print("\n[bold]Entry Frequency Over Time[/bold]\n")
    for date, count in sorted_dates:
        bar_width = int((count / max_count) * 40)
        bar = "▄" * bar_width
        console.print(f"{date}  {bar} {count}")
    console.print()
