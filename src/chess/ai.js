/* The friend's chess brain: a small alpha-beta search with a hand-tuned evaluation, played through a "person" filter.
   level (0..1) sets search depth and how often they pick a weaker move; style gives each friend their own taste.
   Works on raw engine states (see engine.js), so it never touches the live game. */
import { applyMove, attacked, pseudo, kingSq, posKey } from './engine.js';

const V = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
const MATE = 100000;
const lerp = (a, b, t) => a + (b - a) * t;

/** Xiao: careful, central, keeps his king safe, trades down when ahead. Liam: pushes at your king, loves a check. */
export const STYLES = {
  xiao: { center: 1.2, advance: .35, kingSafety: 1.4, trade: 1, check: 0, capture: 0, temp: .8 },
  liam: { center: .8, advance: 1.4, kingSafety: .6, trade: 0, check: 35, capture: 18, temp: 1.25 },
  coach: { center: 1, advance: .6, kingSafety: 1, trade: .5, check: 0, capture: 0, temp: 1 },
};

/** Static evaluation from white's point of view, in centipawns. */
function evaluate(st, S) {
  const b = st.b; let score = 0, mat = 0, pieces = 0, queens = 0;
  const kw = kingSq(b, 'w'), kb = kingSq(b, 'b');
  for (let i = 0; i < 64; i++) {
    const p = b[i]; if (!p) continue;
    const c = p[0], t = p[1], sgn = c === 'w' ? 1 : -1, f = i & 7, r = i >> 3, rel = c === 'w' ? r : 7 - r;
    let v = V[t];
    if (t !== 'k' && t !== 'p') pieces++;
    if (t === 'q') queens++;
    const cd = Math.abs(3.5 - f) + Math.abs(3.5 - r);                 // 1 (centre) .. 7 (corner)
    if (t === 'p') v += rel * rel * 2 + (f > 1 && f < 6 ? rel * 3 : 0) * S.center;
    else if (t === 'n' || t === 'b') v += (6 - cd) * 6 * S.center - (rel === 0 ? 12 : 0);
    else if (t === 'q' || t === 'r') v += (rel >= 5 ? 10 : 0);
    if (t !== 'k' && t !== 'p' && S.advance) {                          // pressure near the enemy king
      const ek = c === 'w' ? kb : kw;
      if (ek >= 0) v += Math.max(0, 5 - Math.max(Math.abs((ek & 7) - f), Math.abs((ek >> 3) - r))) * 5 * S.advance;
    }
    score += sgn * v; mat += sgn * V[t];
  }
  // king safety while there are queens about: stay home, behind pawns
  if (queens) [['w', kw], ['b', kb]].forEach(([c, k]) => {
    if (k < 0) return; const rel = c === 'w' ? k >> 3 : 7 - (k >> 3), sgn = c === 'w' ? 1 : -1;
    let shield = 0; const fwd = c === 'w' ? 8 : -8;
    for (let d = -1; d <= 1; d++) { const s = k + fwd + d; if (s >= 0 && s < 64 && Math.abs(((s & 7) - (k & 7))) <= 1 && b[s] === c + 'p') shield++; }
    score += sgn * (shield * 12 - rel * 18) * S.kingSafety;
  });
  // trading down when ahead: fewer pieces left makes a lead count more
  if (S.trade && Math.abs(mat) > 150) score += Math.sign(mat) * (14 - pieces) * 6 * S.trade;
  // mop-up: when well ahead in an endgame, herd the other king to the edge and walk yours over to help
  if (pieces <= 6 && Math.abs(mat) > 250 && kw >= 0 && kb >= 0) {
    const lose = mat > 0 ? kb : kw, kd = Math.max(Math.abs((kw & 7) - (kb & 7)), Math.abs((kw >> 3) - (kb >> 3)));
    score += Math.sign(mat) * ((Math.abs(3.5 - (lose & 7)) + Math.abs(3.5 - (lose >> 3))) * 14 + (7 - kd) * 6);
  }
  return score;
}

function order(st, moves) {
  return moves.map(m => ({ m, o: m.cap ? V[m.cap[1]] * 10 - V[m.p[1]] : m.promo ? 800 : 0 })).sort((a, b) => b.o - a.o).map(x => x.m);
}
const legalAfter = (st, n) => !attacked(n.b, kingSq(n.b, st.t), n.t);

export function createSearch(style, budget = 70000) {
  const S = STYLES[style] || STYLES.coach; let nodes = 0;
  function quiesce(st, alpha, beta, qd) {
    nodes++;
    const stand = (st.t === 'w' ? 1 : -1) * evaluate(st, S);
    if (stand >= beta) return beta; if (stand > alpha) alpha = stand;
    if (qd <= 0) return alpha;
    for (const m of order(st, pseudo(st).filter(m => m.cap || m.promo === 'q'))) {
      const n = applyMove(st, m); if (!legalAfter(st, n)) continue;
      const s = -quiesce(n, -beta, -alpha, qd - 1);
      if (s >= beta) return beta; if (s > alpha) alpha = s;
    }
    return alpha;
  }
  function search(st, depth, alpha, beta, ply) {
    if (nodes > budget) return (st.t === 'w' ? 1 : -1) * evaluate(st, S);
    if (st.half >= 100) return 0;
    if (depth <= 0) return quiesce(st, alpha, beta, 4);
    nodes++; let any = false;
    for (const m of order(st, pseudo(st))) {
      const n = applyMove(st, m); if (!legalAfter(st, n)) continue; any = true;
      const s = -search(n, depth - 1, -beta, -alpha, ply + 1);
      if (s >= beta) return beta; if (s > alpha) alpha = s;
    }
    if (!any) return attacked(st.b, kingSq(st.b, st.t), st.t === 'w' ? 'b' : 'w') ? -MATE + ply : 0;
    return alpha;
  }
  /** Score every legal root move (from the mover's view). Iterative deepening keeps the last finished depth. */
  function scoreRoot(st, depth, seen) {
    const root = order(st, pseudo(st)).map(m => ({ m, n: applyMove(st, m) })).filter(x => legalAfter(st, x.n));
    let done = root.map(x => ({ m: x.m, s: 0 }));
    nodes = 0;
    for (let d = 1; d <= depth; d++) {
      const out = []; let best = -Infinity;
      for (const x of root) {
        // repeating a position the game has already seen is scored as a draw, so nobody shuffles forever
        let s = seen && seen.has(posKey(x.n)) ? 0 : -search(x.n, d - 1, -MATE, -(best - 400), 1);
        if (s > best) best = s;
        out.push({ m: x.m, s });
      }
      if (nodes > budget && d > 1) break;
      done = out;
    }
    return done;
  }
  return { scoreRoot, evaluate: st => evaluate(st, S) };
}

/** Choose a move like a person of a given level would. Returns an engine move ({f,t,p,cap,promo,flag}). */
export function chooseMove(st, { style = 'coach', level = .5, ease = 0, keys = null } = {}) {
  const S = STYLES[style] || STYLES.coach, few = st.b.filter(p => p && p[1] !== 'p' && p[1] !== 'k').length <= 4;
  const depth = (level < .3 ? 1 : level < .72 ? 2 : 3) + (few ? 1 : 0);   // endgames are cheap, and mates need the extra ply
  const seen = keys ? new Set(keys.slice(0, -1)) : null;
  const scored = createSearch(style).scoreRoot(st, depth, seen);
  if (!scored.length) return null;
  scored.forEach(x => { if (x.m.cap) x.s += S.capture; if (S.check) { const n = applyMove(st, x.m); if (attacked(n.b, kingSq(n.b, n.t), st.t)) x.s += S.check; } });
  // temperature in centipawns: low level = loose and generous, high level = sharp. `ease` (0..1) softens on purpose.
  const T = lerp(230, 12, level) * S.temp * (1 + ease * 2.5);
  const top = Math.max(...scored.map(x => x.s));
  const w = scored.map(x => Math.exp(Math.max(-40, (x.s - top) / T)));
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < scored.length; i++) { r -= w[i]; if (r <= 0) return scored[i].m; }
  return scored[0].m;
}

/** The best move for whoever is to move, for hints. */
export function bestMove(st, keys) {
  const seen = keys ? new Set(keys.slice(0, -1)) : null;
  const scored = createSearch('coach', 90000).scoreRoot(st, 3, seen);
  return scored.reduce((a, b) => (b.s > a.s ? b : a), scored[0])?.m || null;
}

/** Material balance from white's point of view (pawns = 100). */
export function material(st) { let m = 0; st.b.forEach(p => { if (p) m += (p[0] === 'w' ? 1 : -1) * V[p[1]]; }); return m; }
