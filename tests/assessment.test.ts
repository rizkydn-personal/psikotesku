import { test } from "node:test";
import assert from "node:assert/strict";
import {
  abilityQuestions,
  personalityQuestions,
  rotate,
  mirror,
  spatialQuestions,
  stages,
  type Ability,
} from "../data/psychotestQuestions";
import {
  appendKoranAnswer,
  createSession,
  finishAssessment,
  koranColumnAt,
  scoreAbility,
  scoreKoran,
  secondsRemaining,
} from "../lib/assessment";

function completedSession() {
  const session = createSession();
  for (const q of abilityQuestions) session.answers[q.id] = q.correctId;
  for (const q of personalityQuestions)
    session.personality[q.id] = q.reverse ? 1 : 5;
  for (const stage of stages)
    session.timings[stage.id] = {
      seconds: stage.seconds || 180,
      timedOut: stage.seconds > 0,
    };
  return session;
}
test("bank has 42 objective items and unambiguous unique choices", () => {
  assert.equal(abilityQuestions.length, 42);
  assert.equal(new Set(abilityQuestions.map((q) => q.id)).size, 42);
  for (const q of abilityQuestions) {
    assert.equal(q.options.filter((o) => o.id === q.correctId).length, 1, q.id);
    assert.equal(
      new Set(q.options.map((o) => JSON.stringify(o.cells ?? o.label))).size,
      4,
      `Duplicate alternatives: ${q.id}`,
    );
    assert.ok(q.explanation.length > 15);
  }
});
test("spatial transformations use correct coordinates", () => {
  const one = [1, 0, 0, 0, 0, 0, 0, 0, 0];
  assert.deepEqual(rotate(one), [0, 0, 1, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(mirror(one), [0, 0, 1, 0, 0, 0, 0, 0, 0]);
  for (const q of spatialQuestions) {
    const first = q.figures![0];
    assert.deepEqual(rotate(rotate(rotate(rotate(first)))), first);
    assert.deepEqual(mirror(mirror(first)), first);
    const expected =
      q.skill === "Rotasi"
        ? rotate(first)
        : q.skill === "Pencerminan"
          ? mirror(first)
          : rotate(rotate(rotate(first)));
    assert.deepEqual(
      q.options.find((o) => o.id === q.correctId)?.cells,
      expected,
    );
  }
});
test("randomization preserves scoring identities and never crosses sections", () => {
  const original = JSON.stringify(abilityQuestions);
  const session = createSession();
  for (const domain of ["verbal", "numeric", "spatial"] as Ability[]) {
    assert.equal(
      session.questions[domain].length,
      domain === "spatial" ? 12 : 15,
    );
    assert.ok(session.questions[domain].every((q) => q.domain === domain));
    assert.deepEqual(
      session.questions[domain].map((q) => q.id).sort(),
      abilityQuestions
        .filter((q) => q.domain === domain)
        .map((q) => q.id)
        .sort(),
    );
  }
  assert.equal(JSON.stringify(abilityQuestions), original);
  assert.equal(new Set(session.personalityOrder).size, 25);
});
test("ability score treats wrong, blank and correct separately", () => {
  const questions = abilityQuestions.filter((q) => q.domain === "verbal");
  const answers = {
    [questions[0].id]: questions[0].correctId,
    [questions[1].id]: questions[1].options.find(
      (o) => o.id !== questions[1].correctId,
    )!.id,
  };
  const score = scoreAbility("verbal", answers, {
    seconds: 420,
    timedOut: true,
  });
  assert.equal(score.correct, 1);
  assert.equal(score.wrong, 1);
  assert.equal(score.omitted, 13);
  assert.equal(score.accuracy, 50);
  assert.equal(score.percent, 7);
  assert.equal(
    scoreAbility("verbal", {}, { seconds: 420, timedOut: true }).accuracy,
    null,
  );
  assert.throws(() =>
    scoreAbility("verbal", { v01: "fake" }, { seconds: 10, timedOut: false }),
  );
});
test("reverse keyed personality and complete objective scoring", () => {
  const session = completedSession();
  const result = finishAssessment(session, "owner");
  assert.equal(result.ownerId, "owner");
  assert.equal(result.version, 2);
  assert.ok(Object.values(result.personality).every((v) => v === 5));
  assert.ok(Object.values(result.abilities).every((s) => s.percent === 100));
  for (const q of personalityQuestions)
    session.personality[q.id] = q.reverse ? 5 : 1;
  assert.ok(
    Object.values(finishAssessment(session, null).personality).every(
      (v) => v === 1,
    ),
  );
  for (const q of personalityQuestions) session.personality[q.id] = 3;
  assert.ok(
    Object.values(finishAssessment(session, null).personality).every(
      (v) => v === 3,
    ),
  );
  assert.ok(
    finishAssessment(session, null).quality.some((s) =>
      s.includes("respons yang sama"),
    ),
  );
});
test("all stages and all personality answers required", () => {
  assert.throws(() => finishAssessment(createSession(), null));
  const session = completedSession();
  delete session.personality.p1;
  assert.throws(() => finishAssessment(session, null));
  session.personality.p1 = 6;
  assert.throws(() => finishAssessment(session, null));
});
test("koran scores overlapping pairs and excludes skips from accuracy", () => {
  const score = scoreKoran([
    { digits: [8, 7, 6, 9], answers: [5, 4, null] },
    ...Array.from({ length: 3 }, () => ({ digits: [1, 2], answers: [] })),
  ]);
  assert.equal(score.correct, 1);
  assert.equal(score.wrong, 1);
  assert.equal(score.skipped, 1);
  assert.equal(score.accuracy, 50);
  assert.equal(score.attempted, 2);
  assert.equal(score.perMinute, 0.7);
  assert.equal(score.spread, 2);
  const empty = scoreKoran(createSession().koran);
  assert.equal(empty.accuracy, null);
  assert.equal(empty.perMinute, 0);
});
test("koran accepts one digit, does not mutate, enforces column bounds", () => {
  const session = createSession();
  const updated = appendKoranAnswer(session, 0, 9);
  assert.equal(session.koran[0].answers.length, 0);
  assert.deepEqual(updated.koran[0].answers, [9]);
  assert.equal(appendKoranAnswer(session, 4, 5), session);
  assert.equal(appendKoranAnswer(session, 0, 10), session);
  assert.deepEqual(appendKoranAnswer(updated, 0, null).koran[0].answers, [
    9,
    null,
  ]);
});
test("wall-clock timers catch delayed ticks and column boundaries", () => {
  assert.equal(secondsRemaining(10000, 9001), 1);
  assert.equal(secondsRemaining(10000, 12000), 0);
  assert.equal(koranColumnAt(1000, 45999), 0);
  assert.equal(koranColumnAt(1000, 46000), 1);
  assert.equal(koranColumnAt(1000, 140000), 3);
  assert.equal(koranColumnAt(1000, 190000), 4);
});
test("projective writing cannot affect scored domains", () => {
  const session = completedSession();
  const before = finishAssessment(session, null);
  session.projective.story = "Cerita pribadi ".repeat(200);
  const after = finishAssessment(session, null);
  assert.deepEqual(before.abilities, after.abilities);
  assert.deepEqual(before.personality, after.personality);
  assert.equal(after.projective.story.length, 1500);
});
