import * as THREE from 'three';

/* Day and night: sky, fog, lights, lake colour, stars and moon, glowing windows. Time is in hours (0-24).
   Keyframes are blended smoothly; `night` (0..1) drives stars, window glow and the campfire's auto mode. */
const K = (h, zen, hor, hemiS, hemiG, hemiI, sun, sunI, night, lake) => ({ h, zen, hor, hemiS, hemiG, hemiI, sun, sunI, night, lake });
const KF = [
  K(0, 0x0a1030, 0x1a2848, 0x2b3a66, 0x1a2230, .55, 0x8c9ee0, .35, 1, 0x17284a),
  K(4.6, 0x0f1a3c, 0x26365a, 0x33446e, 0x1c2634, .6, 0x8c9ee0, .35, .95, 0x1c2f52),
  K(5.9, 0x6f7fb0, 0xf2b490, 0xc6b6c8, 0x8a8f78, .85, 0xffc08a, .7, .35, 0x8c9fbf),
  K(7.6, 0x9dbfd8, 0xefe4cf, 0xfff1dc, 0x9bb08a, 1.25, 0xffe9c4, 1.15, 0, 0x9fc0d8),
  K(12, 0x8fc0e0, 0xe3eee8, 0xfff4e0, 0x9bb0a0, 1.35, 0xfff0d6, 1.3, 0, 0x9fc0d8),
  K(16.4, 0x9fbad6, 0xf1e0c0, 0xfff0d8, 0x9fae88, 1.25, 0xffe0b0, 1.2, 0, 0x9ab8d0),
  K(18.7, 0x7d83b8, 0xf4a97f, 0xe7b8b0, 0x8a8470, .9, 0xff9f66, .65, .3, 0x8a9ec0),
  K(20.2, 0x2f3a6e, 0xb97a8f, 0x6c6a9a, 0x3e4254, .6, 0x8f86c0, .4, .8, 0x3a4a78),
  K(21.8, 0x0e1534, 0x1d2a4c, 0x2f3d68, 0x1a2230, .55, 0x8c9ee0, .35, 1, 0x17284a),
  K(24, 0x0a1030, 0x1a2848, 0x2b3a66, 0x1a2230, .55, 0x8c9ee0, .35, 1, 0x17284a),
];
const tmpA = new THREE.Color(), tmpB = new THREE.Color();
const mix = (a, b, t) => tmpA.set(a).lerp(tmpB.set(b), t).clone();
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export function createDayNight(scene, world, camera) {
  const D = { hour: 9, cycle: true, dayMin: 12, night: 0 };
  // sky dome: a vertical gradient that follows the camera
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() } },
    vertexShader: 'varying float vY; void main(){ vY = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 hor; varying float vY; void main(){ float t = smoothstep(-0.05, 0.75, vY); gl_FragColor = vec4(mix(hor, top, t), 1.0); }',
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(300, 24, 16), skyMat); dome.renderOrder = -10; dome.frustumCulled = false; scene.add(dome);
  // stars and moon (in front of the camp, over the lake)
  const sp = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) { const a = Math.random() * 6.283, e = Math.acos(Math.random() * .92 + .06), r = 280; sp[i * 3] = Math.cos(a) * Math.sin(e) * r; sp[i * 3 + 1] = Math.cos(e) * r; sp[i * 3 + 2] = Math.sin(a) * Math.sin(e) * r; }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xfff6e0, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const stars = new THREE.Points(sg, starMat); stars.frustumCulled = false; scene.add(stars);
  const moonMat = new THREE.MeshBasicMaterial({ color: 0xfdf3d8, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const moon = new THREE.Mesh(new THREE.CircleGeometry(9, 28), moonMat); moon.position.set(-55, 105, -230); moon.lookAt(0, 0, 0); scene.add(moon);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xcfd9ff, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const halo = new THREE.Mesh(new THREE.CircleGeometry(22, 28), haloMat); halo.position.copy(moon.position).multiplyScalar(1.01); halo.lookAt(0, 0, 0); scene.add(halo);

  // emissive materials (windows, lantern, truck lights) glow more at night
  const glows = []; const seen = new Set();
  scene.traverse(o => { const m = o.material; if (m && !seen.has(m) && m.emissive && m.emissive.getHex() !== 0) { seen.add(m); glows.push([m, m.emissiveIntensity]); } });

  D.set = h => { D.hour = ((h % 24) + 24) % 24; };
  D.update = (dt) => {
    if (D.cycle) D.hour = (D.hour + dt * 24 / (D.dayMin * 60)) % 24;
    const h = D.hour; let i = 0; while (i < KF.length - 2 && h >= KF[i + 1].h) i++;
    const a = KF[i], b = KF[i + 1], t = (h - a.h) / (b.h - a.h), e = t * t * (3 - 2 * t);
    const L = (x, y) => mix(x, y, e), N = (x, y) => x + (y - x) * e;
    skyMat.uniforms.top.value.copy(L(a.zen, b.zen)); const hor = L(a.hor, b.hor); skyMat.uniforms.hor.value.copy(hor);
    scene.fog.color.copy(hor);
    world.hemi.color.copy(L(a.hemiS, b.hemiS)); world.hemi.groundColor.copy(L(a.hemiG, b.hemiG)); world.hemi.intensity = N(a.hemiI, b.hemiI);
    world.sun.color.copy(L(a.sun, b.sun)); world.sun.intensity = N(a.sunI, b.sunI);
    world.lake.material.color.copy(L(a.lake, b.lake));
    const night = D.night = N(a.night, b.night);
    // sun arcs east to west behind the camera; at night the light comes softly from the moon, in front
    const ang = Math.PI * (h - 6) / 12, day = Math.max(0, Math.sin(ang));
    const sx = Math.cos(ang) * 14, sy = 3 + day * 12, sz = 8;
    world.sun.position.set(sx * (1 - night) - 8 * night, sy * (1 - night) + 14 * night, sz * (1 - night) - 10 * night);
    starMat.opacity = smooth(.55, .95, night); moonMat.opacity = smooth(.5, .9, night); haloMat.opacity = .18 * smooth(.6, 1, night);
    const g = 1 + 1.6 * night; glows.forEach(([m, base]) => { m.emissiveIntensity = base * g; });
    dome.position.copy(camera.position); stars.position.copy(camera.position); moon.position.set(camera.position.x - 55, 105, camera.position.z - 230); halo.position.set(moon.position.x, moon.position.y, moon.position.z - 1);
  };
  return D;
}
