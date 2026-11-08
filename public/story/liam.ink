// Catch Up: Liam's side. You play Liam; Xiao sits across the board.
// Draft 4: a voice pass (Liam sounds like a warm, slightly awkward dad: hesitations, jokes as deflection,
// over-explaining) plus new beats: the sedan, the cigarette, the text from home, asking for help (work l7),
// building a cabin together (cabin l5). Everything here is for the author to edit.
//
// HOW TOPICS WORK (STORY_BIBLE.md §7)
//   Seven subjects. You can raise three from the start (Work, Family, The cabin).
//   Xiao brings up three himself during quiet stretches (Uni days, Donna, Chess);
//   you answer him, and after that the topic sits in your Talk list too.
//   The seventh (The little bloke) opens a while after Xiao tells you about his brother.
//   Each time you return to a topic it goes one layer deeper: layer 2 needs trust 2, 3 needs 4, 4 needs 6,
//   5 needs 8, 6 needs 10, 7 needs 10 (plus its own gate).
//
// HOW CHOICES WORK
//   Your options are Liam's state of mind. He reaches for a joke before he reaches for the truth.
//   The honest option is always there, but if you say it before Xiao is ready to hear it, it doesn't land:
//   the layer isn't finished, the topic goes to the back of the queue for a while (shelve), and when it
//   comes back Xiao asks again (again).
//
// Tags: #xiao / #liam = who speaks, #beat = a small italic stage direction.
//   #key on a line = the choices after it in that passage have no reply timer.
//   #focus on a line = focus mode for the rest of the passage (you must answer; the camera looks at Xiao).
//   #stay / #ngplus = on the two closing choices of story_end.
// "[label] line" = the button shows the label, the bubble shows the line. A choice of "…" is silence,
// and the game picks it when the reply timer runs out.
// Entry points: arrival, morning, talk, idle, chess_better, goodnight, story_end, leaving.

INCLUDE liam_inserts.ink

VAR open_liam = 0      // how much Liam has let Xiao see
VAR open_xiao = 0      // how much Xiao has let Liam see
VAR d_work = 0
VAR d_family = 0
VAR d_cabin = 0
VAR d_uni = 0
VAR d_donna = 0
VAR d_chess = 0
VAR d_sheldon = 0
VAR brother_opened = false
VAR lied_voicemail = false
VAR texted_home = false   // the once-per-trip text from home (inserts: text_home)
VAR told_cig = false      // Liam has said why he doesn't smoke (inserts: smoke)

// turn counts Talk presses and idle moments. wait_<topic> = the turn a shelved topic comes back;
// reask_<topic> = Xiao asks again when it does.
VAR turn = 0
VAR wait_work = 0
VAR wait_family = 0
VAR wait_cabin = 0
VAR wait_uni = 0
VAR wait_sheldon = 0
VAR reask_work = false
VAR reask_family = false
VAR reask_cabin = false
VAR reask_uni = false

// set by the game before each passage
VAR night = false
VAR quiet = false      // you're out by the water and nothing is biting
VAR newgame_plus = false

-> DONE

=== function trust() ===
~ return open_liam + open_xiao

=== function need(d) ===
{ d:
- 1: ~ return 0
- 2: ~ return 2
- 3: ~ return 4
- 4: ~ return 6
- 5: ~ return 8
- else: ~ return 10
}

=== function can(d, maxd) ===
~ return d < maxd && trust() >= need(d + 1)

// an honest line lands only once trust has reached n
=== function lands(n) ===
~ return trust() >= n

=== function cool(w) ===
~ return turn >= w

// said too early: undo the layer, push the topic back, and have Xiao ask again later
=== function shelve(ref d, ref w, ref r) ===
~ d = d - 1
~ w = turn + 4
~ r = true

=== function ok_work() ===
// layer 6 (who am I) waits until Xiao has told the Donna story: Liam's "as lost as you" needs it.
// layer 7 (asking for help) waits until the voicemail payoff and apology (uni layer 4): it only means something after that.
~ return cool(wait_work) && can(d_work, 7) && (d_work < 5 || d_donna >= 3) && (d_work < 6 || d_uni >= 4)
=== function ok_family() ===
~ return cool(wait_family) && (can(d_family, 4) || (d_family == 4 && quiet && trust() >= 6 && not brother_opened))
=== function ok_cabin() ===
// layer 5 (build one together) waits until the apology (uni layer 4)
~ return cool(wait_cabin) && can(d_cabin, 5) && (d_cabin < 4 || d_uni >= 4)
=== function ok_uni() ===
~ return cool(wait_uni) && d_uni > 0 && (can(d_uni, 3) || (d_uni == 3 && brother_opened && trust() >= 6))
=== function ok_donna() ===
~ return d_donna > 0 && can(d_donna, 4)
=== function ok_chess() ===
~ return d_chess > 0 && can(d_chess, 3)
=== function ok_sheldon() ===
// only after the brother reveal (family layer 4); the games need version B first
~ return cool(wait_sheldon) && d_family >= 4 && (d_sheldon == 0 || (d_sheldon == 1 && brother_opened))

=== function has_topics() ===
~ return ok_work() || ok_family() || ok_cabin() || ok_uni() || ok_donna() || ok_chess() || ok_sheldon()

// Xiao's three topics, ready for him to raise
=== function fresh_uni() ===
~ return d_uni == 0 && cool(wait_uni)
=== function fresh_donna() ===
~ return d_donna == 0 && trust() >= 2
=== function fresh_chess() ===
~ return d_chess == 0 && trust() >= 3

=== function intro_due() ===
~ return fresh_uni() || fresh_donna() || fresh_chess()

// every layer of every topic has been played
=== function story_done() ===
~ return d_work >= 7 && d_family >= 5 && d_cabin >= 5 && d_uni >= 4 && d_donna >= 4 && d_chess >= 3 && d_sheldon >= 2


// ═══════════════════════════════════════════ arrival
// Plays while they settle in: seats, rods, board, the first beer, the car.
=== arrival ===
Liam drops into the camp chair. It complains. He complains back. #beat
Xiao's already got the board on the stump and both rods rigged. Of course he has. #beat
The water's flat as glass. Liam knows this water. #beat
{newgame_plus:
    Funny. He'd swear he's sat right here before, and not just as a kid. #beat
}
* [This is Dad's spot.] Hang on. Mate. This is my dad's spot. This is actually my dad's spot. #liam
    Is it? #xiao
    ** [You knew.] You knew. #liam
        Lucky guess. #xiao
        He doesn't look up from the pieces. #beat
    ** [Small world.] Huh. Small world. #liam
    ** [Don't get emotional.] Okay. Okay, I'm not going to get emotional about a lake. #liam
        You're getting emotional. #xiao
        It's allergies. #liam
* […] …
    Liam stares at the water a little too long. #beat
-
Back past the trees, the family sedan is parked crooked, a booster seat in the back. #beat
A photo of the three of them swings from the mirror. #beat
* [Sorry about the car.] Sorry about the car. There's about four hundred hot chips in there, I reckon. Some of them are fossils. #liam
    Xiao looks at the car a second longer than he needs to. #beat
    The photo's crooked. #xiao
    ** [Missy hung it.] Missy hung it. Been crooked a year. I keep meaning to fix it. I don't think I'm going to. #liam
    ** [Leave it.] Don't touch it. It's load-bearing. #liam
        Structurally unsound. #xiao
* [Don't judge the sedan.] It's a family car, mate, don't judge. It has cup holders. Cup. Holders. #liam
    I'm not judging. #xiao
    You're judging a bit. #liam
* […] …
    Liam pretends he can't see it from here. #beat
-
Liam cracks a beer. Holds one out. #beat
Xiao takes it. Doesn't open it. Just holds it. #beat
You've… filled out. #xiao
* [Dad bod.] Dad bod. Earned every gram. Missy uses it as a slide. #liam
    Who's Missy? #xiao
    ** [You've seen the photos.] …You've seen the photos. #liam
        I've seen a lot of photos. #xiao
    ** [My daughter!] My daughter. She's eight. Eight! #liam
        I know. I've seen the photos. #xiao
* [And you've shrunk.] And you've gone the other way. Do they feed you at that firm? #liam
    Sometimes. When I remember. #xiao
    ** [Mate.] Mate. #liam
        It's a joke. #xiao
        Is it, though. #liam
* [It's the beard's absence.] I shaved the beard, you know. Years ago. Got fat instead. Net zero. #liam
    You looked like a wizard. #xiao
-
You're black. Like always. #xiao
-> DONE


// ═══════════════════════════════════════════ morning (resuming a saved trip, instead of arrival)
=== morning ===
{night:
    Liam comes back out with a torch and two beers. Xiao hasn't moved. #beat
    {
    - trust() >= 10: Couldn't sleep either? #xiao
    - trust() >= 4: Thought you'd gone to bed. #xiao
    - else: You came back. #xiao
    }
- else:
    Liam comes back with two coffees. The board's already set up. Of course it is. #beat
    {
    - trust() >= 10: You snore. Through two walls. #xiao
    - trust() >= 4: Thought you'd sleep till lunch. #xiao
    - else: Morning. #xiao
    }
}
-> DONE


// ═══════════════════════════════════════════ goodnight (Quit: they turn in, or take a break; the trip is saved)
=== goodnight ===
{night:
    {
    - trust() >= 10:
        Night, mate. #liam
        Night. #xiao
        …Glad you came. #xiao
        Yeah. Me too. Really glad. #liam
    - trust() >= 4:
        Right. Turning in before I fall in. #liam
        Don't snore. #xiao
        No promises. #liam
    - else:
        Reckon I'll hit the sack. Long drive, you know how it is. #liam
        Mm. Night. #xiao
    }
- else:
    {
    - trust() >= 10:
        Gonna have a lie-down. Don't let the fish know I've gone. #liam
        I'll keep them talking. #xiao
    - trust() >= 4:
        Back in a bit. Resting the eyes. #liam
        I'll mind your rod. #xiao
    - else:
        Gonna duck off for a bit. Back soon. #liam
        Sure. #xiao
    }
}
-> DONE


// ═══════════════════════════════════════════ talk (the Talk button)
=== talk ===
~ turn++
+ {ok_work()} [Work] -> work
+ {ok_family()} [Family] -> family
+ {ok_cabin()} [The cabin] -> cabin
+ {ok_uni()} [Uni days] -> uni
+ {ok_donna()} [Donna] -> donna
+ {ok_chess()} [Chess] -> chess
+ {ok_sheldon()} [The little bloke] -> sheldon
+ [Never mind.] -> DONE


// ═══════════════════════════════════════════ friend-led moments
=== idle ===
~ turn++
{intro_due() && RANDOM(1, 2) == 1: -> intro}
-> inserts

=== intro ===
// Xiao raises one of his three topics, picked at random from the ones that are ready
~ temp r = RANDOM(1, 3)
{r == 1 && fresh_uni(): -> uni}
{r == 2 && fresh_donna(): -> donna}
{r == 3 && fresh_chess(): -> chess}
{fresh_uni(): -> uni}
{fresh_donna(): -> donna}
{fresh_chess(): -> chess}
-> DONE

=== chess_better ===
// the game jumps here when Liam starts winning
{d_chess == 0: -> chess}
-> DONE

// a shelved topic comes back: Xiao gives Liam another go at what he tried to say
=== again ===
{~Before. Did you mean that? I'll ask again.|Earlier. What you started to say. Go on, then.|Back there. I wasn't really listening. Say it again.} #xiao
->->


// ═══════════════════════════════════════════ story_end (every topic has been played)
=== story_end ===
The lake's gone still. Neither of them reaches for the next thing to say. #beat
Think that's everything. #xiao
Everything I had, anyway. #xiao
+ [Yeah.] Yeah. Feels like it. #liam
+ [Good, though.] Good, though. Wasn't it. I mean— I don't know how to say it. It was good. #liam
    It was. #xiao
+ […] …
-
Xiao reels in, slowly, and doesn't cast again. #beat #key
+ [Stay a while.] Reckon I'll stay a bit. Just sit with it. Nobody needs me for an hour. #liam #stay
+ [Head home.] Better head home. We'll do it again, eh? Properly. I mean it this time. #liam #ngplus
-
-> DONE


// ═══════════════════════════════════════════ WORK (you raise it)
=== work ===
{reask_work:
    ~ reask_work = false
    -> again ->
}
{ d_work:
- 0: -> l1
- 1: -> l2
- 2: -> l3
- 3: -> l4
- 4: -> l5
- 5: -> l6
- else: -> l7
}

= l1
~ d_work = 1
Facebook says vice-president now. Look at you. Very fancy. Very, uh. Vice. #liam
Of ten people. One of them is the coffee machine. #xiao
* [Still counts.] Still counts! Business cards and everything? #liam
    A box of five hundred. I've given out four. #xiao
    ** [Give me one.] Give us one. I'll put it on the fridge. #liam
        You'd lose it. #xiao
        I'd frame it. #liam
* [Mine's worse.] I'm a manager now. Supermarket. Forty staff and one self-checkout that hates me personally. #liam
    Which one? #xiao
    ** [Lane four.] Lane four. "Unexpected item in the bagging area." Every time, mate. Every time. #liam
        It knows. #xiao
        ~ open_liam++
-
~ open_xiao++
-> DONE

= l2
~ d_work = 2
Last I saw, you were team leader at the big place. Which, good on you, I thought. Good on him. #liam
It didn't work out. #xiao
* [Leave it.] Their loss, mate. #liam
    Mm. #xiao
    He looks almost grateful you didn't ask. #beat
* [Ask, gently.] Oh. Yeah? What happened? You don't have to say, I'm just— what happened? #liam
    They called me the quiet guy. #xiao
    Then the quiet guy was lazy. Then he was a quitter. #xiao
    ** [Like high school.] Like high school. #liam
        Like high school. #xiao
        Without you. #xiao
        ~ open_xiao++
    ** [Want me to bounce them?] Want me to go round and bounce them? I'm a professional now. #liam
        It almost gets a smile. #beat
    --
    ~ open_xiao++
-
-> DONE

= l3
~ d_work = 3
Picked up a second job a while back. Bouncing. #liam #key
You? A bouncer? #xiao
* [Look at me, I'm a wall.] Look at me, mate. I'm a wall. Did it for fun, really. #liam
    He doesn't believe you. He lets it go anyway. #beat
+ [Tell him why.]
    {not lands(5): -> l3_soon}
    Wasn't for fun. Missy got sick. Then the car died, and her uni fund went with it. #liam
    Liam. #xiao
    ** [It's fine now.] It's fine now. Honest. She's fine, it's fine, it's all— fine. #liam
    ** [It wasn't fine.] …It wasn't fine. For a while there. I didn't tell anyone. #liam
        ~ open_liam++
    --
    ~ open_liam++
-
You used to apologise to doors. #xiao
Still do. Just after I've thrown someone out of one. #liam
-> DONE

= l3_soon
Wasn't for fun, really. Missy got— #liam
He loses the thread. Xiao's busy lining up a knight. #beat
Got what? #xiao
A mug. "World's Best Bouncer." Anyway. #liam
~ shelve(d_work, wait_work, reask_work)
-> DONE

= l4
~ d_work = 4
Did you ever think I'd end up running a supermarket? #liam #key
I thought you'd end up happy. #xiao
* [Course I'm happy!] Course I'm happy! Look at me! Look at this face! #liam
    Too loud. You both hear it. #beat
* [Mostly.] …Yeah. Mostly I am. #liam
    Mostly's good. #xiao
    Comfortable, anyway. That's the word. Comfortable. #liam
    ~ open_liam++
+ [The mirror.]
    {not lands(8): -> l4_soon}
    Few years back I looked in the mirror. Beard, gut, eyes like a dropped pie. And I thought, who's this bloke? #liam
    And? #xiao
    ** [He's a dad.] Turns out he's a dad. He's alright. Bit boring. #liam
        Boring is underrated. #xiao
        ~ open_liam++
        ~ open_liam++
-
-> DONE

= l4_soon
Few years back I looked in the mirror and thought, who's this bloke? #liam
A bloke who needs a haircut. #xiao
He means it kindly. It still closes the door. #beat
~ shelve(d_work, wait_work, reask_work)
-> DONE

= l5
// Liam's want: the money. He never asks. That's not why he came.
~ d_work = 5
Dad's physio reckons he needs proper care now. Someone coming in. Every day. #liam #focus #key
I've done the numbers. Done them a few times, actually. #liam
They don't come out any different. #liam
Xiao's watching him now, not the board. #beat
* [Xiao, could you—] Xiao, could you— …Never mind. Doesn't matter. #liam
    Could I what? #xiao
    Nothing. Pass us the Shapes. #liam
    That's not why he came. It isn't. #beat
    You can ask me things, you know. #xiao
    I know, mate. #liam
    Easier said, though. He doesn't say it. #beat
    ~ open_liam++
* [It'll work out.] It'll work out. Always does. #liam
    Does it? #xiao
    Mostly. #liam
* […] …
    Liam drinks instead. #beat
-
I work two jobs, and I see Missy asleep more than awake. That's the deal, I s'pose. #liam
~ open_liam++
-> DONE

= l6
// Liam's want: who he is outside work and home. Just as lost as Xiao.
~ d_work = 6
Know what I worked out, sitting in the car park after a shift? #liam #key
At the shop I'm the manager. At home I'm Dad. On the door I'm the big bloke. #liam
In between, in the car… I dunno who that is. Just keys. #liam
* [Thought this trip might tell me.] I think I thought this weekend might tell me. Stupid, eh. #liam
    It's not stupid. #xiao
    ~ open_liam++
* [Joke it off.] Probably just a bloke who needs a nap. #liam
    Xiao doesn't laugh. He heard the first bit. #beat
* […] …
-
I thought you had it figured out. You always looked like you did. #xiao
* [I'm as lost as you.] Mate. I'm as lost as you are. I just talk more while I'm doing it. #liam
    Xiao actually laughs. Short, surprised. #beat
    Good. I mean— not good. You know what I mean. #xiao
    Yeah. I do. #liam
    ~ open_liam++
* [Working on it.] Working on it. Slowly. Like the self-checkout. #liam
    So, never. #xiao
    So, never. #liam
-
~ open_liam++
~ open_xiao++
-> DONE

= l7
// Liam's arc: it's alright to ask for help. Xiao notices the tension: he's asking now, and he wasn't there for Xiao.
~ d_work = 7
Can I say something? And you not make it weird? #liam #focus #key
Depends how weird. #xiao
* [Very.] Pretty weird. Sorry. #liam
* [Not weird.] Not weird. Probably. A bit weird. #liam
-
Liam picks at the label on his beer. #beat
I've been doing it all on my own, mate. Dad, the shifts, the money, the, uh. All of it. #liam
Mary keeps saying "ask someone. Anyone." And I keep going, who? Who do I even— #liam
Xiao's looking at him now, not the board. #beat
You're asking me for help. #xiao
Now. #xiao
* [I know how it sounds.] I know. I KNOW how it sounds. Ten years of nothing, then, oh hey, mate, got a minute? #liam
    A bit. Yeah. #xiao
* [It's not money.] It's not— I'm not after money. That's not what this is. #liam
    I didn't say money. #xiao
    No. I did. In my head. I rehearsed this in the car the whole way here. It was better in the car. #liam
* [Forget it.] Forget it. Forget I said anything. Pass us the Shapes. #liam
    No. #xiao
    You started. Finish it. #xiao
-
You weren't there. I'm not going to pretend that didn't happen. #xiao
I know. #liam
But I booked a cabin because I couldn't ask either. For years. #xiao
So it's a bit rich. And I'm glad you said it. #xiao
* [Both?] Both? Is that allowed? #liam
    Both is allowed. #xiao
* [That's fair.] That's fair. That's really fair. #liam
* […] …
    Liam nods. It takes a while. #beat
-
* [I'm alright, really.] I'm alright, really. Just tired. You know. #liam
    Xiao lets it sit. He doesn't believe it, and he doesn't push. #beat
+ [Say it properly.]
    {not lands(12): -> l7_soon}
    I'm not great, Xiao. Honestly. I'm tired all the way down. #liam
    I don't need it fixed. I just need to say it to someone who isn't also living in it. #liam
    Mary's got enough. Dad's got enough. I can't hand them mine. #liam
    Then hand it here. I've got a rod in the water and nowhere to be. #xiao
    Liam says it. Not all of it. More than he planned to. #beat
    ~ open_liam++
    ~ open_liam++
    It's not a trade, you know. Me listening doesn't cancel the other thing. #xiao
    ** [I know.] I know. I wouldn't want it to. #liam
    ** [Yeah. Okay.] Yeah. Okay. Fair. #liam
    --
    Good. #xiao
-
Ask me again next week. #xiao
Next week? #liam
Or the one after. I'm bad at this. Hearing it, I mean. #xiao
~ open_liam++
~ open_xiao++
-> DONE

= l7_soon
I'm not great, Xiao. I'm tired all the way— #liam
Everyone's tired. #xiao
It isn't unkind. It just isn't what he meant. #beat
Yeah. Yeah, no. Everyone is. #liam
~ shelve(d_work, wait_work, reask_work)
-> DONE


// ═══════════════════════════════════════════ FAMILY (you raise it)
=== family ===
{reask_family:
    ~ reask_family = false
    -> again ->
}
{ d_family:
- 0: -> l1
- 1: -> l2
- 2: -> l3
- 3: -> l4
- else: -> l5
}

= l1
~ d_family = 1
Liam's got his phone out before he's finished sitting down. #beat
Right. First day of school. Lost tooth. Asleep in a laundry basket. Sorry. Sorry, one more. #liam
Why is she in a laundry basket? #xiao
* [No one knows.] No one knows. We found her like that. We just left her. It seemed rude not to. #liam
* [Takes after me.] She takes after her old man. Sleeps anywhere. #liam
-
She looks like she's having a good time. #xiao
* [She is.] She is. She's a good kid. I mean, I'm biased. Obviously. Don't tell her. #liam
-
Mary takes most of these. I'm usually at work when they happen. #liam
~ open_liam++
-> DONE

= l2
~ d_family = 2
Dad lives with us now. Did his back in a couple of years ago. #liam
* [Three generations, one bathroom.] Three generations, one bathroom. It's a war zone, mate. #liam
    He taught you to fish. #xiao
+ [Scared me.]
    {not lands(3): -> l2_soon}
    Scared me, honestly. Seeing him in that bed. He's the one who's meant to be the big one. I didn't know what to do with my hands. #liam
    He taught you to fish. Here. #xiao
    ~ open_liam++
-
…Yeah. He did. #liam
~ open_liam++
-> DONE

= l2_soon
Scared me, honestly. Seeing him in that— #liam
He's tough. He'll be right. #xiao
It's kind, and it's not what Liam meant. #beat
Yeah. He'll be right. #liam
~ shelve(d_family, wait_family, reask_family)
-> DONE

= l3
~ d_family = 3
Mary went to her mum's for a weekend, once. Took Missy. #liam #key
Left a note. "Food in the fridge." #liam
* [Make it a funny story.] So I did what any grown man would do. Shaved, and cleaned the whole house top to bottom. Even behind the fridge. Nobody cleans behind the fridge. #liam
    That's the most you thing I've ever heard. #xiao
+ [Tell it straight.]
    {not lands(6): -> l3_soon}
    Sat on the kitchen floor and cried like a baby. Hadn't cried in years. #liam
    Then I shaved and cleaned the whole house. #liam
    That's — #xiao
    Yeah. I know. #liam
    ~ open_liam++
-
We're good now. Better. I promised I'd at least text if I'm late. #liam
That's a terrible promise. #xiao
She said that too. #liam
~ open_liam++
-> DONE

= l3_soon
Honestly? I sat down on the kitchen floor and— #liam
Ate the food in the fridge. #xiao
…Yeah. Something like that. #liam
~ shelve(d_family, wait_family, reask_family)
-> DONE

= l4
// F7: "he passed" is the most anyone says about how
~ d_family = 4
~ wait_sheldon = turn + 3
And yours? How's your mum? And the little bloke, Sheldon? He'd be what, seventeen now? #liam #key
Xiao's hand stops over the board. #beat
He passed. #xiao #focus
* [Mate. I'm sorry.] Oh. Oh, mate. I'm so sorry. I didn't know. I didn't— sorry. #liam
* [What happened?] What — what happened? #liam
    Xiao just shakes his head. #beat
    Liam winces. Wrong question. He knows it as it leaves. #beat
* […] …
-
{quiet && trust() >= 6: -> l5}
It was a while ago. #xiao
Can we just play. #xiao
* [Yeah. Course.] Yeah. Course we can. #liam
    He takes your bishop, badly. You let him. #beat
* [If you ever want to…] Alright. But if you ever want to — #liam
    I know. #xiao
-
~ open_xiao++
-> DONE

= l5
// Version B: out here by the water it feels like the place to say it. Feelings only.
~ d_family = 5
~ brother_opened = true
The water's quiet. Something about it makes it easier. #beat #focus #key
I keep thinking there was something I should've done. #xiao
Then I think there wasn't. I don't know which one's worse. #xiao
* [Both, probably.] Both, probably. #liam
    Yeah. #xiao
* […] …
-
Some days I forget, for a second. Those are the bad days. #xiao
I didn't really tell anyone. There wasn't really anyone to tell. #xiao
* [You could've told me.] You could've — #liam
    He looks at you, and you hear it before he says anything. #beat
* [I'm here now.] I'm here now. For what it's worth. #liam
    It's worth something. #xiao
-
~ open_xiao++
~ open_xiao++
-> DONE


// ═══════════════════════════════════════════ THE LITTLE BLOKE (you raise it, a while after family layer 4)
// Memories of Sheldon alive are allowed. Never how he died: no attack, no coma, no parents.
=== sheldon ===
{ d_sheldon:
- 0: -> l1
- else: -> l2
}

= l1
~ d_sheldon = 1
He used to follow you everywhere, eh. The little bloke. #liam #key
Xiao doesn't stop him. #beat
* [Under the table.] I'd come round and there'd be this kid under the table. Just watching. Taking notes. #liam
    He was. He had a notebook. #xiao
* [Your shadow.] Your little shadow. You'd go to the fridge, he'd go to the fridge. #liam
    He said I walked too fast. #xiao
* […] …
    Xiao turns a captured pawn over in his fingers. #beat
-
He thought you were the coolest person alive. I never understood it. #xiao
* [Kid had taste.] Kid had taste. #liam
    He was seven. #xiao
* [He wanted to be you.] Nah. He wanted to be you. Anyone could see it. #liam
    Xiao looks at the water for a long time. #beat
    Thanks. #xiao
    ~ open_xiao++
-
~ open_liam++
-> DONE

= l2
// that snake game: one of the first games they made together. Liam played the prototype.
~ d_sheldon = 2
You two used to make me games. Remember? #liam #key
He'd draw everything. I'd make it move. #xiao
* [That snake game.] That snake game. That was one of the first, wasn't it? On your old laptop. #liam
    He drew the snake with eyelashes. He insisted. #xiao
* [The one that kept crashing.] The one that crashed every time you ate the third apple. #liam
    That snake game. He called that a boss fight. #xiao
-
I played that thing till three in the morning. The snake kept eating itself. #liam
It wasn't supposed to do that. #xiao
He said it was a feature. #xiao
* [It was a feature.] It was a feature. Kid was right. #liam
* [I loved it.] I loved it, mate. I hope he knew that. #liam
    He knew. You told him. Loudly. #xiao
    ~ open_liam++
* […] …
    Xiao smiles. Actually smiles. #beat
-
I've still got it somewhere. The file. #xiao
~ open_xiao++
~ open_xiao++
-> DONE


// ═══════════════════════════════════════════ THE CABIN (you raise it)
=== cabin ===
{reask_cabin:
    ~ reask_cabin = false
    -> again ->
}
{ d_cabin:
- 0: -> l1
- 1: -> l2
- 2: -> l3
- 3: -> l4
- else: -> l5
}

= l1
~ d_cabin = 1
We actually did it. The cabin. #liam
Every time something went wrong since Year 9 maths. "That's it. I'm moving to a cabin." #xiao
You said it about a parking ticket once. #xiao
* [It was unfair.] It was a deeply unfair parking ticket. #liam
* [You said it more.] You said it more than me. #liam
    I meant it more. #xiao
-
~ open_xiao++
-> DONE

= l2
~ d_cabin = 2
So what finally made you book it? #liam
{trust() < 4:
    It was time. #xiao
    That's not an answer and he knows it. #beat
- else:
    Things fell apart a bit. #xiao
    This seemed like the only thing that hadn't. #xiao
    ~ open_xiao++
}
* [Fair enough.] Fair enough. #liam
* [I nearly booked one once.] I nearly booked one, a few years back. Family trip. Had a three-year-old though. Chickened out. #liam
    You? #xiao
    Safe dad now. I own two first-aid kits. #liam
    ~ open_liam++
-
-> DONE

= l3
~ d_cabin = 3
You took two days to reply, you know. #xiao #key
* [Busy week.] Busy week. Stocktake. #liam
    Mm. #xiao
+ [Mary talked me into it.]
    {not lands(6): -> l3_soon}
    Yeah. I nearly didn't come. Mary talked me round. #liam
    She said I'd been carrying you around for ten years. #liam
    Said I could put you down, or pick up the phone. #liam
    ** [So here I am.] So. Here I am. #liam
        Here you are. #xiao
    --
    ~ open_liam++
    ~ open_liam++
-
-> DONE

= l3_soon
Yeah. I nearly didn't come. Mary— #liam
Mary needed you home. It's fine. You're here. #xiao
That's not— yeah. I'm here. #liam
~ shelve(d_cabin, wait_cabin, reask_cabin)
-> DONE

= l4
// P4: Xiao never says it out loud
~ d_cabin = 4
You picked Dad's spot on purpose. #liam #key
Lucky guess. #xiao
He's smiling at the water, not at you. #beat
* [Thanks, mate.] …Thanks, mate. #liam
* [Lucky guess.] Lucky guess. Sure. #liam
-
~ open_xiao++
-> DONE

= l5
// Liam's joy: fishing, time outside the family, "me time". The cabin turns from a joke into a plan.
~ d_cabin = 5
Can I say a stupid thing? #liam #key
I can't stop you. #xiao
I haven't just sat somewhere in, what, years? Nobody needing anything. No one saying "Dad" at me. #liam
I love it. Fishing. Properly love it. Not the "Dad I got one!" kind, though that's the best thing, that's— this is different. This one's mine. #liam
* [Feels dodgy saying that.] Feels dodgy saying it. Like I'm nicking it from them. #liam
    You're allowed one thing. #xiao
    Is that a rule? #liam
    It's a rule now. #xiao
* [Mary says I'm allowed.] Mary reckons I'm allowed hobbies. She said it nearly in writing. #liam
    Smart woman. #xiao
* […] …
    Liam watches his float. It doesn't do anything. He's happy anyway. #beat
-
So. Next time. We should come out here and build one. #liam
Build what? #xiao
A cabin! A proper one. Us. With, like, tools. #liam
We can't build a shelf. #xiao
Your shelf was fine. #liam
It leaned. #xiao
It leaned with character. #liam
Xiao pulls a pen out and starts drawing on the lid of the Shapes box. #beat
Two bedrooms. Missy gets the top bunk, obviously. #liam
He adds a third room without saying who it's for. #beat
+ [I want this to be a thing.]
    {not lands(10): -> l5_soon}
    I want this to be a thing, mate. Not once-a-decade. I'm not saying it's a promise. I'm saying I want it. #liam
    Xiao keeps drawing. His ears have gone a bit pink. #beat
    Wall's too thin there. #xiao
    ~ open_liam++
    ~ open_xiao++
* [Where's the toilet?] Where's the toilet? #liam
    Outside. Builds character. #xiao
-
~ open_xiao++
-> DONE

= l5_soon
I want this to be a thing, mate. Like, actually— #liam
You'll need a bigger kettle. #xiao
He's already onto the plumbing. Liam lets the thought go for now. #beat
~ shelve(d_cabin, wait_cabin, reask_cabin)
-> DONE


// ═══════════════════════════════════════════ UNI DAYS (Xiao raises it)
=== uni ===
{reask_uni:
    ~ reask_uni = false
    -> again ->
}
{ d_uni:
- 0: -> l1
- 1: -> l2
- 2: -> l3
- else: -> l4
}

= l1
// F8: they only talk about it; the real track never plays
~ d_uni = 1
Thanks for the Memories. Your car. Windows down. #xiao
You did all the voices. #xiao
* [There's one voice.] There's only one voice in that song. #liam
    You found four more. #xiao
* [Still a banger.] Still a banger. Don't care what anyone says. #liam
    Nobody's said anything about it in years. #xiao
+ [Mary put it on once.]
    {not lands(2): -> l1_soon}
    Mary put it on once. First anniversary. Couldn't sing it. Just drove. #liam
    You couldn't sing it before either. #xiao
    ~ open_liam++
-
~ open_xiao++
-> DONE

= l1_soon
Mary put it on once. First anniversary. I couldn't— #liam
Couldn't hit the high note. I remember. #xiao
He's smiling at the wrong thing. Liam lets him. #beat
~ shelve(d_uni, wait_uni, reask_uni)
-> DONE

= l2
// P8: ten years of guilt over a bad night's sleep
~ d_uni = 2
I saw you at graduation. Across the hall. #liam
Did you? #xiao
* [You looked rough.] You looked… rough. And I've felt bad about it for years. Like, genuinely. Weird, I know. #liam
    I'd been at the internship all night. I was just tired. #xiao
    Ten years of guilt, over a bad night's sleep. #beat
* [I looked for you after.] I looked for you after. You'd gone. #liam
    I had a train. #xiao
    A train. Right. #liam
-
I don't remember seeing you. #xiao
~ open_liam++
-> DONE

= l3
// P2 + F4: he called, then left a voicemail
~ d_uni = 3
I called you once. Couple of years after uni. #xiao #focus #key
Left a message. #xiao
* [I listened to it.] Yeah. I listened to it. End of the week. #liam
    ~ open_liam++
* [I don't remember.] Did you? I don't… I don't remember that. #liam
    He nods, as if he expected that. #beat
    ~ lied_voicemail = true
* […] …
-
{lied_voicemail: -> DONE}
You sounded fine. "Hey, been a while, you free sometime?" #liam
I'm good at sounding fine. #xiao
* [You were team leader.] Facebook said team leader. Figured you were flying. Figured you didn't need — #liam
    I'd quit by then. #xiao
    ~ open_liam++
* [I meant to call back.] I meant to call back. Then it'd been too long to. And then it was even longer to. And, you know. #liam
-
~ open_xiao++
-> DONE

= l4
// P2's payoff and the apology, only after the brother (family layer 5)
~ d_uni = 4
Liam's been doing the maths. #beat #focus #key
When you called. Was that when — #liam
Xiao doesn't answer. Which is an answer. #beat
{lied_voicemail:
    I lied before. I did listen to it. #liam
}
Why'd you make it sound like nothing, then? #liam
I was stupid, I guess. #xiao
* [You were hurting.] No. You were hurting. And you still tried to reach out. And I was on the couch, mate. I was literally on the couch. #liam
    ~ open_liam++
* […] …
    Liam puts a hand on his shoulder. Leaves it there. #beat
-
I've had this whole speech. For ten years. In the car, in the shower. It's gone. It's just "sorry" now. #liam
* [I'm sorry.] I'm sorry. For the message. For not— all of it. I'm really, really sorry. #liam
    Okay. #xiao
    Okay? #liam
    Okay. I heard it. #xiao
    That's it? #liam
    It's a lot, for me. #xiao
    ** [Are you angry?] Are you still angry? You can be. #liam
        Was. For a bit. Not now. #xiao
        Liam breathes out like he's been holding it since that couch. #beat
        ~ open_liam++
    ** [Take your time.] Take whatever time. I'm not going anywhere. #liam
* [It wasn't enough.] I should've picked up. Or called back. Or sent a dumb meme. Anything. #liam
    A meme would've been great, actually. #xiao
    ** [I'll send so many.] I'll send so many memes. You'll beg me to stop. #liam
        Don't. #xiao
        Too late. #liam
        ~ open_xiao++
-
~ open_liam++
~ open_xiao++
-> DONE


// ═══════════════════════════════════════════ DONNA (Xiao raises it)
=== donna ===
{ d_donna:
- 0: -> l1
- 1: -> l2
- 2: -> l3
- else: -> l4
}

= l1
~ d_donna = 1
Xiao's phone buzzes. He turns it face down without looking. #beat
* [Work?] Work? #liam
* [Could be important.] Could be important. #liam
-
It's Donna. My wife. #xiao
* [Saw the wedding photos.] Saw the wedding photos. Nice suit. #liam
    Donna picked it. #xiao
* [How's she going?] How's she going? #liam
    Fine. Busy. #xiao
    He moves a pawn he doesn't need to move. #beat
-
~ open_xiao++
-> DONE

= l2
~ d_donna = 2
How's Donna, really? #liam
Her dad died. Last year. He was my boss. #xiao
* [Good bloke?] Good bloke? #liam
    He made us go home at five. Every day. Stood at the door. #xiao
    Nobody ever made me go home. #xiao
    ~ open_xiao++
* […] …
-
~ open_xiao++
-> DONE

= l3
// P6 + P7: Year 7's "yeah, sure" has to sound different from Year 9's
~ d_donna = 3
She proposed, you know. Not me. #xiao #focus #key
* [Course she did.] Course she did. You'd still be thinking about it. #liam
* [Romantic.] Mate. Romantic. #liam
-
After everyone left the office. She'd drawn it up like a site plan. Two boxes. One said yes. #xiao
I said "yeah, sure." #xiao
She laughed. She knew that was the most I had. #xiao
It was a lot, for me. Back then. #xiao
Then her dad died. She asked me something, half joking. #xiao
I said it again. Same two words. #xiao
They didn't mean anything that time. She could tell. #xiao
* [Where is she now?] Where's she now? #liam
    Her dad's house. #xiao
    We still share an office. Ten people, and we don't talk. #xiao
* [You meant it the first time.] You meant it the first time. That counts. #liam
    It did. Once. #xiao
-
~ open_xiao++
~ open_xiao++
-> DONE

= l4
// P10: he thought it'd be funny. It's just sad.
~ d_donna = 4
I brought you something. It's stupid. #xiao #focus #key
A cream envelope. Your name in his neat architect handwriting. A stamp. Never posted. #beat
It was going to be funny. #xiao
* [Is this…] Is this your wedding invite? #liam
    You had a kid. A wife. A whole — I didn't want to bring all of me into that. #xiao
* […] …
    He pushes it across the stump anyway. #beat
-
* [I'd have come.] I would've come, you idiot. I'd have been rubbish at the speech, but I'd have come. #liam
    He doesn't answer. He doesn't take it back, either. #beat
* [Fridge.] I'm keeping this. Going on the fridge, next to Missy's horse with six legs. #liam
    Don't. #xiao
    Fridge. #liam
-
~ open_xiao++
-> DONE


// ═══════════════════════════════════════════ CHESS (Xiao raises it, or the game does when Liam starts winning)
=== chess ===
{ d_chess:
- 0: -> l1
- 1: -> l2
- else: -> l3
}

= l1
// P3
~ d_chess = 1
When did you get good? #xiao
* [Natural talent.] Natural talent, mate. Always had it. #liam
    You used to lose in eleven moves. #xiao
* [Dad.] Dad did his back in. Moved in with us. That's a whole year of chess and hospital jelly cups. #liam
    You used to lose in eleven moves. #xiao
    ~ open_liam++
-
You used to tell me it was eleven. Every time. #liam
It was always eleven. #xiao
-> DONE

= l2
~ d_chess = 2
Remember how we met? #liam
You sat at my table in the library and asked if the horse could jump. #xiao
* [It can jump!] It CAN jump. I was right. #liam
* [Nobody talked to you.] Nobody ever talked to you. #liam
    Everyone thought I wanted to be left alone. #xiao
    ** [Did you?] Did you? #liam
        No. #xiao
        ~ open_xiao++
-
~ open_xiao++
-> DONE

= l3
~ d_chess = 3
Missy wants to learn. I'm rubbish at explaining it. #liam #key
* [Ask him.] You could teach her. If you wanted. No pressure. Some pressure. #liam
    …I'd like that. #xiao
    ~ open_xiao++
    ~ open_liam++
* [YouTube, I reckon.] I'll find her a video or something. #liam
    Start with the horse. Kids like the horse. #xiao
-
-> DONE


// ═══════════════════════════════════════════ leaving (plays on Settings → New game, the real goodbye)
// No good or bad endings, just how real "next time" feels. Short on purpose.
=== leaving ===
{
// mostly about how much YOU let Liam say; Xiao opens up as the layers do
- open_liam >= 14 && open_xiao >= 14: -> really_next_time
- open_liam >= 7 || open_xiao >= 12: -> lopsided
- else: -> polite_lie
}

= polite_lie
{~We should do this again.|Good to see you, mate. Really.} #liam
{~Yeah. Definitely.|Yeah. You too.} #xiao
They both nod, and they both know. #beat
-> END

= lopsided
{open_liam > open_xiao:
    Thanks for letting me bang on. #liam
    You always did. #xiao
- else:
    Thanks. For… yeah. #xiao
    Anytime, mate. I mean it. #liam
}
Same time next year? #liam
Maybe. #xiao
It's not nothing. #beat
-> END

= really_next_time
Missy's birthday's in March. #liam
{chess.l3:
    She'll want her chess lesson. #liam
- else:
    She'll want to meet the bloke who taught her dad to lose at chess. #liam
}
{cabin.l5:
    And bring the drawings. For the cabin. #liam
}
Come. Please. #liam
Yeah. Yeah, sure. #xiao
{donna.l3:
    And this time it sounds like the first time. #beat
}
-> END
