/**
 * search.js
 * ----------------------------------------------------------------------------
 * Lightweight, dependency-free search over lesson + reference titles,
 * summaries and tags from manifest.json. Intentionally scoped to metadata
 * (not full lesson body text) so it stays instant with zero network
 * round-trips beyond the manifest that's already loaded.
 * ----------------------------------------------------------------------------
 */
(function () {
  "use strict";

  let index = [];

  function buildIndex(manifest) {
    index = [];
    manifest.levels.forEach((level) => {
      level.lessons.forEach((lesson) => {
        index.push({
          type: "lesson",
          title: lesson.title,
          path: `Level ${level.number} · ${level.title}`,
          route: `#/lesson/${lesson.id}`,
          haystack: [lesson.title, lesson.summary, level.title, (lesson.tags || []).join(" ")].join(" ").toLowerCase(),
        });
      });
    });
    (manifest.reference || []).forEach((ref) => {
      index.push({
        type: "reference",
        title: ref.title,
        path: "Reference",
        route: `#/reference/${ref.id}`,
        haystack: [ref.title, ref.description].join(" ").toLowerCase(),
      });
    });
  }

  function query(q) {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    return index.filter((item) => item.haystack.includes(term)).slice(0, 8);
  }

  function wire(manifest) {
    buildIndex(manifest);
    const input = document.getElementById("global-search");
    const results = document.getElementById("search-results");
    if (!input || !results) return;

    function renderResults(list) {
      if (list.length === 0) {
        results.innerHTML = `<div class="sr-empty">No matches. Try a different term.</div>`;
      } else {
        results.innerHTML = list
          .map(
            (item) => `<a href="${item.route}">
              <div class="sr-title">${escapeHtml(item.title)}</div>
              <div class="sr-path">${escapeHtml(item.path)}</div>
            </a>`
          )
          .join("");
      }
      results.classList.add("open");
      input.setAttribute("aria-expanded", "true");
    }

    function closeResults() {
      results.classList.remove("open");
      input.setAttribute("aria-expanded", "false");
    }

    input.addEventListener("input", () => {
      const q = input.value;
      if (q.trim().length < 2) {
        closeResults();
        return;
      }
      renderResults(query(q));
    });

    input.addEventListener("focus", () => {
      if (input.value.trim().length >= 2) renderResults(query(input.value));
    });

    document.addEventListener("click", (e) => {
      if (!results.contains(e.target) && e.target !== input) {
        closeResults();
      }
    });

    results.addEventListener("click", () => {
      closeResults();
      input.value = "";
    });
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  window.SiteSearch = { wire, query };
})();
