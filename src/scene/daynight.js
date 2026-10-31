import * as THREE from 'three';
import { SKY_ART, ART } from '../assets/manifest.js';
import { loadTex, setArtTint } from './art.js';

/* Day and night: sky, fog, lights, lake colour, stars, a moving sun and moon, glowing windows. Time is in hours (0-24).
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
  // With painted skies (ART defined), the day and night plates wrap the dome (90 degrees per mirrored tile, horizon to ~36 degrees up), crossfade on `night`,
  // and are tinted by the gradient relative to the noon / midnight gradient, so dawn and dusk still colour them.
  const C = h => KF.find(k => k.h === h), refC = (a, b) => ({ value: [new THREE.Color(C(a).hor), new THREE.Color(C(a).zen), new THREE.Color(C(b).hor), new THREE.Color(C(b).zen)] });
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, dayT: { value: null }, nightT: { value: null }, night: { value: 0 }, refs: refC(12, 0) },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 hor; uniform sampler2D dayT; uniform sampler2D nightT; uniform float night; uniform vec3 refs[4]; varying vec3 vD;
      void main(){ vec3 d = normalize(vD); float t = smoothstep(-0.05, 0.75, d.y); vec3 g = mix(hor, top, t);
      #ifdef ART
        vec2 uv = vec2(atan(d.x, -d.z) / 1.5708 + 0.5, clamp((asin(clamp(d.y, -1.0, 1.0)) + 0.035) / 0.663, 0.002, 0.998));
        vec3 tD = clamp(g / max(mix(refs[0], refs[1], t), vec3(0.002)), 0.0, 1.6), tN = clamp(g / max(mix(refs[2], refs[3], t), vec3(0.002)), 0.0, 1.6);
        gl_FragColor = vec4(mix(texture2D(dayT, uv).rgb * tD, texture2D(nightT, uv).rgb * tN, night), 1.0);
        #include <colorspace_fragment>
      #else
        gl_FragColor = vec4(g, 1.0);
      #endif
      }`,
  });
  const skyTex = t => { t.wrapS = THREE.MirroredRepeatWrapping; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; return t; };   // no mips: the azimuth wraps behind you
  Promise.all([loadTex(ART.plates.sky_day), loadTex(ART.plates.sky_night)]).then(([d, n]) => { if (!d && !n) return;
    skyMat.uniforms.dayT.value = skyTex(d || n); skyMat.uniforms.nightT.value = skyTex(n || d); skyMat.defines.ART = ''; skyMat.needsUpdate = true; });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(300, 24, 16), skyMat); dome.renderOrder = -10; dome.frustumCulled = false; scene.add(dome);
  // stars and moon (in front of the camp, over the lake)
  const sp = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) { const a = Math.random() * 6.283, e = Math.acos(Math.random() * .92 + .06), r = 280; sp[i * 3] = Math.cos(a) * Math.sin(e) * r; sp[i * 3 + 1] = Math.cos(e) * r; sp[i * 3 + 2] = Math.sin(a) * Math.sin(e) * r; }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xfff6e0, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const stars = new THREE.Points(sg, starMat); stars.frustumCulled = false; stars.renderOrder = -9.5; scene.add(stars);
  // sun and moon: soft glowing sprites on the sky dome, arcing across the front of the view (over the lake). A painted sprite in SKY_ART replaces the generated glow.
  const glowTex = stops => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); stops.forEach(([o, a]) => g.addColorStop(o, `rgba(255,255,255,${a})`)); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); };
  const skyBody = (art, stops, size) => { const m = new THREE.SpriteMaterial({ map: glowTex(stops), transparent: true, opacity: 0, fog: false, depthWrite: false });
    loadTex(art).then(t => { if (t) { m.map = t; m.needsUpdate = true; } });
    const sp = new THREE.Sprite(m); sp.scale.set(size, size, 1); sp.frustumCulled = false; sp.renderOrder = -9; scene.add(sp); return sp; };
  const sunSp = skyBody(SKY_ART.sun, [[0, 1], [.1, 1], [.17, .8], [.3, .3], [.55, .09], [1, 0]], 150);
  const moonSp = skyBody(SKY_ART.moon, [[0, 1], [.2, 1], [.27, .75], [.38, .22], [.65, .06], [1, 0]], 120);
  const SKY_R = 250, glDir = new THREE.Vector2(), sunCol = new THREE.Color(), SUN_HI = new THREE.Color(0xfff6dc), SUN_LO = new THREE.Color(0xff7a45);
  // arc: azimuth sweeps from +55 to -55 degrees across the front, elevation peaks at 24 degrees (the top of the view)
  const place = (sp, cam, ang) => { const az = 55 * Math.PI / 180 * Math.cos(ang), el = (26 * Math.sin(ang) - 2) * Math.PI / 180; sp.position.set(cam.x + Math.sin(az) * Math.cos(el) * SKY_R, cam.y + Math.sin(el) * SKY_R, cam.z - Math.cos(az) * Math.cos(el) * SKY_R); return el / Math.PI * 180; };

  // drifting clouds: a handful of soft watercolour sprites in three depth bands (nearer: bigger, quicker), over the sky plate, the stars, sun and moon,
  // under the far shore and the trees. Each lives a few minutes and reforms elsewhere from the current weather mix, which shifts every few minutes.
  const cloudTex = (kind, seed) => {
    const [W, H] = kind === 'cumulus' ? [256, 128] : kind === 'wisp' ? [512, 112] : [128, 80], c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    let sd = seed * 9301 + 49297; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const blob = (bx, by, rad, sx, rgb, a) => { x.save(); x.translate(bx, by); x.scale(sx, 1); const g = x.createRadialGradient(0, 0, 0, 0, 0, rad); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(.55, `rgba(${rgb},${a * .7})`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(-rad, -rad, rad * 2, rad * 2); x.restore(); };
    const n = kind === 'cumulus' ? 16 : kind === 'wisp' ? 20 : 6;
    for (let pass = 0; pass < 2; pass++) for (let k = 0; k < n; k++) { sd = seed * 9301 + 49297 + k * 7919;   // the same blobs twice: blue-grey undersides, then the white tops
      if (kind === 'cumulus') { const u = .22 + .56 * r(), rad = H * (.1 + .16 * r()); blob(u * W, H * (.62 - .28 * r() * (1 - Math.abs(u - .5) * 1.6)) + (pass ? 0 : rad * .25), rad, 1, pass ? '255,255,255' : '196,204,220', pass ? .5 : .45); }
      else if (kind === 'wisp') { const u = .2 + .6 * r(), rad = H * (.12 + .08 * r()); blob(u * W, H * (.5 + .15 * Math.sin(u * 7 + seed)) + (pass ? 0 : rad * .2), rad, 2.4 + 1.6 * r(), pass ? '255,255,255' : '214,220,232', pass ? .22 : .16); }
      else { const rad = H * (.12 + .1 * r()); blob(W * (.3 + .4 * r()), H * (.45 + .15 * r()) + (pass ? 0 : rad * .25), rad, 1, pass ? '255,255,255' : '200,208,222', pass ? .5 : .4); } }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const CT = {}, CK = ['cumulus', 'wisp', 'fluff'], CW = { cumulus: [15, .5, .5], wisp: [32, .22, .34], fluff: [6, .62, .42] };   // angular width (degrees), height / width, opacity
  CK.forEach((k, i) => { CT[k] = [cloudTex(k, i * 3 + 1), cloudTex(k, i * 3 + 2)]; });
  const MIXES = [[.6, .15, .25, 9], [.15, .6, .25, 8], [.2, .15, .65, 13], [.35, .35, .3, 11], [.1, .5, .4, 5]];   // weights for cumulus, wisp, fluff; clouds out
  const CB = [[170, 1.6], [215, 1], [260, .62]], NC = 16, CLOUD_SPEED = .0045, calm = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let weather = MIXES[3], mixIn = 200 + Math.random() * 120;
  const form = (c, fresh) => { const w = weather, u = Math.random() * (w[0] + w[1] + w[2]), kind = u < w[0] ? 'cumulus' : u < w[0] + w[1] ? 'wisp' : 'fluff', tx = CT[kind][Math.floor(Math.random() * CT[kind].length)], R = CB[c.band][0];
    const [aw, hr, op] = tx.userData.cw || CW[kind]; c.kind = kind; c.op = op; c.m.map = tx; c.m.needsUpdate = true; c.az = Math.random() * 6.283; c.el = (4 + Math.random() * (kind === 'wisp' ? 26 : 19)) * Math.PI / 180;
    c.life = 100 + Math.random() * 160; c.age = fresh ? Math.random() * c.life : 0; const wd = 2 * R * Math.tan(aw * (.8 + .4 * Math.random()) * Math.PI / 360); c.sp.scale.set(wd, wd * hr, 1); };
  const clouds = Array.from({ length: NC }, (_, i) => { const m = new THREE.SpriteMaterial({ transparent: true, opacity: 0, fog: false, depthWrite: false }), sp = new THREE.Sprite(m);
    sp.frustumCulled = false; sp.renderOrder = -8; scene.add(sp); const c = { sp, m, band: i % 3, on: i < weather[3] ? 1 : 0 }; form(c, true); return c; });
  // painted cumulus (ART.clouds) take over from the drawn ones: wider, a touch more solid, their own aspect
  Promise.all((ART.clouds || []).map(loadTex)).then(ts => { ts = ts.filter(Boolean); if (!ts.length) return; ts.forEach(t => { t.userData.cw = [34, t.image.height / t.image.width, .78]; }); CT.cumulus = ts; clouds.forEach(c => { if (c.kind === 'cumulus') form(c, true); }); });
  const cloudCol = new THREE.Color(), WHITE = new THREE.Color(0xffffff);
  const stepClouds = (dt, hor, night, cam) => {
    if ((mixIn -= dt) < 0) { mixIn = 180 + Math.random() * 180; weather = MIXES.filter(m => m !== weather)[Math.floor(Math.random() * (MIXES.length - 1))]; }
    cloudCol.copy(WHITE).lerp(hor, .45).multiplyScalar(1 - .55 * night); const out = Math.round(weather[3] * (1 - .6 * night)), sp = CLOUD_SPEED * D.cloudSpeed * (calm ? .3 : 1);
    clouds.forEach((c, i) => { c.age += dt; c.on += ((i < out ? 1 : 0) - c.on) * Math.min(1, dt * .05); if (c.age > c.life) form(c, false);
      const R = CB[c.band][0]; c.az += dt * sp * CB[c.band][1]; const ce = Math.cos(c.el);
      c.sp.position.set(cam.x + Math.sin(c.az) * ce * R, cam.y + Math.sin(c.el) * R, cam.z - Math.cos(c.az) * ce * R);
      c.m.opacity = c.op * c.on * smooth(0, 25, c.age) * (1 - smooth(c.life - 25, c.life, c.age)) * (1 - .45 * night); c.m.color.copy(cloudCol); });
  };
  D.cloudSpeed = 1;   // 0 holds them still

  // emissive materials (windows, lantern, truck lights) glow more at night
  const glows = []; const seen = new Set();
  scene.traverse(o => { const m = o.material; if (m && !seen.has(m) && m.emissive && m.emissive.getHex() !== 0) { seen.add(m); glows.push([m, m.emissiveIntensity]); } });

  const k12 = C(12), tint = new THREE.Color(), NOON = new THREE.Color(k12.hemiS).multiplyScalar(k12.hemiI * .6).add(new THREE.Color(k12.sun).multiplyScalar(k12.sunI * .4));
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
    const lk = L(a.lake, b.lake); world.lake.material.color.copy(lk); if (world.lakeGain) world.lake.material.color.multiply(world.lakeGain);   // lakeGain: brings the painted water back to the old lake colour on average
    // after dark the lit lake goes near black; a little of its own colour as glow stands in for the night sky it reflects
    world.lake.material.emissive.copy(lk).multiplyScalar(.35 * N(a.night, b.night));
    // painted planes are unlit: tint them by the light, relative to noon, with a floor so they still read by moonlight
    tint.copy(world.hemi.color).multiplyScalar(world.hemi.intensity * .6).add(tmpB.copy(world.sun.color).multiplyScalar(world.sun.intensity * .4));
    tint.r = Math.max(.07, Math.min(1, tint.r / NOON.r)); tint.g = Math.max(.08, Math.min(1, tint.g / NOON.g)); tint.b = Math.max(.15, Math.min(1, tint.b / NOON.b)); setArtTint(tint);
    const night = D.night = N(a.night, b.night);
    // the sun rises at 6, peaks at 12 and sets at 18; the moon rises at 18 and sets at 6. The light's east-west side follows the visible body.
    const ang = Math.PI * (h - 6) / 12, mang = Math.PI * (((h - 18) % 24 + 24) % 24) / 12;
    const sunEl = place(sunSp, camera.position, ang), moonEl = place(moonSp, camera.position, mang);
    const sx = Math.cos(ang) * 14, sy = 3 + Math.max(0, Math.sin(ang)) * 12, sz = 8, mx = Math.cos(mang) * 10;
    world.sun.position.set(sx * (1 - night) + mx * night, sy * (1 - night) + 14 * night, sz * (1 - night) - 10 * night);
    sunSp.material.opacity = smooth(-3, 3, sunEl) * (1 - .5 * night); sunSp.material.color.copy(sunCol.copy(SUN_LO).lerp(SUN_HI, smooth(2, 28, sunEl)));
    moonSp.material.opacity = smooth(-3, 4, moonEl) * smooth(.15, .7, night); moonSp.material.color.set(0xfdf3d8);
    // the water's glints and path (world.js) follow whichever of the sun and moon is showing: sparkles by day, a long path when the sun is low, a tighter moon path at night
    if (world.water) { const day = smooth(-2, 4, sunEl) * (1 - night), moon = smooth(-2, 5, moonEl) * smooth(.4, .8, night), sun = day >= moon, b = sun ? sunSp : moonSp;
      glDir.set(b.position.x - camera.position.x, b.position.z - camera.position.z).normalize();
      world.water.glint.value.set(glDir.x, glDir.y, sun ? .9 * day : .5 * moon, sun ? .5 * day * (1 - smooth(4, 20, sunEl)) : .4 * moon);
      if (sun) world.water.glintC.value.set(sunCol.r * 1.1, sunCol.g * 1.1, sunCol.b * 1.05, 0); else world.water.glintC.value.set(.78, .82, .92, 1); }
    starMat.opacity = smooth(.55, .95, night); skyMat.uniforms.night.value = night;
    const g = 1 + 1.6 * night; glows.forEach(([m, base]) => { m.emissiveIntensity = base * g; });
    dome.position.copy(camera.position); stars.position.copy(camera.position); stepClouds(dt, hor, night, camera.position);
  };
  return D;
}
