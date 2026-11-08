# Liam rewrite notes (draft 4)

Draft for the author. Files touched: `public/story/liam.ink`, `public/story/liam_inserts.ink`. Compiles clean on inkjs 2.3.2 (no errors or warnings). 300 random full playthroughs reached `story_done` with no runtime errors.

## What changed and why
- **Voice pass:** Liam's choices and lines now hesitate, joke to deflect, trail off and over-explain, so the honest options sound less polished.
- **More options and small branches** in arrival, work l1/l2/l4, family l1/l4, uni l2/l3/l4, donna, chess l3, story_end.
- **Sedan with family photo** (arrival): booster seat, a photo Missy hung crooked.
- **Apology** (uni l4): a fumbling apology; Xiao says "Okay. I heard it. It's a lot, for me." Guilt-relief beat.
- **Asking for help** (new `work.l7`): Xiao names the tension himself ("You're asking me for help. Now."), says it is a bit rich and he is glad Liam said it ("Both is allowed"), and "it's not a trade". Gated after the apology.
- **Cabin together** (new `cabin.l5`): fishing as "mine", me time, "build one together", Xiao sketching on the Shapes box and adding a third room. Gated after the apology.
- **New inserts:** `text_home` (text from Mary, once per trip), `smoke` (Liam declines a cigarette), `me_time`.
- `really_next_time` adds "bring the drawings" if `cabin.l5` was played.

## New variables, knots, gates
- `texted_home`, `told_cig`: saved with the trip, so each beat fires at most once per trip. Old trip saves that lack them may need a New game (not tested).
- New stitches `work.l7`, `work.l7_soon`, `cabin.l5`, `cabin.l5_soon`; new inserts `text_home`, `smoke`, `me_time`.
- `story_done()` now needs `d_work >= 7` and `d_cabin >= 5`. `ok_work()` layer 7 and `ok_cabin()` layer 5 need `d_uni >= 4`. No knot, function or tag the game calls was renamed.

## Canon invented, needs author confirmation
1. Xiao smokes (crushed packet, lighter).
2. Liam smoked once and quit when Missy was about a month old.
3. Mary's text: Dad's tablets, and Missy asleep in the laundry basket again.
4. The sedan has a booster seat, and a family photo hung crooked by Missy.
5. Xiao says he booked the cabin because he "couldn't ask either", and that he is bad at hearing it.
6. Xiao was angry at Liam "for a bit", and is not now.
7. Xiao sketches the cabin on the Shapes box; Liam's old shelf "leaned"; Xiao adds a third room.
8. Liam's longest sit-down since "Missy's christening".

## Also noticed
- Arrival still ends with "You're black. Like always." (unchanged). Unclear what it means; consider rewording.
- `docs/handover.md` not updated, since the brief limited edits to the two ink files and new docs.
