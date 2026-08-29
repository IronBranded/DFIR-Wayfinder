/**
 * nav.js
 * ----------------------------------------------------------------------------
 * Builds the left sidebar tree (Levels -> Lessons, plus the Reference hub)
 * purely from content/manifest.json + Progress data. This is the piece that
 * makes the site "modular": add a lesson to the manifest and it appears in
 * the nav automatically — nothing in this file needs to change.
 * ----------------------------------------------------------------------------
 */
(function () {
  "use strict";

  const TIER_COLOR_VAR = {
    Novice: "var(--tier-novice)",
    Beginner: "var(--tier-beginner)",
    Intermediate: "var(--tier-intermediate)",
    Advanced: "var(--tier-advanced)",
  };

  function checkSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"/></svg>';
  }
  function chevronSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><polyline points="9 18 15 12 9 6"/></svg>';
  }

  function groupByModule(lessons) {
    const groups = [];
    lessons.forEach((lesson) => {
      const label = lesson.module || "";
      let group = groups.find((g) => g.label === label);
      if (!group) { group = { label, items: [] }; groups.push(group); }
      group.items.push(lesson);
    });
    return groups;
  }

  function slugify(str) {
    return String(str).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function lessonLinkHTML(lesson, currentRoute) {
    const soon = lesson.status !== "ready";
    const isActive = currentRoute && currentRoute.lessonId === lesson.id;
    const done = window.Progress ? window.Progress.isComplete(lesson.id) : false;
    return `<li>
      <a href="#/lesson/${lesson.id}" class="nav-lesson-link ${isActive ? "active" : ""} ${done ? "done" : ""} ${soon ? "soon" : ""}">
        <span class="nav-lesson-check">${done ? checkSvg() : ""}</span>
        <span>${lesson.title}</span>
      </a>
    </li>`;
  }

  function build(manifest, currentRoute) {
    const sidebar = document.getElementById("app-sidebar");
    if (!sidebar) return;

    const openLevelId = currentRoute && currentRoute.levelId ? currentRoute.levelId : (manifest.levels[0] && manifest.levels[0].id);

    let html = `<a href="#/" class="nav-home-link ${!currentRoute || currentRoute.name === "home" ? "active" : ""}">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></svg>
        Overview
      </a>`;

    html += `<div class="nav-section-label">Curriculum</div>`;

    manifest.levels.forEach((level) => {
      const isOpen = level.id === openLevelId;
      const tierColor = TIER_COLOR_VAR[level.difficulty] || "var(--text-tertiary)";

      const groups = groupByModule(level.lessons);
      const currentLessonInLevel =
        currentRoute && currentRoute.lessonId ? level.lessons.find((l) => l.id === currentRoute.lessonId) : null;
      const openModuleLabel = currentLessonInLevel
        ? currentLessonInLevel.module
        : currentRoute && currentRoute.name === "module" && currentRoute.levelId === level.id
          ? (groups.find((g) => slugify(g.label) === currentRoute.moduleSlug) || {}).label
          : null;

      html += `<div class="nav-level ${isOpen ? "open" : ""}" data-level="${level.id}">
        <button class="nav-level-head" type="button" data-toggle-level="${level.id}">
          <span class="nav-level-num" style="--tier-color:${tierColor}; color:${tierColor}; border-color:${tierColor}44;">${String(level.number).padStart(2, "0")}</span>
          <span class="nav-level-title">${level.title}</span>
          <span class="nav-level-chevron">${chevronSvg()}</span>
        </button>
        <div class="nav-level-progress-track"><div class="nav-level-progress-fill" style="--tier-color:${tierColor}; width:0%" data-level-progress-fill="${level.id}"></div></div>
        <ul class="nav-lessons">`;

      groups.forEach((group) => {
        if (!group.label || group.items.length === 1) {
          // No module, or a module with exactly one lesson -- a sub-accordion for one
          // item is pure friction, so these render as plain top-level lesson links
          // (same rule the main content area's module drill-down uses).
          group.items.forEach((lesson) => { html += lessonLinkHTML(lesson, currentRoute); });
          return;
        }
        const moduleOpen = group.label === openModuleLabel;
        html += `<li class="nav-module ${moduleOpen ? "open" : ""}">
          <button class="nav-module-head" type="button" data-toggle-module="${level.id}::${slugify(group.label)}">
            <span class="nav-module-title">${group.label}</span>
            <span class="nav-module-count">${group.items.length}</span>
            <span class="nav-module-chevron">${chevronSvg()}</span>
          </button>
          <ul class="nav-module-lessons">
            ${group.items.map((lesson) => lessonLinkHTML(lesson, currentRoute)).join("")}
          </ul>
        </li>`;
      });

      html += `</ul></div>`;
    });

    html += `<div class="nav-section-label">Reference</div>`;
    (manifest.reference || []).forEach((ref) => {
      const isActive = currentRoute && currentRoute.name === "reference" && currentRoute.refId === ref.id;
      html += `<a href="#/reference/${ref.id}" class="nav-reference-link ${isActive ? "active" : ""}">
        ${refIcon(ref.icon)}
        <span>${ref.title}</span>
      </a>`;
    });

    sidebar.innerHTML = html;

    // Wire up expand/collapse
    sidebar.querySelectorAll("[data-toggle-level]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const el = btn.closest(".nav-level");
        el.classList.toggle("open");
      });
    });
    sidebar.querySelectorAll("[data-toggle-module]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const el = btn.closest(".nav-module");
        el.classList.toggle("open");
      });
    });

    updateProgressFills(manifest);
  }

  function updateProgressFills(manifest) {
    if (!window.Progress) return;
    manifest.levels.forEach((level) => {
      const ready = level.lessons.filter((l) => l.status === "ready").map((l) => l.id);
      const done = window.Progress.countCompleted(ready);
      const pct = ready.length ? Math.round((done / ready.length) * 100) : 0;
      const fillEl = document.querySelector(`[data-level-progress-fill="${level.id}"]`);
      if (fillEl) fillEl.style.width = pct + "%";
    });
  }

  function refIcon(name) {
    const icons = {
      book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
      wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6 6 2 2 6-6a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2Z"/>',
      tag: '<path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .58 1.41l9.59 9.59a2 2 0 0 0 2.82 0l4.6-4.6a2 2 0 0 0 0-2.82Z"/><circle cx="7.5" cy="7.5" r="1"/>',
      award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/>',
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[name] || icons.book}</svg>`;
  }

  window.SidebarNav = { build, updateProgressFills };
})();
