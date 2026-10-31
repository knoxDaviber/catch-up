/* ASSET MANIFEST: the one place that says which art and sound files the game uses.
   Anything left as null falls back to a built-in placeholder, so you can swap things in one at a time.
   Put files under public/assets/... and write the path WITHOUT "public/", e.g. 'assets/audio/music/morning.mp3'.

   MUSIC   a list. The first entry is the default. Add as many tracks as you like; players pick one in Settings.
   SFX     one file per effect name (short .ogg/.mp3/.wav). null = synthesised placeholder.
   AMBIENCE  looping beds. null = synthesised placeholder.
   SKY_ART   optional painted sprites for the sun and moon (soft-edged PNG/WebP with transparency, roughly square, centred). null = generated glow.
   FISH_ART  one image per fish kind (transparent PNG/WebP, fish facing RIGHT). null = drawn placeholder.
   ART     the painted fishing-view slice (people, plates, cutouts, props, ground). null, or a file that fails to load, keeps the 3D placeholder.
           Add ?noart to the page URL to skip all of it and compare against the placeholders. */

export const MUSIC = [
  { id: 'morning', name: 'Morning Light', src: 'assets/audio/music/morning.mp3' },
  { id: 'slowing_down', name: 'Slowing Down', src: 'assets/audio/music/slowing_down.mp3' },
  { id: 'evening', name: 'Calm Night', src: 'assets/audio/music/evening.mp3' },
];

export const SFX = {
  click: null,      // any button
  select: null,     // picking up a chess piece
  move: null,       // a chess move
  capture: null,    // a capture
  splash: null,     // hooking a fish, plopping into the water
  nibble: null,     // a nibble on the float
  bite: null,       // the bite
  reel: null,       // reeling in
  catch: null,      // fish caught
  grunt: null,      // sitting down / standing up
  blip: null,       // a friend speaking
  pop: null,        // a fish in the aquarium is picked up
  fishjump: null,   // a small fish leaping out on the lake
  quack: null,      // a pair of ducks skimming past at dusk
  birdcall: null,   // a bird calling as a flock crosses the sky
  tweet: null,      // a little bird hopping on the shore
  possum: null,     // a possum shuffling along the shore at night
};

export const AMBIENCE = {
  water: null,      // lake lapping (loop)
  day: null,        // birds and breeze (loop)
  night: null,      // crickets (loop)
  frogs: null,      // frogs at dusk and night (loop)
  fire: null,       // crackle (loop)
};

export const SKY_ART = { sun: null, moon: null };   // e.g. 'assets/art/sun.png'; null falls back to the generated glow

export const FISH_ART = {
  // one entry per fish id in src/game/fishing.js (KINDS); null = drawn placeholder in the fish's colours
  mosquitofish: null, gudgeon: null, rainbowfish: null, goldfish: null, spangled_perch: null, perch: null,
  bony_bream: null, silver_perch: null, mullet: null, tench: null, bass: null, golden_perch: null,
  trout: null, brown_trout: null, carp: null, eel: null, catfish: null, murray_cod: null,
};

const A = 'assets/art/', N = (k, n) => Array.from({ length: n }, (_, i) => A + `scatter/${k}_${i + 1}.png`);
export const ART = {
  // seated in their camp chair, faceless, transparent. Side views: Liam faces right, Xiao faces left.
  people: { liam_side: A + 'people/liam_side.png', liam_front: A + 'people/liam_front.png', liam_back: A + 'people/liam_back.png',
    xiao_side: A + 'people/xiao_side.png', xiao_front: A + 'people/xiao_front.png', xiao_back: A + 'people/xiao_back.png' },
  // far: far shore and hills, transparent sky, cut just below the waterline. Skies: day/night tinting is done in code.
  plates: { far: A + 'plates/far.png', sky_day: A + 'plates/sky_day.jpg', sky_night: A + 'plates/sky_night.jpg' },
  // forest tree-line strips (transparent, wide) wrapped round the land side in three depth bands: near crisp, far hazier. Empty lists keep the drawn canopy bands.
  forest: { near: [A + 'forest/strip_c.png', A + 'forest/strip_d.png', A + 'forest/strip_f.png'], mid: [A + 'forest/strip_a.png', A + 'forest/strip_e.png'], far: [A + 'forest/strip_b.png', A + 'forest/strip_g.png'] },
  clouds: [A + 'clouds/cumulus_a.png', A + 'clouds/cumulus_b.png'],   // painted cumulus (blue sky keyed out) that drift in place of the drawn cumulus
  cutouts: { tree_gum: A + 'cutouts/tree_gum.png', tree_whitegum: A + 'cutouts/tree_whitegum.png', tree_paperbark: A + 'cutouts/tree_paperbark.png', tree_pine: A + 'cutouts/tree_pine.png',
    wattle: A + 'cutouts/wattle.png', reeds: A + 'cutouts/reeds.png', cabin: A + 'cutouts/cabin.png', tent: A + 'cutouts/tent.png', jetty: A + 'cutouts/jetty.png',
    clearing: A + 'cutouts/clearing.png', path_entry: A + 'cutouts/path_entry.png' },   // ground-level scenery framing where the path leaves the forest
  props: { radio: A + 'props/radio.png', bucket: A + 'props/bucket.png', crate: A + 'props/crate.png', chair: A + 'props/chair.png', cooler: A + 'props/cooler.png', bait: A + 'props/bait.png' },   // chair: only for an empty chair (none yet)
  // gallery: painted cabin interior plate (null = the 3D room), plus indoor activity scenes of Liam and Xiao (transparent PNGs, art/gallery/<id>.png). src null = a placeholder pair made from the people sprites.
  gallery: { backdrop: A + 'gallery/interior.jpg', activities: [{ id: 'couch', src: null }, { id: 'phone', src: null }, { id: 'cards', src: null }, { id: 'kettle', src: null }, { id: 'window', src: null }] },
  // ground scatter (transparent, sliced from one sheet): rocks, pebbles and grass dotted along the shore, the path and the feet of trees and buildings. An empty list skips that kind.
  scatter: { boulder: N('boulder', 4), rock: N('rock', 6), pebble: N('pebble', 18), tuft: N('tuft', 6), clump: N('clump', 3) },
  ground: { grass: A + 'ground/grass.jpg', path: A + 'ground/path.jpg', water: A + 'ground/water.jpg' },   // tileable; water tiles the lake under the day/night lake colour
};
