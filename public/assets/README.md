# Dropping in your own art and sound

Everything is listed in `src/assets/manifest.js`. Anything left `null` uses a built-in placeholder.
Vite serves `public/` at the site root, so files live in `public/assets/...` but the manifest paths are written WITHOUT `public/`, e.g. `'assets/audio/music/song.ogg'`.

## Recommended specs

| Asset | Folder | Format | Size / length |
|---|---|---|---|
| Fish art (one per kind) | `fish/` | PNG, transparent | Any aspect ratio (it is no longer squished). Fish facing RIGHT, tightly cropped, about 1024 px wide (long side). Under 500 KB each. |
| Music | `audio/music/` | OGG (Vorbis), 128-192 kbps, stereo | 2-4 min each. Soft, loop-friendly endings. Normalise to about -16 LUFS. Any number of tracks. |
| Sound effects | `audio/sfx/` | OGG or WAV, mono, 44.1 kHz | Under 2 s each (clicks and blips under 0.5 s). Names: see `SFX` in the manifest. |
| Ambience loops | `audio/amb/` | OGG, mono, 44.1 kHz | 30 s, seamless (crossfaded) loop, about -20 LUFS, quiet and steady; levels are set in `AMB_LEVEL` in `audio.js`. Keys: water, day, night, frogs, fire. |

## Art status (Nov 2026)

The painted art lives in `art/` and every file is listed in `ART` in the manifest. Specs and prompts for new pieces are in `ART_ASSETS.md` (git-ignored). Sheets are cut and cleaned with `npm run clean-art` (`tools/`, git-ignored).

**In the game:**
- people (seated side/front/back, plus standing front/back for the gallery)
- plates (far shore, day and night skies)
- forest strips, clouds, ground (grass, path, water, bank)
- the chess set is drawn in code for now (see below)
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
| Gallery interior redesign, tank, table, ornaments, 12 activity sprites | `art/gallery/` | See "Gallery art spec" below. The old five "together" scenes (couch, phone, cards, kettle, window) are replaced by six solo activities per friend. |
| App icon | `icon-512.png` (in `public/`) | Square, for `manifest.webmanifest`, so Android offers to install. |
| Sun and moon sprites (optional) | `SKY_ART` | Without them, a generated glow is used. |
| Sounds | `audio/sfx/`, `audio/amb/` | Still synthesised: click, select, splash, nibble, bite, reel, catch, blip, pop, fishjump, quack, birdcall, tweet, possum, cast, plop, reelclick, croak, cancrack, zip, stone, lamp and the frogs bed. Not yet hooked: cabin door, page turn, car door, tank bubbles. |

## Gallery art spec

Style for every prompt below: cozy surrealist watercolour, warm cream paper grain, soft wet edges, muted palette (sage, dusty teal, terracotta, honey wood, cream), gentle pooled pigment at the edges, no hard outlines, no text, faceless people. Transparent items: paint on plain white or cream, then key out.

**Interior plate** `art/gallery/interior.jpg`, 3200 x 1800 (16:9), opaque. A cabin room seen straight on, back wall only, empty centre. The camera rests at about 1.5 m high; the game draws the table, tank and people on top. All positions are fractions of the image (u from the left, v from the TOP):
- Baseboard (wall meets floor) at v 0.68. Wide honey wood planks below it in simple perspective, a soft worn rug is fine. Plain plank wall above.
- Centre u 0.34 to 0.66, v 0.45 to 1.0: keep EMPTY (table and tank stand here). Nothing tall or bright behind it.
- Window: glass u 0.26 to 0.50, v 0.20 to 0.52, centre (0.38, 0.36). Daylight blue-white glass with a simple frame and sill. The fish glow and release point sit at this centre (`WIN` in `gallery.js`), so keep it centred there. A person stands in front of its lower half.
- Bare wall with two coat hooks and a faded framed picture, u 0.10 to 0.24, v 0.20 to 0.68: the "lean on the wall" spot. Keep the wall plain at floor level.
- Wood stove with a pipe up the wall: body u 0.58 to 0.70, top of the stove at v 0.56, pipe to the ceiling, a small log pile beside it. A person warms their hands at its top.
- Kitchen counter with a kettle, mugs and a tea tin: u 0.74 to 0.92, counter top at v 0.54, cupboards below, a shelf with jars above (v 0.25 to 0.40).
- A ceiling lamp on a cord at about u 0.5, v 0.06. Warm light, no hard shadows.
Prompt: "Interior of a small lakeside cabin seen straight on, empty plank wall and floor, a window left of centre, a wood stove with a pipe on the right, a kitchen counter with kettle and mugs far right, bare wall with coat hooks far left, empty space in the middle, cozy surrealist watercolour, warm cream paper grain, soft edges, muted palette, no people, no text."

**Tank** `art/gallery/tank.png`, 1900 x 1100 (aspect 1.727), transparent outside the rounded tank. Back layer: water (soft teal, lighter at the top, a gentle light shaft or two), gravel along the bottom 10%, rounded corners. The tank body is 1800 x 1000 px inset 50 px on every side; leave the 50 px margin transparent. Water surface at 80% of the body height from the bottom. No fish, plants or rocks (those are separate). Prompt: "Side view of a glass aquarium full of soft teal water with a sandy gravel floor, rounded corners, light shafts, nothing inside, watercolour on cream paper, soft edges, transparent background."
**Tank front** `art/gallery/tank_front.png`, same 1900 x 1100: only the glass front and rim. A wooden rim and lid band (honey wood), a faint wavy surface line at 80% height, two soft white glass reflections on the left, everything else fully transparent. Prompt: "Front frame of an aquarium: honey wood rim and thin lid band, faint white glass reflections, light wavy water line, everything else empty, watercolour, soft edges, transparent background."
**Table** `art/gallery/table.png`, 1360 x 400 (3.4 x 1.0 m), transparent. A sturdy low wooden table seen from the front, slightly from above: the top surface band and thick front edge at the top 26% (the tank stands on the top surface at 7% to 13% from the top), two chunky front legs near the ends, two fainter back legs inside, a soft contact shadow at the bottom. Prompt: "Front view of a sturdy honey-wood table with a visible top surface, thick edge and chunky legs, soft shadow underneath, watercolour, cream paper grain, transparent background."

**Ornaments** `art/gallery/decor_<id>.png` (set in `ART.gallery.decor`), transparent, bottom-aligned, the sizes below keep the game's aspect (game width x height in metres in brackets):
- `rock` 340 x 240 (.34 x .24): two mossy grey-green river stones.
- `plant` 360 x 560 (.36 x .56): a tuft of long soft green water fronds.
- `castle` 420 x 420 (.42 x .42): a tiny cream and rose toy castle, two towers, a teal arched door.
- `driftwood` 550 x 300 (.55 x .30): a curved piece of weathered branch with a twig.
- `shell` 200 x 180 (.20 x .18): a pink scallop shell fan.
Render at 2x (e.g. 680 x 480) if you like, keeping the aspect. Prompt pattern: "<item> for an aquarium, side view, watercolour, soft edges, cream paper grain, muted palette, transparent background".

**Activity sprites** `art/gallery/<activity>_<liam|xiao>.png` (set `liam` / `xiao` in `ART.gallery.activities`), one standing person each, 1024 x 1536 (2:3), transparent, feet on the bottom edge, head just under the top edge (drawn 1.8 m tall), faceless, with the little props painted in. Liam: warm, rambly, rust shirt and cap, a softer belly. Xiao: dry, clipped, teal-grey shirt, neat. The game places each at a fixed spot and fades between them. Activities, zones (room x, z in metres) and the pose to paint:
- `phone` (-2.9, -1.9) facing front: standing, looking down at a phone held at chest height, a faint blue glow on the hands.
- `wall` (-3.1, -3.5) facing front: shoulder and one heel against the wall, arms folded or hands in pockets, relaxed lean.
- `window` (-1.7, -3.4) seen from behind: standing at the window, one hand on the sill, looking out.
- `stove` (1.7, -3.4) seen from behind: hands held out toward the stove top, warm orange light on the fingers.
- `tea` (3.2, -3.4) seen from behind: at the counter, stirring or pouring a mug, a little steam.
- `read` (2.9, -1.9) facing front: standing with an open paperback held in both hands.
Prompt: "<Liam|Xiao>, faceless standing figure <pose>, cozy surrealist watercolour, warm cream paper grain, soft edges, muted palette, full body, plain background". Reconciliation: the earlier plan of five "together" scenes (couch, phone, cards, kettle, window) is dropped, since the cabin has no couch or card table; phone, window and kettle (now `tea`) carry over as solo activities, with `wall`, `stove` and `read` added.

## New in the flat chess set and camp (all optional: `null` / missing = drawn in code)

All art: cozy surrealist watercolour, warm cream paper grain, soft edges, muted palette. Liam's things lean warm orange/olive/brown, Xiao's cool blue/lavender/grey. PNG for transparency, JPG for opaque plates, transparent unless said.

| Manifest key | File | Spec | Generation prompt |
|---|---|---|---|
| `ART.board.top` | `art/chess/board.png` | 2048 x 2048, opaque, square, seen straight from above. The 8x8 grid fills the middle 88% (a 6% painted wooden frame on each side). Top-left square is DARK, then they alternate. No perspective, no pieces, no drop shadow. | Top-down painted chessboard on soft honey wood, cozy surrealist watercolour, warm cream paper grain, soft bleeding edges, muted cream and walnut squares, thin hand-inked frame, no pieces. |
| `ART.board.pieces.w.{p,n,b,r,q,k}` | `art/chess/w_p.png` ... `w_k.png` | 512 x 768 each (2:3), transparent. One standing piece, straight-on, centred, its base touching the bottom edge (about 5% margin). Knight faces LEFT (the game mirrors it). Same lighting on all six. Cream. | A single chess [pawn/knight/bishop/rook/queen/king], front view, warm cream ivory, cozy surrealist watercolour, paper grain, soft edges, muted palette, tiny wobble in the outline, transparent background. |
| `ART.board.pieces.b.{p,n,b,r,q,k}` | `art/chess/b_p.png` ... `b_k.png` | Same as white. Dark walnut. | Same prompt, in dark walnut brown with a faint warm highlight on the left. |
| `ART.props.logs` | `art/props/logs.png` | 1024 x 512 (2:1), transparent. Two crossed logs, side-on, a little flat ground shadow under them; no flames, no stones (they lie in front of the fire). | Two crossed campfire logs, pale tan end rings, mossy bark, cozy surrealist watercolour, warm cream paper grain, soft edges, muted brown palette, transparent background. |

The stump under the board is the existing `ART.cutouts.stump` (it is only 104 px wide now: a 1024 x 800 repaint would help). Sound names added to `SFX`: `cooler`, `cancrack`, `crackle`, `zip`, `stone`, `lamp` (short OGGs, under 1 s, mono).

## Voice acting

A story line tagged `#vo:<id>` plays `VO[id]` from the manifest (`VO = { liam_arrival_01: 'assets/audio/vo/liam_arrival_01.ogg' }`) on its own bus. Music dips while it plays, and the Settings "Voices" slider (`voiceVol`) sets its level. Mono OGG, 44.1 kHz, one file per line, trimmed tight. Ids with no manifest entry are skipped silently, so tags can go in the ink before any audio exists.

Browsers need a click before they play sound, so music starts on your first click.

## Sound credits/sources

Sonniss GDC Game Audio Bundle licence (`License - GDC Game Audio.pdf`): worldwide, royalty-free, commercial use in games allowed, no attribution required, may be modified; may not be resold as-is and may not be used to train AI. Kenney packs are CC0. All files below were trimmed, mono-mixed, loudness/peak-normalised and encoded to OGG Vorbis q3; loops have a 2 s crossfaded seam.

| File | Used for | Source pack | Licence |
|---|---|---|---|
| `amb/fire.ogg` | campfire bed (scaled by fire level) | Ivo Vicic, Campfire - Bonfire FX (pine branches in fire, 16-48 s) | Sonniss GDC |
| `amb/water.ogg` | lake lapping bed | Epic Stock Media, Public Spaces - Storms Lakes Parks and Rural Nature Exteriors (Lake Dock ripples 05, 36-68 s) | Sonniss GDC |
| `amb/day.ogg` | daytime meadow bed | Just Sound Effects, Highlands of Norway (Meadow Pipits, insects, wind, 2-34 s, low-passed at 2.2 kHz to mute the bird calls) | Sonniss GDC |
| `sfx/poke.ogg` | `crackle`, poking the fire | Ivo Vicic, Campfire - Bonfire FX (11-12.7 s) | Sonniss GDC |
| `sfx/move1-3.ogg` | chess move | Kenney, Impact Sounds: impactWood_light_000-002 | CC0 |
| `sfx/capture1-2.ogg` | capture | Kenney, Impact Sounds: impactWood_medium_000-001 | CC0 |
| `sfx/cloth1-3.ogg` | `grunt`, sitting and standing | Kenney, RPG Audio: cloth1-3 | CC0 |
| `sfx/latch.ogg` | `cooler` | Kenney, RPG Audio: metalLatch | CC0 |

Skipped: the night bed (jungle-night file, still chirpy; synth crickets kept), fish tank bubbles (LevieDAudio ships with no licence text, only a thank-you note), the frog croak (synth kept), the ambisonic campfire, and the cabin door, page turn and car door (no clean hook in the code yet; candidates are Kenney RPG Audio `creak*.ogg`, `bookFlip*.ogg` and SoundBits Mad Mustang Mercury `VEHDoor`).

Image format: PNG for transparency, JPG for opaque plates. Don't convert art to lossy WebP without a visual side-by-side check.
