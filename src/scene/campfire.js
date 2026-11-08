import * as THREE from 'three';
import { FIRE } from './world.js';
import { ART } from '../assets/manifest.js';
import { loadTex, artMat, cutout, PLANE, billboard } from './art.js';

/* Two crossed logs, painted in code: bark washes, streaks and pale end rings. Used when there is no ART.props.logs and the fire_ring art (which has its own laid sticks) is not there either. */
function paintLogs() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
  let s = 5; const r = () => (s = s * 16807 % 2147483647) / 2147483647;
  const log = (ang, len, th, hi, lo) => {
    x.save(); x.translate(128, 72); x.rotate(ang); x.shadowColor = 'rgba(30,18,10,.5)'; x.shadowBlur = 4; x.fillStyle = lo;
    x.beginPath(); x.roundRect(-len / 2, -th / 2, len, th, th / 2); x.fill(); x.shadowBlur = 0;
    const g = x.createLinearGradient(0, -th / 2, 0, th / 2); g.addColorStop(0, hi); g.addColorStop(1, lo); x.fillStyle = g; x.beginPath(); x.roundRect(-len / 2, -th / 2, len, th, th / 2); x.fill();
    x.save(); x.clip();
    for (let i = 0; i < 26; i++) { const yy = -th / 2 + r() * th, x0 = -len / 2 + r() * len; x.strokeStyle = r() < .6 ? 'rgba(30,18,10,.3)' : 'rgba(230,200,160,.18)'; x.lineWidth = 1 + r() * 1.5; x.beginPath(); x.moveTo(x0, yy); x.lineTo(x0 + 12 + r() * 40, yy + (r() - .5) * 3); x.stroke(); }
    x.restore();
    x.fillStyle = '#dcbf92'; x.strokeStyle = 'rgba(90,60,35,.6)'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(len / 2 - th * .25, 0, th * .22, th * .46, 0, 0, 6.283); x.fill(); x.stroke();
    x.beginPath(); x.ellipse(len / 2 - th * .25, 0, th * .1, th * .24, 0, 0, 6.283); x.stroke(); x.restore();
  };
  log(-.28, 190, 34, '#94694a', '#5a3d2a'); log(.22, 180, 32, '#7f5a3d', '#4a3222');
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/** The campfire: layered flames, a soft glow, rising sparks and a flickering warm light that reaches the friends. */
export function buildCampfire(scene, x = FIRE[0], z = FIRE[1]) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const flameMat = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, fog: false });
  const flames = [[.2, .62, 0xf08a3c, .95], [.14, .5, 0xffc766, .9], [.08, .34, 0xfff0b8, .9]].map(([r, h, c, o]) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), flameMat(c, o)); m.position.y = .12 + h / 2; m.userData.h = h; g.add(m); return m;
  });
  const gc = document.createElement('canvas'); gc.width = gc.height = 128; const gx = gc.getContext('2d');
  const gr = gx.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,190,110,1)'); gr.addColorStop(.35, 'rgba(255,150,70,.45)'); gr.addColorStop(1, 'rgba(255,120,40,0)');
  gx.fillStyle = gr; gx.fillRect(0, 0, 128, 128);
  const glowMat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending });
  const glow = new THREE.Sprite(glowMat); glow.position.y = .5; glow.scale.set(3.2, 3.2, 1); g.add(glow);
  const light = new THREE.PointLight(0xffa24d, 0, 16, 1.4); light.position.set(0, .9, 0); g.add(light);
  const N = 22, pos = new Float32Array(N * 3), seed = Array.from({ length: N }, () => ({ t: Math.random(), s: .35 + Math.random() * .5, a: Math.random() * 6.28 }));
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const sparkMat = new THREE.PointsMaterial({ color: 0xffc070, size: 3, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending });
  const sparks = new THREE.Points(sg, sparkMat); sparks.frustumCulled = false; g.add(sparks);
  const pc = document.createElement('canvas'); pc.width = pc.height = 64; const px = pc.getContext('2d'), pg = px.createRadialGradient(32, 32, 0, 32, 32, 32);
  pg.addColorStop(0, 'rgba(255,255,255,.9)'); pg.addColorStop(.5, 'rgba(255,255,255,.35)'); pg.addColorStop(1, 'rgba(255,255,255,0)'); px.fillStyle = pg; px.fillRect(0, 0, 64, 64);
  const puffTex = new THREE.CanvasTexture(pc), dayC = new THREE.Color(0xeceae4), nightC = new THREE.Color(0xb08a6c), col = new THREE.Color();
  const puffs = Array.from({ length: 9 }, (_, i) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, opacity: 0, depthWrite: false, fog: false })); m.visible = false; g.add(m); return { m, t: i / 9, s: .09 + Math.random() * .05, ph: Math.random() * 6.28, w: .15 + Math.random() * .15 }; });
  loadTex(ART.props.logs).then(t => {
    if (t) { cutout(scene, ART.props.logs, x, z, .4, { y: .02 }); return; }
    loadTex(ART.props.fire_ring).then(ring => { if (ring) return; const pv = new THREE.Group(), m = new THREE.Mesh(PLANE, artMat(paintLogs(), { transparent: true, alphaTest: .02 })); m.scale.set(.8, .4, 1); m.position.set(-.4, 0, 0); pv.add(m); pv.position.set(x, .02, z); scene.add(pv); billboard(pv); });
  });
  let level = 0, burst = 0;
  return {
    /** Poke the fire: a burst of sparks and a flare that settles. False when it is too cold to poke. */
    poke() { if (level < .2) return false; burst = 1; seed.forEach(s => { if (Math.random() < .75) { s.t = Math.random() * .25; s.a = Math.random() * 6.28; } }); return true; },
    /** target is 0 (cold) or 1 (burning); the fire eases toward it. */
    update(now, dt, target, night = 0) {
      level += (target - level) * Math.min(1, dt * 1.6); burst = Math.max(0, burst - dt * 1.1);
      const t = now / 1000, on = level > .02, f = .9 + .1 * Math.sin(t * 13) * Math.sin(t * 7.3) + .05 * Math.sin(t * 29);
      flames.forEach((m, i) => { m.visible = on; m.scale.set(level * (1 + .08 * Math.sin(t * (9 + i * 3)) + burst * .2), level * f * (1 + .1 * Math.sin(t * (11 + i * 4) + i) + burst * .3), level); m.rotation.y = t * (1 + i); });
      light.intensity = level * 3.6 * f * (1 + burst * .7); glowMat.opacity = level * .5 * f * (1 + burst * .5); glow.scale.setScalar((2.8 + .3 * f)); sparkMat.opacity = level * .9; sparkMat.size = 3 + burst * 2;
      for (let i = 0; i < N; i++) { const s = seed[i]; s.t += dt * s.s * .5 * (1 + burst * 2); if (s.t > 1) { s.t = 0; s.a = Math.random() * 6.28; } pos[i * 3] = Math.cos(s.a) * (.1 + s.t * .25) + Math.sin(t * 2 + i) * .06 * s.t; pos[i * 3 + 1] = .3 + s.t * 1.8; pos[i * 3 + 2] = Math.sin(s.a) * (.1 + s.t * .25); }
      sg.attributes.position.needsUpdate = true;
      col.copy(dayC).lerp(nightC, Math.min(1, night * 1.3));
      puffs.forEach(q => {
        q.t += dt * q.s; if (q.t > 1) { q.t = 0; q.ph = Math.random() * 6.28; }
        const u = q.t, a = Math.sin(Math.PI * Math.min(1, u * 1.15)) * (1 - u * .3);
        q.m.visible = level > .05 && a > .01; q.m.position.set(Math.sin(t * .7 + q.ph + u * 3.2) * q.w * u * 2.2, .85 + u * 2.8, Math.cos(t * .5 + q.ph) * q.w * u);
        q.m.scale.setScalar(.25 + u * 1.1); q.m.material.color.copy(col); q.m.material.opacity = a * level * (.2 - .09 * Math.min(1, night * 1.3));
      });
    },
    get level() { return level; },
  };
}
