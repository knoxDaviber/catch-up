import { MUSIC, SFX, AMBIENCE } from '../assets/manifest.js';

/* Sound: music playlist with crossfade, one-shot effects, and ambience that follows the time of day and the fire.
   Every sound has a synthesised placeholder, so the game works with no files. Files named in assets/manifest.js
   replace the placeholders. Browsers only allow sound after a click, so call audio.unlock() from a click. */
export function createAudio(settings) {
  const A = { ctx: null, trackId: null, trackError: null };
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
  function tone(freq, dur, { type = 'sine', vol = .3, slide = 0, delay = 0, dest = sfxBus, attack = .005 } = {}) {
    const t = nowT() + delay, o = A.ctx.createOscillator(), g = A.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    env(g, t, attack, dur, vol); o.connect(g); g.connect(dest); o.start(t); o.stop(t + attack + dur + .05);
  }
  function noise(dur, { freq = 1200, q = .7, type = 'lowpass', vol = .3, delay = 0, dest = sfxBus, attack = .005, sweep = 0 } = {}) {
    const t = nowT() + delay, s = A.ctx.createBufferSource(), f = A.ctx.createBiquadFilter(), g = A.ctx.createGain();
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
  };
  async function getBuffer(name, src) {
    if (buffers.has(name)) return buffers.get(name);
    if (!loading.has(name)) loading.set(name, fetch(src).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then(b => A.ctx.decodeAudioData(b)).then(buf => { buffers.set(name, buf); return buf; }).catch(() => { buffers.set(name, null); return null; }));
    return loading.get(name);
  }
  A.sfx = name => {
    if (!A.ctx || settings.muted) return;
    const src = SFX[name];
    if (src) { getBuffer('sfx:' + name, src).then(buf => { if (!buf) return SYN[name] && SYN[name](); const s = A.ctx.createBufferSource(); s.buffer = buf; s.connect(sfxBus); s.start(); }); return; }
    SYN[name] && SYN[name]();
  };

  /* ---------- music ---------- */
  const track = id => MUSIC.find(t => t.id === id) || MUSIC[0];
  function stopCurrent(fadeMs) {
    const el = curEl, stop = curStop; curEl = null; curStop = null; clearInterval(padTimer);
    if (el) { const v0 = el.volume, t0 = performance.now(); const iv = setInterval(() => { const p = Math.min(1, (performance.now() - t0) / fadeMs); el.volume = v0 * (1 - p); if (p >= 1) { clearInterval(iv); el.pause(); el.src = ''; } }, 40); }
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
    if (!A.ctx) return;
    const t = track(id); A.trackId = t.id; A.trackError = null; stopCurrent(1500);
    if (!t.src) { startPad(); return; }
    const el = new Audio(t.src); el.loop = settings.playMode === 'one'; el.volume = 0; el.crossOrigin = 'anonymous';
    const src = A.ctx.createMediaElementSource(el); src.connect(musicBus);
    el.addEventListener('error', () => { A.trackError = t.name; if (curEl === el) { curEl = null; startPad(); } });
    el.addEventListener('ended', () => { if (settings.playMode === 'all') { const i = MUSIC.findIndex(x => x.id === t.id); playTrack(MUSIC[(i + 1) % MUSIC.length].id); } });
    curEl = el; el.play().catch(() => {});
    const t0 = performance.now(), iv = setInterval(() => { const p = Math.min(1, (performance.now() - t0) / 1500); el.volume = p; if (p >= 1) clearInterval(iv); }, 40);
  }
  A.setTrack = id => { settings.track = id; playTrack(id); };
  A.setPlayMode = mode => { settings.playMode = mode; if (curEl) curEl.loop = mode === 'one'; };
  A.tracks = () => MUSIC.map(t => ({ id: t.id, name: t.name }));

  /* ---------- ambience ---------- */
  const amb = { water: null, day: null, night: null, fire: null, birdT: 0, fireT: 0, night01: 0, fire01: 0 };
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
    amb.night = loop('night', g => { const o = A.ctx.createOscillator(), og = A.ctx.createGain(), lfo = A.ctx.createOscillator(), lg = A.ctx.createGain(); o.frequency.value = 4300; og.gain.value = 0; lfo.frequency.value = 13; lg.gain.value = .012; lfo.connect(lg); lg.connect(og.gain); o.connect(og); og.connect(g); o.start(); lfo.start(); });
    amb.fire = loop('fire', () => { /* crackle is scheduled below */ });
    amb.fire.gain.value = 1;
    const sched = () => {
      if (!A.ctx) return;
      if (!AMBIENCE.day && amb.night01 < .6 && Math.random() < .5) { const f = 2400 + Math.random() * 1600; for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) tone(f + i * 150, .09, { type: 'sine', vol: .05 * (1 - amb.night01), slide: 500, delay: i * .11, dest: ambBus }); }
      setTimeout(sched, 2500 + Math.random() * 5000);
    };
    sched();
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
    if (AMBIENCE.fire && amb.fire) amb.fire.gain.setTargetAtTime(fire, t, .5);
  };
  A.unlock = unlock; A.applyVolumes = applyVolumes;
  return A;
}
