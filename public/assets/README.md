# Dropping in your own art and sound

Everything is listed in `src/assets/manifest.js`. Anything left `null` uses a built-in placeholder.
Vite serves `public/` at the site root, so files live in `public/assets/...` but the manifest paths are written WITHOUT `public/`, e.g. `'assets/audio/music/song.mp3'`.

## Recommended specs

| Asset | Folder | Format | Size / length |
|---|---|---|---|
| Fish art (one per kind) | `fish/` | PNG or WebP, transparent | Any aspect ratio (it is no longer squished). Fish facing RIGHT, tightly cropped, about 1024 px wide (long side). Under 500 KB each. |
| Music | `audio/music/` | MP3 or OGG, 128-192 kbps, stereo | 2-4 min each. Soft, loop-friendly endings. Normalise to about -16 LUFS. Any number of tracks. |
| Sound effects | `audio/sfx/` | OGG or WAV, mono, 44.1 kHz | Under 2 s each (clicks and blips under 0.5 s). Names: see `SFX` in the manifest. |
| Ambience loops | `audio/ambience/` | OGG or MP3, stereo | 30-60 s, seamless loop, quiet and steady. Names: water, day, night, frogs, fire. |

## Art status (Nov 2026)

The painted art lives in `art/` and every file is listed in `ART` in the manifest. Specs and prompts for new pieces are in `ART_ASSETS.md` (git-ignored). Sheets are cut and cleaned with `npm run clean-art` (`tools/`, git-ignored).

**In the game:**
- people (seated side/front/back, plus standing front/back for the gallery)
- plates (far shore, day and night skies)
- forest strips, clouds, ground (grass, path, water, bank)
- cut-outs (trees, reeds, cabin, tent, jetty, clearing, path entry, boat, lily pads, log, stump)
- props (radio, bucket, crate, chair, cooler, bait tin, lantern, firefly jar, fire ring, cairn, blanket, bedroll, backpack)
- scatter (boulders, rocks, pebbles, tufts, clumps, bushes, flowers)
- a dragonfly
- the gallery cabin interior
- fish art for all 21 kinds
- the lake bank texture and the title logo art

**Still wanted:**

| Asset | Folder / name | Notes |
|---|---|---|
| Gallery activity scenes (5) | `art/gallery/couch.png`, `phone.png`, `cards.png`, `kettle.png`, `window.png` | Liam and Xiao together, 1536 x 1536, transparent. Set `src` in `ART.gallery.activities`. |
| App icon | `icon-512.png` (in `public/`) | Square, for `manifest.webmanifest`, so Android offers to install. |
| Sun and moon sprites (optional) | `SKY_ART` | Without them, a generated glow is used. |
| Sounds | `audio/sfx/`, `audio/ambience/` | All synthesised placeholders for now; names are in the manifest. |

Browsers need a click before they play sound, so music starts on your first click.
