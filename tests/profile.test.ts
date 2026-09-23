import { test } from "node:test";
import assert from "node:assert/strict";
import { historyError, normalizeDisplayName } from "../lib/firebaseErrors";

test("profile accepts international names and normalizes whitespace", () => {
  assert.equal(normalizeDisplayName("  Siti   Nur  "), "Siti Nur");
  assert.equal(normalizeDisplayName("李明"), "李明");
  assert.equal(normalizeDisplayName("Jose\u0301"), "José");
  assert.throws(() => normalizeDisplayName("   "));
  assert.throws(() => normalizeDisplayName("a".repeat(61)));
  assert.throws(() => normalizeDisplayName("\u200b"));
});

test("history distinguishes access, session and network failures", () => {
  assert.equal(
    historyError({ code: "firestore/permission-denied" }).code,
    "permission-denied",
  );
  assert.match(historyError({ code: "permission-denied" }).message, /ditolak/);
  assert.match(historyError({ code: "unauthenticated" }).message, /Sesi login/);
  assert.match(historyError({ code: "unavailable" }).message, /koneksi/);
  assert.equal(historyError(null).code, "unknown");
  assert.doesNotMatch(
    historyError(new Error("private internal details")).message,
    /private/,
  );
});
