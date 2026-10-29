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
function pieceMesh(type, color) {
  if (!geoCache[type]) geoCache[type] = new THREE.LatheGeometry([[0, 0], ...PROFILES[type], [0, PROFILES[type].at(-1)[1]]].map(p => new THREE.Vector2(p[0], p[1])), 10);
  return new THREE.Mesh(geoCache[type], mat(color === 'w' ? PAL.pieceW : PAL.pieceB, { side: THREE.DoubleSide }));
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
  return {
    group, squares,
    setSide(s) { SIDE = s; layout(); },
    setPosition(game, state) {
      pieces.clear(); hl.clear();
      if (state.lastMove) { mark(state.lastMove.from, 0xe8c24e, .45); mark(state.lastMove.to, 0xe8c24e, .55); }
      if (state.selected) mark(state.selected, 0xf2e04a, .6);
      if (state.hover) mark(state.hover, 0xfff6c8, .35);
      (state.legal || []).forEach(sq => mark(sq, game.get(sq) ? 0xd9573b : 0x4e9b63, .85, true));
      for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
        const sq = FILES[f] + (r + 1), pc = game.get(sq); if (!pc) continue;
        const m = pieceMesh(pc.type, pc.color), p = sqXZ(f, r); m.position.set(p.x, 0, p.z);
        if (pc.type === 'n') m.rotation.y = pc.color === 'w' ? 0 : Math.PI;
        pieces.add(m);
      }
    },
  };
}
