const fs = require('fs');

const html = fs.readFileSync('Sea_Turtle_Bot', 'utf8');
let script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
script = script.replace(
  '  function getAnswer(question) {',
  '  function getAnswerWithEntry(question) {'
);
script = script.replace(
  '    if (isEngGreeting) return { answer: GREETING_RESPONSE, tag: null };',
  '    if (isEngGreeting) return { answer: GREETING_RESPONSE, tag: null, id: null };'
);
script = script.replace(
  '      if (q.indexOf(REDIRECT_KEYWORDS[i]) !== -1) return { answer: REDIRECT_RESPONSE, tag: null };',
  '      if (q.indexOf(REDIRECT_KEYWORDS[i]) !== -1) return { answer: REDIRECT_RESPONSE, tag: null, id: null };'
);
script = script.replace(
  '    if (!queryTokens.length) return { answer: FALLBACK, tag: null };',
  '    if (!queryTokens.length) return { answer: FALLBACK, tag: null, id: null };'
);
script = script.replace(
  '    if (intentResult) return intentResult;',
  '    if (intentResult) return intentResult;'
);
script = script.replace(
  '      if (exactEntry) return { answer: exactEntry.answer, tag: exactEntry.category };',
  '      if (exactEntry) return { answer: exactEntry.answer, tag: exactEntry.category, id: exactEntry.id };'
);
script = script.replace(
  '      return { answer: bestEntry.answer, tag: bestEntry.category };',
  '      return { answer: bestEntry.answer, tag: bestEntry.category, id: bestEntry.id };'
);
script = script.replace(
  '    if (bestEntry && bestScore >= 3.2) return { answer: LOW_CONFIDENCE_RESPONSE, tag: null };',
  '    if (bestEntry && bestScore >= 3.2) return { answer: LOW_CONFIDENCE_RESPONSE, tag: null, id: null };'
);
script = script.replace(
  '    return { answer: FALLBACK, tag: null };',
  '    return { answer: FALLBACK, tag: null, id: null };'
);
script = script.replace(
  '  function handleQuestion(question) {',
  '  globalThis.__getAnswerWithEntry = getAnswerWithEntry;\n  function getAnswer(question) { var result = getAnswerWithEntry(question); return { answer: result.answer, tag: result.tag }; }\n  function handleQuestion(question) {'
);
script = script.replace(
  '    return entry ? { answer: entry.answer, tag: entry.category } : null;',
  '    return entry ? { answer: entry.answer, tag: entry.category, id: entry.id } : null;'
);

const element = () => ({
  classList: { add() {}, remove() {} },
  addEventListener() {},
  focus() {},
  style: {},
  insertBefore() {},
  appendChild() {},
  value: '',
  disabled: false,
  textContent: '',
  innerHTML: '',
  scrollTop: 0,
  scrollHeight: 0
});

global.document = { getElementById: element, createElement: element, querySelector: element };
global.window = global;
new Function(script)();

const tests = JSON.parse(fs.readFileSync('test_questions.json', 'utf8'));
let failed = 0;

for (const test of tests) {
  const result = global.__getAnswerWithEntry(test.question);
  if (result.id !== test.expectedId) {
    failed++;
    console.error(`FAIL: ${test.question}`);
    console.error(`  expected: ${test.expectedId}`);
    console.error(`  actual:   ${result.id || 'NO_MATCH'}`);
  }
}

if (failed) {
  console.error(`\n${failed}/${tests.length} regression tests failed.`);
  process.exit(1);
}

console.log(`${tests.length} regression tests passed.`);
