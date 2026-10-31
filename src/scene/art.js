import * as THREE from 'three';

/* Painted art on the 3D stage: one shared loader, cached textures and materials, upright cutout planes and a day/night tint.
   A null path, a file that fails to load, or ?noart in the URL resolves to null, and the caller keeps its placeholder. */
export const NOART = typeof location !== 'undefined' && new URLSearchParams(location.search).has('noart');
const loader = new THREE.TextureLoader(), texs = new Map(), mats = new Map(), tinted = [], bills = [];

export function loadTex(path) {
  if (!path || NOART) return Promise.resolve(null);
  if (!texs.has(path)) texs.set(path, new Promise(res => loader.load(path, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; res(t); }, undefined, () => { console.warn('art: could not load', path); res(null); })));
  return texs.get(path);
}

/** A shared unlit, fogged material for a painted texture. It follows the day/night tint (setArtTint), times `shade` (a hex colour: darker or bluer for depth).
 *  Default: alpha-tested so it sorts like an opaque mesh. */
export function artMat(t, opts = {}, shade = 0xffffff) {
  const key = t.uuid + JSON.stringify(opts) + shade;
  if (!mats.has(key)) { const m = new THREE.MeshBasicMaterial({ map: t, alphaTest: .4, side: THREE.DoubleSide, ...opts }); m.color.set(shade); mats.set(key, m); tinted.push([m, new THREE.Color(shade)]); }
  return mats.get(key);
}

/** Unit plane with its origin at the bottom-left corner, so meshes scale up from the ground. */
export const PLANE = new THREE.PlaneGeometry(1, 1).translate(.5, .5, 0);

/** An upright painted plane, bottom-anchored at (x, y, z) in world space; h is its height in metres and ax the fraction of its width over the anchor.
 *  yaw null turns it to face the camera each frame (about Y only); a number fixes it. shade darkens it (see artMat), flip mirrors it. onLoad(mesh) runs once the art is in. */
export function cutout(parent, path, x, z, h, { y = 0, ax = .5, yaw = null, dz = 0, shade, flip = false, onLoad } = {}) {
  const pivot = new THREE.Group(); pivot.position.set(x, y, z); parent.add(pivot);
  loadTex(path).then(t => { if (!t) return; const w = h * t.image.width / t.image.height, m = new THREE.Mesh(PLANE, artMat(t, {}, shade)); m.scale.set(flip ? -w : w, h, 1); m.position.set(flip ? ax * w : -ax * w, 0, dz); pivot.add(m);
    if (yaw === null) bills.push(pivot); else pivot.rotation.y = yaw; onLoad && onLoad(m); });
  return pivot;
}

export const faceCamera = (o, cam) => { o.rotation.y = Math.atan2(cam.position.x - o.position.x, cam.position.z - o.position.z); };
export function updateArt(cam) { bills.forEach(o => faceCamera(o, cam)); }
/** Every painted material takes this colour, so the art darkens and warms with the light like the 3D world. */
export function setArtTint(c) { tinted.forEach(([m, k]) => m.color.copy(c).multiply(k)); }

/** Wind for swaying plants: WIND.value is a clock in seconds (world.update runs it, slower for reduced motion). sway(m, amp) bends a cutout material's top
 *  sideways by up to amp of its width, each plant on its own phase from where it stands. Works on plain and instanced meshes. */
export const WIND = { value: 0 };
export function sway(m, amp = .04) {
  if (m.userData.sway) return; m.userData.sway = amp;
  m.onBeforeCompile = sh => { sh.uniforms.wind = WIND; sh.vertexShader = 'uniform float wind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    #ifdef USE_INSTANCING
      vec2 swP = instanceMatrix[3].xz;
    #else
      vec2 swP = modelMatrix[3].xz;
    #endif
    transformed.x += (sin(wind * 1.1 + swP.x * .9 + swP.y * .6) + .4 * sin(wind * 2.3 + swP.y * 1.7)) * ${amp.toFixed(3)} * uv.y * uv.y;`); };
  m.customProgramCacheKey = () => 'sway' + amp; m.needsUpdate = true;
}
