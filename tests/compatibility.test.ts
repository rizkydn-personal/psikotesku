import { test } from "node:test";
import assert from "node:assert/strict";
import { createResultId } from "../lib/resultId";
import {
  createSession,
  appendKoranAnswer,
  scoreKoran,
} from "../lib/assessment";

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
test("ID generation supports native, getRandomValues-only and legacy browsers", () => {
  assert.equal(
    createResultId({ randomUUID: () => "native-id" } as unknown as Crypto),
    "native-id",
  );
  let called = false;
  const source = {
    getRandomValues(bytes: Uint8Array) {
      called = true;
      bytes.fill(255);
      return bytes;
    },
  } as unknown as Crypto;
  assert.match(createResultId(source), uuid);
  assert.ok(called);
  const ids = Array.from({ length: 1000 }, () => createResultId({} as Crypto));
  assert.ok(ids.every((id) => uuid.test(id)));
  assert.equal(new Set(ids).size, ids.length);
});
test("koran caps each column at 50 responses including skips, total 200", () => {
  let session = createSession();
  assert.equal(session.koran.length, 4);
  assert.ok(session.koran.every((c) => c.digits.length === 51));
  for (let col = 0; col < 4; col++) {
    for (let i = 0; i < 50; i++)
      session = appendKoranAnswer(session, col, i % 2 ? null : 0);
    assert.equal(appendKoranAnswer(session, col, 1), session);
    assert.equal(appendKoranAnswer(session, col, null), session);
  }
  const score = scoreKoran(session.koran);
  assert.equal(score.totalPairs, 200);
  assert.equal(score.unanswered, 0);
  assert.equal(score.attempted + score.skipped, 200);
  assert.equal(scoreKoran(createSession().koran).unanswered, 200);
});
