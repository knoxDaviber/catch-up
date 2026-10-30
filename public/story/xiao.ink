// Catch Up: Xiao's side. You play Xiao; Liam sits across the board.
// Draft 2. It mirrors liam.ink, but here YOU choose what Xiao lets out, and Liam's secrets arrive in his lines.
//
// HOW TOPICS WORK (STORY_BIBLE.md §7)
//   You can raise three from the start (Work, The cabin, Uni days).
//   Liam brings up the other three himself (Family, Donna, Chess), because of course he does.
//   Returning to a topic goes one layer deeper: layer 2 needs trust 2, layer 3 needs 4, layer 4 needs 6.
//
// HOW CHOICES WORK
//   Your options are Xiao's state of mind. They start clipped and flat; "…" is always close at hand.
//   The honest option often isn't there at all until he trusts Liam enough to say it.
//   Some things (the lake) he never says, however high trust gets. Only deflections are offered.
//
// Tags and conventions: see liam.ink. Entry points: arrival, talk, idle, chess_better, leaving.
// chess_better fires on this side when LIAM starts winning, because he's the one who got good (P3).

INCLUDE xiao_inserts.ink

VAR open_liam = 0
VAR open_xiao = 0
VAR d_work = 0
VAR d_cabin = 0
VAR d_uni = 0
VAR d_family = 0
VAR d_donna = 0
VAR d_chess = 0
VAR brother_opened = false

// set by the game before each passage
VAR night = false
VAR quiet = false

-> DONE

=== function trust() ===
~ return open_liam + open_xiao

=== function need(d) ===
{ d:
- 1: ~ return 0
- 2: ~ return 2
- 3: ~ return 4
- else: ~ return 6
}

=== function can(d, maxd) ===
~ return d < maxd && trust() >= need(d + 1)

=== function ok_work() ===
~ return can(d_work, 4)
=== function ok_cabin() ===
~ return can(d_cabin, 4)
=== function ok_uni() ===
~ return can(d_uni, 3) || (d_uni == 3 && brother_opened && trust() >= 6)
=== function ok_family() ===
~ return d_family > 0 && (can(d_family, 4) || (d_family == 4 && quiet && trust() >= 6 && not brother_opened))
=== function ok_donna() ===
~ return d_donna > 0 && can(d_donna, 4)
=== function ok_chess() ===
~ return d_chess > 0 && can(d_chess, 3)

=== function has_topics() ===
~ return ok_work() || ok_cabin() || ok_uni() || ok_family() || ok_donna() || ok_chess()

=== function intro_due() ===
~ return d_family == 0 || (d_donna == 0 && trust() >= 2) || (d_chess == 0 && trust() >= 3)


// ═══════════════════════════════════════════ arrival
=== arrival ===
You've had the board set up for forty minutes. You moved the bishops twice. Both rods rigged. #beat
Liam drops into the other chair. It complains. He complains back. He's bigger than the photos. Louder. #beat
Hang on. #liam
Mate, this is my dad's spot. #liam
* [Is it?] Is it? #xiao
    Liam squints at you. #beat
* [Lucky guess.] Lucky guess. #xiao
* […] …
    You keep setting out pawns. Your hands need something to do. #beat
-
He cracks a beer and holds one out. You take it. You don't open it. You just hold it. #beat
Look at you, though. Do they feed you at that firm? #liam
* [When I remember.] Sometimes. When I remember. #xiao
* [You've filled out.] You've… filled out. #xiao
    Dad bod. Earned every gram. Missy uses it as a slide. #liam
    You know who Missy is. You've seen every photo. #beat
    ** [Who's Missy?] Who's Missy? #xiao
        …You've seen the photos. #liam
        I've seen a lot of photos. #xiao
    ** [The laundry basket one.] The one asleep in the laundry basket. #xiao
        Liam lights up like you've handed him a trophy. #beat
        ~ open_xiao++
-
You're white. I'm black. Like always. #liam
-> DONE


// ═══════════════════════════════════════════ talk
=== talk ===
+ {ok_work()} [Work] -> work
+ {ok_cabin()} [The cabin] -> cabin
+ {ok_uni()} [Uni days] -> uni
+ {ok_family()} [Family] -> family
+ {ok_donna()} [Donna] -> donna
+ {ok_chess()} [Chess] -> chess
+ [Never mind.] -> DONE


// ═══════════════════════════════════════════ friend-led moments
=== idle ===
{intro_due() && RANDOM(1, 2) == 1: -> intro}
-> inserts

=== intro ===
~ temp r = RANDOM(1, 3)
{r == 1 && d_family == 0: -> family}
{r == 2 && d_donna == 0 && trust() >= 2: -> donna}
{r == 3 && d_chess == 0 && trust() >= 3: -> chess}
{d_family == 0: -> family}
{d_donna == 0 && trust() >= 2: -> donna}
{d_chess == 0 && trust() >= 3: -> chess}
-> DONE

=== chess_better ===
{d_chess == 0: -> chess}
-> DONE


// ═══════════════════════════════════════════ WORK (you raise it)
=== work ===
{ d_work:
- 0: -> l1
- 1: -> l2
- 2: -> l3
- else: -> l4
}

= l1
~ d_work = 1
Facebook says you're a manager now. #xiao
Supermarket! Forty staff and one self-checkout that hates me personally. #liam
* [Which one?] Which one? #xiao
    Lane four. "Unexpected item in the bagging area." Every time, mate. #liam
    ** [It knows.] It knows. #xiao
        He laughs so loudly a bird leaves. #beat
* [Congratulations.] Congratulations. #xiao
    Don't say it like it's a funeral. #liam
-
And you! Vice-president! #liam
* [Of ten people.] Of ten people. One of them is the coffee machine. #xiao
* [It's nothing.] It's nothing. Small firm. #xiao
-
~ open_liam++
-> DONE

= l2
~ d_work = 2
Liam gets there before you do. #beat
Last I saw, you were team leader at the big place. #liam
* [It didn't work out.] It didn't work out. #xiao
    Their loss, mate. #liam
* {trust() >= 2} [The quiet guy.] They called me the quiet guy. Then the quiet guy was lazy. Then he was a quitter. #xiao
    Like high school. #liam
    ** [Without you.] Like high school. Without you. #xiao
        ~ open_xiao++
    ** […] …
    --
    ~ open_xiao++
-
-> DONE

= l3
~ d_work = 3
You. A bouncer. #xiao
Look at me, mate. I'm a wall. #liam
* [You apologise to doors.] You used to apologise to doors. #xiao
    Still do. Just after I've thrown someone out of one. #liam
* {trust() >= 4} [Why, really?] Why, really? #xiao
    He looks at the board a long time. #beat
    Missy got sick. Then the car died, and her uni fund went with it. #liam
    Mary went to her mum's for a weekend, too. I didn't handle that great. #liam
    ** [I didn't know.] I didn't know any of that. #xiao
        Yeah, well. Didn't put it on Facebook, did I. #liam
    --
    ~ open_liam++
    ~ open_liam++
-
-> DONE

= l4
~ d_work = 4
Are you happy? #xiao
Did you ever think I'd end up running a supermarket? #liam
* [I thought you'd end up happy.] I thought you'd end up happy. #xiao
-
…Yeah. Mostly. #liam
Few years back I looked in the mirror. Beard, gut, eyes like a dropped pie. #liam
Turns out it's a dad. He's alright. Bit boring. #liam
* [Boring is underrated.] Boring is underrated. #xiao
* {trust() >= 6} [I'd trade you.] I'd trade you. #xiao
    He looks at you properly then. Past the photos. #beat
    ~ open_xiao++
-
~ open_liam++
~ open_liam++
-> DONE


// ═══════════════════════════════════════════ THE CABIN (you raise it)
=== cabin ===
{ d_cabin:
- 0: -> l1
- 1: -> l2
- 2: -> l3
- else: -> l4
}

= l1
~ d_cabin = 1
We actually did it. #xiao
The cabin! Every time something went wrong since Year 9 maths. "That's it. I'm moving to a cabin." #liam
* [The parking ticket.] You said it about a parking ticket once. #xiao
    It was a deeply unfair parking ticket. #liam
* [I meant it more.] You said it more. I meant it more. #xiao
    He laughs, then stops, like he heard it. #beat
    ~ open_xiao++
-
~ open_liam++
-> DONE

= l2
~ d_cabin = 2
So what finally made you book it? #liam
* [It was time.] It was time. #xiao
    That's not an answer, and his face says he knows. #beat
* {trust() >= 4} [Things fell apart.] Things fell apart a bit. This seemed like the only thing that hadn't. #xiao
    Liam goes quiet. Then: alright. Alright, mate. #beat
    ~ open_xiao++
* […] …
-
I nearly booked one, a few years back. Had a three-year-old though. Chickened out. #liam
Safe dad now. I own two first-aid kits. #liam
~ open_liam++
-> DONE

= l3
~ d_cabin = 3
You took two days to reply. #xiao
{trust() < 4:
    Busy week. Stocktake. #liam
    He's lying. You've known him since Year 9. #beat
- else:
    Yeah. Nearly didn't come. #liam
    Mary talked me round. Said I'd been carrying you around for ten years. #liam
    Said I could put you down, or pick up the phone. #liam
    ~ open_liam++
    ~ open_liam++
}
* [Okay.] Okay. #xiao
* {trust() >= 4} [I'm glad you came.] I'm glad you came. #xiao
    ~ open_xiao++
-
-> DONE

= l4
// P4: Xiao never says it, however high trust gets. Only deflections are offered.
~ d_cabin = 4
You picked Dad's spot on purpose. #liam
You remember every summer he talked about this place. You don't say that. #beat
* [Lucky guess.] Lucky guess. #xiao
* [It's a good spot.] It's a good spot. #xiao
* […] …
-
…Thanks, mate. #liam
~ open_xiao++
-> DONE


// ═══════════════════════════════════════════ UNI DAYS (you raise it)
=== uni ===
{ d_uni:
- 0: -> l1
- 1: -> l2
- 2: -> l3
- else: -> l4
}

= l1
// F8: they only talk about it
~ d_uni = 1
Thanks for the Memories. Your car. Windows down. You did all the voices. #xiao
There's only one voice in that song. #liam
* [You found four more.] You found four more. #xiao
-
Mary put it on once. First anniversary. Couldn't sing it. Just drove. #liam
* [You couldn't sing it before.] You couldn't sing it before, either. #xiao
    He laughs, and doesn't explain. You think you know anyway. #beat
* […] …
-
~ open_liam++
-> DONE

= l2
// P8
~ d_uni = 2
Liam picks at the label on his beer. #beat
I saw you at graduation. You looked… rough. I've felt bad about it for years. #liam
* [I don't remember.] I don't remember seeing you. #xiao
* [I was just tired.] I'd been at the internship all night. I was just tired. #xiao
    Ten years of guilt, over a bad night's sleep. You almost laugh. #beat
-
~ open_liam++
-> DONE

= l3
// P2 + F4: you choose whether to bring it up at all
* [I called you once.] I called you once. Couple of years after uni. Left a message. #xiao
    ~ d_uni = 3
    -> answer
* [Never mind.] Never mind. #xiao
    He lets it go. You let yourself. #beat
    -> DONE
= answer
{open_liam >= 3:
    -> honest
- else:
    -> lie
}
= honest
Yeah. I listened to it. End of the week. #liam
You sounded fine. "Hey, been a while, you free sometime?" #liam
* [I'm good at sounding fine.] I'm good at sounding fine. #xiao
    ~ open_xiao++
* […] …
-
Facebook said team leader. Figured you were flying. Figured you didn't need — #liam
* [I'd quit by then.] I'd quit by then. #xiao
    He sits back like you've pushed him. #beat
    ~ open_liam++
* [It's fine.] It's fine. #xiao
    It's not, mate. #liam
-
-> DONE
= lie
Did you? I don't… I don't remember that. #liam
He's looking at the board. He's lying. You've known him since Year 9. #beat
* [Okay.] Okay. #xiao
* […] …
-
-> DONE

= l4
// P2's payoff, only after the brother
~ d_uni = 4
He's been doing the maths. You can see it on his face. #beat
When you called. Was that when — #liam
* […] …
-
Why'd you make it sound like nothing, then? #liam
* [I was stupid, I guess.] I was stupid, I guess. #xiao
* [I didn't know how to say it.] I didn't know how to say it. I still don't. #xiao
-
No. You were hurting. And you still tried to reach out. #liam
I'm sorry, mate. I'm so sorry. #liam
He puts a hand on your shoulder and leaves it there. You let him. #beat
~ open_liam++
~ open_xiao++
-> DONE


// ═══════════════════════════════════════════ FAMILY (Liam raises it)
=== family ===
{ d_family:
- 0: -> l1
- 1: -> l2
- 2: -> l3
- 3: -> l4
- else: -> l5
}

= l1
~ d_family = 1
Liam has his phone out before you can stop him. #beat
Right. First day of school. Lost tooth. Asleep in a laundry basket. #liam
* [Why the basket?] Why is she in a laundry basket? #xiao
    No one knows. We found her like that. #liam
* [She looks happy.] She looks like she's having a good time. #xiao
    Yeah. She does, doesn't she. #liam
-
You've seen these already. You liked half of them. You never commented on one. #beat
~ open_liam++
-> DONE

= l2
~ d_family = 2
Dad lives with us now. Did his back in a couple of years ago. #liam
Three generations, one bathroom. #liam
* [He taught you to fish.] He taught you to fish. #xiao
* {trust() >= 2} [He taught you to fish. Here.] He taught you to fish. Here. #xiao
    Liam looks at the water, then at you. #beat
    ~ open_xiao++
-
…Yeah. He did. Scared me, seeing him in that bed. #liam
~ open_liam++
-> DONE

= l3
~ d_family = 3
{trust() < 4:
    Mary went to her mum's for a weekend once. I shaved and cleaned the whole house. #liam
- else:
    Mary went to her mum's for a weekend once. Left a note. "Food in the fridge." #liam
    Sat on the kitchen floor and cried like a baby. Then shaved and cleaned the whole house. #liam
    ~ open_liam++
}
* [That's the most you thing.] That's the most you thing I've ever heard. #xiao
* [I didn't know.] I didn't know. #xiao
    Yeah, well. Didn't put it on Facebook. #liam
-
~ open_liam++
-> DONE

= l4
// F7: "he passed" is the most anyone says
~ d_family = 4
And yours? How's your mum? And the little bloke, Sheldon? He'd be what, seventeen now? #liam
Your hand stops over the board. #beat
* [He passed.] He passed. #xiao
    Mate. I'm so sorry. I didn't know. #liam
    {quiet && trust() >= 6: -> l5}
    ** [Can we just play.] It was a while ago. Can we just play. #xiao
        Yeah. Course we can. #liam
        You take his bishop, badly. He lets you. #beat
        ~ open_xiao++
    ** […] …
        He doesn't push. He just slides a pawn forward. #beat
* […] …
    Liam waits. You can't. You move a knight instead. #beat
    He lets it go. For now. #beat
-
-> DONE

= l5
// Version B: out here, it feels like the place to say it. Feelings only.
~ d_family = 5
~ brother_opened = true
The water's flat. Nobody here but him. It's easier than you thought it'd be. #beat
* [Something I should've done.] I keep thinking there was something I should've done. Then I think there wasn't. I don't know which one's worse. #xiao
    Both, probably. #liam
* [Some days I forget.] Some days I forget, for a second. Those are the bad days. #xiao
-
* [There wasn't anyone to tell.] I didn't really tell anyone. There wasn't really anyone to tell. #xiao
    You could've — #liam
    He stops, and you watch him work it out. #beat
    ~ open_xiao++
* […] …
    I'm here now. For what it's worth. #liam
-
~ open_xiao++
-> DONE


// ═══════════════════════════════════════════ DONNA (Liam raises it)
=== donna ===
{ d_donna:
- 0: -> l1
- 1: -> l2
- 2: -> l3
- else: -> l4
}

= l1
~ d_donna = 1
Your phone buzzes. You turn it face down without looking. #beat
Work? #liam
* [Work.] Work. #xiao
    On a Saturday? Mate. #liam
    How's the missus, anyway? #liam
    ** [Fine. Busy.] She's fine. Busy. #xiao
        You move a pawn you don't need to move. #beat
* [It's Donna.] It's Donna. My wife. #xiao
    Saw the wedding photos. Nice suit. #liam
    ** [She picked it.] She picked it. #xiao
    --
    ~ open_xiao++
-
-> DONE

= l2
~ d_donna = 2
Her dad died. Last year. He was my boss. #xiao
Good bloke? #liam
* [He made us go home.] He made us go home at five. Every day. Stood at the door. Nobody ever made me go home. #xiao
    ~ open_xiao++
* [He was alright.] He was alright. #xiao
-
~ open_xiao++
-> DONE

= l3
// P6 + P7. You decide how far he gets.
~ d_donna = 3
* [She proposed.] She proposed, you know. Not me. #xiao
-
Course she did. You'd still be thinking about it. #liam
* [Site plan.] After everyone left. She'd drawn it like a site plan. Two boxes. One said yes. #xiao
-
* [I said "yeah, sure."] I said "yeah, sure." #xiao
-
Mate. Romantic. #liam
* [She laughed.] She laughed. She knew that was the most I had. It was a lot, for me. Back then. #xiao
-
* [I said it again.] Then her dad died. She asked me something, half joking. I said it again. Same two words. They didn't mean anything that time. She could tell. #xiao
* […] …
    The rest sits in your throat. #beat
    ~ open_xiao++
    -> DONE
-
Where's she now? #liam
* [Her dad's house.] Her dad's house. We still share an office. Ten people, and we don't talk. #xiao
-
You meant it the first time. That counts. #liam
~ open_xiao++
~ open_xiao++
-> DONE

= l4
// P10: you can still leave it in the bag
The envelope's been in your bag since you packed. You almost left it in the car. #beat
* [Hand it over.] I brought you something. It's stupid. #xiao
    ~ d_donna = 4
* [Leave it.] Never mind. #xiao
    -> DONE
-
A cream envelope. His name in your handwriting. A stamp. Never posted. #beat
Is this your wedding invite? #liam
* [It was going to be funny.] It was going to be funny. #xiao
* [I didn't want to bring my mess.] You had a kid. A wife. A whole — I didn't want to bring all of me into that. #xiao
    ~ open_xiao++
-
I would've come, you idiot. #liam
I'm keeping this. Going on the fridge, next to Missy's horse with six legs. #liam
* [Don't.] Don't. #xiao
    Fridge. #liam
-
~ open_xiao++
-> DONE


// ═══════════════════════════════════════════ CHESS (Liam raises it, or the game does when he starts winning)
=== chess ===
{ d_chess:
- 0: -> l1
- 1: -> l2
- else: -> l3
}

= l1
~ d_chess = 1
Liam takes your rook and doesn't even gloat. That's how you know. #beat
* [When did you get good?] When did you get good? #xiao
-
Dad did his back in. Moved in with us. A whole year of chess and hospital jelly cups. #liam
* [You lost in eleven moves.] You used to lose in eleven moves. #xiao
    You used to tell me it was eleven. Every time. #liam
    ** [It was always eleven.] It was always eleven. #xiao
-
~ open_liam++
-> DONE

= l2
~ d_chess = 2
Remember how we met? I sat at your table in the library and asked if the horse could jump. #liam
* [It can jump.] You were right. It can jump. #xiao
* {trust() >= 2} [Nobody else talked to me.] Nobody else talked to me. Everyone thought I wanted to be left alone. #xiao
    Did you? #liam
    ** [No.] No. #xiao
        ~ open_xiao++
-
~ open_liam++
-> DONE

= l3
~ d_chess = 3
Missy wants to learn. I'm rubbish at explaining it. #liam
You could teach her. If you wanted. #liam
* [I'd like that.] …I'd like that. #xiao
    ~ open_xiao++
    ~ open_xiao++
* [Start with the horse.] Start with the horse. Kids like the horse. #xiao
-
-> DONE


// ═══════════════════════════════════════════ leaving (plays when you press Quit)
=== leaving ===
{
// mostly about how much YOU let Xiao say; Liam opens up as the layers do
- open_xiao >= 8 && open_liam >= 10: -> really_next_time
- open_xiao >= 5 || open_liam >= 10: -> lopsided
- else: -> polite_lie
}

= polite_lie
{~We should do this again.|Good to see you, mate. Really.} #liam
* [Yeah. Definitely.] Yeah. Definitely. #xiao
-
You both nod. You both know. #beat
-> END

= lopsided
Car's packed. Neither of you moves to get in. #beat
{open_liam > open_xiao:
    Thanks for letting me bang on. #liam
- else:
    Anytime, mate. I mean it. #liam
}
Same time next year? #liam
* [Maybe.] Maybe. #xiao
-
It's not nothing. #beat
-> END

= really_next_time
Missy's birthday's in March. #liam
{chess.l3:
    She'll want her chess lesson. #liam
- else:
    She'll want to meet the bloke who taught her dad to lose at chess. #liam
}
Come. Please. #liam
* [Yeah. Yeah, sure.] …Yeah. Yeah, sure. #xiao
    {donna.l3:
        You hear it as you say it. It sounds like the first time. #beat
    }
* [I'll try.] I'll try. #xiao
    That's a yes, then. #liam
-
-> END
