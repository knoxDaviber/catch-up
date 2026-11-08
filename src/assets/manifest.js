/* ASSET MANIFEST: the one place that says which art and sound files the game uses.
   Anything left as null falls back to a built-in placeholder, so you can swap things in one at a time.
   Put files under public/assets/... and write the path WITHOUT "public/", e.g. 'assets/audio/music/morning.ogg'.

   MUSIC   a list. The first entry is the default. Add as many tracks as you like; players pick one in Settings.
   SFX     one file per effect name (short .ogg/.wav), or a list of takes (one is picked at random). null = synthesised placeholder.
   AMBIENCE  looping beds. null = synthesised placeholder.
   SKY_ART   optional painted sprites for the sun and moon (soft-edged PNG with transparency, roughly square, centred). null = generated glow.
   FISH_ART  one image per fish kind (transparent PNG, fish facing RIGHT). null = drawn placeholder.
   ART     the painted fishing-view slice (people, plates, cutouts, props, ground). null, or a file that fails to load, keeps the 3D placeholder.
           Add ?noart to the page URL to skip all of it and compare against the placeholders. */

export const MUSIC = [
  { id: 'morning', name: 'Morning Light', src: 'assets/audio/music/morning.ogg' },
  { id: 'slowing_down', name: 'Slowing Down', src: 'assets/audio/music/slowing_down.ogg' },
  { id: 'evening', name: 'Calm Night', src: 'assets/audio/music/evening.ogg' },
];

export const SFX = {
  click: null,      // any button
  select: null,     // picking up a chess piece
  move: [1, 2, 3].map(i => `assets/audio/sfx/move${i}.ogg`),   // a chess move
  capture: [1, 2].map(i => `assets/audio/sfx/capture${i}.ogg`),   // a capture
  splash: null,     // hooking a fish, plopping into the water
  nibble: null,     // a nibble on the float
  bite: null,       // the bite
  reel: null,       // reeling in
  catch: null,      // fish caught
  grunt: [1, 2, 3].map(i => `assets/audio/sfx/cloth${i}.ogg`),   // sitting down / standing up
  blip: null,       // a friend speaking
  pop: null,        // a fish in the aquarium is picked up
  fishjump: null,   // a small fish leaping out on the lake
  quack: null,      // a pair of ducks skimming past at dusk
  birdcall: null,   // a bird calling as a flock crosses the sky
  tweet: null,      // a little bird hopping on the shore
  possum: null,     // a possum shuffling along the shore at night
  cast: null,       // casting the line (whoosh)
  plop: null,       // the float landing on the water
  reelclick: null,  // one click of the reel while reeling in or fighting
  croak: null,      // a frog croaking
  cooler: 'assets/audio/sfx/latch.ogg',   // the cooler's lid thumping open or shut
  cancrack: null,   // a can opening (pssh)
  crackle: 'assets/audio/sfx/poke.ogg',   // the campfire poked: a burst of crackles
  zip: null,        // the tent flap
  stone: null,      // a stone set on the cairn
  lamp: null,       // the lantern switched
};

/* VO: optional voice acting, id -> file. A story line tagged #vo:<id> plays VO[id] on the voice bus (music ducks a little). Missing ids are skipped silently. */
export const VO = {   // e.g. liam_arrival_01: 'assets/audio/vo/liam_arrival_01.ogg'
};

export const AMBIENCE = {
  water: 'assets/audio/amb/water.ogg',      // lake lapping (loop)
  day: 'assets/audio/amb/day.ogg',        // birds and breeze (loop)
  night: null,      // crickets (loop)
  frogs: null,      // frogs at dusk and night (loop)
  fire: 'assets/audio/amb/fire.ogg',       // crackle (loop)
};

export const SKY_ART = { sun: null, moon: null };   // e.g. 'assets/art/sun.png'; null falls back to the generated glow

export const FISH_ART = {
  // one entry per fish id in src/game/fishing.js (KINDS); null = drawn placeholder in the fish's colours
  // made from the author's pictures by tools/art-jobs.json (the jobs whose out starts with ../fish/)
  guppy: 'assets/fish/guppy.png', mosquitofish: 'assets/fish/mosquitofish.png', gudgeon: 'assets/fish/gudgeon.png', rainbowfish: 'assets/fish/rainbowfish.png', goldfish: 'assets/fish/goldfish.png',
  spangled_perch: 'assets/fish/spangled_perch.png', perch: 'assets/fish/perch.png', lamplighter: 'assets/fish/lamplighter.png', bony_bream: 'assets/fish/bony_bream.png', silver_perch: 'assets/fish/silver_perch.png',
  mullet: 'assets/fish/mullet.png', tench: 'assets/fish/tench.png', bass: 'assets/fish/bass.png', golden_perch: 'assets/fish/golden_perch.png', koi: 'assets/fish/koi.png', trout: 'assets/fish/trout.png', brown_trout: 'assets/fish/brown_trout.png',
  carp: 'assets/fish/carp.png', eel: 'assets/fish/eel.png', catfish: 'assets/fish/catfish.png', murray_cod: 'assets/fish/murray_cod.png',
};

const A = 'assets/art/', N = (k, n) => Array.from({ length: n }, (_, i) => A + `scatter/${k}_${i + 1}.png`);
export const ART = {
  // seated in their camp chair, faceless, transparent. Side views: Liam faces right, Xiao faces left.
  people: { liam_side: A + 'people/liam_side.png', liam_front: A + 'people/liam_front.png', liam_back: A + 'people/liam_back.png',
    xiao_side: A + 'people/xiao_side.png', xiao_front: A + 'people/xiao_front.png', xiao_back: A + 'people/xiao_back.png',
    // standing, for the cabin's standing activities (kettle, window)
    liam_stand_front: A + 'people/liam_stand_front.png', liam_stand_back: A + 'people/liam_stand_back.png', xiao_stand_front: A + 'people/xiao_stand_front.png', xiao_stand_back: A + 'people/xiao_stand_back.png' },
  // far: far shore and hills, transparent sky, cut just below the waterline. Skies: day/night tinting is done in code.
  plates: { far: A + 'plates/far.png', sky_day: A + 'plates/sky_day.jpg', sky_night: A + 'plates/sky_night.jpg' },
  // forest tree-line strips (transparent, wide) wrapped round the land side in three depth bands: near crisp, far hazier. Empty lists keep the drawn canopy bands.
  forest: { near: [A + 'forest/strip_c.png', A + 'forest/strip_d.png', A + 'forest/strip_f.png'], mid: [A + 'forest/strip_a.png', A + 'forest/strip_e.png'], far: [A + 'forest/strip_b.png', A + 'forest/strip_g.png'] },
  clouds: [A + 'clouds/cumulus_a.png', A + 'clouds/cumulus_b.png'],   // painted cumulus (blue sky keyed out) that drift in place of the drawn cumulus
  cutouts: { tree_gum: A + 'cutouts/tree_gum.png', tree_whitegum: A + 'cutouts/tree_whitegum.png', tree_paperbark: A + 'cutouts/tree_paperbark.png', tree_pine: A + 'cutouts/tree_pine.png',
    wattle: A + 'cutouts/wattle.png', reeds: A + 'cutouts/reeds.png', cabin: A + 'cutouts/cabin.png', tent: A + 'cutouts/tent.png', jetty: A + 'cutouts/jetty.png',
    clearing: A + 'cutouts/clearing.png', path_entry: A + 'cutouts/path_entry.png',   // ground-level scenery framing where the path leaves the forest
    boat: A + 'cutouts/boat.png', lily_1: A + 'cutouts/lily_1.png', lily_2: A + 'cutouts/lily_2.png', log: A + 'cutouts/log.png', stump: A + 'cutouts/stump.png' },   // the trip's layout pieces (world.js setLayout): rowboat, lily pads, fallen log, stump
  props: { radio: A + 'props/radio.png', bucket: A + 'props/bucket.png', crate: A + 'props/crate.png', chair: A + 'props/chair.png', cooler: A + 'props/cooler.png', bait: A + 'props/bait.png',   // chair: only for an empty chair (none yet)
    lantern: A + 'props/lantern.png', firefly_jar: A + 'props/firefly_jar.png', fire_ring: A + 'props/fire_ring.png',   // lantern and jar glow at night; the stone ring lies under the campfire
    cairn: A + 'props/cairn.png', blanket: A + 'props/blanket.png', bedroll: A + 'props/bedroll.png', backpack: A + 'props/backpack.png',   // optional bits of camp, placed per trip
    logs: null },   // two crossed logs for the campfire (null: painted procedural logs, or the logs in the fire_ring art when that is there)
  // the chess set, flat and painted (null = drawn in code). top: the board with its frame; pieces: standing cards facing the camera, w = cream, b = dark walnut
  board: { top: null, pieces: { w: { p: null, n: null, b: null, r: null, q: null, k: null }, b: { p: null, n: null, b: null, r: null, q: null, k: null } } },
  critters: { dragonfly: A + 'critters/dragonfly.png' },   // lake_life: a daytime dragonfly over the shallows
  /* gallery: painted cabin interior plate (null = the 3D room); tank (water, gravel, back), tank_front (glass, rim, reflections, transparent) and table are flat painted planes, null = a soft canvas placeholder.
     decor: tank ornaments (transparent, bottom-aligned), null = placeholder. activities: one standing sprite per friend per activity (transparent PNG, art/gallery/<id>_<liam|xiao>.png), null = their standing sprite plus a small prop.
     Specs, sizes and prompts for all of these are in public/assets/README.md. */
  gallery: { backdrop: A + 'gallery/interior.jpg', tank: null, tank_front: null, table: null,
    decor: { rock: null, plant: null, castle: null, driftwood: null, shell: null },
    activities: ['phone', 'wall', 'window', 'stove', 'tea', 'read'].map(id => ({ id, liam: null, xiao: null })) },
  // ground scatter (transparent, sliced from one sheet): rocks, pebbles and grass dotted along the shore, the path and the feet of trees and buildings. An empty list skips that kind.
  scatter: { boulder: N('boulder', 4), rock: N('rock', 6), pebble: N('pebble', 18), tuft: N('tuft', 6), clump: N('clump', 3), bush: N('bush', 4), flowers: N('flowers', 4) },
  ground: { grass: A + 'ground/grass.jpg', path: A + 'ground/path.jpg', bank: A + 'ground/bank.jpg', water: A + 'ground/water.jpg' },   // tileable; water tiles the lake under the day/night lake colour
};
