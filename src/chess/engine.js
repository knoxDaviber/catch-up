  /* ---------- Chess rules, self-contained. Board is 64 squares, index = rank * 8 + file, a1 = 0. ---------- */
  var KN = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
  var KG = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  var RK = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  var BI = [[1, 1], [-1, 1], [-1, -1], [1, -1]];

  function other(c) { return c === 'w' ? 'b' : 'w'; }

  function initialState() {
    var b = [], i, back = 'rnbqkbnr';
    for (i = 0; i < 64; i++) b.push(null);
    for (i = 0; i < 8; i++) { b[i] = 'w' + back.charAt(i); b[8 + i] = 'wp'; b[48 + i] = 'bp'; b[56 + i] = 'b' + back.charAt(i); }
    return { b: b, t: 'w', c: { wK: true, wQ: true, bK: true, bQ: true }, ep: -1, half: 0 };
  }

  function attacked(b, sq, by) {
    var f = sq & 7, r = sq >> 3, i, tf, tr, p, d, k;
    var pr = by === 'w' ? r - 1 : r + 1;
    if (pr >= 0 && pr < 8) for (d = -1; d <= 1; d += 2) {
      tf = f + d;
      if (tf >= 0 && tf < 8 && b[pr * 8 + tf] === by + 'p') return true;
    }
    for (i = 0; i < 8; i++) {
      tf = f + KN[i][0]; tr = r + KN[i][1];
      if (tf >= 0 && tf < 8 && tr >= 0 && tr < 8 && b[tr * 8 + tf] === by + 'n') return true;
      tf = f + KG[i][0]; tr = r + KG[i][1];
      if (tf >= 0 && tf < 8 && tr >= 0 && tr < 8 && b[tr * 8 + tf] === by + 'k') return true;
    }
    for (i = 0; i < 4; i++) {
      for (k = 0; k < 2; k++) {
        var dir = k === 0 ? RK[i] : BI[i], ok = k === 0 ? 'r' : 'b';
        tf = f + dir[0]; tr = r + dir[1];
        while (tf >= 0 && tf < 8 && tr >= 0 && tr < 8) {
          p = b[tr * 8 + tf];
          if (p) { if (p.charAt(0) === by && (p.charAt(1) === ok || p.charAt(1) === 'q')) return true; break; }
          tf += dir[0]; tr += dir[1];
        }
      }
    }
    return false;
  }

  function kingSq(b, c) { for (var i = 0; i < 64; i++) if (b[i] === c + 'k') return i; return -1; }
  function inCheckState(st) { return attacked(st.b, kingSq(st.b, st.t), other(st.t)); }

  function pseudo(st) {
    var b = st.b, c = st.t, out = [], i, p, f, r, ty, d, tf, tr, t, j, k, dir, q;
    var fwd = c === 'w' ? 1 : -1, startR = c === 'w' ? 1 : 6, promoR = c === 'w' ? 7 : 0;
    function addPawn(from, to, cap) {
      if (to >> 3 === promoR) { ['q', 'r', 'b', 'n'].forEach(function (pp) { out.push({ f: from, t: to, p: b[from], cap: cap, promo: pp, flag: null }); }); }
      else out.push({ f: from, t: to, p: b[from], cap: cap, promo: null, flag: null });
    }
    for (i = 0; i < 64; i++) {
      p = b[i];
      if (!p || p.charAt(0) !== c) continue;
      f = i & 7; r = i >> 3; ty = p.charAt(1);
      if (ty === 'p') {
        tr = r + fwd;
        if (tr < 0 || tr > 7) continue;
        t = tr * 8 + f;
        if (!b[t]) {
          addPawn(i, t, null);
          if (r === startR && !b[t + fwd * 8]) out.push({ f: i, t: t + fwd * 8, p: p, cap: null, promo: null, flag: 'dbl' });
        }
        for (d = -1; d <= 1; d += 2) {
          tf = f + d;
          if (tf < 0 || tf > 7) continue;
          t = tr * 8 + tf;
          if (b[t] && b[t].charAt(0) !== c) addPawn(i, t, b[t]);
          else if (t === st.ep) out.push({ f: i, t: t, p: p, cap: other(c) + 'p', promo: null, flag: 'ep' });
        }
      } else if (ty === 'n' || ty === 'k') {
        var offs = ty === 'n' ? KN : KG;
        for (j = 0; j < 8; j++) {
          tf = f + offs[j][0]; tr = r + offs[j][1];
          if (tf < 0 || tf > 7 || tr < 0 || tr > 7) continue;
          t = tr * 8 + tf; q = b[t];
          if (!q || q.charAt(0) !== c) out.push({ f: i, t: t, p: p, cap: q, promo: null, flag: null });
        }
      } else {
        for (j = 0; j < 8; j++) {
          dir = j < 4 ? RK[j] : BI[j - 4];
          if (ty === 'r' && j >= 4) continue;
          if (ty === 'b' && j < 4) continue;
          tf = f + dir[0]; tr = r + dir[1];
          while (tf >= 0 && tf < 8 && tr >= 0 && tr < 8) {
            t = tr * 8 + tf; q = b[t];
            if (!q) out.push({ f: i, t: t, p: p, cap: null, promo: null, flag: null });
            else { if (q.charAt(0) !== c) out.push({ f: i, t: t, p: p, cap: q, promo: null, flag: null }); break; }
            tf += dir[0]; tr += dir[1];
          }
        }
      }
    }
    /* castling: rights, empty squares between, and no check on the king's path */
    var base = c === 'w' ? 0 : 56, foe = other(c);
    if (b[base + 4] === c + 'k' && !attacked(b, base + 4, foe)) {
      if (st.c[c + 'K'] && b[base + 7] === c + 'r' && !b[base + 5] && !b[base + 6] && !attacked(b, base + 5, foe) && !attacked(b, base + 6, foe))
        out.push({ f: base + 4, t: base + 6, p: c + 'k', cap: null, promo: null, flag: 'ck' });
      if (st.c[c + 'Q'] && b[base] === c + 'r' && !b[base + 1] && !b[base + 2] && !b[base + 3] && !attacked(b, base + 3, foe) && !attacked(b, base + 2, foe))
        out.push({ f: base + 4, t: base + 2, p: c + 'k', cap: null, promo: null, flag: 'cq' });
    }
    return out;
  }

  function applyMove(st, m) {
    var b = st.b.slice(), c = st.t, cr = { wK: st.c.wK, wQ: st.c.wQ, bK: st.c.bK, bQ: st.c.bQ };
    b[m.t] = m.promo ? c + m.promo : b[m.f];
    b[m.f] = null;
    if (m.flag === 'ep') b[m.t - (c === 'w' ? 8 : -8)] = null;
    var base = c === 'w' ? 0 : 56;
    if (m.flag === 'ck') { b[base + 5] = b[base + 7]; b[base + 7] = null; }
    if (m.flag === 'cq') { b[base + 3] = b[base]; b[base] = null; }
    [m.f, m.t].forEach(function (s) {
      if (s === 4) { cr.wK = false; cr.wQ = false; }
      if (s === 60) { cr.bK = false; cr.bQ = false; }
      if (s === 7) cr.wK = false;
      if (s === 0) cr.wQ = false;
      if (s === 63) cr.bK = false;
      if (s === 56) cr.bQ = false;
    });
    var reset = m.p.charAt(1) === 'p' || !!m.cap;
    return { b: b, t: other(c), c: cr, ep: m.flag === 'dbl' ? (m.f + m.t) / 2 : -1, half: reset ? 0 : st.half + 1 };
  }

  function legalMoves(st) {
    return pseudo(st).filter(function (m) {
      var n = applyMove(st, m);
      return !attacked(n.b, kingSq(n.b, st.t), n.t);
    });
  }

  function insufficient(b) {
    var minors = 0, i, ty;
    for (i = 0; i < 64; i++) {
      if (!b[i]) continue;
      ty = b[i].charAt(1);
      if (ty === 'p' || ty === 'r' || ty === 'q') return false;
      if (ty === 'n' || ty === 'b') minors++;
    }
    return minors <= 1;
  }

  /* position identity for repetition: pieces, side to move, castling rights, en passant square */
  function posKey(st) { return st.b.map(function (p) { return p || '.'; }).join('') + st.t + (st.c.wK ? 'K' : '') + (st.c.wQ ? 'Q' : '') + (st.c.bK ? 'k' : '') + (st.c.bQ ? 'q' : '') + st.ep; }

  function MiniChess() {
    var st = initialState(), cache = null, self = this, hist = [], keys = [posKey(st)];
    var FILES_ = 'abcdefgh';
    function nm(i) { return FILES_.charAt(i & 7) + ((i >> 3) + 1); }
    function ix(n) { return (parseInt(n.charAt(1), 10) - 1) * 8 + FILES_.indexOf(n.charAt(0)); }
    function legal() { return cache || (cache = legalMoves(st)); }
    function repeated() { var k = keys[keys.length - 1], n = 0; for (var i = 0; i < keys.length; i++) if (keys[i] === k) n++; return n >= 3; }
    self.state = function () { return st; };
    self.keys = function () { return keys; };
    self.history = function () { return hist.length; };
    /** Take back the last n plies (default 1). Returns how many were undone. */
    self.undo = function (n) { var k = 0; n = n || 1; while (k < n && hist.length) { st = hist.pop(); keys.pop(); k++; } cache = null; return k; };
    self.get = function (n) { var p = st.b[ix(n)]; return p ? { color: p.charAt(0), type: p.charAt(1) } : null; };
    self.turn = function () { return st.t; };
    self.moves = function (o) {
      var ms = legal(), si = o && o.square ? ix(o.square) : -1;
      if (si >= 0) ms = ms.filter(function (m) { return m.f === si; });
      return ms.map(function (m) {
        return { from: nm(m.f), to: nm(m.t), piece: m.p.charAt(1), captured: m.cap ? m.cap.charAt(1) : undefined, promotion: m.promo || undefined };
      });
    };
    self.move = function (o) {
      var f = ix(o.from), t = ix(o.to), pr = o.promotion || 'q';
      var m = legal().filter(function (x) { return x.f === f && x.t === t && (!x.promo || x.promo === pr); })[0];
      if (!m) return null;
      hist.push(st); st = applyMove(st, m); cache = null; keys.push(posKey(st));
      return { from: o.from, to: o.to, flag: m.flag };
    };
    self.in_check = function () { return inCheckState(st); };
    self.in_checkmate = function () { return inCheckState(st) && legal().length === 0; };
    self.in_stalemate = function () { return !inCheckState(st) && legal().length === 0; };
    self.in_threefold = repeated;
    self.in_draw = function () { return st.half >= 100 || insufficient(st.b) || self.in_stalemate() || repeated(); };
    self.game_over = function () { return legal().length === 0 || st.half >= 100 || insufficient(st.b) || repeated(); };
  }

export { MiniChess, initialState, legalMoves, applyMove, inCheckState, attacked, posKey, pseudo, kingSq };
