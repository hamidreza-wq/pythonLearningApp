import { ALL_LESSONS, GLOSSARY, PATHS, PROJECTS, QUESTIONS, REFERENCE, getNextLesson, getLesson } from "./academy.js";
import { gradeAssessment } from "./assessments.js";
import { createInitialProgress, importProgress, readProgress, writeProgress } from "./progress.js";

const nav = document.querySelector("#lesson-nav");
const view = document.querySelector("#view");
const notice = document.querySelector("#notice");
const title = document.querySelector("#breadcrumb-title");
const count = document.querySelector("#completion-count");
const themeToggle = document.querySelector("#theme-toggle");
let progress;
let activeRoute = "dashboard";
let activeLessonId;
let activeQuestion;
let examTimer;
let worker;
let workerReady = false;
let runTimer;
let pendingExecution;

try {
  progress = readProgress();
  progress.completedLessons = progress.completedLessons.filter((id) => getLesson(id));
  progress.completedExercises = progress.completedExercises.filter((id) => QUESTIONS.some((item) => item.id === id));
  progress.bookmarks = progress.bookmarks.filter((id) => getLesson(id));
} catch (error) {
  progress = createInitialProgress();
  showNotice(error.message, "warning");
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function showNotice(message, type = "warning") {
  notice.textContent = message;
  notice.dataset.type = type;
  notice.hidden = false;
}

function saveProgress() {
  try {
    writeProgress(progress);
  } catch (error) {
    showNotice(`Your data could not be saved in this browser: ${error.message}. Export a backup before continuing.`);
  }
}

function setHeader(nextTitle) {
  title.textContent = nextTitle;
  count.textContent = `${progress.completedLessons.length} lessons · ${progress.xp} XP`;
}

function setRoute(nextRoute, nextTitle) {
  if (pendingExecution) stopPython();
  activeRoute = nextRoute;
  document.querySelectorAll("[data-route]").forEach((button) => {
    const selected = button.dataset.route === nextRoute || (nextRoute === "lesson" && button.dataset.route === "paths");
    button.classList.toggle("active", selected);
    if (selected) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (nextTitle) setHeader(nextTitle);
  if (examTimer) {
    clearInterval(examTimer);
    examTimer = null;
  }
}

function createWorker() {
  workerReady = false;
  const nextWorker = new Worker("/python-worker.js");
  worker = nextWorker;
  nextWorker.onmessage = ({ data }) => {
    if (worker !== nextWorker) return;
    handleWorkerMessage(data);
  };
  nextWorker.onerror = (event) => {
    if (worker !== nextWorker) return;
    clearTimeout(runTimer);
    const execution = pendingExecution;
    pendingExecution = null;
    if (!execution || isExecutionVisible(execution)) {
      setRunnerControls(false);
      setRunState("Python could not start");
      writeOutput(event.message || "The Python runtime stopped unexpectedly.", "error");
    }
  };
  nextWorker.postMessage({ type: "init" });
}

function handleWorkerMessage(data) {
  if (data.type === "ready") {
    workerReady = true;
    if (document.querySelector("#run-state")?.dataset.state === "loading") setRunState("Ready to run");
    return;
  }
  if (data.type === "error") {
    clearTimeout(runTimer);
    const execution = pendingExecution;
    pendingExecution = null;
    if (!execution || isExecutionVisible(execution)) {
      setRunnerControls(false);
      setRunState("Python is unavailable");
      writeOutput(data.message, "error");
    }
    return;
  }
  if (data.type !== "result") return;

  clearTimeout(runTimer);
  const execution = pendingExecution;
  pendingExecution = null;
  if (!isExecutionVisible(execution)) {
    if (data.passed === true) completeLesson(execution?.lessonId);
    return;
  }
  setRunnerControls(false);
  const output = data.output || (data.error ? "" : "Program finished with no output.");
  writeOutput(data.error ? `${output}${output ? "\n" : ""}${data.error}` : output, data.error ? "error" : "normal");
  if (data.error) {
    setRunState("Check the error and try again");
  } else if (data.passed === true) {
    setRunState("All checks passed");
    writeOutput(output || "All checks passed!", "success");
    completeLesson(execution?.lessonId);
  } else {
    setRunState("Program finished");
  }
}

function isExecutionVisible(execution) {
  return Boolean(execution && execution.route === activeRoute && (
    execution.route !== "lesson" || execution.lessonId === activeLessonId
  ));
}

function setRunnerControls(running) {
  const runButton = document.querySelector("#run-button");
  const stopButton = document.querySelector("#stop-button");
  if (runButton) runButton.disabled = running;
  if (stopButton) stopButton.disabled = !running;
}

function setRunState(message, state = "ready") {
  const element = document.querySelector("#run-state");
  if (element) {
    element.textContent = message;
    element.dataset.state = state;
  }
}

function writeOutput(message, state = "normal") {
  const element = document.querySelector("#output");
  if (element) {
    element.textContent = message;
    element.className = `output ${state}`;
  }
}

function updateProfile() {
  const learnerName = progress.learner?.name?.trim() || "Guest learner";
  document.querySelector("#profile-name").textContent = learnerName;
  document.querySelector("#profile-label").textContent = progress.learner?.goal || "Learning locally";
}

function applySettings() {
  document.documentElement.dataset.theme = progress.settings.theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.textSize = progress.settings.fontSize;
  document.documentElement.dataset.reduceMotion = String(Boolean(progress.settings.reducedMotion));
  themeToggle.textContent = progress.settings.theme === "dark" ? "Light theme" : "Dark theme";
  updateProfile();
}

function attachNavigation() {
  nav.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.route));
  });
}

function navigate(route) {
  if (route === "dashboard") return renderDashboard();
  if (route === "paths") return renderPaths();
  if (route === "practice") return renderPractice();
  if (route === "playground") return renderPlayground();
  if (route === "exams") return renderExams();
  if (route === "projects") return renderProjects();
  if (route === "reference") return renderReference();
  if (route === "notes") return renderNotes();
  if (route === "help") return renderHelper();
  if (route === "settings") return renderSettings();
}

function renderDashboard() {
  setRoute("dashboard", "Dashboard");
  const next = getNextLesson(progress.completedLessons);
  const percentage = ALL_LESSONS.length ? Math.round(progress.completedLessons.length / ALL_LESSONS.length * 100) : 0;
  const lastExam = progress.examAttempts.at(-1);
  view.innerHTML = `
    <section class="welcome-row">
      <div>
        <p class="eyebrow">YOUR PYTHON JOURNEY</p>
        <h1>${progress.learner?.name ? `Welcome back, ${escapeHtml(progress.learner.name)}.` : "Build real Python skills."}</h1>
        <p class="welcome-copy">A complete, self-paced Python academy: learn the idea, try it in the playground, get useful feedback, and build something of your own.</p>
      </div>
      <div class="progress-card">
        <div class="progress-card-top"><span>Course progress</span><strong>${percentage}%</strong></div>
        <progress class="progress-track" max="100" value="${percentage}" aria-label="Course progress">${percentage}%</progress>
        <p class="progress-caption">${progress.completedLessons.length} of ${ALL_LESSONS.length} lessons completed</p>
      </div>
    </section>
    <section class="metric-grid" aria-label="Your learning statistics">
      <article class="metric-card"><span>Lessons complete</span><strong>${progress.completedLessons.length}<small> / ${ALL_LESSONS.length}</small></strong></article>
      <article class="metric-card"><span>Practice checks</span><strong>${progress.completedExercises.length}<small> passed</small></strong></article>
      <article class="metric-card"><span>Exam attempts</span><strong>${progress.examAttempts.length}</strong></article>
      <article class="metric-card"><span>Saved snippets</span><strong>${progress.snippets.length}</strong></article>
      <article class="metric-card"><span>Study time</span><strong id="study-time">${formatDuration(progress.timeSpentSeconds)}</strong></article>
    </section>
    <section class="next-card">
      <div><p class="eyebrow">${next ? "YOUR NEXT RECOMMENDED STEP" : "FOUNDATION PATH COMPLETE"}</p>
        <h2>${next ? escapeHtml(next.title) : "Ready to choose your next challenge?"}</h2>
        <p>${next ? escapeHtml(next.objective) : "Explore a specialization, practise a skill, or build a project."}</p></div>
      <button class="button" id="continue-button" type="button">${next ? "Continue learning" : "Explore learning paths"} <span aria-hidden="true">→</span></button>
    </section>
    <div class="section-heading"><h2>Learning paths</h2><button class="text-button" data-open-paths type="button">View all paths →</button></div>
    <section class="path-grid">${PATHS.map(pathCard).join("")}</section>
    <div class="section-heading"><h2>Recent exam result</h2><span>${lastExam ? new Date(lastExam.date).toLocaleDateString() : "No attempts yet"}</span></div>
    <section class="welcome-copy">${lastExam ? `Your latest score is <strong>${lastExam.score}%</strong> — ${lastExam.passed ? "passed" : "keep practising and try again when ready"}.` : "Take a no-pressure practice quiz whenever you are ready."}</section>
    <section class="section-heading"><h2>Achievements</h2><span>Earned through practice</span></section>
    <section class="achievement-grid">${achievementCards()}</section>`;
  document.querySelector("#continue-button").addEventListener("click", () => next ? openLesson(next.id) : renderPaths());
  view.querySelector("[data-open-paths]").addEventListener("click", renderPaths);
  view.querySelectorAll("[data-path]").forEach((card) => card.addEventListener("click", () => renderPaths(card.dataset.path)));
}

function pathCard(path) {
  const complete = path.lessons.filter((item) => progress.completedLessons.includes(item.id)).length;
  return `<button class="path-card accent-${path.accent}" type="button" data-path="${path.id}">
    <span class="path-icon">${path.id === "projects" ? "▣" : path.id === "web" ? "⌘" : path.id === "data" ? "▦" : "◇"}</span>
    <span class="path-level">${escapeHtml(path.level)}</span><strong>${escapeHtml(path.title)}</strong>
    <span class="path-description">${escapeHtml(path.description)}</span>
    <span class="path-progress">${complete} / ${path.lessons.length} lessons complete</span>
  </button>`;
}

function achievementCards() {
  const achievements = [
    ["First steps", progress.completedLessons.length >= 1, "Complete your first lesson."],
    ["Practice makes progress", progress.completedExercises.length >= 5, "Pass five knowledge checks."],
    ["Project builder", Object.values(progress.projectMilestones).some((items) => items?.length), "Complete a project milestone."],
    ["Ready for a review", progress.examAttempts.some((attempt) => attempt.passed), "Pass a learning-path exam."]
  ];
  return achievements.map(([name, earned, description]) => `<article class="achievement-card${earned ? " earned" : ""}"><span aria-hidden="true">${earned ? "✦" : "◇"}</span><strong>${escapeHtml(name)}</strong><p>${escapeHtml(description)}</p><small>${earned ? "Earned" : "Keep learning"}</small></article>`).join("");
}

function renderPaths(selectedPath) {
  setRoute("paths", "Learning paths");
  const visiblePaths = selectedPath ? PATHS.filter((path) => path.id === selectedPath) : PATHS;
  view.innerHTML = `<p class="eyebrow">FIND YOUR NEXT STEP</p><h1>Learning paths</h1>
    <p class="welcome-copy">Move through the foundations in order, or explore any topic when you feel ready. Progress is earned by passing the exercises.</p>
    <label class="search-field"><span>⌕</span><input id="path-search" type="search" placeholder="Search lessons and topics" aria-label="Search lessons and topics"></label>
    <div id="path-list" class="path-list">${visiblePaths.map((path) => `<section class="path-section accent-${path.accent}" data-path-section="${path.id}">
      <header><div><p class="eyebrow">${escapeHtml(path.level)}</p><h2>${escapeHtml(path.title)}</h2><p>${escapeHtml(path.description)}</p></div><span>${path.lessons.length} lessons</span></header>
      ${path.lessons.length ? `<div class="lesson-grid">${path.lessons.map((item) => {
        const done = progress.completedLessons.includes(item.id);
        return `<button class="lesson-card${done ? " completed" : ""}" type="button" data-lesson="${item.id}"><span class="card-index">${done ? "✓" : String(item.sequence).padStart(2, "0")}</span><span class="card-content"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.objective)}</span><span class="card-meta">${escapeHtml(item.level)} · ${done ? "Completed" : "Ready to explore"}</span></span><span class="card-status" aria-hidden="true">→</span></button>`;
      }).join("")}</div>` : `<p>This workshop contains ${PROJECTS.length} guided projects, from a beginner calculator to a tested API client. Open Projects to choose one.</p><button class="button ghost" data-open-projects type="button">Explore projects →</button>`}
    </section>`).join("")}</div>`;
  view.querySelectorAll("[data-lesson]").forEach((button) => button.addEventListener("click", () => openLesson(button.dataset.lesson)));
  view.querySelector("[data-open-projects]")?.addEventListener("click", renderProjects);
  document.querySelector("#path-search").addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase().trim();
    view.querySelectorAll("[data-path-section]").forEach((section) => {
      const sectionMatches = section.textContent.toLowerCase().includes(query);
      section.hidden = !sectionMatches;
      section.querySelectorAll("[data-lesson]").forEach((lessonButton) => {
        lessonButton.hidden = query.length > 0 && !lessonButton.textContent.toLowerCase().includes(query);
      });
    });
  });
}

function openLesson(id) {
  const item = getLesson(id);
  if (!item) {
    showNotice("That lesson is not available.", "error");
    return;
  }
  activeLessonId = item.id;
  progress.currentLesson = item.id;
  saveProgress();
  setRoute("lesson", item.title);
  const bookmarked = progress.bookmarks.includes(id);
  view.innerHTML = `
    <header class="lesson-header">
      <p class="eyebrow">${escapeHtml(item.level)} · ${escapeHtml(item.pathTitle)}</p>
      <h1>${escapeHtml(item.title)}</h1>
      <p class="welcome-copy">${escapeHtml(item.objective)}</p>
    </header>
    <div class="lesson-layout">
      <article class="lesson-panel lesson-reading">
        <section><h2>What you will learn</h2><p>${escapeHtml(item.objective)}</p></section>
        <section><h2>The idea</h2><p>${escapeHtml(item.explanation)}</p><p class="why-note"><strong>Why it matters:</strong> ${escapeHtml(item.why)}</p></section>
        <section><h2>Syntax to remember</h2><pre class="code-block">${escapeHtml(item.syntax)}</pre></section>
        <section><h2>Runnable example</h2><pre class="code-block">${escapeHtml(item.example)}</pre>
          <div class="code-caption">Expected output</div><pre class="output example-output">${escapeHtml(item.expected)}</pre></section>
        <details class="reading-details"><summary>Walk through the example</summary><ol>${item.walkthrough.map((line) => `<li><code>${escapeHtml(line.code)}</code><span>${escapeHtml(line.explanation)}</span></li>`).join("")}</ol></details>
        <details class="reading-details"><summary>Common mistakes to check</summary><ul>${item.mistakes.map((mistake) => `<li>${escapeHtml(mistake)}</li>`).join("")}</ul></details>
        <section><h2>Your challenge</h2><p>${escapeHtml(item.task)}</p><div id="hint-area" aria-live="polite"></div>
          <button id="hint-button" class="hint-button" type="button">Give me a hint →</button></section>
        <section class="challenge-card"><h2>Stretch challenge</h2><p>${escapeHtml(item.challenge)}</p></section>
        <section><h2>Takeaway</h2><p>${escapeHtml(item.summary)}</p></section>
        <footer class="lesson-footer"><button class="button secondary" data-go="paths" type="button">← All learning paths</button><button id="bookmark-button" class="button ghost" type="button">${bookmarked ? "★ Saved" : "☆ Save lesson"}</button></footer>
      </article>
      <section class="editor-panel" aria-label="Python code playground">
        <div class="editor-top"><strong>Try it yourself</strong><span>Python 3 · in your browser</span></div>
        <label class="screen-reader-only" for="code-editor">Your Python code</label>
        <div class="code-editor-wrap"><div id="line-gutter" class="line-gutter" aria-hidden="true">1</div><textarea id="code-editor" class="editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" maxlength="50000">${escapeHtml(item.starter)}</textarea></div>
        <label class="input-label" for="program-input">Program input <span>One input value per line, for input()</span></label>
        <textarea class="input-editor" id="program-input" rows="2" aria-label="Values for Python input function" placeholder="Optional: values your program reads">${id === "input" ? "2" : ""}</textarea>
        <div class="editor-actions">
          <div class="editor-tool-buttons"><button class="icon-button" id="reset-code" type="button" title="Reset starter code">Reset</button><button class="icon-button" id="clear-output" type="button" title="Clear the output">Clear output</button><button class="icon-button" id="save-snippet" type="button">Save snippet</button></div>
          <div class="runner-buttons"><button id="stop-button" class="button secondary" type="button" disabled>■ Stop</button><button id="run-button" class="button" type="button">▶ Run &amp; check</button></div>
        </div>
        <div class="run-toolbar"><span id="run-state" class="run-state" data-state="loading">${workerReady ? "Ready to run" : "Starting Python…"}</span><span>5-second time limit</span></div>
        <div class="output-area"><p class="output-label">Output and feedback</p><pre id="output" class="output">Your program output will appear here.</pre></div>
      </section>
    </div>`;
  view.querySelector("[data-go]").addEventListener("click", renderPaths);
  document.querySelector("#hint-button").addEventListener("click", () => revealHint(item));
  document.querySelector("#run-button").addEventListener("click", () => runCode(item));
  document.querySelector("#stop-button").addEventListener("click", stopPython);
  document.querySelector("#bookmark-button").addEventListener("click", () => toggleBookmark(item.id));
  document.querySelector("#reset-code").addEventListener("click", () => { document.querySelector("#code-editor").value = item.starter; });
  document.querySelector("#clear-output").addEventListener("click", () => writeOutput("Output cleared."));
  document.querySelector("#save-snippet").addEventListener("click", saveSnippet);
  document.querySelector("#code-editor").addEventListener("keydown", editorKeys);
  mountLineNumbers();
  document.querySelector("#code-editor").focus({ preventScroll: true });
}

function editorKeys(event) {
  const editor = event.currentTarget;
  if (event.key === "Tab") {
    event.preventDefault();
    editor.setRangeText("    ", editor.selectionStart, editor.selectionEnd, "end");
  }
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    document.querySelector("#run-button")?.click();
  }
}

function revealHint(item) {
  const area = document.querySelector("#hint-area");
  const used = area.querySelectorAll(".hint-text").length;
  const hint = item.hints[Math.min(used, item.hints.length - 1)];
  const message = document.createElement("p");
  message.className = "hint-text";
  message.textContent = used < item.hints.length ? `Hint ${used + 1}: ${hint}` : "You have seen all the hints. Try the example and make one small change.";
  area.append(message);
}

function runCode(item = null) {
  const editor = document.querySelector("#code-editor");
  if (!editor) return;
  if (!workerReady) {
    writeOutput("Python is still starting. Try again in a moment.", "error");
    return;
  }
  if (editor.value.length > 50000) {
    writeOutput("Code is too long to run. Keep it under 50,000 characters.", "error");
    return;
  }
  if (pendingExecution) return;
  const inputText = document.querySelector("#program-input")?.value ?? "";
  const inputs = inputText ? inputText.split(/\r?\n/).slice(0, 100) : [];
  clearTimeout(runTimer);
  pendingExecution = { lessonId: item?.id ?? null, route: activeRoute };
  setRunnerControls(true);
  setRunState("Running", "running");
  writeOutput("Running your code…");
  worker.postMessage({ type: "run", code: editor.value, tests: item?.tests ?? "", inputs });
  runTimer = setTimeout(() => {
    const execution = pendingExecution;
    pendingExecution = null;
    worker.terminate();
    worker = null;
    workerReady = false;
    if (isExecutionVisible(execution)) {
      setRunnerControls(false);
      writeOutput("Your code exceeded the time limit. Python has been restarted; check loops for a stopping condition.", "error");
      setRunState("Restarting Python…", "loading");
    }
    createWorker();
  }, 5000);
}

function stopPython() {
  if (!pendingExecution) return;
  const execution = pendingExecution;
  clearTimeout(runTimer);
  pendingExecution = null;
  worker.terminate();
  worker = null;
  workerReady = false;
  if (isExecutionVisible(execution)) {
    setRunnerControls(false);
    setRunState("Execution stopped");
    writeOutput("Execution stopped. Restarting Python…", "normal");
  }
  createWorker();
}

function mountLineNumbers() {
  const editor = document.querySelector("#code-editor");
  const gutter = document.querySelector("#line-gutter");
  if (!editor || !gutter) return;
  const update = () => {
    gutter.textContent = Array.from({ length: editor.value.split("\n").length }, (_line, index) => index + 1).join("\n");
    gutter.scrollTop = editor.scrollTop;
  };
  editor.addEventListener("input", update);
  editor.addEventListener("scroll", () => { gutter.scrollTop = editor.scrollTop; });
  update();
}

function completeLesson(id) {
  if (!id || progress.completedLessons.includes(id)) return;
  progress.completedLessons.push(id);
  progress.xp += 20;
  saveProgress();
  count.textContent = `${progress.completedLessons.length} lessons · ${progress.xp} XP`;
  if (activeRoute === "lesson" && activeLessonId === id) {
    const banner = document.createElement("div");
    banner.className = "success-banner";
    banner.setAttribute("role", "status");
    banner.innerHTML = "<strong>Great work — exercise passed!</strong>Lesson complete. The next recommended lesson is ready whenever you are.";
    document.querySelector(".lesson-reading")?.append(banner);
  }
}

function toggleBookmark(id) {
  if (progress.bookmarks.includes(id)) progress.bookmarks = progress.bookmarks.filter((bookmark) => bookmark !== id);
  else progress.bookmarks.push(id);
  saveProgress();
  const button = document.querySelector("#bookmark-button");
  if (button) button.textContent = progress.bookmarks.includes(id) ? "★ Saved" : "☆ Save lesson";
}

function renderPractice() {
  setRoute("practice", "Practice");
  const unseen = QUESTIONS.filter((item) => !progress.completedExercises.includes(item.id));
  activeQuestion = unseen[0] ?? QUESTIONS[0];
  view.innerHTML = `<p class="eyebrow">LOW-PRESSURE PRACTICE</p><h1>Check your understanding.</h1>
    <p class="welcome-copy">Try short knowledge checks from across the curriculum. A wrong answer is a useful clue, not a failure.</p>
    <div class="section-heading"><h2>Question ${Math.max(1, QUESTIONS.length - unseen.length + 1)} of ${QUESTIONS.length}</h2><span>${progress.completedExercises.length} passed</span></div>
    <form id="practice-form" class="exam-panel">
      <p class="eyebrow">${escapeHtml(activeQuestion.topic)}</p><h2>${escapeHtml(activeQuestion.prompt)}</h2>
      <div class="options">${activeQuestion.options.map((option, index) => `<label class="option"><input type="radio" name="practice-answer" value="${index}" required><span>${escapeHtml(option)}</span></label>`).join("")}</div>
      <p id="practice-feedback" class="exam-feedback" aria-live="polite"></p>
      <div class="exercise-footer"><button class="button" type="submit">Check answer</button><button class="button secondary" id="next-question" type="button">Another question →</button></div>
    </form>`;
  document.querySelector("#practice-form").addEventListener("submit", checkPracticeAnswer);
  document.querySelector("#next-question").addEventListener("click", rotatePracticeQuestion);
}

function checkPracticeAnswer(event) {
  event.preventDefault();
  const selected = Number(new FormData(event.currentTarget).get("practice-answer"));
  const feedback = document.querySelector("#practice-feedback");
  if (selected === activeQuestion.answer) {
    if (!progress.completedExercises.includes(activeQuestion.id)) {
      progress.completedExercises.push(activeQuestion.id);
      progress.xp += 5;
      saveProgress();
    }
    feedback.textContent = `That's right. ${activeQuestion.explanation} +5 XP.`;
    feedback.className = "exam-feedback feedback-success";
  } else {
    feedback.textContent = `Not quite. Take another look and try again. ${activeQuestion.explanation}`;
    feedback.className = "exam-feedback feedback-error";
  }
}

function rotatePracticeQuestion() {
  const index = QUESTIONS.findIndex((item) => item.id === activeQuestion.id);
  activeQuestion = QUESTIONS[(index + 1) % QUESTIONS.length];
  renderPracticeQuestion();
}

function renderPracticeQuestion() {
  const form = document.querySelector("#practice-form");
  form.innerHTML = `<p class="eyebrow">${escapeHtml(activeQuestion.topic)}</p><h2>${escapeHtml(activeQuestion.prompt)}</h2>
    <div class="options">${activeQuestion.options.map((option, index) => `<label class="option"><input type="radio" name="practice-answer" value="${index}" required><span>${escapeHtml(option)}</span></label>`).join("")}</div>
    <p id="practice-feedback" class="exam-feedback" aria-live="polite"></p>
    <div class="exercise-footer"><button class="button" type="submit">Check answer</button><button class="button secondary" id="next-question" type="button">Another question →</button></div>`;
  form.addEventListener("submit", checkPracticeAnswer);
  document.querySelector("#next-question").addEventListener("click", rotatePracticeQuestion);
}

function renderPlayground(project = null) {
  setRoute("playground", "Playground");
  view.innerHTML = `${project ? `<p class="eyebrow">GUIDED PROJECT · ${escapeHtml(project.level)}</p><h1>${escapeHtml(project.title)}</h1><p class="welcome-copy">${escapeHtml(project.description)} Start with one milestone at a time; use sample data and run your code often.</p><section class="project-guide"><strong>Milestones</strong><ol>${project.milestones.map((milestone) => `<li>${escapeHtml(milestone)}</li>`).join("")}</ol><p><strong>Extension idea:</strong> ${escapeHtml(project.extension)}</p></section>` : `<p class="eyebrow">YOUR PRIVATE WORKSPACE</p><h1>Python playground</h1>
    <p class="welcome-copy">Experiment freely, run examples, and save ideas for later. Python runs locally in your browser; code is not uploaded.</p>`}
    <section class="editor-panel playground-full">
      <div class="editor-top"><strong>${escapeHtml(project?.title ?? "Untitled Python snippet")}</strong><span>Python 3 · Pyodide / WebAssembly</span></div>
      <label class="screen-reader-only" for="code-editor">Python playground editor</label>
      <div class="code-editor-wrap"><div id="line-gutter" class="line-gutter" aria-hidden="true">1</div><textarea id="code-editor" class="editor playground-editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" maxlength="50000">${escapeHtml(project?.starter ?? `# Your Python code
name = "Python"
print(f"Hello, {name}!")`)}</textarea>
      <label class="input-label" for="program-input">Program input <span>One input value per line</span></label>
      <textarea class="input-editor" id="program-input" rows="2" aria-label="Values for Python input function" placeholder="Optional: values your program reads"></textarea>
      <div class="editor-actions">
        <div class="editor-tool-buttons"><button class="icon-button" id="reset-code" type="button">Example</button><button class="icon-button" id="clear-output" type="button">Clear output</button><button class="icon-button" id="save-snippet" type="button">Save snippet</button><button class="icon-button" id="copy-code" type="button">Copy code</button><button class="icon-button" id="download-code" type="button">Download .py</button></div>
        <div class="runner-buttons"><button id="stop-button" class="button secondary" type="button" disabled>■ Stop</button><button id="run-button" class="button" type="button">▶ Run code</button></div>
      </div>
      <div class="run-toolbar"><span id="run-state" class="run-state" data-state="loading">${workerReady ? "Ready to run" : "Starting Python…"}</span><span>5-second time limit · Ctrl+Enter to run</span></div>
      <div class="output-area"><p class="output-label">Output and errors</p><pre id="output" class="output">Run your code to see the output.</pre></div>
    </section>`;
  document.querySelector("#run-button").addEventListener("click", () => runCode());
  document.querySelector("#stop-button").addEventListener("click", stopPython);
  document.querySelector("#code-editor").addEventListener("keydown", editorKeys);
  mountLineNumbers();
  document.querySelector("#reset-code").addEventListener("click", () => {
    document.querySelector("#code-editor").value = project?.starter ?? '# Your Python code\nprint("Hello, Python!")\n';
  });
  document.querySelector("#clear-output").addEventListener("click", () => writeOutput("Output cleared."));
  document.querySelector("#save-snippet").addEventListener("click", saveSnippet);
  document.querySelector("#copy-code").addEventListener("click", copyCode);
  document.querySelector("#download-code").addEventListener("click", downloadCode);
}

function saveSnippet() {
  const code = document.querySelector("#code-editor")?.value;
  if (!code?.trim()) {
    showNotice("Add some code before saving a snippet.", "warning");
    return;
  }
  progress.snippets.unshift({
    id: crypto.randomUUID(),
    title: activeLessonId ? getLesson(activeLessonId)?.title ?? "Python snippet" : "Python snippet",
    code,
    updatedAt: new Date().toISOString()
  });
  progress.snippets = progress.snippets.slice(0, 100);
  saveProgress();
  showNotice("Snippet saved to this browser.", "success");
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(document.querySelector("#code-editor").value);
    showNotice("Code copied to the clipboard.", "success");
  } catch (error) {
    showNotice(`Clipboard access failed: ${error.message}`, "error");
  }
}

function downloadCode() {
  const file = new Blob([document.querySelector("#code-editor").value], { type: "text/x-python;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "python-snippet.py";
  link.click();
  URL.revokeObjectURL(url);
}

function renderExams() {
  setRoute("exams", "Exams & quizzes");
  const latest = progress.examAttempts.at(-1);
  const savedAttempt = progress.examDraft;
  view.innerHTML = `<p class="eyebrow">ASSESSMENT WITHOUT PRESSURE</p><h1>Exams and quizzes</h1>
    <p class="welcome-copy">Choose a practice check or take a timed mixed-topic exam. Scores are saved in your browser. These are learning assessments, not official certifications.</p>
    ${savedAttempt ? `<section class="next-card"><div><p class="eyebrow">SAVED EXAM IN PROGRESS</p><h2>${escapeHtml(savedAttempt.label)}</h2><p>Your answers are saved on this device.</p></div><div class="exercise-footer"><button class="button" id="resume-exam" type="button">Resume exam →</button><button class="button secondary" id="discard-exam" type="button">Discard</button></div></section>` : ""}
    <div class="section-heading"><h2>Choose a format</h2><span>Retake whenever you want</span></div>
    <section class="exam-options">
      <article class="exam-option"><span class="path-level">No timer · Practice</span><h2>Topic quiz</h2><p>Choose a learning path, practise a short set of questions, and see an explanation for every answer.</p><label for="topic-choice">Learning path</label><select id="topic-choice">${PATHS.filter((path) => path.lessons.length).map((path) => `<option value="${path.id}">${escapeHtml(path.title)}</option>`).join("")}</select><button class="button" id="topic-quiz" type="button">Start topic quiz →</button></article>
      <article class="exam-option"><span class="path-level">10 minutes · Pass mark 70%</span><h2>Mixed-topic exam</h2><p>Ten randomly selected knowledge checks across your completed learning path. Answers are saved as you go.</p><button class="button" id="start-exam" type="button">Start practice exam →</button></article>
    </section>
    <div class="section-heading"><h2>Attempt history</h2><span>${progress.examAttempts.length} saved attempts</span></div>
    ${latest ? `<section class="exam-panel">${[...progress.examAttempts].reverse().map((attempt) => `<p class="history-row"><strong>${attempt.score}% · ${attempt.passed ? "Passed" : "Keep practising"}</strong><span>${new Date(attempt.date).toLocaleString()}${attempt.timed ? " · Timed" : " · Practice"}</span></p>`).join("")}</section>` : '<p class="empty-state">Your completed exams will appear here.</p>'}`;
  document.querySelector("#topic-quiz").addEventListener("click", () => startTopicQuiz(document.querySelector("#topic-choice").value));
  document.querySelector("#start-exam").addEventListener("click", startTimedExam);
  if (savedAttempt) {
    document.querySelector("#resume-exam").addEventListener("click", () => resumeExam(savedAttempt));
    document.querySelector("#discard-exam").addEventListener("click", () => {
      progress.examDraft = null;
      saveProgress();
      renderExams();
    });
  }
}

function startTopicQuiz(pathId) {
  const path = PATHS.find((item) => item.id === pathId);
  const pathQuestions = QUESTIONS.filter((question) => path.lessons.some((item) => item.id === question.lessonId));
  const questions = pathQuestions.slice(0, 5);
  const options = { timed: false, label: `${path.title} · practice quiz`, passMark: 60 };
  saveExamDraft(questions, options);
  renderExam(questions, options, progress.examDraft);
}

function startTimedExam() {
  const source = QUESTIONS.filter((question) => progress.completedLessons.includes(question.lessonId));
  const pool = source.length >= 4 ? source : QUESTIONS.slice(0, 10);
  const questions = shuffle(pool).slice(0, Math.min(10, pool.length));
  const options = { timed: true, label: "Mixed-topic practice exam", passMark: 70, minutes: 10 };
  saveExamDraft(questions, options);
  renderExam(questions, options, progress.examDraft);
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function saveExamDraft(questions, options) {
  progress.examDraft = {
    questionIds: questions.map((question) => question.id),
    answers: {},
    startedAt: new Date().toISOString(),
    timed: options.timed,
    label: options.label,
    passMark: options.passMark,
    minutes: options.minutes ?? null
  };
  saveProgress();
}

function resumeExam(draft) {
  const questions = draft.questionIds.map((id) => QUESTIONS.find((question) => question.id === id)).filter(Boolean);
  if (!questions.length) {
    progress.examDraft = null;
    saveProgress();
    showNotice("That saved exam is no longer available. Start a new exam instead.", "warning");
    renderExams();
    return;
  }
  renderExam(questions, {
    timed: draft.timed,
    label: draft.label,
    passMark: draft.passMark,
    minutes: draft.minutes
  }, draft);
}

function renderExam(questions, options, draft) {
  setRoute("exams", options.label);
  let answers = { ...draft.answers };
  let secondsLeft = options.minutes
    ? Math.max(0, options.minutes * 60 - Math.floor((Date.now() - Date.parse(draft.startedAt)) / 1000))
    : 0;
  view.innerHTML = `<div class="lesson-header"><p class="eyebrow">${options.timed ? "TIMED PRACTICE" : "PRACTICE QUIZ"}</p><h1>${escapeHtml(options.label)}</h1><p class="welcome-copy">${questions.length} questions · ${options.timed ? "Timer starts now; submit when you're ready." : "No time limit."} Passing score: ${options.passMark}%.</p></div>
    <div class="exam-toolbar"><span id="exam-timer">${options.timed ? "10:00 remaining" : "Practice mode · no timer"}</span><span id="answered-count">${Object.keys(answers).length} of ${questions.length} answered</span><button class="button secondary" id="submit-exam" type="button">Submit exam</button></div>
    <nav class="question-navigation" id="question-navigation" aria-label="Jump to a question">${questions.map((question, index) => `<button class="question-jump${answers[question.id] !== undefined ? " answered" : ""}" type="button" data-jump-question="${index}" aria-label="Question ${index + 1}${answers[question.id] !== undefined ? ", answered" : ", unanswered"}">${index + 1}</button>`).join("")}</nav>
    <form id="exam-form" class="exam-panel">${questions.map((question, index) => `<fieldset class="question" id="exam-question-${index}" tabindex="-1"><legend class="screen-reader-only">Question ${index + 1}</legend><h3>${index + 1}. ${escapeHtml(question.prompt)}</h3><p class="question-topic">${escapeHtml(question.topic)}</p><div class="options">${question.options.map((option, optionIndex) => `<label class="option"><input type="radio" name="question-${index}" value="${optionIndex}" ${String(answers[question.id]) === String(optionIndex) ? "checked" : ""}><span>${escapeHtml(option)}</span></label>`).join("")}</div><p id="feedback-${index}" class="exam-feedback" aria-live="polite"></p></fieldset>`).join("")}</form>
    <div id="exam-result" aria-live="polite"></div>`;
  const form = document.querySelector("#exam-form");
  document.querySelector("#answered-count").textContent = `${Object.keys(answers).length} of ${questions.length} answered`;
  form.addEventListener("change", () => {
    answers = Object.fromEntries(questions.map((question, index) => [question.id, new FormData(form).get(`question-${index}`)]).filter(([, value]) => value !== null));
    document.querySelector("#answered-count").textContent = `${Object.keys(answers).length} of ${questions.length} answered`;
    document.querySelectorAll("[data-jump-question]").forEach((button, index) => {
      const answered = answers[questions[index].id] !== undefined;
      button.classList.toggle("answered", answered);
      button.setAttribute("aria-label", `Question ${index + 1}${answered ? ", answered" : ", unanswered"}`);
    });
    progress.examDraft = { ...progress.examDraft, answers };
    saveProgress();
  });
  view.querySelectorAll("[data-jump-question]").forEach((button) => button.addEventListener("click", () => {
    const target = document.querySelector(`#exam-question-${button.dataset.jumpQuestion}`);
    target?.scrollIntoView({ behavior: progress.settings.reducedMotion ? "instant" : "smooth", block: "start" });
    target?.focus({ preventScroll: true });
  }));
  document.querySelector("#submit-exam").addEventListener("click", () => submitExam(questions, options, answers));
  if (options.timed) {
    if (secondsLeft === 0) {
      submitExam(questions, options, answers);
      return;
    }
    document.querySelector("#exam-timer").textContent = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")} remaining`;
    examTimer = setInterval(() => {
      secondsLeft -= 1;
      const timer = document.querySelector("#exam-timer");
      if (!timer) return;
      timer.textContent = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")} remaining`;
      if (secondsLeft <= 0) {
        clearInterval(examTimer);
        examTimer = null;
        submitExam(questions, options, answers);
      }
    }, 1000);
  }
}

function submitExam(questions, options, answers) {
  if (examTimer) {
    clearInterval(examTimer);
    examTimer = null;
  }
  const grade = gradeAssessment(questions, answers, options.passMark);
  questions.forEach((question, index) => {
    const result = grade.results[index];
    const feedback = document.querySelector(`#feedback-${index}`);
    feedback.textContent = result.correct ? `Correct. ${result.explanation}` : `Review this one: ${result.explanation}`;
    feedback.className = `exam-feedback ${result.correct ? "feedback-success" : "feedback-error"}`;
  });
  const { correct: score, percentage, passed } = grade;
  progress.examAttempts.push({
    date: new Date().toISOString(),
    score: percentage,
    correct: score,
    total: questions.length,
    passed,
    timed: options.timed,
    label: options.label,
    answers: { ...answers },
    questions: questions.map(({ id, prompt, options: choices, answer, explanation, topic }) => ({ id, prompt, options: choices, answer, explanation, topic }))
  });
  progress.examDraft = null;
  progress.xp += passed ? 25 : 5;
  saveProgress();
  document.querySelector("#submit-exam").disabled = true;
  document.querySelector("#exam-result").innerHTML = `<div class="exam-result"><strong>${percentage}% — ${passed ? "passed" : "keep practising"}</strong><p>${score} of ${questions.length} correct. ${passed ? "Great work. Review any explanations you want to revisit." : "You can review the explanations and retake this check whenever you like."}</p><button class="button ghost" id="exam-history" type="button">See all exam results</button></div>`;
  document.querySelector("#exam-history").addEventListener("click", renderExams);
  count.textContent = `${progress.completedLessons.length} lessons · ${progress.xp} XP`;
}

function renderProjects() {
  setRoute("projects", "Project workshop");
  view.innerHTML = `<p class="eyebrow">LEARN BY BUILDING</p><h1>Project workshop</h1><p class="welcome-copy">Build one small feature at a time. Each project includes requirements, milestones, testing guidance, and an extension challenge. Start with a dry run when a project touches files.</p>
    <section class="project-grid">${PROJECTS.map((project) => {
      const checked = progress.projectMilestones[project.id] ?? [];
      return `<article class="project-card"><div class="project-card-heading"><span class="path-level">${escapeHtml(project.level)} · ${escapeHtml(project.time)}</span><span class="card-progress">${checked.length}/${project.milestones.length} steps</span></div><h2>${escapeHtml(project.title)}</h2><p>${escapeHtml(project.description)}</p><div class="project-prerequisites"><strong>Helpful before you start</strong><span>${project.prerequisites.map(escapeHtml).join(" · ")}</span></div><details class="reading-details"><summary>Project milestones</summary><ol class="milestone-list">${project.milestones.map((milestone, index) => `<li><label class="milestone-option"><input type="checkbox" data-project="${project.id}" data-milestone="${index}" ${checked.includes(index) ? "checked" : ""}><span>${escapeHtml(milestone)}</span></label></li>`).join("")}</ol><p><strong>Extension:</strong> ${escapeHtml(project.extension)}</p></details><button class="button ghost" type="button" data-project-open="${project.id}">Open in playground →</button></article>`;
    }).join("")}</section>`;
  view.querySelectorAll("[data-project]").forEach((checkbox) => checkbox.addEventListener("change", () => {
    const values = progress.projectMilestones[checkbox.dataset.project] ?? [];
    const milestone = Number(checkbox.dataset.milestone);
    progress.projectMilestones[checkbox.dataset.project] = checkbox.checked ? [...new Set([...values, milestone])] : values.filter((value) => value !== milestone);
    saveProgress();
  }));
  view.querySelectorAll("[data-project-open]").forEach((button) => button.addEventListener("click", () => {
    const project = PROJECTS.find((item) => item.id === button.dataset.projectOpen);
    if (project) renderPlayground(project);
  }));
}

function renderReference(query = "") {
  setRoute("reference", "Reference library");
  view.innerHTML = `<p class="eyebrow">A QUICK, SEARCHABLE GUIDE</p><h1>Reference library</h1><p class="welcome-copy">Short original summaries to help you while you code. Each entry includes a runnable syntax example. For authoritative detail, see the official Python documentation.</p>
    <label class="search-field"><span>⌕</span><input id="reference-search" type="search" value="${escapeHtml(query)}" placeholder="Search terms, functions, errors…" aria-label="Search the reference library"></label>
    <div class="reference-tabs"><button class="button ghost active" type="button" data-reference="all">All</button><button class="button ghost" type="button" data-reference="glossary">Glossary</button><button class="button ghost" type="button" data-reference="builtins">Built-ins</button></div>
    <div id="reference-list" class="reference-grid"></div>
    <p class="source-note">Official reference: <a href="https://docs.python.org/3/" target="_blank" rel="noreferrer">Python documentation ↗</a></p>`;
  let category = "all";
  const search = () => {
    const text = document.querySelector("#reference-search").value.trim().toLowerCase();
    const entries = [
      ...(category !== "builtins" ? GLOSSARY.map((item) => ({ title: item.term, body: item.definition, kind: "Glossary" })) : []),
      ...(category !== "glossary" ? REFERENCE.map((item) => ({ title: item.name, body: item.description, example: item.example, kind: "Quick reference" })) : [])
    ].filter((item) => `${item.title} ${item.body} ${item.example ?? ""}`.toLowerCase().includes(text));
    document.querySelector("#reference-list").innerHTML = entries.length ? entries.map((item) => `<article class="reference-card"><span class="path-level">${escapeHtml(item.kind)}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.body)}</p>${item.example ? `<pre class="code-block">${escapeHtml(item.example)}</pre>` : ""}<button class="text-button" type="button" data-reference-bookmark="${escapeHtml(item.title)}">☆ Save note</button></article>`).join("") : '<p class="empty-state">No matching references. Try another search.</p>';
    document.querySelectorAll("[data-reference-bookmark]").forEach((button) => button.addEventListener("click", () => {
      progress.notes[`reference:${button.dataset.referenceBookmark}`] ??= button.dataset.referenceBookmark;
      saveProgress();
      button.textContent = "Saved to notes ✓";
    }));
  };
  view.querySelector("#reference-search").addEventListener("input", search);
  view.querySelectorAll("[data-reference]").forEach((button) => button.addEventListener("click", () => {
    category = button.dataset.reference;
    view.querySelectorAll("[data-reference]").forEach((tab) => tab.classList.toggle("active", tab === button));
    search();
  }));
  search();
}

function renderNotes() {
  setRoute("notes", "Notes & snippets");
  const notesText = progress.notes.personal ?? "";
  const referenceNotes = Object.entries(progress.notes).filter(([key]) => key.startsWith("reference:"));
  view.innerHTML = `<p class="eyebrow">YOUR LOCAL STUDY SPACE</p><h1>Notes and saved snippets</h1><p class="welcome-copy">Notes and saved code stay in this browser. Export a data backup in Settings if you want to keep a copy.</p>
    <section class="notes-layout"><article class="exam-panel"><h2>Learning notes</h2><label class="screen-reader-only" for="notes-editor">Your learning notes</label><textarea class="notes-editor" id="notes-editor" placeholder="Write down a useful idea, question, or reminder…">${escapeHtml(notesText)}</textarea><p id="notes-status" class="run-state" aria-live="polite">Saved locally as you type.</p>${referenceNotes.length ? `<h3>Saved reference notes</h3>${referenceNotes.map(([key, value]) => `<p class="bookmark-row"><span>${escapeHtml(value)}</span><button class="icon-button" data-remove-reference="${escapeHtml(key)}" type="button">Remove</button></p>`).join("")}` : ""}</article>
    <article class="exam-panel"><h2>Lesson bookmarks</h2>${progress.bookmarks.length ? progress.bookmarks.map((id) => `<p class="bookmark-row"><button class="text-button" data-open-lesson="${id}" type="button">${escapeHtml(getLesson(id)?.title ?? id)} →</button><button class="icon-button" data-remove-bookmark="${id}" type="button" aria-label="Remove bookmark">Remove</button></p>`).join("") : '<p class="empty-state">Save a lesson to find it here later.</p>'}</article></section>
    <div class="section-heading"><h2>Saved Python snippets</h2><span>${progress.snippets.length} saved</span></div>
    <section class="snippet-grid">${progress.snippets.length ? progress.snippets.map((snippet) => `<article class="snippet-card"><div class="snippet-heading"><strong>${escapeHtml(snippet.title)}</strong><time>${new Date(snippet.updatedAt).toLocaleDateString()}</time></div><pre class="code-block">${escapeHtml(snippet.code)}</pre><button class="button ghost" data-open-snippet="${snippet.id}" type="button">Open in playground</button><button class="icon-button" data-delete-snippet="${snippet.id}" type="button">Delete</button></article>`).join("") : '<p class="empty-state">Save code from a lesson or the playground to build your snippet collection.</p>'}</section>`;
  let saveTimer;
  document.querySelector("#notes-editor").addEventListener("input", (event) => {
    clearTimeout(saveTimer);
    document.querySelector("#notes-status").textContent = "Saving…";
    saveTimer = setTimeout(() => {
      progress.notes["personal"] = event.target.value;
      saveProgress();
      document.querySelector("#notes-status").textContent = "Saved locally.";
    }, 300);
  });
  view.querySelectorAll("[data-open-lesson]").forEach((button) => button.addEventListener("click", () => openLesson(button.dataset.openLesson)));
  view.querySelectorAll("[data-remove-bookmark]").forEach((button) => button.addEventListener("click", () => { toggleBookmark(button.dataset.removeBookmark); renderNotes(); }));
  view.querySelectorAll("[data-remove-reference]").forEach((button) => button.addEventListener("click", () => {
    delete progress.notes[button.dataset.removeReference];
    saveProgress();
    renderNotes();
  }));
  view.querySelectorAll("[data-open-snippet]").forEach((button) => button.addEventListener("click", () => {
    const snippet = progress.snippets.find((item) => item.id === button.dataset.openSnippet);
    if (!snippet) return;
    renderPlayground();
    document.querySelector("#code-editor").value = snippet.code;
  }));
  view.querySelectorAll("[data-delete-snippet]").forEach((button) => button.addEventListener("click", () => {
    progress.snippets = progress.snippets.filter((snippet) => snippet.id !== button.dataset.deleteSnippet);
    saveProgress();
    renderNotes();
  }));
}

function renderHelper() {
  setRoute("help", "Learning helper");
  view.innerHTML = `<p class="eyebrow">LOCAL, PRIVATE SUPPORT</p><h1>Learning helper</h1><p class="welcome-copy">Get deterministic help from the academy's built-in explanations, debugging tips, and reference notes. This helper does not use an AI model and does not send your code anywhere.</p>
    <form id="helper-form" class="exam-panel"><label for="helper-question">What would you like help with?</label><textarea id="helper-question" class="input-editor helper-question" placeholder="Paste an error message or ask about a Python concept…"></textarea><label for="helper-code">Optional code or error output</label><textarea id="helper-code" class="input-editor helper-question" placeholder="Your code stays in this browser."></textarea><button class="button" type="submit">Find an explanation →</button></form>
    <div id="helper-answer" aria-live="polite"></div>
    <div class="section-heading"><h2>Quick help</h2></div><section class="helper-actions"><button class="button ghost" data-help="syntax" type="button">Explain a syntax error</button><button class="button ghost" data-help="loop" type="button">Help with a loop</button><button class="button ghost" data-help="function" type="button">Explain functions</button></section>`;
  document.querySelector("#helper-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const question = document.querySelector("#helper-question").value;
    const code = document.querySelector("#helper-code").value;
    showHelperAnswer(question, code);
  });
  view.querySelectorAll("[data-help]").forEach((button) => button.addEventListener("click", () => showHelperAnswer(button.dataset.help, "")));
}

function showHelperAnswer(question, code) {
  const text = `${question}\n${code}`.toLowerCase();
  let answer;
  if (text.includes("syntaxerror") || text.includes("indentationerror") || text.includes("syntax")) answer = ["Start with the final line of the error and locate the line number it mentions. Check matching parentheses and quotes, colons after if/for/def, and consistent indentation.", "Try removing one line at a time until the error changes. The line Python points to can be just after the actual typo."];
  else if (text.includes("nameerror") || text.includes("not defined")) answer = ["A NameError usually means Python saw a name before it had been assigned, or the name was spelled differently.", "Compare the spelling and capitalisation where the name is used and where you define it."];
  else if (text.includes("typeerror") || text.includes("unsupported operand")) answer = ["A TypeError often means an operation received a kind of value it cannot use, such as adding text to a number.", "Print type(value).__name__ to inspect a value. Convert input text to int() or float() before arithmetic."];
  else if (text.includes("indexerror") || text.includes("keyerror")) answer = ["The requested position or key may not exist. Lists start at index 0; a list of length three has indexes 0, 1, and 2.", "Check len(collection) or use dictionary.get(key) when a key might be missing."];
  else if (text.includes("loop") || text.includes("while")) answer = ["A loop repeats instructions. In a while loop, make sure each pass changes something that can make the condition false.", "For a known number of repetitions, try for item in range(...). Run a small example and print the changing value."];
  else if (text.includes("function") || text.includes("return")) answer = ["A function packages reusable steps. Parameters receive inputs, and return sends a result to the caller.", 'Try def double(number): followed by an indented return number * 2. A print inside a function displays text but does not return a value.'];
  else if (text.includes("variable") || text.includes("assignment")) answer = ["A variable name refers to a value. Use = to assign it; use == to compare two values.", 'For example: language = "Python". You can display its value with print(language).'];
  else if (text.includes("hint")) answer = ["Start with the smallest part of the task: identify the input, the output, and one example.", "Try a small change in the playground, run it, and compare the result with what you expected."];
  else answer = ["Start with one small example. Predict the result before you run the code, then compare your prediction with the output.", "Try a related lesson or search the reference library for a term from the explanation. Your code is not sent to an AI service."];
  document.querySelector("#helper-answer").innerHTML = `<section class="helper-answer"><p class="eyebrow">LOCAL LEARNING GUIDE</p><p>${escapeHtml(answer[0])}</p><p>${escapeHtml(answer[1])}</p><p class="source-note">This is a built-in rule-based explanation, not AI-generated advice.</p></section>`;
}

function renderSettings() {
  setRoute("settings", "Settings & data");
  view.innerHTML = `<p class="eyebrow">YOUR PREFERENCES, YOUR DATA</p><h1>Settings and privacy</h1><p class="welcome-copy">This guest learning app stores progress locally in your browser. There is no account, advertising, analytics, or cloud sync in this version.</p>
    <div class="settings-grid">
      <section class="exam-panel"><h2>Learning profile</h2><form id="profile-form" class="settings-form"><label for="learner-name">Name or nickname</label><input id="learner-name" value="${escapeHtml(progress.learner?.name ?? "")}" maxlength="50" placeholder="Optional"><label for="learner-level">Experience</label><select id="learner-level"><option>Complete beginner</option><option>Some Python basics</option><option>Experienced programmer</option></select><label for="learner-goal">Current goal</label><select id="learner-goal"><option>Learning locally</option><option>Learn programming from scratch</option><option>Build websites and APIs</option><option>Analyse data</option><option>Automate everyday tasks</option><option>Prepare for interviews</option><option>Explore advanced Python</option></select><button class="button" type="submit">Save learning profile</button></form></section>
      <section class="exam-panel"><h2>Display and accessibility</h2><form id="appearance-form" class="settings-form"><label for="setting-theme">Colour theme</label><select id="setting-theme"><option value="light">Light</option><option value="dark">Dark</option></select><label for="setting-text-size">Text size</label><select id="setting-text-size"><option value="medium">Comfortable</option><option value="large">Larger text</option></select><label class="check-setting"><input id="setting-motion" type="checkbox"> Reduce motion</label><label class="check-setting"><input id="setting-time" type="checkbox"> Track optional learning time in this browser</label><button class="button" type="submit">Save preferences</button></form></section>
    </div>
    <div class="section-heading"><h2>Your learning data</h2></div>
    <section class="exam-panel data-actions"><div><h3>Export a backup</h3><p>Download your progress, notes, bookmarks, and snippets as a JSON file.</p><button class="button secondary" id="export-data" type="button">Export my data</button></div><div><h3>Import a backup</h3><p>Restore an earlier Python Path backup on this browser.</p><label class="button secondary file-button" for="import-file">Choose a backup file</label><input id="import-file" class="screen-reader-only" type="file" accept="application/json,.json"></div><div><h3>Delete local data</h3><p>Remove saved lessons, notes, snippets, and results from this browser.</p><button class="button danger" id="reset-progress" type="button">Delete all my data</button></div></section>
    <p class="source-note">Text size and reduced-motion preferences are stored on this device. Export a backup before clearing browser data.</p>`;
  document.querySelector("#learner-level").value = progress.learner?.level ?? "Complete beginner";
  document.querySelector("#learner-goal").value = progress.learner?.goal ?? "Learn programming from scratch";
  document.querySelector("#setting-theme").value = progress.settings.theme;
  document.querySelector("#setting-text-size").value = progress.settings.fontSize;
  document.querySelector("#setting-motion").checked = Boolean(progress.settings.reducedMotion);
  document.querySelector("#setting-time").checked = Boolean(progress.settings.trackTime);
  document.querySelector("#profile-form").addEventListener("submit", (event) => {
    event.preventDefault();
    progress.learner = {
      name: document.querySelector("#learner-name").value.trim(),
      level: document.querySelector("#learner-level").value,
      goal: document.querySelector("#learner-goal").value
    };
    saveProgress();
    applySettings();
    showNotice("Your learning profile is saved on this device.", "success");
  });
  document.querySelector("#appearance-form").addEventListener("submit", (event) => {
    event.preventDefault();
    progress.settings = {
      ...progress.settings,
      theme: document.querySelector("#setting-theme").value,
      fontSize: document.querySelector("#setting-text-size").value,
      reducedMotion: document.querySelector("#setting-motion").checked,
      trackTime: document.querySelector("#setting-time").checked
    };
    saveProgress();
    applySettings();
    showNotice("Display preferences saved.", "success");
  });
  document.querySelector("#export-data").addEventListener("click", exportData);
  document.querySelector("#import-file").addEventListener("change", importData);
  document.querySelector("#reset-progress").addEventListener("click", deleteData);
}

function exportData() {
  const file = new Blob([JSON.stringify({ application: "Python Path Academy", version: 2, exportedAt: new Date().toISOString(), progress }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "python-path-backup.json";
  link.click();
  URL.revokeObjectURL(url);
  showNotice("Your backup file was downloaded.", "success");
}

async function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
    const data = backup.progress ?? backup;
    progress = importProgress(JSON.stringify(data));
    applySettings();
    showNotice("Backup restored successfully.", "success");
    renderSettings();
  } catch (error) {
    showNotice(`The backup could not be imported: ${error.message}`, "error");
  } finally {
    event.target.value = "";
  }
}

function deleteData() {
  if (!window.confirm("Delete all Python Path progress, notes, and saved code from this browser? Download a backup first if you want to keep them.")) return;
  progress = createInitialProgress();
  saveProgress();
  applySettings();
  renderDashboard();
  showNotice("Local learning data was deleted.", "success");
}

function setupGlobalControls() {
  themeToggle.addEventListener("click", () => {
    progress.settings.theme = progress.settings.theme === "dark" ? "light" : "dark";
    saveProgress();
    applySettings();
    if (activeRoute === "settings") renderSettings();
  });
  attachNavigation();
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeRoute === "lesson") renderPaths();
  });
  setInterval(() => {
    if (!progress.settings.trackTime || document.visibilityState !== "visible") return;
    progress.timeSpentSeconds += 60;
    saveProgress();
    const metric = document.querySelector("#study-time");
    if (metric) metric.textContent = formatDuration(progress.timeSpentSeconds);
  }, 60000);
}

setupGlobalControls();
applySettings();
renderDashboard();
createWorker();
