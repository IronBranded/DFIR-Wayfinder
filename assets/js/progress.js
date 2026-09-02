/**
 * progress.js
 * ----------------------------------------------------------------------------
 * All learner progress lives in the browser's localStorage — there is no
 * backend. This keeps the academy a pure static site (GitHub Pages has no
 * server-side code) while still giving learners completion tracking, quiz
 * scores, and a progress dashboard. Nothing here ever leaves the device.
 * ----------------------------------------------------------------------------
 */
(function () {
  "use strict";

  const STORAGE_KEY = "maa:progress:v1";

  function read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { completedLessons: {}, quizScores: {} };
    } catch (e) {
      return { completedLessons: {}, quizScores: {} };
    }
  }

  function write(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* localStorage unavailable (private mode / disabled) — fail silently,
         the app still works, it just won't remember between visits. */
    }
    document.dispatchEvent(new CustomEvent("progress:changed"));
  }

  function isComplete(lessonId) {
    return !!read().completedLessons[lessonId];
  }

  function markComplete(lessonId) {
    const data = read();
    data.completedLessons[lessonId] = Date.now();
    write(data);
  }

  function markIncomplete(lessonId) {
    const data = read();
    delete data.completedLessons[lessonId];
    write(data);
  }

  function toggleComplete(lessonId) {
    isComplete(lessonId) ? markIncomplete(lessonId) : markComplete(lessonId);
  }

  function recordQuizScore(lessonId, correct, total) {
    const data = read();
    data.quizScores[lessonId] = { correct, total, at: Date.now() };
    // Passing a quiz (60%+) auto-marks the lesson complete — most learners
    // treat "passed the check" as "done," and this saves an extra click.
    if (total > 0 && correct / total >= 0.6) {
      data.completedLessons[lessonId] = data.completedLessons[lessonId] || Date.now();
    }
    write(data);
  }

  function getQuizScore(lessonId) {
    return read().quizScores[lessonId] || null;
  }

  function countCompleted(lessonIds) {
    const data = read();
    return lessonIds.filter((id) => data.completedLessons[id]).length;
  }

  function overallStats(manifest) {
    const data = read();
    let total = 0;
    let done = 0;
    const perLevel = {};
    (manifest.levels || []).forEach((level) => {
      const ready = level.lessons.filter((l) => l.status === "ready");
      const doneInLevel = ready.filter((l) => data.completedLessons[l.id]).length;
      perLevel[level.id] = { total: ready.length, done: doneInLevel };
      total += ready.length;
      done += doneInLevel;
    });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0, perLevel };
  }

  function clearQuizScore(lessonId) {
    const data = read();
    if (data.quizScores && lessonId in data.quizScores) {
      delete data.quizScores[lessonId];
      write(data);
    }
  }

  // Full per-lesson reset: clears completion AND the recorded quiz score, so the
  // lesson returns to the exact state it was in before the user ever opened it.
  function resetLesson(lessonId) {
    const data = read();
    if (data.completedLessons) delete data.completedLessons[lessonId];
    if (data.quizScores) delete data.quizScores[lessonId];
    write(data);
  }

  function resetAll() {
    write({ completedLessons: {}, quizScores: {} });
  }

  /* ---------------------------------------------------------------------
     Export / import — progress lives only in this browser's localStorage,
     so it doesn't follow a learner across devices or survive clearing site
     data. Export wraps the raw data in a small versioned envelope so a
     future schema change can still read old export files; import accepts
     either that envelope or a bare {completedLessons, quizScores} object
     for robustness.
     --------------------------------------------------------------------- */

  function exportData() {
    return {
      academyExport: true,
      version: 1,
      exportedAt: new Date().toISOString(),
      data: read(),
    };
  }

  function downloadExport() {
    const payload = JSON.stringify(exportData(), null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `dfir-academy-progress-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importData(jsonString) {
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      return { ok: false, error: "That file isn't valid JSON." };
    }
    const data = parsed && parsed.academyExport ? parsed.data : parsed;
    if (!data || typeof data !== "object" || typeof data.completedLessons !== "object") {
      return { ok: false, error: "That file doesn't look like a progress export from this academy." };
    }
    write({
      completedLessons: data.completedLessons || {},
      quizScores: data.quizScores || {},
    });
    return { ok: true };
  }

  function importFromFile(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(importData(String(reader.result)));
      reader.onerror = () => resolve({ ok: false, error: "Couldn't read that file." });
      reader.readAsText(file);
    });
  }

  window.Progress = {
    isComplete,
    markComplete,
    markIncomplete,
    toggleComplete,
    clearQuizScore,
    resetLesson,
    recordQuizScore,
    getQuizScore,
    countCompleted,
    overallStats,
    resetAll,
    exportData,
    downloadExport,
    importData,
    importFromFile,
  };
})();
