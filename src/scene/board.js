import * as THREE from 'three';
import { ART } from '../assets/manifest.js';
import { loadTex, artMat, PLANE, billboard } from './art.js';
import { BOARD_Y } from './world.js';

export const Q = 0.13;
const FILES = 'abcdefgh', FRAME = .05, TOT = 8 * Q + 2 * FRAME;
let SIDE = 1;   // 1 = Liam sits at -x and plays black, -1 = Xiao sits at +x and plays black
// Ranks run along x so the player's pieces sit in front of them and the friend's pieces sit in front of the friend.
export const sqXZ = (f, r) => ({ x: SIDE * (3.5 - r) * Q, z: SIDE * (3.5 - f) * Q });
const HGT = { p: .13, n: .17, b: .19, r: .16, q: .21, k: .23 };   // card heights, metres

/* The set is flat and painted: a board texture on one plane, and each piece a standing card that faces the camera (leaning back a little so it reads from above).
   Both are drawn in code (soft washes, paper grain) unless ART.board names a painted file. */
const seeded = s => () => (s = s * 16807 % 2147483647) / 2147483647;
function paintBoard() {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), r = seeded(11), B = Math.round(S * FRAME / TOT), sq = (S - 2 * B) / 8;
  x.fillStyle = '#a6794e'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 120; i++) { x.fillStyle = r() < .5 ? `rgba(70,44,26,${.04 + r() * .06})` : `rgba(230,190,140,${.05 + r() * .07})`; x.fillRect(0, r() * S, S, 1 + r() * 3); }
  for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
    const light = (col + row) % 2 === 1, px = B + col * sq, py = B + row * sq;
    x.fillStyle = light ? '#ecd9ae' : '#94653f'; x.fillRect(px, py, sq, sq);
    for (let k = 0; k < 3; k++) { const bx = px + r() * sq, by = py + r() * sq, g = x.createRadialGradient(bx, by, 0, bx, by, sq * (.35 + r() * .35)), tone = light ? (r() < .5 ? '255,248,225' : '205,170,115') : (r() < .5 ? '120,78,48' : '70,44,28');
      g.addColorStop(0, `rgba(${tone},${.14 + r() * .14})`); g.addColorStop(1, `rgba(${tone},0)`); x.fillStyle = g; x.fillRect(px, py, sq, sq); }
    x.strokeStyle = light ? 'rgba(150,110,70,.16)' : 'rgba(40,24,14,.2)'; x.lineWidth = 4; x.strokeRect(px + 2, py + 2, sq - 4, sq - 4);
  }
  x.strokeStyle = 'rgba(60,38,24,.55)'; x.lineWidth = 5; x.strokeRect(B - 2, B - 2, S - 2 * B + 4, S - 2 * B + 4);
  x.strokeStyle = 'rgba(50,30,18,.5)'; x.lineWidth = 8; x.strokeRect(4, 4, S - 8, S - 8);
  for (let i = 0; i < 7000; i++) { x.fillStyle = r() < .5 ? 'rgba(255,255,255,.07)' : 'rgba(40,25,15,.06)'; x.fillRect(r() * S, r() * S, 1 + r() * 2, 1 + r() * 2); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

const rr = (c, x, y, w, h, r) => { c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
const el = (c, x, y, rx, ry) => { c.moveTo(x + rx, y); c.ellipse(x, y, rx, ry, 0, 0, 6.283); };
const body = (c, top) => { c.moveTo(38, top); c.bezierCurveTo(42, top + 32, 32, top + 48, 28, 126); c.lineTo(72, 126); c.bezierCurveTo(68, top + 48, 58, top + 32, 62, top); c.closePath(); };
const PARTS = {   // silhouettes in a 100 x 150 box (y down, the base sits at y 142); the knight faces left
  p: [c => el(c, 50, 44, 14, 14), c => el(c, 50, 62, 17, 5), c => body(c, 64)],
  r: [c => rr(c, 29, 22, 12, 18, 2), c => rr(c, 44, 22, 12, 18, 2), c => rr(c, 59, 22, 12, 18, 2), c => rr(c, 27, 36, 46, 12, 3), c => { c.moveTo(34, 46); c.lineTo(30, 126); c.lineTo(70, 126); c.lineTo(66, 46); c.closePath(); }, c => rr(c, 28, 100, 44, 10, 3)],
  n: [c => { c.moveTo(28, 126); c.bezierCurveTo(28, 104, 36, 88, 44, 76); c.bezierCurveTo(34, 74, 24, 78, 18, 88); c.bezierCurveTo(14, 80, 22, 62, 36, 52); c.lineTo(38, 34); c.lineTo(46, 44); c.bezierCurveTo(60, 42, 76, 54, 78, 78); c.bezierCurveTo(80, 100, 74, 112, 74, 126); c.closePath(); }],
  b: [c => el(c, 50, 48, 13, 20), c => el(c, 50, 24, 5, 5), c => el(c, 50, 72, 17, 4.5), c => body(c, 74)],
  q: [c => { c.moveTo(32, 56); c.lineTo(28, 30); c.lineTo(41, 44); c.lineTo(50, 24); c.lineTo(59, 44); c.lineTo(72, 30); c.lineTo(68, 56); c.closePath(); }, c => el(c, 28, 28, 4.5, 4.5), c => el(c, 50, 21, 5, 5), c => el(c, 72, 28, 4.5, 4.5), c => el(c, 50, 66, 19, 5), c => body(c, 62)],
  k: [c => rr(c, 46, 4, 8, 30, 2), c => rr(c, 37, 13, 26, 8, 2), c => rr(c, 35, 34, 30, 16, 6), c => el(c, 50, 60, 19, 5), c => body(c, 62)],
};
const BASE = [c => rr(c, 20, 126, 60, 16, 7), c => el(c, 50, 124, 26, 5)];
function drawPiece(type, color) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 192; const x = c.getContext('2d'), dk = color === 'b', parts = [...PARTS[type], ...BASE], r = seeded(type.charCodeAt(0) * 7 + (dk ? 3 : 1));
  x.scale(1.28, 1.28); x.lineJoin = 'round';
  x.shadowColor = dk ? 'rgba(20,10,6,.55)' : 'rgba(90,58,32,.5)'; x.shadowBlur = 4; x.lineWidth = 3.5; x.strokeStyle = x.fillStyle = dk ? '#2a1a12' : '#9a7a52';
  parts.forEach(p => { x.beginPath(); p(x); x.stroke(); x.fill(); });
  x.shadowBlur = 0;
  const g = x.createLinearGradient(22, 0, 78, 0), tones = dk ? ['#8a6248', '#5f4130', '#3a261b'] : ['#fcf3da', '#ecd9ae', '#c8ae7e']; g.addColorStop(0, tones[0]); g.addColorStop(.5, tones[1]); g.addColorStop(1, tones[2]);
  x.fillStyle = g; parts.forEach(p => { x.beginPath(); p(x); x.fill(); });
  x.strokeStyle = dk ? 'rgba(0,0,0,.28)' : 'rgba(90,60,30,.22)'; x.lineWidth = 1.1; parts.forEach(p => { x.beginPath(); p(x); x.stroke(); });
  x.globalCompositeOperation = 'source-atop';
  const sh = x.createLinearGradient(0, 70, 0, 142); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, dk ? 'rgba(0,0,0,.3)' : 'rgba(110,70,30,.28)'); x.fillStyle = sh; x.fillRect(0, 0, 100, 150);
  x.strokeStyle = dk ? 'rgba(255,225,190,.2)' : 'rgba(255,255,255,.5)'; x.lineWidth = 5; x.lineCap = 'round'; x.beginPath(); x.moveTo(40, 70); x.quadraticCurveTo(36, 100, 34, 120); x.stroke();
  x.fillStyle = dk ? '#f2e0c4' : '#3a2616'; x.strokeStyle = x.fillStyle;
  if (type === 'n') { x.beginPath(); x.arc(40, 58, 2.2, 0, 6.283); x.fill(); } else if (type === 'b') { x.lineWidth = 2; x.beginPath(); x.moveTo(45, 38); x.lineTo(56, 52); x.stroke(); }
  for (let i = 0; i < 700; i++) { x.fillStyle = r() < .5 ? 'rgba(255,255,255,.1)' : 'rgba(30,18,10,.08)'; x.fillRect(r() * 100, r() * 150, .6 + r(), .6 + r()); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const MOPT = { transparent: true, alphaTest: .02, depthWrite: false }, pieceCache = {}; let artSeen = 0;
function pieceArt(color, type) {
  const k = color + type; if (pieceCache[k]) return pieceCache[k];
  const e = pieceCache[k] = { a: 128 / 192, mat: artMat(drawPiece(type, color), MOPT) };
  loadTex(ART.board.pieces[color][type]).then(t => { if (!t) return; e.mat = artMat(t, MOPT); e.a = t.image.width / t.image.height; artSeen++; });
  return e;
}
function pieceCard(type, color, sq, flip) {
  const e = pieceArt(color, type), h = HGT[type], w = h * e.a, pivot = new THREE.Group(), m = new THREE.Mesh(PLANE, e.mat);
  m.scale.set(flip ? -w : w, h, 1); m.position.set(flip ? w / 2 : -w / 2, -h * .06, 0); m.renderOrder = 2; m.userData.sq = sq; pivot.add(m); billboard(pivot); return pivot;
}

/** The board on the stump: a painted board plane, invisible clickable squares, highlights, and standing piece cards. */
export function buildBoard(scene) {
  const group = new THREE.Group(); group.position.y = BOARD_Y; scene.add(group);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(TOT, TOT), artMat(paintBoard(), { alphaTest: 0 })); top.rotation.x = -Math.PI / 2; top.position.y = .001; group.add(top);
  loadTex(ART.board.top).then(t => { if (t) top.material = artMat(t, { alphaTest: 0 }); });
  const squares = [], pieces = new THREE.Group(); group.add(pieces);
  const hl = new THREE.Group(); group.add(hl);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false }), hitGeo = new THREE.PlaneGeometry(Q, Q);
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
    const m = new THREE.Mesh(hitGeo, hitMat);   // raycasts ignore visibility: these are the click targets
    m.rotation.x = -Math.PI / 2; m.userData = { sq: FILES[f] + (r + 1), f, r }; group.add(m); squares.push(m);
  }
  const layout = () => squares.forEach(m => { const p = sqXZ(m.userData.f, m.userData.r); m.position.set(p.x, .002, p.z); });
  layout();
  const ringGeo = new THREE.RingGeometry(.02, .032, 16), fillGeo = new THREE.PlaneGeometry(Q * .98, Q * .98);
  function mark(sq, color, opacity, ring) {
    const f = FILES.indexOf(sq[0]), r = +sq[1] - 1, p = sqXZ(f, r);
    const m = new THREE.Mesh(ring ? ringGeo : fillGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(p.x, .003, p.z); m.renderOrder = 1; hl.add(m);
  }
  const xz = sq => sqXZ(FILES.indexOf(sq[0]), +sq[1] - 1);
  let anims = [], live = new Map(), hint = [], last = null, seen = artSeen, eye = null;   // anims: [{to, from:{x,z}, t0, d}], live: square -> piece card, last: the arguments of the latest setPosition
  const hintMat = new THREE.MeshBasicMaterial({ color: 0xffb93a, transparent: true, opacity: .6, depthWrite: false });
  const hintRing = new THREE.RingGeometry(Q * .36, Q * .47, 24);
  return {
    group, squares,
    setSide(s) { SIDE = s; layout(); },
    /** The square under a ray: a piece card first (its body, not the empty corners of the card), else the square itself. */
    pick(ray, legal) {
      const hits = ray.intersectObjects(pieces.children.map(p => p.children[0]), false).filter(h => h.uv && h.uv.y < .75 && Math.abs(h.uv.x - .5) < .42), h = ray.intersectObjects(squares, false)[0], sq = h ? h.object.userData.sq : null;
      if (hits.length) { const ps = hits[0].object.userData.sq; return legal && sq && legal.includes(sq) && !legal.includes(ps) ? sq : ps; }
      return sq;
    },
    /** Slide a piece that has just moved (call before setPosition). Castling passes the rook too. */
    animate(moves) { const now = performance.now(); anims = moves.map(m => ({ to: m.to, from: xz(m.from), t0: now, d: 380 })); },
    /** The friend's suggestion: a soft glowing guide on two squares, cleared by setHint(null). */
    setHint(h) { hint = h ? [h.from, h.to] : []; },
    setPosition(game, state) {
      last = [game, state]; pieces.clear(); hl.clear(); live.clear(); seen = artSeen;
      if (state.lastMove) { mark(state.lastMove.from, 0xe8c24e, .45); mark(state.lastMove.to, 0xe8c24e, .55); }
      if (state.selected) mark(state.selected, 0xf2e04a, .6);
      if (state.hover) mark(state.hover, 0xfff6c8, .35);
      (state.legal || []).forEach(sq => mark(sq, game.get(sq) ? 0xd9573b : 0x4e9b63, .85, true));
      hint.forEach((sq, i) => { const p = xz(sq), m = new THREE.Mesh(i ? hintRing : fillGeo, hintMat); m.rotation.x = -Math.PI / 2; m.position.set(p.x, .004, p.z); m.renderOrder = 1; hl.add(m); });   // glow on the piece, ring where it goes
      for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
        const sq = FILES[f] + (r + 1), pc = game.get(sq); if (!pc) continue;
        const m = pieceCard(pc.type, pc.color, sq, pc.type === 'n' && (pc.color === 'w') === (SIDE === 1)), p = sqXZ(f, r); m.position.set(p.x, .004, p.z);   // knights look toward the other side
        pieces.add(m); live.set(sq, m);
      }
      this.update(performance.now());
    },
    /** Per frame: piece hops, the pulsing hint, and each card reclining back to face the camera (so it reads from steeply above too). */
    update(now, cam) {
      if (cam) eye = cam.position; if (eye) pieces.children.forEach(p => { p.children[0].rotation.x = -Math.min(1.25, Math.atan2(eye.y - BOARD_Y - .08, Math.hypot(eye.x - p.position.x, eye.z - p.position.z))) * .9; });
      if (seen !== artSeen && last) this.setPosition(...last);
      hintMat.opacity = .62 + .28 * Math.sin(now / 260);
      anims = anims.filter(a => {
        const m = live.get(a.to), p = Math.min(1, (now - a.t0) / a.d); if (!m) return p < 1;
        const e = p * p * (3 - 2 * p), to = xz(a.to);
        m.position.set(a.from.x + (to.x - a.from.x) * e, .004 + Math.sin(Math.PI * p) * .05, a.from.z + (to.z - a.from.z) * e);
        return p < 1;
      });
    },
  };
}
