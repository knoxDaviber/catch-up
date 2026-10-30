import { MUSIC, SFX, AMBIENCE } from '../assets/manifest.js';

/* Sound: music playlist with crossfade, one-shot effects, and ambience that follows the time of day and the fire.
   Every sound has a synthesised placeholder, so the game works with no files. Files named in assets/manifest.js
   replace the placeholders. Browsers only allow sound after a click, so call audio.unlock() from a click. */
let LIVE = null;
/** Lets scene modules cue a sound (optionally panned -1..1) without being handed the audio object. */
export const cue = (name, pan = 0) => LIVE && LIVE.sfx(name, pan);
export function createAudio(settings) {
  const A = { ctx: null, trackId: null, trackError: null }; LIVE = A;
  let master, musicBus, sfxBus, ambBus, noiseBuf;
  const buffers = new Map(), loading = new Map();
  let curEl = null, curStop = null, fadeTimer = 0, padTimer = 0;
  const nowT = () => A.ctx.currentTime;

  function unlock() {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    A.ctx = new AC();
    master = A.ctx.createGain(); master.connect(A.ctx.destination);
    musicBus = A.ctx.createGain(); sfxBus = A.ctx.createGain(); ambBus = A.ctx.createGain();
    [musicBus, sfxBus, ambBus].forEach(b => b.connect(master));
    noiseBuf = A.ctx.createBuffer(1, A.ctx.sampleRate * 2, A.ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    applyVolumes(); startAmbience(); playTrack(settings.track);
  }
  function applyVolumes() {
    if (!A.ctx) return;
    const m = settings.muted ? 0 : 1, t = nowT();
    master.gain.setTargetAtTime(m, t, .05); musicBus.gain.setTargetAtTime(settings.musicVol, t, .1);
    sfxBus.gain.setTargetAtTime(settings.sfxVol, t, .05); ambBus.gain.setTargetAtTime(settings.ambVol, t, .1);
    if (curEl) curEl.volume = 1;
  }

  /* ---------- helpers for synthesised sounds ---------- */
  function env(g, t, a, d, peak) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  let curPan = 0;
  const clampPan = p => Math.max(-1, Math.min(1, p));
  function panTo(d, p) { if (!p || !A.ctx.createStereoPanner) return d; const n = A.ctx.createStereoPanner(); n.pan.value = clampPan(p); n.connect(d); return n; }
  function tone(freq, dur, { type = 'sine', vol = .3, slide = 0, delay = 0, dest = sfxBus, attack = .005, pan } = {}) {
    dest = panTo(dest, pan ?? (dest === sfxBus ? curPan : 0)); const t = nowT() + delay, o = A.ctx.createOscillator(), g = A.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    env(g, t, attack, dur, vol); o.connect(g); g.connect(dest); o.start(t); o.stop(t + attack + dur + .05);
  }
  function noise(dur, { freq = 1200, q = .7, type = 'lowpass', vol = .3, delay = 0, dest = sfxBus, attack = .005, sweep = 0, pan } = {}) {
    dest = panTo(dest, pan ?? (dest === sfxBus ? curPan : 0)); const t = nowT() + delay, s = A.ctx.createBufferSource(), f = A.ctx.createBiquadFilter(), g = A.ctx.createGain();
    s.buffer = noiseBuf; s.loop = true; f.type = type; f.frequency.setValueAtTime(freq, t); if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(40, freq + sweep), t + dur); f.Q.value = q;
    env(g, t, attack, dur, vol); s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random()); s.stop(t + attack + dur + .05);
  }
  const SYN = {
    click: () => tone(1200, .05, { type: 'triangle', vol: .12 }),
    select: () => { tone(520, .08, { type: 'triangle', vol: .18 }); tone(780, .1, { type: 'sine', vol: .1, delay: .03 }); },
    move: () => { noise(.07, { freq: 900, vol: .35 }); tone(180, .09, { type: 'sine', vol: .3, slide: -60 }); },
    capture: () => { noise(.1, { freq: 1400, vol: .4 }); tone(150, .14, { type: 'triangle', vol: .35, slide: -70 }); tone(110, .16, { type: 'sine', vol: .25, delay: .04 }); },
    splash: () => { noise(.45, { freq: 2400, type: 'bandpass', q: .6, vol: .4, sweep: -1500 }); tone(300, .2, { type: 'sine', vol: .15, slide: -150 }); },
    nibble: () => { tone(900, .06, { type: 'sine', vol: .12, slide: -300 }); noise(.12, { freq: 1800, type: 'bandpass', vol: .1 }); },
    bite: () => { tone(660, .12, { type: 'triangle', vol: .3 }); tone(990, .16, { type: 'triangle', vol: .24, delay: .1 }); },
    reel: () => { for (let i = 0; i < 6; i++) tone(2400 + (i % 2) * 300, .02, { type: 'square', vol: .04, delay: i * .12 }); },
    catch: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, .35, { type: 'triangle', vol: .22, delay: i * .1 })); },
    grunt: () => { tone(110, .35, { type: 'sawtooth', vol: .12, slide: -30 }); noise(.3, { freq: 400, vol: .15 }); },
    blip: () => tone(420 + Math.random() * 120, .05, { type: 'sine', vol: .06 }),
    pop: () => tone(500, .07, { type: 'sine', vol: .18, slide: 400 }),
    fishjump: () => { noise(.1, { freq: 3200, type: 'bandpass', q: .8, vol: .1, sweep: -1800 }); noise(.5, { freq: 2200, type: 'bandpass', q: .6, vol: .2, sweep: -1400, delay: .62, attack: .02 }); tone(420, .16, { vol: .08, slide: -240, delay: .64 }); },
    quack: () => [0, .2].forEach(d => { tone(430, .13, { type: 'sawtooth', vol: .035, slide: -120, delay: d, attack: .02 }); tone(640, .1, { type: 'sine', vol: .03, slide: -150, delay: d, attack: .02 }); }),
    birdcall: () => { const f = 1500 + Math.random() * 500; for (let i = 0; i < 3; i++) tone(f + (i % 2) * 380, .12, { vol: .035, slide: -260, delay: i * .17 }); },
    tweet: () => { const f = 3300 + Math.random() * 600; for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) tone(f, .06, { vol: .03, slide: 700, delay: i * .1 }); },
    possum: () => { noise(.22, { freq: 900, type: 'bandpass', q: 1.5, vol: .05, attack: .05 }); tone(150, .2, { type: 'sawtooth', vol: .012, slide: -30, delay: .3, attack: .05 }); },
  };
  async function getBuffer(name, src) {
    if (buffers.has(name)) return buffers.get(name);
    if (!loading.has(name)) loading.set(name, fetch(src).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then(b => A.ctx.decodeAudioData(b)).then(buf => { buffers.set(name, buf); return buf; }).catch(() => { buffers.set(name, null); return null; }));
    return loading.get(name);
  }
  A.sfx = (name, pan = 0) => {
    if (!A.ctx || settings.muted) return;
    const src = SFX[name];
    if (src) { getBuffer('sfx:' + name, src).then(buf => { if (!buf) { curPan = pan; try { SYN[name] && SYN[name](); } finally { curPan = 0; } return; } const s = A.ctx.createBufferSource(); s.buffer = buf; s.connect(panTo(sfxBus, pan)); s.start(); }); return; }
    curPan = pan; try { SYN[name] && SYN[name](); } finally { curPan = 0; }
  };

  /* ---------- music ---------- */
  const track = id => MUSIC.find(t => t.id === id) || MUSIC[0];
  function stopCurrent(fadeMs) {
    const el = curEl, stop = curStop; curEl = null; curStop = null; clearInterval(padTimer);
    if (el) { const v0 = el.volume, t0 = performance.now(); const iv = setInterval(() => { const p = Math.min(1, (performance.now() - t0) / fadeMs); el.volume = v0 * (1 - p); if (p >= 1) { clearInterval(iv); el.pause(); el.src = ''; if (el._src) el._src.disconnect(); } }, 40); }
    if (stop) stop(fadeMs / 1000);
  }
  function startPad() {
    // a slow generative pad: soft chords that change every 9 seconds
    const chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7], [164.8, 196, 246.9]];
    const out = A.ctx.createGain(); out.gain.value = 0; out.connect(musicBus);
    const lp = A.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(out);
    const voices = [0, 1, 2].map(() => { const o = A.ctx.createOscillator(), o2 = A.ctx.createOscillator(), g = A.ctx.createGain(); o.type = 'triangle'; o2.type = 'sine'; o2.detune.value = 7; o.connect(g); o2.connect(g); g.gain.value = .12; g.connect(lp); o.start(); o2.start(); return { o, o2 }; });
    let i = 0;
    const next = () => { const c = chords[i++ % chords.length], t = nowT(); voices.forEach((v, k) => { v.o.frequency.setTargetAtTime(c[k], t, 1.6); v.o2.frequency.setTargetAtTime(c[k] * 2, t, 1.6); }); };
    next(); padTimer = setInterval(next, 9000);
    out.gain.setTargetAtTime(1, nowT(), 1.5);
    curStop = fade => { out.gain.setTargetAtTime(0, nowT(), fade / 3); setTimeout(() => voices.forEach(v => { v.o.stop(); v.o2.stop(); }), fade * 1000 + 300); };
  }
  function playTrack(id) {
    if (!A.ctx || settings.radio === false) return;
    const t = track(id); A.trackId = t.id; A.trackError = null; stopCurrent(1500);
    if (!t.src) { startPad(); return; }
    const el = new Audio(t.src); el.loop = settings.playMode === 'one'; el.volume = 0; el.crossOrigin = 'anonymous';
    const src = A.ctx.createMediaElementSource(el); src.connect(musicBus); el._src = src;
    el.addEventListener('error', () => { if (curEl !== el) return; A.trackError = t.name; curEl = null; startPad(); if (A.onTrack) A.onTrack(settings.track); });
    el.addEventListener('ended', () => { if (curEl !== el) return; if (settings.playMode === 'all') { const i = MUSIC.findIndex(x => x.id === t.id); settings.track = MUSIC[(i + 1) % MUSIC.length].id; playTrack(settings.track); if (A.onTrack) A.onTrack(settings.track); } });
    curEl = el; el.play().catch(() => {});
    const t0 = performance.now(), iv = setInterval(() => { const p = Math.min(1, (performance.now() - t0) / 1500); el.volume = p; if (p >= 1) clearInterval(iv); }, 40);
  }
  A.setTrack = id => { settings.track = id; settings.radio = true; playTrack(id); };
  A.setRadio = on => { settings.radio = !!on; if (!A.ctx) return; if (on) playTrack(settings.track); else { A.trackError = null; stopCurrent(800); } };
  A.setPlayMode = mode => { settings.playMode = mode; if (curEl) curEl.loop = mode === 'one'; };
  A.tracks = () => MUSIC.map(t => ({ id: t.id, name: t.name }));

  /* ---------- ambience ---------- */
  const amb = { water: null, day: null, night: null, frogs: null, fire: null, birdT: 0, fireT: 0, night01: 0, fire01: 0 };
  const rnd = (a, b) => a + Math.random() * (b - a), sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const wPan = () => rnd(-.9, .9);
  function loop(name, mk) {
    const g = A.ctx.createGain(); g.gain.value = 0; g.connect(ambBus);
    const src = AMBIENCE[name];
    if (src) { const el = new Audio(src); el.loop = true; el.crossOrigin = 'anonymous'; A.ctx.createMediaElementSource(el).connect(g); el.addEventListener('error', () => { mk(g); }); el.play().catch(() => {}); } else mk(g);
    return g;
  }
  function startAmbience() {
    amb.water = loop('water', g => { const s = A.ctx.createBufferSource(), f = A.ctx.createBiquadFilter(), lfo = A.ctx.createOscillator(), lg = A.ctx.createGain(), base = A.ctx.createGain();
      s.buffer = noiseBuf; s.loop = true; f.type = 'lowpass'; f.frequency.value = 420; lfo.frequency.value = .13; lg.gain.value = .05; base.gain.value = .07; lfo.connect(lg); lg.connect(base.gain); s.connect(f); f.connect(base); base.connect(g); s.start(); lfo.start(); });
    amb.water.gain.value = 1;
    amb.day = loop('day', () => { /* birds are scheduled below */ });
    amb.night = loop('night', () => { /* crickets are scheduled below */ });
    amb.frogs = loop('frogs', () => { /* frogs are scheduled below */ });
    amb.fire = loop('fire', () => { /* crackle is scheduled below */ });
    amb.fire.gain.value = 1;
    const every = (lo, hi, fn) => { const go = () => { if (!A.ctx) return; try { fn(); } catch (e) {} setTimeout(go, rnd(lo, hi) * 1000); }; setTimeout(go, rnd(lo, hi) * 1000); };
    const day01 = () => 1 - amb.night01, ab = () => !settings.muted && settings.ambVol > 0;
    // day: a magpie-ish warble now and then, or small distant birds; they thin out toward dusk
    every(7, 18, () => { const w = day01() * day01(); if (AMBIENCE.day || !ab() || Math.random() > w * .9) return;
      const p = wPan(), far = Math.random() < .55;
      if (far) { const f = rnd(3000, 4300), n = 4 + Math.floor(Math.random() * 4); for (let i = 0; i < n; i++) tone(f + (i % 2) * 260, .05, { vol: .022 * w, slide: i % 3 ? 500 : -400, delay: i * .085, dest: ambBus, pan: p }); return; }
      const f = rnd(620, 820), notes = [1, 1.5, 1.25, 1.8, 1.5, 1.2, 1.6, 1.25];
      for (let i = 0; i < 6 + Math.floor(Math.random() * 3); i++) { const n = notes[i % notes.length] * f; tone(n, .17, { vol: .05 * w, slide: i % 2 ? -140 : 160, delay: i * .16, dest: ambBus, pan: p, attack: .03 }); tone(n * 2, .12, { vol: .012 * w, delay: i * .16, dest: ambBus, pan: p, attack: .03 }); } });
    // dusk and night: frogs, a soft pobblebonk or a tapping trill, rising as the light goes
    every(1.4, 4.2, () => { const w = sm(.2, .65, amb.night01) * (1 - .35 * sm(.9, 1, amb.night01)); if (AMBIENCE.frogs || !ab() || Math.random() > w * .8) return;
      const p = wPan();
      if (Math.random() < .45) { const f = rnd(300, 420); tone(f, .16, { vol: .05 * w, slide: -f * .45, dest: ambBus, pan: p, attack: .01 }); tone(f * 2.02, .08, { vol: .015 * w, slide: -f * .5, dest: ambBus, pan: p, attack: .01 }); }
      else { const f = rnd(1400, 2000); for (let i = 0; i < 4 + Math.floor(Math.random() * 4); i++) tone(f, .035, { type: 'square', vol: .007 * w, slide: -300, delay: i * .075, dest: ambBus, pan: p }); } });
    // night: crickets chirping in short groups of pulses
    every(.5, 1.6, () => { const w = sm(.55, 1, amb.night01); if (AMBIENCE.night || !ab() || Math.random() > w * .7) return;
      const p = wPan(), f = [4100, 4500, 4900, 5300][Math.floor(Math.random() * 4)];
      for (let i = 0; i < 3; i++) tone(f, .03, { vol: .014 * w, delay: i * .065, dest: ambBus, pan: p, attack: .008 }); });
    // a rare distant boobook owl, "mo-poke"
    every(50, 130, () => { const w = sm(.85, 1, amb.night01); if (!ab() || Math.random() > w) return;
      const p = wPan(), reps = 1 + Math.floor(Math.random() * 3), q = .6 + Math.random() * .4;
      for (let r = 0; r < reps; r++) [[560, 0], [470, .34]].forEach(([f, d]) => { const dl = r * 1.5 + d; tone(f, .26, { vol: .05 * q, slide: -30, delay: dl, dest: ambBus, pan: p, attack: .05 }); tone(f * 2, .2, { vol: .008 * q, delay: dl, dest: ambBus, pan: p, attack: .05 }); }); });
    // any time: soft slaps of water on the shore, and now and then a far-off splash
    every(2.2, 6, () => { if (AMBIENCE.water || !ab()) return; noise(rnd(.25, .45), { freq: rnd(380, 700), vol: rnd(.025, .05), attack: .1, dest: ambBus, pan: wPan() }); });
    every(30, 80, () => { if (!ab()) return; const p = wPan(); noise(.4, { freq: 2000, type: 'bandpass', q: .6, vol: .035, sweep: -1200, attack: .02, dest: ambBus, pan: p }); });
    const crackle = () => {
      if (!A.ctx) return;
      if (!AMBIENCE.fire && amb.fire01 > .1 && Math.random() < .8) noise(.04 + Math.random() * .05, { freq: 1500 + Math.random() * 2500, type: 'bandpass', q: 1.2, vol: .06 * amb.fire01 + .01, dest: ambBus });
      setTimeout(crackle, 80 + Math.random() * 380);
    };
    crackle();
  }
  /** night: 0..1 from the day/night cycle, fire: 0..1 campfire level. */
  A.setScene = (night, fire) => {
    amb.night01 = night; amb.fire01 = fire;
    if (!A.ctx) return; const t = nowT();
    if (amb.night) amb.night.gain.setTargetAtTime(night, t, .8);
    if (amb.day) amb.day.gain.setTargetAtTime(1 - night, t, .8);
    if (amb.frogs) amb.frogs.gain.setTargetAtTime(sm(.2, .65, night), t, .8);
    if (AMBIENCE.fire && amb.fire) amb.fire.gain.setTargetAtTime(fire, t, .5);
  };
  A.unlock = unlock; A.applyVolumes = applyVolumes;
  return A;
}
