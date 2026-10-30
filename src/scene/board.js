import * as THREE from 'three';
import { PAL } from './palette.js';
import { mat, BOARD_Y } from './world.js';

export const Q = 0.13;
const FILES = 'abcdefgh';
let SIDE = 1;   // 1 = Liam sits at -x and plays black, -1 = Xiao sits at +x and plays black
// Ranks run along x so the player's pieces sit in front of them and the friend's pieces sit in front of the friend.
export const sqXZ = (f, r) => ({ x: SIDE * (3.5 - r) * Q, z: SIDE * (3.5 - f) * Q });
const PROFILES = {   // lathe profiles [radius, height], metres
  p: [[.045, 0], [.045, .012], [.026, .03], [.02, .05], [.03, .06], [.03, .075], [.014, .082]],
  r: [[.05, 0], [.05, .014], [.034, .03], [.034, .075], [.05, .09], [.05, .11]],
  n: [[.05, 0], [.05, .014], [.03, .03], [.026, .07], [.04, .1], [.02, .12]],
  b: [[.05, 0], [.05, .014], [.03, .03], [.022, .08], [.036, .11], [.012, .14]],
  q: [[.055, 0], [.055, .014], [.034, .03], [.026, .09], [.05, .13], [.02, .155]],
  k: [[.055, 0], [.055, .014], [.036, .03], [.03, .1], [.05, .135], [.02, .17]],
};
const geoCache = {};
// the knight gets a real horse head: a side profile extruded and set on a short lathe base, muzzle pointing +x
function knightHead() {
  const s = new THREE.Shape();
  s.moveTo(-.03, 0); s.lineTo(.034, 0); s.quadraticCurveTo(.03, .03, .05, .055); s.quadraticCurveTo(.062, .07, .052, .08);
  s.lineTo(.02, .088); s.lineTo(.014, .108); s.lineTo(.002, .094); s.quadraticCurveTo(-.03, .09, -.038, .05); s.quadraticCurveTo(-.04, .02, -.03, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: .036, bevelEnabled: true, bevelThickness: .006, bevelSize: .005, bevelSegments: 2, curveSegments: 6 });
  g.translate(0, .034, -.018); return g;
}
function pieceMesh(type, color) {
  const m = mat(color === 'w' ? PAL.pieceW : PAL.pieceB, { side: THREE.DoubleSide });
  if (type === 'n') {
    if (!geoCache.nb) geoCache.nb = new THREE.LatheGeometry([[0, 0], [.05, 0], [.05, .014], [.034, .03], [.03, .04], [0, .04]].map(p => new THREE.Vector2(p[0], p[1])), 10);
    if (!geoCache.nh) geoCache.nh = knightHead();
    const g = new THREE.Group(); g.add(new THREE.Mesh(geoCache.nb, m), new THREE.Mesh(geoCache.nh, m)); return g;
  }
  if (!geoCache[type]) geoCache[type] = new THREE.LatheGeometry([[0, 0], ...PROFILES[type], [0, PROFILES[type].at(-1)[1]]].map(p => new THREE.Vector2(p[0], p[1])), 10);
  return new THREE.Mesh(geoCache[type], m);
}

/** The board on the stump: clickable squares (invisible planes), highlights, and piece meshes. */
export function buildBoard(scene) {
  const group = new THREE.Group(); group.position.y = BOARD_Y; scene.add(group);
  const squares = [], pieces = new THREE.Group(); group.add(pieces);
  const hl = new THREE.Group(); group.add(hl);
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(Q, Q), mat((f + r) % 2 ? PAL.boardLight : PAL.boardDark));
    m.rotation.x = -Math.PI / 2; m.userData = { sq: FILES[f] + (r + 1), f, r }; group.add(m); squares.push(m);
  }
  const layout = () => squares.forEach(m => { const p = sqXZ(m.userData.f, m.userData.r); m.position.set(p.x, .002, p.z); });
  layout();
  const ringGeo = new THREE.RingGeometry(.02, .032, 16), fillGeo = new THREE.PlaneGeometry(Q * .98, Q * .98);
  function mark(sq, color, opacity, ring) {
    const f = FILES.indexOf(sq[0]), r = +sq[1] - 1, p = sqXZ(f, r);
    const m = new THREE.Mesh(ring ? ringGeo : fillGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(p.x, .003, p.z); hl.add(m);
  }
  const xz = sq => sqXZ(FILES.indexOf(sq[0]), +sq[1] - 1);
  let anims = [], live = new Map(), hint = [];   // anims: [{to, from:{x,z}, t0, d}], live: square -> mesh
  const hintMat = new THREE.MeshBasicMaterial({ color: 0xffb93a, transparent: true, opacity: .6, depthWrite: false });
  const hintRing = new THREE.RingGeometry(Q * .36, Q * .47, 24);
  return {
    group, squares,
    setSide(s) { SIDE = s; layout(); },
    /** Slide a piece that has just moved (call before setPosition). Castling passes the rook too. */
    animate(moves) { const now = performance.now(); anims = moves.map(m => ({ to: m.to, from: xz(m.from), t0: now, d: 380 })); },
    /** The friend's suggestion: a soft glowing guide on two squares, cleared by setHint(null). */
    setHint(h) { hint = h ? [h.from, h.to] : []; },
    setPosition(game, state) {
      pieces.clear(); hl.clear(); live.clear();
      if (state.lastMove) { mark(state.lastMove.from, 0xe8c24e, .45); mark(state.lastMove.to, 0xe8c24e, .55); }
      if (state.selected) mark(state.selected, 0xf2e04a, .6);
      if (state.hover) mark(state.hover, 0xfff6c8, .35);
      (state.legal || []).forEach(sq => mark(sq, game.get(sq) ? 0xd9573b : 0x4e9b63, .85, true));
      hint.forEach((sq, i) => { const p = xz(sq), m = new THREE.Mesh(i ? hintRing : fillGeo, hintMat); m.rotation.x = -Math.PI / 2; m.position.set(p.x, .004, p.z); hl.add(m); });   // glow on the piece, ring where it goes
      for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
        const sq = FILES[f] + (r + 1), pc = game.get(sq); if (!pc) continue;
        const m = pieceMesh(pc.type, pc.color), p = sqXZ(f, r); m.position.set(p.x, 0, p.z);
        // knights look toward the other side: white heads for lower x when SIDE is 1
        if (pc.type === 'n') m.rotation.y = (pc.color === 'w') === (SIDE === 1) ? Math.PI : 0;
        pieces.add(m); live.set(sq, m);
      }
      this.update(performance.now());
    },
    /** Per frame: piece hops and the pulsing hint. */
    update(now) {
      hintMat.opacity = .62 + .28 * Math.sin(now / 260);
      anims = anims.filter(a => {
        const m = live.get(a.to), p = Math.min(1, (now - a.t0) / a.d); if (!m) return p < 1;
        const e = p * p * (3 - 2 * p), to = xz(a.to);
        m.position.set(a.from.x + (to.x - a.from.x) * e, Math.sin(Math.PI * p) * .05, a.from.z + (to.z - a.from.z) * e);
        return p < 1;
      });
    },
  };
}
