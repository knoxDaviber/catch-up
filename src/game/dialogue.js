import { TOPICS } from './topics.js';

const KEY = 'catchup.story.v1';
/** Hidden warmth score, remembered flags and finished topics. Saved in the browser so the story can carry on. */
export function createDialogue() {
  const D = { warmth: 0, flags: new Set(), done: new Set(), active: null };
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) { D.warmth = s.warmth || 0; D.flags = new Set(s.flags || []); D.done = new Set(s.done || []); } } catch (e) { /* storage is optional */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ warmth: D.warmth, flags: [...D.flags], done: [...D.done] })); } catch (e) { /* ignore */ } };
  const open = t => {
    const r = t.req;
    if (r.warmth !== undefined && D.warmth < r.warmth) return false;
    if (r.done && !r.done.every(d => D.done.has(d))) return false;
    if (r.anyFlag && !r.anyFlag.some(f => D.flags.has(f))) return false;
    return true;
  };
  /** Up to three topics you can raise with this friend ('xiao' or 'liam'), simplest first. */
  D.available = friendKey => TOPICS[friendKey].filter(t => !D.done.has(t.id) && open(t)).sort((a, b) => a.order - b.order).slice(0, 3);
  D.any = friendKey => D.available(friendKey).length > 0;
  D.tier = () => (D.warmth >= 9 ? 'High' : D.warmth >= 4 ? 'Mid' : 'Low');
  D.reset = () => { D.warmth = 0; D.flags.clear(); D.done.clear(); save(); };

  /** Runs a topic. ui.show({ who: 'friend'|'me', text, choices: [text] | null }, next(choiceIndex)) ; ui.close() at the end. */
  D.run = (friendKey, topicId, ui) => {
    const topic = TOPICS[friendKey].find(t => t.id === topicId); if (!topic) return;
    D.active = topic;
    const finish = () => { D.done.add(topic.id); D.active = null; save(); ui.close(); };
    const go = id => {
      const n = topic.nodes[id]; if (!n) return finish();
      if (n.w) D.warmth += n.w;
      if (n.set) D.flags.add(n.set);
      const who = n.m !== undefined ? 'me' : 'friend', text = n.m !== undefined ? n.m : n.f;
      ui.show({ who, text, choices: n.c ? n.c.map(c => c.t) : null }, i => {
        if (n.c) { const c = n.c[i]; D.warmth += c.w || 0; if (c.set) D.flags.add(c.set); save(); go(c.to); }
        else if (n.end) finish();
        else go(n.to || nextKey(id));
      });
    };
    const nextKey = id => String.fromCharCode(id.charCodeAt(0) + 1);
    go('a');
  };
  return D;
}
