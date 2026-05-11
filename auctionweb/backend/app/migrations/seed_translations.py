"""
Migration script: Seed translations from frontend JSON locale files into the database.
Reads en.json, vi.json, ko.json → flattens nested keys → inserts/updates translations table.

Usage:
    cd backend
    python -m app.migrations.seed_translations

Rules:
    - Runs only ONCE (skips if migration flag already exists in DB or file marker).
    - If `description` already exists → UPDATE vi, en, kr columns only.
    - If `description` does not exist → INSERT new row with auto-increment id (L00001, L00002, ...).
    - Does NOT delete any existing rows.
    - Does NOT affect any other backend logic.
"""

import json
import os
import sys
from datetime import datetime

from sqlalchemy import text
from app.core.database import engine, SessionLocal
from app.models.Translation import Translation


# ── Path to frontend locale files ────────────────────────────────────────────
LOCALES_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "frontend", "src", "locales"
)

# ── Migration marker file (prevents duplicate runs) ─────────────────────────
MIGRATION_MARKER = os.path.join(os.path.dirname(__file__), ".seed_translations_done")

EVENT_USER = "Admin"


# ── Helpers ──────────────────────────────────────────────────────────────────

def flatten_json(data: dict, parent_key: str = "", sep: str = ".") -> dict:
    """
    Flatten a nested JSON dict into a single-level dict.
    Example: {"success": {"add": "OK"}} → {"success.add": "OK"}
    """
    items = {}
    for key, value in data.items():
        new_key = f"{parent_key}{sep}{key}" if parent_key else key
        if isinstance(value, dict):
            items.update(flatten_json(value, new_key, sep))
        else:
            items[new_key] = str(value)
    return items


def load_locale_file(filename: str) -> dict:
    """Load and flatten a single JSON locale file."""
    filepath = os.path.normpath(os.path.join(LOCALES_DIR, filename))
    if not os.path.exists(filepath):
        print(f"  [WARN] File not found: {filepath}")
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        raw = json.load(f)
    return flatten_json(raw)


def get_next_id(db) -> int:
    """
    Get the next numeric part for the translation ID.
    Scans existing IDs like 'L00001' and returns max + 1.
    """
    result = db.execute(
        text("SELECT MAX(CAST(SUBSTRING(id, 2) AS UNSIGNED)) FROM translations")
    ).scalar()
    return (result or 0) + 1


def make_id(seq: int) -> str:
    """Format sequential number into ID like L00001."""
    return f"L{seq:05d}"


# ── Main migration logic ────────────────────────────────────────────────────

def run_migration():
    # ── Guard: skip if already executed ──────────────────────────────────
    if os.path.exists(MIGRATION_MARKER):
        print("[SKIP] Migration already executed. Remove marker to re-run:")
        print(f"       {MIGRATION_MARKER}")
        return

    print("=" * 60)
    print("  MIGRATION: Seed translations from frontend JSON files")
    print("=" * 60)

    # ── Load all 3 locale files ──────────────────────────────────────────
    print("\n[1/4] Loading locale files...")
    en_data = load_locale_file("en.json")
    vi_data = load_locale_file("vi.json")
    ko_data = load_locale_file("ko.json")

    print(f"  en.json: {len(en_data)} keys")
    print(f"  vi.json: {len(vi_data)} keys")
    print(f"  ko.json: {len(ko_data)} keys")

    # ── Merge all unique description keys ────────────────────────────────
    all_keys = sorted(set(en_data.keys()) | set(vi_data.keys()) | set(ko_data.keys()))
    print(f"\n[2/4] Total unique keys: {len(all_keys)}")

    # ── Open DB session ──────────────────────────────────────────────────
    db = SessionLocal()
    try:
        # ── Get existing descriptions from DB ────────────────────────────
        print("\n[3/4] Checking existing translations in DB...")
        existing = {
            t.description: t
            for t in db.query(Translation).all()
        }
        print(f"  Existing rows in DB: {len(existing)}")

        # ── Determine next available ID ──────────────────────────────────
        next_seq = get_next_id(db)
        now = datetime.now()

        inserted = 0
        updated = 0

        print("\n[4/4] Processing translations...")

        for desc_key in all_keys:
            en_val = en_data.get(desc_key)
            vi_val = vi_data.get(desc_key)
            kr_val = ko_data.get(desc_key)

            if desc_key in existing:
                # ── UPDATE: description already exists ───────────────────
                record = existing[desc_key]
                record.vi = vi_val if vi_val is not None else record.vi
                record.en = en_val if en_val is not None else record.en
                record.kr = kr_val if kr_val is not None else record.kr
                record.event_time = now
                record.event_user = EVENT_USER
                updated += 1
            else:
                # ── INSERT: new description ──────────────────────────────
                new_record = Translation(
                    id=make_id(next_seq),
                    description=desc_key,
                    vi=vi_val,
                    en=en_val,
                    kr=kr_val,
                    event_time=now,
                    event_user=EVENT_USER,
                )
                db.add(new_record)
                next_seq += 1
                inserted += 1

        db.commit()

        # ── Write migration marker file ──────────────────────────────────
        with open(MIGRATION_MARKER, "w", encoding="utf-8") as f:
            f.write(f"Executed at: {now.isoformat()}\n")
            f.write(f"Inserted: {inserted}\n")
            f.write(f"Updated: {updated}\n")

        print("\n" + "=" * 60)
        print(f"  DONE!  Inserted: {inserted} | Updated: {updated}")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Migration failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_migration()
