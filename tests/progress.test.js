import test from "node:test";
import assert from "node:assert/strict";
import { createInitialProgress, importProgress, readProgress, writeProgress } from "../progress.js";

function createStorage(initial = null, legacy = null) {
  return {
    getItem(key) {
      if (key === "python-path-progress-v1") return legacy;
      return initial;
    },
    setItem(_key, next) { initial = next; }
  };
}

test("local progress begins empty and preserves all learning data", () => {
  const storage = createStorage();
  assert.deepEqual(readProgress(storage), createInitialProgress());
  const progress = {
    ...createInitialProgress(),
    completedLessons: ["hello"],
    examAttempts: [{ score: 80, passed: true }],
    notes: { personal: "Review lists." },
    bookmarks: ["variables"],
    snippets: [{ id: "1", code: "print(1)" }],
    xp: 45
  };
  writeProgress(progress, storage);
  assert.deepEqual(readProgress(storage), progress);
});

test("invalid saved progress is reported rather than silently accepted", () => {
  assert.throws(() => readProgress(createStorage("{broken")), /could not be read/);
  assert.throws(() => readProgress(createStorage('{"completedLessons":"hello"}')), /invalid format/);
  assert.throws(() => readProgress(createStorage('{"completedLessons":[],"xp":-1}')), /invalid format/);
});

test("prior local progress migrates to the new academy without dropping work", () => {
  const storage = createStorage(null, '{"completedLessons":["first-steps","variables"],"examScore":5}');
  const progress = readProgress(storage);
  assert.deepEqual(progress.completedLessons, ["hello", "variables"]);
  assert.equal(progress.examAttempts[0].score, 83);
  assert.equal(progress.examAttempts[0].passed, true);
});

test("legacy progress is migrated without losing the previous exam score", () => {
  const progress = readProgress(createStorage('{"completedLessons":["first-steps"],"examScore":5}'));
  assert.deepEqual(progress.completedLessons, ["first-steps"]);
  assert.equal(progress.examAttempts[0].score, 83);
  assert.equal(progress.examAttempts[0].legacy, true);
  assert.equal("examScore" in progress, false);
});

test("backup import validates the data shape before replacing local state", () => {
  const storage = createStorage();
  const backup = { ...createInitialProgress(), completedLessons: ["hello"], xp: 20 };
  assert.deepEqual(importProgress(JSON.stringify(backup), storage), backup);
  assert.deepEqual(readProgress(storage), backup);
  assert.throws(() => importProgress("{bad json", storage), /not valid JSON/);
  assert.throws(() => importProgress('{"completedLessons":4}', storage), /invalid format/);
});
