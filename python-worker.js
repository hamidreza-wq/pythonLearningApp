const PYODIDE_VERSION = "0.27.7";
let pyodidePromise;

function preparePyodide() {
  if (!pyodidePromise) {
    importScripts(`https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`);
    pyodidePromise = loadPyodide().then((pyodide) => {
      const denyNetwork = () => {
        throw new Error("Network access is disabled in this playground.");
      };
      self.fetch = denyNetwork;
      self.XMLHttpRequest = denyNetwork;
      self.WebSocket = denyNetwork;
      self.EventSource = denyNetwork;
      self.importScripts = denyNetwork;
      return pyodide;
    });
  }
  return pyodidePromise;
}

self.onmessage = async ({ data }) => {
  if (data.type === "init") {
    try {
      await preparePyodide();
      self.postMessage({ type: "ready" });
    } catch (error) {
      self.postMessage({ type: "error", message: `Python could not start: ${error.message}` });
    }
    return;
  }

  if (data.type !== "run") {
    return;
  }

  try {
    const pyodide = await preparePyodide();
    const source = JSON.stringify(data.code);
    const tests = JSON.stringify(data.tests ?? "");
    const inputs = JSON.stringify(data.inputs ?? []);
    const result = await pyodide.runPythonAsync(`
import builtins
import io
import sys
import traceback

_blocked_modules = {"js", "pyodide.http", "urllib", "urllib.request", "http.client", "socket", "requests", "subprocess", "multiprocessing"}
_original_import = builtins.__import__
_original_input = builtins.input

def _make_restricted_import(original_import, blocked_modules):
    def restricted_import(name, *args, **kwargs):
        if any(name == blocked or name.startswith(blocked + ".") for blocked in blocked_modules):
            raise ImportError(f"Import of {name!r} is disabled in this playground.")
        return original_import(name, *args, **kwargs)
    return restricted_import

builtins.__import__ = _make_restricted_import(_original_import, _blocked_modules)
sys.modules.pop("js", None)

class _LimitedOutput(io.StringIO):
    def write(self, text):
        if self.tell() + len(text) > 100000:
            raise RuntimeError("Output exceeded the 100,000-character limit.")
        return super().write(text)

_output = _LimitedOutput()
_inputs = iter(${inputs})
def _student_input(prompt=""):
    if prompt:
        print(prompt, end="")
    try:
        return next(_inputs)
    except StopIteration:
        raise EOFError("No more input values were supplied in the playground.")
_student_source = ${source}
_namespace = {"__name__": "__main__"}
_error = None
_passed = None
try:
    sys.stdout = _output
    sys.stdin = io.StringIO("\\n".join(${inputs}) + "\\n")
    builtins.input = _student_input
    exec(compile(_student_source, "<student-code>", "exec"), _namespace)
    if ${tests}:
        _namespace["namespace"] = _namespace
        _namespace["output"] = _output.getvalue()
        _namespace["source"] = _student_source
        exec(compile(${tests}, "<exercise-tests>", "exec"), _namespace)
        _passed = True
except AssertionError as error:
    _passed = False
    _error = str(error) or "One of the checks did not pass yet."
except Exception:
    _error = traceback.format_exc()
finally:
    sys.stdout = sys.__stdout__
    sys.stdin = sys.__stdin__
    builtins.input = _original_input
    builtins.__import__ = _original_import
{
    "output": _output.getvalue(),
    "error": _error,
    "passed": _passed,
}
    `);
    const response = result.toJs({ dict_converter: Object.fromEntries });
    result.destroy();
    self.postMessage({ type: "result", ...response });
  } catch (error) {
    self.postMessage({ type: "error", message: error.message });
  }
};
