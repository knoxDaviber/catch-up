import * as THREE from 'three';
import { PAL } from './palette.js';
import { ART } from '../assets/manifest.js';
import { loadTex, artMat, cutout, updateArt, PLANE, WIND, sway } from './art.js';
import { buildScatter } from './scatter.js';

export const SEAT_X = 1.4;
export const HEAD_Y = 1.28;
export const BOARD_Y = 0.58;
/** The campfire, just past Xiao's chair on the far side from Liam: in view when Liam turns his head right round, clear of the board and the lake. */
export const FIRE = [3.2, 1.3];

const CALM = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;   // water and plants move at a third of the pace

/* The lake's painted water, alive (only with the art): the two drifting samples bend on slow layered sines (wT, a clock in seconds); sun glints twinkle in small
   cells laid out by view angle, so they stay a few pixels big however far off (sparse near, denser far, gathered toward the sun); a low sun or the moon lays a soft
   shimmering path. glint (from daynight): the sun's or moon's direction across the water (x, z), sparkle and path strength; glintC: colour, and 1 for the moon's tighter path. */
const WATER_HEAD = `uniform vec4 drift; uniform float wT; uniform vec4 glint; uniform vec4 glintC; varying vec3 vWP;
  float wHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
`;
const WATER_MAP = `vec2 wv = vec2(sin(vWP.z * 1.7 + wT * .55) + .6 * sin(vWP.x * 1.1 - vWP.z * 2.3 + wT * .4), sin(vWP.x * 1.3 + wT * .47) + .6 * sin(vWP.z * 2.9 + vWP.x * .7 - wT * .36)) * .008;
  diffuseColor *= mix(texture2D(map, vMapUv + drift.xy + wv), texture2D(map, vMapUv * 1.31 + drift.zw - wv * .7), .5);
`;
const WATER_GLINT = `{ vec3 vd = vWP - cameraPosition; float dist = length(vd.xz), al = max(dot(vd.xz / max(dist, .001), glint.xy), 0.);
  vec2 cp = vec2(atan(vd.x, -vd.z) * 70., atan(cameraPosition.y - vWP.y, dist) * 100.), ci = floor(cp), cf = fract(cp) - .5; float h = wHash(ci);
  float dens = mix(.006, .16, smoothstep(4., 60., dist)) * mix(.12 + .88 * pow(al, 4.), pow(al, 24.), glintC.w);
  float sp = step(1. - dens, wHash(ci + 17.3)) * pow(.5 + .5 * sin(wT * (.9 + 1.8 * h) + h * 60.), 6.) * smoothstep(.24, .04, length(cf * vec2(1., 1.9)));
  float pth = pow(al, mix(60., 140., glintC.w)) * smoothstep(2., 20., dist) * (.55 + .45 * sin(vWP.x * 2.3 + vWP.z * 1.3 + wT * .7) * sin(vWP.z * 3.7 - wT * .5));
  outgoingLight += glintC.rgb * (sp * glint.z + pth * glint.w); }
`;
/* The bank's water edge laps: a faint foam line breathes in and out across the alpha fade (v > .5 is the water side), with a darker wet band just inside it. */
const LAP = `float am = texture2D(alphaMap, vAlphaMapUv).g;
  if (vAlphaMapUv.y > .5) { float e = .3 + .14 * sin(wT * .7 + vAlphaMapUv.x * 9.) + .06 * sin(wT * 1.3 + vAlphaMapUv.x * 23.), f = smoothstep(e - .16, e, am) * (1. - smoothstep(e, e + .1, am));
    diffuseColor.rgb = mix(diffuseColor.rgb * mix(1., .82, smoothstep(e, e + .35, am) * (1. - smoothstep(.75, 1., am))), vec3(1.), f * .55); diffuseColor.a *= max(am, f * .7); }
  else diffuseColor.a *= am;
`;

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
  W.lake = lake; W.lakeDrift = { value: new THREE.Vector4() }; W.water = { wT: { value: 0 }, glint: { value: new THREE.Vector4() }, glintC: { value: new THREE.Vector4() } };
  // painted water: ~7 m tiles, sampled twice with slowly drifting offsets for a shimmer, under the day/night lake colour (lakeGain keeps the old colour on average)
  loadTex(ART.ground.water).then(t => { if (!t) return; t = t.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(260 / 7, 141.4 / 7);
    const c = document.createElement('canvas'); c.width = c.height = 8; const x = c.getContext('2d'); x.drawImage(t.image, 0, 0, 8, 8); const px = x.getImageData(0, 0, 8, 8).data, lin = v => Math.pow(v / 255, 2.2), g = [0, 0, 0];
    for (let i = 0; i < px.length; i += 4) for (let k = 0; k < 3; k++) g[k] += lin(px[i + k]) / 64;
    const m = lake.material; m.map = t; W.lakeGain = new THREE.Color(...g.map(v => 1 / Math.max(.15, v)));   // per channel, so the average stays the old lake colour and the paint adds the texture
    m.onBeforeCompile = sh => { Object.assign(sh.uniforms, { drift: W.lakeDrift }, W.water); sh.vertexShader = 'varying vec3 vWP;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n  vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = WATER_HEAD + sh.fragmentShader.replace('#include <map_fragment>', WATER_MAP).replace('#include <opaque_fragment>', WATER_GLINT + '#include <opaque_fragment>'); };
    m.needsUpdate = true; });
  const tile = (m, path, rx, ry, wrap = THREE.RepeatWrapping) => loadTex(path).then(t => { if (!t) return; t = t.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = wrap; t.repeat.set(rx, ry); const a = m.material.alphaMap;
    m.material = a ? soft(m === bank ? 0xe6dfcf : 0xffffff, a) : new THREE.MeshLambertMaterial({ map: t }); m.material.map = t;
    if (m === bank) m.material.onBeforeCompile = sh => { sh.uniforms.wT = W.water.wT; sh.fragmentShader = 'uniform float wT;\n' + sh.fragmentShader.replace('#include <alphamap_fragment>', LAP); }; });
  // 6 x 4 m grass tiles, mirrored to hide the seams; one path tile across; the bank (no art of its own yet) borrows the path's, about 5 m a tile and a little muted
  tile(ground, ART.ground.grass, 220 / 6, 30, THREE.MirroredRepeatWrapping); tile(path, ART.ground.path, 1, 26 / 2.6); tile(bank, ART.ground.path, 220 / 5, 4.4 / 5, THREE.MirroredRepeatWrapping);

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
  const feet = [];   // [x, z, height, kind] of painted trees and reeds, for the ground scatter to dress
  // trees around the camp: placeholder pines, each swapped for a painted cutout when its art loads (art spot, kind, height)
  [[-16, -2, 'tree_gum', 10], [-13, 6, 'tree_paperbark', 8], [15, 2, 'tree_whitegum', 10], [18, -3, 'tree_pine', 11], [-20, 10, 'tree_pine', 10], [20, 9, 'tree_gum', 9.5], [-6, -10, 'tree_paperbark', 7, -6.6, -5.9]].forEach((p, i) => { const h = 4.6 + (i % 3);
    const ph = [box(scene, p[4] ?? p[0], .5, p[5] ?? p[1], .35, 1, .35, PAL.stump), cone(scene, p[4] ?? p[0], 1, p[5] ?? p[1], 1.6, h, 6, i % 2 ? PAL.pine : PAL.pineLight)];
    cutout(scene, ART.cutouts[p[2]], p[4] ?? p[0], p[5] ?? p[1], p[3], { onLoad: () => ph.forEach(o => { o.visible = false; }) }); feet.push([p[4] ?? p[0], p[5] ?? p[1], p[3], p[2]]); });
  // extra painted trees, wattles and reeds (art only: nothing here without the files)
  [[-24, -4, 'tree_gum', 11], [25, -2, 'tree_whitegum', 11], [-28, 6, 'tree_pine', 12], [11.5, -5.3, 'tree_paperbark', 7], [-11, -4.6, 'wattle', 3.2], [9.5, -4.2, 'wattle', 2.8],
    [-9, 13, 'tree_whitegum', 9], [12, 14, 'tree_gum', 10], [-30, -5.5, 'tree_paperbark', 8], [30, 4, 'tree_pine', 12],
    [-4.2, -5.9, 'reeds', 1.1], [-3.1, -6.1, 'reeds', .85], [3.6, -5.9, 'reeds', 1.2], [5.1, -6.05, 'reeds', .95], [-8.6, -5.8, 'reeds', 1.2], [8.2, -5.8, 'reeds', 1.1], [13.5, -5.9, 'reeds', 1]
  ].forEach(p => { cutout(scene, ART.cutouts[p[2]], p[0], p[1], p[3], p[2] === 'reeds' ? { onLoad: m => sway(m.material, .05) } : {}); feet.push([p[0], p[1], p[3], p[2]]); });   // reeds sway
  // the forest closing round the camp on the land side, so the two of them are alone: a loose near ring of single trees for depth, then the painted
  // forest strips (or, without them, two drawn bands of canopy) so no gap shows. The path leaves through the near ring and runs in under the trees.
  const rnd = i => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); }, KINDS = ['tree_gum', 'tree_whitegum', 'tree_paperbark', 'tree_pine', 'tree_gum', 'tree_paperbark', 'wattle'];
  [[14, 6.5, 7, 4, [0xffffff, 0xe8ece2, 0xd6ddd0]]].forEach(([R, step, h0, hv, shades], L) => {
    for (let a = -.3, i = L * 100; a <= Math.PI + .3; a += step / R, i++) {
      const r = R + (rnd(i) - .5) * 4, aa = a + (rnd(i + 50) - .5) * .08, x = r * Math.cos(aa), z = 1 + r * Math.sin(aa), k = KINDS[Math.floor(rnd(i + 7) * KINDS.length)];
      if (L === 0 && Math.abs(x) < 6 && z > 9) continue;   // keep the wide (leaving) view of the camp clear; the path goes out between
      const h = k === 'wattle' ? 3 + rnd(i + 3) * 1.4 : h0 + rnd(i + 3) * hv; cutout(scene, ART.cutouts[k], x, z, h, { shade: shades[i % 3], flip: rnd(i + 9) > .5 }); feet.push([x, z, h, k]);
    } });
  [[5, 18.6, 'tree_whitegum', 9.5], [-11.5, 17, 'tree_paperbark', 8.5], [-4.6, 15.6, 'wattle', 3.4], [4.4, 16.4, 'wattle', 3]]
    .forEach((p, i) => { cutout(scene, ART.cutouts[p[2]], p[0], p[1], p[3], { shade: i % 2 ? 0xe8ece2 : 0xffffff, flip: !!(i % 2) }); feet.push([p[0], p[1], p[3], p[2]]); });
  const canopy = [];
  [[30, 12, 60, ['70,92,78', '92,116,98', '112,136,112'], 0xd2d8d0], [44, 19, 45, ['118,138,134', '136,154,148', '152,170,160'], 0xe2e6e2]].forEach(([R, H, n, cols, shade], i) => {
    const th = Math.acos((-5.6 - 1) / R), tex = canopyTex(7 + i * 31, n, cols); tex.repeat.x = Math.round(R * th * 2 / (H * 4));
    const band = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 56, 1, true, -th, th * 2), artMat(tex, { alphaTest: .02, transparent: true, depthWrite: false }, shade));
    band.position.set(0, H / 2 - .3, 1); band.renderOrder = -2 + i * -1; scene.add(band); canopy.push(band); });
  // painted forest strips replace those bands: three rings (near crisp, mid, far hazy and a little see-through) of cylinder pieces from the shore round to the shore,
  // each piece a strip picked in turn and mirrored every other time, overlapping its neighbour and set a touch nearer or further so the joins never line up
  [['near', 21, 0xffffff, 1], ['mid', 29, 0xdde5df, 1], ['far', 39, 0xd3dfe3, .82]].forEach(([k, R, shade, op], b) => Promise.all((ART.forest[k] || []).map(loadTex)).then(ts => { ts = ts.filter(Boolean); if (!ts.length) return;
    const th = Math.acos((-5.6 - 1) / R), da = 2, n = Math.ceil((2 * th - da) / (da * .85)) + 1, step = (2 * th - da) / (n - 1), o = op < 1 ? { alphaTest: .05, transparent: true, opacity: op, depthWrite: false } : { alphaTest: .35 };
    for (let i = 0; i < n; i++) { const t = ts[(i + b) % ts.length], flip = (i + b + Math.floor(i / ts.length)) % 2 === 1, r = R + (i % 2) * .7, h = da * r * t.image.height / t.image.width;
      const g = new THREE.CylinderGeometry(r, r, h, 24, 1, true, -th + i * step, da).translate(0, h / 2 - .35, 0), uv = g.attributes.uv; for (let j = 0; j < uv.count; j++) uv.setX(j, flip ? uv.getX(j) : 1 - uv.getX(j));
      const m = new THREE.Mesh(g, artMat(t, o, shade)); m.position.z = 1; m.renderOrder = -3 - b; scene.add(m); }
    canopy.forEach(o => { o.visible = false; }); }));
  // ground-level scenery framing where the path leaves the forest: the path running in, a clearing with boulders and a gum beside it (behind the wide view's camera)
  cutout(scene, ART.cutouts.path_entry, .3, 19.2, 4.2, { y: -.15, yaw: Math.PI }); cutout(scene, ART.cutouts.clearing, -6.4, 17.6, 5, { y: -.15, yaw: Math.PI + .3 });
  // the jetty: a fixed plane running from the left shore out into the lake, its posts sinking below the waterline
  cutout(scene, ART.cutouts.jetty, -13, -5.4, 2, { y: -.8, ax: 0, yaw: .6435 });

  // stump, board, chairs, people
  const stump = new THREE.Mesh(new THREE.CylinderGeometry(.62, .7, BOARD_Y - .02, 9), mat(PAL.stump)); stump.position.set(0, (BOARD_Y - .02) / 2, 0); scene.add(stump);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(1.2, .04, 1.2), mat(0x6b4a33)); slab.position.set(0, BOARD_Y - .02, 0); scene.add(slab);
  const liam = buildPerson(PAL.liamShirt, PAL.liamCap, PAL.liamChair, -SEAT_X, PAL.liamPants), xiao = buildPerson(PAL.xiaoShirt, PAL.xiaoCap, PAL.xiaoChair, SEAT_X, PAL.xiaoPants);
  scene.add(liam.group, xiao.group); W.people = { liam, xiao };
  const peopleArt = [personArt(scene, liam, 'liam', -SEAT_X), personArt(scene, xiao, 'xiao', SEAT_X)];

  // cooler beside Liam, camp props
  const cooler = [box(scene, -3.25, .22, 1.7, .8, .44, .45, PAL.cooler), box(scene, -3.25, .47, 1.7, .84, .06, .49, PAL.coolerLid)];
  cutout(scene, ART.props.cooler, -3.25, 1.7, .66, { onLoad: () => cooler.forEach(o => { o.visible = false; }) });
  const tent = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.7, 4), mat(PAL.tent)); tent.position.set(6.5, .85, -.5); tent.rotation.y = Math.PI / 4; tent.scale.set(1, 1, .9); scene.add(tent);
  cutout(scene, ART.cutouts.tent, 6.5, -.5, 1.9, { onLoad: () => { tent.visible = false; } });
  const [fx, fz] = FIRE, stones = []; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; stones.push(box(scene, fx + Math.cos(a) * .55, .08, fz + Math.sin(a) * .55, .22, .16, .2, PAL.stone)); }
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

  // ground scatter (ART.scatter): nothing where it would hide the board, the chairs, the things by them, the rod's resting spot or the fire; only low things in front of
  // the chairs, where the floats must stay in sight; nothing out on the water. Mirrored, so both chairs get the same clearance.
  const keep = (x, z) => { const ax = Math.abs(x), by = (px, pz, r) => Math.hypot(ax - px, z - pz) < r;
    if (z < -5.3 || (ax < 1.15 && z > -2.5) || (ax < 1.1 && Math.abs(z) < 1.1) || (ax > .8 && ax < 2.2 && z > -1.1 && z < 1.5) || by(2.3, -.6, .5) || by(1.95, -1.3, .45) || by(1.95, -2.5, .45) || Math.hypot(x + 3.25, z - 1.7) < .6 || Math.hypot(x - fx, z - fz) < .9) return 0;
    return ax < 2.6 && z < -1.6 ? .3 : Infinity; };
  const scatter = buildScatter(scene, { trees: feet, keep, ring: { at: FIRE, r: .55, hide: stones } });

  /** cam: for the painted planes to face it; turn (0..1): how far the people have turned from the lake to the board. */
  W.update = (t, cam, turn = 0) => { W.animated.forEach(f => f(t)); W.lakeDrift.value.set(t * 4e-6, t * 1.5e-6, -t * 3e-6, t * 2.5e-6); WIND.value = W.water.wT.value = t / 1000 * (CALM ? .35 : 1);
    if (cam) { updateArt(cam); scatter(cam); peopleArt.forEach(f => f(cam, turn)); } };
  return W;
}
