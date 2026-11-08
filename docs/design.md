# Catch Up: Game Design Doc

Oct 26, 2026 · @Cool · updated Nov 8, 2026

Where this doc and the code disagree, the code and the sections marked "current" win. The story canon (characters, backstory, topics, trust) lives in `story/STORY_BIBLE.md`; the character notes below are the original brief.

## Vision & Pitch

A cozy browser game where two friends sit side by side fishing, with a chess board set down between them. Players alternate between thinking through chess moves and catching fish whenever a line gets a bite.

The feeling we want: a slow, warm afternoon with a friend, where nothing is ever urgent and waiting is part of the fun.

- **Platform:** web browser
- **Build approach:** mostly vibecoded
- **Core idea:** chess and fishing running at the same time, in the same cozy scene
- **Still to decide:** how fishing and chess feel together in a session, plus art, audio and progression (see the sections below)

**Title:** Catch Up, with the subtitle "Cozy chess by the fishing hole". The name plays on catching fish and catching up with an old friend.

## Design Pillars

Proposed from what you have told me so far; tell me which ones to change.

1. **Calm over challenge:** nothing is urgent and nothing can be lost
2. **Two quiet things, side by side:** chess and fishing share one scene without competing
3. **A friendship worth tending:** conversations and a quiet story give the time together meaning
4. **A living painting:** the whole game looks hand-drawn, like watercolor

## Core Loop

A session is open ended: you sit down at camp with your friend and do three calm things in whatever order you like.

1. **Play chess** with your friend, at your own pace, with no clock
2. **Fish** beside them: cast, wait, catch, and add the fish to your journal
3. **Talk** to each other by choosing conversation topics as you go

Nothing forces you to switch between them. You can leave whenever you like (proposed: the game remembers where you left off).

### First Few Minutes (walkthrough)

1. **Title screen:** a wide painted shot of the two friends sitting side by side, with the options Single player and Invite a friend
2. **Pick your player:** a highlight says "pick your player" and you choose Liam
3. **Sitting down:** fade to black, a short heave-ho grunt as the camera simulates Liam sitting down, then the view pans to the over-the-shoulder fishing view. Xiao is fishing beside you
4. **First move:** Xiao says "your move" after making the first chess move, and the game prompts you to pan over to the board
5. **Hint:** you ask for a hint, Xiao says "what about this?", and a glowing guide shows his suggested move. You play it
6. **First fish:** an exclamation mark appears, or Xiao says he sees a fish, and the game prompts you to pan back. You click when the line is pulled long, because the fish teases the line for a bit first
7. **Naming:** Xiao says the fish looks ugly. You laugh and pick a name from a few options, such as "It's a perch... I think?", "I reckon this is one of them Brown Midnight Snappers!" or "A delicious fish of the sea." Your choice becomes the fish's name
8. **The loop:** you keep playing chess and fishing. Now and then a dialogue box pops up after a chess move or a catch, telling parts of the story out of order
9. **Leaving:** you press quit in the top left. The screen flashes black as Liam grunts and gets up, saying "It's been nice catching up with you, Xiao...", and you return to the title screen

## Chess Design

Standard chess with the real rules, but relaxed: nobody is rushed and mistakes are forgiven.

- **Rules:** full standard chess
- **No clock:** play as slowly as you like
- **Forgiving helpers (proposed):** undo and hints available
- **Opponent strength (proposed):** adjustable, so it can stay friendly
- **Open question:** can a game be left half played and picked up later?

**Hints:** a hint button shows a glowing guide on a suggested move. In two-player, your friend can also suggest a move ("what about this move?") and the same glowing guide appears on the board.

## Fishing Design

Fishing is almost passive: it should feel like sitting with a line in the water, not like a task.

- **Flow (proposed):** cast, wait, then click when the float dips
- **No failure (proposed):** a missed bite just means the fish swims off
- **Fish:** a set of species to catch, recorded in a journal (see Progression)
- **Open questions:** do fish vary by time of day, weather or season? How many species at launch?

**Fish and nicknames:** each catch is labeled with a real species name, like a placeholder, but the art is a memory-like painting rather than an accurate portrait. The friends do not truly know what they caught and it does not really matter. You and your friend give each fish a nickname, and the journal records the nickname.

**Choosing nicknames:** pick from a few suggested silly names, so there is no blank page. In single player, the friend can suggest one too.

**Current (Nov 2026):**

- **Fish:** 21 kinds in `KINDS` (`src/game/fishing.js`): real Australian lake species plus three uncommon extras from the art (guppy, koi, and the rare night "lamplighter"). Some only bite by day or night; rarer ones have low weight. Every kind has painted art.
- **Art:** cute watercolour fish, matched to species by look, not accuracy (fits "memory-like painting").
- **Bait:** a bait tin by your chair. Tossing crumbs draws fish in for 60–90 s, with a 25 s cooldown. It needs a line in the water.
- **Lure mode:** hold to wind up, release to cast. Further casts give a slightly better chance of harder fish. Moving more than 6 px turns the hold into a look-drag.
- **Catch, no menu:** the fish floats over the scene with a glow and sparkles. Three suggested names bob around it as bubbles, plus "Choose a name…", which opens a small text box. A ring timer (12 s, paused while typing) runs down. If it runs out the fish is released. Chess and the camera keep working the whole time. Quitting mid-catch keeps the fish unnamed.
- **Releasing kept fish:** in the cabin, drag a fish out of the tank to the window ("Back to the lake"), or use "Let it go back to the lake" on its info card. The journal records it as freed and the nickname goes with it; the friend says a line.
- **Rod:** a single click on the rod only strikes a biting fish. Putting the rod down takes a double-click, double-tap or right-click, so looking around never stows it by accident. You pick it back up at the tackle box.

## How Chess and Fishing Interact

Chess and fishing stay mostly separate, so the game stays fully cozy. The early idea of the two sharing one rod was dropped because it added tension.

- **Direction:** fishing and chess sit side by side in the same scene, each a calm activity of its own
- **Open question:** is there any light link at all, such as caught fish decorating the scene, or is the connection purely atmosphere?

## Characters, Setting & Story

Two old friends are camping together after a long time apart, trying to reconnect. Fishing and chess are how they spend the time.

- **Setting:** one cozy camping spot that changes with day and night, seasons or weather
- **Story:** single player only. The plot details matter less than the feeling the player is left with (see Ending feeling below).
- **Open questions:** who are the two friends, and what drifted them apart? Is the player one of them? Besides dialogue, does the story also show up in small scenes or objects around camp?

**Dialogue:** while you play chess and fish, you and the friend talk. You each choose conversation topics. Good answers open up more dialogue options, and poor answers lead to fewer. A hidden warmth score, never shown to the player, tracks how the conversation is going and shapes the final moments. The story may unfold through these conversations.

**Ending feeling:** warm bittersweet. The ending is hopeful, but the more you think about it, the more likely it feels that the friends will drift apart again. Proposed: how much you opened up in conversation softens or strengthens the final moments, rather than changing the ending itself.

**Story reveal:** the backstory comes out slowly through dialogue, as hints and clues the player pieces together. Nothing is explained outright.

**Ending:** always available. You can end the trip whenever you like, even if you have not learned the story. If you do learn it, the friends can keep fishing and playing chess until you decide to quit the game.

**No sign of completion:** the game gives no marker, keepsake or message when you have learned the whole story. The player simply feels it.

### The Two Friends

The concept art shows Friend A (the warmer one, orange jacket) and Friend B (the cooler one, blue jacket). Friend A is Liam and Friend B is Xiao.

**Liam, 34, the warmer one**

- Married to Mary, with a 10-year-old daughter who is the light of his life
- Supermarket manager, sometimes works part-time as a bouncer for extra cash
- Happy with Mary, but life has felt stale since college: work and home
- Drifted from Xiao after meeting Mary. One tired evening he ignored a message from Xiao, meaning to answer in the morning, and forgot. He regrets how it ended
- Married Mary after she became pregnant, to take responsibility
- Used to be fit, now has a big beer belly. He tells himself Mary likes it, but it quietly reminds him he is no longer who he was
- He once joked they should rent a cabin and game for a whole weekend, but they never went. He was surprised and touched when Xiao got in touch after 10 years

**Xiao, 34, the cooler one**

- Recently divorced, no children
- Graduated with honors and became vice-president of a small architecture firm
- Carries a hidden inferiority complex, and Liam was the only person he truly called a friend
- After a panic attack he messaged Liam and was ignored. That hurt and confirmed his low opinion of himself, so he buried himself in work
- Began dating Donna when her father, the firm's president, matchmade them. When the president died suddenly, Xiao offered Donna the presidency, she was furious and filed for divorce, and he did not contest it, which hurt her more
- Reached out to Liam again in the middle of all this

## Modes & Players

The first version is single player. Two-player comes later.

- **Version 1:** one player, with a friend character sitting beside them (computer-controlled, to confirm)
- **Later:** two-player, where you invite a friend to play chess and collect fish together. No story in this mode. Floating bubbles like "great catch" or "good move" pop up now and then.
- **Friend role:** the friend is your chess partner and your fishing buddy, and you talk as you play (see Characters, Setting & Story)

**Inviting a friend:** one player creates a camp and shares a link, and the other opens it to join. No accounts needed.

## Progression & Rewards

There are no levels or scores. People come back for a calm place to play chess, a collection to fill and a story to uncover.

- **Fish collection:** a journal of every species caught
- **Story:** finding out whether the friends reconnect, or working out what the story even is
- **Chess:** a good-looking, relaxing alternative to a regular chess app
- **Open question:** does the story move forward on its own over time, or through games played and fish caught?
- Answer: The story should be pierced together through the dialogue. There can be brisk comments about the chess or fishing.

## Art Direction & Audio

The look is hand-drawn, watercolor style, like an illustrated storybook.

- **Style:** hand-drawn / watercolor
- **Challenge:** this style needs more art assets than flat shapes or pixel art, which matters for a mostly vibecoded build
- **Open questions:** where do the assets come from (drawn by you, generated, or a painted-look effect over simple shapes)? What should the music and ambient sound be, such as crickets, water and a campfire?
- Answer: I'll most likely generate them. Its cozy surrealist watercolour, naturalistic but doesn't need to be realistic. I'm thinking the title screen shows the two friends at a lake (or whatever setting you wish to change it to maybe later we can add more settings), back towards us. chess board already set up. Much more details about the story in the art like a beatdown car parked next to a shoddy cabin, things like that. And then start game zooms us in closer to the chess board. You pick a side, which is also a character select as which character you'll play as. Then it switches to an 3/4 over the shoulder angled towards the friend kinda pov when you want to fish. it can be forced perspective. arrow keys or clicks from chess and fishing are fixed perspective. makes it easier. Yes all good ambient sounds. Forest, relaxing camping.

**Voice acting:** wanted, to bring the dialogue to life. It is a lot of recording, so it belongs in the later stage. Open questions: real actors or generated voices, and full lines or short reaction sounds?

**Music and ambience:** soft acoustic music with gentle ambient sound in the background. As the friends reconnect well, the music warms very slightly, driven by the hidden warmth score. It should be a very subtle hint, never something the player consciously notices.

**Art plan:** build the whole game with placeholder art first, then swap in the final watercolor pieces. The character sheet of Liam and Xiao is the style target: soft washes, paper texture, muted warm and cool palettes. Final art will be made with an image tool or an artist outside this document, using that sheet as the reference.

**Title screen reference:** a painted wide shot from behind the two friends, sitting in green camp chairs with a chess board on a tree stump between them, looking out over a lake and mountains. A log cabin with a lantern sits on the left, a cooler beside Liam, and a rusty old truck in the bottom right corner.

### Style Guide

- **Medium:** soft watercolor washes on warm cream paper, with a visible paper grain
- **Edges:** soft and loose, with little or no hard outlines
- **Palette:** muted and slightly desaturated. Liam is warm (orange, olive, brown) and Xiao is cool (blue, lavender, grey)
- **Characters:** chunky, rounded silhouettes in big cozy clothing, with simple faces or faces turned away
- **Landscape:** hazy distance, with lavender mountains and soft golden light
- **Props with history:** lantern, cooler, rusty truck, log cabin, camp chairs, tree stump

### Asset List

**Scenes**

- Title screen wide shot (reference above)
- Camp view with the chess stump, for panning
- Over-the-shoulder fishing view
- Angled chess board view
- Later: day, dusk, night, seasons and weather versions

**Characters**

- Liam and Xiao sitting in camp chairs (from behind and from the side)
- Sitting down and standing up, for the start and end of a session
- A few small reaction poses, such as laughing

**Fish and fishing**

- One painting per fish (number of species to decide)
- Float, line, ripples and the "!" mark

**Interface**

- Dialogue boxes and floating bubbles
- Glowing move guide for hints
- Fish journal pages

**Audio**

- Soft acoustic music, ambient layers, grunts and voice lines

## Controls & UX

Desktop with a mouse comes first. Touch support can come later.

- **Chess:** click or drag pieces, with legal moves shown softly
- **Fishing:** click to cast, click again when the float dips
- **Dialogue:** click a topic from a short list
- **Why it works:** a mouse can only do one thing at a time, which suits passive fishing next to a slow chess game
- **Camera:** a true 3D camera on your character's head. Fishing is seen from the far shoulder or from first person (both are in the prototype, and first person looked better). Choosing the board turns his head toward it and the camera follows, then lifts into a tilted high view of the board from your seat. The board never moves.

**Fishing view:** the camera rests on your character's far shoulder through a wide, near-fisheye lens, or sits in his eyes in the first-person option. The other friend is just slightly visible at the edge of the frame. You can see a bit of your friend's rod, so you can tell when a fish is coming for them. This feels cozier. Fallback if it proves unnecessary or hard to build: keep each player to themselves and show a small "!" when a fish is nearby.

**Switching views (current):** a slim tab on the screen edge the camera turns towards: "Board ›" on the board side while fishing, "‹ Fishing" on the lake side at the board (mirrored when playing Xiao). Clicking the stump, board or pieces while fishing also goes to chess, except during a bite, when the click strikes. Keys 1 and 2 switch too. Clicks are ignored while the camera moves, so one click is one switch. A "Reel in!" chip shows at the bottom during a bite.

**Other controls (current):** drag to look around (the range reaches past the friend to the campfire). The gear (Settings) and a small full-screen button sit top right; on iPhone the full-screen button suggests Add to Home Screen. Quit becomes Back while a panel is open. Touch works for everything, including double-tap on the rod.

**Chess board view:** a high, slightly tilted view from your own seat, reached by the head-turn camera. The friends sit on opposite sides of the stump and the friend plays white. Click a piece, then a square; legal moves are shown softly. The prototype confirmed this reads well.

## Camera & Look (prototype findings)

The browser prototype settled how the game is shot and how it looks. A real 3D head-turn camera with a painted HD-2D look is the direction.

**What we tried**

- 2D layered pans: the parallax felt good, but sliding across to a far-off board read as standing up and walking over, not turning a head. Dropped.
- A real 3D head-turn camera: far-shoulder fisheye, the head turns, then a lift into a tilted board view. This matched the idea and is the choice.
- Looks tried on that camera: flat low-poly, painted bands behind the 3D, and HD-2D watercolor (painted ground and lake textures, painted cut-out trees and buildings that face the camera, pastel colour, soft focus at the edges, paper grain). HD-2D watercolor is current.
- Rejected: crisp Octopath-style HD-2D (wrong art direction) and paper theatre (suits fast movement, not a slow cozy game).

**Camera**

- Fishing: far shoulder or first person; first person looked better.
- Turn to the board: the head turns first, then the camera lifts and leans in, the lens relaxes from fisheye, with a slight tilt. The board never moves, and the friend does the commenting.
- Wide shot: perspective from far back with both friends small at the far end, seated throughout.
- Seating: Liam on the left, Xiao on the right, the stump between them, the friend plays white.

**Known prototype issues**

- Going from first person to the wide shot, your character's head is missing until it pops back in. Fade it in during the move.
- The friends are placeholder models. They need the painted models or sprites.
- The real watercolor look (bleeding edges, pigment pooling) needs shaders, so it waits for the real engine.

**What is missing from the finished game**

- Art: final graphics from the references, painted friends, and the watercolor shader.
- Audio: soft acoustic music that warms as the friends reconnect, ambient water, birds, crickets and fire, piece clicks and the reel.
- Time and light: a day and night cycle, and soft light from the campfire (optional).
- Chess: random board side with a request to switch sides, the friend asking for a new game after one ends, a friend who plays like a person with their own style, a promotion choice and piece movement.
- Fishing: cast and reel animation, a teasing mini-game where a fish nibbles and runs if you do not click, catching, and small round fish shadows swimming in the water (size by kind).
- Fish gallery: in the menu, with naming. It fades to the cabin and a dreamy aquarium that rocks gently; you can move the fish and click one to see its name and how many you caught.
- Dialogue: story options plus plenty of flavour lines for idle time, fishing and chess.
- Atmosphere: fireflies, birds, mist and light rain, friend idle animation, and a few small interactables such as a thermos or poking the fire.
- Structure: title screen, menu and settings (volume, subtitle size, reduced motion, keyboard chess), saving the fish journal and nicknames (a half-played game is not saved, as decided), a loading screen and a low-power mode.
- Later: the two-player link mode, a photo mode, and touch.

## Prototype Log (Version 10, approved)

The single-file browser prototype is approved for look, camera, fishing loop and title screen, so this section is the reference for what exists before the real build starts. It is a throwaway: custom canvas-2D renderer, placeholder models, no sound.

### Approved by the user

- The first-person head-turn camera between fishing and board, and the wide shot.
- The HD-2D watercolour look (soft pastel, not Octopath-crisp).
- The fishing loop and its bite timing.
- The title screen composition and flow.

### Title screen and scene flow

- Opens on a wide shot from behind the friends: Liam left, Xiao right, board on the stump between them, lake and mountains ahead, log cabin with a lantern on the left, cooler beside Liam, rusty truck cut off at the bottom-right corner, tent and campfire in the middle. The camera drifts slowly.
- Logo "Catch Up" with the subtitle "Cozy chess by the fishing hole" sits in the sky. Menu: Single player (works), Invite a friend, Gallery and Settings (shown disabled, "soon").
- Single player dollies in on the friends. "Pick your player" labels float above Liam and Xiao; hovering one dims the other. Back returns to the title.
- Picking a player fades to black with a "*heave-ho*" caption, then fades into the fishing view while the camera settles down as if sitting. The friend (white) makes the first chess move and says "Your move."
- Quit (top left) fades to black with "*grunt* It's been nice catching up with you, \<friend>..." and returns to the title. A game in progress is not saved.
- First-person is the default rig. Keys 1, 2, 3 jump between fishing, board and wide, only while in a game.

### Camera

- A real 3D head-turn rig. At the fishing end the head looks out at the water; turning to the board is a head turn first (about 12 degrees peek to 90), then the camera lifts and leans to a high tilted view of the board (eye height about 1.7 m, pitch about -9 degrees at the start) while the field of view relaxes from 112 to 72 degrees and the fisheye eases off.
- The board never moves. Transitions run about 2.8 seconds; optional head tilt and idle sway.
- Two rigs were built, far-shoulder and first-person. First-person looked better and is the default.
- The wide shot is a separate pose from behind the friends, who stay seated throughout.

### Look

- Painted textures on the ground and water, painted cut-out trees, cabin, truck, tent and fence that always face the camera, a pastel colour remap, soft focus with a tilt-shift edge, and a paper grain overlay.
- The earlier flat-shaded 3D and the painted 2D panorama are still in the code but not reachable. The 2D panorama was dropped because it read as the characters getting up rather than turning their heads.
- People and board are layered so the board never draws over a character's head.

### Chess

- A self-written, perft-tested engine. The player is black, the friend is white and moves first (e4, d4, Nf3 or c4), then replies with a random move that favours captures about half the time.
- Click a piece to see its legal moves; the friend comments on check, checkmate and draws, and says "Your move." if you are looking at the water.

### Fishing

- Ten fish of six kinds drift as shadows in the water. A shadow approaches the float, teases it, then bites; the bite window is 7 seconds.
- Strike by clicking the view, pressing Space, or the "Reel in!" chip. If you are looking at the board, the chip takes you back to the water and strikes on arrival.
- A catch opens a card with three random nickname suggestions plus a custom field. Names go into a fish journal. Test controls can force a bite and start a new game.
- The friend's float dips now and then and they comment on catches ("Ha. That one looks ugly.").

### Known gaps in the prototype

- Models are simple placeholder shapes; friends need real art, and the player's head pops in when moving from first person to the wide shot (plan: fade it in during the move).
- No sound or music, no day-night, no campfire light, no side swap or rematch, no fish animation or reel mini-game, no gallery or aquarium, no real dialogue content, no settings, no saving.
- A real watercolour shader needs a real engine; the prototype only approximates it.

### Carry over to the real build

- The camera rig numbers, the scene layout (positions of cabin, truck, tent, cooler, fire pit, stump, chairs), the fishing state machine and timings, the chess engine, the title flow and the caption lines above.
- Next step: a proper project (planned: Vite and three.js, split into scene, camera, chess, fishing and UI modules) and a pipeline that turns the reference art into textures and models.

## Real Build Log (three.js project)

The prototype is now a modular three.js project (native ES modules, Vite optional, three vendored); these are the decisions made while building it.

- **Structure:** scene state machine title > pick seat > sit > game > gallery; views fish, board, wide; first-person head-turn between rod and board.
- **Chess sides:** you start as black; ask to swap within the first few moves (friend usually agrees, and may ask you); rematch offer after a game with same or swapped sides.
- **Dialogue:** short barks per friend plus topic conversations driven by a hidden warmth value and flags; goodbye lines depend on warmth; progress saved locally.
- **Day and night:** flows on its own (length set in Settings) and the sky, fog, light, stars, moon and lamps follow; the campfire lights itself at dusk, or always or never.
- **Time of day:** a dial on the left edge of the screen (drag or scroll), not a settings slider. Principle: controls live in the world, not menus.
- **Sound:** generative placeholder pad plus a manifest so any music, effect or ambience file can be swapped in; a note button cycles tracks and shows the name.
- **Fish gallery:** the cabin interior with the friends relaxing in several arrangements; clicking the aquarium gives a full close-up of just the fish; fish art keeps its own aspect ratio.
- **Reel-in challenge (optional, Settings > Fishing):** a bar where you follow the fish; the light zone shrinks over time; the friend says something like "Up for a challenge, huh?" and reacts to wins and losses.
- **Polish rule:** nothing in the world can be clicked while a menu, dialog, catch card or the challenge is open.
- **Still to do (Oct):** watercolour look, real character models and textures from the reference sheets, real music and fish art, touch support, two-player link.

**Since then (to Nov 8, 2026)**

- **Story:** the ink story is in (`public/story/`, Liam's side first; Xiao shows as "coming later"). It has topics, key and focus beats, an ending with Stay or New game+, and trips that save on Quit or when the tab is hidden and resume next time.
- **Painted art:** the characters are painted sprites (seated, with side, front and back views chosen by camera angle), with painted plates, cut-outs, props, forest rings, clouds, ground, water and about 200 scattered rocks, tufts, bushes and flowers. AI-generated, cleaned with `tools/clean-art.mjs`. `?noart` shows the placeholders.
- **The camp:** enclosed by forest with the path coming out of it, so it feels private and safe. The campfire sits just past the friend, with a stone ring.
- **Layout varies per trip:** a seed saved with the trip moves the optional pieces. The boat sits at the jetty or on either bank, and the lily pads, lantern, firefly jar, cairn, blanket, log and stump change place. The core camp never moves.
- **Living world:**
  - The sun and moon cross the sky, with drifting clouds of several shapes.
  - The water moves: warped ripples, glints, a moon path, a foam line and ripple rings.
  - Critters with sound (birds, ducks, a wren, a possum, jumping fish, a dragonfly).
  - Ambience follows the time of day (magpies, frogs, crickets, a boobook).
  - The lantern and firefly jar glow at night.
- **Radio:** music tracks cycle through to off; it can also be turned off in Settings.
- **Screen filters:** none, dreamy, film, CRT and paper.
- **Gallery:** the painted cabin interior with the aquarium. The friends do activities around the table (camp-chair sprites as placeholders; standing sprites for the kettle and window) and never overlap the tank. You can release fish from the tank (see Fishing Design).
- **Dialogue:** bubbles queue instead of replacing each other, and question bubbles are never dropped.
- **Art batch (Nov 9):** new skies, far shore, lake bank texture, title logo art (a pawn and a float framing the title), bait tin, and fish art for all 21 kinds.

## Tech & Vibecoding Plan

Proposed: a small browser project with no framework, so it stays easy to vibecode and easy to share.

- **Setup:** Vite with plain JavaScript (TypeScript optional)
- **Chess rules:** an existing chess rules library, so we never write move validation ourselves
- **Chess opponent:** an existing chess engine at an adjustable, friendly strength
- **Scene:** a 3D engine such as three.js for the camp, fishing and board, because the head-turn camera needs real rotation that 2D could not fake. It is dressed in the HD-2D watercolor look (see Camera & Look), with plain HTML and CSS on top for the dialogue boxes, journal and menus
- **Saving:** browser local storage for the game in progress and the fish journal

Proposed build order:

1. Playable chess board against the friend
2. The camp scene with placeholder art
3. Passive fishing and the fish journal
4. Dialogue topics
5. Day, night and weather changes
6. Final watercolor art and sound

**Two-player note:** joining by link needs a small server that connects the two players, so it comes after the single-player version.

## Scope & MVP

Proposed first playable: a small camp scene with chess, fishing and a fish journal, using placeholder art.

**In the first version**

- Standard chess against the friend, no clock
- One camp spot with placeholder art
- Passive fishing with a handful of fish
- A fish journal that saves in the browser

**Later**

- Dialogue topics and the story
- Day, night, seasons and weather
- Final watercolor art and sound
- Two-player and touch support

## Open Questions & Decisions Log

**Decided on 2026-10-26**

| Topic | Decision |
| --- | --- |
| Platform | Web browser, desktop mouse first |
| Players | Single player first, two-player later |
| Chess | Standard rules, relaxed, no clock |
| Fishing | Almost passive |
| Chess and fishing link | Mostly separate, fully cozy |
| Art | Hand-drawn, watercolor |
| Setting | Camping trip, cozy mix of day, night, seasons and weather |
| Friend | Your chess partner and fishing buddy, with dialogue choices |
| Progression | Fish collection, no levels or scores |
| Session length | Open ended |

**Still open**

- [ ] Who are the two friends, and what drifted them apart?
- [ ] The two friends were best friends from college. Life has separated them as they both moved on with their lives. One of them hit the other up for a trip and the other agreed. They haven't seen each other in over 10 years.
- [ ] Is the player one of the friends, or someone else?
- [ ] The player plays as one of the friends. There are two povs to the story. Which you can get by playing both characters.
- [ ] How does the dialogue system work in detail (topics, how answers are judged)?
- [ ] Floating speech bubbles that hover onto the screen for a few seconds. Sometimes there's more than one bubble. Silence is also an option.
- [ ] Where does the art come from?
- [ ] AI generated.
- [ ] What music and ambient sound?
- [ ] Cozy. We can add a radio later.
- [ ] How many fish species, and what changes which ones appear?
- [x] Started with 6; now 21, some by day or night only, some rarer than others.
- [x] Can games be saved half played and resumed?
- [x] Originally no. Changed: the whole trip (story, chess moves, time, layout) saves and resumes. Settings → New game starts fresh.
- [ ] What is the game called?
- [ ] Cozy chess by the fishing hole.
- [x] Do the friends become painted sprites or hand-painted models? Painted sprites (billboards) on the 3D stage.
- [x] How do the references turn into textures consistently? AI-generated sheets in one style, cut and cleaned by `tools/clean-art.mjs` with per-image settings in `tools/art-jobs.json` (both git-ignored). Prompts are in `ART_ASSETS.md`.
