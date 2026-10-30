/* Fishing loop (rules only, no rendering).
   Fish are shadows in the lake. Every so often one notices your float, circles it and nibbles for a while.
   The moment it starts nibbling is the "!": you can ignore it, or come and watch. It may bite (strike in time)
   or simply lose interest, so ignoring it costs nothing. Striking during the nibbles spooks it.
   After a catch the line is out of the water until you cast again, which is also how you stop fishing.
   Phases: out -> cast -> wait -> approach -> tease -> bite -> reel -> catch -> out. */
// len: size (x100 = typical cm), w: how common, diff: how hard it fights (0..1), style: how it fights (see fight.js),
// when: 'night' or 'day' if it bites more then. Mostly what you'd pull out of an Australian city lake or river.
export const KINDS = [
  { id: 'mosquitofish', name: 'Mosquitofish', len: .08, w: 14, diff: .02, style: 'darter', col: '#A8A58E', belly: '#E9E6D2' },
  { id: 'gudgeon', name: 'Gudgeon', len: .1, w: 14, diff: .05, style: 'darter', col: '#8C7A5E', belly: '#E3D6B8' },
  { id: 'rainbowfish', name: 'Rainbowfish', len: .1, w: 9, diff: .06, style: 'darter', col: '#6FA3C8', belly: '#F2B15E', when: 'day' },
  { id: 'goldfish', name: 'Goldfish', len: .15, w: 9, diff: .05, style: 'steady', col: '#E8913A', belly: '#F6C778' },
  { id: 'spangled_perch', name: 'Spangled perch', len: .25, w: 9, diff: .25, style: 'darter', col: '#B3A26E', belly: '#EDE3B8' },
  { id: 'perch', name: 'Redfin perch', len: .3, w: 18, diff: .22, style: 'darter', col: '#7C9A5A', belly: '#E3D9A0' },
  { id: 'bony_bream', name: 'Bony bream', len: .3, w: 12, diff: .15, style: 'steady', col: '#B9C3C6', belly: '#EEF1F0' },
  { id: 'silver_perch', name: 'Silver perch', len: .38, w: 10, diff: .32, style: 'darter', col: '#A9B4B8', belly: '#E4E9EA' },
  { id: 'mullet', name: 'Sea mullet', len: .42, w: 7, diff: .4, style: 'jumper', col: '#8E9AA0', belly: '#E2E6E4', when: 'day' },
  { id: 'tench', name: 'Tench', len: .45, w: 5, diff: .35, style: 'steady', col: '#5F7A4A', belly: '#C9B97A' },
  { id: 'bass', name: 'Australian bass', len: .45, w: 7, diff: .55, style: 'jumper', col: '#7E8460', belly: '#D9D3AE', when: 'night' },
  { id: 'golden_perch', name: 'Golden perch', len: .5, w: 7, diff: .48, style: 'runner', col: '#B59A42', belly: '#F0D879' },
  { id: 'trout', name: 'Rainbow trout', len: .5, w: 8, diff: .5, style: 'jumper', col: '#A5A88A', belly: '#E9C7B0', when: 'day' },
  { id: 'brown_trout', name: 'Brown trout', len: .6, w: 4, diff: .62, style: 'jumper', col: '#8A6E4A', belly: '#E8CFA0' },
  { id: 'carp', name: 'Carp', len: .72, w: 11, diff: .55, style: 'diver', col: '#B98A4E', belly: '#E6CF9A' },
  { id: 'eel', name: 'Shortfin eel', len: .85, w: 4, diff: .72, style: 'diver', col: '#5A5640', belly: '#B8B08A', when: 'night' },
  { id: 'catfish', name: 'Freshwater catfish', len: .9, w: 4, diff: .65, style: 'diver', col: '#6D6A66', belly: '#C8BEB0', when: 'night' },
  { id: 'murray_cod', name: 'Murray cod', len: 1, w: .8, diff: .95, style: 'runner', col: '#5E7046', belly: '#D8D2A6' },
];
export const NICKS = ['Gerald', 'Sir Bubbles', 'Dennis', 'Biscuit', 'Mochi', 'Nugget', 'Walter', 'Pickles', 'Moby Jr.', 'Brenda', 'Captain Fins', 'Noodle', 'Gus', 'Pebble', 'Waffles', 'Linda'];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t), rnd = Math.random, pickOne = a => a[Math.floor(rnd() * a.length)];

export const LAKE = { xMin: -12, xMax: 12, zNear: -6.6, zFar: -14.5 };
/** Resting float position for a seat at x = px. */
export const bobberPos = px => [px * 1.15, 0, -8.6];
/** Rod tip (world) for a seat at x = px, matching the model in world.js. */
export const rodTip = px => [px + .1, 2.2, -2.24];

const JKEY = 'catchup.journal.v1';
export function createFishing(hooks) {
  const sfx = n => hooks.sfx && hooks.sfx(n);
  // hooks: { say(who, text, ms), line(key, vars), friend(), mySeatX(), onBite(), onMiss(), onCatch(caught), onChange() }
  const F = {
    challenge: false, fighting: false, night: 0,
    fish: [], ripples: [], journal: [], bite: false, catchOpen: false, caught: null, splashT: -1e9, auto: true, stowed: false,
    rod: { land: null, phase: 'wait', nextAt: 0, fish: null, nibs: 0, nibT: 0, dipUntil: 0, winEnd: 0, t0: 0, dur: 2000, nextRip: 0, until: 0, quick: false, cur: { x: 0, y: 0, z: 0 } },
    fr: { nextAt: 0, dipUntil: 0 }, bait: { until: 0, cool: 0 }, power: 0,
  };
  const R = F.rod;
  try { F.journal = JSON.parse(localStorage.getItem(JKEY) || '[]'); } catch (e) { F.journal = []; }
  const saveJournal = () => { try { localStorage.setItem(JKEY, JSON.stringify(F.journal)); } catch (e) { /* storage is optional */ } };
  const base = px => R.land || bobberPos(px);
  const myFloat = () => { const b = base(hooks.mySeatX()); return { x: b[0], z: b[2] }; };
  /** Bait toss (berley): for a while the float draws fish in faster, bites more often and favours bigger fish. Only helps while the line is in the water. */
  const baited = now => !F.stowed && now < F.bait.until;
  F.baited = () => baited(performance.now());

  // night fish bite more after dark, day fish less (F.night is 0..1, set by the game)
  const weight = k => k.w * (k.when === 'night' ? .4 + F.night * 2.2 : k.when === 'day' ? 1.4 - F.night : 1);
  // sz / df: a nudge towards bigger / tougher fish (bait, a long Lure cast)
  function weighted(sz = 0, df = 0) {
    const wt = k => weight(k) * (1 + sz * k.len * 2) * (1 + df * k.diff * 2.5);
    let t = 0; KINDS.forEach(k => { t += wt(k); });
    let r = rnd() * t; for (const k of KINDS) { r -= wt(k); if (r <= 0) return k; }
    return KINDS[0];
  }
  function spawnFish(near) {
    const k = weighted();
    const f = { kind: k, x: (rnd() - .5) * 18, z: -7 - rnd() * 7, h: rnd() * 6.28, sp: (.3 + rnd() * .25) * (1.25 - k.len * .5), tx: 0, tz: 0, retarget: 0, mode: 'wander', fleeEnd: 0, ph: rnd() * 6.28 };
    if (near) { f.x = (rnd() - .5) * 10; f.z = -7.5 - rnd() * 4; }
    F.fish.push(f); return f;
  }
  F.init = () => { F.fish = []; for (let i = 0; i < 10; i++) spawnFish(true); };
  F.ripple = (x, z, r0, r1, dur, now) => F.ripples.push({ x, z, r0, r1, dur, t0: now });
  function fleeFrom(f, x, z, now) {
    f.mode = 'flee'; f.fleeEnd = now + 2200;
    const ang = Math.atan2(f.z - z, f.x - x); f.tx = f.x + Math.cos(ang) * 6; f.tz = f.z + Math.sin(ang) * 6 - 1;
  }
  const wait = (now, a, b) => { R.phase = 'wait'; R.nextAt = now + (a + rnd() * (b - a)) * (baited(now) ? .35 : 1); };
  F.reset = () => {
    F.fish.forEach(f => { if (f.mode !== 'wander') { f.mode = 'wander'; f.retarget = 0; } });
    R.fish = null; R.land = null; F.power = 0; F.bait.until = F.bait.cool = 0; wait(performance.now(), 15000, 25000); F.bite = false; F.stowed = false; F.fighting = false; F.catchOpen = false; F.caught = null;
  };
  /** True from the first nibble until the fish bites, leaves, or is struck: this is when the "!" shows. */
  Object.defineProperty(F, 'alert', { get: () => R.phase === 'tease' || R.phase === 'bite' });
  Object.defineProperty(F, 'lineOut', { get: () => R.phase === 'out' && !F.stowed });
  /** Put the rod down (true) or pick it up (false). Down: any fish at the float swims off, the line is out of the water, nothing bites.
   *  Picked up: the line stays out, ready to cast. Not while a fish is on the line. */
  F.stow = on => {
    if (on && ['reel', 'fight', 'catch'].includes(R.phase)) return false;
    if (on) { if (R.fish && R.fish.mode !== 'wander') { const fl = myFloat(); fleeFrom(R.fish, fl.x, fl.z, performance.now()); } F.bite = false; R.phase = 'out'; R.fish = null; R.land = null; }
    F.stowed = !!on; hooks.onChange(); return true;
  };
  /** Bait toss. Returns false while it is still cooling down. */
  F.toss = (now = performance.now()) => {
    if (now < F.bait.cool) return false;
    F.bait.cool = now + 25000; F.bait.until = now + 60000 + rnd() * 30000;
    if (!F.stowed) {
      const fl = myFloat();
      if (R.phase === 'wait') R.nextAt = Math.min(R.nextAt, now + 4000 + rnd() * 5000);
      F.fish.forEach(f => { if (f.mode === 'wander' && Math.hypot(f.x - fl.x, f.z - fl.z) < 7) { f.tx = fl.x + (rnd() - .5) * 2; f.tz = clamp(fl.z + (rnd() - .5) * 2, LAKE.zFar + .5, LAKE.zNear - .6); f.retarget = now + 5000 + rnd() * 3000; } });
    }
    return true;
  };
  F.canCast = () => R.phase === 'out' && !F.stowed && !F.catchOpen;
  /** Cast. power (0..1, Lure mode only) sets how far out the float lands; with none the float lands at its usual spot. */
  F.cast = power => {
    if (R.phase !== 'out') return; const p = power == null ? null : clamp(power, 0, 1);
    R.land = p == null ? null : [hooks.mySeatX() * (1.15 + .35 * p), 0, lerp(-7.6, -14, p)]; F.power = p || 0;
    R.phase = 'cast'; R.t0 = performance.now(); R.dur = 900 + 450 * (p || 0); sfx('reel'); hooks.onChange();
  };
  F.stepFish = (dt, now) => {
    const fl = myFloat();
    for (const f of F.fish) {
      let tx = f.tx, tz = f.tz, sp = f.sp;
      if (f.mode === 'hooked') { f.x = R.cur.x; f.z = R.cur.z; continue; }
      if (f.mode === 'wander') {
        if (now > f.retarget || Math.hypot(tx - f.x, tz - f.z) < .3) { f.tx = tx = clamp(f.x + (rnd() - .5) * 8, LAKE.xMin + 1, LAKE.xMax - 1); f.tz = tz = clamp(f.z + (rnd() - .5) * 5, LAKE.zFar + .5, LAKE.zNear - .6); f.retarget = now + 3000 + rnd() * 4000; }
      } else if (f.mode === 'approach') { tx = fl.x + Math.cos(f.ph) * .3; tz = fl.z + Math.sin(f.ph) * .3; sp = f.sp * 1.4; }
      else if (f.mode === 'tease') { f.ph += dt * 1.6; tx = fl.x + Math.cos(f.ph) * .38; tz = fl.z + Math.sin(f.ph) * .38; sp = .5; }
      else if (f.mode === 'bite') { tx = fl.x; tz = fl.z + .08; sp = .2; }
      else if (f.mode === 'flee') { sp = f.sp * 3.2; if (now > f.fleeEnd) { f.mode = 'wander'; f.retarget = 0; } }
      const want = Math.atan2(tz - f.z, tx - f.x); let d = want - f.h;
      while (d > Math.PI) d -= 6.283; while (d < -Math.PI) d += 6.283;
      f.h += clamp(d, -2 * dt, 2 * dt);
      const dist = Math.hypot(tx - f.x, tz - f.z), mv = Math.min(sp * dt, dist + .02);
      f.x = clamp(f.x + Math.cos(f.h) * mv, LAKE.xMin, LAKE.xMax); f.z = clamp(f.z + Math.sin(f.h) * mv, LAKE.zFar, LAKE.zNear + .2);
    }
  };
  F.startEvent = (now, quick) => {
    const fl = myFloat(), c = F.fish.filter(f => f.mode === 'wander').sort((a, b) => Math.hypot(a.x - fl.x, a.z - fl.z) - Math.hypot(b.x - fl.x, b.z - fl.z));
    if (!c.length) return;
    const f = c[Math.floor(rnd() * Math.min(3, c.length))];
    if (rnd() < .4) f.kind = weighted(baited(now) ? .8 : 0, F.challenge ? F.power * .5 : 0);   // the lake turns over: whoever comes to the float suits the time of day
    f.mode = 'approach'; f.ph = rnd() * 6.28;
    R.phase = 'approach'; R.fish = f; R.quick = !!quick; R.until = now + 14000;
  };
  F.stepRod = now => {
    const f = R.fish, fl = myFloat();
    if (R.phase === 'wait') {
      if (F.auto && !F.catchOpen && now > R.nextAt) F.startEvent(now, false);
    } else if (R.phase === 'cast') {
      if (now - R.t0 >= R.dur) { F.ripple(fl.x, fl.z, .1, .8, 900, now); sfx('splash'); wait(now, 20000, 45000); hooks.onChange(); }
    } else if (R.phase === 'approach') {
      if (!f || f.mode !== 'approach') wait(now, 6000, 9000);
      else if (Math.hypot(f.x - fl.x, f.z - fl.z) < .55) {
        // the "!" moment: a few slow nibbles, long enough to wander over from the board and watch
        R.phase = 'tease'; f.mode = 'tease'; R.nibs = R.quick ? 1 : 3 + Math.floor(rnd() * 3); R.nibT = now + 400;
        hooks.onNibble && hooks.onNibble(); hooks.onChange();
      }
      else if (now > R.until) { fleeFrom(f, fl.x, fl.z, now); wait(now, 6000, 9000); }
    } else if (R.phase === 'tease') {
      if (now >= R.nibT) {
        if (R.nibs > 0) { R.nibs--; R.dipUntil = now + 380; R.nibT = now + 1100 + rnd() * 900; F.ripple(fl.x, fl.z, .08, .4, 700, now); sfx('nibble'); }
        else if (R.quick || rnd() < (baited(now) ? .85 : .65)) { R.phase = 'bite'; f.mode = 'bite'; R.winEnd = now + 4500; R.nextRip = now; F.bite = true; sfx('bite'); hooks.onBite && hooks.onBite(); hooks.onChange(); }
        else { fleeFrom(f, fl.x, fl.z, now); wait(now, 20000, 40000); hooks.onLeave && hooks.onLeave(); hooks.onChange(); }
      }
    } else if (R.phase === 'bite') {
      if (now > R.nextRip) { F.ripple(fl.x, fl.z, .12, .9, 1000, now); R.nextRip = now + 900; }
      if (now > R.winEnd) { F.bite = false; fleeFrom(f, fl.x, fl.z, now); wait(now, 25000, 50000); hooks.onMiss && hooks.onMiss(); hooks.onChange(); }
    } else if (R.phase === 'fight') {
      if (now > R.nextRip) { F.ripple(R.cur.x, R.cur.z, .08, .55, 600, now); R.nextRip = now + 420; R.dipUntil = now + 260; }
    } else if (R.phase === 'reel') {
      if ((now - R.t0) / R.dur >= 1) { R.phase = 'catch'; showCatch(f, now); }
    }
    const px = hooks.mySeatX(), bp = base(px), cur = { x: bp[0], y: bp[1], z: bp[2] };
    if (R.phase === 'reel' || R.phase === 'catch' || R.phase === 'out') {
      const e = R.phase === 'reel' ? smooth(clamp((now - R.t0) / R.dur, 0, 1)) : 1;
      cur.x = lerp(bp[0], px * .9, e); cur.z = lerp(bp[2], -3.3, e); cur.y = bp[1] + .55 * e * e;
    } else if (R.phase === 'cast') {
      // a lazy arc from the shore out to the float's resting spot
      const e = clamp((now - R.t0) / R.dur, 0, 1), s = smooth(e);
      cur.x = lerp(px * .9, bp[0], s); cur.z = lerp(-3.3, bp[2], s); cur.y = bp[1] + .55 * (1 - s) + Math.sin(Math.PI * e) * 1.4;
    }
    R.cur = cur;
    if (now > F.fr.nextAt) {
      if (F.fr.nextAt) { F.fr.dipUntil = now + 1500; hooks.say(hooks.friend(), hooks.line('friendFish'), 3500); }
      F.fr.nextAt = now + 26000 + rnd() * 20000;
    }
  };
  function startReel(now) {
    const fi = R.fish; R.phase = 'reel'; R.t0 = now; R.dur = 1700 + fi.kind.len * 1800; fi.mode = 'hooked'; sfx('reel'); hooks.onChange();
  }
  function hook(now) {
    const fi = R.fish; F.bite = false; fi.mode = 'hooked';
    F.ripple(R.cur.x, R.cur.z, .1, 1.1, 900, now); sfx('splash');
    if (F.challenge && hooks.fight && fi.kind.diff >= .15) {   // tiddlers just come in
      R.phase = 'fight'; R.nextRip = now; F.fighting = true;
      hooks.say(hooks.friend(), hooks.line('fightStart'), 3500);
      hooks.fight(fi.kind, ok => {
        F.fighting = false; const t = performance.now();
        if (ok) { hooks.say(hooks.friend(), hooks.line('fightWin'), 3000); startReel(t); }
        else { const fl = myFloat(); fleeFrom(fi, fl.x, fl.z, t); R.phase = 'wait'; R.nextAt = t + 8000 + rnd() * 6000; hooks.say(hooks.friend(), hooks.line('fightLose'), 3500); hooks.onChange(); }
      });
      hooks.onChange(); return;
    }
    startReel(now);
  }
  /** Strike: casts if the line is out, reels in on a bite, spooks the fish if you are too early. */
  F.strike = () => {
    const now = performance.now(); if (F.catchOpen || F.stowed) return;
    if (R.phase === 'out') F.cast();
    else if (R.phase === 'bite') hook(now);
    else if (R.phase === 'tease') {
      const fl = myFloat(); fleeFrom(R.fish, fl.x, fl.z, now); wait(now, 20000, 35000);
      hooks.say(hooks.friend(), hooks.line('tooEarly'), 3200); hooks.onChange();
    }
  };
  function showCatch(f, now) {
    F.catchOpen = true; const k = f.kind, e = F.journal.find(j => j.id === k.id);
    const pool = NICKS.slice(), names = []; for (let i = 0; i < 3; i++) names.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    F.caught = { kind: k, size: Math.round(k.len * 100 * (.85 + rnd() * .3)), before: e ? e.n + (e.freed || 0) : 0, names };
    F.splashT = now; F.ripple(R.cur.x, R.cur.z, .1, 1.2, 1100, now); sfx('catch'); hooks.onCatch(F.caught);
  }
  /** Keep the fish (it goes in the bucket and the aquarium), optionally named, or let it go: it still counts as caught. */
  F.finishCatch = (nick, release) => {
    if (!F.caught) return;
    const k = F.caught.kind; let e = F.journal.find(j => j.id === k.id);
    nick = release ? '' : (nick || '').trim().slice(0, 16);
    if (!e) { e = { id: k.id, name: k.name, n: 0, nicks: [], freed: 0 }; F.journal.push(e); }
    if (release) e.freed = (e.freed || 0) + 1; else e.n++;
    if (nick) e.nicks.push(nick); saveJournal();
    if (release) F.ripple(R.cur.x, R.cur.z, .1, .7, 900, performance.now());
    const key = release ? 'release' : nick ? 'nick' : k.len < .35 ? 'small' : k.len >= .6 ? 'big' : 'normal';
    hooks.say(hooks.friend(), hooks.line(key, { n: nick }), 4200);
    const idx = F.fish.indexOf(R.fish); if (idx >= 0) F.fish.splice(idx, 1);
    spawnFish(false);
    F.catchOpen = false; F.caught = null; R.phase = 'out'; R.fish = null; R.land = null;   // the line stays in until you cast again
    hooks.onChange();
  };
  return F;
}
