/* Fishing loop (rules only, no rendering).
   Fish are shadows in the lake. Every so often one notices your float, circles it, nibbles a few times,
   then bites (strike in time) or loses interest. A missed bite runs away.
   Phases: wait -> approach -> tease -> bite -> reel -> catch. */
export const KINDS = [
  { id: 'minnow', name: 'Minnow', len: .2, w: 30, col: '#9DB5C4', belly: '#E6EEF0' },
  { id: 'perch', name: 'Perch', len: .3, w: 24, col: '#7C9A5A', belly: '#E3D9A0' },
  { id: 'bluegill', name: 'Bluegill', len: .36, w: 20, col: '#5C86A8', belly: '#E8A25C' },
  { id: 'trout', name: 'Trout', len: .5, w: 12, col: '#A5A88A', belly: '#E9C7B0' },
  { id: 'carp', name: 'Carp', len: .72, w: 8, col: '#B98A4E', belly: '#E6CF9A' },
  { id: 'catfish', name: 'Catfish', len: .9, w: 4, col: '#6D6A66', belly: '#C8BEB0' },
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
    challenge: false, fighting: false,
    fish: [], ripples: [], journal: [], bite: false, catchOpen: false, caught: null, splashT: -1e9, auto: true,
    rod: { phase: 'wait', nextAt: 0, fish: null, nibs: 0, nibT: 0, dipUntil: 0, winEnd: 0, t0: 0, dur: 2000, nextRip: 0, until: 0, quick: false, cur: { x: 0, y: 0, z: 0 } },
    fr: { nextAt: 0, dipUntil: 0 },
  };
  const R = F.rod;
  try { F.journal = JSON.parse(localStorage.getItem(JKEY) || '[]'); } catch (e) { F.journal = []; }
  const saveJournal = () => { try { localStorage.setItem(JKEY, JSON.stringify(F.journal)); } catch (e) { /* storage is optional */ } };
  const myFloat = () => { const b = bobberPos(hooks.mySeatX()); return { x: b[0], z: b[2] }; };

  function weighted() {
    let t = 0; KINDS.forEach(k => { t += k.w; });
    let r = rnd() * t; for (const k of KINDS) { r -= k.w; if (r <= 0) return k; }
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
  F.reset = () => {
    F.fish.forEach(f => { if (f.mode !== 'wander') { f.mode = 'wander'; f.retarget = 0; } });
    R.phase = 'wait'; R.fish = null; R.nextAt = performance.now() + 7000 + rnd() * 6000; F.bite = false; F.fighting = false; F.catchOpen = false; F.caught = null;
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
    f.mode = 'approach'; f.ph = rnd() * 6.28;
    R.phase = 'approach'; R.fish = f; R.quick = !!quick; R.until = now + 14000;
  };
  F.stepRod = now => {
    const f = R.fish, fl = myFloat();
    if (R.phase === 'wait') {
      if (F.auto && !F.catchOpen && now > R.nextAt) F.startEvent(now, false);
    } else if (R.phase === 'approach') {
      if (!f || f.mode !== 'approach') { R.phase = 'wait'; R.nextAt = now + 6000; }
      else if (Math.hypot(f.x - fl.x, f.z - fl.z) < .55) { R.phase = 'tease'; f.mode = 'tease'; R.nibs = R.quick ? 1 : 2 + Math.floor(rnd() * 3); R.nibT = now + 500; }
      else if (now > R.until) { fleeFrom(f, fl.x, fl.z, now); R.phase = 'wait'; R.nextAt = now + 5000; }
    } else if (R.phase === 'tease') {
      if (now >= R.nibT) {
        if (R.nibs > 0) { R.nibs--; R.dipUntil = now + 380; R.nibT = now + 800 + rnd() * 600; F.ripple(fl.x, fl.z, .08, .4, 700, now); sfx('nibble'); }
        else if (R.quick || rnd() < .72) { R.phase = 'bite'; f.mode = 'bite'; R.winEnd = now + 7000; R.nextRip = now; F.bite = true; sfx('bite'); hooks.say(hooks.friend(), hooks.line('bite'), 4500); hooks.onChange(); }
        else { fleeFrom(f, fl.x, fl.z, now); R.phase = 'wait'; R.nextAt = now + 7000 + rnd() * 7000; }
      }
    } else if (R.phase === 'bite') {
      if (now > R.nextRip) { F.ripple(fl.x, fl.z, .12, .9, 1000, now); R.nextRip = now + 900; }
      if (now > R.winEnd) { F.bite = false; fleeFrom(f, fl.x, fl.z, now); R.phase = 'wait'; R.nextAt = now + 8000 + rnd() * 8000; hooks.say(hooks.friend(), hooks.line('miss'), 3500); hooks.onChange(); }
    } else if (R.phase === 'fight') {
      if (now > R.nextRip) { F.ripple(R.cur.x, R.cur.z, .08, .55, 600, now); R.nextRip = now + 420; R.dipUntil = now + 260; }
    } else if (R.phase === 'reel') {
      if ((now - R.t0) / R.dur >= 1) { R.phase = 'catch'; showCatch(f, now); }
    }
    const px = hooks.mySeatX(), bp = bobberPos(px), cur = { x: bp[0], y: bp[1], z: bp[2] };
    if (R.phase === 'reel' || R.phase === 'catch') {
      const e = R.phase === 'catch' ? 1 : smooth(clamp((now - R.t0) / R.dur, 0, 1));
      cur.x = lerp(bp[0], px * .9, e); cur.z = lerp(bp[2], -3.3, e); cur.y = bp[1] + .55 * e * e;
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
    if (F.challenge && hooks.fight) {
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
  /** Strike: reels in on a bite, spooks the fish if you are too early. */
  F.strike = () => {
    const now = performance.now(); if (F.catchOpen) return;
    if (R.phase === 'bite') hook(now);
    else if (R.phase === 'tease') {
      const fl = myFloat(); fleeFrom(R.fish, fl.x, fl.z, now); R.phase = 'wait'; R.nextAt = now + 7000 + rnd() * 6000;
      hooks.say(hooks.friend(), hooks.line('tooEarly'), 3200);
    }
  };
  function showCatch(f, now) {
    F.catchOpen = true; const k = f.kind, e = F.journal.find(j => j.id === k.id);
    const pool = NICKS.slice(), names = []; for (let i = 0; i < 3; i++) names.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    F.caught = { kind: k, size: Math.round(k.len * 100 * (.85 + rnd() * .3)), before: e ? e.n : 0, names };
    F.splashT = now; F.ripple(R.cur.x, R.cur.z, .1, 1.2, 1100, now); sfx('catch'); hooks.onCatch(F.caught);
  }
  F.finishCatch = nick => {
    if (!F.caught) return;
    const k = F.caught.kind, now = performance.now(); let e = F.journal.find(j => j.id === k.id);
    nick = (nick || '').trim().slice(0, 16);
    if (!e) { e = { id: k.id, name: k.name, n: 0, nicks: [] }; F.journal.push(e); }
    e.n++; if (nick) e.nicks.push(nick); saveJournal();
    const key = nick ? 'nick' : k.len < .35 ? 'small' : k.len >= .6 ? 'big' : 'normal';
    hooks.say(hooks.friend(), hooks.line(key, { n: nick }), 4200);
    const idx = F.fish.indexOf(R.fish); if (idx >= 0) F.fish.splice(idx, 1);
    spawnFish(false);
    F.catchOpen = false; F.caught = null; R.phase = 'wait'; R.fish = null; R.nextAt = now + 6000 + rnd() * 7000;
    hooks.onChange();
  };
  return F;
}
