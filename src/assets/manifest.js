/* ASSET MANIFEST: the one place that says which art and sound files the game uses.
   Anything left as null falls back to a built-in placeholder, so you can swap things in one at a time.
   Put files under public/assets/... and write the path WITHOUT "public/", e.g. 'assets/audio/music/morning.ogg'.

   MUSIC   a list. The first entry is the default. Add as many tracks as you like; players pick one in Settings.
   SFX     one file per effect name (short .ogg/.wav). null = synthesised placeholder.
   AMBIENCE  looping beds. null = synthesised placeholder.
   SKY_ART   optional painted sprites for the sun and moon (soft-edged WebP with transparency, roughly square, centred). null = generated glow.
   FISH_ART  one image per fish kind (transparent WebP, fish facing RIGHT). null = drawn placeholder.
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
  cast: null,       // casting the line (whoosh)
  plop: null,       // the float landing on the water
  reelclick: null,  // one click of the reel while reeling in or fighting
  croak: null,      // a frog croaking
};

export const AMBIENCE = {
  water: null,      // lake lapping (loop)
  day: null,        // birds and breeze (loop)
  night: null,      // crickets (loop)
  frogs: null,      // frogs at dusk and night (loop)
  fire: null,       // crackle (loop)
};

export const SKY_ART = { sun: null, moon: null };   // e.g. 'assets/art/sun.webp'; null falls back to the generated glow

export const FISH_ART = {
  // one entry per fish id in src/game/fishing.js (KINDS); null = drawn placeholder in the fish's colours
  // made from the author's pictures by tools/art-jobs.json (the jobs whose out starts with ../fish/)
  guppy: 'assets/fish/guppy.webp', mosquitofish: 'assets/fish/mosquitofish.webp', gudgeon: 'assets/fish/gudgeon.webp', rainbowfish: 'assets/fish/rainbowfish.webp', goldfish: 'assets/fish/goldfish.webp',
  spangled_perch: 'assets/fish/spangled_perch.webp', perch: 'assets/fish/perch.webp', lamplighter: 'assets/fish/lamplighter.webp', bony_bream: 'assets/fish/bony_bream.webp', silver_perch: 'assets/fish/silver_perch.webp',
  mullet: 'assets/fish/mullet.webp', tench: 'assets/fish/tench.webp', bass: 'assets/fish/bass.webp', golden_perch: 'assets/fish/golden_perch.webp', koi: 'assets/fish/koi.webp', trout: 'assets/fish/trout.webp', brown_trout: 'assets/fish/brown_trout.webp',
  carp: 'assets/fish/carp.webp', eel: 'assets/fish/eel.webp', catfish: 'assets/fish/catfish.webp', murray_cod: 'assets/fish/murray_cod.webp',
};

const A = 'assets/art/', N = (k, n) => Array.from({ length: n }, (_, i) => A + `scatter/${k}_${i + 1}.webp`);
export const ART = {
  // seated in their camp chair, faceless, transparent. Side views: Liam faces right, Xiao faces left.
  people: { liam_side: A + 'people/liam_side.webp', liam_front: A + 'people/liam_front.webp', liam_back: A + 'people/liam_back.webp',
    xiao_side: A + 'people/xiao_side.webp', xiao_front: A + 'people/xiao_front.webp', xiao_back: A + 'people/xiao_back.webp',
    // standing, for the cabin's standing activities (kettle, window)
    liam_stand_front: A + 'people/liam_stand_front.webp', liam_stand_back: A + 'people/liam_stand_back.webp', xiao_stand_front: A + 'people/xiao_stand_front.webp', xiao_stand_back: A + 'people/xiao_stand_back.webp' },
  // far: far shore and hills, transparent sky, cut just below the waterline. Skies: day/night tinting is done in code.
  plates: { far: A + 'plates/far.webp', sky_day: A + 'plates/sky_day.webp', sky_night: A + 'plates/sky_night.webp' },
  // forest tree-line strips (transparent, wide) wrapped round the land side in three depth bands: near crisp, far hazier. Empty lists keep the drawn canopy bands.
  forest: { near: [A + 'forest/strip_c.webp', A + 'forest/strip_d.webp', A + 'forest/strip_f.webp'], mid: [A + 'forest/strip_a.webp', A + 'forest/strip_e.webp'], far: [A + 'forest/strip_b.webp', A + 'forest/strip_g.webp'] },
  clouds: [A + 'clouds/cumulus_a.webp', A + 'clouds/cumulus_b.webp'],   // painted cumulus (blue sky keyed out) that drift in place of the drawn cumulus
  cutouts: { tree_gum: A + 'cutouts/tree_gum.webp', tree_whitegum: A + 'cutouts/tree_whitegum.webp', tree_paperbark: A + 'cutouts/tree_paperbark.webp', tree_pine: A + 'cutouts/tree_pine.webp',
    wattle: A + 'cutouts/wattle.webp', reeds: A + 'cutouts/reeds.webp', cabin: A + 'cutouts/cabin.webp', tent: A + 'cutouts/tent.webp', jetty: A + 'cutouts/jetty.webp',
    clearing: A + 'cutouts/clearing.webp', path_entry: A + 'cutouts/path_entry.webp',   // ground-level scenery framing where the path leaves the forest
    boat: A + 'cutouts/boat.webp', lily_1: A + 'cutouts/lily_1.webp', lily_2: A + 'cutouts/lily_2.webp', log: A + 'cutouts/log.webp', stump: A + 'cutouts/stump.webp' },   // the trip's layout pieces (world.js setLayout): rowboat, lily pads, fallen log, stump
  props: { radio: A + 'props/radio.webp', bucket: A + 'props/bucket.webp', crate: A + 'props/crate.webp', chair: A + 'props/chair.webp', cooler: A + 'props/cooler.webp', bait: A + 'props/bait.webp',   // chair: only for an empty chair (none yet)
    lantern: A + 'props/lantern.webp', firefly_jar: A + 'props/firefly_jar.webp', fire_ring: A + 'props/fire_ring.webp',   // lantern and jar glow at night; the stone ring lies under the campfire
    cairn: A + 'props/cairn.webp', blanket: A + 'props/blanket.webp', bedroll: A + 'props/bedroll.webp', backpack: A + 'props/backpack.webp' },   // optional bits of camp, placed per trip
  critters: { dragonfly: A + 'critters/dragonfly.webp' },   // lake_life: a daytime dragonfly over the shallows
  // gallery: painted cabin interior plate (null = the 3D room), plus indoor activity scenes of Liam and Xiao (transparent WebPs, art/gallery/<id>.webp). src null = a placeholder pair made from the people sprites.
  gallery: { backdrop: A + 'gallery/interior.webp', activities: [{ id: 'couch', src: null }, { id: 'phone', src: null }, { id: 'cards', src: null }, { id: 'kettle', src: null }, { id: 'window', src: null }] },
  // ground scatter (transparent, sliced from one sheet): rocks, pebbles and grass dotted along the shore, the path and the feet of trees and buildings. An empty list skips that kind.
  scatter: { boulder: N('boulder', 4), rock: N('rock', 6), pebble: N('pebble', 18), tuft: N('tuft', 6), clump: N('clump', 3), bush: N('bush', 4), flowers: N('flowers', 4) },
  ground: { grass: A + 'ground/grass.webp', path: A + 'ground/path.webp', bank: A + 'ground/bank.webp', water: A + 'ground/water.webp' },   // tileable; water tiles the lake under the day/night lake colour
};
