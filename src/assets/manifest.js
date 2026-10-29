/* ASSET MANIFEST: the one place that says which art and sound files the game uses.
   Anything left as null falls back to a built-in placeholder, so you can swap things in one at a time.
   Put files under public/assets/... and write the path WITHOUT "public/", e.g. 'assets/audio/music/morning.mp3'.

   MUSIC   a list. The first entry is the default. Add as many tracks as you like; players pick one in Settings.
   SFX     one file per effect name (short .ogg/.mp3/.wav). null = synthesised placeholder.
   AMBIENCE  looping beds. null = synthesised placeholder.
   FISH_ART  one image per fish kind (transparent PNG/WebP, fish facing RIGHT). null = drawn placeholder. */

export const MUSIC = [
  { id: 'morning', name: 'Morning Light', src: '/assets/audio/music/morning.mp3' },
  { id: 'slowing_down', name: 'Slowing Down', src: 'assets/audio/music/slowing_down.mp3' },
  { id: 'evening', name: 'Calm Night', src: 'assets/audio/music/evening.mp3' },
  //{ id: 'placeholder-pad', name: 'Placeholder pad (synth)', src: null },
  // { id: 'morning', name: 'Morning Light', src: 'assets/audio/music/morning.mp3' },
  // { id: 'lake',    name: 'Lake Evening',  src: 'assets/audio/music/lake-evening.mp3' },
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
};

export const AMBIENCE = {
  water: null,      // lake lapping (loop)
  day: null,        // birds and breeze (loop)
  night: null,      // crickets (loop)
  fire: null,       // crackle (loop)
};

export const FISH_ART = {
  minnow: null, perch: null, bluegill: null, trout: null, carp: null, catfish: null,
  minnow: '/assets/fish/minnow.png',
};
