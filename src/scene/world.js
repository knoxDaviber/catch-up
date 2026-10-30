import * as THREE from 'three';
import { PAL } from './palette.js';
import { ART } from '../assets/manifest.js';
import { loadTex, artMat, cutout, updateArt, PLANE } from './art.js';

export const SEAT_X = 1.4;
export const HEAD_Y = 1.28;
export const BOARD_Y = 0.58;
/** The campfire, just past Xiao's chair on the far side from Liam: in view when Liam turns his head right round, clear of the board and the lake. */
export const FIRE = [3.2, 1.3];

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
  // the placeholder body and chair, hidden when painted art stands in (head stays as the "show this person" flag that main.js sets)
  const body = g.children.filter(o => o !== head).concat(head.children);
  // fishing rod, held out over the lake, and the same rod lying low in the grass beside the chair (away from the board) when it's put down
  const rod = limb(g, [.12, .72, -.26], [.1, 2.2, -2.3], .02, 0x3a2b22);
  const rest = limb(g, [-dir * .55, .05, 1.3], [-dir * .45, .03, -1.05], .02, 0x3a2b22); rest.visible = false;
  // invisible, fatter stand-ins so the thin rods are easy to point at (raycasts ignore visibility)
  const hit = (a, b) => { const m = limb(g, a, b, .1, 0xffffff); m.visible = false; return m; };
  return { group: g, head, body, rod, rest, rodHit: hit([.12, .95, -.45], [.1, 2.2, -2.3]), restHit: hit([-dir * .5, .08, .9], [-dir * .45, .06, -1.05]) };
}

/** The painted stand-in for a seated person (chair included): a plane turning about Y at the seat, showing the side, front or back view by the
 *  angle between the camera and the way they face. They face the lake, turning toward the board as `turn` (0..1) goes up during chess. */
const VIEWS = ['side', 'front', 'back'];
function personArt(scene, P, who, x) {
  const pivot = new THREE.Group(), z = .18, H = 1.45; pivot.position.set(x, 0, z); pivot.visible = false; scene.add(pivot);
  const mesh = new THREE.Mesh(PLANE); pivot.add(mesh);
  const views = {}, AX = { side: who === 'liam' ? .3 : .72, front: .5, back: .5 }, natRight = who === 'liam', dir = -Math.sign(x);   // seat over the anchor; side-view facing
  VIEWS.forEach(v => loadTex(ART.people[`${who}_${v}`]).then(t => { if (!t) return; views[v] = { mat: artMat(t), a: t.image.width / t.image.height }; P.body.forEach(m => { m.visible = false; }); }));
  return (cam, turn) => {
    const c = cam.position, dx = c.x - x, dz = c.z - z, d = Math.hypot(dx, dz) || 1, cx = dx / d, cz = dz / d, fx = dir * turn, fz = turn - 1, fl = Math.hypot(fx, fz) || 1;
    const cos = (fx * cx + fz * cz) / fl, want = cos > .55 ? 'front' : cos < -.55 ? 'back' : 'side', v = views[want] ? want : VIEWS.find(k => views[k]);
    pivot.visible = !!v && P.head.visible && d > .8; if (!pivot.visible) return;   // never in your own face (first person, or the camera at your shoulder)
    const V = views[v], w = H * V.a; mesh.material = V.mat; mesh.scale.set(w, H, 1); mesh.position.x = -AX[v] * w;
    pivot.rotation.y = Math.atan2(dx, dz); pivot.scale.x = v !== 'side' || ((fx * cz - fz * cx) > 0) === natRight ? 1 : -1;   // mirror the side view when they face the other way on screen
  };
}

/** A greyscale canvas for an alphaMap: a strip `len` long and `across` wide, its edges wobbling (tileable along). prof(v, a, b) gives the alpha at v (0..1 across)
 *  with the two edge wobbles a and b in -1..1. along = 'v' runs the strip up the texture (for a plane laid along z), otherwise across it. */
function wavyAlpha(len, across, prof, along = 'u', seed = 1) {
  const W = along === 'u' ? len : across, H = along === 'u' ? across : len, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), img = x.createImageData(W, H);
  const ph = [1, 2, 3, 4, 5, 6].map(k => Math.sin(k * 12.9898 * seed) * 43758.5453 % 6.283), wob = (i, o) => (Math.sin(6.283 * 3 * i / len + ph[o]) * .5 + Math.sin(6.283 * 7 * i / len + ph[o + 1]) * .3 + Math.sin(6.283 * 17 * i / len + ph[o + 2]) * .2);
  for (let i = 0; i < len; i++) { const a = wob(i, 0), b = wob(i, 3); for (let j = 0; j < across; j++) { const v = Math.round(255 * Math.min(1, Math.max(0, prof(j / (across - 1), a, b)))), k = 4 * (along === 'u' ? j * W + i : i * W + j); img.data[k] = img.data[k + 1] = img.data[k + 2] = v; img.data[k + 3] = 255; } }
  x.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const sstep = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

/** A tileable strip of soft, painterly tree canopy for the forest's back layers: overlapping blobs over a solid understorey, trunks between. */
function canopyTex(seed, n, cols) {
  const W = 1024, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const blob = (bx, by, rad, col, a) => [-W, 0, W].forEach(ox => { const g = x.createRadialGradient(bx + ox, by, 0, bx + ox, by, rad); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(.65, `rgba(${col},${a * .75})`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.fillRect(bx + ox - rad, by - rad, rad * 2, rad * 2); });
  const gr = x.createLinearGradient(0, H * .4, 0, H * .75); gr.addColorStop(0, `rgba(${cols[0]},0)`); gr.addColorStop(1, `rgba(${cols[0]},1)`); x.fillStyle = gr; x.fillRect(0, H * .4, W, H * .6);
  x.fillStyle = `rgba(${cols[0]},1)`; x.fillRect(0, H * .75, W, H * .25);
  for (let i = 0; i < n * .4; i++) { const tx = r() * W; x.fillStyle = `rgba(${cols[1]},.5)`; x.fillRect(tx, H * (.35 + r() * .2), 2 + r() * 3, H); }
  for (let i = 0; i < n; i++) { const bx = r() * W, top = H * (.1 + r() * .38), col = cols[i % cols.length]; for (let k = 0; k < 5; k++) blob(bx + (r() - .5) * 60, top + k * 20 + r() * 12, 22 + r() * 32, col, .5); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t;
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

  // ground: grass, the bank along the shore, a path out of the forest behind to the stump, the lake beyond (its near edge tucked under the bank)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 120), mat(PAL.grass)); ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, 10); scene.add(ground);
  // the bank and the path fade out over wobbly edges (alphaMap), so the water and grass show through soft, uneven borders instead of straight lines
  const soft = (color, alpha) => new THREE.MeshLambertMaterial({ color, alphaMap: alpha, transparent: true, depthWrite: false });
  const bankA = wavyAlpha(1024, 128, (v, a, b) => sstep(.07 + a * .05, .26 + a * .06, v) * (1 - sstep(.8 + b * .04, .95 + b * .03, v)), 'u', 1); bankA.repeat.set(8, 1);   // v: 0 water side, 1 grass side
  const bank = new THREE.Mesh(new THREE.PlaneGeometry(220, 4.4), soft(PAL.sand, bankA)); bank.rotation.x = -Math.PI / 2; bank.position.set(0, .01, -4.4); bank.renderOrder = -1; scene.add(bank);
  const pathA = wavyAlpha(512, 64, (v, a, b) => sstep(.02 + a * .06, .2 + a * .06, v) * (1 - sstep(.8 + b * .06, .98 + b * .02, v)), 'v', 2);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 26), soft(PAL.path, pathA)); path.rotation.x = -Math.PI / 2; path.position.set(0, .012, 10.2); path.renderOrder = -1; scene.add(path);
  // the lake: a touch deeper and greener near the bank, lifting to the plain sky-tinted colour toward the far shore (vertex colours under the day/night colour)
  const lakeG = new THREE.PlaneGeometry(260, 141.4, 1, 30), lc = [], lp = lakeG.attributes.position, near = new THREE.Color(.74, .84, .86), lcol = new THREE.Color();
  for (let i = 0; i < lp.count; i++) { lcol.copy(near).lerp(new THREE.Color(1, 1, 1), sstep(0, 45, lp.getY(i) + 70.7)); lc.push(lcol.r, lcol.g, lcol.b); }
  lakeG.setAttribute('color', new THREE.Float32BufferAttribute(lc, 3));
  const lake = new THREE.Mesh(lakeG, new THREE.MeshLambertMaterial({ color: PAL.lake, vertexColors: true })); lake.rotation.x = -Math.PI / 2; lake.position.set(0, .005, -75.3); scene.add(lake);
  W.lake = lake;
  const tile = (m, path, rx, ry, wrap = THREE.RepeatWrapping) => loadTex(path).then(t => { if (!t) return; t = t.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = wrap; t.repeat.set(rx, ry); const a = m.material.alphaMap;
    m.material = a ? soft(m === bank ? 0xe6dfcf : 0xffffff, a) : new THREE.MeshLambertMaterial({ map: t }); m.material.map = t; });
  // ~4 m grass tiles, mirrored to hide the seams; one path tile across; the bank (no art of its own yet) borrows the path's, about 5 m a tile and a little muted
  tile(ground, ART.ground.grass, 55, 30, THREE.MirroredRepeatWrapping); tile(path, ART.ground.path, 1, 26 / 2.6); tile(bank, ART.ground.path, 220 / 5, 4.4 / 5, THREE.MirroredRepeatWrapping);

  // mountains and the far tree line
  const far = [];
  [[-40, -120, 38, 60, PAL.mountain], [8, -130, 52, 80, PAL.mountainFar], [58, -118, 34, 55, PAL.mountain], [-80, -125, 30, 50, PAL.mountainFar]].forEach(m => { const c = cone(scene, m[0], 0, m[1], m[3], m[2], 4, m[4], { fog: true }); c.rotation.y = .6; far.push(c); });
  for (let i = 0; i < 46; i++) {
    const x = -105 + i * 4.6 + Math.sin(i * 7.3) * 1.6, z = -106 + Math.cos(i * 3.1) * 2.5, h = 11 + (i * 37 % 7) * 1.1;
    far.push(cone(scene, x, 0, z, 3.4, h, 6, i % 3 ? PAL.pine : PAL.pineLight));
  }
  // painted far shore: a cylinder segment round the camp across the lake, its bottom just under the far waterline. Test art covers the fishing view's arc, not the full turn.
  loadTex(ART.plates.far).then(t => { if (!t) return; const R = 110, L = 2.4, H = R * L * t.image.height / t.image.width;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 40, 1, true, Math.PI - L / 2, L), artMat(t, { alphaTest: .02, transparent: true }));
    m.position.y = H / 2 - 1.2; m.scale.x = -1; scene.add(m); far.forEach(o => { o.visible = false; }); });
  // trees around the camp: placeholder pines, each swapped for a painted cutout when its art loads (art spot, kind, height)
  [[-16, -2, 'tree_gum', 10], [-13, 6, 'tree_paperbark', 8], [15, 2, 'tree_whitegum', 10], [18, -3, 'tree_pine', 11], [-20, 10, 'tree_pine', 10], [20, 9, 'tree_gum', 9.5], [-6, -10, 'tree_paperbark', 7, -6.6, -5.9]].forEach((p, i) => { const h = 4.6 + (i % 3);
    const ph = [box(scene, p[4] ?? p[0], .5, p[5] ?? p[1], .35, 1, .35, PAL.stump), cone(scene, p[4] ?? p[0], 1, p[5] ?? p[1], 1.6, h, 6, i % 2 ? PAL.pine : PAL.pineLight)];
    cutout(scene, ART.cutouts[p[2]], p[4] ?? p[0], p[5] ?? p[1], p[3], { onLoad: () => ph.forEach(o => { o.visible = false; }) }); });
  // extra painted trees, wattles and reeds (art only: nothing here without the files)
  [[-24, -4, 'tree_gum', 11], [25, -2, 'tree_whitegum', 11], [-28, 6, 'tree_pine', 12], [11.5, -5.3, 'tree_paperbark', 7], [-11, -4.6, 'wattle', 3.2], [9.5, -4.2, 'wattle', 2.8],
    [-9, 13, 'tree_whitegum', 9], [12, 14, 'tree_gum', 10], [-30, -5.5, 'tree_paperbark', 8], [30, 4, 'tree_pine', 12],
    [-4.2, -5.9, 'reeds', 1.1], [-3.1, -6.1, 'reeds', .85], [3.6, -5.9, 'reeds', 1.2], [5.1, -6.05, 'reeds', .95], [-8.6, -5.8, 'reeds', 1.2], [8.2, -5.8, 'reeds', 1.1], [13.5, -5.9, 'reeds', 1]
  ].forEach(p => cutout(scene, ART.cutouts[p[2]], p[0], p[1], p[3]));
  // the forest closing round the camp on the land side, so the two of them are alone: a near ring of single trees, a darker mid ring, then two soft
  // painted bands of canopy (dark understorey, then a hazier taller line) so no gap shows. The path leaves through the near ring and runs in under the trees.
  const rnd = i => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); }, KINDS = ['tree_gum', 'tree_whitegum', 'tree_paperbark', 'tree_pine', 'tree_gum', 'tree_paperbark', 'wattle'];
  [[14, 3.2, 7, 4, [0xffffff, 0xe8ece2, 0xd6ddd0]], [22, 3.6, 9, 4.5, [0xb9c4b6, 0xa6b3ab, 0x9aa9a8]]].forEach(([R, step, h0, hv, shades], L) => {
    for (let a = -.3, i = L * 100; a <= Math.PI + .3; a += step / R, i++) {
      const r = R + (rnd(i) - .5) * 4, aa = a + (rnd(i + 50) - .5) * .08, x = r * Math.cos(aa), z = 1 + r * Math.sin(aa), k = KINDS[Math.floor(rnd(i + 7) * KINDS.length)];
      if (L === 0 && Math.abs(x) < 6 && z > 9) continue;   // keep the wide (leaving) view of the camp clear; the path goes out between
      cutout(scene, ART.cutouts[k], x, z, k === 'wattle' ? 3 + rnd(i + 3) * 1.4 : h0 + rnd(i + 3) * hv, { shade: shades[i % 3], flip: rnd(i + 9) > .5 });
    } });
  [[-3.3, 18.6, 'tree_paperbark', 8.5], [3.5, 19.4, 'tree_gum', 10], [-2.9, 21.6, 'tree_whitegum', 9.5], [2.6, 22.4, 'tree_pine', 10.5], [-4.6, 16.4, 'wattle', 3.4], [4.4, 17.6, 'wattle', 3]]
    .forEach((p, i) => cutout(scene, ART.cutouts[p[2]], p[0], p[1], p[3], { shade: i % 2 ? 0xe8ece2 : 0xffffff, flip: !!(i % 2) }));
  [[30, 12, 60, ['70,92,78', '92,116,98', '112,136,112'], 0xd2d8d0], [44, 19, 45, ['118,138,134', '136,154,148', '152,170,160'], 0xe2e6e2]].forEach(([R, H, n, cols, shade], i) => {
    const th = Math.acos((-5.6 - 1) / R), tex = canopyTex(7 + i * 31, n, cols); tex.repeat.x = Math.round(R * th * 2 / (H * 4));
    const band = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 56, 1, true, -th, th * 2), artMat(tex, { alphaTest: .02, transparent: true, depthWrite: false }, shade));
    band.position.set(0, H / 2 - .3, 1); band.renderOrder = -2 + i * -1; scene.add(band); });
  // the jetty: a fixed plane running from the left shore out into the lake, its posts sinking below the waterline
  cutout(scene, ART.cutouts.jetty, -13, -5.4, 2, { y: -.8, ax: 0, yaw: .6435 });

  // stump, board, chairs, people
  const stump = new THREE.Mesh(new THREE.CylinderGeometry(.62, .7, BOARD_Y - .02, 9), mat(PAL.stump)); stump.position.set(0, (BOARD_Y - .02) / 2, 0); scene.add(stump);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(1.2, .04, 1.2), mat(0x6b4a33)); slab.position.set(0, BOARD_Y - .02, 0); scene.add(slab);
  const liam = buildPerson(PAL.liamShirt, PAL.liamCap, PAL.liamChair, -SEAT_X, PAL.liamPants), xiao = buildPerson(PAL.xiaoShirt, PAL.xiaoCap, PAL.xiaoChair, SEAT_X, PAL.xiaoPants);
  scene.add(liam.group, xiao.group); W.people = { liam, xiao };
  const peopleArt = [personArt(scene, liam, 'liam', -SEAT_X), personArt(scene, xiao, 'xiao', SEAT_X)];

  // cooler beside Liam, camp props
  box(scene, -3.25, .22, 1.7, .8, .44, .45, PAL.cooler); box(scene, -3.25, .47, 1.7, .84, .06, .49, PAL.coolerLid);
  const tent = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.7, 4), mat(PAL.tent)); tent.position.set(6.5, .85, -.5); tent.rotation.y = Math.PI / 4; tent.scale.set(1, 1, .9); scene.add(tent);
  cutout(scene, ART.cutouts.tent, 6.5, -.5, 1.9, { onLoad: () => { tent.visible = false; } });
  const [fx, fz] = FIRE; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; box(scene, fx + Math.cos(a) * .55, .08, fz + Math.sin(a) * .55, .22, .16, .2, PAL.stone); }
  limb(scene, [fx - .3, .12, fz - .2], [fx + .3, .18, fz + .2], .06, 0x5b4130); limb(scene, [fx + .3, .12, fz - .2], [fx - .3, .18, fz + .2], .06, 0x4f3828);

  // cabin with a lantern, left
  const cabin = new THREE.Group(); cabin.position.set(-8.5, 0, -1); scene.add(cabin);
  box(cabin, 0, 1.35, 0, 5.2, 2.7, 4, PAL.wood);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.6, 4), mat(PAL.roof)); roof.position.set(0, 3.5, 0); roof.rotation.y = Math.PI / 4; roof.scale.set(1.18, 1, .86); cabin.add(roof);
  box(cabin, -1.1, 3.8, -.8, .5, 1.2, .5, 0x7b6a5e);
  box(cabin, .8, 1.5, 2.03, 1, .9, .06, 0xf2c879, { emissive: 0xf2c879, emissiveIntensity: .6 }); box(cabin, -1.2, 1.5, 2.03, .8, .9, .06, 0xf2c879, { emissive: 0xf2c879, emissiveIntensity: .6 });
  box(cabin, -2.2, 1.0, 2.03, .9, 1.9, .06, 0x4a3426);
  box(cabin, 3.3, .8, 3.0, .08, 1.6, .08, 0x4a3426);
  const lantern = box(cabin, 3.3, 1.75, 3.0, .3, .38, .3, 0xffd58a, { emissive: 0xffd58a, emissiveIntensity: .9 }); W.lantern = lantern;
  cutout(scene, ART.cutouts.cabin, -8.5, -.2, 4.8, { onLoad: () => { cabin.visible = false; } });

  // things within reach of each chair, on the side away from the board: a radio on a crate and the fish bucket.
  // Look around while fishing to find them; they are how music and the fish gallery are reached in a game.
  W.hot = [];
  [['liam', -1], ['xiao', 1]].forEach(([who, s]) => {
    const radio = new THREE.Group(); radio.position.set(s * 2.3, 0, -.6); radio.rotation.y = s * .5; scene.add(radio);
    box(radio, 0, .2, 0, .42, .4, .34, 0x8d6b4b);                                     // crate
    box(radio, 0, .5, 0, .3, .18, .11, 0x6f9a95); box(radio, 0, .6, 0, .22, .03, .05, 0x3a3228);   // body, handle
    const sp = new THREE.Mesh(new THREE.CircleGeometry(.05, 14), mat(0xe9dfc8)); sp.position.set(-.06, .5, .056); radio.add(sp);
    box(radio, .08, .52, .056, .08, .03, .01, 0xf2c879, { emissive: 0xf2c879, emissiveIntensity: .5 });
    limb(radio, [.11, .59, -.03], [.18, .86, -.06], .006, 0xcfcfcf);
    const bucket = new THREE.Group(); bucket.position.set(s * 1.95, 0, -1.3); scene.add(bucket);
    const pail = new THREE.Mesh(new THREE.CylinderGeometry(.17, .13, .26, 12, 1, true), mat(0x7f97a3, { side: THREE.DoubleSide })); pail.position.y = .13; bucket.add(pail);
    const water = new THREE.Mesh(new THREE.CircleGeometry(.16, 12), mat(0x5d8aa0)); water.rotation.x = -Math.PI / 2; water.position.y = .2; bucket.add(water);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(.17, .008, 4, 16, Math.PI), mat(0x4a4540)); handle.position.y = .26; bucket.add(handle);
    // painted props stand in front of the (now invisible) 3D ones, which stay as the click targets: raycasts ignore visibility
    const hide = (g, f = () => true) => () => g.children.forEach((o, i) => { if (f(i)) o.visible = false; });
    cutout(scene, ART.props.crate, s * 2.3, -.6, .44, { onLoad: hide(radio, i => i === 0) }); cutout(scene, ART.props.radio, s * 2.3, -.6, .3, { y: .36, dz: .06, onLoad: hide(radio, i => i > 0) });
    cutout(scene, ART.props.bucket, s * 1.95, -1.3, .34, { onLoad: hide(bucket) });
    const P = W.people[who], px = s * SEAT_X;
    W.hot.push({ key: 'radio', who, obj: radio, at: [s * 2.3, .75, -.6] }, { key: 'bucket', who, obj: bucket, at: [s * 1.95, .45, -1.3] },
      { key: 'rod', who, obj: P.rodHit, at: [px + .1, 1.75, -1.55] }, { key: 'pickup', who, obj: P.restHit, at: [px + s * .45, .15, -.7] });
  });

  /** cam: for the painted planes to face it; turn (0..1): how far the people have turned from the lake to the board. */
  W.update = (t, cam, turn = 0) => { W.animated.forEach(f => f(t)); if (cam) { updateArt(cam); peopleArt.forEach(f => f(cam, turn)); } };
  return W;
}
