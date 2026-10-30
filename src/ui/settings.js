/* Player settings, remembered in the browser. */
const KEY = 'catchup.settings.v1';
import { MUSIC } from '../assets/manifest.js';
export const DEFAULTS = { cycle: true, dayMin: 12, fire: 'auto', sway: true, tilt: true, challenge: false, musicVol: .5, sfxVol: .7, ambVol: .5, muted: false, track: MUSIC[0].id, playMode: 'all',
  chessLevel: .35, chessAdaptive: null, tips: {}, ngplus: false };   // chessAdaptive: null = not asked yet; tips: one-off friend hints already given; ngplus: the story has been finished once (New game+)
export function loadSettings() {
  const s = { ...DEFAULTS };
  try { Object.assign(s, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* storage is optional */ }
  return s;
}
export function saveSettings(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore */ } }
export const clockText = h => { const m = Math.floor(((h % 24) + 24) % 24 * 60), hh = Math.floor(m / 60), mm = m % 60; return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'am' : 'pm'}`; };
