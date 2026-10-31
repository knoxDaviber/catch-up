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
| 14 | Gallery cabin interior plate | `art/gallery/interior.png` | 3840 x 2160, opaque | Fills the view behind the tank in the fish gallery; tinted at night in code. Set `ART.gallery.backdrop`. |
| 14b | Gallery indoor activity scenes (Liam and Xiao together, 5) | `art/gallery/couch.png`, `phone.png`, `cards.png`, `kettle.png`, `window.png` | 1536 x 1536, transparent | Stand in front of the interior plate. Set `src` in `ART.gallery.activities`. |
| 15 | Lake bank and water textures | `art/ground/bank.png`, `water.png` | 1024 x 1024, tileable | |
| 16 | Forest backdrop strips | `art/plates/forest_near.png`, `forest_mid.png`, `forest_far.png` | 4096 x 1024, transparent, wrapping | Bush ring around the camp. |
| 17 | Clouds | `art/clouds/cumulus.png`, `streaks.png`, `fluff1.png`, `fluff2.png` | 2048 x 1024, 2048 x 512, 1024 x 512 | Transparent. |

Do 1, 5 and 6 first: they're most of the screen most of the time.

Browsers need a click before they play sound, so music starts on your first click.
