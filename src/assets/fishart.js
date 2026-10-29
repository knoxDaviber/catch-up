import * as THREE from 'three';
import { FISH_ART } from './manifest.js';

/* Fish pictures. If assets/manifest.js names an image for a kind, that image is used everywhere.
   Otherwise a simple drawn placeholder is used. Art should face RIGHT, on a transparent background, roughly 2:1. */
export function fishSvgString(k) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 70"><path d="M12 35 Q40 6 84 12 Q112 16 124 35 Q112 54 84 58 Q40 64 12 35Z" fill="${k.col}"/><path d="M16 38 Q50 62 90 56 Q112 52 122 38 Q90 48 16 38Z" fill="${k.belly}" opacity=".85"/><path d="M116 35 L140 14 L140 56Z" fill="${k.col}"/><path d="M56 14 Q66 0 84 12Z" fill="${k.col}" opacity=".8"/><circle cx="34" cy="31" r="4" fill="#3A3228"/></svg>`;
}
/** Placeholder art faces LEFT in the old card; the aquarium wants RIGHT, so the texture flips it. */
export function fishHtml(k) {
  const art = FISH_ART[k.id];
  return art ? `<img src="${art}" alt="" style="width:130px;display:block">` : fishSvgString(k).replace('<svg ', '<svg aria-hidden="true" style="width:130px;display:block" ');
}
const cache = new Map();
export function fishTexture(k) {
  if (cache.has(k.id)) return cache.get(k.id);
  const tex = new THREE.Texture(); tex.colorSpace = THREE.SRGBColorSpace;
  const img = new Image();
  const art = FISH_ART[k.id];
  img.onload = () => {   // draw into a canvas first: uploads are more reliable than using an SVG image directly
    const w = Math.min(1024, img.naturalWidth || 280), h = Math.round(w * ((img.naturalHeight || 140) / (img.naturalWidth || 280)));
    const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h);
    tex.userData.aspect = h / w; tex.image = c; tex.needsUpdate = true;
  };
  if (art) { img.onerror = () => { img.onerror = null; img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(fishSvgString(k)); }; img.src = art; }
  else img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(fishSvgString(k));
  // the placeholder drawing faces left (head at the left); mirror it so every fish faces right
  tex.userData.faceLeft = !art; tex.userData.aspect = .5;
  cache.set(k.id, tex); return tex;
}
