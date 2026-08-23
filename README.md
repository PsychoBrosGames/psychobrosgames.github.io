# PsychoBros

The official PsychoBros site: independent game reviews, commentary, streams, and event
coverage from three longtime friends with very different player perspectives.

## Local preview

Generate the static pages, then serve the repository root with any static file server:

```powershell
node .\scripts\build-site.mjs
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Review content

All review content lives in `data/reviews.json` — one record per review, spanning 2015
to the present. After editing review data or page templates, run
`node .\scripts\build-site.mjs` and commit the generated HTML, SVG cover art, and
sitemap updates.

The generator produces the homepage, review archive, per-year and per-tag collections,
About page, individual review pages, artwork in `assets/reviews`, and `sitemap.xml`.

## Deployment

GitHub Pages publishes the root of `main` to
[psychobrosgames.github.io](https://psychobrosgames.github.io/). Merging a change to `main`
triggers a new Pages build automatically.
