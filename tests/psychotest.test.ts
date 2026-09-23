import { test } from "node:test";
import assert from "node:assert/strict";
import { shuffle, prepareQuestions, calculateResult } from "../lib/psychotest";
import { tests } from "../data/legacyQuestions";
test("Fisher-Yates preserves input and produces an exact permutation", () => {
  const input = [1, 2, 3, 4];
  assert.deepEqual(
    shuffle(input, () => 0),
    [2, 3, 4, 1],
  );
  assert.deepEqual(input, [1, 2, 3, 4]);
  assert.deepEqual(shuffle([]), []);
});
test("question and option IDs survive randomization without mutation", () => {
  const original = JSON.stringify(tests);
  for (let i = 0; i < 20; i++) {
    const prepared = prepareQuestions(tests[0].questions);
    assert.equal(new Set(prepared.map((q) => q.id)).size, 12);
    for (const q of prepared)
      assert.deepEqual(q.options.map((o) => o.id).sort(), [
        "always",
        "often",
        "rarely",
        "sometimes",
      ]);
  }
  assert.equal(JSON.stringify(tests), original);
});
test("scores remain correct regardless of shuffled order", () => {
  for (const testBank of tests)
    for (const [option, expected] of [
      ["rarely", 0],
      ["sometimes", 33],
      ["often", 67],
      ["always", 100],
    ] as const) {
      const answers = Object.fromEntries(
        prepareQuestions(testBank.questions).map((q) => [q.id, option]),
      );
      const result = calculateResult(testBank.id, answers, null);
      assert.deepEqual(Object.values(result.scores), [
        expected,
        expected,
        expected,
      ]);
      assert.equal(result.ownerId, null);
    }
});
test("incomplete or invalid answers cannot yield a report", () => {
  assert.throws(() => calculateResult("kepribadian", {}, null));
  assert.throws(() => calculateResult("missing", {}, null));
  const answers = Object.fromEntries(
    tests[0].questions.map((q) => [q.id, "tampered"]),
  );
  assert.throws(() => calculateResult("kepribadian", answers, null));
});
