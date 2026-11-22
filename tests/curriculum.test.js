import test from "node:test";
import assert from "node:assert/strict";
import { ALL_LESSONS, GLOSSARY, PATHS, PROJECTS, QUESTIONS, REFERENCE, getLesson, getNextLesson } from "../academy.js";

test("academy has multiple learning paths from foundations to specializations", () => {
  assert.ok(PATHS.length >= 8);
  assert.ok(ALL_LESSONS.length >= 30);
  assert.ok(PATHS.some((path) => path.id === "web"));
  assert.ok(PATHS.some((path) => path.id === "data"));
  assert.ok(PATHS.some((path) => path.id === "automation"));
  assert.ok(PATHS.some((path) => path.id === "algorithms"));
  assert.ok(PATHS.some((path) => path.id === "quality"));
  assert.ok(PATHS.some((path) => path.id === "machine-learning"));
  assert.ok(PATHS.some((path) => path.id === "games"));
});

test("every lesson provides a complete explanation and a testable exercise", () => {
  const ids = new Set();
  for (const lesson of ALL_LESSONS) {
    assert.ok(!ids.has(lesson.id), `Duplicate lesson id: ${lesson.id}`);
    ids.add(lesson.id);
    assert.ok(lesson.objective.length > 15, `${lesson.id} needs a learning objective`);
    assert.ok(lesson.explanation.length > 35, `${lesson.id} needs a concept explanation`);
    assert.ok(lesson.example.length > 5, `${lesson.id} needs a runnable example`);
    assert.ok(lesson.expected.length > 0, `${lesson.id} needs expected output`);
    assert.ok(lesson.mistakes.length >= 2, `${lesson.id} needs common mistakes`);
    assert.ok(lesson.starter.length > 0, `${lesson.id} needs starter code`);
    assert.ok(lesson.tests.length > 0, `${lesson.id} needs executable checks`);
    assert.ok(lesson.hints.length >= 2, `${lesson.id} needs progressive hints`);
    assert.ok(lesson.challenge.length > 10, `${lesson.id} needs a stretch challenge`);
    assert.ok(lesson.question.options.length >= 2, `${lesson.id} needs a knowledge check`);
  }
  assert.equal(getLesson(ALL_LESSONS[0].id).id, ALL_LESSONS[0].id);
});

test("recommended learning continues to the first incomplete lesson", () => {
  assert.equal(getNextLesson([]).id, ALL_LESSONS[0].id);
  assert.equal(getNextLesson(ALL_LESSONS.slice(0, 2).map((item) => item.id)).id, ALL_LESSONS[2].id);
  assert.equal(getNextLesson(ALL_LESSONS.map((item) => item.id)), null);
});

test("each lesson has a matching assessment question and all projects have milestones", () => {
  assert.equal(QUESTIONS.length, ALL_LESSONS.length);
  assert.ok(new Set(QUESTIONS.map((question) => question.prompt)).size >= 25, "Knowledge checks should teach distinct concepts.");
  assert.ok(new Set(QUESTIONS.map((question) => question.answer)).size > 1, "Correct answers should not always be the same option.");
  for (const question of QUESTIONS) {
    assert.ok(getLesson(question.lessonId), `${question.id} must refer to a lesson`);
    assert.ok(question.answer >= 0 && question.answer < question.options.length);
    assert.ok(question.explanation.length > 10);
  }
  assert.ok(PROJECTS.length >= 6);
  for (const project of PROJECTS) {
    assert.ok(project.milestones.length >= 4, `${project.id} needs actionable milestones`);
    assert.ok(project.prerequisites.length > 0);
    assert.ok(project.extension.length > 10);
  }
});

test("the original glossary and reference are populated and searchable", () => {
  assert.ok(GLOSSARY.length >= 10);
  assert.ok(REFERENCE.length >= 8);
  assert.ok(GLOSSARY.some((item) => item.term === "exception"));
  assert.ok(REFERENCE.some((item) => item.name === "try / except"));
});
