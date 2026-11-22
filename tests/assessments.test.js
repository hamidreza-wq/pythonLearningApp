import test from "node:test";
import assert from "node:assert/strict";
import { gradeAssessment } from "../assessments.js";

const questions = [
  { id: "one", answer: 1, explanation: "Because one is correct.", topic: "Basics" },
  { id: "two", answer: 0, explanation: "Because zero is correct.", topic: "Values" }
];

test("assessment grading accepts numeric and radio-input answers", () => {
  assert.deepEqual(gradeAssessment(questions, { one: "1", two: 0 }, 70), {
    correct: 2,
    total: 2,
    percentage: 100,
    passed: true,
    passMark: 70,
    results: [
      { questionId: "one", topic: "Basics", selectedAnswer: 1, correct: true, explanation: "Because one is correct." },
      { questionId: "two", topic: "Values", selectedAnswer: 0, correct: true, explanation: "Because zero is correct." }
    ]
  });
});

test("missing and invalid answers are incorrect and score thresholds are accurate", () => {
  const result = gradeAssessment(questions, { one: "invalid" }, 50);
  assert.equal(result.correct, 0);
  assert.equal(result.percentage, 0);
  assert.equal(result.passed, false);
  assert.equal(result.results[0].correct, false);
  assert.equal(result.results[0].selectedAnswer, Number.NaN);
  assert.equal(gradeAssessment(questions, { one: 1 }, 50).percentage, 50);
});

test("invalid assessment definitions produce explicit errors", () => {
  assert.throws(() => gradeAssessment([], {}), /at least one question/);
  assert.throws(() => gradeAssessment(questions, {}, 101), /between 0 and 100/);
});
