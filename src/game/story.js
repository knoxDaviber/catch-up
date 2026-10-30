import { Compiler, Story } from '../../vendor/ink-full.module.js';

/** One side's conversation (pov = the character you play), compiled from story/<pov>.ink in the browser.
 *  A trip can be saved (save/load the ink state) and resumed; ink being edited may lack a knot, so has() guards every call. */
export async function loadStory(pov) {
  const get = async f => { const r = await fetch('story/' + f); if (!r.ok) throw new Error(f + ' ' + r.status); return r.text(); };
  let src = await get(pov + '.ink');
  // INCLUDEd files go at the end, so the main file's top-level content still runs first
  const incs = [...src.matchAll(/^INCLUDE\s+(\S+)\s*$/gm)].map(m => m[1]);
  src = src.replace(/^INCLUDE\s+\S+\s*$/gm, '');
  for (const f of incs) src += '\n' + await get(f);
  const compiler = new Compiler(src), compiled = compiler.Compile();
  if (!compiled) throw new Error(pov + '.ink: ' + compiler.errors.join('\n'));
  compiler.warnings.forEach(w => console.warn(pov + '.ink', w));
  const json = compiled.ToJson();
  let s = new Story(json);

  const has = name => { try { return !!s.KnotContainerWithName(name); } catch (e) { return false; } };
  return {
    reset() { s = new Story(json); },
    has,
    save: () => s.state.ToJson(),
    load(j) { s.state.LoadJson(j); },
    set(name, v) { try { if (s.variablesState.$(name) != null) s.variablesState.$(name, v); } catch (e) { /* not declared in this story */ } },
    get: name => s.variablesState.$(name),
    call: fn => { if (!has(fn)) return undefined; try { return s.EvaluateFunction(fn); } catch (e) { console.warn('ink', fn, e); return undefined; } },
    start(path) { s.ChoosePathString(path); },
    /** The next line, or null when the passage is waiting on a choice or has finished. Blank lines are skipped. */
    next() {
      while (s.canContinue) {
        const text = s.Continue().trim();
        if (text) return { text, tags: (s.currentTags || []).map(t => t.trim()) };
      }
      return null;
    },
    choices: () => s.currentChoices.map(c => c.text),
    choiceTags: () => s.currentChoices.map(c => (c.tags || []).map(t => t.trim())),
    choose(i) { s.ChooseChoiceIndex(i); },
  };
}
