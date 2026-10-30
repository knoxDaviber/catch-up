import * as THREE from 'three';
import { PAL } from './palette.js';
import { mat } from './world.js';
import { KINDS } from '../game/fishing.js';
import { fishTexture } from '../assets/fishart.js';
import { ART } from '../assets/manifest.js';
import { loadTex, PLANE } from './art.js';

/* The fish gallery: Liam and Xiao inside the cabin, looking at an aquarium on a table.
   Painted layer (only if cabin.png loads, never under ?noart): the room's shell and the 3D folk are hidden, leaving the deck, table and tank in front of a painted sky, ground, the cabin and a pair of sprites doing an activity that cross-fades every so often. No art keeps the room above.
   The tank rocks gently. Fish swim about; drag one to move it, click one to see its name and how many you have caught. */
const box = (p, x, y, z, w, h, d, c, o) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, o)); m.position.set(x, y, z); p.add(m); return m; };
/** A placeholder person in one of a few relaxed poses. Faces -z (toward the tank). */
function person(shirt, cap, pants, belly, pose) {
  const g = new THREE.Group(), sit = pose === 'sit';
  const hipY = sit ? .5 : .9;
  if (sit) {   // thighs forward, shins down
    box(g, -.12, hipY, -.2, .16, .16, .5, pants); box(g, .12, hipY, -.2, .16, .16, .5, pants);
    box(g, -.12, .25, -.42, .15, .5, .16, pants); box(g, .12, .25, -.42, .15, .5, .16, pants);
  } else if (pose === 'lean') {
    box(g, -.12, .45, 0, .16, .9, .18, pants); box(g, .15, .43, -.12, .16, .88, .18, pants);
  } else { box(g, -.12, .45, 0, .16, .9, .18, pants); box(g, .12, .45, 0, .16, .9, .18, pants); }
  const body = new THREE.Group(); body.position.set(0, hipY, 0); g.add(body);
  if (pose === 'lean') body.rotation.x = -.12;
  box(body, 0, .3, 0, .5 + belly, .62, .3 + belly * .6, shirt);
  const aw = .34 + belly * .4;
  if (pose === 'fold') { box(body, -aw, .3, -.1, .14, .16, .4, shirt); box(body, aw, .3, -.1, .14, .16, .4, shirt); box(body, 0, .3, -.28, .5, .13, .12, shirt); }
  else if (pose === 'mug' || pose === 'sit') { box(body, -aw, .28, 0, .14, .58, .16, shirt); box(body, aw, .38, -.2, .14, .14, .42, shirt); const mug = box(body, aw, .52, -.38, .1, .12, .1, 0xe8e2d2); mug.name = 'mug'; }
  else { box(body, -aw, .28, 0, .14, .58, .16, shirt); box(body, aw, .28, 0, .14, .58, .16, shirt); }
  const head = new THREE.Mesh(new THREE.SphereGeometry(.17, 10, 8), mat(PAL.skin)); head.position.set(0, .84, -.02); body.add(head);
  const hat = new THREE.Mesh(new THREE.SphereGeometry(.185, 10, 6, 0, Math.PI * 2, 0, Math.PI * .55), mat(cap)); hat.position.set(0, .86, -.02); body.add(hat);
  return g;
}

export function buildGallery() {
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 16 / 9, .05, 60);
  scene.background = new THREE.Color(0x1d1712); scene.fog = new THREE.Fog(0x1d1712, 9, 22);
  const hemi = new THREE.HemisphereLight(0xffe6c4, 0x4a3a2a, .9); scene.add(hemi);
  const lamp = new THREE.PointLight(0xffc27a, 9, 12, 1.5); lamp.position.set(0, 2.5, -1); scene.add(lamp);
  const tankLight = new THREE.PointLight(0x9fe0e8, 2.5, 4, 1.6); tankLight.position.set(0, 1.5, -1.6); scene.add(tankLight);

  // the room: planked wood
  const room = new THREE.Group(); scene.add(room);
  box(room, 0, -.05, -1, 9, .1, 8, 0x7a5a3e);
  box(room, 0, 1.6, -4, 9, 3.3, .1, 0xa27c58);
  box(room, -4.5, 1.6, -1, .1, 3.3, 8, 0x98724e); box(room, 4.5, 1.6, -1, .1, 3.3, 8, 0x98724e); box(room, 0, 3.3, -1, 9, .1, 8, 0x6b4a33);
  for (let i = 0; i < 7; i++) box(room, 0, .45 + i * .45, -3.93, 8.9, .02, .02, 0x6b4a33);
  const windowMat = new THREE.MeshBasicMaterial({ color: 0xbfd8e8 });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.2), windowMat); win.position.set(-4.43, 1.8, -1.5); win.rotation.y = Math.PI / 2; room.add(win);
  box(room, -4.4, 1.8, -1.5, .08, 1.3, .06, 0x4a3426); box(room, -4.4, 1.8, -1.5, .08, .06, 1.6, 0x4a3426);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.14, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffd58a })); bulb.position.copy(lamp.position); room.add(bulb);
  box(room, 0, 3.05, -1, .02, .5, .02, 0x3a2b22);
  // shelf with jars, a rug
  box(room, 3.1, 1.3, -3.7, 2, .06, .4, 0x6b4a33); [0, 1, 2].forEach(i => box(room, 2.5 + i * .55, 1.5, -3.7, .22, .34, .22, [0xe6b84f, 0x5f8fa8, 0xc4685a][i]));
  const shell = room.children.slice(1);
  box(room, 0, .01, .2, 4.4, .02, 3.2, 0xb7745a);

  // table and tank
  box(room, 0, .8, -1.8, 2.4, .1, 1.1, 0x6b4a33);
  [[-1.1, -1.3], [1.1, -1.3], [-1.1, -2.3], [1.1, -2.3]].forEach(([x, z]) => box(room, x, .4, z, .12, .8, .12, 0x5a3e2a));
  // an armchair, a stool and a side table: places to relax
  const arm = new THREE.Group(); arm.position.set(-2.55, 0, -.9); arm.rotation.y = .5; room.add(arm);
  box(arm, 0, .25, 0, .9, .5, .85, 0x8a4b3a); box(arm, 0, .75, .38, .9, .7, .14, 0x8a4b3a); box(arm, -.5, .45, 0, .14, .5, .85, 0x7a3f30); box(arm, .5, .45, 0, .14, .5, .85, 0x7a3f30); shell.push(arm);
  const stool = new THREE.Group(); stool.position.set(2.3, 0, -.9); room.add(stool);
  box(stool, 0, .5, 0, .5, .08, .5, 0x6b4a33); [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]].forEach(([x, z]) => box(stool, x, .25, z, .06, .5, .06, 0x5a3e2a));
  box(room, -3.3, .35, -2.5, .7, .7, .6, 0x6b4a33); box(room, -3.3, .78, -2.5, .12, .14, .12, 0xe8e2d2); shell.push(room.children[room.children.length - 1], room.children[room.children.length - 2]);
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

  // the friends, relaxing in one of a few ways each visit
  let folk = [];
  const SCEN = [
    { l: ['sit', -2.5, -.9, .5], x: ['fold', 1.55, -.3, .3] },
    { l: ['lean', -1.55, -.3, -.3], x: ['sit', 2.3, -.9, -.4] },
    { l: ['mug', -1.55, -.3, -.3], x: ['fold', 1.55, -.3, .3] },
    { l: ['sit', -2.5, -.9, .5], x: ['sit', 2.3, -.9, -.4] },
  ];
  function arrange(n) {
    folk.forEach(f => scene.remove(f)); folk = [];
    const s = SCEN[n % SCEN.length];
    [['l', 0xd9703f, 0xc2402c, 0x7b7a4a, .14], ['x', 0x86b8bb, 0x7d8db6, 0x7a78a6, 0]].forEach(([k, shirt, cap, pants, belly]) => {
      const [pose, x, z, ry] = s[k], p = person(shirt, cap, pants, belly, pose); p.position.set(x, 0, z); p.rotation.y = ry;
      if (pose === 'sit') p.position.y = 0; scene.add(p); folk.push(p);
    });
  }
  arrange(0);


  // painted layer: sky, ground, cabin, and activity pairs that cross-fade
  const P = { on: false, cur: 0, next: -1, f: 0, timer: 11 }, paint = new THREE.Group(); paint.visible = false; scene.add(paint);
  const tintMats = [], NIGHTC = new THREE.Color(0x5a6490), tc = new THREE.Color();
  const flatTex = (stops) => { const c = document.createElement('canvas'); c.width = 4; c.height = 128; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128); stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, 4, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const pmat = (t, op = 1) => { const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: op, alphaTest: .02, depthWrite: false, fog: false, side: THREE.DoubleSide }); tintMats.push(m); return m; };
  const sprite = (parent, t, x, z, h, mt) => { const w = h * t.image.width / t.image.height, m = new THREE.Mesh(PLANE, mt); m.scale.set(w, h, 1); m.position.set(x - w / 2, 0, z); parent.add(m); return m; };
  const skyMat = new THREE.MeshBasicMaterial({ map: flatTex([[0, '#8fb4cf'], [.7, '#cfe0e6'], [1, '#f1e6cf']]), fog: false }), skyM = new THREE.Mesh(new THREE.PlaneGeometry(200, 50), skyMat); skyM.position.set(0, 18, -40); paint.add(skyM);
  const gndMat = new THREE.MeshBasicMaterial({ map: flatTex([[0, '#9aa66a'], [1, '#8a9658']]), fog: false }), gnd = new THREE.Mesh(new THREE.PlaneGeometry(160, 70), gndMat); gnd.rotation.x = -Math.PI / 2; gnd.position.set(0, -.07, -10); paint.add(gnd);
  tintMats.push(skyMat, gndMat);
  loadTex(ART.plates.sky_day).then(t => { if (t) { skyMat.map = t; skyMat.needsUpdate = true; } });
  loadTex(ART.ground.grass).then(t => { if (!t) return; const g = t.clone(); g.wrapS = g.wrapT = THREE.RepeatWrapping; g.repeat.set(26, 14); g.needsUpdate = true; gndMat.map = g; gndMat.needsUpdate = true; });
  const slots = [], PEOPLE = ART.people;
  const ARR = [[['liam_side', -.85], ['xiao_side', .85]], [['liam_back', -.65], ['xiao_back', .65]], [['liam_front', -.75], ['xiao_back', .65]]];
  const setOp = (i, o) => { const s = slots[i]; if (!s) return; s.op = o; s.group.visible = o > .001; s.mats.forEach(m => { m.opacity = o; }); };
  (ART.gallery.activities || []).forEach((act, i) => {
    const s = { group: new THREE.Group(), mats: [], op: 0 }; s.group.visible = false; s.group.position.set(-2.6, 0, -5.4); paint.add(s.group); slots.push(s);
    loadTex(act && act.src).then(async at => {
      if (at) { s.mats.push(pmat(at, s.op)); sprite(s.group, at, 0, 0, 2.5, s.mats[0]); return; }
      for (const [k, x] of ARR[i % ARR.length]) { const t = await loadTex(PEOPLE[k]); if (!t) continue; const mt = pmat(t, s.op); s.mats.push(mt); sprite(s.group, t, x, 0, 2.1, mt); }
    });
  });
  loadTex(ART.gallery.backdrop).then(t => {
    if (!t) return;
    sprite(paint, t, 1.3, -7.5, 4.8, pmat(t)); P.on = true; paint.visible = true; shell.forEach(o => { o.visible = false; }); folk.forEach(f => { f.visible = false; }); scene.fog = null; slots.forEach((s, i) => setOp(i, i === P.cur ? 1 : 0));
  });

  // fish
  const fishGroup = new THREE.Group(); tank.add(fishGroup);
  let fish = [];
  const G = { scene, camera, tank, glass, room, view: 'room', selected: null, onSelect: null, fishMeshes: () => fish.map(f => f.mesh) };
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
  G.enter = (journal) => { arrange(Math.floor(Math.random() * SCEN.length)); G.setFish(journal); G.t0 = performance.now(); G.view = 'room'; G.vt = 0; room.visible = true; folk.forEach(f => { f.visible = !P.on; });
    P.cur = Math.floor(Math.random() * Math.max(1, slots.length)); P.next = -1; P.timer = 11; slots.forEach((s, i) => setOp(i, i === P.cur ? 1 : 0)); };
  G.setView = v => { G.view = v; G.vt0 = performance.now(); };
  /** hold a fish at a point in tank-local space (while dragging) */
  G.hold = (f, x, y) => { f.held = true; f.x = Math.max(-BX, Math.min(BX, x)); f.y = Math.max(BY0, Math.min(BY1, y)); f.tx = f.x; f.ty = f.y; };
  G.release = f => { f.held = false; f.retarget = 0; };
  G.bounds = { BX, BY0, BY1, BZ };

  G.update = (now, dt, night) => {
    const t = now / 1000, p = Math.min(1, (now - (G.t0 || now)) / 2800), e = p * p * (3 - 2 * p);
    // room view dollies in on entry; tank view is a close-up of just the aquarium
    G.vt = G.vt === undefined ? 0 : G.vt; const goal = G.view === 'tank' ? 1 : 0; G.vt += (goal - G.vt) * Math.min(1, dt * 3.2);
    const v = G.vt * G.vt * (3 - 2 * G.vt), sx = Math.sin(t * .2) * .08, ry = 6.2 - 3.4 * e;
    camera.position.set(sx * (1 - v), 1.5 + Math.sin(t * .3) * .02 * (1 - v) - .1 * v, ry + (-0.05 - ry) * v);
    camera.lookAt(0, 1.25 + .12 * v, -1.8);
    camera.fov = 50 + (44 - 50) * v; camera.updateProjectionMatrix();
    const closeUp = G.vt > .6; room.visible = !closeUp || true; folk.forEach(f => { f.visible = !P.on && G.vt < .85; });
    if (P.on) {
      if (slots.length > 1) { P.timer -= dt; if (P.timer <= 0) { P.timer = 11 + Math.random() * 4; P.next = (P.cur + 1 + Math.floor(Math.random() * (slots.length - 1))) % slots.length; P.f = 0; } }
      if (P.next >= 0) { P.f = Math.min(1, P.f + dt / 1.8); setOp(P.cur, 1 - P.f); setOp(P.next, P.f); if (P.f >= 1) { P.cur = P.next; P.next = -1; } }
      tc.set(0xffffff).lerp(NIGHTC, night * .65); tintMats.forEach(m => m.color.copy(tc));
    }
    // window and lamp follow the time of day
    windowMat.color.set(0xbfd8e8).lerp(new THREE.Color(0x0e1838), night); hemi.intensity = .9 - .35 * night; lamp.intensity = 7 + 5 * night + Math.sin(t * 7) * .15;
    if (!P.on) { scene.background.set(0x2a2018).lerp(new THREE.Color(0x120e0a), night); scene.fog.color.copy(scene.background); }
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
      const asp = (f.mesh.material.map.userData.aspect || .5) / .5, sel = f === G.selected ? 1.12 : 1;
      f.mesh.scale.x = f.dir * (faceLeftArt ? -1 : 1) * sel; f.mesh.scale.y = asp * sel;
      f.mesh.rotation.z = Math.atan2(f.ty - f.y, 1.2) * .5 * f.dir * (faceLeftArt ? -1 : 1) * (f.held ? 0 : 1) + (f.held ? Math.sin(t * 9) * .12 : 0);
    });
  };
  return G;
}
