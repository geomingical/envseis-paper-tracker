#!/usr/bin/env python3
"""
Classify 585 environmental seismology papers into 8 topic categories
and generate papers.json with simplified IDs (author-year format).
"""

import json
import re
from collections import Counter, defaultdict
from pathlib import Path

SOURCE = (
    Path(__file__).parent.parent
    / "EnvSeis_paper"
    / "environmental_seismology_papers_v17_filtered.json"
)
OUTPUT = Path(__file__).parent / "papers.json"

# ── Topic classification rules (order matters: first match wins) ──
TOPIC_RULES = [
    (
        "debris-flow",
        [
            "debris flow",
            "debris-flow",
            "lahar",
            "mudflow",
            "hyperconcentrated",
            "mud flow",
        ],
    ),
    (
        "landslide",
        [
            "landslide",
            "rockfall",
            "rock fall",
            "rock-fall",
            "mass movement",
            "mass wasting",
            "slope failure",
            "slope stability",
            "landquake",
            "rock avalanche",
            "rockslide",
            "rock slide",
            "landslip",
            "slope collapse",
            "cliff collapse",
            "calving",
        ],
    ),
    (
        "glacier",
        [
            "glacier",
            "glacial",
            "ice sheet",
            "ice stream",
            "firn",
            "cryoseism",
            "icequake",
            "ice quake",
            "antarctic",
            "arctic",
            "snow avalanche",
            "ice cap",
            "permafrost",
            "frozen",
        ],
    ),
    (
        "river",
        [
            "river",
            "bedload",
            "bed load",
            "fluvial",
            "stream flow",
            "streamflow",
            "baseflow",
            "turbulence",
            "boulder",
            "sediment transport",
            "gravel",
            "channel",
        ],
    ),
    (
        "hydrology",
        [
            "groundwater",
            "water table",
            "hydrol",
            "water storage",
            "soil moisture",
            "aquifer",
            "precipitation",
            "rainfall",
            "drought",
            "water level",
            "pore pressure",
        ],
    ),
    (
        "volcano",
        [
            "volcan",
            "eruption",
            "magma",
            "lava",
            "pyroclastic",
            "volcanic tremor",
            "fumarole",
        ],
    ),
    (
        "methods",
        [
            "ambient noise",
            "dv/v",
            "interferometry",
            "machine learning",
            "deep learning",
            "neural network",
            "classification method",
            "detection method",
            "tomography",
            "inversion method",
        ],
    ),
    ("other", []),  # catch-all
]

TOPIC_META = {
    "landslide": {
        "name": "Landslide & Mass Movement",
        "icon": "mountain",
        "color": "#ef4444",
    },
    "debris-flow": {
        "name": "Debris Flow & Lahar",
        "icon": "droplets",
        "color": "#f97316",
    },
    "glacier": {
        "name": "Glacier & Cryoseismology",
        "icon": "snowflake",
        "color": "#06b6d4",
    },
    "river": {"name": "River & Bedload", "icon": "waves", "color": "#3b82f6"},
    "hydrology": {
        "name": "Hydrology & Groundwater",
        "icon": "droplet",
        "color": "#8b5cf6",
    },
    "volcano": {"name": "Volcano", "icon": "flame", "color": "#dc2626"},
    "methods": {"name": "Seismic Methods & ML", "icon": "cpu", "color": "#10b981"},
    "other": {"name": "Other", "icon": "globe", "color": "#6b7280"},
}


def classify(paper: dict) -> str:
    """Return topic key for a paper based on title + abstract keywords."""
    text = ((paper.get("title") or "") + " " + (paper.get("abstract") or "")).lower()
    for topic_key, keywords in TOPIC_RULES:
        if topic_key == "other":
            return "other"
        for kw in keywords:
            if kw in text:
                return topic_key
    return "other"


def make_id(paper: dict, seen: dict) -> str:
    """Generate author-year ID like 'feng-2026'. Handle duplicates with a/b/c."""
    authors = paper.get("authors") or []
    if authors:
        first = authors[0]
        first_author = (
            first.get("name", "unknown") if isinstance(first, dict) else str(first)
        )
        parts = first_author.strip().split()
        surname = parts[-1].lower() if parts else "unknown"
        surname = re.sub(r"[^a-z]", "", surname)
    else:
        surname = "unknown"

    year = paper.get("year") or 0
    base = f"{surname}-{year}"

    if base not in seen:
        seen[base] = 0
        return base
    else:
        seen[base] += 1
        suffix = chr(ord("a") + seen[base])  # a, b, c, ...
        return f"{base}{suffix}"


def build_doi_url(paper: dict) -> str:
    doi = (paper.get("externalIds") or {}).get("DOI")
    if doi:
        return f"https://doi.org/{doi}"
    return paper.get("url") or ""


def transform_paper(paper: dict, new_id: str, topic: str) -> dict:
    """Transform a raw paper into the simplified output format."""
    authors = paper.get("authors") or []
    author_names = [
        a.get("name", "") if isinstance(a, dict) else str(a) for a in authors
    ]

    journal = paper.get("journal")
    if isinstance(journal, dict):
        journal_name = journal.get("name", "")
    elif isinstance(journal, str):
        journal_name = journal
    else:
        journal_name = ""

    return {
        "id": new_id,
        "title": paper.get("title") or "",
        "authors": author_names,
        "year": paper.get("year") or 0,
        "category": topic,
        "journal": journal_name,
        "doi": (paper.get("externalIds") or {}).get("DOI", ""),
        "url": build_doi_url(paper),
        "abstract": paper.get("abstract") or "",
        "summary": paper.get("imrad_summary") or "",
        "citationCount": paper.get("citationCount") or 0,
        "semanticScholarId": paper.get("paperId") or "",
    }


def main():
    with open(SOURCE) as f:
        raw_papers = json.load(f)

    print(f"Loaded {len(raw_papers)} papers from source.")

    seen_ids: dict[str, int] = {}
    output_papers = []
    topic_counts = Counter()

    for p in raw_papers:
        topic = classify(p)
        new_id = make_id(p, seen_ids)
        transformed = transform_paper(p, new_id, topic)
        output_papers.append(transformed)
        topic_counts[topic] += 1

    # Sort by year (desc), then by title
    output_papers.sort(key=lambda x: (-x["year"], x["title"]))

    # Build categories list
    categories = []
    for key, meta in TOPIC_META.items():
        categories.append(
            {
                "key": key,
                "name": meta["name"],
                "icon": meta["icon"],
                "color": meta["color"],
                "count": topic_counts.get(key, 0),
            }
        )

    result = {
        "categories": categories,
        "papers": output_papers,
        "meta": {
            "totalPapers": len(output_papers),
            "yearRange": [
                min(p["year"] for p in output_papers if p["year"]),
                max(p["year"] for p in output_papers if p["year"]),
            ],
            "generatedAt": __import__("datetime").datetime.now().isoformat(),
        },
    }

    with open(OUTPUT, "w") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\nOutput: {OUTPUT}")
    print(f"Total: {len(output_papers)} papers")
    print("\nTopic distribution:")
    for key, meta in TOPIC_META.items():
        print(f"  {meta['name']}: {topic_counts.get(key, 0)}")


if __name__ == "__main__":
    main()
