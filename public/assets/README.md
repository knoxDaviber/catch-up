# Dropping in your own art and sound

Everything is listed in `src/assets/manifest.js`. Anything left `null` uses a built-in placeholder.
Vite serves `public/` at the site root, so files live in `public/assets/...` but the manifest paths are written WITHOUT `public/`, e.g. `'assets/audio/music/song.mp3'`.

## Recommended specs

| Asset | Folder | Format | Size / length |
|---|---|---|---|
| Fish art (one per kind) | `fish/` | PNG or WebP, transparent | Any aspect ratio (it is no longer squished). Fish facing RIGHT, tightly cropped, about 1024 px wide (long side). Under 500 KB each. |
| Music | `audio/music/` | MP3 or OGG, 128-192 kbps, stereo | 2-4 min each. Soft, loop-friendly endings. Normalise to about -16 LUFS. Any number of tracks. |
| Sound effects | `audio/sfx/` | OGG or WAV, mono, 44.1 kHz | Under 2 s each (clicks and blips under 0.5 s). Names: click, select, move, capture, splash, nibble, bite, reel, catch, grunt, blip, pop. |
| Ambience loops | `audio/ambience/` | OGG or MP3, stereo | 30-60 s, seamless loop, quiet and steady. Names: water, day (birds), night (crickets), fire. |

Coming later (not wired yet):

| Asset | Format | Size |
|---|---|---|
| Character turnarounds (front, side, back) | PNG, transparent | 2048 px tall, same pose and scale per sheet |
| Scene / sky backdrop painting | PNG or JPG | 4096 x 2048 (2:1) |
| Ground, mountain and cabin textures | PNG, tileable | 1024 x 1024 (or 2048 for big surfaces) |
| Title logo | SVG or transparent PNG | 1600 px wide |

Browsers need a click before they play sound, so music starts on your first click.
