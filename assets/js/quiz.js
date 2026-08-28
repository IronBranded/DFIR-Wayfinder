/**
 * quiz.js
 * ----------------------------------------------------------------------------
 * Renders a quiz JSON file (see content/levels for per-lesson .quiz.json
 * examples) into interactive single/multi-select questions with instant
 * feedback, then reports the score into Progress.
 * ----------------------------------------------------------------------------
 */
(function () {
  "use strict";

  function render(container, quizData, lessonId) {
    if (!quizData || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      container.innerHTML = "";
      return;
    }

    const state = quizData.questions.map(() => ({ answered: false }));

    const wrap = document.createElement("div");
    wrap.className = "quiz-block";
    wrap.innerHTML = `
      <div class="quiz-header">
        <h3>${svgCheck()} Knowledge check</h3>
        <span class="quiz-progress" data-quiz-progress>0 / ${quizData.questions.length} answered</span>
      </div>
      <div data-quiz-questions></div>
      <div class="quiz-footer">
        <span class="quiz-score" data-quiz-score></span>
        <button class="btn btn--ghost btn--sm" type="button" data-quiz-retry>Retry quiz</button>
      </div>
    `;
    container.innerHTML = "";
    container.appendChild(wrap);

    const qHost = wrap.querySelector("[data-quiz-questions]");

    quizData.questions.forEach((q, qi) => {
      const isMulti = q.type === "multi";
      const qEl = document.createElement("div");
      qEl.className = "quiz-question";
      qEl.innerHTML = `
        <p class="quiz-q-prompt" id="q-prompt-${qi}-${lessonId}"><span class="quiz-q-num">Q${qi + 1}</span>${escapeHtml(q.prompt)}</p>
        <div class="quiz-options" role="${isMulti ? "group" : "radiogroup"}" aria-labelledby="q-prompt-${qi}-${lessonId}">
          ${q.options
            .map(
              (opt, oi) => `
            <label class="quiz-option" data-opt="${oi}">
              <input type="${isMulti ? "checkbox" : "radio"}" name="q${qi}-${lessonId}" value="${oi}">
              <span>${escapeHtml(opt)}</span>
            </label>`
            )
            .join("")}
        </div>
        <div class="quiz-explain" data-explain aria-live="polite"></div>
      `;
      qHost.appendChild(qEl);

      const inputs = Array.from(qEl.querySelectorAll("input"));
      const explainEl = qEl.querySelector("[data-explain]");

      function handleAnswer() {
        if (state[qi].answered) return;
        const selected = inputs.filter((inp) => inp.checked).map((inp) => Number(inp.value));
        if (selected.length === 0) return;

        state[qi].answered = true;
        const correctSet = isMulti ? (q.correctIndices || []) : [q.correctIndex];
        const isCorrect =
          selected.length === correctSet.length && selected.every((s) => correctSet.includes(s));
        state[qi].correct = isCorrect;

        inputs.forEach((inp, oi) => {
          inp.disabled = true;
          const label = inp.closest(".quiz-option");
          label.classList.add("disabled");
          if (correctSet.includes(oi)) label.classList.add("correct");
          else if (selected.includes(oi)) label.classList.add("incorrect");
        });

        if (q.explanation) {
          explainEl.innerHTML = `<strong>${isCorrect ? "Correct." : "Not quite."}</strong> ${escapeHtml(q.explanation)}`;
          explainEl.classList.add("show");
        }

        updateFooter();
      }

      inputs.forEach((inp) => inp.addEventListener("change", handleAnswer));
    });

    function updateFooter() {
      const answered = state.filter((s) => s.answered).length;
      const correct = state.filter((s) => s.correct).length;
      wrap.querySelector("[data-quiz-progress]").textContent = `${answered} / ${state.length} answered`;
      const scoreEl = wrap.querySelector("[data-quiz-score]");
      if (answered === state.length) {
        scoreEl.innerHTML = `Score: <strong>${correct} / ${state.length}</strong>`;
        if (window.Progress) window.Progress.recordQuizScore(lessonId, correct, state.length);
        document.dispatchEvent(new CustomEvent("quiz:completed", { detail: { lessonId, correct, total: state.length } }));
      } else {
        scoreEl.textContent = "";
      }
    }

    wrap.querySelector("[data-quiz-retry]").addEventListener("click", () => render(container, quizData, lessonId));
  }

  function svgCheck() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  window.Quiz = { render };
})();
