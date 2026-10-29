# Dropping in your own art and sound

Everything is listed in `src/assets/manifest.js`. Anything left `null` uses a built-in placeholder.

- Music: put files in `public/assets/audio/music/` and add a line to `MUSIC` (id, name, `src: 'assets/audio/music/yourfile.mp3'`). All entries appear in Settings > Track, and "Play all tracks" moves through them in order with a crossfade.
- Sound effects: one short file per name under `public/assets/audio/sfx/`, listed in `SFX`.
- Ambience loops (lake, birds, crickets, fire crackle): `public/assets/audio/ambience/`, listed in `AMBIENCE`.
- Fish art: `public/assets/fish/<kind>.png`, listed in `FISH_ART`. Transparent background, fish facing RIGHT, about 2:1. It is used in the catch card, the journal and the aquarium.

Browsers need a click before they play sound, so music starts on your first click.
