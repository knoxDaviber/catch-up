/* The optional reel-in challenge: follow the fish along a bar.
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
    if (S.prog >= 1) end(true); else if (S.prog <= 0) end(false);
  };
  function end(ok) { S.active = false; const cb = S.done; S.done = null; cb && cb(ok); }
  S.cancel = () => { S.active = false; S.done = null; };
  return S;
}
