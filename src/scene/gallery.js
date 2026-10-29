import * as THREE from 'three';
import { PAL } from './palette.js';
import { mat } from './world.js';
import { KINDS } from '../game/fishing.js';
import { fishTexture } from '../assets/fishart.js';

/* The fish gallery: Liam and Xiao inside the cabin, looking at an aquarium on a table.
   The tank rocks gently. Fish swim about; drag one to move it, click one to see its name and how many you have caught. */
const box = (p, x, y, z, w, h, d, c, o) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, o)); m.position.set(x, y, z); p.add(m); return m; };
function stander(shirt, cap, pants, x, belly) {
  const g = new THREE.Group(); g.position.set(x, 0, -.3); g.rotation.y = x < 0 ? -.3 : .3;
  box(g, -.12, .45, 0, .16, .9, .18, pants); box(g, .12, .45, 0, .16, .9, .18, pants);
  box(g, 0, 1.2, 0, .5 + belly, .62, .3 + belly * .6, shirt);
  box(g, -.34 - belly * .4, 1.18, 0, .14, .58, .16, shirt); box(g, .34 + belly * .4, 1.18, 0, .14, .58, .16, shirt);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.17, 10, 8), mat(PAL.skin)); head.position.set(0, 1.72, 0); g.add(head);
  const hat = new THREE.Mesh(new THREE.SphereGeometry(.185, 10, 6, 0, Math.PI * 2, 0, Math.PI * .55), mat(cap)); hat.position.set(0, 1.74, 0); g.add(hat);
  return g;
}

export function buildGallery() {
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 16 / 9, .05, 60);
  scene.background = new THREE.Color(0x1d1712); scene.fog = new THREE.Fog(0x1d1712, 9, 22);
  const hemi = new THREE.HemisphereLight(0xffe6c4, 0x4a3a2a, .9); scene.add(hemi);
  const lamp = new THREE.PointLight(0xffc27a, 9, 12, 1.5); lamp.position.set(0, 2.5, -1); scene.add(lamp);
  const tankLight = new THREE.PointLight(0x9fe0e8, 2.5, 4, 1.6); tankLight.position.set(0, 1.5, -1.6); scene.add(tankLight);

  // the room: planked wood
  box(scene, 0, -.05, -1, 9, .1, 8, 0x7a5a3e);
  box(scene, 0, 1.6, -4, 9, 3.3, .1, 0xa27c58);
  box(scene, -4.5, 1.6, -1, .1, 3.3, 8, 0x98724e); box(scene, 4.5, 1.6, -1, .1, 3.3, 8, 0x98724e); box(scene, 0, 3.3, -1, 9, .1, 8, 0x6b4a33);
  for (let i = 0; i < 7; i++) box(scene, 0, .45 + i * .45, -3.93, 8.9, .02, .02, 0x6b4a33);
  const windowMat = new THREE.MeshBasicMaterial({ color: 0xbfd8e8 });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.2), windowMat); win.position.set(-4.43, 1.8, -1.5); win.rotation.y = Math.PI / 2; scene.add(win);
  box(scene, -4.4, 1.8, -1.5, .08, 1.3, .06, 0x4a3426); box(scene, -4.4, 1.8, -1.5, .08, .06, 1.6, 0x4a3426);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.14, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffd58a })); bulb.position.copy(lamp.position); scene.add(bulb);
  box(scene, 0, 3.05, -1, .02, .5, .02, 0x3a2b22);
  // shelf with jars, a rug
  box(scene, 3.1, 1.3, -3.7, 2, .06, .4, 0x6b4a33); [0, 1, 2].forEach(i => box(scene, 2.5 + i * .55, 1.5, -3.7, .22, .34, .22, [0xe6b84f, 0x5f8fa8, 0xc4685a][i]));
  box(scene, 0, .01, .2, 4.4, .02, 3.2, 0xb7745a);

  // table and tank
  box(scene, 0, .8, -1.8, 2.4, .1, 1.1, 0x6b4a33);
  [[-1.1, -1.3], [1.1, -1.3], [-1.1, -2.3], [1.1, -2.3]].forEach(([x, z]) => box(scene, x, .4, z, .12, .8, .12, 0x5a3e2a));
  const tank = new THREE.Group(); tank.position.set(0, .87, -1.8); scene.add(tank);
  const TW = 1.8, TH = 1.0, TD = .8;
  const glass = new THREE.Mesh(new THREE.BoxGeometry(TW, TH, TD), new THREE.MeshLambertMaterial({ color: 0xcdeef2, transparent: true, opacity: .1, side: THREE.DoubleSide, depthWrite: false })); glass.position.y = TH / 2; glass.renderOrder = 5; tank.add(glass);
  box(tank, 0, .04, 0, TW - .04, .08, TD - .04, 0xcfb892);                                   // gravel
  const waterG = new THREE.Group(); tank.add(waterG);
  const waterBody = new THREE.Mesh(new THREE.BoxGeometry(TW - .04, TH * .8, TD - .04), new THREE.MeshLambertMaterial({ color: 0x78c0d0, transparent: true, opacity: .28, depthWrite: false })); waterBody.position.y = .08 + TH * .4; waterBody.renderOrder = 4; waterG.add(waterBody);
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(TW - .04, TD - .04), new THREE.MeshBasicMaterial({ color: 0xcdf2f4, transparent: true, opacity: .35, depthWrite: false })); surf.rotation.x = -Math.PI / 2; surf.position.y = .08 + TH * .8; waterG.add(surf);
  box(tank, 0, TH + .03, 0, TW + .06, .06, TD + .06, 0x4a3a2a); box(tank, 0, .01, 0, TW + .06, .04, TD + .06, 0x4a3a2a);
  const plants = [[-.6, 0x6fae7c, .5], [-.45, 0x86bd8a, .35], [.55, 0x6fae7c, .55], [.7, 0x93c795, .3]].map(([x, c, h]) => { const m = new THREE.Mesh(new THREE.ConeGeometry(.07, h, 5), mat(c)); m.position.set(x, .08 + h / 2, -.15); m.userData.h = h; tank.add(m); return m; });
  box(tank, .1, .15, -.2, .3, .16, .24, 0x8a8478);
  const BN = 18, bpos = new Float32Array(BN * 3), bseed = Array.from({ length: BN }, () => Math.random());
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(bpos, 3));
  const bubbles = new THREE.Points(bg, new THREE.PointsMaterial({ color: 0xeafcff, size: 3, sizeAttenuation: false, transparent: true, opacity: .6, depthWrite: false })); bubbles.frustumCulled = false; tank.add(bubbles);

  // the friends, seen from behind, in front of the table
  const liam = stander(0xd9703f, 0xc2402c, 0x7b7a4a, -1.55, .14), xiao = stander(0x86b8bb, 0x7d8db6, 0x7a78a6, 1.55, 0);
  scene.add(liam, xiao);

  // fish
  const fishGroup = new THREE.Group(); tank.add(fishGroup);
  let fish = [];
  const G = { scene, camera, tank, selected: null, onSelect: null, fishMeshes: () => fish.map(f => f.mesh) };
  const BX = TW / 2 - .22, BY0 = .22, BY1 = TH * .8 - .05, BZ = TD / 2 - .12;
  G.setFish = journal => {
    fishGroup.clear(); fish = [];
    journal.forEach(e => {
      const kind = KINDS.find(k => k.id === e.id); if (!kind) return;
      const names = e.nicks.map(n => n); const unnamed = Math.min(Math.max(0, e.n - e.nicks.length), 3);
      for (let i = 0; i < unnamed; i++) names.push('');
      names.forEach(nick => {
        const tex = fishTexture(kind), w = .24 + kind.len * .55;
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * .5), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: .02, side: THREE.DoubleSide, depthWrite: false }));
        m.renderOrder = 6; fishGroup.add(m);
        const f = { mesh: m, kind, nick, count: e.n, w, x: (Math.random() * 2 - 1) * BX, y: BY0 + Math.random() * (BY1 - BY0), z: (Math.random() * 2 - 1) * BZ, tx: 0, ty: 0, tz: 0, sp: .06 + Math.random() * .08, dir: 1, ph: Math.random() * 6, held: false, retarget: 0 };
        m.userData.fish = f; fish.push(f);
      });
    });
    return fish.length;
  };
  G.fishCount = () => fish.length;
  G.enter = (journal) => { G.setFish(journal); G.t0 = performance.now(); G.dolly = 0; };
  /** hold a fish at a point in tank-local space (while dragging) */
  G.hold = (f, x, y) => { f.held = true; f.x = Math.max(-BX, Math.min(BX, x)); f.y = Math.max(BY0, Math.min(BY1, y)); f.tx = f.x; f.ty = f.y; };
  G.release = f => { f.held = false; f.retarget = 0; };
  G.bounds = { BX, BY0, BY1, BZ };

  G.update = (now, dt, night) => {
    const t = now / 1000, p = Math.min(1, (now - (G.t0 || now)) / 2800), e = p * p * (3 - 2 * p);
    camera.position.set(Math.sin(t * .2) * .08, 1.5 + Math.sin(t * .3) * .02, 6.2 - 3.4 * e); camera.lookAt(0, 1.25, -1.8);
    // window and lamp follow the time of day
    windowMat.color.set(0xbfd8e8).lerp(new THREE.Color(0x0e1838), night); hemi.intensity = .9 - .35 * night; lamp.intensity = 7 + 5 * night + Math.sin(t * 7) * .15;
    scene.background.set(0x2a2018).lerp(new THREE.Color(0x120e0a), night); scene.fog.color.copy(scene.background);
    // the gentle rock: the tank leans, the water sloshes a little behind it
    tank.rotation.z = Math.sin(t * .6) * .02; tank.position.x = Math.sin(t * .6) * .01; waterG.rotation.z = Math.sin(t * .6 - 1.1) * .035;
    plants.forEach((m, i) => { m.rotation.z = Math.sin(t * 1.3 + i) * .12; });
    for (let i = 0; i < BN; i++) { const s = (bseed[i] + t * .12 * (.6 + bseed[(i + 3) % BN])) % 1; bpos[i * 3] = .1 + Math.sin(s * 12 + i) * .04; bpos[i * 3 + 1] = .2 + s * (TH * .8 - .1); bpos[i * 3 + 2] = -.2; }
    bg.attributes.position.needsUpdate = true;
    fish.forEach(f => {
      if (!f.held) {
        if (now > f.retarget) { f.tx = (Math.random() * 2 - 1) * BX; f.ty = BY0 + Math.random() * (BY1 - BY0); f.tz = (Math.random() * 2 - 1) * BZ; f.retarget = now + 3500 + Math.random() * 4500; }
        const dx = f.tx - f.x, dy = f.ty - f.y, dz = f.tz - f.z, d = Math.hypot(dx, dy, dz) || 1, v = Math.min(f.sp, d);
        f.x += dx / d * v * dt * 3; f.y += dy / d * v * dt * 2; f.z += dz / d * v * dt * 2;
        if (Math.abs(dx) > .03) f.dir += ((dx > 0 ? 1 : -1) - f.dir) * Math.min(1, dt * 5);
      }
      const faceLeftArt = f.mesh.material.map.userData.faceLeft;
      f.mesh.position.set(f.x, f.y + Math.sin(t * 1.4 + f.ph) * .01, f.z);
      f.mesh.scale.x = f.dir * (faceLeftArt ? -1 : 1) * (f === G.selected ? 1.12 : 1); f.mesh.scale.y = f === G.selected ? 1.12 : 1;
      f.mesh.rotation.z = Math.atan2(f.ty - f.y, 1.2) * .5 * f.dir * (faceLeftArt ? -1 : 1) * (f.held ? 0 : 1) + (f.held ? Math.sin(t * 9) * .12 : 0);
    });
  };
  return G;
}
