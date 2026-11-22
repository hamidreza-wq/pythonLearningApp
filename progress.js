const STORAGE_KEY = "python-path-academy-v2";

export function createInitialProgress() {
  return {
    completedLessons: [],
    completedExercises: [],
    examAttempts: [],
    bookmarks: [],
    notes: {},
    snippets: [],
    projectMilestones: {},
    settings: { theme: "light", fontSize: "medium", reducedMotion: false, trackTime: false },
    learner: null,
    xp: 0,
    timeSpentSeconds: 0,
    currentLesson: null,
    examDraft: null
  };
}

export function readProgress(storage = globalThis.localStorage) {
  let saved = storage.getItem(STORAGE_KEY);
  if (saved === null) {
    const legacy = storage.getItem("python-path-progress-v1");
    if (legacy === null) return createInitialProgress();
    try {
      const previous = JSON.parse(legacy);
      const migrated = {
        ...createInitialProgress(),
        completedLessons: (previous.completedLessons ?? []).map((id) => ({
          "first-steps": "hello",
          lists: "collections",
          project: "quiz"
        })[id] ?? id)
      };
      if (Number.isInteger(previous.examScore)) {
        migrated.examAttempts.push({
          date: new Date().toISOString(),
          score: Math.round(previous.examScore / 6 * 100),
          correct: previous.examScore,
          total: 6,
          passed: previous.examScore >= 4,
          timed: false,
          label: "Previous final check"
        });
      }
      storage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      saved = JSON.stringify(migrated);
    } catch (error) {
      throw new Error(`Previous saved progress could not be migrated: ${error.message}`);
    }
  }

  let stored;
  try {
    stored = JSON.parse(saved);
  } catch (error) {
    throw new Error(`Saved progress could not be read: ${error.message}`);
  }
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    throw new Error("Saved progress has an invalid format. Export it before clearing this app's data.");
  }

  const progress = { ...createInitialProgress(), ...stored };
  if (
    !Array.isArray(progress.completedLessons) ||
    !progress.completedLessons.every((id) => typeof id === "string") ||
    !Array.isArray(progress.completedExercises) ||
    !Array.isArray(progress.examAttempts) ||
    !Array.isArray(progress.bookmarks) ||
    !progress.notes ||
    typeof progress.notes !== "object" ||
    Array.isArray(progress.notes) ||
    !Array.isArray(progress.snippets) ||
    !progress.projectMilestones ||
    typeof progress.projectMilestones !== "object" ||
    !progress.settings ||
    typeof progress.settings !== "object" ||
    !Number.isInteger(progress.xp) ||
    progress.xp < 0 ||
    !Number.isInteger(progress.timeSpentSeconds) ||
    progress.timeSpentSeconds < 0 ||
    !(progress.examDraft === null || (
      typeof progress.examDraft === "object" &&
      Array.isArray(progress.examDraft.questionIds) &&
      progress.examDraft.answers &&
      typeof progress.examDraft.answers === "object" &&
      typeof progress.examDraft.startedAt === "string"
    ))
  ) {
    throw new Error("Saved progress has an invalid format. Export it before clearing this app's data.");
  }

  if (Number.isInteger(stored.examScore)) {
    progress.examAttempts.push({
      date: new Date().toISOString(),
      score: Math.round(stored.examScore / 6 * 100),
      total: 6,
      passed: stored.examScore >= 4,
      legacy: true
    });
    delete progress.examScore;
  }
  return progress;
}

export function writeProgress(progress, storage = globalThis.localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function importProgress(serialized, storage = globalThis.localStorage) {
  let parsed;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    throw new Error(`That backup is not valid JSON: ${error.message}`);
  }
  const validatedStorage = {
    getItem: () => JSON.stringify(parsed),
    setItem: () => {}
  };
  const validated = readProgress(validatedStorage);
  writeProgress(validated, storage);
  return validated;
}
