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
    bite: ["Hey, I think you've got a fish.", "You've got a bite.", 'Your float just went under.'],
    miss: ['Ah. It got away.', "Too slow. There'll be another.", 'Gone. They always are.'],
    tooEarly: ['Too early. You spooked it.', 'Patience. They like patience.'],
    friendFish: ['Oh, got one. Just a little thing.', 'Nibble. Nothing yet.', 'Hm. Something is down there.'],
    small: ["Ha. That one's tiny.", 'Cute. Throw it back?'], normal: ['Nice one.', 'Not bad at all.'], big: ['Whoa. Look at the size of that.', "Okay. That's a keeper."],
    nick: ['"{n}". Suits it.', 'Welcome to the family, {n}.'],
    idleFish: ['The water looks nice today.', 'I forgot how quiet it is out here.', 'Do the fish judge us? I think they judge us.', 'My neck has not hurt in two days. A record.'],
    idleChess: ['You used to play fast. I am glad you slowed down.', 'The board looks good on that stump.', 'I like this opening. I think.'],
    idleAny: ['Mm.', 'The light is nice.', 'I should come out here more.'],
    invite: ['Can I ask you something?', 'Do you want to talk, or just fish?'],
    quitLow: ["It's been nice catching up with you, {you}...", "Right. Thanks for coming, {you}."],
    quitMid: ["It's been nice catching up with you, {you}. Really.", "Thanks for this, {you}. I mean it."],
    quitHigh: ["It's been nice catching up with you, {you}. Let's not leave it ten years.", "Same time next year? Sooner. Sooner, {you}."],
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
    bite: ["Oi! I think you've got a bite!", 'Your float just went under!', "Something's pulling on your line!"],
    miss: ["Ah, it got away. They're like that.", 'Too slow. Happens to the best of us.', 'It spat the hook. Cheeky little thing.'],
    tooEarly: ['Too early! You scared it.', 'Easy. Let it think it is winning.'],
    friendFish: ['Got one! Nope. Weed.', 'Something is nibbling. Possibly my dignity.', 'Ooh. A nibble.'],
    small: ["Ha! That one's a baby.", 'Aww. Throw it back?'], normal: ['Nice one, mate.', 'Look at that. Dinner.'], big: ["Whoa! That's a unit!", 'Get in! That one has seen things.'],
    nick: ['"{n}"! Perfect.', 'Welcome to the family, {n}.'],
    idleFish: ['Best seat in the house.', 'This is the closest I have been to quiet in about ten years.', 'Do you reckon they can hear us? The fish. I reckon they can hear us.', 'I could do this every weekend. Do not tell Mary.'],
    idleChess: ['You have got that look. The scheming look.', 'I used to be good at this. I was fitter then.', 'Great stump. Whoever found this stump deserves a medal.'],
    idleAny: ['Mm. Good air out here.', 'I am so full of cereal facts. Ask me anything.', 'Cold one later?'],
    invite: ['Can I tell you something?', 'Fancy a chat, or just a quiet one?'],
    quitLow: ["It's been nice catching up with you, {you}...", 'Right. See you around, {you}.'],
    quitMid: ["It's been nice catching up with you, {you}. Properly nice.", 'Good to see you, {you}. Come back soon.'],
    quitHigh: ["It's been nice catching up with you, {you}. Do not be a stranger. I mean it.", "Ring me. Soon. I'm serious, {you}."],
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
