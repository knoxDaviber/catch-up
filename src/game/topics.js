/* Conversation topics. Both friends have a few things they will talk about; good answers raise a hidden warmth
   score and unlock deeper topics, poor ones unlock fewer. Nothing is explained outright: the backstory is only hinted.
   Node fields: f = friend says, m = you say, c = your choices [{t, w, to, set}], to = next node, end = finish topic,
   w = warmth change, set = a flag to remember.
   `ask` is keyed by the FRIEND you are talking to. Edit freely; this file is just writing. */
const T = (id, label, order, req, nodes) => ({ id, label, order, req: req || {}, nodes });

export const TOPICS = {
  // You are Liam, talking to Xiao.
  xiao: [
    T('x_work', 'Ask about his work', 1, null, {
      a: { f: "Work's fine. Busy. We landed a library extension last month, which sounds more exciting than it is.", c: [
        { t: 'A library! You always did draw the best buildings.', w: 1, to: 'b' },
        { t: 'Still living at the office, then?', w: 0, to: 'c' },
        { t: 'Sounds dull, honestly.', w: -1, to: 'd' }] },
      b: { f: 'You remember that? I once drew a lighthouse in the margin of your maths homework.', end: true, w: 1, set: 'lighthouse' },
      c: { f: 'Mostly. The chairs are better than at home.', end: true, w: 0, set: 'home_quiet' },
      d: { f: "It is. That's rather the point of it.", end: true, w: -1 },
    }),
    T('x_fish', 'Talk about fishing', 1, null, {
      a: { f: "I have not fished since... I cannot think when. My father used to take me. We mostly sat there.", c: [
        { t: 'Mostly sitting is the best part.', w: 1, to: 'b' },
        { t: "You're holding the rod wrong, you know.", w: 0, to: 'c' }] },
      b: { f: 'Mm. I think I had forgotten that.', end: true, w: 1 },
      c: { f: 'Of course I am.', end: true, w: 0 },
    }),
    T('x_kid', 'Tell him about your daughter', 1, null, {
      a: { m: "She's ten now. Last week she told me I'm 'embarrassing but acceptable'." },
      b: { f: 'That sounds like high praise. Is it?', c: [
        { t: "From her, it's a medal.", w: 1, to: 'c' },
        { t: 'Honestly? I live for it.', w: 1, to: 'c' }] },
      c: { f: 'You sound happy.', to: 'd' },
      d: { f: 'I mean that.', end: true, w: 1 },
    }),
    T('x_cabin', 'Mention the cabin weekend', 2, { warmth: 1 }, {
      a: { m: "You know this is the cabin weekend we never had." },
      b: { f: 'I know. I thought of it when I booked the trip.', c: [
        { t: 'Ten years late.', w: 1, to: 'c' },
        { t: 'Better late than never.', w: 1, to: 'c' },
        { t: '...', w: 0, to: 'd' }] },
      c: { f: "Ten years. I counted, actually. Don't tell anyone I counted.", end: true, w: 2, set: 'xiao_counted' },
      d: { f: "That's alright. Take your time.", end: true, w: 1 },
    }),
    T('x_home', 'Ask about home', 2, { anyFlag: ['home_quiet'], warmth: 2 }, {
      a: { m: 'And home? Are you getting any peace there?' },
      b: { f: 'There is a flat. It has a very good kitchen that nobody uses.', c: [
        { t: 'You could cook for us out here.', w: 1, to: 'c' },
        { t: "You don't have to talk about it.", w: 1, to: 'd' }] },
      c: { f: 'I can make exactly one thing. Do not get excited.', end: true, w: 1 },
      d: { f: 'Not yet. Ask me again later.', end: true, w: 1, set: 'ask_again' },
    }),
    T('x_reach', 'Ask why he got in touch', 3, { warmth: 3, done: ['x_cabin'] }, {
      a: { m: 'Why now, Xiao? After all this time?' },
      b: { f: 'I was going through my phone. There was a message I sent you, years ago. It just sits there. Nothing under it.', c: [
        { t: "I'm sorry. I should have answered.", w: 2, to: 'c', set: 'liam_sorry' },
        { t: 'I read it. I meant to answer.', w: 1, to: 'd' },
        { t: 'Maybe the phone lost it.', w: -1, to: 'e' }] },
      c: { f: "Thank you. I did not realise I needed you to say that.", end: true, w: 3 },
      d: { f: "That's something, I suppose.", end: true, w: 1 },
      e: { f: 'Maybe.', end: true, w: -1 },
    }),
  ],

  // You are Xiao, talking to Liam.
  liam: [
    T('l_family', 'Ask about Mary and his girl', 1, null, {
      a: { m: 'How is Mary? And your girl?' },
      b: { f: "Mary's a saint. My girl calls me 'embarrassing but acceptable', which is the best review I've ever had.", c: [
        { t: "I'd give that five stars.", w: 1, to: 'c' },
        { t: "You've earned it.", w: 1, to: 'c' }] },
      c: { f: "You'd love her. She's got your... what's the word... stubborn face.", end: true, w: 2, set: 'liam_family' },
    }),
    T('l_work', 'Ask about the supermarket', 1, null, {
      a: { f: "Managing the supermarket. Three hundred kinds of cereal and I'm the one who answers for all of them.", c: [
        { t: 'And the bouncing?', w: 1, to: 'b' },
        { t: 'Sounds tiring.', w: 0, to: 'c' }] },
      b: { f: "Weekends, for the extra cash. Mostly I stand there looking large. Which, ahem, I'm well qualified for.", end: true, w: 1, set: 'liam_belly' },
      c: { f: "Tired is good. Tired means I'm not thinking.", end: true, w: 0 },
    }),
    T('l_fish', 'Ask if he ever catches anything', 1, null, {
      a: { m: 'Do you ever actually catch anything out here?' },
      b: { f: 'Only the occasional cold. I come for the sitting.', c: [
        { t: 'Fair enough.', w: 1, to: 'c' },
        { t: 'Then we are both frauds.', w: 1, to: 'c' }] },
      c: { f: 'Ha. Good. Frauds together.', end: true, w: 1 },
    }),
    T('l_belly', 'Tease him about his belly', 2, { anyFlag: ['liam_belly'] }, {
      a: { m: "You've gone soft, you know." },
      b: { f: "Soft! This is structural. It's load-bearing.", c: [
        { t: 'An architect would approve.', w: 1, to: 'c' }] },
      c: { f: "Ha! There he is. There's the Xiao I remember.", end: true, w: 2, set: 'liam_there_he_is' },
    }),
    T('l_cabin', 'Mention the cabin weekend', 2, { warmth: 1 }, {
      a: { m: 'You never did book that cabin.' },
      b: { f: "Don't. I've thought about that for ten years.", c: [
        { t: 'Neither did I.', w: 1, to: 'c' },
        { t: 'Well, here we are.', w: 2, to: 'd' }] },
      c: { f: 'We were a pair of idiots.', end: true, w: 1 },
      d: { f: "Here we are. (a long pause) I'm really glad you rang, Xiao.", end: true, w: 3, set: 'liam_glad' },
    }),
    T('l_quiet', 'Bring up the message he never answered', 3, { warmth: 3, done: ['l_cabin'] }, {
      a: { m: 'I wrote to you once. You never answered.' },
      b: { f: 'I know.', c: [
        { t: "I'm not angry.", w: 2, to: 'c' },
        { t: 'It was a hard night.', w: 1, to: 'd' }] },
      c: { f: "You should be. I'd be. I was tired, then I was ashamed, then it was a year.", end: true, w: 3 },
      d: { f: 'Tell me about it one day. Properly.', end: true, w: 2, set: 'liam_will_listen' },
    }),
    T('l_divorce', 'Tell him you are not married any more', 4, { anyFlag: ['liam_glad', 'liam_will_listen'], warmth: 5 }, {
      a: { m: "I'm not married any more, Liam." },
      b: { f: 'Ah. Xiao.', c: [
        { t: 'It was fair. She was right.', w: 1, to: 'c' },
        { t: "I'd rather not.", w: 0, to: 'd' }] },
      c: { f: "Nobody's right all the way down. Her neither.", end: true, w: 2 },
      d: { f: "Fine. Chess, then. You're still on the back foot.", end: true, w: 1 },
    }),
  ],
};
