import * as THREE from 'three';
import { FIRE } from './world.js';

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
  let level = 0;
  return {
    /** target is 0 (cold) or 1 (burning); the fire eases toward it. */
    update(now, dt, target) {
      level += (target - level) * Math.min(1, dt * 1.6);
      const t = now / 1000, on = level > .02, f = .9 + .1 * Math.sin(t * 13) * Math.sin(t * 7.3) + .05 * Math.sin(t * 29);
      flames.forEach((m, i) => { m.visible = on; m.scale.set(level * (1 + .08 * Math.sin(t * (9 + i * 3))), level * f * (1 + .1 * Math.sin(t * (11 + i * 4) + i)), level); m.rotation.y = t * (1 + i); });
      light.intensity = level * 3.6 * f; glowMat.opacity = level * .5 * f; glow.scale.setScalar((2.8 + .3 * f)); sparkMat.opacity = level * .9;
      for (let i = 0; i < N; i++) { const s = seed[i]; s.t += dt * s.s * .5; if (s.t > 1) { s.t = 0; s.a = Math.random() * 6.28; } pos[i * 3] = Math.cos(s.a) * (.1 + s.t * .25) + Math.sin(t * 2 + i) * .06 * s.t; pos[i * 3 + 1] = .3 + s.t * 1.8; pos[i * 3 + 2] = Math.sin(s.a) * (.1 + s.t * .25); }
      sg.attributes.position.needsUpdate = true;
    },
    get level() { return level; },
  };
}
