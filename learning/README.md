# Learning Mode

This folder stores your personal paper collection and reading notes.

## Quick Start

1. **Fork** this repository
2. Go to the **main page** → select papers → click **Download JSON**
3. Save the file as `learning/papers.json` in your fork
4. Create reading notes as Markdown files: `learning/{paper-id}.md`
5. Commit & push — your Learning page will auto-load everything

## File Structure

```
learning/
├── papers.json          ← your paper collection (from Download)
├── chang-2025.md        ← reading note for paper "chang-2025"
├── cook-2021.md         ← reading note for paper "cook-2021"
└── ...
```

## Paper IDs

Each paper has a short ID like `chang-2025` (first-author-year). You can see the ID on each card in Learning Mode. Use this ID as the filename for your notes.

## Note Format

Notes are plain Markdown. Example `chang-2025.md`:

```markdown
# Key Findings

- Three distinct seismic events identified from spectrograms
- Sliding direction from single-force inversion: 153.67°
- Volume estimation: 557,118 m³ (close to geological survey result)

## Methods
- Spectrogram analysis (DFT + discrete Stockwell transform)
- Single-force inversion for sliding direction and mass estimation
- Geohazard location for source constraint

## Questions
- Can this workflow be generalized to other deep-seated landslide types?
```

## No `papers.json` yet?

If you haven't added a `papers.json`, the Learning page will show an upload zone where you can drag & drop a JSON/CSV file for a quick preview.
