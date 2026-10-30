import * as THREE from 'three';
import { mat } from './world.js';

/* A small bait tin by each chair (the click target for "Toss some bait") and the little arc of crumbs it throws.
   buildBait(scene, onLand) -> { hot: entries for main's HOT map, toss(from, to, now), update(now) }. onLand(x, z, i) fires as each crumb hits the water. */
const N = 16, G = 9;
export function buildBait(scene, onLand) {
  const hot = [];
  [['liam', -1], ['xiao', 1]].forEach(([who, s]) => {
    const tin = new THREE.Group(); tin.position.set(s * 1.95, 0, -2.5); tin.rotation.y = s * .6; tin.scale.setScalar(1.7); scene.add(tin);
    const can = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, .1, 14), mat(0xe0b86a)); can.position.y = .05; tin.add(can);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, .02, 14), mat(0x8f7a4a)); lid.position.set(.12, .02, .04); lid.rotation.z = .12; tin.add(lid);
    const mush = new THREE.Mesh(new THREE.CircleGeometry(.08, 12), mat(0x9b7b55)); mush.rotation.x = -Math.PI / 2; mush.position.y = .101; tin.add(mush);
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .3, 8), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = .15; tin.add(hit);
    hot.push({ key: 'bait', who, obj: tin, at: [s * 1.95, .3, -2.5] });
  });
  const pos = new Float32Array(N * 3), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xd9bf8a, size: .07, transparent: true, opacity: .9, depthWrite: false })); pts.frustumCulled = false; pts.visible = false; scene.add(pts);
  let crumbs = [];
  return {
    hot,
    toss(from, to, now) {
      crumbs = []; for (let i = 0; i < N; i++) { const tx = to[0] + (Math.random() - .5) * 1.1, tz = to[1] + (Math.random() - .5) * 1.1, d = .8 + Math.random() * .5 + Math.hypot(tx - from[0], tz - from[2]) * .06; crumbs.push({ t0: now + i * 25, d: d * 1000, a: from, tx, tz, up: 1.6 + Math.random() * .8, done: false, i }); }
      pts.visible = true;
    },
    update(now) {
      if (!crumbs.length) return; let live = 0;
      crumbs.forEach(c => {
        const e = (now - c.t0) / c.d, k = c.i * 3;
        if (e < 0) { pos[k + 1] = -50; live++; return; }
        if (e >= 1) { pos[k + 1] = -50; if (!c.done) { c.done = true; onLand(c.tx, c.tz, c.i); } return; }
        live++; pos[k] = c.a[0] + (c.tx - c.a[0]) * e; pos[k + 2] = c.a[2] + (c.tz - c.a[2]) * e; pos[k + 1] = c.a[1] + 4 * c.up * e * (1 - e) - (c.a[1] - .02) * e * e;
      });
      geo.attributes.position.needsUpdate = true; if (!live) { crumbs = []; pts.visible = false; }
    },
  };
}
