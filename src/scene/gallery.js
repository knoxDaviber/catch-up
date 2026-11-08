import * as THREE from 'three';
import { mat } from './world.js';
import { KINDS } from '../game/fishing.js';
import { fishTexture } from '../assets/fishart.js';
import { ART } from '../assets/manifest.js';
import { loadTex, PLANE } from './art.js';

/* The fish gallery: Liam and Xiao inside the cabin, with an aquarium on a table. Everything is there from the first frame (the camera rests, nothing floats in).
   Painted layer (never under ?noart for loaded files): the tank, its glass front and the table are flat painted planes; each has a manifest key (gallery.tank, tank_front, table) and a soft procedural
   canvas placeholder while it is null. The ornaments (gallery.decor) are small painted cut-outs the player drags along the tank floor; the ones not in the tank wait on the table
   (click to add, click one in the tank to put it back). Positions persist in catchup.tank.v1. The friends each do their own thing in a fixed zone beside or behind the table (never in front of the tank): ACT, one
   sprite per activity per friend (gallery.activities[].liam / .xiao), falling back to the standing sprite with a very slight sway. Each friend changes activity every 40-90 s with a soft cross-fade.
   If the interior plate loads, it fills the view behind and the 3D room's shell and floor are hidden. The tank rocks gently. Fish swim about; drag one to move it, click one to see its name. */
const box = (p, x, y, z, w, h, d, c, o) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, o)); m.position.set(x, y, z); p.add(m); return m; };
const TW = 1.8, TH = 1.0, TD = .8, K = 400, TABLE_W = 3.4, TABLE_H = 1.0, SURF = TH * .96, S = .8, STORE = 'catchup.tank.v1';
const BC = new THREE.PlaneGeometry(1, 1).translate(0, .5, 0);

/* painted placeholders: a canvas drawn with soft washes, a little blur and paper grain */
const cv = (w, h, fn, blur = 1.1) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); fn(x, w, h);
  if (blur) { const b = document.createElement('canvas'); b.width = w; b.height = h; b.getContext('2d').drawImage(c, 0, 0); x.clearRect(0, 0, w, h); x.filter = `blur(${blur}px)`; x.drawImage(b, 0, 0); x.filter = 'none'; }
  x.globalCompositeOperation = 'source-atop';
  for (let i = 0, n = w * h / 45; i < n; i++) { x.fillStyle = Math.random() < .5 ? 'rgba(255,248,230,.07)' : 'rgba(70,50,35,.05)'; x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
const rr = (x, a, b, w, h, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); };
const wash = (x, col, a = .85, edge = .3) => { x.save(); x.globalAlpha = a; x.fillStyle = col; x.fill(); x.globalAlpha = edge; x.strokeStyle = 'rgb(70,48,36)'; x.lineWidth = 2.5; x.stroke(); x.restore(); };
const blob = (x, cx, cy, rx, ry, col, a, e) => { x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 6.2832); wash(x, col, a, e); };

const paintTankBack = x => {
  const L = .05 * K, T = L, bw = TW * K, bh = TH * K, Y = y => T + (TH - y) * K;
  x.save(); rr(x, L, T, bw, bh, .07 * K); x.clip();
  x.fillStyle = 'rgba(225,242,242,.16)'; x.fillRect(L, T, bw, bh);
  const g = x.createLinearGradient(0, Y(SURF), 0, Y(0)); g.addColorStop(0, 'rgba(160,220,226,.5)'); g.addColorStop(1, 'rgba(86,160,182,.75)'); x.fillStyle = g; x.fillRect(L, Y(SURF), bw, T + bh - Y(SURF));
  x.fillStyle = 'rgba(255,255,255,.07)';
  for (let i = 0; i < 4; i++) { const a = L + bw * (.12 + i * .24); x.beginPath(); x.moveTo(a, Y(SURF)); x.lineTo(a + .1 * K, Y(SURF)); x.lineTo(a - .12 * K, Y(0)); x.lineTo(a - .3 * K, Y(0)); x.closePath(); x.fill(); }
  x.globalAlpha = .85;
  for (let i = 0; i < 160; i++) { x.fillStyle = ['#d9c49c', '#bfa87e', '#e6d6b4', '#a8946e'][i % 4]; x.beginPath(); x.ellipse(L + Math.random() * bw, Y(0) - Math.random() * .1 * K, (.012 + Math.random() * .02) * K, (.008 + Math.random() * .012) * K, 0, 0, 6.2832); x.fill(); }
  x.restore();
};
const paintTankFront = x => {
  const L = .05 * K, T = L, bw = TW * K, bh = TH * K, Y = y => T + (TH - y) * K;
  x.strokeStyle = 'rgba(235,252,252,.6)'; x.lineWidth = 3; x.beginPath();
  for (let i = 0; i <= 24; i++) { const px = L + bw * i / 24, py = Y(SURF) + Math.sin(i * 1.3) * 2; i ? x.lineTo(px, py) : x.moveTo(px, py); }
  x.stroke();
  x.fillStyle = 'rgba(255,255,255,.16)'; [[.08, .5], [.14, .25]].forEach(([u, hh]) => { rr(x, L + bw * u, T + .06 * K, .035 * K, hh * bh, .02 * K); x.fill(); });
  rr(x, L, T, bw, bh, .07 * K); x.lineWidth = .028 * K; x.strokeStyle = 'rgba(131,98,66,.92)'; x.stroke(); x.lineWidth = 2; x.strokeStyle = 'rgba(60,40,28,.35)'; x.stroke();
  x.fillStyle = 'rgba(150,114,78,.95)'; rr(x, L - .02 * K, T - .035 * K, bw + .04 * K, .06 * K, .03 * K); x.fill();
};
const paintTable = (x, w) => {
  const X = m => w / 2 + m * K, Y = y => (TABLE_H - y) * K;
  x.fillStyle = 'rgba(40,26,16,.22)'; x.beginPath(); x.ellipse(w / 2, Y(.03), 1.6 * K, .05 * K, 0, 0, 6.2832); x.fill();
  [-1, 1].forEach(s => { rr(x, X(s * 1.42) - .045 * K, Y(.72), .09 * K, .66 * K, .03 * K); wash(x, '#9a7650', .7, .2); });
  [-1, 1].forEach(s => { rr(x, X(s * 1.55) - .075 * K, Y(.74), .15 * K, .72 * K, .04 * K); wash(x, '#7d5a3b', .92, .35); });
  rr(x, X(-1.7), Y(.83), 3.4 * K, .09 * K, .02 * K); wash(x, '#b58a5b', .95, .35);
  rr(x, X(-1.62), Y(.93), 3.24 * K, .1 * K, .03 * K); wash(x, '#d6ae7e', .95, .3);
  x.strokeStyle = 'rgba(110,75,45,.22)'; x.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) { const a = X(-1.6 + Math.random() * 3.2), b = Y(.74 + Math.random() * .18); x.beginPath(); x.moveTo(a, b); x.bezierCurveTo(a + 30, b - 2, a + 60, b + 2, a + 90 + Math.random() * 60, b); x.stroke(); }
};
/* the ornaments: w, h in metres (the art must keep this aspect), z the depth in the tank, x the default place (null: on the table) */
const DEC = [
  { id: 'rock', w: .34, h: .24, z: -.1, x: .35, paint(x, w, h) { blob(x, w * .45, h * .62, w * .38, h * .34, '#8d9a8d'); blob(x, w * .7, h * .7, w * .25, h * .24, '#a3a99a'); blob(x, w * .42, h * .38, w * .14, h * .1, '#7fa57a', .7, .15); } },
  { id: 'plant', w: .36, h: .56, z: -.2, x: -.55, paint(x, w, h) { for (let i = 0; i < 6; i++) { const bx = w * (.3 + .08 * i), tx = w * (.15 + .14 * i), ty = h * (.08 + .14 * (i % 3)), dx = (tx - bx) * .2; x.beginPath(); x.moveTo(bx - 7, h); x.quadraticCurveTo(bx - 22 + dx, h * .5, tx, ty); x.quadraticCurveTo(bx + 22 + dx, h * .5, bx + 7, h); x.closePath(); wash(x, ['#6fae7c', '#86bd8a', '#5d9b6c'][i % 3], .85, .25); } } },
  { id: 'castle', w: .42, h: .42, z: -.15, x: null, paint(x, w, h) {
    rr(x, w * .3, h * .38, w * .4, h * .6, 6); wash(x, '#e8c9b6'); [.1, .7].forEach(u => { rr(x, w * u, h * .22, w * .2, h * .76, 6); wash(x, '#dcb9a4'); });
    [.1, .16, .22, .7, .76, .82, .34, .46, .58].forEach((u, i) => { const top = i < 6 ? .15 : .31; rr(x, w * u, h * top, w * .05, h * .08, 3); wash(x, '#dcb9a4', .9, .2); });
    x.beginPath(); x.moveTo(w * .42, h * .98); x.lineTo(w * .42, h * .7); x.arc(w * .5, h * .7, w * .08, Math.PI, 0); x.lineTo(w * .58, h * .98); x.closePath(); wash(x, '#4f7f86', .9, .3); } },
  { id: 'driftwood', w: .55, h: .3, z: 0, x: null, paint(x, w, h) { x.lineCap = 'round'; x.strokeStyle = '#8a6a4b'; x.lineWidth = 26; x.beginPath(); x.moveTo(w * .08, h * .85); x.bezierCurveTo(w * .3, h * .15, w * .6, h * .95, w * .9, h * .55); x.stroke();
    x.strokeStyle = 'rgba(169,136,98,.7)'; x.lineWidth = 12; x.stroke(); x.strokeStyle = '#8a6a4b'; x.lineWidth = 10; x.beginPath(); x.moveTo(w * .5, h * .55); x.lineTo(w * .6, h * .1); x.stroke(); } },
  { id: 'shell', w: .2, h: .18, z: .1, x: null, paint(x, w, h) { x.beginPath(); x.moveTo(w * .5, h * .95); x.arc(w * .5, h * .95, w * .45, Math.PI * 1.1, Math.PI * 1.9); x.closePath(); wash(x, '#eab5a8'); x.strokeStyle = 'rgba(150,80,70,.4)'; x.lineWidth = 2;
    for (let i = 0; i < 7; i++) { const a = Math.PI * (1.15 + i * .1); x.beginPath(); x.moveTo(w * .5, h * .95); x.lineTo(w * .5 + Math.cos(a) * w * .43, h * .95 + Math.sin(a) * w * .43); x.stroke(); } } },
];
const TRAY_X = [-1.08, -1.34, 1.08, 1.34, 1.6];

/* Activities: a fixed zone (x, z in the room) beside or behind the table, never in front of the tank. face: which standing sprite to fall back on. base/amp: a resting lean and a slow sway in radians.
   Zones match the interior spec in public/assets/README.md (window, wall, stove, counter; phone and reading stand on the floor at the sides). */
const ACT = [
  { id: 'phone', x: -2.9, z: -1.9, face: 'front', amp: .006 },
  { id: 'wall', x: -3.1, z: -3.5, face: 'front', base: .06, amp: .004 },
  { id: 'window', x: -1.7, z: -3.4, face: 'back', amp: .008 },
  { id: 'stove', x: 1.7, z: -3.4, face: 'back', amp: .004 },
  { id: 'tea', x: 3.2, z: -3.4, face: 'back', amp: .008 },
  { id: 'read', x: 2.9, z: -1.9, face: 'front', amp: .004 },
];

export function buildGallery() {
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 16 / 9, .05, 60);
  scene.background = new THREE.Color(0x1d1712); scene.fog = new THREE.Fog(0x1d1712, 9, 22);
  const hemi = new THREE.HemisphereLight(0xffe6c4, 0x4a3a2a, .9); scene.add(hemi);
  const lamp = new THREE.PointLight(0xffc27a, 9, 12, 1.5); lamp.position.set(0, 2.5, -1); scene.add(lamp);

  /* the room (only seen when the interior plate is missing): planked wood */
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
  box(room, 3.1, 1.3, -3.7, 2, .06, .4, 0x6b4a33); [0, 1, 2].forEach(i => box(room, 2.5 + i * .55, 1.5, -3.7, .22, .34, .22, [0xe6b84f, 0x5f8fa8, 0xc4685a][i]));
  const shell = room.children.slice(1);
  const rug = box(room, 0, .01, .2, 4.4, .02, 3.2, 0xb7745a);

  /* painted layer (the tank's back and front planes sit only .1 m apart, so perspective keeps the water flush with the rim): flat planes in the watercolour style. Draw order: plate -1, people 0, table 1, tray 2, tank back 3, bubbles and ornaments 5, fish 6, glass front 8. */
  const paint = new THREE.Group(); scene.add(paint);
  const tintMats = [], NIGHTC = new THREE.Color(0x5a6490), tc = new THREE.Color(), floorBits = [room.children[0], rug];
  const pmat = (t, op = 1) => { const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: op, alphaTest: .02, depthWrite: false, fog: false, side: THREE.DoubleSide }); tintMats.push(m); return m; };
  const swap = (m, key) => loadTex(key).then(t => { if (t) { m.map = t; m.needsUpdate = true; } });

  const table = new THREE.Mesh(PLANE, pmat(cv(TABLE_W * K, TABLE_H * K, paintTable))); table.scale.set(TABLE_W * S, TABLE_H * S, 1); table.position.set(-TABLE_W * S / 2, 0, -1.8); table.renderOrder = 1; scene.add(table); swap(table.material, ART.gallery.table);

  const tank = new THREE.Group(); tank.position.set(0, .88 * S, -1.8); tank.scale.setScalar(S); scene.add(tank);
  const PW = TW + .1, PH_ = TH + .1;
  const addPane = (paintFn, key, z, ro) => { const m = new THREE.Mesh(PLANE, pmat(cv(Math.round(PW * K), Math.round(PH_ * K), paintFn))); m.scale.set(PW, PH_, 1); m.position.set(-PW / 2, -.05, z); m.renderOrder = ro; tank.add(m); swap(m.material, key); return m; };
  addPane(paintTankBack, ART.gallery.tank, -.05, 3); addPane(paintTankFront, ART.gallery.tank_front, .05, 8);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(TW, TH), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false, side: THREE.DoubleSide })); glass.position.set(0, TH / 2, TD / 2); tank.add(glass);
  const BN = 18, bpos = new Float32Array(BN * 3), bseed = Array.from({ length: BN }, () => Math.random());
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(bpos, 3));
  const bubbles = new THREE.Points(bg, new THREE.PointsMaterial({ color: 0xeafcff, size: 3, sizeAttenuation: false, transparent: true, opacity: .6, depthWrite: false })); bubbles.frustumCulled = false; bubbles.renderOrder = 5; tank.add(bubbles);

  /* ornaments: x is the position in the tank (metres from the centre), null while on the table */
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(STORE)); if (!saved || typeof saved !== 'object') saved = {}; } catch (e) { saved = {}; }
  const decor = DEC.map((d, i) => {
    const o = { ...d, i, tx: TRAY_X[i], x: d.id in saved ? saved[d.id] : d.x };
    o.mesh = new THREE.Mesh(BC, pmat(cv(256, Math.round(256 * d.h / d.w), d.paint))); o.mesh.userData.decor = o; o.mesh.renderOrder = 5; swap(o.mesh.material, ART.gallery.decor && ART.gallery.decor[d.id]); return o;
  });
  const lim = d => Math.max(.2, TW / 2 - .12 - d.w / 2);
  const place = d => {
    if (typeof d.x === 'number') { d.x = Math.max(-lim(d), Math.min(lim(d), d.x)); tank.add(d.mesh); d.mesh.position.set(d.x, .06, d.z); d.mesh.scale.set(d.w, d.h, 1); d.mesh.renderOrder = 5; }
    else { d.x = null; scene.add(d.mesh); d.mesh.position.set(d.tx * S, .91 * S, -1.74); d.mesh.scale.set(d.w * .5 * S, d.h * .5 * S, 1); d.mesh.renderOrder = 2; d.mesh.rotation.z = 0; }
  };
  decor.forEach(place);
  const savedOut = () => { try { localStorage.setItem(STORE, JSON.stringify(Object.fromEntries(decor.map(d => [d.id, d.x])))); } catch (e) { return; } };

  /* the friends: one slot per activity per friend, cross-faded */
  const WHO = ['liam', 'xiao'], PEOPLE = ART.people, list = (ART.gallery.activities || []).map(a => ({ ...a, def: ACT.find(d => d.id === a.id) })).filter(a => a.def);
  const slots = [[], []], F = [0, 1].map(() => ({ cur: -1, next: -1, f: 0, timer: 40 }));
  const shC = document.createElement('canvas'); shC.width = shC.height = 64; { const x = shC.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.6, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }
  const shTex = new THREE.CanvasTexture(shC), shGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const shadow = (s, w) => { const m = new THREE.Mesh(shGeo, new THREE.MeshBasicMaterial({ map: shTex, color: 0x000000, transparent: true, opacity: s.op * .4, depthWrite: false, fog: false })); m.position.set(0, .004, 0); m.scale.set(w * .85, 1, .45); m.renderOrder = -1; s.group.add(m); s.sh.push(m.material); };
  const setOp = (s, o) => { s.op = o; s.group.visible = o > .001; s.mats.forEach(m => { m.opacity = o; }); s.sh.forEach(m => { m.opacity = o * .4; }); };
  async function fillSlot(s, a, who) {
    const d = a.def; let t = await loadTex(a[who]), h = 1.75;
    if (!t) { t = await loadTex(PEOPLE[`${who}_stand_${d.face}`]); h = 1.75; }
    if (!t) { t = await loadTex(PEOPLE[`${who}_${d.face}`]); h = 1.75; }
    if (!t) return;
    const w = h * t.image.width / t.image.height, mt = pmat(t, s.op); s.mats.push(mt);
    const m = new THREE.Mesh(PLANE, mt); m.scale.set(w, h, 1); m.position.set(-w / 2, 0, 0); s.group.add(m); shadow(s, w);
  }
  list.forEach((a, k) => WHO.forEach((who, i) => {
    const s = { group: new THREE.Group(), mats: [], sh: [], op: 0 }; s.group.position.set(a.def.x, 0, a.def.z); s.group.visible = false; paint.add(s.group); slots[i][k] = s; fillSlot(s, a, who);
  }));

  const PH = 2 * Math.tan(camera.fov * Math.PI / 360) * (2.8 + 4.1) * 1.04;
  const WIN = { u: .38, v: .636 };
  /* Letting a fish go: lift it out of the water toward the window (RELEASE, tank-local: above the surface, over the window's side) and let go there. The window glows
     faintly while a fish is held over it (G.glowTo); G.letGo fades the fish up out of the water with a ring on the surface, then removes it. */
  const RELEASE = { y: SURF - .02, x0: -1, x1: .15 }, glowC = document.createElement('canvas'); glowC.width = glowC.height = 64; { const x = glowC.getContext('2d'), g = x.createRadialGradient(32, 32, 4, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.7, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(glowC), color: 0xfff0c8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); let glowGoal = 0;
  const ringGeo = new THREE.RingGeometry(.9, 1, 32).rotateX(-Math.PI / 2), rings = [];
  let plate = null;
  loadTex(ART.gallery.backdrop).then(t => {
    if (!t) return;
    const pw = PH * t.image.width / t.image.height, m = new THREE.Mesh(new THREE.PlaneGeometry(pw, PH), pmat(t)); m.material.transparent = false; m.material.depthWrite = true; m.position.set(0, 1.2, -4.1); paint.add(m); m.renderOrder = -1; plate = m;
    glow.position.set((WIN.u - .5) * pw, (WIN.v - .5) * PH, .02); glow.scale.set(.42 * pw, .42 * PH, 1); m.add(glow);
    shell.forEach(o => { o.visible = false; }); floorBits.forEach(o => { o.visible = false; });
  });

  /* fish */
  const fishGroup = new THREE.Group(); tank.add(fishGroup);
  let fish = [];
  const G = { scene, camera, tank, glass, room, view: 'room', selected: null, onSelect: null, fishMeshes: () => fish.map(f => f.mesh) };
  const BX = TW / 2 - .22, BY0 = .22, BY1 = SURF - .13, BZ = .12;
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
  G.enter = journal => {
    G.setFish(journal); G.view = 'room'; G.vt = 0;
    const n = list.length, a = n ? Math.floor(Math.random() * n) : -1, b = n > 1 ? (a + 1 + Math.floor(Math.random() * (n - 1))) % n : -1, sw = Math.random() < .5;
    F[0] = { cur: sw ? a : b, next: -1, f: 0, timer: 40 + Math.random() * 50 }; F[1] = { cur: sw ? b : a, next: -1, f: 0, timer: 40 + Math.random() * 50 };
    slots.forEach((row, i) => row.forEach((s, k) => setOp(s, k === F[i].cur ? 1 : 0)));
  };
  G.setView = v => { G.view = v; G.vt0 = performance.now(); };
  /** inRelease(x, y): tank-local point over the way out. hold(): lift (over the way out) lets the fish come up out of the water. */
  G.inRelease = (x, y) => y > RELEASE.y && x > RELEASE.x0 && x < RELEASE.x1;
  G.glowTo = on => { glowGoal = on ? 1 : 0; };
  G.hold = (f, x, y, lift) => { f.held = true; f.x = Math.max(-BX, Math.min(BX, x)); f.y = Math.max(BY0, Math.min(lift ? TH - .02 : BY1, y)); f.tx = f.x; f.ty = f.y; };
  G.letGo = (f, done) => { f.held = false; f.leaving = performance.now(); f.done = done; const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xeafcff, transparent: true, opacity: .7, depthWrite: false })); m.position.set(f.x, SURF + .005, f.z); m.renderOrder = 7; tank.add(m); rings.push({ m, t0: f.leaving }); };
  G.release = f => { f.held = false; f.retarget = 0; };
  G.bounds = { BX, BY0, BY1, BZ };
  /* ornaments: meshes in the tank, meshes waiting on the table, dragging along the floor, moving between the two, saving */
  G.decorMeshes = () => decor.filter(d => d.x !== null).map(d => d.mesh);
  G.trayMeshes = () => decor.filter(d => d.x === null).map(d => d.mesh);
  G.decorDrag = (d, x) => { d.x = x; place(d); };
  G.decorToTray = d => { d.x = null; place(d); savedOut(); };
  G.decorToTank = d => { d.x = (Math.random() * 2 - 1) * lim(d) * .8; place(d); savedOut(); };
  G.decorSave = savedOut;

  G.update = (now, dt, night) => {
    const t = now / 1000;
    /* the camera rests in the room; the tank view is a close-up of just the aquarium */
    G.vt = G.vt === undefined ? 0 : G.vt; const goal = G.view === 'tank' ? 1 : 0; G.vt += (goal - G.vt) * Math.min(1, dt * 3.2);
    const v = G.vt * G.vt * (3 - 2 * G.vt), sx = Math.sin(t * .2) * .08;
    camera.position.set(sx * (1 - v), 1.5 + Math.sin(t * .3) * .02 * (1 - v) - .4 * v, 2.8 + (-1.8 + 1.75 * S - 2.8) * v);
    camera.lookAt(0, 1.05, -1.8);
    camera.fov = 50 + (44 - 50) * v; camera.updateProjectionMatrix();
    if (plate) plate.scale.setScalar((camera.position.z + 4.1) / (2.8 + 4.1));
    WHO.forEach((_, i) => {
      const st = F[i]; if (st.cur < 0) return;
      st.timer -= dt;
      if (st.timer <= 0 && st.next < 0) { const o = F[1 - i], c = list.map((_, k) => k).filter(k => k !== st.cur && k !== o.cur && k !== o.next); if (c.length) { st.next = c[Math.floor(Math.random() * c.length)]; st.f = 0; } st.timer = 40 + Math.random() * 50; }
      if (st.next >= 0) { st.f = Math.min(1, st.f + dt / 1.8); setOp(slots[i][st.cur], 1 - st.f); setOp(slots[i][st.next], st.f); if (st.f >= 1) { st.cur = st.next; st.next = -1; } }
      [st.cur, st.next].forEach(k => {
        const s = k >= 0 && slots[i][k]; if (!s || !s.group.visible) return; const d = list[k].def, ph = i * 2 + k;
        s.group.rotation.z = (d.base || 0) + Math.sin(t * .7 + ph) * d.amp;
      });
    });
    tc.set(0xffffff).lerp(NIGHTC, night * .65); tintMats.forEach(m => m.color.copy(tc));
    windowMat.color.set(0xbfd8e8).lerp(new THREE.Color(0x0e1838), night); hemi.intensity = .9 - .35 * night; lamp.intensity = 7 + 5 * night + Math.sin(t * 7) * .15;
    scene.background.set(0x2a2018).lerp(new THREE.Color(0x120e0a), night); scene.fog.color.copy(scene.background);
    tank.rotation.z = Math.sin(t * .6) * .02; tank.position.x = Math.sin(t * .6) * .01;
    decor.forEach((d, i) => { if (d.id === 'plant' && d.x !== null) d.mesh.rotation.z = Math.sin(t * 1.3 + i) * .08; });
    for (let i = 0; i < BN; i++) { const s = (bseed[i] + t * .12 * (.6 + bseed[(i + 3) % BN])) % 1; bpos[i * 3] = .1 + Math.sin(s * 12 + i) * .04; bpos[i * 3 + 1] = .2 + s * (SURF - .3); bpos[i * 3 + 2] = -.2; }
    bg.attributes.position.needsUpdate = true;
    glow.material.opacity += (glowGoal * .55 * (.85 + .15 * Math.sin(t * 4)) - glow.material.opacity) * Math.min(1, dt * 6);
    for (let i = rings.length; i--;) { const r = rings[i], k = (now - r.t0) / 1400; if (k >= 1) { tank.remove(r.m); r.m.material.dispose(); rings.splice(i, 1); continue; } r.m.scale.setScalar(.05 + k * .45); r.m.material.opacity = .7 * (1 - k); }
    for (let i = fish.length; i--;) { const f = fish[i]; if (!f.leaving) continue; const k = (now - f.leaving) / 1100;
      if (k >= 1) { fishGroup.remove(f.mesh); f.mesh.material.dispose(); fish.splice(i, 1); if (G.selected === f) G.selected = null; f.done && f.done(); continue; }
      f.y += dt * .35; f.mesh.material.opacity = 1 - k * k; }
    fish.forEach(f => {
      if (!f.held && !f.leaving) {
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
