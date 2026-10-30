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

<<<<<<< HEAD
## Art slice: the fishing view (next)

Painted sprites and backdrop plates on the 3D stage. The board, pieces, stump and water stay 3D.
Everything should come from the same reference sheet: same palette, light from the upper left, soft watercolour edges, transparent background.
Put the files in `art/` (folders below). Rough versions are fine to start; they're swapped by file name.

| # | Asset | Folder / name | Size | Notes |
|---|---|---|---|---|
| 1 | Far shore and mountains panorama | `art/plates/far.png` | 6144 x 1536 | Transparent sky. Wide enough for the head to turn about 50° either way. Horizon about 60% down. |
| 2 | Sky, day | `art/plates/sky_day.jpg` | 4096 x 1024 | Soft clouds. Day/night tinting is done in code. |
| 3 | Sky, night (optional) | `art/plates/sky_night.jpg` | 4096 x 1024 | Stars and a moonlit haze. Without it, the day sky is tinted. |
| 4 | Mid-ground cut-outs | `art/cutouts/tree1.png`... | 1024-2048 tall | 3-5 trees, a reed clump, the cabin, the tent, a jetty. One object per file, trimmed tight. |
| 5 | Liam seated, side view facing the water | `art/people/liam_side.png` | 2048 tall | What Xiao sees beside him when fishing. |
| 6 | Xiao seated, side view facing the water | `art/people/xiao_side.png` | 2048 tall | What Liam sees. |
| 7 | Liam seated, three-quarter front | `art/people/liam_front.png` | 2048 tall | Seen across the board. |
| 8 | Xiao seated, three-quarter front | `art/people/xiao_front.png` | 2048 tall | Seen across the board. |
| 9 | Both from behind | `art/people/liam_back.png`, `xiao_back.png` | 2048 tall | Title and pick screens. |
| 10 | Props | `art/props/radio.png`, `bucket.png`, `crate.png`, `chair.png` | 1024 tall | The things you can click while fishing. |
| 11 | Ground and path | `art/ground/grass.png`, `path.png` | 1024 x 1024, tileable | |
| 12 | Fish | `fish/<id>.png` | about 1024 wide | 18 kinds now; ids are in `src/game/fishing.js`. Facing right. |
| 13 | Title logo | `art/logo.png` or `.svg` | 1600 wide | |

Do 1, 5 and 6 first: they're most of the screen most of the time.
=======
Coming later (not wired yet):

| Asset | Format | Size |
|---|---|---|
| Character turnarounds (front, side, back) | PNG, transparent | 2048 px tall, same pose and scale per sheet |
| Scene / sky backdrop painting | PNG or JPG | 4096 x 2048 (2:1) |
| Ground, mountain and cabin textures | PNG, tileable | 1024 x 1024 (or 2048 for big surfaces) |
| Title logo | SVG or transparent PNG | 1600 px wide |
>>>>>>> origin/main

Browsers need a click before they play sound, so music starts on your first click.
