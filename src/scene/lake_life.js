import * as THREE from 'three';
import { bobberPos, rodTip } from '../game/fishing.js';
import { SEAT_X } from './world.js';
import { cue } from '../audio/audio.js';

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
  const possumSh = new THREE.Shape(); possumSh.moveTo(.32, .02); possumSh.bezierCurveTo(.34, .12, .22, .2, .1, .2); possumSh.bezierCurveTo(-.08, .24, -.22, .2, -.28, .1); possumSh.bezierCurveTo(-.4, .08, -.5, .16, -.62, .08); possumSh.bezierCurveTo(-.5, .0, -.4, .02, -.28, .0); possumSh.lineTo(-.2, 0); possumSh.lineTo(-.18, -.1); possumSh.lineTo(-.1, -.1); possumSh.lineTo(-.08, 0); possumSh.lineTo(.12, 0); possumSh.lineTo(.14, -.1); possumSh.lineTo(.22, -.1); possumSh.lineTo(.22, 0); possumSh.lineTo(.32, .02);
  const wrenSh = new THREE.Shape(); wrenSh.moveTo(.1, .0); wrenSh.bezierCurveTo(.1, .08, .06, .14, .0, .14); wrenSh.bezierCurveTo(-.05, .14, -.08, .1, -.1, .05); wrenSh.lineTo(-.24, .12); wrenSh.lineTo(-.14, -.02); wrenSh.bezierCurveTo(-.1, -.1, .05, -.1, .1, 0); wrenSh.lineTo(.18, .02);
  let nextAt = performance.now() + rnd(15000, 35000), cr = null;
  const clearCr = () => { if (cr) { cr.group.removeFromParent(); cr.group.traverse(o => { if (o.material) o.material.dispose(); if (o.geometry && o.geometry !== fishGeo) o.geometry.dispose(); }); cr = null; } };
  function spawn(now, night) {
    const day = night < .3, dusk = night >= .3 && night < .8, g = new THREE.Group(); scene.add(g);
    const kind = day ? pick(['flock', 'flock', 'wren', 'fish', 'fish']) : dusk ? pick(['ducks', 'ducks', 'fish', 'fish', 'flock']) : pick(['possum', 'possum', 'fish']);
    const dir = Math.random() < .5 ? 1 : -1, c = { kind, group: g, t0: now, dir, parts: [], done: false, cued: 0 };
    if (kind === 'flock' || kind === 'ducks') {
      const n = kind === 'ducks' ? 2 : pick([1, 1, 2, 3, 5]), duck = kind === 'ducks', y0 = duck ? rnd(.9, 1.4) : rnd(14, 26), z = duck ? rnd(-46, -34) : -90, sc = duck ? .55 : 2.2;
      c.dur = duck ? 9000 : rnd(14000, 20000); c.x0 = -dir * (duck ? 40 : 125); c.x1 = dir * (duck ? 40 : 125); c.y0 = y0; c.z = z;
      for (let i = 0; i < n; i++) { const m = flat(birdSh, duck ? 0x4a5468 : 0x3c4658, duck ? .6 : .5); m.scale.set(sc, sc, 1); g.add(m); c.parts.push({ m, dx: -i * (duck ? 2.2 : rnd(3, 6)) * dir, dy: (i % 2 ? -1 : 1) * i * rnd(.4, 1.2), ph: rnd(0, 6), sc }); }
      c.call = duck ? 'quack' : 'birdcall'; c.calls = duck ? [.35, .6] : [.3, .62];
    } else if (kind === 'fish') {
      const x = rnd(5, 24) * (Math.random() < .5 ? -1 : 1), z = rnd(-34, -17); c.x = x; c.z = z; c.dur = 900; c.pan = x / 26; c.h = rnd(.6, 1.0);
      const m = flat(sh, night > .5 ? 0xb4c6dc : 0xe4eef2, .8, false); m.scale.set(.5, .5, 1); g.add(m); c.parts.push({ m }); cue('fishjump', c.pan); c.splashed = false;
    } else if (kind === 'possum') {
      c.z = rnd(-5.4, -4.6); c.dur = 22000; c.x0 = -dir * 8; c.x1 = dir * 8; const m = flat(possumSh, 0x242a38, .85, false); m.scale.set(dir, 1, 1); g.add(m); c.parts.push({ m }); c.calls = [.3, .7];
    } else {
      c.z = rnd(-5, -4.4); c.dur = 15000; c.x0 = -dir * 7; c.x1 = dir * 7; const m = flat(wrenSh, 0x2f3b4e, .8, false); m.scale.set(dir * 1.2, 1.2, 1); g.add(m); c.parts.push({ m }); c.calls = [.25, .6];
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
    } else {
      const m = c.parts[0].m, wren = k === 'wren', pause = Math.sin(now / 2300 + c.t0) > .55, dt = Math.min(.1, (now - (c.last || now)) / 1000); c.last = now;
      c.px = (c.px ?? c.x0) + (pause ? 0 : (c.x1 - c.x0) / c.dur * 1000 * dt);
      const hop = wren ? (pause ? 0 : Math.max(0, Math.sin(now / 170)) * .1) : Math.abs(Math.sin(now / 420)) * .015, f = (c.px - c.x0) / (c.x1 - c.x0);
      m.position.set(c.px, .05 + hop, c.z);
      while (c.calls.length && f > c.calls[0]) { c.calls.shift(); cue(wren ? 'tweet' : 'possum', Math.max(-1, Math.min(1, c.px / 7))); }
      if (f >= 1) { clearCr(); nextAt = now + rnd(30000, 90000); }
    }
  }

  return function update(now) {
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
    // ripples
    F.ripples = F.ripples.filter(r => (now - r.t0) / r.dur < 1);
    while (ripples.length < F.ripples.length) { const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = .018; scene.add(m); ripples.push(m); }
    ripples.forEach((m, i) => {
      const r = F.ripples[i]; m.visible = !!r; if (!r) return;
      const age = (now - r.t0) / r.dur, rr = r.r0 + (r.r1 - r.r0) * age; m.position.x = r.x; m.position.z = r.z; m.scale.set(rr, rr, 1); m.material.opacity = .7 * (1 - age);
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
  };
}
