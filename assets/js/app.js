/**
 * app.js
 * ----------------------------------------------------------------------------
 * The whole app shell: loads content/manifest.json once, then does
 * client-side hash routing (#/lesson/xyz, #/level/xyz, #/reference/xyz).
 * Hash routing is deliberate — GitHub Pages serves static files with no
 * server-side rewrites, and everything after "#" never touches the server,
 * so deep links and page refreshes just work with zero server config.
 *
 * This file only orchestrates. Rendering building-blocks (markdown, quiz,
 * nav, search, progress) each live in their own file — see /assets/js/.
 * ----------------------------------------------------------------------------
 */
(function () {
  "use strict";

  let MANIFEST = null;
  let FLAT_LESSONS = []; // flattened, ordered, for prev/next paging

  const ICONS = {
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    menu: '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    externalLink: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1Z"/><line x1="4" y1="22" x2="4" y2="15"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  };
  function icon(name, cls) {
    return `<svg class="${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ""}</svg>`;
  }

  async function fetchJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
    return res.json();
  }
  async function fetchText(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
    return res.text();
  }

  function flattenLessons(manifest) {
    const out = [];
    manifest.levels.forEach((level) => {
      level.lessons.forEach((lesson) => {
        out.push({ ...lesson, levelId: level.id, levelNumber: level.number, levelTitle: level.title, levelDifficulty: level.difficulty });
      });
    });
    return out;
  }

  function findLesson(lessonId) {
    return FLAT_LESSONS.find((l) => l.id === lessonId) || null;
  }
  function findLevel(levelId) {
    return MANIFEST.levels.find((lv) => lv.id === levelId) || null;
  }
  const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  function numberWord(n) {
    return NUMBER_WORDS[n] || String(n);
  }
  function slugify(str) {
    return String(str).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  /* Small status line used by the progress panel and by both restart paths.
     Falls back to the header when the home-page panel isn't on screen, so a
     restart triggered from a lesson page still confirms itself. */
  function flash(text) {
    const el = document.getElementById("progress-action-msg") || document.getElementById("header-flash");
    if (!el) return;
    el.textContent = text;
    setTimeout(() => { if (el.textContent === text) el.textContent = ""; }, 4000);
  }

  /* ---------------------------------------------------------------------- */
  /* Router                                                                  */
  /* ---------------------------------------------------------------------- */

  function parseRoute() {
    const hash = location.hash.replace(/^#\/?/, "");
    const parts = hash.split("/").filter(Boolean);
    if (parts.length === 0) return { name: "home" };
    if (parts[0] === "lesson" && parts[1]) {
      const lesson = findLesson(parts[1]);
      return { name: "lesson", lessonId: parts[1], levelId: lesson ? lesson.levelId : null };
    }
    if (parts[0] === "level" && parts[1] && parts[2] === "module" && parts[3]) {
      return { name: "module", levelId: parts[1], moduleSlug: parts[3] };
    }
    if (parts[0] === "level" && parts[1]) return { name: "level", levelId: parts[1] };
    if (parts[0] === "reference" && parts[1]) return { name: "reference", refId: parts[1] };
    if (parts[0] === "track" && parts[1]) return { name: "track", trackId: parts[1] };
    return { name: "home" };
  }

  async function router() {
    const route = parseRoute();
    const main = document.getElementById("app-main");
    main.classList.remove("page-enter");
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

    try {
      if (route.name === "home") await renderHome(main);
      else if (route.name === "level") await renderLevel(main, route.levelId);
      else if (route.name === "module") await renderModule(main, route.levelId, route.moduleSlug);
      else if (route.name === "lesson") await renderLesson(main, route.lessonId);
      else if (route.name === "reference") await renderReference(main, route.refId);
      else if (route.name === "track") await renderTrack(main, route.trackId);
    } catch (err) {
      main.innerHTML = `<div class="main-inner"><div class="coming-soon-panel">
        <h3>Something didn't load</h3>
        <p>${escapeHtml(err.message)}</p>
      </div></div>`;
      console.error(err);
    }

    void main.offsetWidth; // restart animation
    main.classList.add("page-enter");
    document.getElementById("sidebar-toggle-checkbox");
    document.body.classList.remove("nav-open");
    window.SidebarNav.build(MANIFEST, route);
    updateHeaderProgress();
  }

  /* ---------------------------------------------------------------------- */
  /* Page: Home                                                              */
  /* ---------------------------------------------------------------------- */

  async function renderHome(main) {
    const stats = window.Progress.overallStats(MANIFEST);
    main.innerHTML = `
      <div class="main-inner main-inner--wide">
        <section class="hero">
          <div>
            <div class="hero-eyebrow"><span class="pulse-dot"></span> Enterprise DFIR · novice to advanced</div>
            <h1>Learn to take apart <span class="accent">anything that runs on Windows</span> and figure out what it does.</h1>
            <p class="hero-lede">A free, self-paced curriculum built from SANS course material and posters, Microsoft internals/Cloud/MSTIC documentation, and 13cubed — restructured into hands-on levels you can actually finish.</p>
            <div class="hero-ctas">
              <a class="btn btn--primary" href="#/lesson/${MANIFEST.levels[0].lessons[0].id}">${icon("flag")} Start at Level 01</a>
              <a class="btn btn--ghost" href="#/reference/glossary">Browse reference hub</a>
            </div>
          </div>
          <div class="console-panel" aria-hidden="true">
            <div class="console-panel-head"><span class="console-dot console-dot--red"></span><span class="console-dot console-dot--amber"></span><span class="console-dot console-dot--green"></span><span style="margin-left:auto">triage_console.exe</span></div>
            <div class="console-body">
              <div class="console-row"><span class="k">sample</span><span class="v">sample_0xF3.bin</span></div>
              <div class="console-row"><span class="k">sha256</span><span class="v">9f2a…c771</span></div>
              <div class="console-row"><span class="k">file type</span><span class="v">PE32+ executable</span></div>
              <div class="console-row"><span class="k">entropy</span><span class="v">7.91 / 8.0</span></div>
              <div class="console-row"><span class="k">packed</span><span class="v">likely — high entropy .text</span></div>
              <div class="console-row"><span class="k">progress</span><span class="v">${stats.pct}% of academy complete</span></div>
              <div class="console-meter-track"><div class="console-meter-fill" style="width:${stats.pct}%"></div></div>
              <div class="console-verdict">${icon("target")} Your next objective is one click away in the sidebar.</div>
            </div>
          </div>
        </section>

        <div class="stat-grid">
          <div class="stat-tile"><div class="stat-tile-value">${stats.done}/${stats.total}</div><div class="stat-tile-label">Lessons complete</div></div>
          <div class="stat-tile"><div class="stat-tile-value">7</div><div class="stat-tile-label">Levels</div></div>
          <div class="stat-tile"><div class="stat-tile-value">${MANIFEST.levels.reduce((n, l) => n + l.lessons.length, 0)}</div><div class="stat-tile-label">Total lessons mapped</div></div>
          <div class="stat-tile"><div class="stat-tile-value">Windows</div><div class="stat-tile-label">Scope</div></div>
        </div>

        <div class="progress-actions">
          <span class="text-tertiary mono" style="font-size:var(--fs-xs)">Progress saves to this browser only —</span>
          <button class="btn btn--ghost btn--sm" id="export-progress-btn" type="button">${icon("download")} Export</button>
          <button class="btn btn--ghost btn--sm" id="import-progress-btn" type="button">${icon("upload")} Import</button>
          <input type="file" id="import-progress-input" accept="application/json" style="display:none">
          <button class="btn btn--ghost btn--sm" id="reset-progress-btn" type="button">${icon("refresh")} Reset</button>
          <span class="text-tertiary mono" id="progress-action-msg" style="font-size:var(--fs-xs)" role="status" aria-live="polite"></span>
        </div>

        <div class="section-head"><h2>Not sure where to start?</h2></div>
        <div class="path-grid">
          <a class="path-card" href="#/lesson/${MANIFEST.levels[0].lessons[0].id}">
            ${icon("flag")}
            <h4>I'm completely new</h4>
            <p>Start at Level 01. No security background assumed — you'll build your lab and run your first triage in the first sitting.</p>
          </a>
          <a class="path-card" href="#/level/02-windows-endpoint">
            ${icon("layers")}
            <h4>I know IT/dev basics</h4>
            <p>Skim Level 01, then move straight into execution evidence, filesystem artifacts, and process trees in Level 02.</p>
          </a>
          <a class="path-card" href="#/level/04-active-directory">
            ${icon("target")}
            <h4>I want specific skills</h4>
            <p>Jump straight to Active Directory compromise, PowerShell forensics and Defender internals, or the investigation playbooks in later levels.</p>
          </a>
          <a class="path-card" href="#/lesson/l8-16-certification-roadmap">
            ${icon("book")}
            <h4>I'm prepping for GCFE / GCFA</h4>
            <p>See how this curriculum maps to SANS GIAC certifications (GCFE, GCFA, GNFA, GCTI) so you can study with intent.</p>
          </a>
        </div>

        <div class="section-head"><h2>Curated tracks</h2><div class="sub">Shortcuts through the full curriculum toward one specific outcome</div></div>
        <div class="path-grid">
          ${(MANIFEST.tracks || [])
            .map((track) => {
              const lessons = track.lessonIds.map((id) => findLesson(id)).filter(Boolean);
              const done = lessons.filter((l) => window.Progress.isComplete(l.id)).length;
              return `<a class="path-card" href="#/track/${track.id}">
                ${icon(track.icon || "flag")}
                <h4>${track.title}</h4>
                <p>${track.description}</p>
                <span class="text-tertiary mono" style="font-size:var(--fs-2xs); display:block; margin-top:var(--sp-2)">${lessons.length} lessons · ~${track.estimatedHours}h${done > 0 ? ` · ${done}/${lessons.length} done` : ""}</span>
              </a>`;
            })
            .join("")}
        </div>

        <div class="section-head"><h2>The ${numberWord(MANIFEST.levels.length)} levels</h2></div>
        <div class="path-grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">
          ${MANIFEST.levels.map((level) => levelCardHTML(level)).join("")}
        </div>

        <div class="section-head"><h2>Reference hub</h2></div>
        <div class="path-grid">
          ${(MANIFEST.reference || [])
            .map(
              (ref) => `<a class="path-card" href="#/reference/${ref.id}">
                ${icon(ref.icon === "wrench" ? "layers" : ref.icon === "award" ? "flag" : "book")}
                <h4>${ref.title}</h4>
                <p>${ref.description}</p>
              </a>`
            )
            .join("")}
        </div>
      </div>
    `;


    document.getElementById("export-progress-btn").addEventListener("click", () => {
      window.Progress.downloadExport();
      flash("Downloaded.");
    });

    const importInput = document.getElementById("import-progress-input");
    document.getElementById("import-progress-btn").addEventListener("click", () => importInput.click());
    importInput.addEventListener("change", async () => {
      const file = importInput.files && importInput.files[0];
      importInput.value = ""; // allow re-selecting the same file next time
      if (!file) return;
      const result = await window.Progress.importFromFile(file);
      flash(result.ok ? "Progress imported." : result.error);
      if (result.ok) {
        window.SidebarNav.build(MANIFEST, parseRoute());
        updateHeaderProgress();
        router();
      }
    });

    // The header restart is available on every route; the panel button only exists
    // on the home page. Both run the same full reset.
    const headerRestart = document.getElementById("header-restart-btn");
    if (headerRestart) headerRestart.addEventListener("click", restartEverything);

    document.getElementById("reset-progress-btn").addEventListener("click", () => {
      restartEverything();
    });
  }

  function restartEverything() {
    const total = FLAT_LESSONS.length;
    if (!confirm(
      `Restart the whole academy?\n\nThis marks all ${total} lessons incomplete, clears every quiz score, ` +
      `and returns overall progress to 0%.\n\nIt can't be undone — export a backup first if you want to keep it.`
    )) return;
    window.Progress.resetAll();
    window.SidebarNav.build(MANIFEST, parseRoute());
    updateHeaderProgress();
    router();
    window.scrollTo({ top: 0, behavior: "smooth" });
    flash("Academy restarted — all lessons marked incomplete.");
  }

  function levelCardHTML(level) {
    const stats = window.Progress.overallStats(MANIFEST);
    const levelStats = stats.perLevel[level.id] || { total: level.lessons.length, done: 0 };
    const pct = levelStats.total ? Math.round((levelStats.done / levelStats.total) * 100) : 0;
    return `<a class="level-card" href="#/level/${level.id}" style="--tier-color:var(--tier-${level.difficulty.toLowerCase()})">
      <div class="level-card-top">
        <span class="level-card-num">LEVEL ${String(level.number).padStart(2, "0")}</span>
      </div>
      <h3>${level.title}</h3>
      <p>${level.tagline}</p>
      <div class="level-card-meta">
        <span>${level.lessons.length} lesson${level.lessons.length === 1 ? "" : "s"}</span>
        <span>${levelStats.done}/${levelStats.total} done</span>
      </div>
      <div class="level-card-progress-track"><div class="level-card-progress-fill" style="width:${pct}%"></div></div>
    </a>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Page: Level index                                                       */
  /* ---------------------------------------------------------------------- */

  async function renderLevel(main, levelId) {
    const level = findLevel(levelId);
    if (!level) return renderNotFound(main);

    const hasModules = level.lessons.some((l) => l.module) && new Set(level.lessons.map((l) => l.module)).size > 1;

    main.innerHTML = `
      <div class="main-inner">
        <div class="crumb"><a href="#/">Overview</a> ${icon("arrowRight", "")} <span>Level ${String(level.number).padStart(2, "0")}</span></div>
        <div class="eyebrow">Level ${String(level.number).padStart(2, "0")}</div>
        <h1>${level.title}</h1>
        <p class="hero-lede" style="margin-bottom:var(--sp-6)">${level.description}</p>
        ${hasModules ? renderModuleCards(level) : `<div style="display:flex; flex-direction:column; gap:var(--sp-3)">${level.lessons.map((lesson) => lessonCardHTML(lesson)).join("")}</div>`}
      </div>
    `;
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

  function renderModuleCards(level) {
    return `<div class="path-grid">${groupByModule(level.lessons)
      .map((g) => moduleCardHTML(level, g.label, g.items))
      .join("")}</div>`;
  }

  function moduleCardHTML(level, moduleLabel, lessons) {
    const done = lessons.filter((l) => window.Progress.isComplete(l.id)).length;
    const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
    const isSingleton = lessons.length === 1;
    const href = isSingleton ? `#/lesson/${lessons[0].id}` : `#/level/${level.id}/module/${slugify(moduleLabel)}`;
    const preview = isSingleton ? lessons[0].summary : lessons.slice(0, 3).map((l) => l.title).join(" · ") + (lessons.length > 3 ? ` + ${lessons.length - 3} more` : "");
    return `<a class="module-card" href="${href}" style="--tier-color:var(--tier-${level.difficulty.toLowerCase()})">
      <div class="module-card-top"><span class="module-card-num">${isSingleton ? "Lesson" : "Module"}</span></div>
      <h3>${moduleLabel}</h3>
      <p class="text-tertiary" style="font-size:var(--fs-sm); margin-bottom:var(--sp-4)">${escapeHtml(preview)}</p>
      <div class="module-card-meta">
        <span>${lessons.length} lesson${lessons.length === 1 ? "" : "s"}</span>
        <span>${done}/${lessons.length} done</span>
      </div>
      <div class="module-card-progress-track"><div class="module-card-progress-fill" style="width:${pct}%"></div></div>
    </a>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Page: Module drill-down (one module's lessons, reached from a level)    */
  /* ---------------------------------------------------------------------- */

  async function renderModule(main, levelId, moduleSlug) {
    const level = findLevel(levelId);
    if (!level) return renderNotFound(main);
    const lessons = level.lessons.filter((l) => l.module && slugify(l.module) === moduleSlug);
    if (!lessons.length) return renderNotFound(main);
    const moduleLabel = lessons[0].module;
    const done = lessons.filter((l) => window.Progress.isComplete(l.id)).length;

    main.innerHTML = `
      <div class="main-inner">
        <div class="crumb">
          <a href="#/">Overview</a> ${icon("arrowRight", "")}
          <a href="#/level/${level.id}">Level ${String(level.number).padStart(2, "0")} · ${level.title}</a> ${icon("arrowRight", "")}
          <span>${moduleLabel}</span>
        </div>
        <div class="eyebrow">Level ${String(level.number).padStart(2, "0")} · ${level.title}</div>
        <h1>${moduleLabel}</h1>
        <p class="hero-lede" style="margin-bottom:var(--sp-6)">${lessons.length} lesson${lessons.length === 1 ? "" : "s"} in this module · ${done}/${lessons.length} done</p>
        <div style="display:flex; flex-direction:column; gap:var(--sp-3)">
          ${lessons.map((lesson) => lessonCardHTML(lesson)).join("")}
        </div>
      </div>
    `;
  }

  /* ---------------------------------------------------------------------- */
  /* Page: Curated Track                                                     */
  /* A track is a named, ordered subset of lessons pulled from across the    */
  /* whole curriculum — for someone who doesn't need the full novice-to-     */
  /* advanced sequence and wants a direct line to one specific outcome.      */
  /* Tracks reference lessons purely by id, so they automatically stay in    */
  /* sync with lesson content edits and never duplicate any prose.           */
  /* ---------------------------------------------------------------------- */

  async function renderTrack(main, trackId) {
    const track = (MANIFEST.tracks || []).find((t) => t.id === trackId);
    if (!track) return renderNotFound(main);

    const lessons = track.lessonIds.map((id) => findLesson(id)).filter(Boolean);
    const doneCount = lessons.filter((l) => window.Progress.isComplete(l.id)).length;
    const firstNotDone = lessons.find((l) => !window.Progress.isComplete(l.id)) || lessons[0];

    main.innerHTML = `
      <div class="main-inner">
        <div class="crumb"><a href="#/">Overview</a> ${icon("arrowRight", "")} <span>Track</span></div>
        <div class="eyebrow">Curated track <span class="badge badge--neutral">${lessons.length} lessons</span></div>
        <h1>${track.title}</h1>
        <p class="hero-lede" style="margin-bottom:var(--sp-5)">${track.description}</p>
        <div class="progress-actions" style="margin-bottom:var(--sp-6)">
          <a class="btn btn--primary" href="#/lesson/${firstNotDone ? firstNotDone.id : lessons[0].id}">${icon("flag")} ${doneCount > 0 ? "Continue track" : "Start track"}</a>
          <span class="text-tertiary mono" style="font-size:var(--fs-xs)">${doneCount}/${lessons.length} complete · ${track.estimatedHours ? `~${track.estimatedHours}h total` : ""}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:var(--sp-3)">
          ${lessons
            .map((lesson, i) => lessonCardHTML(lesson, `Step ${i + 1} · Level ${String(lesson.levelNumber).padStart(2, "0")}`))
            .join("")}
        </div>
        <div class="callout callout--note" style="margin-top:var(--sp-6)">
          <div class="callout-title">Note</div>
          <p>Every lesson here also lives in its normal place in the full curriculum — this track is just a shortcut through it. Progress you make here counts the same either way.</p>
        </div>
      </div>
    `;
  }

  function lessonCardHTML(lesson, eyebrowOverride) {
    const soon = lesson.status !== "ready";
    const done = window.Progress.isComplete(lesson.id);
    return `<a class="lesson-card ${soon ? "is-soon" : ""} ${done ? "is-done" : ""}" href="${soon ? "#/lesson/" + lesson.id : "#/lesson/" + lesson.id}">
      <span class="lesson-card-check">${done ? icon("check") : ""}</span>
      <span class="lesson-card-body">
        <span class="lesson-card-eyebrow">${eyebrowOverride || lesson.module || ""}</span>
        <h4>${lesson.title}</h4>
        <span class="lesson-card-desc">${lesson.summary}</span>
      </span>
      <span class="lesson-card-meta">${soon ? '<span class="badge badge--soon">Coming soon</span>' : `${lesson.estimatedMinutes} min`}</span>
    </a>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Page: Lesson                                                            */
  /* ---------------------------------------------------------------------- */

  async function renderLesson(main, lessonId) {
    const lesson = findLesson(lessonId);
    if (!lesson) return renderNotFound(main);
    const level = findLevel(lesson.levelId);

    if (lesson.status !== "ready") {
      main.innerHTML = `
        <div class="main-inner">
          ${crumbHTML(level, lesson)}
          <div class="eyebrow">${lesson.module || ""}</div>
          <h1>${lesson.title}</h1>
          <div class="coming-soon-panel">
            ${icon("clock")}
            <h3>This lesson is being written</h3>
            <p>${lesson.summary}</p>
            ${lesson.objectives ? `<ul class="objectives-list" style="text-align:left; max-width:46ch; margin-inline:auto; margin-top:var(--sp-5)">${lesson.objectives.map((o) => `<li>${o}</li>`).join("")}</ul>` : ""}
          </div>
          ${pagerHTML(lesson)}
        </div>
      `;
      return;
    }

    const [markdown, quiz] = await Promise.all([
      fetchText(lesson.contentPath),
      lesson.quizPath ? fetchJSON(lesson.quizPath).catch(() => null) : Promise.resolve(null),
    ]);

    const bodyHTML = window.MDRender.toHTML(markdown);
    const done = window.Progress.isComplete(lesson.id);

    main.innerHTML = `
      <div class="main-inner">
        ${crumbHTML(level, lesson)}
        <div class="eyebrow">${lesson.module || ""}</div>
        <h1>${lesson.title}</h1>

        <div class="lesson-meta-panel">
          <div class="lesson-meta-item">
            <div class="lesson-meta-item-label">${icon("clock")} Time</div>
            <div>${lesson.estimatedMinutes} minutes</div>
          </div>
          <div class="lesson-meta-item">
            <div class="lesson-meta-item-label">${icon("target")} Objectives</div>
            <ul class="objectives-list">${(lesson.objectives || []).map((o) => `<li>${o}</li>`).join("")}</ul>
          </div>
        </div>

        <div class="content-body">${bodyHTML}</div>

        <div id="quiz-mount"></div>

        <div class="mark-complete-bar">
          <button class="btn ${done ? "btn--ghost" : "btn--primary"}" id="mark-complete-btn" type="button">
            ${icon("check")} <span>${done ? "Marked complete" : "Mark lesson complete"}</span>
          </button>
          <button class="btn btn--ghost" id="restart-lesson-btn" type="button"
            title="Clear this lesson's completion and quiz score">
            ${icon("refresh")} <span>Restart lesson</span>
          </button>
          <span class="text-tertiary mono" style="font-size:var(--fs-xs)">Progress saves to this browser only.</span>
        </div>

        ${pagerHTML(lesson)}
      </div>
    `;

    if (quiz) window.Quiz.render(document.getElementById("quiz-mount"), quiz, lesson.id);

    wireCodeCopyButtons(main);

    const btn = document.getElementById("mark-complete-btn");
    btn.addEventListener("click", () => {
      window.Progress.toggleComplete(lesson.id);
      const nowDone = window.Progress.isComplete(lesson.id);
      btn.className = "btn " + (nowDone ? "btn--ghost" : "btn--primary");
      btn.querySelector("span").textContent = nowDone ? "Marked complete" : "Mark lesson complete";
      window.SidebarNav.build(MANIFEST, parseRoute());
      updateHeaderProgress();
    });

    const restartBtn = document.getElementById("restart-lesson-btn");
    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        // Clears completion and the recorded quiz score, then re-renders the quiz
        // so the questions are answerable again from a clean state.
        window.Progress.resetLesson(lesson.id);
        btn.className = "btn btn--primary";
        btn.querySelector("span").textContent = "Mark lesson complete";
        const mount = document.getElementById("quiz-mount");
        if (mount && quiz) {
          mount.innerHTML = "";
          window.Quiz.render(mount, quiz, lesson.id);
        }
        window.SidebarNav.build(MANIFEST, parseRoute());
        updateHeaderProgress();
        window.scrollTo({ top: 0, behavior: "smooth" });
        flash("Lesson restarted.");
      });
    }
  }

  function crumbHTML(level, lesson) {
    if (!level) return "";
    const sameModuleCount = lesson.module ? level.lessons.filter((l) => l.module === lesson.module).length : 0;
    const moduleCrumb =
      sameModuleCount > 1
        ? `<a href="#/level/${level.id}/module/${slugify(lesson.module)}">${lesson.module}</a> ${icon("arrowRight")}`
        : "";
    return `<div class="crumb">
      <a href="#/">Overview</a> ${icon("arrowRight")}
      <a href="#/level/${level.id}">Level ${String(level.number).padStart(2, "0")} · ${level.title}</a> ${icon("arrowRight")}
      ${moduleCrumb}
      <span>${lesson.title}</span>
    </div>`;
  }

  function pagerHTML(lesson) {
    const idx = FLAT_LESSONS.findIndex((l) => l.id === lesson.id);
    const prev = idx > 0 ? FLAT_LESSONS[idx - 1] : null;
    const next = idx >= 0 && idx < FLAT_LESSONS.length - 1 ? FLAT_LESSONS[idx + 1] : null;
    return `<div class="lesson-pager">
      ${
        prev
          ? `<a class="pager-link prev" href="#/lesson/${prev.id}"><span class="pager-dir">${icon("arrowLeft")} Previous</span><span class="pager-title">${prev.title}</span></a>`
          : `<span></span>`
      }
      ${
        next
          ? `<a class="pager-link next" href="#/lesson/${next.id}"><span class="pager-dir">Next ${icon("arrowRight")}</span><span class="pager-title">${next.title}</span></a>`
          : `<span></span>`
      }
    </div>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Page: Reference                                                         */
  /* ---------------------------------------------------------------------- */

  async function renderReference(main, refId) {
    const ref = (MANIFEST.reference || []).find((r) => r.id === refId);
    if (!ref) return renderNotFound(main);

    if (ref.kind === "glossary") return renderGlossary(main, ref);
    if (ref.kind === "tools") return renderTools(main, ref);
    return renderMarkdownReference(main, ref);
  }

  async function renderMarkdownReference(main, ref) {
    const markdown = await fetchText(ref.contentPath);
    main.innerHTML = `
      <div class="main-inner">
        <div class="crumb"><a href="#/">Overview</a> ${icon("arrowRight")} <span>Reference</span></div>
        <div class="eyebrow">Reference</div>
        <h1>${ref.title}</h1>
        <div class="content-body">${window.MDRender.toHTML(markdown)}</div>
        ${ref.id === "macb-calculator" ? '<div id="macb-calculator-mount"></div>' : ""}
      </div>
    `;
    wireCodeCopyButtons(main);
    if (ref.id === "macb-calculator" && window.MACBCalculator) {
      window.MACBCalculator.mount(document.getElementById("macb-calculator-mount"));
    }
  }

  async function renderGlossary(main, ref) {
    const terms = await fetchJSON(ref.contentPath);
    const grouped = {};
    terms
      .sort((a, b) => a.term.localeCompare(b.term))
      .forEach((t) => {
        const letter = t.term[0].toUpperCase();
        grouped[letter] = grouped[letter] || [];
        grouped[letter].push(t);
      });

    main.innerHTML = `
      <div class="main-inner">
        <div class="crumb"><a href="#/">Overview</a> ${icon("arrowRight")} <span>Reference</span></div>
        <div class="eyebrow">Reference</div>
        <h1>${ref.title}</h1>
        <p class="hero-lede" style="margin-bottom:var(--sp-2)">${ref.description}</p>
        <div class="header-search" style="max-width:100%; margin:var(--sp-5) 0 var(--sp-7)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="glossary-filter" placeholder="Filter terms...">
        </div>
        <div id="glossary-list">
          ${Object.keys(grouped)
            .sort()
            .map(
              (letter) => `
            <div data-letter-group="${letter}">
              <div class="glossary-letter">${letter}</div>
              <dl class="glossary-term">
                ${grouped[letter].map((t) => `<div data-term-row><dt>${escapeHtml(t.term)}</dt><dd>${escapeHtml(t.definition)}</dd></div>`).join("")}
              </dl>
            </div>`
            )
            .join("")}
        </div>
      </div>
    `;

    document.getElementById("glossary-filter").addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      document.querySelectorAll("[data-term-row]").forEach((row) => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
      });
      document.querySelectorAll("[data-letter-group]").forEach((group) => {
        const anyVisible = Array.from(group.querySelectorAll("[data-term-row]")).some((r) => r.style.display !== "none");
        group.style.display = anyVisible ? "" : "none";
      });
    });
  }

  async function renderTools(main, ref) {
    const tools = await fetchJSON(ref.contentPath);
    const categories = [...new Set(tools.map((t) => t.category))];

    main.innerHTML = `
      <div class="main-inner main-inner--wide">
        <div class="crumb"><a href="#/">Overview</a> ${icon("arrowRight")} <span>Reference</span></div>
        <div class="eyebrow">Reference</div>
        <h1>${ref.title}</h1>
        <p class="hero-lede" style="margin-bottom:var(--sp-7)">${ref.description}</p>
        ${categories
          .map(
            (cat) => `
          <div class="section-head"><h2>${cat}</h2></div>
          <div class="tool-grid" style="margin-bottom:var(--sp-6)">
            ${tools
              .filter((t) => t.category === cat)
              .map(
                (t) => `<div class="tool-card">
                  <div class="tool-card-top"><h4>${escapeHtml(t.name)}</h4><span class="badge badge--neutral">${escapeHtml(t.platform)}</span></div>
                  <p>${escapeHtml(t.description)}</p>
                  <a class="tool-link" href="${t.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(t.url.replace(/^https?:\/\//, ""))} ${icon("externalLink")}</a>
                </div>`
              )
              .join("")}
          </div>`
          )
          .join("")}
      </div>
    `;
  }

  function renderNotFound(main) {
    main.innerHTML = `<div class="main-inner"><div class="coming-soon-panel">
      <h3>Page not found</h3>
      <p>That page doesn't exist. Head back to the <a href="#/">overview</a>.</p>
    </div></div>`;
  }

  /* ---------------------------------------------------------------------- */
  /* Shared helpers                                                          */
  /* ---------------------------------------------------------------------- */

  function wireCodeCopyButtons(scope) {
    scope.querySelectorAll("[data-copy-target]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.closest(".code-block").querySelector("code").textContent;
        navigator.clipboard?.writeText(code).then(() => {
          const label = btn.querySelector("span") || btn;
          const original = btn.innerHTML;
          btn.innerHTML = original.replace(/copy/i, "copied");
          setTimeout(() => (btn.innerHTML = original), 1400);
        });
      });
    });
  }

  function updateHeaderProgress() {
    const stats = window.Progress.overallStats(MANIFEST);
    const fillEl = document.querySelector(".header-progress-ring .fill");
    const labelEl = document.querySelector("[data-header-progress-label]");
    if (fillEl) {
      const r = 15;
      const circumference = 2 * Math.PI * r;
      fillEl.style.strokeDasharray = `${circumference}`;
      fillEl.style.strokeDashoffset = `${circumference * (1 - stats.pct / 100)}`;
    }
    if (labelEl) labelEl.innerHTML = `<strong>${stats.pct}%</strong>${stats.done}/${stats.total} lessons`;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* ---------------------------------------------------------------------- */
  /* Boot                                                                     */
  /* ---------------------------------------------------------------------- */

  async function init() {
    try {
      MANIFEST = await fetchJSON("content/manifest.json");
    } catch (err) {
      document.getElementById("app-main").innerHTML = `<div class="main-inner"><div class="coming-soon-panel">
        <h3>Couldn't load the curriculum</h3>
        <p>content/manifest.json failed to load (${escapeHtml(err.message)}). If you're viewing this from disk, run a local server (e.g. <code>python3 -m http.server</code>) instead of opening index.html directly — browsers block local JSON fetches from file:// URLs.</p>
      </div></div>`;
      return;
    }
    FLAT_LESSONS = flattenLessons(MANIFEST);

    document.getElementById("sidebar-toggle").addEventListener("click", () => document.body.classList.toggle("nav-open"));
    document.addEventListener("click", (e) => {
      if (document.body.classList.contains("nav-open") && e.target.closest("#app-sidebar") === null && e.target.closest("#sidebar-toggle") === null) {
        document.body.classList.remove("nav-open");
      }
    });

    window.SiteSearch.wire(MANIFEST);
    document.addEventListener("progress:changed", updateHeaderProgress);

    window.addEventListener("hashchange", router);
    await router();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
