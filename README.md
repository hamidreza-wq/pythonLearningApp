# Python Path Academy

A free, local-first Python learning app. It currently includes **33 original lessons across nine paths**, a Python playground, input/output, testable exercises, a practice bank, timed and untimed assessments, guided projects, a searchable reference and glossary, a rule-based learning helper, bookmarks, notes, saved code, achievements, local data export/import, and display preferences.

Lessons cover Python foundations, collections, functions, files, errors, classes, generators, async, type hints and testing, HTTP and input validation, data quality, CSV, automation, algorithmic problem solving, introductory machine-learning concepts, and game-state design. Six projects range from a calculator to an API client plan.

## Run locally

Requires Node.js 20 or later. No Python installation, database, npm package installation, account, or paid service is required.

```powershell
npm start
```

Open <http://127.0.0.1:4173>. The first playground run downloads the pinned Pyodide 0.27.7 WebAssembly runtime from jsDelivr, so an internet connection is needed to start Python. The rest of the learning content is included with the app.

Run the automated checks with:

```powershell
npm test
```

## Code execution and safety limits

Student code runs in a dedicated browser Web Worker using Pyodide/WebAssembly. The app does **not** execute student code on the Node server or upload it to an execution API. Each run is stopped after five seconds, the captured output is limited to 100,000 characters, browser networking and JavaScript interop are restricted in the worker, and the worker is restarted after a timeout or stop request.

This architecture is suitable for a local learning playground, but is **not a hardened sandbox for hostile submissions or a security boundary against browser, WebAssembly, or runtime vulnerabilities**. The exercise tests are local and visible to the browser, so they are not suitable for secret grading or certification. A multi-user online deployment that accepts untrusted code requires a separately operated, hardened, resource-limited execution service; Docker is not installed or configured by this project.

## Student data and privacy

Progress, preferences, notes, exam history, projects, and snippets are stored in the browser's local storage. This version has guest learning only: no user accounts, password handling, PostgreSQL, cross-device synchronization, analytics, advertisements, or administrator interface. Export a JSON backup in **Settings & data** before moving browsers or clearing browser data. Import validates the backup before replacing the current local copy.

The learning helper is rule-based and uses the included content; it is not an AI model. It does not send questions or code to an external service. Time tracking is optional and off by default.

## Architecture

- `index.html`, `styles.css`, and `app.js`: responsive single-page learning interface.
- `academy.js`: lesson, assessment, project, glossary, and reference content.
- `progress.js`: local progress storage, backup validation, and migration from the earlier MVP.
- `python-worker.js`: browser-only Python runtime and execution controls.
- `server.mjs`: small local static-file server with a restrictive Content Security Policy and security headers.
- `tests/`: Node.js tests for lesson completeness, assessment content, recommendations, projects, and saved-progress behavior.

## Licensing and attribution

Original source and educational materials in this repository are available under the MIT License; see [LICENSE](./LICENSE). Pyodide is a third-party runtime, pinned to version 0.27.7 and distributed under the Mozilla Public License 2.0; its license and bundled package attributions are available from the [Pyodide project](https://github.com/pyodide/pyodide/tree/0.27.7). The application uses system fonts and does not include third-party course text, stock images, paid content, or icon libraries. Pyodide's bundled packages remain subject to their individual licenses.

## Current scope

This is a runnable local learning academy, not the full multi-user production service described by the broad product brief. It does not yet include PostgreSQL/Django, registered accounts, cross-device sync, cloud administration/content management, a privileged hidden-test service, packaged CodeMirror/Monaco syntax highlighting or autocomplete, a production sandbox, or automated accessibility/performance certification. Do not deploy this static local app as a public service that claims those capabilities.

## Portfolio

Read more about this project on [Hamid Reza Bayat's portfolio](https://hamidbayat.co.uk/projects/python-path-academy).
