/* Short reactive lines ("barks"), per speaker and event. Each speaker talks the way their character does.
   Xiao: dry, precise, self-deprecating, says less than he feels. Liam: warm, jokey, rambles, big-hearted.
   {you} = the player's name, {n} = a fish's nickname. Edit freely; this file is just writing. */
export const LINES = {
  xiao: {
    yourMove: ['Your move.', 'Whenever you are ready.', 'Go on, then.'],
    youFirst: ['You go first.', 'Ladies and gentlemen: white pieces. Yours.'],
    takeTime: ['Take your time.', 'No rush. The fish certainly are not.'],
    thinkLong: ['I can wait. I am good at waiting.', 'Still thinking? Good. Think properly.', 'Take all the time you like.'],
    swapYes: ['Sure. Why not.', 'If it makes you happy. New board.', 'Fine. I will take the other side.'],
    swapNo: ["No, I'm comfortable here.", 'Maybe next game.'],
    swapAsk: ['Would you mind swapping sides this time?', 'Shall we swap sides? Fresh perspective.'],
    swapDone: ['Alright, swapping.', 'Fresh board, then.'],
    again: ['Another game?', 'Again? I am warming up.'],
    youCapture: ['You took my {piece}. Noted.', 'Hm. That {piece} was important to me.', 'Bold.'],
    iCapture: ['Sorry about the {piece}.', 'I will take that.', 'That was your {piece}, I believe.'],
    check: ['Check.'], youCheck: ['Ooh, check.', 'I saw that coming. Eventually.'],
    iMate: ['Checkmate. Good game.'], youMate: ['Well played. That is checkmate.'], draw: ['A draw. Fair enough.'],
    fightStart: ['Up for a challenge, huh?', 'That one is pulling. Hold on.', 'Steady. Do not let it get ahead of you.'],
    fightWin: ['Nicely done.', 'There you go. Patience.', 'It gave up. You did not.'],
    fightLose: ['It got away. It earned it.', 'Ah. Next time.', 'Gone. Clever fish.'],
    bite: ["Hey, I think you've got a fish.", "You've got a bite.", 'Your float just went under.'],
    miss: ['Ah. It got away.', "Too slow. There'll be another.", 'Gone. They always are.'],
    tooEarly: ['Too early. You spooked it.', 'Patience. They like patience.'],
    friendFish: ['Oh, got one. Just a little thing.', 'Nibble. Nothing yet.', 'Hm. Something is down there.'],
    small: ["Ha. That one's tiny.", 'Cute. Throw it back?'], normal: ['Nice one.', 'Not bad at all.'], big: ['Whoa. Look at the size of that.', "Okay. That's a keeper."],
    nick: ['"{n}". Suits it.', 'Welcome to the family, {n}.'],
<<<<<<< HEAD
    release: ['Good. Let it grow.', 'Off you go.', 'Kind of you.'],
    challengeAsk: ["Want more of a challenge? They come in too easy.", "That was easy. Want them to fight back?"],
    challengeOn: ["Good. Keep it in the light.", "Right. Don't let them get ahead of you."],
    challengeKeep: ["Fair. It's a lake, not a gym.", "Mm. Easy's fine."],
    easyAsk: ["They're winning. Want to go easy for a bit?", "Third one gone. Want to take it easy?"],
    easyOn: ["Easy it is. No shame.", "Fine. Peace with the fish."],
    easyKeep: ["Stubborn. Good.", "Then hold on tighter."],
    idleFish: ['The water looks nice today.', 'I forgot how quiet it is out here.', 'Do the fish judge us? I think they judge us.', 'My neck has not hurt in two days. A record.'],
    idleChess: ['You used to play fast. I am glad you slowed down.', 'The board looks good on that stump.', 'I like this opening. I think.'],
    idleAny: ['Mm.', 'The light is nice.', 'I should come out here more.'],
    hint: ['What about this?', 'Hm. Maybe this one.', 'I would try this. But I would also lose, so.'],
    takeback: ['Go on, then.', 'Fine. I saw nothing.', 'Take it back. I have done worse.'],
    adaptUp: ["You've gotten better. Can't let you show me up now.", 'Alright. I might actually have to try.'],
    adaptDown: ["Want me to go easy? I won't tell anyone.", 'I can ease off a bit, if you like. Your call.'],
    adaptHard: ['Right. Gloves off.', 'Okay. No more charity.'],
    adaptEasy: ['Easy it is. Quietly.', 'Done. Nobody needs to know.'],
    adaptKeep: ['Fair enough. As we were.', 'Suit yourself.'],
    nibble: ['Something is looking at your float.', 'Your float. Just so you know.'],
    radioTip: ['There is a radio by your chair, if you want music. It mostly works.'],
    castRemind: ['Your line is still out of the water, by the way.', 'You know you have to cast, right? They will not climb up.'],
=======
    idleFish: ['The water looks nice today.', 'I forgot how quiet it is out here.', 'Do the fish judge us? I think they judge us.', 'My neck has not hurt in two days. A record.'],
    idleChess: ['You used to play fast. I am glad you slowed down.', 'The board looks good on that stump.', 'I like this opening. I think.'],
    idleAny: ['Mm.', 'The light is nice.', 'I should come out here more.'],
    invite: ['Can I ask you something?', 'Do you want to talk, or just fish?'],
    quitLow: ["It's been nice catching up with you, {you}...", "Right. Thanks for coming, {you}."],
    quitMid: ["It's been nice catching up with you, {you}. Really.", "Thanks for this, {you}. I mean it."],
    quitHigh: ["It's been nice catching up with you, {you}. Let's not leave it ten years.", "Same time next year? Sooner. Sooner, {you}."],
>>>>>>> origin/main
  },
  liam: {
    yourMove: ['Your move, mate.', 'Go on, tear me apart.', 'Whenever. I am not going anywhere.'],
    youFirst: ["You go first. Don't say I never give you anything.", 'White is yours. Try not to cry.'],
    takeTime: ['Take your time, I need the rest.', 'No rush. My knees prefer it.'],
    thinkLong: ["I'll just sit here and be a mountain.", 'You are thinking so loud I can hear it.', 'Take your time. I made a sandwich. I have all day.'],
    swapYes: ['Sure! Always wanted to see how the other half lives.', 'Go on then. New board.', 'Alright, alright. Swapping.'],
    swapNo: ["Nah, I like it here. It's lucky.", 'Next game, mate.'],
    swapAsk: ['Fancy swapping sides this time?', 'Want to swap? I am feeling reckless.'],
    swapDone: ['Swapping. Do not lose my pieces.', 'Fresh board.'],
    again: ['Another one?', 'Go again? I am only getting started.'],
    youCapture: ['Oh, you got my {piece}. Rude.', 'Not the {piece}! I loved that {piece}.', 'Ha. Okay, okay.'],
    iCapture: ['Sorry, mate. Your {piece} had it coming.', 'Mine now, the {piece}.', 'I will take that, thanks.'],
    check: ['Check!'], youCheck: ['Ooh. Check. Fair.', 'Alright, you got me sweating.'],
    iMate: ['Checkmate. Good game, mate.'], youMate: ['Ha! Well played. Checkmate.'], draw: ['A draw! Everybody wins. Nobody wins.'],
    fightStart: ['Ooh, a fighter! Up for a challenge, mate?', 'Hold on! It is pulling like my mother-in-law!', 'Steady, steady. Do not let it win.'],
    fightWin: ['Get in! Brilliant!', 'Look at you! Textbook.', 'It never stood a chance.'],
    fightLose: ['Ah, it got away. Clever little thing.', 'Gone! Respect to the fish.', 'It earned that one.'],
    bite: ["Oi! I think you've got a bite!", 'Your float just went under!', "Something's pulling on your line!"],
    miss: ["Ah, it got away. They're like that.", 'Too slow. Happens to the best of us.', 'It spat the hook. Cheeky little thing.'],
    tooEarly: ['Too early! You scared it.', 'Easy. Let it think it is winning.'],
    friendFish: ['Got one! Nope. Weed.', 'Something is nibbling. Possibly my dignity.', 'Ooh. A nibble.'],
    small: ["Ha! That one's a baby.", 'Aww. Throw it back?'], normal: ['Nice one, mate.', 'Look at that. Dinner.'], big: ["Whoa! That's a unit!", 'Get in! That one has seen things.'],
    nick: ['"{n}"! Perfect.', 'Welcome to the family, {n}.'],
<<<<<<< HEAD
    release: ['Aww, go on then, little mate.', 'Catch and release. Very noble.', "Off you pop. Tell your mates about us."],
    challengeAsk: ["Bit easy, that. Want more of a challenge, mate?", "Reckon you could handle a fighter? Want more of a challenge?"],
    challengeOn: ["That's the spirit! Keep it in the light.", "Get in. Now they'll fight back."],
    challengeKeep: ["Fair enough. We're here to relax.", "No worries. Lazy fishing's the best fishing."],
    easyAsk: ["They're giving you a hiding, mate. Want to go easy for a bit?", "Three gone. Want to take it easy?"],
    easyOn: ["No shame in that. Fish are cheats anyway.", "Easy does it. Very relaxing. Very wise."],
    easyKeep: ["Stubborn! Love it.", "Alright, alright. Hold on tighter."],
    idleFish: ['Best seat in the house.', 'This is the closest I have been to quiet in about ten years.', 'Do you reckon they can hear us? The fish. I reckon they can hear us.', 'I could do this every weekend. Do not tell Mary.'],
    idleChess: ['You have got that look. The scheming look.', 'I used to be good at this. I was fitter then.', 'Great stump. Whoever found this stump deserves a medal.'],
    idleAny: ['Mm. Good air out here.', 'I am so full of cereal facts. Ask me anything.', 'Cold one later?'],
    hint: ['What about this one, mate?', 'I reckon this. Do not quote me.', 'Try that. Trust me. Actually, do not trust me.'],
    takeback: ['Go on, have it back.', 'Ha. Yeah, I saw nothing.', 'Take it. We are not on the clock.'],
    adaptUp: ["You've gotten better. Can't have you showing me up.", 'Okay, okay. I might have to actually concentrate.'],
    adaptDown: ['Want me to take it easy? No shame in it.', 'I can ease up a bit, if you want. Up to you.'],
    adaptHard: ['Right. Game face on.', 'You asked for it, mate.'],
    adaptEasy: ['No worries. Gentle mode.', 'Easy does it. Our secret.'],
    adaptKeep: ['Fair enough.', 'All good. As you were.'],
    nibble: ['Oi, something is having a sniff at your float.', 'Your float is getting some attention.'],
    radioTip: ['Radio is by your chair if you want some tunes. Heaps better than my singing.'],
    castRemind: ['Your line is still out, mate. Fish will not jump in on their own.'],
=======
    idleFish: ['Best seat in the house.', 'This is the closest I have been to quiet in about ten years.', 'Do you reckon they can hear us? The fish. I reckon they can hear us.', 'I could do this every weekend. Do not tell Mary.'],
    idleChess: ['You have got that look. The scheming look.', 'I used to be good at this. I was fitter then.', 'Great stump. Whoever found this stump deserves a medal.'],
    idleAny: ['Mm. Good air out here.', 'I am so full of cereal facts. Ask me anything.', 'Cold one later?'],
    invite: ['Can I tell you something?', 'Fancy a chat, or just a quiet one?'],
    quitLow: ["It's been nice catching up with you, {you}...", 'Right. See you around, {you}.'],
    quitMid: ["It's been nice catching up with you, {you}. Properly nice.", 'Good to see you, {you}. Come back soon.'],
    quitHigh: ["It's been nice catching up with you, {you}. Do not be a stranger. I mean it.", "Ring me. Soon. I'm serious, {you}."],
>>>>>>> origin/main
  },
};

const lastIdx = {};
/** Pick a line for a speaker and event, avoiding an immediate repeat. */
export function line(speaker, key, vars = {}) {
  const pool = (LINES[speaker] && LINES[speaker][key]) || [''];
  let i = Math.floor(Math.random() * pool.length);
  const id = speaker + key;
  if (pool.length > 1 && i === lastIdx[id]) i = (i + 1) % pool.length;
  lastIdx[id] = i;
  return pool[i].replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));
}
