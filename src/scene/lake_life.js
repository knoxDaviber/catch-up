import * as THREE from 'three';
import { bobberPos, rodTip } from '../game/fishing.js';
import { SEAT_X } from './world.js';

/** Draws the fishing state in the scene: fish shadows, ripples, floats and lines. */
<<<<<<< HEAD
export function buildLakeLife(scene, F, getMine, getNight = () => 0) {
=======
export function buildLakeLife(scene, F, getMine) {
>>>>>>> origin/main
  // a soft fish silhouette, unit length, pointing +x
  const sh = new THREE.Shape();
  sh.moveTo(.5, 0); sh.bezierCurveTo(.42, .22, .1, .26, -.18, .12); sh.lineTo(-.46, .22); sh.lineTo(-.4, 0); sh.lineTo(-.46, -.22); sh.lineTo(-.18, -.12); sh.bezierCurveTo(.1, -.26, .42, -.22, .5, 0);
  const fishGeo = new THREE.ShapeGeometry(sh, 10);
  const shadows = new Map();
  const ringGeo = new THREE.RingGeometry(.94, 1, 40), ripples = [];
<<<<<<< HEAD
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
=======
  const floatGeo = new THREE.SphereGeometry(.07, 10, 8);
  const floats = [-1, 1].map(side => {
    const m = new THREE.Group();
    const top = new THREE.Mesh(floatGeo, new THREE.MeshLambertMaterial({ color: 0xd9473a })); m.add(top);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.071, 10, 5, 0, Math.PI * 2, 0, Math.PI * .5), new THREE.MeshLambertMaterial({ color: 0xf5efe2 })); cap.rotation.x = Math.PI; m.add(cap);
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xfaf6ec, transparent: true, opacity: .85 }));
    scene.add(m, line); return { side, m, line, lineGeo };
>>>>>>> origin/main
  });

  return function update(now) {
    const t = now / 1000, R = F.rod;
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
<<<<<<< HEAD
    const mine = getMine(), night = getNight();   // seat side (-1 left / +1 right) of the player's float
=======
    const mine = getMine();   // seat side (-1 left / +1 right) of the player's float
>>>>>>> origin/main
    floats.forEach(fl => {
      const px = fl.side * SEAT_X, bp = bobberPos(px); let pos = { x: bp[0], y: bp[1], z: bp[2] }, dip = 0;
      if (fl.side === mine) {
        pos = R.cur;
        if (R.phase === 'bite' || R.phase === 'fight') dip = -.06 - .04 * Math.abs(Math.sin(t * 9));
        else if (now < R.dipUntil) dip = -.04 * Math.sin(Math.PI * (1 - (R.dipUntil - now) / 380));
      } else if (now < F.fr.dipUntil) dip = -.07 - .03 * Math.abs(Math.sin(t * 8));
      const by = pos.y + .02 + Math.sin(t * 1.6 + fl.side) * .008 + dip, tip = rodTip(px);
<<<<<<< HEAD
      fl.m.visible = fl.line.visible = !(fl.side === mine && F.stowed);   // your rod is resting by the chair
      fl.m.position.set(pos.x, by, pos.z); fl.top.material.emissiveIntensity = night * .9; fl.halo.material.opacity = night * (fl.side === mine ? .55 : .3);
=======
      fl.m.position.set(pos.x, by, pos.z);
>>>>>>> origin/main
      fl.lineGeo.attributes.position.setXYZ(0, tip[0], tip[1], tip[2]); fl.lineGeo.attributes.position.setXYZ(1, pos.x, by, pos.z); fl.lineGeo.attributes.position.needsUpdate = true; fl.lineGeo.computeBoundingSphere();
    });
  };
}
