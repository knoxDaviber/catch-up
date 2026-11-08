# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` runs Vite on http://localhost:5173. The author usually has it running already, so check before starting another.
- `node serve.mjs` (`npm run serve`) is a zero-install static server. It also serves files from `public/`, mirroring Vite. Opening `index.html` from disk won't work, because browsers block ES modules on `file://`.
- `npm run build` writes a static build to `dist/`. `.github/workflows/deploy.yml` builds on pushes to `main` and deploys `dist/` to GitHub Pages.
- `npm test` runs `src/chess/engine.test.js`: perft counts, threefold repetition and undo. It's the only automated test, and it can only be run whole.
- There's no linter or formatter config. Match the dense one-liner style of the surrounding code.
- In that style, never put a `//` comment mid-line: it silently comments out the statements after it.

Most features can only be checked in a browser. `main.js` exposes a debug handle, `window.__cu`, with `fishing`, `inks`, `playInk`, `settings`, `rig`, `fight`, `game()`, `scene()`, `openGallery`, `ink`, `saveTrip`, `loadTrip`, `setFocus`, `setStowed`, `quitToTitle`, `idleMoment` and more. Use it to force states, for example to put a fish on the line by setting `fishing.rod.phase`.

## Architecture

The game is plain ES modules plus three.js, with no framework. Under Vite, `three` comes from npm. Without Vite, the import map in `index.html` points it at `vendor/three.module.js`. inkjs (`vendor/ink-full.module.js`, which includes the compiler) is imported by **relative path**, because Vite ignores import-map names.

- **`src/main.js`** is the hub, a single file that owns:
  - the scene state machine (`title | select | sit | game | leaving | gallery`)
  - the fishing and board views, and the camera tweens between them
  - every DOM overlay and pointer handler
  - the chess flow
  - the friend's message bubbles: `msg()`, and `ask()` for questions with a reply timer
  - story playback: `playInk()`
  - the floating catch overlay (`showCatch`: name bubbles, ring timer that releases the fish), the view-switch edge tab `#viewBtn` (`goView` returns false while the camera moves or `viewLock` holds), and gallery fish release (`letGoFish`, `fishing.letGo`)
  - hotspot clicks (`HOT`): `board` switches to chess (not during a bite); the `rod` entry has `dbl: true`, so stowing needs a double-click/tap or right-click
  
  Other modules are mostly pure logic or scene builders that it wires together.
- **`src/scene/`** has the three.js builders: `world.js` (people with `rod`, `rest`, `rodHit`, `restHit`; props; clickable hotspots `W.hot`, where an entry's optional `on()` limits the states it shows in, e.g. the `rod` / `pickup` hotspots for putting the rod down and picking it up at the tackle box), `board.js`, `rig.js` (camera poses; `u` runs 0 for the fishing view to 1 for the board view, with `lookTarget` for turning your head), plus day/night, campfire, lake life and the aquarium gallery.
- **`src/chess/`**:
  - `engine.js` (`MiniChess`) holds the rules.
  - `ai.js` is the friend's player: negamax search, then a softmax pick whose temperature comes from `level`, with per-friend `STYLES`. The friend's adaptive strength is offered in dialogue, not set in a menu.
- **`src/game/`**:
  - `fishing.js` holds the fishing rules and the `KINDS` fish list. It's a phase machine: `out → cast → wait → approach → tease → bite → (fight) → reel → catch → out`, and it reports events through hooks.
  - `fight.js` is the reel-in minigame. Each fish's `diff` and `style` shape it.
  - `lines.js` holds the short reactive lines, keyed per friend.
  - `story.js` compiles the ink files in the browser (`has`, `save`, `load`, `choiceTags`). A missing knot or function is skipped safely.
- **Story** lives in `public/story/<pov>.ink`, plus `_inserts.ink` files. Each file covers the side where you play that character. `story.js` appends `INCLUDE`d files at the end and compiles everything when the page loads, so editing an `.ink` file only needs a reload. The game calls knots by name: `arrival`, `morning`, `talk`, `idle`, `chess_better`, `goodnight`, `story_end`, `leaving`, and the functions `has_topics()`, `intro_due()` and `story_done()`. Tags `#liam`, `#xiao` and `#beat` set who speaks, and a choice of `…` means silence. `#key` drops the reply timer for the passage's following choices, `#focus` turns on focus mode for the rest of the passage, and `#stay` / `#ngplus` (on the choice or its output line) mark the two closing choices of `story_end`. A line carrying only control tags still counts as untagged for who speaks, so a bare `…` stays the player's silence. The game sets `quiet` (fishing view, nothing nibbling), which unlocks the brother's version B, and finishing the story depends on that. Only Liam is playable for now; the pick screen shows Xiao as "coming later". Topic and trust rules are in `story/STORY_BIBLE.md` §7.
- **Assets:** `src/assets/manifest.js` lists every art and sound file. `null` falls back to a built-in placeholder. Files go in `public/assets/`, and manifest paths leave out `public/`. Specs and the planned art list are in `public/assets/README.md`.
- **Persistence** is in localStorage:
  - `catchup.settings.v1` includes `tips` for one-off friend offers and `ngplus` (once set, every fresh story gets `newgame_plus = true`).
  - `catchup.journal.v1` holds the caught fish, with `n` for kept and `freed` for released. It's never cleared, and it can hold ids no longer in `KINDS` (bluegill, minnow), so code must skip unknown ids.
  - `catchup.trip.v1.<pov>` is the trip save: `{ink, myColor, moves, hour, stayed, storyEnded, chessBetterDone, stowed, layout}`, with `moves` replayed on resume. `layout` seeds the scenery variation (`world.setLayout`: scatter plus optional pieces like the boat, lily pads, lantern); a fresh trip gets a new one. It's written on Quit (before and after `goodnight`) and on pagehide/visibilitychange during a game, and cleared by Settings → New game and by New game+. Trips resume, so the story only starts fresh on a new game.

## Design rules (from the author)

- **No menus for things the world can do.** Settings belong in the world or in dialogue: the radio and bucket by your chair, the time-of-day ring, the friend offering adaptive chess or the reel-in challenge. Every setting is also in the Settings panel (the gear, top right) so the player never has to wait for a prompt; outside that panel, changes happen naturally with no disruptions.
- **Talking never blocks play.** Bubbles are non-blocking, letting a reply timer run out counts as silence, and you can strike or move pieces during a conversation.
- **Sound is calm and sparse.** Ambience sits well under the music; one-off sounds are soft, distant and rare (a minute or more apart), with no sharp attacks or anything that could startle. Birds by day only; at night just soft insects, frogs and a rare, distant owl. When unsure, quieter and less often.
- **Voice:** the setting is urban Australian in 2026, so uni was around 2016–17 and pop-culture references must fit that. Slang like "arvo" is used lightly and ironically. Xiao is dry and clipped, and Liam is warm and rambly.
- **Story canon:** the author writes plot points, and Claude drafts the `.ink` for the author to edit. Proposals need the author's confirmation before they become canon. Xiao's brother Sheldon's death is reserved for a cross-game ARG. Memories of Sheldon alive are allowed (a bright kid who followed Xiao everywhere, the games they made together for Liam, that snake game's prototype). His death is limited to "he passed" plus how Xiao feels about it. Never write the attack, the coma or the parents.
- `docs/design.md` is the design doc (vision, decisions, build log); `docs/handover.md` says what is done and what is next. Update the handover after each task.

Working guidelines
Before changing anything, list every file you'll need and read them in one pass. Then make all edits, then run the tests once.
The agent the user talks to never writes code or builds anything itself. It is the supervisor, responsible and accountable for all work done by the subagents it spawns to execute.
Treat all work as a todo queue. When the user proposes tweaks, changes or corrections, append them to the queue; don't break the queue to prioritize the correction. Only stop when the queue is truly 100% clear.
Mistakes aren't your fault; don't apologize. A mistake means a gap or issue in the instruction files. Describe which part of the instruction files caused it and suggest the fix. Be solution oriented.
YAGNI: don't overengineer, and never expand scope without permission. Do suggest scope improvements when they make sense. All work must be justifiable. Judge where the project sits between "quick and dirty" and "production grade" and match the engineering effort to that.
After making changes, always spin up a reviewer subagent on a cheap model with minimal context to look over them with fresh eyes for possible problems.
