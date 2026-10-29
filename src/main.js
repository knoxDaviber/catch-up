import * as THREE from 'three';
import { buildWorld, SEAT_X } from './scene/world.js';
import { buildBoard } from './scene/board.js';
import { CameraRig } from './scene/rig.js';
import { MiniChess } from './chess/engine.js';
import { createFishing, bobberPos } from './game/fishing.js';
import { buildLakeLife } from './scene/lake_life.js';
import { line } from './game/lines.js';
import { createDialogue } from './game/dialogue.js';
import { createDayNight } from './scene/daynight.js';
import { buildCampfire } from './scene/campfire.js';
import { buildGallery } from './scene/gallery.js';
import { fishHtml } from './assets/fishart.js';
import { createAudio } from './audio/audio.js';
import { loadSettings, saveSettings, clockText } from './ui/settings.js';

const $ = id => document.getElementById(id);
const stage = $('stage'), canvas = $('view');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- renderer, world, camera ---------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 16 / 9, .05, 400);
const world = buildWorld(scene);
const board = buildBoard(scene);
const gallery = buildGallery();
const rig = new CameraRig(camera);
const settings = loadSettings();
const audio = createAudio(settings);
const unlockAudio = () => audio.unlock();
addEventListener('pointerdown', unlockAudio); addEventListener('keydown', unlockAudio);
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('button') && !e.target.closest('.pk')) audio.sfx('click'); });
const dayNight = createDayNight(scene, world, camera);
const campfire = buildCampfire(scene);
function applySettings() {
  dayNight.cycle = settings.cycle; dayNight.dayMin = settings.dayMin;
  rig.sway = settings.sway && !reduce; rig.tilt = settings.tilt;
}
applySettings();

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix(); gallery.camera.aspect = w / h; gallery.camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage); resize();

/* ---------- game state ---------- */
let scene_ = 'title';                 // title | select | sit | game | leaving | gallery
let player = 'liam', view = 'fish', game = null;
const st = { selected: null, legal: [], hover: null, lastMove: null };
let friendTimer = 0, capTimer = 0;
const side = () => (player === 'liam' ? 1 : -1);
const friend = () => (player === 'liam' ? 'Xiao' : 'Liam');
const nameOf = p => (p === 'liam' ? 'Liam' : 'Xiao');
let myColor = 'b', plies = 0, swapAsked = false, askTimer = 0;   // you start as black; sides can be swapped early or between games
const friendColor = () => (myColor === 'b' ? 'w' : 'b');
const boardSide = () => (myColor === 'b' ? side() : -side());   // keeps your pieces on your side of the stump
const playable = () => scene_ === 'game' && view === 'board' && !rig.tween && !asking && game && !game.game_over() && game.turn() === myColor;

let lastSpoke = 0;
const fk = () => (player === 'liam' ? 'xiao' : 'liam');            // the friend's key
const bark = (key, vars, ms) => say(friend(), line(fk(), key, vars), ms);
const PIECE = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
function say(who, text, ms = 4200) {
  lastSpoke = performance.now(); if (who === friend()) audio.sfx('blip');
  $('capWho').textContent = who; $('capText').textContent = text; $('caption').classList.add('show');
  clearTimeout(capTimer); capTimer = setTimeout(() => $('caption').classList.remove('show'), ms);
}
function draw() { board.setPosition(game, st); }
let turnSince = 0, thinkBarked = false;
function afterMove(byFriend, cap) {
  audio.sfx(cap ? 'capture' : 'move');
  st.selected = null; st.legal = []; draw(); turnSince = performance.now(); thinkBarked = false;
  if (game.in_checkmate()) bark(byFriend ? 'iMate' : 'youMate', {}, 6000);
  else if (game.in_draw()) bark('draw', {}, 5000);
  else if (game.in_check()) bark(byFriend ? 'check' : 'youCheck', {}, 3000);
  else if (cap && Math.random() < (cap === 'p' ? .12 : .45)) bark(byFriend ? 'iCapture' : 'youCapture', { piece: PIECE[cap] }, 3500);
  if (game.game_over()) { clearTimeout(askTimer); askTimer = setTimeout(offerRematch, 3200); }
  updateUI();
}
function friendMove(first) {
  if (!game || game.game_over() || game.turn() !== friendColor()) return;
  const ms = game.moves(), pick = a => a[Math.floor(Math.random() * a.length)];
  let m;
  if (first === true && friendColor() === 'w') { const o = pick(['e2e4', 'd2d4', 'g1f3', 'c2c4']); m = ms.find(x => x.from + x.to === o); }
  if (!m) { const caps = ms.filter(x => x.captured); m = caps.length && Math.random() < .55 ? pick(caps) : pick(ms); }
  game.move({ from: m.from, to: m.to, promotion: m.promotion || 'q' });
  plies++; st.lastMove = { from: m.from, to: m.to }; afterMove(true, m.captured);
  if (!game.game_over() && !game.in_check()) bark('yourMove', {}, first === true ? 5000 : 3000);
}
function onSquare(sq) {
  if (!playable()) return;
  const pc = game.get(sq);
  if (st.selected && st.legal.includes(sq)) {
    const from = st.selected;
    const cap = game.get(sq) && game.get(sq).type;
    if (game.move({ from, to: sq, promotion: 'q' })) {
      plies++; st.lastMove = { from, to: sq }; afterMove(false, cap);
      if (!game.game_over()) friendTimer = setTimeout(friendMove, 900 + Math.random() * 800);
    }
    return;
  }
  if (pc && pc.color === myColor) { audio.sfx('select'); st.selected = sq; st.legal = game.moves({ square: sq }).map(m => m.to); } else { st.selected = null; st.legal = []; }
  draw();
}
function newGame() {
  clearTimeout(friendTimer); Object.assign(st, { selected: null, legal: [], hover: null, lastMove: null });
  game = new MiniChess(); plies = 0; swapAsked = false; board.setSide(boardSide()); draw();
}

/* ---------- asking questions: swap sides, rematch ---------- */
let asking = false;
function ask(text, options) {   // options: [[label, fn]]
  asking = true; $('askText').textContent = text; const box = $('askBtns'); box.textContent = '';
  options.forEach(([label, fn]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', () => { closeAsk(); fn && fn(); }); box.appendChild(b); });
  $('ask').hidden = false; box.querySelector('button')?.focus(); updateUI();
}
function closeAsk() { asking = false; $('ask').hidden = true; updateUI(); }
function swapSides(lines) {
  myColor = friendColor(); clearTimeout(friendTimer); clearTimeout(askTimer);
  newGame(); say(friend(), lines || line(fk(), 'swapDone'), 3500); startFriendIfFirst(1800);
}
function startFriendIfFirst(ms) { if (friendColor() === 'w') friendTimer = setTimeout(() => friendMove(true), ms); else bark('youFirst', {}, 3500); }
const canAskSwap = () => scene_ === 'game' && game && !game.game_over() && plies < 6 && !swapAsked && !asking;
function askToSwap() {
  if (!canAskSwap()) return; swapAsked = true; updateUI();
  say(nameOf(player), 'Mind if we swap sides?', 2200);
  setTimeout(() => {
    if (scene_ !== 'game') return;
    if (Math.random() < .8) swapSides(line(fk(), 'swapYes'));
    else bark('swapNo', {}, 3500);
  }, 1400);
}
function maybeFriendAsksSwap() {
  if (Math.random() < .18) {
    const text = line(fk(), 'swapAsk'); say(friend(), text, 4000);
    ask(text, [['Sure', () => swapSides(line(fk(), 'swapDone'))], ['Keep sides', () => { newGame(); startFriendIfFirst(1000); }]]);
  } else { newGame(); startFriendIfFirst(1200); }
}
function offerRematch() {
  if (scene_ !== 'game' || !game || !game.game_over() || asking) return;
  const text = line(fk(), 'again'); say(friend(), text, 4000);
  ask(text, [
    ['Same sides', maybeFriendAsksSwap],
    ['Swap sides', () => swapSides(line(fk(), 'swapDone'))],
    ['Not now', null],
  ]);
}
/* ---------- conversation ---------- */
const story = createDialogue();
let talking = false, inviteUntil = 0, nextIdle = performance.now() + 45000, nextInvite = performance.now() + 100000;
const canTalk = () => scene_ === 'game' && !asking && !talking && !fishing.catchOpen && story.any(fk());
function renderTalk(n, next) {
  $('tWho').textContent = n.who; $('tText').textContent = n.text;
  const box = $('tChoices'); box.textContent = ''; $('talk').hidden = false;
  (n.choices || ['Continue']).forEach((t, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.addEventListener('click', () => next(n.choices ? i : undefined)); box.appendChild(b); });
  box.querySelector('button')?.focus();
}
function closeTalk() { talking = false; $('talk').hidden = true; lastSpoke = performance.now(); updateUI(); }
const talkUi = { show: (n, next) => renderTalk({ who: n.who === 'me' ? nameOf(player) : friend(), text: n.text, choices: n.choices }, next), close: closeTalk };
function openTopics() {
  if (!canTalk()) return;
  const list = story.available(fk()); talking = true; inviteUntil = 0; $('caption').classList.remove('show');
  renderTalk({ who: '', text: 'What do you want to talk about?', choices: [...list.map(t => t.label), 'Never mind'] }, i => { if (i >= list.length) closeTalk(); else story.run(fk(), list[i].id, talkUi); });
  updateUI();
}
function tickTalk(now) {
  const chip = $('talkBtn'); chip.classList.toggle('urgent', now < inviteUntil);
  if (scene_ !== 'game' || asking || talking || fishing.catchOpen || fishing.bite) return;
  if (view === 'board' && playable() && !thinkBarked && now - turnSince > 50000) { thinkBarked = true; bark('thinkLong', {}, 4000); return; }
  if (now > nextInvite && story.any(fk())) { bark('invite', {}, 4500); inviteUntil = now + 20000; nextInvite = now + 110000 + Math.random() * 60000; return; }
  if (now > nextIdle && now - lastSpoke > 12000) { bark(Math.random() < .2 ? 'idleAny' : view === 'board' ? 'idleChess' : 'idleFish', {}, 4500); nextIdle = now + 45000 + Math.random() * 35000; }
}
/* ---------- fishing ---------- */
const mySeatX = () => -side() * SEAT_X;
const fishing = createFishing({
  say, friend, mySeatX, sfx: n => audio.sfx(n), line: (key, vars) => line(fk(), key, vars),
  onChange: () => updateUI(),
  onCatch: c => showCatch(c),
});
fishing.init();
const lakeUpdate = buildLakeLife(scene, fishing, () => (mySeatX() < 0 ? -1 : 1));
let pendingStrike = false;
function showCatch(c) {
  $('catchFish').innerHTML = fishHtml(c.kind);
  $('catchTitle').textContent = `You caught a ${c.kind.name.toLowerCase()}!`;
  $('catchMeta').textContent = `${c.size} cm · ${c.before ? `you have caught ${c.before} before` : 'new for your journal'}`;
  const box = $('catchNames'); box.textContent = '';
  c.names.forEach(nm => { const b = document.createElement('button'); b.type = 'button'; b.textContent = nm; b.addEventListener('click', () => finishCatch(nm)); box.appendChild(b); });
  $('nameIn').value = ''; $('catch').hidden = false; box.querySelector('button')?.focus(); updateUI();
}
function finishCatch(nick) { $('catch').hidden = true; fishing.finishCatch(nick); renderJournal(); updateUI(); }
function renderJournal() {
  const j = $('journal'); j.textContent = ''; j.hidden = !fishing.journal.length;
  fishing.journal.forEach(e => { const s = document.createElement('span'); s.className = 'chipj'; s.textContent = `${e.name} \u00d7${e.n}${e.nicks.length ? ' \u00b7 ' + e.nicks.join(', ') : ''}`; j.appendChild(s); });
}
$('talkBtn').addEventListener('click', openTopics);
$('swapBtn').addEventListener('click', () => { if (game && game.game_over()) offerRematch(); else askToSwap(); });
$('nameForm').addEventListener('submit', e => { e.preventDefault(); finishCatch($('nameIn').value); });
$('catchSkip').addEventListener('click', () => finishCatch(''));
function strike() { if (scene_ === 'game' && view === 'fish' && !rig.tween) fishing.strike(); }

/* ---------- people: who is you ---------- */
function syncPeople() {
  const mine = world.people[player];
  // first-person: hide your own head while the camera is inside it
  mine.head.visible = !(scene_ === 'game' || scene_ === 'sit') || rig.u > .5 || rig.wide > .02;
  world.people[player === 'liam' ? 'xiao' : 'liam'].head.visible = true;
}

/* ---------- scene flow ---------- */
function setScene(s) {
  scene_ = s; rig.mode = s;
  stage.classList.toggle('intro', s === 'title' || s === 'select');
  stage.classList.toggle('ingame', s === 'game' || s === 'sit' || s === 'leaving');
  $('intro').hidden = s !== 'title'; $('pick').hidden = s !== 'select'; $('quitBtn').hidden = s !== 'game'; $('topRight').hidden = s !== 'game'; $('galBack').hidden = s !== 'gallery';
  stage.classList.toggle('ingallery', s === 'gallery');
  updateUI();
}
function blackout(mid, hold) {
  $('fade').classList.add('on');
  setTimeout(() => { mid(); setTimeout(() => $('fade').classList.remove('on'), hold); }, 800);
}
function startPick(p) {
  if (scene_ !== 'select') return;
  audio.sfx('grunt'); player = p; myColor = 'b'; rig.side = side(); setScene('sit'); say(nameOf(p), '*heave-ho*', 1700);
  blackout(() => {
    rig.selTarget = 0; rig.sel = 0; rig.tween = null; rig.wide = 0; rig.u = 0; view = 'fish';
    newGame(); fishing.reset(); renderJournal(); rig.sitT = performance.now(); setScene('game');
    startFriendIfFirst(1400);
  }, 500);
}
function quitToTitle() {
  if (scene_ !== 'game') return;
  audio.sfx('grunt'); scene_ = 'leaving'; clearTimeout(friendTimer); clearTimeout(askTimer); closeAsk(); $('quitBtn').hidden = true;
  closeTalk(); say(nameOf(player), (player === 'liam' ? '*grunt* ' : '*stands, stiffly* ') + line(player, 'quit' + story.tier(), { you: friend() }), 3600);
  blackout(() => {
    rig.tween = null; rig.wide = 1; rig.u = 0; rig.sel = 0; rig.selTarget = 0; rig.sitT = -1; view = 'wide';
    newGame(); fishing.reset(); $('catch').hidden = true; pendingStrike = false; setScene('title');
  }, 2600);
}
function goView(v) {
  if (scene_ !== 'game' || v === view) return;
  view = v; rig.goTo(v === 'board' ? 'board' : 'fish', 2.8, () => {
    if (v === 'fish' && pendingStrike) { pendingStrike = false; if (fishing.bite) fishing.strike(); }
    else if (v === 'board' && !fishing.bite && game.turn() === myColor) say(friend(), 'Take your time.', 3000);
    updateUI();
  });
  updateUI();
}
function updateUI() {
  $('viewTag').textContent = ({ fish: 'Fishing view', board: 'Board view', wide: 'Wide shot' })[view] +
    (view === 'board' && game && !rig.tween ? (game.game_over() ? ' · game over' : game.turn() === myColor ? ' · your move' : ` · ${friend()} is thinking`) : '');
  const bite = fishing.bite;
  $('panChip').textContent = view === 'fish' ? (bite ? 'Reel in!' : 'Look at the board ▾') : (bite ? 'A fish! Back to the water ▴' : 'Back to the water ▴');
  $('panChip').classList.toggle('urgent', bite);
  $('panChip').hidden = scene_ !== 'game' || asking;
  const tb = $('talkBtn'); tb.hidden = !canTalk();
  const sb = $('swapBtn'); sb.hidden = !(scene_ === 'game' && view === 'board' && !rig.tween && !asking && game && (game.game_over() || canAskSwap()));
  sb.textContent = game && game.game_over() ? 'Play again\u2026' : 'Ask to swap sides';
  stage.classList.toggle('playable', !!playable());
}

/* ---------- fish gallery ---------- */
let galleryFrom = 'title', drag = null;
function openGallery() {
  if (scene_ !== 'title' && scene_ !== 'game') return; galleryFrom = scene_; closeTalkIfOpen();
  blackout(() => {
    const n = gallery.setFish(fishing.journal); gallery.enter(fishing.journal); setScene('gallery');
    $('galNote').hidden = n > 0; $('galNote').textContent = 'The tank is empty. Catch a fish and give it a name, and it will move in.';
  }, 500);
}
function closeGallery() { if (scene_ !== 'gallery') return; hideFishInfo(); blackout(() => { setScene(galleryFrom); $('galNote').hidden = true; }, 400); }
function closeTalkIfOpen() { if (talking) closeTalk(); }
function showFishInfo(f) {
  gallery.selected = f; $('fiArt').innerHTML = fishHtml(f.kind);
  $('fiTitle').textContent = f.nick || f.kind.name;
  $('fiMeta').textContent = f.nick ? `A ${f.kind.name.toLowerCase()}. You have caught ${f.count} ${f.count === 1 ? 'of its kind' : 'of its kind in all'}.` : `You have caught ${f.count} in all.`;
  $('fishInfo').hidden = false; $('fiClose').focus();
}
function hideFishInfo() { $('fishInfo').hidden = true; gallery.selected = null; }
const galRay = new THREE.Raycaster(), galNdc = new THREE.Vector2(), galPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 1.8), galPt = new THREE.Vector3();
function galPick(e) {
  const r = canvas.getBoundingClientRect(); galNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  galRay.setFromCamera(galNdc, gallery.camera); const hit = galRay.intersectObjects(gallery.fishMeshes(), false)[0]; return hit ? hit.object.userData.fish : null;
}
canvas.addEventListener('pointerdown', e => {
  if (scene_ !== 'gallery') return; const f = galPick(e);
  if (f) { drag = { f, x0: e.clientX, y0: e.clientY, moved: false }; canvas.setPointerCapture(e.pointerId); audio.sfx('pop'); } else hideFishInfo();
});
canvas.addEventListener('pointermove', e => {
  if (scene_ !== 'gallery') return;
  if (!drag) { canvas.style.cursor = galPick(e) ? 'grab' : ''; return; }
  if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) drag.moved = true;
  if (drag.moved) {
    const r = canvas.getBoundingClientRect(); galNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    galRay.setFromCamera(galNdc, gallery.camera); if (galRay.ray.intersectPlane(galPlane, galPt)) { gallery.tank.worldToLocal(galPt); gallery.hold(drag.f, galPt.x, galPt.y); } canvas.style.cursor = 'grabbing';
  }
});
const endDrag = () => { if (!drag) return; if (!drag.moved) showFishInfo(drag.f); gallery.release(drag.f); drag = null; canvas.style.cursor = ''; };
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
$('mGallery').addEventListener('click', openGallery);
$('galBtn').addEventListener('click', openGallery);
$('galBack').addEventListener('click', closeGallery);
$('fiClose').addEventListener('click', hideFishInfo);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && scene_ === 'gallery') { if (!$('fishInfo').hidden) hideFishInfo(); else closeGallery(); } });

/* ---------- settings panel ---------- */
let settingsFrom = null;
function syncSettingsClock() { if (document.activeElement !== $('sHour')) $('sHour').value = dayNight.hour; $('sHourOut').textContent = clockText(dayNight.hour); }
function openSettings() {
  $('sCycle').checked = settings.cycle; $('sLen').value = settings.dayMin; $('sLenOut').textContent = `${settings.dayMin} min`;
  $('sFire').value = settings.fire; $('sSway').checked = settings.sway; $('sTilt').checked = settings.tilt; $('sSway').disabled = reduce;
  $('sMute').checked = settings.muted;
  [['sMusic', 'musicVol'], ['sSfx', 'sfxVol'], ['sAmb', 'ambVol']].forEach(([id, k]) => { $(id).value = settings[k]; $(id + 'Out').textContent = Math.round(settings[k] * 100) + '%'; });
  const tr = $('sTrack'); tr.textContent = ''; audio.tracks().forEach(t => { const o = document.createElement('option'); o.value = t.id; o.textContent = t.name; tr.appendChild(o); }); tr.value = settings.track; $('sMode').value = settings.playMode;
  syncSettingsClock(); settingsFrom = document.activeElement; $('settings').hidden = false; $('setClose').focus();
}
function closeSettings() { $('settings').hidden = true; saveSettings(settings); settingsFrom && settingsFrom.focus && settingsFrom.focus(); }
$('mSettings').addEventListener('click', openSettings);
$('gearBtn').addEventListener('click', openSettings);
$('setClose').addEventListener('click', closeSettings);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('settings').hidden) closeSettings(); });
$('sCycle').addEventListener('change', e => { settings.cycle = e.target.checked; applySettings(); });
$('sHour').addEventListener('input', e => { dayNight.set(parseFloat(e.target.value)); $('sHourOut').textContent = clockText(dayNight.hour); });
$('sLen').addEventListener('input', e => { settings.dayMin = parseInt(e.target.value, 10); $('sLenOut').textContent = `${settings.dayMin} min`; applySettings(); });
$('sMute').addEventListener('change', e => { settings.muted = e.target.checked; audio.applyVolumes(); });
[['sMusic', 'musicVol'], ['sSfx', 'sfxVol'], ['sAmb', 'ambVol']].forEach(([id, k]) => $(id).addEventListener('input', e => { settings[k] = parseFloat(e.target.value); $(id + 'Out').textContent = Math.round(settings[k] * 100) + '%'; audio.applyVolumes(); if (k === 'sfxVol') audio.sfx('catch'); }));
$('sTrack').addEventListener('change', e => audio.setTrack(e.target.value));
$('sMode').addEventListener('change', e => audio.setPlayMode(e.target.value));
$('sFire').addEventListener('change', e => { settings.fire = e.target.value; });
$('sSway').addEventListener('change', e => { settings.sway = e.target.checked; applySettings(); });
$('sTilt').addEventListener('change', e => { settings.tilt = e.target.checked; applySettings(); });

$('mSingle').addEventListener
$('mSingle').addEventListener('click', () => { if (scene_ === 'title') { rig.selTarget = 1; setScene('select'); } });
$('pickBack').addEventListener('click', () => { rig.selTarget = 0; setScene('title'); });
$('pickLiam').addEventListener('click', () => startPick('liam'));
$('pickXiao').addEventListener('click', () => startPick('xiao'));
$('quitBtn').addEventListener('click', quitToTitle);
$('panChip').addEventListener('click', () => {
  if (view === 'fish') { if (fishing.bite) strike(); else goView('board'); }
  else { if (fishing.bite) pendingStrike = true; goView('fish'); }
});
document.addEventListener('keydown', e => { if (e.metaKey || e.ctrlKey || e.altKey || scene_ !== 'game') return; if (e.key === '1') goView('fish'); if (e.key === '2') goView('board'); });
document.addEventListener('keydown', e => { if (e.key === ' ' && scene_ === 'game' && view === 'fish' && !fishing.catchOpen && !['INPUT', 'BUTTON'].includes(e.target.tagName)) { e.preventDefault(); strike(); } });

const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pickSquare(e) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(board.squares, false)[0]; return hit ? hit.object.userData.sq : null;
}
canvas.addEventListener('pointerdown', e => { if (scene_ !== 'game') return; if (view === 'fish') { strike(); return; } if (playable()) { const sq = pickSquare(e); if (sq) onSquare(sq); } });
canvas.addEventListener('pointermove', e => {
  if (!playable()) { if (st.hover) { st.hover = null; draw(); } return; }
  const sq = pickSquare(e); if (sq !== st.hover) { st.hover = sq; draw(); }
});

/* labels over the heads in the pick screen */
const tmp = new THREE.Vector3();
function placePick() {
  [['pickLiam', -SEAT_X], ['pickXiao', SEAT_X]].forEach(([id, x]) => {
    tmp.set(x, 1.62, .26).project(camera); const b = $(id);
    b.style.left = ((tmp.x * .5 + .5) * 100) + '%'; b.style.top = ((-tmp.y * .5 + .5) * 100) + '%';
  });
}

/* ---------- loop ---------- */
let last = performance.now(), lastTick = 0;
function frame(now) {
  const dt = Math.min(.1, (now - last) / 1000); last = now;
  if (now - lastTick > 1000) { lastTick = now; tickTalk(now); audio.setScene(dayNight.night, campfire.level); }
  rig.step(now, dt); fishing.stepFish(dt, now); if (scene_ === 'game') fishing.stepRod(now); lakeUpdate(now); world.update(now);
  dayNight.update(dt); campfire.update(now, dt, settings.fire === 'always' || (settings.fire === 'auto' && dayNight.night > .28) ? 1 : 0);
  if (!$('settings').hidden) syncSettingsClock();
  stage.classList.toggle('night', dayNight.night > .5);
  syncPeople(); if (scene_ === 'select') placePick();
  if (scene_ === 'gallery') { gallery.update(now, dt, dayNight.night); renderer.render(gallery.scene, gallery.camera); } else renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
newGame(); rig.wide = 1; rig.side = 1; setScene('title');
requestAnimationFrame(frame);
window.__cu = { gallery, openGallery, audio, dayNight, campfire, settings, story, openTopics, fishing, state: () => ({ myColor, plies, scene: scene_ }), offerRematch, scene: () => scene_, rig, camera, game: () => game, onSquare, say };
