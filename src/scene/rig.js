import * as THREE from 'three';
import { SEAT_X, HEAD_Y } from './world.js';

const D2R = Math.PI / 180;
const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = t => t * t * (3 - 2 * t);

export const POSES = {
  wide: { pos: [0, 3.4, 17.5], yaw: 0, pitch: -.1, hfov: 58 },
  title: { pos: [0, 2.2, 11.6], yaw: 0, pitch: -.06, hfov: 78 },
  select: { pos: [0, 2.0, 9.6], yaw: 0, pitch: -.07, hfov: 44 },
};

/** Camera rig: u runs 0 (fishing, head looking at the water) to 1 (high tilted view of the board).
 *  The head turns first, then the rig lifts and leans in while the lens relaxes. */
export function rigPose(u, side, opts = {}) {
  const s = side, H = [-s * SEAT_X, HEAD_Y, .2];
  const tt = ease(clamp(u / .55, 0, 1)), lt = ease(clamp((u - .4) / .6, 0, 1));
  const peek = 12 * D2R, yaw = s * (peek + (Math.PI / 2 - peek) * tt), sy = Math.sin(yaw), cy = Math.cos(yaw);
  const offR = 0, offU = .06, offB = -.04;
  const p0 = [H[0] + cy * offR - sy * offB, H[1] + offU, H[2] + sy * offR + cy * offB];
  const E = [-s * .95, 1.7, .05], T = [0, .58, 0];
  const yawE = Math.atan2(T[0] - E[0], -(T[2] - E[2])), pitchE = -Math.atan2(E[1] - T[1], Math.hypot(T[0] - E[0], T[2] - E[2]));
  return {
    pos: [lerp(p0[0], E[0], lt), lerp(p0[1], E[1], lt), lerp(p0[2], E[2], lt)],
    yaw: lerp(yaw, yawE, lt), pitch: lerp(-9 * D2R, pitchE, lt),
    roll: opts.tilt === false ? 0 : -s * 6 * D2R * lt,
    hfov: lerp(104, 70, lt),
  };
}

export class CameraRig {
  constructor(camera) {
    this.camera = camera; camera.rotation.order = 'YXZ';
    this.u = 0; this.wide = 1; this.sel = 0; this.selTarget = 0; this.side = 1;
    this.mode = 'title'; this.tween = null; this.sitT = -1; this.sway = true; this.tilt = true;
  }
  goTo(view, seconds = 2.8, onDone) {
    const u1 = view === 'board' ? 1 : view === 'fish' ? 0 : this.u, w1 = view === 'wide' ? 1 : 0;
    this.tween = { t0: performance.now(), d: seconds * 1000, u0: this.u, u1, w0: this.wide, w1, onDone };
  }
  step(now, dt) {
    const tw = this.tween;
    if (tw) {
      const p = clamp((now - tw.t0) / tw.d, 0, 1), e = ease(p);
      this.u = lerp(tw.u0, tw.u1, e); this.wide = lerp(tw.w0, tw.w1, e);
      if (p >= 1) { this.u = tw.u1; this.wide = tw.w1; this.tween = null; tw.onDone && tw.onDone(); }
    }
    this.sel += clamp(this.selTarget - this.sel, -dt * .6, dt * .6);
    const a = rigPose(this.u, this.side, { tilt: this.tilt }), m = ease(this.wide), intro = this.mode === 'title' || this.mode === 'select';
    const W = intro ? POSES.title : POSES.wide;
    const p = {
      pos: a.pos.map((v, i) => lerp(v, W.pos[i], m)), yaw: lerp(a.yaw, W.yaw, m), pitch: lerp(a.pitch, W.pitch, m),
      roll: lerp(a.roll, 0, m), hfov: lerp(a.hfov, W.hfov, m),
    };
    const sm = ease(this.sel), S = POSES.select;
    if (sm > 0) { p.pos = p.pos.map((v, i) => lerp(v, S.pos[i], sm)); p.pitch = lerp(p.pitch, S.pitch, sm); p.hfov = lerp(p.hfov, S.hfov, sm); }
    if (this.mode === 'title') p.pos[0] += Math.sin(now / 5200) * .3;
    if (this.sitT > 0) { const se = 1 - ease(clamp((now - this.sitT) / 2400, 0, 1)); p.pos[1] += .5 * se; p.pitch -= .1 * se; p.pos[2] += .15 * se; }
    if (this.sway) { p.yaw += Math.sin(now / 2100) * .011 * (1 - m * .6); p.pitch += Math.sin(now / 1700 + 1) * .007; p.pos[1] += Math.sin(now / 2600) * .008 * (1 - m); }
    const c = this.camera; c.position.set(...p.pos); c.rotation.set(p.pitch, -p.yaw, p.roll); c.fov = p.hfov / c.aspect > 0 ? this.vfov(p.hfov) : 60; c.updateProjectionMatrix();
    this.pose = p;
  }
  vfov(hfovDeg) { const a = this.camera.aspect; return 2 * Math.atan(Math.tan(hfovDeg * D2R / 2) / a) / D2R; }
}
