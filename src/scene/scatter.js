import * as THREE from 'three';
import { ART } from '../assets/manifest.js';
import { loadTex, artMat, sway } from './art.js';

/* Ground scatter: painted rocks, pebbles and grass (ART.scatter) dotted where the ground needs breaking up: the bank's waterline and its grass seam, the path's
   sides and lake end, the feet of trees, forest strips, buildings, reeds and the jetty, and the campfire ring. Seeded, so the layout is the same every load.
   One instanced mesh per picture; every piece turns to face the camera (only when it moves), with its own height, mirroring and tint. Nothing shows without the art. */
const SIZE = { boulder: [.55, 1], rock: [.2, .38], pebble: [.06, .12], tuft: [.4, .85], clump: [.2, .36] }, LOW = { tuft: 'clump', boulder: 'rock', rock: 'pebble' };   // heights (m); what stands in where only low things fit
const PLANE = new THREE.PlaneGeometry(1, 1).translate(0, .5, 0);   // bottom-centre origin

/** trees: [x, z, height, cutout kind] feet to dress; keep(x, z) -> the tallest thing allowed there (0: nothing); ring: { at: [x, z], r, hide: meshes } for the fire's stones.
 *  Returns update(cam). */
export function buildScatter(scene, { trees = [], keep = () => Infinity, ring } = {}) {
  let sd = 20261; const r = () => (sd = sd * 16807 % 2147483647) / 2147483647, ra = (a, b) => a + r() * (b - a);
  const pick = w => { let u = r() * Object.values(w).reduce((a, b) => a + b, 0); for (const k in w) if ((u -= w[k]) < 0) return k; return Object.keys(w)[0]; };
  const P = [], put = (kind, x, z, o = {}) => { let cap = o.force ? Infinity : keep(x, z), h = o.h ?? ra(...SIZE[kind]) * (o.k ?? 1);
    while (h > cap && LOW[kind]) { kind = LOW[kind]; h = ra(...SIZE[kind]); } if (h > cap) h = cap; if (h < SIZE[kind][0] * .7) return;
    P.push({ kind, x, z, h, y: o.y ?? 0, shade: o.shade ?? 1, flip: r() < .5, tint: ra(-1, 1), lit: ra(.84, 1), pick: r() }); };
  const SHORE = { pebble: 4, rock: 2, clump: 2, tuft: 2.2, boulder: .5 }, SEAM = { clump: 3.5, tuft: 3, pebble: 2.5, rock: 1 }, EDGE = { clump: 3.5, tuft: 3.5, pebble: 2, rock: 1 };
  // the waterline (the bank's soft edge meets the water at about z -4.85) and the seam where the bank meets the grass (about z -2.9); boulders sit half sunk
  for (let x = -24; x < 24; x += Math.abs(x) < 9 ? ra(.5, 1) : ra(.8, 1.7)) { const k = pick(SHORE); put(k, x, -4.85 + ra(-.2, .25), k === 'boulder' ? { y: -.3 } : {}); }
  for (let x = -22; x < 22; x += Math.abs(x) < 9 ? ra(.6, 1.1) : ra(1.1, 2.2)) put(pick(SEAM), x, -2.9 + ra(-.35, .35));
  for (let i = 0; i < 14; i++) put(pick({ pebble: 5, clump: 2, rock: 1 }), ra(-14, 14), ra(-4.5, -3.2));   // across the bank itself
  for (let x = -1.5; x <= 1.5; x += ra(.22, .36)) put(r() < .7 ? 'clump' : 'pebble', x, -2.8 + ra(-.12, .12));   // the path's straight lake end
  for (let z = 2.8, s = 1; z < 20; z += ra(1, 1.8), s = -s) put(pick(EDGE), s * ra(1.15, 1.6), z);   // the path's sides, back into the trees
  trees.forEach(([x, z, h, k]) => { if (k === 'reeds') { put('clump', x + ra(-.2, .2), z + ra(0, .15), { k: .9, y: -.07, force: true }); return; }   // reeds stand in the water: a half-drowned clump hides their cut foot
    const far = Math.hypot(x, z); if (far > 26) return; for (let n = far < 9 ? 2 : 1; n--;) { const a = ra(0, 6.283), d = ra(.3, 1) * (.5 + h / 8); put(pick({ tuft: 3, clump: 2, rock: .7 }), x + Math.cos(a) * d, z + Math.sin(a) * d); } });
  const th = Math.acos(-6.6 / 21);   // the near forest strips' feet (radius 21 round z 1), a touch hazier
  for (let a = -th; a < th; a += ra(.17, .26)) { const R = 20.4 + ra(-.5, .2), x = R * Math.sin(a), z = 1 + R * Math.cos(a); if (Math.abs(x) > 2) put(pick({ tuft: 4, clump: 2, boulder: .6 }), x, z, { k: 2.2, shade: .9 }); }
  [[-13.5, -5.1, 'rock'], [-12.5, -4.7, 'clump'], [-13.9, -4.6, 'tuft'], [-12.4, -5, 'pebble', -.02], [-13.1, -4.4, 'pebble'], [-14.4, -5.2, 'boulder', -.25]].forEach(([x, z, k, y]) => put(k, x, z, { y }));   // the jetty's foot
  for (let i = 0; i < 8; i++) put(pick({ tuft: 3, clump: 3, rock: 1 }), -8.5 + ra(.1, .9), -.2 + ra(-2.9, 2.9));   // along the cabin's foot as the chairs see it
  for (let i = 0; i < 5; i++) { const a = ra(0, 6.283), d = ra(1.3, 1.9); put(pick({ tuft: 3, clump: 3, pebble: 1 }), 6.5 + Math.cos(a) * d, -.5 + Math.sin(a) * d); }   // round the tent
  put('clump', -3.85, 1.95); put('pebble', -2.75, 2.05);   // the cooler
  if (ring) { const [fx, fz] = ring.at; for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + ra(-.1, .1); put(i % 3 ? 'rock' : 'pebble', fx + Math.cos(a) * ring.r, fz + Math.sin(a) * ring.r, { force: true, k: i % 3 ? .75 : 1.8 }); }
    put('tuft', fx - 1.1, fz + .9); put('clump', fx + 1.2, fz + .4); }

  const meshes = []; let lx = NaN, ly = NaN, lz = NaN;
  const kinds = Object.keys(SIZE), texs = {};
  Promise.all(kinds.map(k => Promise.all((ART.scatter?.[k] || []).map(loadTex)).then(ts => { texs[k] = ts.filter(Boolean); }))).then(() => {
    const by = new Map(); P.forEach(p => { const ts = texs[p.kind]; if (!ts.length) return; const t = ts[Math.floor(p.pick * ts.length)]; by.has(t) || by.set(t, []); by.get(t).push(p); });
    if (ring && texs.rock.length) ring.hide.forEach(o => { o.visible = false; });
    for (const [t, ps] of by) { const m = new THREE.InstancedMesh(PLANE, artMat(t), ps.length), a = t.image.width / t.image.height, d = new Float32Array(ps.length * 5), c = new THREE.Color();
      if (ps[0].kind === 'tuft' || ps[0].kind === 'clump') sway(m.material, ps[0].kind === 'tuft' ? .06 : .035);
      ps.forEach((p, i) => { d.set([p.x, p.y, p.z, p.h * a * (p.flip ? -1 : 1), p.h], i * 5); m.setColorAt(i, c.setRGB(p.lit * p.shade * (1 + .04 * p.tint), p.lit * p.shade, p.lit * p.shade * (1 - .05 * p.tint))); });
      m.userData.d = d; m.frustumCulled = false; scene.add(m); meshes.push(m); }
    lx = NaN; });
  return cam => { const { x: cx, y: cy, z: cz } = cam.position; if (cx === lx && cy === ly && cz === lz) return; lx = cx; ly = cy; lz = cz;
    for (const m of meshes) { const d = m.userData.d, e = m.instanceMatrix.array;
      for (let i = 0, n = m.count; i < n; i++) { const o = i * 5, x = d[o], z = d[o + 2], w = d[o + 3], dx = cx - x, dz = cz - z, l = Math.hypot(dx, dz) || 1, s = dx / l, c = dz / l, k = i * 16;
        e[k] = c * w; e[k + 1] = 0; e[k + 2] = -s * w; e[k + 3] = 0; e[k + 4] = 0; e[k + 5] = d[o + 4]; e[k + 6] = 0; e[k + 7] = 0; e[k + 8] = s; e[k + 9] = 0; e[k + 10] = c; e[k + 11] = 0; e[k + 12] = x; e[k + 13] = d[o + 1]; e[k + 14] = z; e[k + 15] = 1; }
      m.instanceMatrix.needsUpdate = true; } };
}
