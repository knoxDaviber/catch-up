import * as THREE from 'three';
import { bobberPos, rodTip } from '../game/fishing.js';
import { SEAT_X } from './world.js';
import { cue } from '../audio/audio.js';
import { ART } from '../assets/manifest.js';
import { loadTex } from './art.js';

/** Draws the fishing state in the scene: fish shadows, ripples, floats and lines. */
export function buildLakeLife(scene, F, getMine, getNight = () => 0) {
  // a soft fish silhouette, unit length, pointing +x
  const sh = new THREE.Shape();
  sh.moveTo(.5, 0); sh.bezierCurveTo(.42, .22, .1, .26, -.18, .12); sh.lineTo(-.46, .22); sh.lineTo(-.4, 0); sh.lineTo(-.46, -.22); sh.lineTo(-.18, -.12); sh.bezierCurveTo(.1, -.26, .42, -.22, .5, 0);
  const fishGeo = new THREE.ShapeGeometry(sh, 10);
  const shadows = new Map();
  const ringGeo = new THREE.RingGeometry(.94, 1, 40), ripples = [];
  const floatGeo = new THREE.SphereGeometry(.1, 12, 8);   // big enough to read from the chair
  const haloTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const floats = [-1, 1].map(side => {
    const m = new THREE.Group();
    const top = new THREE.Mesh(floatGeo, new THREE.MeshLambertMaterial({ color: 0xd9473a, emissive: 0xff5a3c, emissiveIntensity: 0 })); m.add(top);
    // a soft halo so the float can still be found after dark
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0xffb37a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); halo.scale.set(.9, .9, 1); m.add(halo);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.101, 12, 5, 0, Math.PI * 2, 0, Math.PI * .5), new THREE.MeshLambertMaterial({ color: 0xf5efe2 })); cap.rotation.x = Math.PI; m.add(cap);
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xfaf6ec, transparent: true, opacity: .85 }));
    scene.add(m, line); return { side, m, line, lineGeo, top, halo };
  });

  /* ---------- critters: one rare visitor at a time (every 30-90 s), soft flat silhouettes. Never near the board or the floats. ---------- */
  const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
  const flat = (shape, color, opacity = .55, fog = true) => new THREE.Mesh(new THREE.ShapeGeometry(shape, 8), new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide, fog }));
  const birdSh = new THREE.Shape(); birdSh.moveTo(-1, .25); birdSh.quadraticCurveTo(-.5, .55, 0, .06); birdSh.quadraticCurveTo(.5, .55, 1, .25); birdSh.quadraticCurveTo(.5, .3, 0, -.12); birdSh.quadraticCurveTo(-.5, .3, -1, .25);
  const frogSh = new THREE.Shape(); frogSh.moveTo(.5, .02); frogSh.bezierCurveTo(.5, .16, .36, .27, .2, .26); frogSh.bezierCurveTo(.05, .36, -.2, .3, -.32, .18); frogSh.bezierCurveTo(-.46, .16, -.54, .05, -.52, -.02); frogSh.lineTo(-.64, -.12); frogSh.lineTo(-.3, -.12); frogSh.lineTo(.44, -.12); frogSh.bezierCurveTo(.5, -.08, .5, -.02, .5, .02);
  const sacSh = new THREE.Shape(); sacSh.absellipse(0, 0, .09, .07, 0, Math.PI * 2);
  const wrenSh = new THREE.Shape(); wrenSh.moveTo(.1, .0); wrenSh.bezierCurveTo(.1, .08, .06, .14, .0, .14); wrenSh.bezierCurveTo(-.05, .14, -.08, .1, -.1, .05); wrenSh.lineTo(-.24, .12); wrenSh.lineTo(-.14, -.02); wrenSh.bezierCurveTo(-.1, -.1, .05, -.1, .1, 0); wrenSh.lineTo(.18, .02);
  let nextAt = performance.now() + rnd(15000, 35000), cr = null, dragonT = null;
  loadTex(ART.critters && ART.critters.dragonfly).then(t => { dragonT = t; });   // the dragonfly is painted art only
  let ringAt = performance.now() + rnd(4000, 9000);   // now and then a slow, faint ring spreads somewhere out on the lake, clear of the floats
  const clearCr = () => { if (cr) { cr.group.removeFromParent(); cr.group.traverse(o => { if (o.material) o.material.dispose(); if (o.geometry && o.geometry !== fishGeo) o.geometry.dispose(); }); cr = null; } };
  function spawn(now, night, force) {
    const day = night < .3, dusk = night >= .3 && night < .8, g = new THREE.Group(); scene.add(g);
    const kind = force || (day ? pick(['flock', 'flock', 'wren', 'fish', 'fish', ...(dragonT ? ['dragonfly', 'dragonfly'] : [])]) : dusk ? pick(['ducks', 'ducks', 'fish', 'fish', 'flock', 'frog']) : pick(['frog', 'frog', 'fish']));
    const dir = Math.random() < .5 ? 1 : -1, c = { kind, group: g, t0: now, dir, parts: [], done: false, cued: 0 };
    if (kind === 'flock' || kind === 'ducks') {
      const n = kind === 'ducks' ? 2 : pick([1, 1, 2, 3, 5]), duck = kind === 'ducks', y0 = duck ? rnd(.9, 1.4) : rnd(14, 26), z = duck ? rnd(-46, -34) : -90, sc = duck ? .55 : 2.2;
      c.dur = duck ? 9000 : rnd(14000, 20000); c.x0 = -dir * (duck ? 40 : 125); c.x1 = dir * (duck ? 40 : 125); c.y0 = y0; c.z = z;
      for (let i = 0; i < n; i++) { const m = flat(birdSh, duck ? 0x4a5468 : 0x3c4658, duck ? .6 : .5); m.scale.set(sc, sc, 1); g.add(m); c.parts.push({ m, dx: -i * (duck ? 2.2 : rnd(3, 6)) * dir, dy: (i % 2 ? -1 : 1) * i * rnd(.4, 1.2), ph: rnd(0, 6), sc }); }
      c.call = duck ? 'quack' : 'birdcall'; c.calls = duck ? [.35, .6] : [.3, .62];
    } else if (kind === 'fish') {
      const x = rnd(5, 24) * (Math.random() < .5 ? -1 : 1), z = rnd(-34, -17); c.x = x; c.z = z; c.dur = 900; c.pan = x / 26; c.h = rnd(.6, 1.0);
      const m = flat(sh, night > .5 ? 0xb4c6dc : 0xe4eef2, .8, false); m.scale.set(.5, .5, 1); g.add(m); c.parts.push({ m }); cue('fishjump', c.pan); c.splashed = false;
    } else if (kind === 'dragonfly') {   // darts and hovers low over the shallows off one side, never out in front of the floats
      const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: dragonT, transparent: true, alphaTest: .05, depthWrite: false })), w = .5;   // larger than life, so it reads from the chairs
      m.scale.set(w, w * dragonT.image.height / dragonT.image.width, 1); g.add(m); c.parts.push({ m, w });
      c.dur = rnd(12000, 18000); c.p = new THREE.Vector3(dir * 12, .6, -5.6); c.to = c.p.clone(); c.next = 0;
    } else if (kind === 'frog') {   // hops up from the water's edge or in from the side, sits and croaks, then hops back into the lake or away
      const fg = new THREE.Group(), body = flat(frogSh, 0x2c3b32, .85, false), sac = flat(sacSh, 0x7d9068, .7, false); sac.position.set(.3, -.03, .002); fg.add(body, sac); g.add(fg); fg.visible = false;
      const xl = dir * rnd(3.4, 6.2), zl = rnd(-5.3, -4.7), L = [xl, zl], sg = [], pt = { p: null }, at = { t: 0 }, add = q => { q.t = at.t; at.t += q.d; sg.push(q); };
      const hop = (to, d, h) => { add({ k: 'hop', d, h, from: pt.p, to }); pt.p = to; }, idle = (d, cues) => add({ k: 'idle', d, cues, cued: 0, at: pt.p });
      const chain = (to, n) => { const f = pt.p; for (let i = 1; i <= n; i++) hop([f[0] + (to[0] - f[0]) * i / n, f[1] + (to[1] - f[1]) * i / n], 520, .28); };
      if (Math.random() < .55) { pt.p = [xl - dir * .2, -7.3]; hop(L, 780, .55); } else { pt.p = [dir * 10.5, zl]; chain(L, 4); }
      idle(rnd(2200, 3200), [700]);
      if (Math.random() < .55) { hop([xl - dir * rnd(.5, 1), zl + rnd(-.2, .2)], 480, .22); idle(rnd(1400, 2200), [500]); }
      const toWater = Math.random() < .6;
      if (toWater) { const q = pt.p; hop([q[0] - dir * .3, -7.3], 800, .5); } else chain([(Math.random() < .5 ? -1 : 1) * 10.5, zl], 4);
      Object.assign(c, { fg, body, sac, segs: sg, dur: at.t + 200, face: dir, inWater: toWater });
    } else {
      c.z = rnd(-5, -4.4); c.dur = 12000; const m = flat(wrenSh, 0x2f3b4e, .8, false), wing = flat(birdSh, 0x2f3b4e, .8, false); wing.position.set(-.02, .08, .001); wing.scale.set(.2, .2, 1); m.add(wing); g.add(m); m.visible = false;
      const xl = dir * rnd(3.4, 5.6), T1 = 1700, Tp = rnd(3800, 5200), n = 4 + Math.floor(Math.random() * 3);
      Object.assign(c, { m, wing, xl, xs: dir * 11, ys: rnd(2.6, 3.6), T1, Tp, n, hopD: Math.random() < .55 ? -dir * rnd(.5, .9) : 0, T2: T1 + Tp + 250, calls: [T1 - 300, T1 + Tp * .6], dur: T1 + Tp + 250 + 1700 });
    }
    cr = c;
  }
  function stepCritter(now) {
    const c = cr, p = (now - c.t0) / c.dur, k = c.kind, g = c.group;
    if (p >= 1 && (k === 'flock' || k === 'ducks' || k === 'fish')) { clearCr(); nextAt = now + rnd(30000, 90000); return; }
    if (k === 'flock' || k === 'ducks') {
      const x = c.x0 + (c.x1 - c.x0) * p, flap = k === 'ducks' ? 17 : 6;
      c.parts.forEach(q => { q.m.position.set(x + q.dx, c.y0 + q.dy + Math.sin(now / 900 + q.ph) * .4, c.z); q.m.scale.set(c.dir * q.sc, q.sc * (.35 + .65 * Math.abs(Math.sin(now / 1000 * flap * .5 + q.ph))), 1); });
      while (c.calls.length && p > c.calls[0]) { c.calls.shift(); cue(c.call, Math.max(-1, Math.min(1, x / (k === 'ducks' ? 45 : 90)))); }
    } else if (k === 'fish') {
      const m = c.parts[0].m, u = p, y = c.h * 4 * u * (1 - u), vy = c.h * 4 * (1 - 2 * u);
      m.position.set(c.x + c.dir * (u - .5) * 1.4, .08 + y, c.z); m.rotation.y = c.dir < 0 ? Math.PI : 0; m.rotation.z = Math.atan2(vy, 1.4);
      m.visible = u > .02;
      if (!c.splashed && p > .92) { c.splashed = true; F.ripple(m.position.x, c.z, .1, 1.1, 1300, now); F.ripple(m.position.x, c.z, .05, .6, 900, now + 150); }
    } else if (k === 'dragonfly') {
      const q = c.parts[0], dt = Math.min(.1, (now - (c.last || now)) / 1000); c.last = now;
      if (p >= 1) { clearCr(); nextAt = now + rnd(30000, 90000); return; }
      if (now > c.next) { c.next = now + rnd(500, 1600); if (p > .88) c.to.set(c.dir * 15, 2.2, -6); else c.to.set(c.dir * rnd(3.4, 8), rnd(.3, .65), rnd(-5.6, -4.5)); }
      const dx = c.to.x - c.p.x; c.p.lerp(c.to, Math.min(1, dt * 5)); if (Math.abs(dx) > .05) q.m.scale.x = (dx > 0 ? -1 : 1) * q.w;   // the art faces left
      q.m.position.set(c.p.x + Math.sin(now / 90) * .01, c.p.y + Math.sin(now / 130) * .015, c.p.z);
    } else if (k === 'frog') {
      const e = now - c.t0, sg = c.segs.find(q => e >= q.t && e < q.t + q.d), fg = c.fg;
      if (!sg) { clearCr(); nextAt = now + rnd(30000, 90000); return; }
      const u = (e - sg.t) / sg.d, last = sg === c.segs[c.segs.length - 1];
      if (sg.k === 'hop') {
        const dx = sg.to[0] - sg.from[0]; if (Math.abs(dx) > .05) c.face = dx > 0 ? 1 : -1;
        fg.position.set(sg.from[0] + dx * u, .09 + sg.h * 4 * u * (1 - u), sg.from[1] + (sg.to[1] - sg.from[1]) * u);
        fg.rotation.z = c.face * (.5 - u) * .7; fg.scale.set(c.face * .6, .6 * (1 + .12 * Math.sin(Math.PI * u)), 1); c.body.scale.y = 1; c.sac.visible = false;
        fg.visible = u > .03 && !(last && c.inWater && u > .9);
        if (last && c.inWater && u > .86 && !c.splashed) { c.splashed = true; F.ripple(sg.to[0], sg.to[1], .08, .9, 1500, now); F.ripple(sg.to[0], sg.to[1], .04, .5, 1000, now + 150); cue('plop', Math.max(-1, Math.min(1, sg.to[0] / 8))); }
      } else {
        const br = Math.sin(now / 330), sacOn = sg.cued > 0 && e - sg.t - sg.cues[0] < 1100;
        fg.position.set(sg.at[0], .09, sg.at[1]); fg.rotation.z = 0; fg.scale.set(c.face * .6, .6, 1); fg.visible = true;
        c.body.scale.y = 1 + .035 * br; c.sac.visible = true; c.sac.scale.setScalar(sacOn ? .8 + .9 * Math.abs(Math.sin(now / 130)) : .6 + .12 * br);
        while (sg.cued < sg.cues.length && e - sg.t > sg.cues[sg.cued]) { sg.cued++; cue('croak', Math.max(-1, Math.min(1, sg.at[0] / 8))); }
      }
    } else {
      const e = now - c.t0, m = c.m, wing = c.wing, dir = c.dir, ph = Math.sin(now / 42);
      let x, y, face = -dir, tilt = 0, fly = false;
      if (e < c.T1) {
        const u = e / c.T1, eu = 1 - (1 - u) * (1 - u); x = c.xs + (c.xl - c.xs) * eu; y = .05 + (c.ys - .05) * Math.pow(1 - eu, 1.6) + Math.sin(now / 260) * .05 * (1 - u); fly = true; tilt = -face * (.12 - .3 * u * u);
      } else if (e < c.T2) {
        const pe = e - c.T1, slot = c.Tp / c.n, f = (pe % slot) / slot, hu = Math.min(1, Math.max(0, (pe - c.Tp * .45) / 380));
        x = c.xl + c.hopD * (hu * hu * (3 - 2 * hu)); y = .05 + (c.hopD ? .13 * Math.sin(Math.PI * hu) : 0);
        if (c.hopD && hu > 0) face = c.hopD > 0 ? 1 : -1;
        const peck = f < .3 ? Math.sin(f / .3 * Math.PI) : 0; tilt = -face * (peck * .75 - .06 * Math.sin(now / 700)); y -= peck * .025;
      } else {
        const u = Math.min(1, (e - c.T2) / 1700), xc = c.xl + c.hopD; face = dir; x = xc + (c.xs - xc) * u * u; y = .05 + 3.4 * Math.pow(u, 1.7) + Math.sin(now / 240) * .05 * u; fly = true; tilt = face * .18 * u;
      }
      m.visible = true; m.position.set(x, y, c.z); m.rotation.z = tilt; m.scale.set(face * 1.2, 1.2, 1);
      wing.scale.set(.2, fly ? .05 + .22 * Math.abs(ph) : .03, 1);
      while (c.calls.length && e > c.calls[0]) { c.calls.shift(); cue('tweet', Math.max(-1, Math.min(1, x / 8))); }
      if (e >= c.dur) { clearCr(); nextAt = now + rnd(30000, 90000); }
    }
  }

  return Object.assign(function update(now) {
    const t = now / 1000, R = F.rod;
    if (cr) stepCritter(now);
    else if (now > nextAt) { if (R.phase === 'bite' || R.phase === 'fight' || R.phase === 'reel' || F.caught && now - F.splashT < 8000) nextAt = now + 8000; else spawn(now, getNight()); }
    // shadows
    for (const f of F.fish) {
      let s = shadows.get(f);
      if (!s) { s = new THREE.Mesh(fishGeo, new THREE.MeshBasicMaterial({ color: 0x2f5878, transparent: true, opacity: .3, depthWrite: false })); s.rotation.x = -Math.PI / 2; const g = new THREE.Group(); g.add(s); scene.add(g); s.userData.g = g; shadows.set(f, s); }
      const L = f.kind.len * 1.5, g = s.userData.g;
      let al = .3; if (f.mode === 'bite' || f.mode === 'tease') al = .4;
      if (f.mode === 'hooked') al *= Math.min(1, Math.max(0, 1 - (R.cur.y + .03) / .35));
      s.material.opacity = al; g.visible = al > .02;
      g.position.set(f.x, .014, f.z); g.rotation.y = -f.h; s.scale.set(L, L * (.9 + .12 * Math.sin(now / 380 + f.ph)), 1);
    }
    for (const [f, s] of shadows) if (!F.fish.includes(f)) { s.userData.g.removeFromParent(); s.material.dispose(); shadows.delete(f); }
    if (now > ringAt) { ringAt = now + rnd(6000, 14000); const x = rnd(-16, 16), z = rnd(-28, -10); if (Math.abs(x) > 5 || z < -14) F.ripples.push({ x, z, r0: .1, r1: rnd(1, 1.6), dur: rnd(4500, 6500), t0: now, a: .25 }); }
    // ripples
    F.ripples = F.ripples.filter(r => (now - r.t0) / r.dur < 1);
    while (ripples.length < F.ripples.length) { const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = .018; scene.add(m); ripples.push(m); }
    ripples.forEach((m, i) => {
      const r = F.ripples[i]; m.visible = !!r; if (!r) return;
      const age = (now - r.t0) / r.dur, rr = r.r0 + (r.r1 - r.r0) * age; m.position.x = r.x; m.position.z = r.z; m.scale.set(rr, rr, 1); m.material.opacity = (r.a ?? .7) * (1 - age);
    });
    // floats and lines
    const mine = getMine(), night = getNight();   // seat side (-1 left / +1 right) of the player's float
    floats.forEach(fl => {
      const px = fl.side * SEAT_X, bp = bobberPos(px); let pos = { x: bp[0], y: bp[1], z: bp[2] }, dip = 0;
      if (fl.side === mine) {
        pos = R.cur;
        if (R.phase === 'bite' || R.phase === 'fight') dip = -.06 - .04 * Math.abs(Math.sin(t * 9));
        else if (now < R.dipUntil) dip = -.04 * Math.sin(Math.PI * (1 - (R.dipUntil - now) / 380));
      } else if (now < F.fr.dipUntil) dip = -.07 - .03 * Math.abs(Math.sin(t * 8));
      const by = pos.y + .02 + Math.sin(t * 1.6 + fl.side) * .008 + dip, tip = rodTip(px);
      fl.m.visible = fl.line.visible = !(fl.side === mine && F.stowed);   // your rod is resting by the chair
      fl.m.position.set(pos.x, by, pos.z); fl.top.material.emissiveIntensity = night * .9; fl.halo.material.opacity = night * (fl.side === mine ? .55 : .3);
      fl.lineGeo.attributes.position.setXYZ(0, tip[0], tip[1], tip[2]); fl.lineGeo.attributes.position.setXYZ(1, pos.x, by, pos.z); fl.lineGeo.attributes.position.needsUpdate = true; fl.lineGeo.computeBoundingSphere();
    });
  }, { force: kind => { clearCr(); spawn(performance.now(), getNight(), kind); } });   // debug: __cu.critter('frog' | 'wren' | ...)
}
