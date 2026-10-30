/* The optional reel-in challenge: follow the fish along a bar.
<<<<<<< HEAD
   The fish moves along the bar; you slide a catching zone (mouse, touch, or the arrow keys / A and D).
   While the fish is inside the zone the line gains; outside it, the line slips. The zone keeps getting smaller.
   How hard it is depends on the fish: kind.diff (0..1) sets speed, zone size and how fast the line slips,
   and kind.style sets how it moves. */
const STYLES = {
  darter: { gap: [.35, .8], reach: .35 },              // quick little hops
  steady: { gap: [1.4, 2.6], reach: .45 },             // slow, lazy drift
  jumper: { gap: [.7, 1.4], reach: .6, leap: .5 },     // sudden leaps across the bar
  runner: { gap: [1.1, 2], reach: 1, edges: true },    // long runs out to either end
  diver: { gap: [1, 1.9], reach: .55, drag: 1.5 },     // not fast, but heavy: the line slips quicker
};
const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), rnd = Math.random;

export function createFight() {
  const S = { active: false, zone: .5, zw: .3, fish: .5, prog: .35, done: null, kind: null, inside: false };
  let t = 0, target = .5, retarget = 0, speed = 1, dur = 16, zw0 = .3, zw1 = .1, gain = .26, slip = .2, st = STYLES.darter;
  S.start = (kind, onEnd) => {
    const d = kind.diff ?? kind.len; st = STYLES[kind.style] || STYLES.darter;
    S.active = true; S.kind = kind; S.done = onEnd; S.prog = .3; S.zone = .5; S.fish = .5; t = 0; retarget = 0;
    speed = .7 + d * 1.8; dur = 10 + d * 14;
    zw0 = .34 - d * .08; zw1 = .17 - d * .06; S.zw = zw0;
    gain = .15 - d * .03; slip = (.06 + d * .08) * (st.drag || 1);
  };
  /** A word for how hard this one is, for the hint above the bar. */
  S.label = kind => { const d = kind.diff ?? kind.len; return d < .3 ? 'an easy one' : d < .6 ? 'putting up a fight' : d < .85 ? 'a real fighter' : 'a monster'; };
  S.move = x => { S.zone = clamp(x, 0, 1); };            // pointer: absolute position along the bar
  S.nudge = dx => { S.zone = clamp(S.zone + dx, 0, 1); };  // keys
  S.update = dt => {
    if (!S.active) return;
    t += dt; S.zw = zw0 - Math.min(1, t / dur) * (zw0 - zw1);
    if (t > retarget) {
      target = st.edges && rnd() < .6 ? (rnd() < .5 ? .04 + rnd() * .14 : .82 + rnd() * .14) : clamp(S.fish + (rnd() * 2 - 1) * st.reach, .04, .96);
      retarget = t + (st.gap[0] + rnd() * (st.gap[1] - st.gap[0])) / speed;
      if (st.leap && rnd() < st.leap) S.fish += (target - S.fish) * .7;   // a jump: most of the way at once
    }
    S.fish += (target - S.fish) * Math.min(1, dt * 1.6 * speed);
    S.inside = Math.abs(S.fish - S.zone) < S.zw / 2;
    S.prog += dt * (S.inside ? gain : -slip);
=======
   The fish drifts and darts along the bar; you slide a catching zone (mouse, touch, or the arrow keys / A and D).
   While the fish is inside the zone the line gains; outside it, the line slips. The zone keeps getting smaller. */
export function createFight() {
  const S = { active: false, zone: .5, zw: .3, fish: .5, prog: .35, done: null, kind: null };
  let t = 0, target = .5, retarget = 0, speed = 1, dur = 16;
  S.start = (kind, onEnd) => {
    S.active = true; S.kind = kind; S.done = onEnd; S.prog = .35; S.zone = .5; S.fish = .5; S.zw = .3; t = 0; retarget = 0;
    speed = 1.1 + kind.len * 1.6; dur = 12 + kind.len * 10;      // bigger fish dart faster and hold on longer
  };
  S.move = x => { S.zone = Math.min(1, Math.max(0, x)); };            // pointer: absolute position along the bar
  S.nudge = dx => { S.zone = Math.min(1, Math.max(0, S.zone + dx)); };  // keys
  S.update = dt => {
    if (!S.active) return;
    t += dt; S.zw = .3 - Math.min(1, t / dur) * .2;                 // the zone shrinks from 30% to 10% of the bar
    if (t > retarget) { target = .06 + Math.random() * .88; retarget = t + (.7 + Math.random() * 1.3) / speed; }
    S.fish += (target - S.fish) * Math.min(1, dt * 1.6 * speed);
    const inside = Math.abs(S.fish - S.zone) < S.zw / 2;
    S.inside = inside; S.prog += dt * (inside ? .26 : -.2 * (.8 + speed * .2));
>>>>>>> origin/main
    if (S.prog >= 1) end(true); else if (S.prog <= 0) end(false);
  };
  function end(ok) { S.active = false; const cb = S.done; S.done = null; cb && cb(ok); }
  S.cancel = () => { S.active = false; S.done = null; };
  return S;
}
