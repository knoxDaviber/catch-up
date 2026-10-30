import * as THREE from 'three';
import { buildWorld, SEAT_X } from './scene/world.js';
import { buildBoard } from './scene/board.js';
import { CameraRig } from './scene/rig.js';
import { MiniChess } from './chess/engine.js';
<<<<<<< HEAD
import { chooseMove, bestMove, material } from './chess/ai.js';
import { createFishing, bobberPos, KINDS } from './game/fishing.js';
import { buildLakeLife } from './scene/lake_life.js';
import { line } from './game/lines.js';
import { loadStory } from './game/story.js';
=======
import { createFishing, bobberPos } from './game/fishing.js';
import { buildLakeLife } from './scene/lake_life.js';
import { line } from './game/lines.js';
import { createDialogue } from './game/dialogue.js';
>>>>>>> origin/main
import { createDayNight } from './scene/daynight.js';
import { buildCampfire } from './scene/campfire.js';
import { createFight } from './game/fight.js';
import { buildGallery } from './scene/gallery.js';
import { fishHtml } from './assets/fishart.js';
import { createAudio } from './audio/audio.js';
import { loadSettings, saveSettings, clockText } from './ui/settings.js';

const $ = id => document.getElementById(id);
const stage = $('stage'), canvas = $('view');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
<<<<<<< HEAD
const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), D2R = Math.PI / 180;
=======
>>>>>>> origin/main

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
<<<<<<< HEAD
// talking and the friend's messages never block the rod: you can strike mid-conversation
// focus: a heavy story beat (#focus in the ink) holds everything else until it's answered: no casting, no moves, no turning away
let focus = null, moves = [];   // moves: this chess game so far, {from, to, promotion}, replayed when a trip is resumed
const overlayOpen = () => scene_ !== 'game' || fishing.catchOpen || fishing.fighting || !$('settings').hidden || !!focus || !$('tackle').hidden;
const playable = () => scene_ === 'game' && view === 'board' && !rig.tween && !promoting && !focus && $('settings').hidden && game && !game.game_over() && game.turn() === myColor;
=======
const overlayOpen = () => scene_ !== 'game' || asking || talking || fishing.catchOpen || fishing.fighting || !$('settings').hidden;
const playable = () => scene_ === 'game' && view === 'board' && !rig.tween && !asking && !talking && $('settings').hidden && game && !game.game_over() && game.turn() === myColor;
>>>>>>> origin/main

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
<<<<<<< HEAD
  if (game.game_over()) { adaptAfterGame(); clearTimeout(askTimer); setTimeout(() => maybeOfferAdapt(true), 2000); askTimer = setTimeout(offerRematch, 4200); }
  else { maybeChessBetter(); maybeOfferAdapt(false); }
  updateUI();
}
const nm = i => 'abcdefgh'[i & 7] + ((i >> 3) + 1);
/** Slide the moved piece; castling slides the rook as well. */
function animateMove(from, to, flag) {
  const r = to[1], mv = [{ from, to }];
  if (flag === 'ck') mv.push({ from: 'h' + r, to: 'f' + r }); if (flag === 'cq') mv.push({ from: 'a' + r, to: 'd' + r });
  board.animate(mv);
}
let ease = 0;   // 0..1: how much the friend is softening on purpose right now
function friendLevel() {
  // adaptive: lean in when you are ahead on the board, lean back when they are well ahead
  let lv = settings.chessLevel; ease = 0;
  if (settings.chessAdaptive) { const m = material(game.state()) * (friendColor() === 'w' ? 1 : -1); if (m < -250) lv = Math.min(1, lv + .2); if (m > 350) ease = .6; }
  return lv;
}
function friendMove(first) {
  if (!game || game.game_over() || game.turn() !== friendColor()) return;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  let m;
  // a favourite first move, then the friend's own judgement (see chess/ai.js)
  if (first === true && friendColor() === 'w') { const o = pick(fk() === 'xiao' ? ['d2d4', 'c2c4', 'g1f3'] : ['e2e4', 'e2e4', 'd2d4']); m = game.moves().find(x => x.from + x.to === o); }
  if (!m) { const em = chooseMove(game.state(), { style: fk(), level: friendLevel(), ease, keys: game.keys() }); m = { from: nm(em.f), to: nm(em.t), promotion: em.promo || undefined, captured: em.cap ? em.cap[1] : undefined }; }
  const r = game.move({ from: m.from, to: m.to, promotion: m.promotion || 'q' }); if (r) moves.push({ from: m.from, to: m.to, promotion: m.promotion || 'q' });
  plies++; animateMove(m.from, m.to, r && r.flag); st.lastMove = { from: m.from, to: m.to }; afterMove(true, m.captured);
=======
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
>>>>>>> origin/main
  if (!game.game_over() && !game.in_check()) bark('yourMove', {}, first === true ? 5000 : 3000);
}
function onSquare(sq) {
  if (!playable()) return;
  const pc = game.get(sq);
  if (st.selected && st.legal.includes(sq)) {
    const from = st.selected;
<<<<<<< HEAD
    if (game.get(from).type === 'p' && (sq[1] === '8' || sq[1] === '1')) { choosePromotion(from, sq); return; }
    playMine(from, sq, 'q');
=======
    const cap = game.get(sq) && game.get(sq).type;
    if (game.move({ from, to: sq, promotion: 'q' })) {
      plies++; st.lastMove = { from, to: sq }; afterMove(false, cap);
      if (!game.game_over()) friendTimer = setTimeout(friendMove, 900 + Math.random() * 800);
    }
>>>>>>> origin/main
    return;
  }
  if (pc && pc.color === myColor) { audio.sfx('select'); st.selected = sq; st.legal = game.moves({ square: sq }).map(m => m.to); } else { st.selected = null; st.legal = []; }
  draw();
}
<<<<<<< HEAD
function playMine(from, to, promo) {
  const cap = game.get(to) && game.get(to).type; board.setHint(null);
  const r = game.move({ from, to, promotion: promo });
  if (r) {
    moves.push({ from, to, promotion: promo }); plies++; animateMove(from, to, r.flag); st.lastMove = { from, to }; afterMove(false, cap);
    if (!game.game_over()) friendTimer = setTimeout(friendMove, 1100 + Math.random() * 1700);
  }
}
/* your pawn reached the far side: you decide what it becomes, in a little message of your own */
let promoting = false;
function choosePromotion(from, to) {
  promoting = true; st.selected = null; st.legal = []; draw(); updateUI();
  const go = p => () => { promoting = false; playMine(from, to, p); };
  msg(nameOf(player), 'Made it to the end. It becomes a...', [['Queen', go('q')], ['Rook', go('r')], ['Bishop', go('b')], ['Knight', go('n')]], { mine: true, ms: 20000, onSilence: go('q') });
}
/* hints and take-backs, asked out loud */
function askHint() {
  if (!playable()) return;
  say(nameOf(player), 'Any ideas?', 1600);
  setTimeout(() => {
    if (!playable()) return; const em = bestMove(game.state(), game.keys()); if (!em) return;
    board.setHint({ from: nm(em.f), to: nm(em.t) }); draw(); bark('hint', {}, 3200);
  }, 900);
}
function takeBack() {
  if (scene_ !== 'game' || view !== 'board' || rig.tween || promoting || !game) return;
  let n = 0;
  if (game.turn() === friendColor()) n = 1;              // they have not answered yet (or you just finished the game)
  else if (game.history() >= 2) n = 2;                    // undo their reply and your move
  if (!n || (n === 2 && plies < 2)) return;
  clearTimeout(friendTimer); clearTimeout(askTimer); game.undo(n); plies -= n; moves.length = Math.max(0, moves.length - n);
  Object.assign(st, { selected: null, legal: [], lastMove: null }); board.setHint(null); draw();
  say(nameOf(player), 'Wait, can I take that back?', 1800); setTimeout(() => bark('takeback', {}, 3000), 1300);
  turnSince = performance.now(); updateUI();
}
/* adaptive strength: the friend offers it in conversation, never in a menu */
let adaptDeclined = false, offeredThisGame = false;
function maybeOfferAdapt(over) {
  if (scene_ !== 'game' || offeredThisGame || adaptDeclined || settings.chessAdaptive !== null || asking || talking) return;
  let dir = 0;
  if (over) { if (game.in_checkmate()) dir = game.turn() === myColor ? -1 : 1; }
  else { const m = material(game.state()) * (myColor === 'w' ? 1 : -1); dir = m >= 400 ? 1 : m <= -600 ? -1 : 0; }
  if (!dir) return; offeredThisGame = true;
  ask(line(fk(), dir > 0 ? 'adaptUp' : 'adaptDown'), dir > 0
    ? [['Bring it', () => setAdapt(.15, 'adaptHard')], ['Keep it friendly', declineAdapt]]
    : [['Go on, then', () => setAdapt(-.15, 'adaptEasy')], ["Nah, I've got this", declineAdapt]], { ms: 16000 });
}
function setAdapt(dl, key) { settings.chessAdaptive = true; settings.chessLevel = clamp(settings.chessLevel + dl, .05, 1); saveSettings(settings); setTimeout(() => bark(key, {}, 3000), 500); }
function declineAdapt() { adaptDeclined = true; setTimeout(() => bark('adaptKeep', {}, 3000), 500); }   // only for this sitting; they may ask again another day
function adaptAfterGame() {
  if (!settings.chessAdaptive || !game.in_checkmate()) return;
  settings.chessLevel = clamp(settings.chessLevel + (game.turn() !== myColor ? .1 : -.08), .05, 1); saveSettings(settings);
}
function newGame() {
  clearTimeout(friendTimer); Object.assign(st, { selected: null, legal: [], hover: null, lastMove: null }); board.setHint(null); offeredThisGame = false; promoting = false;
  game = new MiniChess(); plies = 0; moves = []; swapAsked = false; board.setSide(boardSide()); draw();
}

/* ---------- messages: the friend texts you, right above the Talk button ---------- */
let asking = false;   // a question is waiting for an answer; it never blocks play, and silence is an answer too
function msg(who, text, replies, { ms = 9000, onSilence, mine = false, beat = false } = {}) {   // ms 0: no reply timer, it waits to be answered
  const box = $('msgs'), el = document.createElement('div'); el.className = 'msg' + (mine ? ' mine' : '') + (beat ? ' beat' : '') + (who || text ? '' : ' bare') + (ms ? '' : ' hold');
  const w = document.createElement('span'); w.className = 'mwho'; w.textContent = who; el.append(w, text);
  let done = false, t = 0; const close = () => { if (done) return; done = true; clearTimeout(t); el.classList.add('out'); setTimeout(() => el.remove(), 400); };
  if (replies && replies.length) {
    const r = document.createElement('div'); r.className = 'mreplies';
    replies.forEach(([label, fn]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', () => { if (done) return; close(); fn && fn(); }); r.appendChild(b); });
    el.append(r);
    if (ms) { const tm = document.createElement('div'), bar = document.createElement('i'); tm.className = 'mtimer'; bar.style.animationDuration = ms + 'ms'; tm.appendChild(bar); el.append(tm); }
  }
  if (who === friend()) audio.sfx('blip');
  box.appendChild(el); while (box.children.length > 4) { const o = [...box.children].find(c => !c.classList.contains('hold')); if (!o) break; o.remove(); }   // an untimed question is never pushed out
  if (ms) t = setTimeout(() => { if (!done) { close(); onSilence && onSilence(); } }, ms);
  return close;
}
function ask(text, options, opts = {}) {   // options: [[label, fn]]; letting it time out runs opts.onSilence
  asking = true; updateUI();
  const end = fn => () => { asking = false; fn && fn(); updateUI(); };
  return msg(friend(), text, options.map(([l, fn]) => [l, end(fn)]), { ms: opts.ms || 14000, onSilence: end(opts.onSilence) });
}
function clearMsgs() { $('msgs').textContent = ''; asking = false; }
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
    const keep = () => { newGame(); startFriendIfFirst(1000); };
    ask(line(fk(), 'swapAsk'), [['Sure', () => swapSides(line(fk(), 'swapDone'))], ['Keep sides', keep]], { onSilence: keep });
  } else { newGame(); startFriendIfFirst(1200); }
}
function offerRematch() {
  if (scene_ !== 'game' || !game || !game.game_over()) return;
  if (asking) { clearTimeout(askTimer); askTimer = setTimeout(offerRematch, 3000); return; }   // let the other question finish first
  ask(line(fk(), 'again'), [
=======
    const text = line(fk(), 'swapAsk'); say(friend(), text, 4000);
    ask(text, [['Sure', () => swapSides(line(fk(), 'swapDone'))], ['Keep sides', () => { newGame(); startFriendIfFirst(1000); }]]);
  } else { newGame(); startFriendIfFirst(1200); }
}
function offerRematch() {
  if (scene_ !== 'game' || !game || !game.game_over() || asking) return;
  const text = line(fk(), 'again'); say(friend(), text, 4000);
  ask(text, [
>>>>>>> origin/main
    ['Same sides', maybeFriendAsksSwap],
    ['Swap sides', () => swapSides(line(fk(), 'swapDone'))],
    ['Not now', null],
  ]);
}
<<<<<<< HEAD
/* ---------- conversation: story/<pov>.ink, played as message bubbles ---------- */
const inks = {};   // pov -> compiled story; each side compiles once, in the background
let pendingInk = null;   // a resumed trip's ink state, if the story hadn't finished compiling when the trip began
['liam', 'xiao'].forEach(p => loadStory(p).then(s => {
  inks[p] = s; if (pendingInk && p === player) { try { s.load(pendingInk); } catch (e) { console.warn('trip ink', e); } pendingInk = null; } else if (settings.ngplus) s.set('newgame_plus', true);
  updateUI();
}).catch(e => console.error('story', e)));
const ink = () => inks[player];
let gameStart = 0, lineOutSince = 0, castReminded = false, chessBetterDone = false;
let talking = false, inkRun = 0, nextIdle = performance.now() + 45000;
let waiting = false;   // the passage is only waiting on an untimed choice (not focus)
let stayed = false, storyEnded = false, ngPending = false;   // the end of the story: #stay keeps you sitting there (barks only), #ngplus starts again
const INK_FLAGS = ['key', 'focus', 'stay', 'ngplus'];
function inkFlags(tags) { if (tags.includes('stay')) { stayed = true; saveTrip(); } if (tags.includes('ngplus')) ngPending = true; }
const canTalk = () => scene_ === 'game' && !asking && !talking && !fishing.catchOpen && !fishing.fighting && !!ink() && !!ink().call('has_topics');
/** Play a passage. Lines arrive one by one; choices appear as reply buttons on your side.
 *  A choice labelled "…" is silence, and the reply timer picks it. done(played) runs at the end. */
function playInk(path, done, { auto = false } = {}) {
  const S = ink(); if (!S || talking || !S.has(path.split('.')[0])) { done && done(false); return; }   // the ink may be mid-edit: a missing knot is skipped
  S.set('night', dayNight.night > .5); S.set('quiet', view === 'fish' && !fishing.alert);
  try { S.start(path); } catch (e) { console.warn('ink', path, e); done && done(false); return; }
  talking = true; let played = false, keyNext = false; const run = ++inkRun; updateUI();
  // story bubbles stay up like a chat log (newest four), and clear a little after the passage ends
  const log = [], keep = { ms: 600000 };
  const finish = () => {
    if (run !== inkRun) return; talking = false; waiting = false; setFocus(false); lastSpoke = performance.now(); updateUI(); setTimeout(() => log.forEach(c => c()), 6000); done && done(played);
    if (ngPending) { ngPending = false; setTimeout(newGamePlus, 1500); }
  };
  const alive = () => run === inkRun && (scene_ === 'game' || scene_ === 'leaving');
  const step = () => { try { step1(); } catch (e) { console.warn('ink', path, e); waiting = false; finish(); } };
  const step1 = () => {
    if (!alive()) return finish();
    const ln = S.next();
    if (ln) {
      played = true;
      // #key: the choices after it in this passage wait for an answer; #focus: no timers and nothing else until the passage ends
      if (ln.tags.includes('key')) keyNext = true; if (ln.tags.includes('focus')) setFocus(true); inkFlags(ln.tags);
      // untagged lines: a bare "…" is your own silence, anything else is a stage direction
      const tg = ln.tags.filter(t => !INK_FLAGS.includes(t)), who = tg.includes(player) || (!tg.length && ln.text === '…') ? 'me' : tg.includes(fk()) ? 'friend' : 'beat';
      if (who === 'beat') log.push(msg('', ln.text, null, { ...keep, beat: true }));
      else log.push(msg(who === 'me' ? nameOf(player) : friend(), ln.text, null, { ...keep, mine: who === 'me' }));
      setTimeout(step, who === 'me' ? 1000 : 1400 + ln.text.length * 38);
      return;
    }
    const ch = S.choices(); if (!ch.length) return finish();
    played = true;
    const quiet = ch.indexOf('…'), ctags = S.choiceTags(), pick = i => { if (run !== inkRun) return; waiting = false; inkFlags(ctags[i] || []); try { S.choose(i); } catch (e) { console.warn('ink choice', e); return finish(); } setTimeout(step, 250); }, calm = keyNext || !!focus;
    waiting = calm && !focus;   // an untimed (#key) question outside focus: small talk and reminders carry on while it waits
    msg('', '', ch.map((t, i) => [t, () => pick(i)]), {
      mine: true, ms: calm ? 0 : path === 'talk' ? 15000 : auto ? 9000 : 20000,
      onSilence: () => (quiet >= 0 ? pick(quiet) : auto ? pick(0) : finish()),
    });
  };
  step();
}
function openTopics() { if (canTalk()) { $('caption').classList.remove('show'); playInk('talk'); } }
// the friend raises a new topic now and then (or a small moment); you can always just fish
// once everything's been talked through, the story's ending plays (once a trip); after "stay", idle moments are just small talk
function idleMoment() {
  const S = ink(), barkIdle = () => bark(Math.random() < .2 ? 'idleAny' : view === 'board' ? 'idleChess' : 'idleFish', {}, 4500);
  if (S && !talking && !storyEnded && !stayed && S.has('story_end') && S.call('story_done')) { playInk('story_end', played => { if (played) { storyEnded = true; saveTrip(); } }); return; }
  if (stayed) barkIdle(); else playInk('idle', played => { if (!played) barkIdle(); });
}
/** A heavy beat: hold the chips, the rod and the board, look across at the friend, soften the edges. Ends with the passage. */
function setFocus(on) {
  if (!!on === !!focus) return;
  if (on) {
    if (!$('tackle').hidden) closeTackle();
    focus = { look: { ...rig.lookTarget } }; fishing.auto = false; setHot(null); lookDrag = null; stage.classList.remove('dragging');
    if (view === 'fish') { rig.lookTarget.yaw = side() * 50 * D2R; rig.lookTarget.pitch = -6 * D2R; }
  } else { if (scene_ === 'game' && view === 'fish') Object.assign(rig.lookTarget, focus.look); focus = null; fishing.auto = true; }
  stage.classList.toggle('focus', !!focus); updateUI();
}
/* ---------- the trip: saved on Quit (and when the tab is hidden), resumed next time you sit down ---------- */
const tripKey = p => 'catchup.trip.v1.' + (p || player);
function saveTrip() {
  let j = pendingInk; try { if (ink()) j = ink().save(); } catch (e) { console.warn('trip ink', e); }
  const t = { ink: j, myColor, moves, hour: dayNight.hour, stayed, storyEnded, chessBetterDone, stowed: fishing.stowed };
  try { localStorage.setItem(tripKey(), JSON.stringify(t)); } catch (e) { /* storage is optional */ }
}
function loadTrip(p) { try { const t = JSON.parse(localStorage.getItem(tripKey(p)) || 'null'); return t && typeof t === 'object' ? t : null; } catch (e) { return null; } }
function clearTrip(p) { try { localStorage.removeItem(tripKey(p)); } catch (e) { /* ignore */ } }
/** A fresh weekend for the story (after New game+ the ink knows it: newgame_plus). */
function freshStory() {
  const S = ink(); pendingInk = null; stayed = false; storyEnded = false; ngPending = false; chessBetterDone = false;
  if (S) { S.reset(); if (settings.ngplus) S.set('newgame_plus', true); }
}
/** Throws if the save can't be read back (the caller then starts a fresh trip). */
function restoreTrip(t) {
  const sq = v => typeof v === 'string' && /^[a-h][1-8]$/.test(v);
  if (!Array.isArray(t.moves) || !t.moves.every(m => m && sq(m.from) && sq(m.to))) throw new Error('trip moves');
  freshStory(); const S = ink();
  if (t.ink) { if (S) S.load(t.ink); else pendingInk = t.ink; }
  stayed = !!t.stayed; storyEnded = !!t.storyEnded; chessBetterDone = !!t.chessBetterDone; if (Number.isFinite(t.hour)) dayNight.set(t.hour);
  myColor = t.myColor === 'w' ? 'w' : 'b'; newGame();
  for (const m of t.moves) { const mv = { from: m.from, to: m.to, promotion: typeof m.promotion === 'string' ? m.promotion : 'q' }; if (!game.move(mv)) throw new Error('trip move ' + m.from + m.to); moves.push(mv); }
  plies = moves.length; const lm = moves[moves.length - 1]; st.lastMove = lm ? { from: lm.from, to: lm.to } : null; draw();
  setStowed(!!t.stowed); if (!game.game_over() && game.turn() === friendColor()) friendTimer = setTimeout(friendMove, 2600);
}
/** The story's end, "again": the weekend closes, then it starts over right where you sit. */
function newGamePlus() {
  if (scene_ !== 'game') return;
  playInk('leaving', () => setTimeout(() => blackout(() => {
    if (scene_ !== 'game') return;
    settings.ngplus = true; saveSettings(settings); clearTrip(); clearMsgs(); clearTimeout(friendTimer); clearTimeout(askTimer); fight.cancel(); $('fight').hidden = true; $('catch').hidden = true; pendingStrike = false;
    freshStory(); newGame(); fishing.reset(); setStowed(false); nextIdle = performance.now() + 60000; updateUI();
    setTimeout(() => playInk('arrival'), 1500); startFriendIfFirst(1400);
  }, 700), 1800), { auto: true });
}
// P3: the one who got good at chess is Liam, on both sides
function maybeChessBetter() {
  if (chessBetterDone || talking || asking || !ink()) return;
  const m = material(game.state()) * (myColor === 'w' ? 1 : -1);   // + means you're ahead
  if (player === 'liam' ? m >= 300 : m <= -300) { chessBetterDone = true; playInk('chess_better'); }
}
function tickTalk(now) {
  if (scene_ !== 'game' || asking || (talking && !waiting) || fishing.catchOpen || fishing.bite || fishing.fighting) return;
  if (view === 'board' && playable() && !thinkBarked && now - turnSince > 50000) { thinkBarked = true; bark('thinkLong', {}, 4000); return; }
  if (!settings.tips.radio && now - gameStart > 60000 && view === 'fish') { settings.tips.radio = 1; saveSettings(settings); bark('radioTip', {}, 5000); return; }
  if (fishing.lineOut && view === 'fish' && !castReminded && now - lineOutSince > 40000) { castReminded = true; bark('castRemind', {}, 4000); return; }
  if (!talking && now > nextIdle && now - lastSpoke > 12000) { idleMoment(); nextIdle = now + 40000 + Math.random() * 30000; }
=======
/* ---------- conversation ---------- */
const story = createDialogue();
let talking = false, inviteUntil = 0, nextIdle = performance.now() + 45000, nextInvite = performance.now() + 100000;
const canTalk = () => scene_ === 'game' && !asking && !talking && !fishing.catchOpen && !fishing.fighting && story.any(fk());
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
>>>>>>> origin/main
}
/* ---------- fishing ---------- */
const mySeatX = () => -side() * SEAT_X;
const fishing = createFishing({
  say, friend, mySeatX, sfx: n => audio.sfx(n), line: (key, vars) => line(fk(), key, vars),
<<<<<<< HEAD
  onChange: () => { if (!fishing.lineOut) lineOutSince = performance.now(); updateUI(); },
  onCatch: c => showCatch(c),
  // the "!" is the main cue; the friend only chimes in now and then, and an ignored fish is never scolded
  onNibble: () => { if (view !== 'fish' && !focus && Math.random() < .35 && performance.now() - lastSpoke > 6000) bark('nibble', {}, 3000); },
  onBite: () => { if (view !== 'fish' && !focus) bark('bite', {}, 3500); },
  onMiss: () => { if (view === 'fish' && !focus) bark('miss', {}, 3500); },   // a fish missed during a heavy beat goes quietly
=======
  onChange: () => updateUI(),
  onCatch: c => showCatch(c),
>>>>>>> origin/main
  fight: (kind, done) => startFight(kind, done),
});
fishing.challenge = settings.challenge;
fishing.init();
<<<<<<< HEAD
const lakeUpdate = buildLakeLife(scene, fishing, () => (mySeatX() < 0 ? -1 : 1), () => dayNight.night);
=======
const lakeUpdate = buildLakeLife(scene, fishing, () => (mySeatX() < 0 ? -1 : 1));
>>>>>>> origin/main
let pendingStrike = false;
function showCatch(c) {
  $('catchFish').innerHTML = fishHtml(c.kind);
  $('catchTitle').textContent = `You caught a ${c.kind.name.toLowerCase()}!`;
  $('catchMeta').textContent = `${c.size} cm · ${c.before ? `you have caught ${c.before} before` : 'new for your journal'}`;
  const box = $('catchNames'); box.textContent = '';
  c.names.forEach(nm => { const b = document.createElement('button'); b.type = 'button'; b.textContent = nm; b.addEventListener('click', () => finishCatch(nm)); box.appendChild(b); });
  $('nameIn').value = ''; $('catch').hidden = false; box.querySelector('button')?.focus(); updateUI();
}
<<<<<<< HEAD
function finishCatch(nick, release) { $('catch').hidden = true; fishing.finishCatch(nick, release); castReminded = false; maybeOfferChallenge(); updateUI(); }
=======
function finishCatch(nick) { $('catch').hidden = true; fishing.finishCatch(nick); renderJournal(); updateUI(); }
function renderJournal() {
  const j = $('journal'); j.textContent = ''; j.hidden = !fishing.journal.length;
  fishing.journal.forEach(e => { const s = document.createElement('span'); s.className = 'chipj'; s.textContent = `${e.name} \u00d7${e.n}${e.nicks.length ? ' \u00b7 ' + e.nicks.join(', ') : ''}`; j.appendChild(s); });
}
>>>>>>> origin/main
$('talkBtn').addEventListener('click', openTopics);
$('swapBtn').addEventListener('click', () => { if (game && game.game_over()) offerRematch(); else askToSwap(); });
$('nameForm').addEventListener('submit', e => { e.preventDefault(); finishCatch($('nameIn').value); });
$('catchSkip').addEventListener('click', () => finishCatch(''));
<<<<<<< HEAD
$('catchRelease').addEventListener('click', () => finishCatch('', true));
function strike() { if (scene_ === 'game' && view === 'fish' && !rig.tween && !overlayOpen()) { if (fishing.stowed) toast('Your rod is resting by your chair.'); else fishing.strike(); } }
/** Put your rod down (it rests against your chair, nothing bites) or pick it back up (line out, ready to cast). */
function setStowed(on) {
  if (!fishing.stow(on)) return;
  ['liam', 'xiao'].forEach(k => { const P = world.people[k], down = on && k === player; P.rod.visible = !down; P.rest.visible = down; });
  updateUI();
}
/* the tackle box, when you pick the rod up: bait (easy) or a lure (the reel-in challenge) */
let tackleAt = null;
function openTackle() {
  tackleAt = hot ? hot.at : null; setHot(null);
  $('tBait').setAttribute('aria-pressed', String(!settings.challenge)); $('tLure').setAttribute('aria-pressed', String(!!settings.challenge));
  $('tackle').hidden = false; placeTackle(); (settings.challenge ? $('tLure') : $('tBait')).focus(); updateUI();
}
function closeTackle(on) { if ($('tackle').hidden) return; $('tackle').hidden = true; if (typeof on === 'boolean') setChallenge(on); setStowed(false); }   // no choice: keep the current one
function placeTackle() {
  if ($('tackle').hidden || !tackleAt) return; hotTmp.set(...tackleAt).project(camera); const t = $('tackle');
  t.style.left = clamp((hotTmp.x * .5 + .5) * 100, 14, 86) + '%'; t.style.top = clamp((-hotTmp.y * .5 + .5) * 100, t.offsetHeight / (stage.clientHeight || 1) * 100 + 4, 92) + '%';   // never above the top edge
}
$('tBait').addEventListener('click', () => closeTackle(false));
$('tLure').addEventListener('click', () => closeTackle(true));
document.addEventListener('pointerdown', e => { if (!$('tackle').hidden && !e.target.closest('#tackle')) closeTackle(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('tackle').hidden) closeTackle(); });
=======
function strike() { if (scene_ === 'game' && view === 'fish' && !rig.tween && !overlayOpen()) fishing.strike(); }
>>>>>>> origin/main

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
  $('intro').hidden = s !== 'title'; $('pick').hidden = s !== 'select'; $('quitBtn').hidden = s !== 'game'; $('topRight').hidden = s !== 'game'; $('dial').hidden = s !== 'game'; $('galBack').hidden = s !== 'gallery';
  stage.classList.toggle('ingallery', s === 'gallery');
  updateUI();
}
function blackout(mid, hold) {
  $('fade').classList.add('on');
<<<<<<< HEAD
  setTimeout(() => { try { mid(); } finally { setTimeout(() => $('fade').classList.remove('on'), hold); } }, 800);   // never stuck on black
=======
  setTimeout(() => { mid(); setTimeout(() => $('fade').classList.remove('on'), hold); }, 800);
>>>>>>> origin/main
}
function startPick(p) {
  if (scene_ !== 'select') return;
  audio.sfx('grunt'); player = p; myColor = 'b'; rig.side = side(); setScene('sit'); say(nameOf(p), '*heave-ho*', 1700);
  blackout(() => {
    rig.selTarget = 0; rig.sel = 0; rig.tween = null; rig.wide = 0; rig.u = 0; view = 'fish';
<<<<<<< HEAD
    newGame(); fishing.reset(); rig.sitT = performance.now(); gameStart = performance.now(); nextIdle = gameStart + 60000; castReminded = false; adaptDeclined = false; chessBetterDone = false; catchesHere = 0; fightLosses = 0; easyOffered = false; setScene('game');
    // a saved trip picks up where you left it (the next morning); otherwise settling in: chairs, rods, the board, a beer
    let trip = loadTrip(p);
    if (trip) { try { restoreTrip(trip); } catch (e) { console.warn('trip save unreadable, starting fresh', e); clearTrip(p); trip = null; myColor = 'b'; newGame(); } }
    if (!trip) { freshStory(); setStowed(false); startFriendIfFirst(1400); }
    setTimeout(() => playInk(trip ? 'morning' : 'arrival'), 1500);
  }, 500);
}
/** Quit: a goodnight, the trip is saved, back to the menu. ending (New game): the weekend's over, the save is cleared. */
function quitToTitle(ending) {
  if (scene_ !== 'game') return;
  if (ending) clearTrip(); else saveTrip();
  setFocus(false); $('tackle').hidden = true; audio.sfx('grunt'); fight.cancel(); $('fight').hidden = true; scene_ = 'leaving'; clearTimeout(friendTimer); clearTimeout(askTimer); clearMsgs(); $('quitBtn').hidden = true; rig.lookTarget.yaw = rig.lookTarget.pitch = 0; setHot(null);
  talking = false; inkRun++; updateUI();
  const toTitle = () => { if (!ending) saveTrip(); blackout(() => {
    rig.tween = null; rig.wide = 1; rig.u = 0; rig.sel = 0; rig.selTarget = 0; rig.sitT = -1; view = 'wide';
    newGame(); fishing.reset(); setStowed(false); $('catch').hidden = true; pendingStrike = false; clearMsgs(); setScene('title');
  }, 1200); };
  // goodnight (see you in the morning), or the weekend's over: a few quick lines (which ones depends on how much they let each other see), then the menu
  if (ink()) playInk(ending ? 'leaving' : 'goodnight', () => setTimeout(toTitle, 1800), { auto: true });
  else toTitle();
}
function goView(v) {
  if (scene_ !== 'game' || v === view || fishing.fighting || focus) return;
  rig.lookTarget.yaw = rig.lookTarget.pitch = 0; setHot(null);   // turning away re-centres the head
  view = v; rig.goTo(v === 'board' ? 'board' : 'fish', 2.8, () => {
    if (v === 'fish' && pendingStrike) { pendingStrike = false; if (fishing.bite && !overlayOpen()) fishing.strike(); }   // a bite that began on the way over
    else if (v === 'board' && !fishing.bite && game.turn() === myColor) bark('takeTime', {}, 3000);
=======
    newGame(); fishing.reset(); renderJournal(); rig.sitT = performance.now(); setScene('game');
    startFriendIfFirst(1400);
  }, 500);
}
function quitToTitle() {
  if (scene_ !== 'game') return;
  audio.sfx('grunt'); fight.cancel(); $('fight').hidden = true; scene_ = 'leaving'; clearTimeout(friendTimer); clearTimeout(askTimer); closeAsk(); $('quitBtn').hidden = true;
  closeTalk(); say(nameOf(player), (player === 'liam' ? '*grunt* ' : '*stands, stiffly* ') + line(player, 'quit' + story.tier(), { you: friend() }), 3600);
  blackout(() => {
    rig.tween = null; rig.wide = 1; rig.u = 0; rig.sel = 0; rig.selTarget = 0; rig.sitT = -1; view = 'wide';
    newGame(); fishing.reset(); $('catch').hidden = true; pendingStrike = false; setScene('title');
  }, 2600);
}
function goView(v) {
  if (scene_ !== 'game' || v === view || fishing.fighting) return;
  view = v; rig.goTo(v === 'board' ? 'board' : 'fish', 2.8, () => {
    if (v === 'fish' && pendingStrike) { pendingStrike = false; if (fishing.bite && !overlayOpen()) fishing.strike(); }
    else if (v === 'board' && !fishing.bite && game.turn() === myColor) say(friend(), 'Take your time.', 3000);
>>>>>>> origin/main
    updateUI();
  });
  updateUI();
}
function updateUI() {
<<<<<<< HEAD
  // the only status line: whose move it is on the board, or a nudge to cast
  $('viewTag').textContent = scene_ !== 'game' || rig.tween ? '' : view === 'board' && game ? (game.game_over() ? 'Game over' : game.turn() === myColor ? 'Your move' : `${friend()} is thinking`)
    : view === 'fish' && fishing.lineOut && !fishing.catchOpen ? 'Click the water to cast' : '';
  const bite = fishing.bite;
  $('panChip').textContent = view === 'fish' ? (bite ? 'Reel in!' : 'Look at the board ▾') : 'Back to the water ▴';
  $('panChip').classList.toggle('urgent', bite && view === 'fish');
  $('panChip').hidden = scene_ !== 'game' || fishing.fighting || fishing.catchOpen || !!focus;
  const nib = $('nib'); nib.hidden = !(scene_ === 'game' && fishing.alert && view !== 'fish' && !fishing.catchOpen && !focus);
  nib.classList.toggle('left', player === 'liam'); nib.classList.toggle('right', player !== 'liam'); nib.classList.toggle('bite', bite);
  $('bchips').hidden = !(scene_ === 'game' && view === 'board' && !rig.tween && game && !game.game_over() && !fishing.fighting && !focus);
  $('hintBtn').disabled = !playable();
  const tb = $('talkBtn'); tb.hidden = !canTalk() || !!focus;
  const sb = $('swapBtn'); sb.hidden = !(scene_ === 'game' && view === 'board' && !rig.tween && !asking && !focus && !fishing.fighting && game && (game.game_over() || canAskSwap()));
  $('bchips').style.bottom = sb.hidden ? '' : '12%';
  sb.textContent = game && game.game_over() ? 'Play again\u2026' : 'Ask to swap sides';
  stage.classList.toggle('playable', !!playable());
  stage.classList.toggle('fishview', scene_ === 'game' && view === 'fish' && !rig.tween);
=======
  $('viewTag').textContent = ({ fish: 'Fishing view', board: 'Board view', wide: 'Wide shot' })[view] +
    (view === 'board' && game && !rig.tween ? (game.game_over() ? ' · game over' : game.turn() === myColor ? ' · your move' : ` · ${friend()} is thinking`) : '');
  const bite = fishing.bite;
  $('panChip').textContent = view === 'fish' ? (bite ? 'Reel in!' : 'Look at the board ▾') : (bite ? 'A fish! Back to the water ▴' : 'Back to the water ▴');
  $('panChip').classList.toggle('urgent', bite);
  $('panChip').hidden = scene_ !== 'game' || asking || fishing.fighting;
  const tb = $('talkBtn'); tb.hidden = !canTalk();
  const sb = $('swapBtn'); sb.hidden = !(scene_ === 'game' && view === 'board' && !rig.tween && !asking && !fishing.fighting && game && (game.game_over() || canAskSwap()));
  sb.textContent = game && game.game_over() ? 'Play again\u2026' : 'Ask to swap sides';
  stage.classList.toggle('playable', !!playable());
>>>>>>> origin/main
}

/* ---------- fish gallery ---------- */
let galleryFrom = 'title', drag = null;
function openGallery() {
<<<<<<< HEAD
  if (scene_ !== 'title' && scene_ !== 'game') return; galleryFrom = scene_; stopTalk();
  blackout(() => {
    const n = gallery.setFish(fishing.journal); gallery.enter(fishing.journal); setScene('gallery');
    $('galNote').hidden = false; $('galNote').textContent = n > 0 ? 'Click the tank for a closer look.' : 'The tank is empty. Catch a fish and give it a name, and it will move in.';
  }, 500);
}
function closeGallery() { if (scene_ !== 'gallery') return; hideFishInfo(); blackout(() => { setScene(galleryFrom); $('galNote').hidden = true; }, 400); }
function stopTalk() { if (talking) { inkRun++; talking = false; setFocus(false); clearMsgs(); } }   // leaving the camp mid-conversation drops it
=======
  if (scene_ !== 'title' && scene_ !== 'game') return; galleryFrom = scene_; closeTalkIfOpen();
  blackout(() => {
    const n = gallery.setFish(fishing.journal); gallery.enter(fishing.journal); setScene('gallery');
    $('galNote').hidden = false; $('galNote').textContent = n > 0 ? 'Click the tank for a closer look. Drag a fish to move it.' : 'The tank is empty. Catch a fish and give it a name, and it will move in.';
  }, 500);
}
function closeGallery() { if (scene_ !== 'gallery') return; hideFishInfo(); blackout(() => { setScene(galleryFrom); $('galNote').hidden = true; }, 400); }
function closeTalkIfOpen() { if (talking) closeTalk(); }
>>>>>>> origin/main
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
<<<<<<< HEAD
  if (scene_ !== 'gallery') return;
  if (gallery.view === 'room') {   // from across the room, any click on the tank (fish included) walks you over to it
    const r = canvas.getBoundingClientRect(); galNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); galRay.setFromCamera(galNdc, gallery.camera);
    if (galRay.intersectObject(gallery.glass, false).length) { gallery.setView('tank'); $('galNote').textContent = 'Drag a fish to move it. Click one to see its name.'; audio.sfx('pop'); return; }
  }
  const f = galPick(e);
  if (f) { drag = { f, x0: e.clientX, y0: e.clientY, moved: false }; canvas.setPointerCapture(e.pointerId); audio.sfx('pop'); return; }
  hideFishInfo();
  const r = canvas.getBoundingClientRect(); galNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); galRay.setFromCamera(galNdc, gallery.camera);
=======
  if (scene_ !== 'gallery') return; const f = galPick(e);
  if (f) { drag = { f, x0: e.clientX, y0: e.clientY, moved: false }; canvas.setPointerCapture(e.pointerId); audio.sfx('pop'); return; }
  hideFishInfo();
  const r = canvas.getBoundingClientRect(); galNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); galRay.setFromCamera(galNdc, gallery.camera);
  if (gallery.view === 'room' && galRay.intersectObject(gallery.glass, false).length) { gallery.setView('tank'); $('galNote').hidden = true; audio.sfx('pop'); }
>>>>>>> origin/main
});
canvas.addEventListener('pointermove', e => {
  if (scene_ !== 'gallery') return;
  if (!drag) { let cur = galPick(e) ? 'grab' : ''; if (!cur && gallery.view === 'room') { const r = canvas.getBoundingClientRect(); galNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); galRay.setFromCamera(galNdc, gallery.camera); if (galRay.intersectObject(gallery.glass, false).length) cur = 'zoom-in'; } canvas.style.cursor = cur; return; }
  if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) drag.moved = true;
  if (drag.moved) {
    const r = canvas.getBoundingClientRect(); galNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    galRay.setFromCamera(galNdc, gallery.camera); if (galRay.ray.intersectPlane(galPlane, galPt)) { gallery.tank.worldToLocal(galPt); gallery.hold(drag.f, galPt.x, galPt.y); } canvas.style.cursor = 'grabbing';
  }
});
const endDrag = () => { if (!drag) return; if (!drag.moved) showFishInfo(drag.f); gallery.release(drag.f); drag = null; canvas.style.cursor = ''; };
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
$('mGallery').addEventListener('click', openGallery);
<<<<<<< HEAD
$('galBack').addEventListener('click', () => { if (gallery.view === 'tank') { gallery.setView('room'); hideFishInfo(); $('galNote').hidden = false; $('galNote').textContent = 'Click the tank for a closer look.'; } else closeGallery(); });
$('fiClose').addEventListener('click', hideFishInfo);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && scene_ === 'gallery') { if (!$('fishInfo').hidden) hideFishInfo(); else if (gallery.view === 'tank') { gallery.setView('room'); $('galNote').hidden = false; $('galNote').textContent = 'Click the tank for a closer look.'; } else closeGallery(); } });

/* ---------- reel-in challenge ---------- */
const fight = createFight(); const keysHeld = new Set();
/* the friend offers it after your first catch, and offers to ease off if the fish keep winning; never a menu.
   settings.tips.challenge: unset = never asked, 'no' = declined (asked again once a sitting, a few catches in), 'yes' = on */
let catchesHere = 0, fightLosses = 0, easyOffered = false;
function setChallenge(on) { settings.challenge = on; fishing.challenge = on; settings.tips.challenge = on ? 'yes' : 'no'; saveSettings(settings); }
function maybeOfferChallenge() {
  catchesHere++;
  if (settings.challenge || (settings.tips.challenge && !(settings.tips.challenge === 'no' && catchesHere === 6))) return;
  later(() => {   // after the friend's comment on the catch, and after any conversation that's going
    if (settings.challenge) return;
    settings.tips.challenge = 'no'; saveSettings(settings);
    ask(line(fk(), 'challengeAsk'), [['Go on, then', () => { setChallenge(true); bark('challengeOn', {}, 3500); }], ["Nah, I'm good", () => bark('challengeKeep', {}, 3500)]], { ms: 16000 });
  }, 4600);
}
/** Run fn once the friend is free to ask something: waits out any conversation, gives up after a minute of other questions. */
function later(fn, ms, tries = 12) {
  setTimeout(() => { if (scene_ !== 'game') return; if (talking) { later(fn, 5000, tries); return; } if (asking) { if (tries > 0) later(fn, 5000, tries - 1); return; } fn(); }, ms);   // a passage always ends; keep waiting for it
}
function afterFight(ok) {
  fightLosses = ok ? 0 : fightLosses + 1;
  if (fightLosses < 3 || easyOffered) return; easyOffered = true;
  later(() => {
    if (!settings.challenge) return;
    ask(line(fk(), 'easyAsk'), [['Yeah, go easy', () => { setChallenge(false); bark('easyOn', {}, 3500); }], ["No, I've got this", () => bark('easyKeep', {}, 3500)]], { ms: 16000 });
  }, 4200);
}
function startFight(kind, done) {
  $('ffish').style.background = kind.col; $('ffish').style.color = kind.col; $('fwho').textContent = `Keep it in the light. This one's ${fight.label(kind)}.`; $('fight').hidden = false; updateUI();
  fight.start(kind, ok => { $('fight').hidden = true; done(ok); afterFight(ok); updateUI(); });
=======
$('galBtn').addEventListener('click', openGallery);
$('galBack').addEventListener('click', () => { if (gallery.view === 'tank') { gallery.setView('room'); hideFishInfo(); $('galNote').hidden = false; } else closeGallery(); });
$('fiClose').addEventListener('click', hideFishInfo);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && scene_ === 'gallery') { if (!$('fishInfo').hidden) hideFishInfo(); else if (gallery.view === 'tank') { gallery.setView('room'); $('galNote').hidden = false; } else closeGallery(); } });

/* ---------- reel-in challenge ---------- */
const fight = createFight(); const keysHeld = new Set();
function startFight(kind, done) {
  $('ffish').style.background = kind.col; $('ffish').style.color = kind.col; $('fight').hidden = false; updateUI();
  fight.start(kind, ok => { $('fight').hidden = true; done(ok); updateUI(); });
>>>>>>> origin/main
}
function updateFight(dt) {
  if (!fight.active) return;
  const dx = ((keysHeld.has('ArrowRight') || keysHeld.has('d') ? 1 : 0) - (keysHeld.has('ArrowLeft') || keysHeld.has('a') ? 1 : 0)) * dt * 1.1; if (dx) fight.nudge(dx);
  fight.update(dt); if (!fight.active) return;
  $('fzone').style.left = ((fight.zone - fight.zw / 2) * 100) + '%'; $('fzone').style.width = (fight.zw * 100) + '%'; $('fzone').classList.toggle('in', !!fight.inside);
  $('ffish').style.left = (fight.fish * 100) + '%'; $('fprog').style.width = (fight.prog * 100) + '%';
}
function fightPointer(e) { if (!fight.active) return; const r = $('fbar').getBoundingClientRect(); fight.move((e.clientX - r.left) / r.width); }
addEventListener('pointermove', fightPointer);
addEventListener('keydown', e => { keysHeld.add(e.key); if (fight.active && e.key.startsWith('Arrow')) e.preventDefault(); });
addEventListener('keyup', e => keysHeld.delete(e.key));

/* ---------- time of day dial and little conveniences ---------- */
let dialDrag = false;
function updateDial() {
<<<<<<< HEAD
  // a ring: noon at the top, midnight at the bottom, the sun or moon riding round it
  const d = $('dial'); if (d.hidden) return; const h = dayNight.hour, a = (h - 12) / 24 * Math.PI * 2, k = $('dknob');
  k.style.left = (50 + Math.sin(a) * 39.5) + '%'; k.style.top = (50 - Math.cos(a) * 39.5) + '%'; k.classList.toggle('moon', h < 5.8 || h >= 19.6);
  $('dlabel').textContent = clockText(h); d.setAttribute('aria-valuenow', h.toFixed(1)); d.setAttribute('aria-valuetext', clockText(h));
}
function dialSet(e) { const r = $('dial').getBoundingClientRect(), a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))); dayNight.set((a / (Math.PI * 2) * 24 + 36) % 24); }
=======
  const d = $('dial'); if (d.hidden) return; const h = dayNight.hour, tr = d.getBoundingClientRect().height || 1;
  $('dknob').style.top = (h / 24 * 100) + '%'; $('dlabel').style.top = (h / 24 * 100) + '%'; $('dknob').classList.toggle('moon', h < 5.8 || h >= 19.6);
  $('dlabel').textContent = clockText(h); d.setAttribute('aria-valuenow', h.toFixed(1)); d.setAttribute('aria-valuetext', clockText(h));
}
function dialSet(e) { const r = $('dial').getBoundingClientRect(); dayNight.set(Math.min(24, Math.max(0, (e.clientY - r.top) / r.height * 24)) % 24); }
>>>>>>> origin/main
$('dial').addEventListener('pointerdown', e => { dialDrag = true; $('dial').classList.add('on'); $('dial').setPointerCapture(e.pointerId); dialSet(e); });
$('dial').addEventListener('pointermove', e => { if (dialDrag) dialSet(e); });
const dialEnd = () => { dialDrag = false; $('dial').classList.remove('on'); };
$('dial').addEventListener('pointerup', dialEnd); $('dial').addEventListener('pointercancel', dialEnd);
$('dial').addEventListener('wheel', e => { e.preventDefault(); dayNight.set(dayNight.hour + Math.sign(e.deltaY) * .3); }, { passive: false });
$('dial').addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowRight') dayNight.set(dayNight.hour + .25); if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') dayNight.set(dayNight.hour - .25); });
let toastT = 0;
function toast(text) { const t = $('toast'); t.textContent = text; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600); }
<<<<<<< HEAD
function nextTrack() {
  const list = audio.tracks(); if (!list.length) return; const i = list.findIndex(t => t.id === settings.track), next = list[(i + 1) % list.length];
  audio.setTrack(next.id); saveSettings(settings); toast('\u266A ' + next.name + (list.length < 2 ? ' (add more tracks in assets)' : '')); updateNowPlaying();
}
const trackName = () => (audio.tracks().find(t => t.id === settings.track) || {}).name || 'off';
let npText = null, npT = 0;   // the now-playing label beside the gear; fades out and back in when the name changes
function updateNowPlaying() {
  const t = settings.muted || !settings.musicVol || audio.trackError ? 'Radio off' : trackName(), el = $('nowPlay'); if (t === npText) return;
  const set = () => { $('npName').textContent = t; el.setAttribute('aria-label', `Now playing: ${t}. Next track`); el.classList.remove('swap'); };
  clearTimeout(npT); if (npText === null) set(); else { el.classList.add('swap'); npT = setTimeout(set, 180); } npText = t;
}
updateNowPlaying(); $('nowPlay').addEventListener('click', nextTrack); audio.onTrack = () => { saveSettings(settings); updateNowPlaying(); };

/* ---------- looking around while fishing, and the things within reach ---------- */
// Drag to turn your head (grab the view and pull it); a click that doesn't drag strikes, or uses whatever is under the pointer.
// The board side has less room: that is what the board view is for.
// The radio and the bucket beside your chair are how music and the fish gallery are reached during a game.
const HOT = {
  radio: { label: () => `Radio \u00b7 ${settings.muted || !settings.musicVol ? 'off' : trackName()}`, click: nextTrack,
    wheel: d => { settings.musicVol = clamp(Math.round((settings.musicVol - Math.sign(d) * .05) * 100) / 100, 0, 1); audio.applyVolumes(); saveSettings(settings); toast(`Radio volume ${Math.round(settings.musicVol * 100)}%`); updateNowPlaying(); } },
  bucket: { label: () => { const n = fishing.journal.reduce((a, e) => a + (KINDS.some(k => k.id === e.id) ? e.n : 0), 0); return n ? `Bucket \u00b7 ${n} fish` : 'Bucket \u00b7 empty'; }, click: () => openGallery() },
  rod: { label: () => 'Put the rod down', on: () => !fishing.stowed, click: () => setStowed(true) },
  pickup: { label: () => 'Pick up the rod', on: () => fishing.stowed, click: openTackle },
};
let hot = null, look = null, lookDrag = null;   // look: last pointer position over the canvas, in -1..1
const LOOK = { away: 46, board: 12, down: 30, up: 10 };   // how far the head can turn, degrees
const hotRay = new THREE.Raycaster(), hotNdc = new THREE.Vector2(), hotTmp = new THREE.Vector3();
function setHot(h) { hot = h; stage.classList.toggle('hot', !!h); $('hotLabel').hidden = !h; if (h) $('hotLabel').textContent = HOT[h.key].label(); }
function lookFrom(e) { const r = canvas.getBoundingClientRect(); look = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 }; }
function turnHead(dx, dy) {   // pixels dragged; dragging right turns you left, like pulling the scene
  const t = rig.lookTarget, w = canvas.clientWidth || 1;
  t.yaw -= dx / w * 100 * D2R; t.pitch += dy / w * 100 * D2R;
  t.yaw = side() > 0 ? clamp(t.yaw, -LOOK.away * D2R, LOOK.board * D2R) : clamp(t.yaw, -LOOK.board * D2R, LOOK.away * D2R);
  t.pitch = clamp(t.pitch, -LOOK.down * D2R, LOOK.up * D2R);
}
function pickHot() {
  hotNdc.set(look.x, -look.y); hotRay.setFromCamera(hotNdc, camera);
  const mine = world.hot.filter(h => h.who === player && (!HOT[h.key].on || HOT[h.key].on())), hit = hotRay.intersectObjects(mine.map(h => h.obj), true)[0];
  const h = hit ? mine.find(m => { for (let o = hit.object; o; o = o.parent) if (o === m.obj) return true; return false; }) : null;
  if (h !== hot) setHot(h);
}
function placeHotLabel() {
  if (!hot) return; hotTmp.set(...hot.at).project(camera); const l = $('hotLabel');
  l.style.left = ((hotTmp.x * .5 + .5) * 100) + '%'; l.style.top = ((-hotTmp.y * .5 + .5) * 100) + '%';
}
canvas.addEventListener('pointerleave', () => { look = null; if (hot) setHot(null); });
canvas.addEventListener('wheel', e => { if (hot && HOT[hot.key].wheel) { e.preventDefault(); HOT[hot.key].wheel(e.deltaY); setHot(hot); } }, { passive: false });

/* ---------- settings panel ---------- */
let settingsFrom = null;
const chessWord = v => v < .3 ? 'Gentle' : v < .6 ? 'Fair' : v < .85 ? 'Sharp' : 'Ruthless';
=======
$('musicBtn').addEventListener('click', () => {
  const list = audio.tracks(), i = list.findIndex(t => t.id === settings.track), next = list[(i + 1) % list.length];
  audio.setTrack(next.id); saveSettings(settings); toast('\u266A ' + next.name + (list.length < 2 ? ' (add more tracks in assets)' : ''));
});

/* ---------- settings panel ---------- */
let settingsFrom = null;
>>>>>>> origin/main
function openSettings() {
  $('sCycle').checked = settings.cycle; $('sLen').value = settings.dayMin; $('sLenOut').textContent = `${settings.dayMin} min`;
  $('sFire').value = settings.fire; $('sSway').checked = settings.sway; $('sTilt').checked = settings.tilt; $('sSway').disabled = reduce;
  $('sMute').checked = settings.muted;
  [['sMusic', 'musicVol'], ['sSfx', 'sfxVol'], ['sAmb', 'ambVol']].forEach(([id, k]) => { $(id).value = settings[k]; $(id + 'Out').textContent = Math.round(settings[k] * 100) + '%'; });
  const tr = $('sTrack'); tr.textContent = ''; audio.tracks().forEach(t => { const o = document.createElement('option'); o.value = t.id; o.textContent = t.name; tr.appendChild(o); }); tr.value = settings.track; $('sMode').value = settings.playMode;
<<<<<<< HEAD
  $('sChallenge').checked = !!settings.challenge; $('sAdapt').checked = !!settings.chessAdaptive; $('sChess').value = settings.chessLevel; $('sChessOut').textContent = chessWord(settings.chessLevel);
  $('sTrip').hidden = !(scene_ === 'game' || loadTrip('liam')); $('sNewAsk').hidden = true; $('sNew').hidden = false;
  $('sNewQ').textContent = scene_ === 'game' ? 'Start a new trip? This weekend ends.' : 'Forget your saved trip? The next one starts fresh.';
  settingsFrom = document.activeElement; $('settings').hidden = false; $('setClose').focus();
=======
  $('sChallenge').checked = settings.challenge; settingsFrom = document.activeElement; $('settings').hidden = false; $('setClose').focus();
>>>>>>> origin/main
}
function closeSettings() { $('settings').hidden = true; saveSettings(settings); settingsFrom && settingsFrom.focus && settingsFrom.focus(); }
$('mSettings').addEventListener('click', openSettings);
$('gearBtn').addEventListener('click', openSettings);
$('setClose').addEventListener('click', closeSettings);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('settings').hidden) closeSettings(); });
$('sCycle').addEventListener('change', e => { settings.cycle = e.target.checked; applySettings(); });
<<<<<<< HEAD
$('sLen').addEventListener('input', e => { settings.dayMin = parseInt(e.target.value, 10); $('sLenOut').textContent = `${settings.dayMin} min`; applySettings(); });
$('sMute').addEventListener('change', e => { settings.muted = e.target.checked; audio.applyVolumes(); updateNowPlaying(); });
[['sMusic', 'musicVol'], ['sSfx', 'sfxVol'], ['sAmb', 'ambVol']].forEach(([id, k]) => $(id).addEventListener('input', e => { settings[k] = parseFloat(e.target.value); $(id + 'Out').textContent = Math.round(settings[k] * 100) + '%'; audio.applyVolumes(); if (k === 'sfxVol') audio.sfx('catch'); if (k === 'musicVol') updateNowPlaying(); }));
$('sTrack').addEventListener('change', e => { audio.setTrack(e.target.value); updateNowPlaying(); });
$('sChallenge').addEventListener('change', e => setChallenge(e.target.checked));
$('sAdapt').addEventListener('change', e => { settings.chessAdaptive = e.target.checked; saveSettings(settings); });
$('sChess').addEventListener('input', e => { settings.chessLevel = parseFloat(e.target.value); $('sChessOut').textContent = chessWord(settings.chessLevel); saveSettings(settings); });
=======
$('sChallenge').addEventListener('change', e => { settings.challenge = e.target.checked; fishing.challenge = e.target.checked; });
$('sLen').addEventListener('input', e => { settings.dayMin = parseInt(e.target.value, 10); $('sLenOut').textContent = `${settings.dayMin} min`; applySettings(); });
$('sMute').addEventListener('change', e => { settings.muted = e.target.checked; audio.applyVolumes(); });
[['sMusic', 'musicVol'], ['sSfx', 'sfxVol'], ['sAmb', 'ambVol']].forEach(([id, k]) => $(id).addEventListener('input', e => { settings[k] = parseFloat(e.target.value); $(id + 'Out').textContent = Math.round(settings[k] * 100) + '%'; audio.applyVolumes(); if (k === 'sfxVol') audio.sfx('catch'); }));
$('sTrack').addEventListener('change', e => audio.setTrack(e.target.value));
>>>>>>> origin/main
$('sMode').addEventListener('change', e => audio.setPlayMode(e.target.value));
$('sFire').addEventListener('change', e => { settings.fire = e.target.value; });
$('sSway').addEventListener('change', e => { settings.sway = e.target.checked; applySettings(); });
$('sTilt').addEventListener('change', e => { settings.tilt = e.target.checked; applySettings(); });
<<<<<<< HEAD
// New game: the real quit, asked right here in the panel. The fish journal is kept.
$('sNew').addEventListener('click', () => { $('sNew').hidden = true; $('sNewAsk').hidden = false; $('sNewNo').focus(); });
$('sNewNo').addEventListener('click', () => { $('sNewAsk').hidden = true; $('sNew').hidden = false; $('sNew').focus(); });
$('sNewYes').addEventListener('click', () => {
  if (scene_ === 'game') { closeSettings(); quitToTitle(true); }
  else { ['liam', 'xiao'].forEach(clearTrip); $('sTrip').hidden = true; $('setClose').focus(); }
});
const inTrip = () => scene_ === 'game' || (scene_ === 'gallery' && galleryFrom === 'game');
addEventListener('pagehide', () => { if (inTrip()) saveTrip(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && inTrip()) saveTrip(); });

=======

$('mSingle').addEventListener
>>>>>>> origin/main
$('mSingle').addEventListener('click', () => { if (scene_ === 'title') { rig.selTarget = 1; setScene('select'); } });
$('pickBack').addEventListener('click', () => { rig.selTarget = 0; setScene('title'); });
$('pickLiam').addEventListener('click', () => startPick('liam'));
$('pickXiao').addEventListener('click', () => startPick('xiao'));
<<<<<<< HEAD
$('quitBtn').addEventListener('click', () => quitToTitle(false));
=======
$('quitBtn').addEventListener('click', quitToTitle);
>>>>>>> origin/main
$('panChip').addEventListener('click', () => {
  if (view === 'fish') { if (fishing.bite) strike(); else goView('board'); }
  else { if (fishing.bite) pendingStrike = true; goView('fish'); }
});
<<<<<<< HEAD
$('nib').addEventListener('click', () => { pendingStrike = true; goView('fish'); });
$('hintBtn').addEventListener('click', askHint);
$('undoBtn').addEventListener('click', takeBack);
=======
>>>>>>> origin/main
document.addEventListener('keydown', e => { if (e.metaKey || e.ctrlKey || e.altKey || scene_ !== 'game') return; if (e.key === '1') goView('fish'); if (e.key === '2') goView('board'); });
document.addEventListener('keydown', e => { if (e.key === ' ' && scene_ === 'game' && view === 'fish' && !overlayOpen() && !['INPUT', 'BUTTON'].includes(e.target.tagName)) { e.preventDefault(); strike(); } });

const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pickSquare(e) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(board.squares, false)[0]; return hit ? hit.object.userData.sq : null;
}
<<<<<<< HEAD
canvas.addEventListener('pointerdown', e => {
  if (scene_ !== 'game') return;
  if (view === 'fish') {
    if (rig.tween || overlayOpen()) return;
    lookFrom(e); pickHot(); lookDrag = { x: e.clientX, y: e.clientY, moved: false }; canvas.setPointerCapture(e.pointerId);
    return;
  }
  if (playable()) { const sq = pickSquare(e); if (sq) onSquare(sq); }
});
const endLook = e => {
  if (!lookDrag) return; const d = lookDrag; lookDrag = null; stage.classList.remove('dragging');
  if (d.moved || e.type === 'pointercancel' || scene_ !== 'game' || view !== 'fish' || overlayOpen()) return;
  if (hot) { audio.sfx('click'); HOT[hot.key].click(); } else strike();   // a plain click
};
canvas.addEventListener('pointerup', endLook); canvas.addEventListener('pointercancel', endLook);
canvas.addEventListener('pointermove', e => {
  if (lookDrag) {
    if (!lookDrag.moved && Math.hypot(e.clientX - lookDrag.x, e.clientY - lookDrag.y) > 6) { lookDrag.moved = true; stage.classList.add('dragging'); if (hot) setHot(null); }
    if (lookDrag.moved) { turnHead(e.clientX - lookDrag.x, e.clientY - lookDrag.y); lookDrag.x = e.clientX; lookDrag.y = e.clientY; return; }
  }
  if (scene_ === 'game' && view === 'fish' && !rig.tween && !overlayOpen()) { lookFrom(e); pickHot(); } else if (hot) setHot(null);
=======
canvas.addEventListener('pointerdown', e => { if (scene_ !== 'game') return; if (view === 'fish') { strike(); return; } if (playable()) { const sq = pickSquare(e); if (sq) onSquare(sq); } });
canvas.addEventListener('pointermove', e => {
>>>>>>> origin/main
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
<<<<<<< HEAD
  fishing.night = dayNight.night; rig.step(now, dt); fishing.stepFish(dt, now); if (scene_ === 'game') fishing.stepRod(now); lakeUpdate(now); world.update(now);
  dayNight.update(dt); campfire.update(now, dt, settings.fire === 'always' || (settings.fire === 'auto' && dayNight.night > .28) ? 1 : 0);
  updateDial(); updateFight(dt); board.update(now); placeHotLabel(); placeTackle();
=======
  rig.step(now, dt); fishing.stepFish(dt, now); if (scene_ === 'game') fishing.stepRod(now); lakeUpdate(now); world.update(now);
  dayNight.update(dt); campfire.update(now, dt, settings.fire === 'always' || (settings.fire === 'auto' && dayNight.night > .28) ? 1 : 0);
  updateDial(); updateFight(dt);
>>>>>>> origin/main
  stage.classList.toggle('night', dayNight.night > .5);
  syncPeople(); if (scene_ === 'select') placePick();
  if (scene_ === 'gallery') { gallery.update(now, dt, dayNight.night); renderer.render(gallery.scene, gallery.camera); } else renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
newGame(); rig.wide = 1; rig.side = 1; setScene('title');
requestAnimationFrame(frame);
<<<<<<< HEAD
window.__cu = { world, takeBack, askHint, msg, ask, newGame, fight, gallery, openGallery, audio, dayNight, campfire, settings, inks, playInk, openTopics, fishing, state: () => ({ myColor, plies, scene: scene_ }), offerRematch, scene: () => scene_, rig, camera, game: () => game, onSquare, say, saveTrip, loadTrip, setFocus, setStowed, quitToTitle, idleMoment, ink };
=======
window.__cu = { fight, gallery, openGallery, audio, dayNight, campfire, settings, story, openTopics, fishing, state: () => ({ myColor, plies, scene: scene_ }), offerRematch, scene: () => scene_, rig, camera, game: () => game, onSquare, say };
>>>>>>> origin/main
