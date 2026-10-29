import * as THREE from 'three';
import { PAL } from './palette.js';

export const SEAT_X = 1.4;
export const HEAD_Y = 1.28;
export const BOARD_Y = 0.58;

const mats = new Map();
export function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!mats.has(key)) mats.set(key, new THREE.MeshLambertMaterial({ color, flatShading: true, ...opts }));
  return mats.get(key);
}
function box(parent, x, y, z, w, h, d, color, opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  m.position.set(x, y, z); parent.add(m); return m;
}
function limb(parent, a, b, r, color) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = A.distanceTo(B);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 6), mat(color));
  m.position.copy(A).add(B).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  parent.add(m); return m;
}
function cone(parent, x, y, z, r, h, seg, color, opts) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat(color, opts));
  m.position.set(x, y + h / 2, z); parent.add(m); return m;
}

/** A seated person facing the lake (-z). side = -1 for Liam (left), +1 for Xiao (right). */
function buildPerson(shirt, cap, chairColor, x, pants) {
  const g = new THREE.Group(); g.position.set(x, 0, .06);
  const dir = -Math.sign(x);          // toward the stump
  // chair
  box(g, 0, .42, .12, .62, .06, .6, chairColor);
  box(g, 0, .78, .42, .62, .66, .06, chairColor);
  [[-.28, -.14], [.28, -.14], [-.28, .38], [.28, .38]].forEach(p => limb(g, [p[0], 0, p[1]], [p[0], .42, p[1]], .025, 0x4a4540));
  // legs, torso, arms
  limb(g, [-.14, .5, .1], [-.14, .5, -.38], .08, pants); limb(g, [.14, .5, .1], [.14, .5, -.38], .08, pants);
  limb(g, [-.14, .5, -.38], [-.14, .1, -.42], .07, pants); limb(g, [.14, .5, -.38], [.14, .1, -.42], .07, pants);
  box(g, -.14, .06, -.46, .14, .1, .22, PAL.boot); box(g, .14, .06, -.46, .14, .1, .22, PAL.boot);
  box(g, 0, .88, .22, .5, .62, .3, shirt);
  limb(g, [-.28, 1.05, .2], [-.22, .75, -.2], .07, shirt); limb(g, [.28, 1.05, .2], [.22, .75, -.2], .07, shirt);
  const head = new THREE.Group(); head.position.set(0, HEAD_Y, .2); g.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(.17, 10, 8), mat(PAL.skin)); head.add(skull);
  const hat = new THREE.Mesh(new THREE.SphereGeometry(.185, 10, 6, 0, Math.PI * 2, 0, Math.PI * .55), mat(cap)); hat.position.y = .02; head.add(hat);
  // fishing rod, held out over the lake
  limb(g, [.12, .85, -.3], [.1, 2.2, -2.3], .02, 0x3a2b22);
  return { group: g, head };
}

function boardTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) { x.fillStyle = (f + r) % 2 ? '#e6ce9e' : '#8b5e3c'; x.fillRect(f * 32, r * 32, 32, 32); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function buildWorld(scene) {
  const W = { people: {}, animated: [] };
  scene.fog = new THREE.Fog(PAL.fog, 60, 300);
  const hemi = new THREE.HemisphereLight(0xfff4e0, 0x9bb0a0, 1.35); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d6, 1.3); sun.position.set(-8, 14, 10); scene.add(sun);
  W.hemi = hemi; W.sun = sun;

  // ground: grass, a sand strip along the shore, a path from the camera to the stump, the lake beyond
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 120), mat(PAL.grass)); ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, 10); scene.add(ground);
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(220, 3.2), mat(PAL.sand)); sand.rotation.x = -Math.PI / 2; sand.position.set(0, .01, -4.2); scene.add(sand);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 20), mat(PAL.path)); path.rotation.x = -Math.PI / 2; path.position.set(0, .012, 7.2); scene.add(path);
  const lake = new THREE.Mesh(new THREE.PlaneGeometry(260, 140), new THREE.MeshLambertMaterial({ color: PAL.lake })); lake.rotation.x = -Math.PI / 2; lake.position.set(0, .005, -76); scene.add(lake);
  W.lake = lake;

  // mountains and the far tree line
  [[-40, -120, 38, 60, PAL.mountain], [8, -130, 52, 80, PAL.mountainFar], [58, -118, 34, 55, PAL.mountain], [-80, -125, 30, 50, PAL.mountainFar]].forEach(m => cone(scene, m[0], 0, m[1], m[3], m[2], 4, m[4], { fog: true }).rotation.y = .6);
  for (let i = 0; i < 46; i++) {
    const x = -105 + i * 4.6 + Math.sin(i * 7.3) * 1.6, z = -106 + Math.cos(i * 3.1) * 2.5, h = 11 + (i * 37 % 7) * 1.1;
    cone(scene, x, 0, z, 3.4, h, 6, i % 3 ? PAL.pine : PAL.pineLight);
  }
  // pines around the camp
  [[-16, -2], [-13, 6], [15, 2], [18, -3], [-20, 10], [20, 9], [-6, -10]].forEach((p, i) => { const h = 4.6 + (i % 3);
    box(scene, p[0], .5, p[1], .35, 1, .35, PAL.stump); cone(scene, p[0], 1, p[1], 1.6, h, 6, i % 2 ? PAL.pine : PAL.pineLight); });

  // stump, board, chairs, people
  const stump = new THREE.Mesh(new THREE.CylinderGeometry(.62, .7, BOARD_Y - .02, 9), mat(PAL.stump)); stump.position.set(0, (BOARD_Y - .02) / 2, 0); scene.add(stump);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(1.2, .04, 1.2), mat(0x6b4a33)); slab.position.set(0, BOARD_Y - .02, 0); scene.add(slab);
  const liam = buildPerson(PAL.liamShirt, PAL.liamCap, PAL.liamChair, -SEAT_X, PAL.liamPants), xiao = buildPerson(PAL.xiaoShirt, PAL.xiaoCap, PAL.xiaoChair, SEAT_X, PAL.xiaoPants);
  scene.add(liam.group, xiao.group); W.people = { liam, xiao };

  // cooler beside Liam, camp props
  box(scene, -3.25, .22, 1.7, .8, .44, .45, PAL.cooler); box(scene, -3.25, .47, 1.7, .84, .06, .49, PAL.coolerLid);
  const tent = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.7, 4), mat(PAL.tent)); tent.position.set(6.5, .85, -.5); tent.rotation.y = Math.PI / 4; tent.scale.set(1, 1, .9); scene.add(tent);
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; box(scene, Math.cos(a) * .55, .08, 4.2 + Math.sin(a) * .55, .22, .16, .2, PAL.stone); }
  limb(scene, [-.3, .12, 4], [.3, .18, 4.4], .06, 0x5b4130); limb(scene, [.3, .12, 4], [-.3, .18, 4.4], .06, 0x4f3828);

  // cabin with a lantern, left
  const cabin = new THREE.Group(); cabin.position.set(-8.5, 0, -1); scene.add(cabin);
  box(cabin, 0, 1.35, 0, 5.2, 2.7, 4, PAL.wood);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.6, 4), mat(PAL.roof)); roof.position.set(0, 3.5, 0); roof.rotation.y = Math.PI / 4; roof.scale.set(1.18, 1, .86); cabin.add(roof);
  box(cabin, -1.1, 3.8, -.8, .5, 1.2, .5, 0x7b6a5e);
  box(cabin, .8, 1.5, 2.03, 1, .9, .06, 0xf2c879, { emissive: 0xf2c879, emissiveIntensity: .6 }); box(cabin, -1.2, 1.5, 2.03, .8, .9, .06, 0xf2c879, { emissive: 0xf2c879, emissiveIntensity: .6 });
  box(cabin, -2.2, 1.0, 2.03, .9, 1.9, .06, 0x4a3426);
  box(cabin, 3.3, .8, 3.0, .08, 1.6, .08, 0x4a3426);
  const lantern = box(cabin, 3.3, 1.75, 3.0, .3, .38, .3, 0xffd58a, { emissive: 0xffd58a, emissiveIntensity: .9 }); W.lantern = lantern;

  // rusty truck, bottom right corner
  const truck = new THREE.Group(); truck.position.set(6.6, 0, 7); scene.add(truck);
  box(truck, 0, .85, 0, 4.4, .8, 1.9, PAL.truckDark); box(truck, -1.1, 1.5, 0, 1.5, .8, 1.8, PAL.truck); box(truck, 1, 1.35, 0, 2.1, .5, 1.8, PAL.truckDark);
  box(truck, -1.1, 1.55, .91, 1, .5, .04, 0x9db6be);
  [[-1.4, 1], [1.4, 1], [-1.4, -1], [1.4, -1]].forEach(w => box(truck, w[0], .4, w[1] * .95, .8, .8, .24, 0x2e2a27));
  box(truck, -2.22, .85, .6, .06, .22, .3, 0xf2dca0, { emissive: 0xf2dca0, emissiveIntensity: .7 }); box(truck, -2.22, .85, -.6, .06, .22, .3, 0xf2dca0, { emissive: 0xf2dca0, emissiveIntensity: .7 });

  // fence with a gap at the path
  for (let x = -15; x <= 15; x += 2.5) { if (Math.abs(x) < 1.8) continue; box(scene, x, .6, 12, .12, 1.2, .12, 0x7b5c40); if (x + 2.5 <= 15 && Math.abs(x + 2.5) >= 1.8) { box(scene, x + 1.25, .95, 12, 2.5, .08, .06, 0x8d6b4b); box(scene, x + 1.25, .55, 12, 2.5, .08, .06, 0x8d6b4b); } }

  W.update = t => { W.animated.forEach(f => f(t)); };
  return W;
}
