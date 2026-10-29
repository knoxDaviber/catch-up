# Catch Up

Cozy chess by the fishing hole. Browser game, three.js, no bundler yet (native ES modules + import map).

- `index.html` page shell, import map, overlay markup
- `src/main.js` boot, render loop, scene state machine (title, pick, sit, game, leaving)
- `src/scene/` world, people, board, camera rig
- `src/chess/` rules engine (perft-tested; `npm test`)
- `src/ui/` title and in-game overlays
- `vendor/` three.js build (MIT). Upgrade to Vite when the package registry is reachable.

Run without installing anything: `node serve.mjs`, then open http://localhost:5173 (opening index.html by double-click will not work: browsers block ES modules on file://).
Run with Vite: `npm install`, then `npm run dev`. (The code is written against `three` and works either way; vendor/ is only for the no-install server.)
Design doc is the source of truth for decisions.

Art and sound: see `src/assets/manifest.js` and `public/assets/README.md`.
