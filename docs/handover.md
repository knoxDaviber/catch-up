# Handover

Updated 2026-11-09. The design doc is `docs/design.md`; the story canon is `story/STORY_BIBLE.md`.

## Done (latest rounds)

- **New art batch (Nov 9):**
  - new day and night skies and far shore
  - a lake bank texture (no more orange band)
  - title logo art framing "Catch Up"
  - a new bait tin
  - eight new fish, so all 21 kinds now have art (tench, bass and brown trout for the first time)

- **Fish:** three new uncommon kinds (guppy, koi, lamplighter).
- **Catch:** no menu. The fish floats with sparkles, name bubbles and "Choose a name…", and a 12 s ring timer releases it if it runs out.
- **Scenery:**
  - New pieces: boat, lily pads, lantern and firefly jar (both glow at night), fire ring, cairn, blanket, bedroll, backpack, log, stump, bushes, flowers, dragonfly.
  - The layout varies per trip (a `layout` seed in the trip save).
- **Gallery:** the friends no longer overlap the tank. Kept fish can be released (drag to the window, or the link on the info card).
- **Views:** edge tabs on the side the camera turns to, with spam clicks ignored. Clicking the board while fishing goes to chess.
- **Rod:** stowing needs a double-click/tap or right-click.
- **Checks:** reviewed and checked in the browser. `npm test` and `npm run build` pass.

## Next

- **Art** (list in `public/assets/README.md`):
  - the five gallery activity scenes
  - a PWA icon
  - real sound effects and ambience
- **Xiao's playable side** (story and pick screen).
- **Optional:** convert the art to WebP (the art folder is about 40 MB or more).

## Open decisions / unchecked

- **New art batch, unchecked in 3D:** WebGL was unavailable in the test browser, so the skies, far shore, bank, bait tin and fish haven't been seen in the 3D scene. Check where the far shore's waterline sits and how the bank looks.
- **Fish matches are guesses** from the pictures: striped → rainbowfish, long dorsal filament → bony bream, slim with one dark stripe → bass, barbels → tench, pink band → rainbow trout, red and dark spots → brown trout, blotched stripe → gudgeon, orange → goldfish.

- Full screen and phone layouts (375 px portrait, landscape) haven't been checked on a real device, nor has double-tap.
- The dragonfly's facing direction is unchecked.
- From the title camera, the lily pads look slightly upright.
- In the gallery, the friends are still camp-chair placeholders until the activity art exists.
- Changing the layout code shifts how existing saved seeds lay out.
- `CLAUDE.md`, `tools/` and `ART_ASSETS.md` are git-ignored, so they aren't in the repo.
