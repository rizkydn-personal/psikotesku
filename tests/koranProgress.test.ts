import { test } from "node:test";
import assert from "node:assert/strict";
import {
  advanceKoran,
  createSession,
  koranProgress,
  scoreKoran,
} from "../lib/assessment";

test("50th response immediately moves columns, preserves final answer and starts a fresh timer", () => {
  let session = { ...createSession(), koranStartedAt: 1000 };
  for (let i = 0; i < 50; i++)
    session = advanceKoran(session, 11000, {
      column: 0,
      value: 0,
    }) as typeof session;
  assert.equal(session.koran[0].answers.length, 50);
  assert.equal(session.koran[0].elapsedMs, 10000);
  assert.equal(koranProgress(session).column, 1);
  assert.equal(koranProgress(session).deadline, 56000);
  assert.equal(advanceKoran(session, 11001, { column: 0, value: 9 }), session);
});
test("early finishes across all columns complete the stage and use actual duration", () => {
  let session = { ...createSession(), koranStartedAt: 1000 };
  for (let column = 0; column < 4; column++)
    for (let i = 0; i < 50; i++)
      session = advanceKoran(session, 11000 + column * 10000, {
        column,
        value: 0,
      }) as typeof session;
  assert.equal(koranProgress(session).column, 4);
  const score = scoreKoran(session.koran);
  assert.equal(score.durationSeconds, 40);
  assert.equal(score.attempted, 200);
  assert.equal(score.perMinute, 300);
});
test("expired deadline rejects stale input and delayed timers catch up", () => {
  const session = { ...createSession(), koranStartedAt: 1000 };
  const next = advanceKoran(session, 46000, { column: 0, value: 1 });
  assert.equal(koranProgress(next).column, 1);
  assert.equal(next.koran[0].answers.length, 0);
  assert.equal(next.koran[1].answers.length, 0);
  assert.equal(koranProgress(advanceKoran(next, 181000)).column, 4);
});
