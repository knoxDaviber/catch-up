# Catch Up

Cozy chess by the fishing hole. Browser game, three.js, native ES modules (Vite for dev and builds).

- `index.html` page shell, import map, overlay markup
- `src/main.js` boot, render loop, scene state machine (title, pick, sit, game, leaving)
- `src/scene/` world, people, board, camera rig
- `src/game/` fishing rules and the fish list (`fishing.js`), the reel-in fight (`fight.js`), friend barks (`lines.js`), the ink story runner (`story.js`)
- `src/chess/` rules engine (perft-tested; `npm test`) and `ai.js`, the friend's search-based player (styles per friend, adjustable level)
- `src/ui/` title and in-game overlays
- `public/story/` the conversation, in ink: `liam.ink` / `xiao.ink` (one per side you can play) plus inserts. `story/STORY_BIBLE.md` is the plot bible. `src/game/story.js` compiles them in the browser, so edit and reload.
- `vendor/` three.js and inkjs 2.3.2 builds (both MIT). inkjs is imported by relative path; three comes from npm under Vite, or the import map without it.

Run without installing anything: `node serve.mjs`, then open http://localhost:5173 (opening index.html by double-click will not work: browsers block ES modules on file://).
Run with Vite: `npm install`, then `npm run dev`. `npm run build` makes a static build in `dist/` (the story ships from `public/story/`).
Design doc is the source of truth for decisions. Design rule: settings live in the world or in dialogue, not menus (radio and bucket by your chair, the time ring, the friend's offers).

Art and sound: see `src/assets/manifest.js` and `public/assets/README.md`.
