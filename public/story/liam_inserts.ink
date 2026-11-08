// Catch Up: light inserts for Liam's side. Draft 3 (adds text_home, smoke, me_time).
// Random small moments for quiet stretches. `idle` in the main file picks between these and a new topic.
// Each one plays at most once per trip. Add more freely; keep them short, three to six bubbles.

=== inserts ===
{shuffle once:
- -> hail_mary
- -> slither
- -> frog_game
- -> missy_blocks
- -> shapes
- -> kart_nights
- -> arvo
- -> shark_movie
}
-> DONE


=== hail_mary ===
Did you ever end up watching Project Hail Mary? #xiao
* [Fell asleep.] Started it. Fell asleep on the couch. Missy told me how it ends. #liam
    She's eight. #xiao
    ** [She's very thorough.] She's very thorough. There was a lot of interpretive dance. #liam
* [Cried at the end.] Yeah. Cried at the end. Don't tell anyone. #liam
    Who would I tell. #xiao
-
I read the book. Twice. #xiao
Course you did. #liam
-> DONE


=== slither ===
// No Sheldon here: that snake game is a memory now, in the main file (sheldon.l2), after the reveal.
Someone on the train was playing slither.io. Still. #xiao
* [We played so much slither.io.] Mate, we played so much slither.io. Your place, three in the morning. #liam
    You always went for the big ones. #xiao
    ** [Go big or go home.] Go big or go home. #liam
        You always went home. In about forty seconds. #xiao
* [I don't have time for games.] Haven't touched a game in years. Missy's got the TV most nights. #liam
    That sounds nice, actually. #xiao
-
-> DONE


=== frog_game ===
There's a game in a shop window near my office. Cover's just a frog in a suit. #xiao
I don't know what it's about. #xiao
I think about it a lot. #xiao
* [Is he a lawyer?] Is the frog a lawyer? He's got to be a lawyer. #liam
    That's what I thought. #xiao
    ** [Buy it.] Buy it. Find out. Report back. #liam
        It's sixty dollars. #xiao
        For frog law? Bargain. #liam
* [Never buy it.] Never buy it. It'll never be as good as the one in your head. #liam
    …That's very wise. #xiao
    I have my moments. #liam
-
-> DONE


=== missy_blocks ===
* [Missy built me a house.] Missy's into that blocks game. Built me a house last week. #liam
-
Nice? #xiao
* [No doors.] Very nice. No doors though. I'm just in there, forever. #liam
    Structurally, a bold choice. #xiao
    ** [Ask the architect.] Want to look it over? Professional opinion? #liam
        I'd need to see the load-bearing blocks. #xiao
        He's only half joking. You can tell he'd love that. #beat
-
-> DONE


=== shapes ===
Brought snacks. #xiao
A box of Shapes. He's already taken all the good ones out. #beat
* [Pizza?] Where are all the pizza ones? #liam
    I don't know what you mean. #xiao
* [Chicken Crimpy, really?] You've left me Chicken Crimpy. The worst Shape. #liam
    It's the best Shape. You've always been wrong about this. #xiao
-
Some things don't change, eh. #liam
-> DONE


=== kart_nights ===
* [Remember the kart nights?] Remember kart nights? You on the controller with the dodgy stick. #liam
-
I won with it. #xiao
* [Through cheating.] You won by never using the items. It's psychological warfare. #liam
    Items are for people who can't drive. #xiao
* [The rainbow one.] That rainbow track. You never fell off once. Not once. #liam
    I practised when you weren't there. #xiao
    ** [You what?] You WHAT? #liam
        Every day. For a year. #xiao
-
-> DONE


=== arvo ===
// The ironic "arvo": Liam knows exactly what he's doing.
* [Lovely arvo for it.] Lovely arvo for it. #liam
-
Don't. #xiao
* [Can't a man enjoy an arvo?] What? Can't a man enjoy an arvo? A bit of a sesh? #liam
    I'm leaving. #xiao
    ** [Fair dinkum.] Fair dinkum, mate. #liam
        He actually gets up. You both crack up before he's taken a step. #beat
-
-> DONE


=== shark_movie ===
That shark movie. First year. You screamed. #xiao
* [The shark jumped.] It jumped OUT of the water, mate. Onto a boat. Anyone would scream. #liam
    The lady next to us didn't. #xiao
    ** [She was asleep.] She was asleep! #liam
        She was eighty. #xiao
* [That was you.] That was you screaming. I remember it very differently. #liam
    I've never screamed in my life. #xiao
    He has. You were there. #beat
-
-> DONE


=== text_home ===
// Liam texts his family about once a trip (the var is saved with the trip, so it never fires twice).
{texted_home: -> DONE}
~ texted_home = true
Liam's phone buzzes on the arm of the chair. He glances at it. Then glances again. #beat
Mary. "Dad's had his tablets. Missy fell asleep in the laundry basket AGAIN. Have fun x" #beat
* [Show Xiao.] She's in the basket again. Look. Look at her. #liam
    Xiao looks. Properly. #beat
    She's got your chin. #xiao
    Poor kid. #liam
* [Quick reply.] Right. Just a quick one back. Sorry. Two secs. #liam
    Take your time. #xiao
    Liam types with both thumbs, deletes it, types it again. "Fine. Fish: none. Love you all." #beat
    That's a lot of words for "none." #xiao
    I'm a communicator. #liam
-
Liam puts the phone face-down on his knee. Then face-up. Then down again. #beat
Missing them already? #xiao
* [Obviously.] Yeah. Obviously. Ridiculous, isn't it. I've been gone about four hours. #liam
* [Not at all.] Nope. Not even a bit. Just checking they haven't burned the house down. #liam
    You're smiling. #xiao
    It's gas. #liam
-
-> DONE


=== smoke ===
// Xiao offers; Liam declines. Quit for his daughter, said plainly, no sermon. (told_cig gates the longer version.)
Xiao takes out a crushed packet and a lighter. Turns the lighter over in his fingers. #beat
Want one? #xiao
* [Nah, mate.] Nah, you're right. I mean— no, you're not right, I'm good. #liam
    Xiao shrugs and holds the lighter away from you out of habit. #beat
* [Go on, then. No.] Go on, then. …No. No, I'm not. Look at me, I'm sweating. #liam
* [I quit.] I quit. Couple of years back. #liam
-
{told_cig:
    Still quit? #xiao
    Still quit. #liam
    -> DONE
}
~ told_cig = true
Just like that? #xiao
* [For Missy.] Missy was about a month old. I stood out the back with one, thinking, I'm going to smell like this when I pick her up. #liam
    That was it. Done. Never wanted one after. Well. Wanted. Never had. #liam
    Good reason. #xiao
    Xiao doesn't light it. He moves his chair a bit upwind, quietly, and says nothing about it. #beat
* [Don't make it a thing.] Long story. Boring story. Don't let me stop you. #liam
    He doesn't light it either. He puts the packet back in his pocket. #beat
-
-> DONE


=== me_time ===
// Liam loves fishing and rarely gets time that isn't for someone else. A small, quiet beat.
{quiet:
    Liam watches the float and doesn't say anything for a long minute. #beat
- else:
    Liam sits back and lets the line do the work for once. #beat
}
This is the longest I've sat down since, I dunno. Missy's christening? #liam
* [Say it out loud.] I'm not good at this, you know. Sitting. I keep thinking I should be fixing something. #liam
    What would you fix? #xiao
    The gutter. The tap. The… everything. #liam
    The lake's fine. #xiao
    The lake's fine. #liam
* [Just enjoy it.] Mate, this is good. This is really good. #liam
    Don't jinx it. #xiao
-
-> DONE
