/* learn_with_cu engagement layer.
   Progressive enhancement on top of app.js: animations (Motion), progress tracking,
   flashcard practice mode, quick search, and celebrations. No build step required. */
(() => {
  "use strict";
  if (typeof interviewTopics === "undefined") return;

  const M = window.Motion || null;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionOn = Boolean(M) && !reduce;
  const EASE = [0.22, 1, 0.36, 1];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const make = (tag, className, html) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  };
  const clearInline = (node, props = ["opacity", "transform", "filter", "height", "overflow"]) => props.forEach((prop) => node.style.removeProperty(prop));
  const after = (animation, callback) => {
    if (!animation) { callback(); return; }
    const promise = animation.finished || animation;
    if (promise && typeof promise.then === "function") promise.then(callback, callback);
    else callback();
  };
  const play = (target, keyframes, options) => (motionOn ? M.animate(target, keyframes, options) : null);
  const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

  /* ---------- Progress store ---------- */
  const STORE_KEY = "learn_with_cu.progress.v1";
  const defaults = () => ({ learned: {}, saved: {}, lessons: {}, last: null, streak: { count: 0, best: 0, day: "" } });
  let state = defaults();
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (raw && typeof raw === "object") state = { ...defaults(), ...raw, streak: { ...defaults().streak, ...(raw.streak || {}) } };
  } catch (error) { /* storage unavailable or corrupt: start fresh */ }
  let storageWarned = false;
  const save = () => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch (error) {
      if (!storageWarned) { storageWarned = true; setTimeout(() => toast("Progress can't be saved in this browser.", "⚠️"), 400); }
    }
  };

  const hashString = (text) => {
    let value = 5381;
    for (let i = 0; i < text.length; i++) value = ((value << 5) + value + text.charCodeAt(i)) | 0;
    return (value >>> 0).toString(36);
  };
  const all = [];
  const byId = new Map();
  interviewTopics.forEach((topic) => topic.questions.forEach((question, index) => {
    let id = hashString(`${topic.id}|${question.question}`);
    if (byId.has(id)) id = `${id}${index}`;
    const record = { topic, q: question, index, id };
    byId.set(id, record);
    all.push(record);
  }));
  const recordsOf = (topic) => all.filter((record) => record.topic === topic);
  const isLearned = (id) => Boolean(state.learned[id]);
  const isSaved = (id) => Boolean(state.saved[id]);
  const learnedIn = (topic) => recordsOf(topic).filter((record) => isLearned(record.id)).length;
  const emojiOf = (topic) => (typeof navEmojis !== "undefined" && navEmojis[topic.id]) || "📘";

  const dayKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const todayKey = dayKey(new Date());
  if (state.streak.day !== todayKey) {
    const yesterday = dayKey(new Date(Date.now() - 864e5));
    state.streak.count = state.streak.day === yesterday ? state.streak.count + 1 : 1;
    state.streak.best = Math.max(state.streak.best, state.streak.count);
    state.streak.day = todayKey;
    save();
  }

  const listeners = [];
  function setLearned(record, value) {
    if (value) state.learned[record.id] = Date.now(); else delete state.learned[record.id];
    save();
    listeners.forEach((fn) => fn(record));
  }
  function setSaved(record, value) {
    if (value) state.saved[record.id] = true; else delete state.saved[record.id];
    save();
    listeners.forEach((fn) => fn(record));
  }

  /* ---------- Shared UI: toast, confetti, expand/collapse ---------- */
  const toastHost = make("div", "toast-host");
  toastHost.setAttribute("role", "status");
  toastHost.setAttribute("aria-live", "polite");
  document.body.append(toastHost);
  function toast(message, glyph = "✨") {
    const node = make("div", "toast", `<span aria-hidden="true">${glyph}</span><span>${escapeHtml(message)}</span>`);
    toastHost.append(node);
    while (toastHost.children.length > 3) toastHost.firstElementChild.remove();
    play(node, { opacity: [0, 1], transform: ["translateY(14px) scale(.96)", "translateY(0px) scale(1)"] }, { duration: 0.35, ease: EASE });
    setTimeout(() => {
      const out = play(node, { opacity: [1, 0], transform: ["translateY(0px)", "translateY(8px)"] }, { duration: 0.25 });
      after(out, () => node.remove());
    }, 2600);
  }

  const CONFETTI_COLORS = ["#856124", "#cb9f52", "#d1cdca", "#e8a92a", "#f6c85f", "#7fd1ae"];
  let confettiCanvas = null;
  let confettiParticles = [];
  let confettiFrame = 0;
  function confettiTick() {
    const ctx = confettiCanvas.getContext("2d");
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    confettiParticles = confettiParticles.filter((p) => p.life < p.max);
    confettiParticles.forEach((p) => {
      p.vy += 0.28; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.max);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (confettiParticles.length) confettiFrame = requestAnimationFrame(confettiTick);
    else { confettiFrame = 0; confettiCanvas.remove(); confettiCanvas = null; }
  }
  function burst(x, y, count = 80, power = 1) {
    if (reduce) return;
    if (!confettiCanvas) {
      confettiCanvas = make("canvas", "confetti-canvas");
      confettiCanvas.setAttribute("aria-hidden", "true");
      document.body.append(confettiCanvas);
    }
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    confettiCanvas.width = innerWidth * ratio;
    confettiCanvas.height = innerHeight * ratio;
    confettiCanvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (3 + Math.random() * 7) * power;
      confettiParticles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 4 * power, w: 5 + Math.random() * 5, h: 3 + Math.random() * 4, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, color: CONFETTI_COLORS[i % CONFETTI_COLORS.length], life: 0, max: 70 + Math.random() * 50 });
    }
    if (!confettiFrame) confettiFrame = requestAnimationFrame(confettiTick);
  }
  const burstFrom = (node, count = 26, power = 0.7) => {
    const rect = node.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, count, power);
  };
  const celebrate = () => { burst(innerWidth * 0.3, innerHeight * 0.4, 90); burst(innerWidth * 0.7, innerHeight * 0.4, 90); };

  function expand(node) {
    node.hidden = false;
    if (!motionOn) return;
    const height = node.scrollHeight;
    node.style.overflow = "hidden";
    after(M.animate(node, { height: ["0px", `${height}px`], opacity: [0, 1] }, { duration: 0.35, ease: EASE }), () => clearInline(node));
  }
  function collapse(node, done) {
    if (!motionOn) { node.hidden = true; if (done) done(); return; }
    const height = node.offsetHeight;
    node.style.overflow = "hidden";
    after(M.animate(node, { height: [`${height}px`, "0px"], opacity: [1, 0] }, { duration: 0.22, ease: "easeInOut" }), () => { node.hidden = true; clearInline(node); if (done) done(); });
  }

  function revealOnScroll(targets, options = {}) {
    if (!motionOn || !targets.length) return;
    const { perRow = 3, distance = 22 } = options;
    M.inView(targets, (element) => {
      const index = targets.indexOf(element);
      const delay = Math.min(index % perRow, 5) * 0.07;
      after(M.animate(element, { opacity: [0, 1], transform: [`translateY(${distance}px)`, "translateY(0px)"] }, { duration: 0.6, delay, ease: EASE }), () => clearInline(element));
    }, { margin: "0px 0px -6% 0px" });
  }

  function countUp(node, target, duration = 1100) {
    if (reduce || !target) { node.textContent = String(target); return; }
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      node.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const plainSnippet = (text, max = 230) => {
    const lines = text.split("\n").map((line) => line.trim()).filter((line) => line && !/^(```|\||!\[|#{1,6}\s|-{3,}$)/.test(line));
    let out = "";
    for (const line of lines) {
      out += (out ? " " : "") + line.replace(/^(\u2022|[-*]|\d+\.)\s+/, "").replace(/\*\*/g, "").replace(/`/g, "");
      if (out.length >= max) break;
    }
    return out.length > max ? `${out.slice(0, max).replace(/\s+\S*$/, "")}…` : out;
  };
  const sample = (array, count) => {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
    return copy.slice(0, count);
  };
  const shuffled = (array) => sample(array, array.length);
  const answerHtml = (record) => {
    if (!record.q.answer) return `<p class="pm-empty">There is no written answer for this one yet. Answer it out loud, then mark it learned when you feel confident.</p>`;
    return record.topic.answerFormat === "markdown"
      ? `<div class="md-answer">${renderMarkdown(record.q.answer)}</div>`
      : `<p class="pm-plain">${escapeHtml(record.q.answer)}</p>`;
  };

  /* ---------- Overlay plumbing (focus trap, scroll lock) ---------- */
  let activeOverlay = null;
  function openOverlay(root, opener) {
    activeOverlay = { root, opener };
    root.hidden = false;
    document.body.classList.add("no-scroll");
    play(root, { opacity: [0, 1] }, { duration: 0.2 });
    const shell = $(".overlay-shell", root);
    if (shell) play(shell, { opacity: [0, 1], transform: ["translateY(18px) scale(.97)", "translateY(0px) scale(1)"] }, { duration: 0.35, ease: EASE });
  }
  function closeOverlay() {
    if (!activeOverlay) return;
    const { root, opener } = activeOverlay;
    activeOverlay = null;
    const out = play(root, { opacity: [1, 0] }, { duration: 0.16 });
    after(out, () => { root.hidden = true; clearInline(root); });
    document.body.classList.remove("no-scroll");
    if (opener && typeof opener.focus === "function") opener.focus();
  }
  document.addEventListener("keydown", (event) => {
    if (!activeOverlay || event.key !== "Tab") return;
    const focusable = $$("button:not([disabled]):not([hidden]), a[href], input, [tabindex]:not([tabindex='-1'])", activeOverlay.root).filter((node) => node.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  /* ---------- Practice mode (flashcards) ---------- */
  let practice = null;
  function buildPractice() {
    const root = make("div", "overlay pm-overlay");
    root.hidden = true;
    root.innerHTML = `
      <div class="overlay-shell pm-shell" role="dialog" aria-modal="true" aria-labelledby="pm-title">
        <div class="pm-head">
          <div><p class="pm-kicker" id="pm-title">Practice mode</p><p class="pm-sub"></p></div>
          <div class="pm-controls">
            <div class="pm-pools" role="group" aria-label="Question pool"></div>
            <label class="pm-toggle"><input type="checkbox" class="pm-shuffle" checked> Shuffle</label>
            <button class="pm-close" type="button" aria-label="Close practice mode">&times;</button>
          </div>
        </div>
        <div class="pm-progress" aria-hidden="true"><span class="pm-fill"></span></div>
        <div class="pm-stage" aria-live="polite">
          <article class="pm-card">
            <p class="pm-meta"></p>
            <h2 class="pm-question"></h2>
            <div class="pm-answer" hidden><div class="pm-answer-in"></div></div>
          </article>
          <div class="pm-done" hidden>
            <p class="pm-done-emoji" aria-hidden="true">🎉</p>
            <h2>Round complete</h2>
            <p class="pm-done-text"></p>
            <div class="pm-done-actions"><button class="button button-primary pm-again-round" type="button">Practice again</button><button class="button button-secondary pm-finish" type="button">Close</button></div>
          </div>
        </div>
        <div class="pm-actions">
          <button class="button button-secondary pm-prev" type="button">&larr; Prev</button>
          <button class="button button-primary pm-reveal" type="button">Reveal answer</button>
          <span class="pm-rate" hidden>
            <button class="button button-secondary pm-again" type="button">&#8635; Review again</button>
            <button class="button button-primary pm-got" type="button">&#10003; Got it</button>
          </span>
          <button class="button button-secondary pm-skip" type="button">Skip &rarr;</button>
        </div>
        <p class="pm-hint"><kbd>Space</kbd> reveal &middot; <kbd>&larr;</kbd> <kbd>&rarr;</kbd> move &middot; <kbd>L</kbd> got it &middot; <kbd>R</kbd> review again &middot; <kbd>S</kbd> save &middot; <kbd>Esc</kbd> close</p>
      </div>`;
    document.body.append(root);
    const ui = {
      root, sub: $(".pm-sub", root), pools: $(".pm-pools", root), shuffle: $(".pm-shuffle", root), fill: $(".pm-fill", root),
      card: $(".pm-card", root), meta: $(".pm-meta", root), question: $(".pm-question", root), answer: $(".pm-answer", root), answerIn: $(".pm-answer-in", root),
      done: $(".pm-done", root), doneText: $(".pm-done-text", root), actions: $(".pm-actions", root), hint: $(".pm-hint", root),
      reveal: $(".pm-reveal", root), rate: $(".pm-rate", root), prev: $(".pm-prev", root), skip: $(".pm-skip", root), again: $(".pm-again", root), got: $(".pm-got", root),
    };
    const session = { pools: {}, poolKey: "", queue: [], pos: 0, total: 0, done: 0, revealed: false, learnedNow: 0, again: 0 };

    const current = () => session.queue[session.pos];
    const paintProgress = () => {
      ui.sub.textContent = `${session.done} done · ${session.queue.length} left`;
      ui.fill.style.transform = `scaleX(${session.total ? session.done / session.total : 0})`;
    };
    function showCard(direction = 1) {
      const record = current();
      session.revealed = false;
      ui.card.hidden = false; ui.done.hidden = true; ui.actions.hidden = false; ui.hint.hidden = false;
      ui.meta.innerHTML = `${emojiOf(record.topic)} ${escapeHtml(record.topic.name)}${record.q.section ? ` &middot; ${escapeHtml(record.q.section)}` : ""}${isSaved(record.id) ? ' &middot; <span class="pm-saved">★ Saved</span>' : ""}`;
      ui.question.textContent = record.q.question;
      ui.answer.hidden = true; clearInline(ui.answer);
      ui.answerIn.innerHTML = "";
      ui.reveal.hidden = false; ui.rate.hidden = true;
      ui.prev.disabled = ui.skip.disabled = session.queue.length < 2;
      paintProgress();
      play(ui.card, { opacity: [0, 1], transform: [`translateX(${direction * 36}px)`, "translateX(0px)"] }, { duration: 0.35, ease: EASE });
      ui.reveal.focus({ preventScroll: true });
    }
    function reveal() {
      if (session.revealed || !current()) return;
      session.revealed = true;
      ui.answerIn.innerHTML = answerHtml(current());
      expand(ui.answer);
      ui.reveal.hidden = true; ui.rate.hidden = false;
      ui.got.focus({ preventScroll: true });
    }
    function finish() {
      ui.card.hidden = true; ui.actions.hidden = true; ui.hint.hidden = true; ui.done.hidden = false;
      ui.doneText.textContent = session.learnedNow
        ? `You marked ${plural(session.learnedNow, "question")} as learned${session.again ? ` and flagged ${session.again} to review again` : ""}. Nice work.`
        : "You went through the whole set. Come back tomorrow to keep your streak going.";
      ui.fill.style.transform = "scaleX(1)";
      ui.sub.textContent = "All done";
      play(ui.done, { opacity: [0, 1], transform: ["translateY(14px)", "translateY(0px)"] }, { duration: 0.45, ease: EASE });
      if (session.learnedNow) celebrate();
      $(".pm-again-round", ui.root).focus({ preventScroll: true });
    }
    function startRound() {
      const pool = session.pools[session.poolKey];
      let list = pool.get();
      if (!list.length && session.poolKey !== "all" && session.pools.all) { list = session.pools.all.get(); toast("Nothing left in that pool — showing everything instead.", "ℹ️"); }
      session.queue = ui.shuffle.checked ? shuffled(list) : list.slice();
      session.pos = 0; session.total = session.queue.length; session.done = 0; session.learnedNow = 0; session.again = 0;
      if (!session.queue.length) { toast("There are no questions to practice here yet.", "ℹ️"); return; }
      showCard(1);
    }
    function paintPools() {
      const keys = Object.keys(session.pools);
      ui.pools.hidden = keys.length < 2;
      ui.pools.innerHTML = keys.map((key) => `<button type="button" class="pm-pool${key === session.poolKey ? " is-active" : ""}" data-pool="${key}" aria-pressed="${key === session.poolKey}">${escapeHtml(session.pools[key].label)} <span>${session.pools[key].get().length}</span></button>`).join("");
    }
    function markGot() {
      const record = current();
      if (!record || !session.revealed) return;
      if (!isLearned(record.id)) { setLearned(record, true); session.learnedNow++; }
      burstFrom(ui.got, 22, 0.6);
      session.queue.splice(session.pos, 1);
      session.done++;
      if (!session.queue.length) { paintProgress(); finish(); return; }
      if (session.pos >= session.queue.length) session.pos = 0;
      showCard(1);
    }
    function markAgain() {
      if (!current() || !session.revealed) return;
      session.queue.push(session.queue.splice(session.pos, 1)[0]);
      session.again++;
      if (session.pos >= session.queue.length) session.pos = 0;
      showCard(1);
    }
    const move = (step) => {
      if (session.queue.length < 2) return;
      session.pos = (session.pos + step + session.queue.length) % session.queue.length;
      showCard(step);
    };

    ui.reveal.addEventListener("click", reveal);
    ui.got.addEventListener("click", markGot);
    ui.again.addEventListener("click", markAgain);
    ui.prev.addEventListener("click", () => move(-1));
    ui.skip.addEventListener("click", () => move(1));
    $(".pm-close", root).addEventListener("click", closeOverlay);
    $(".pm-finish", root).addEventListener("click", closeOverlay);
    $(".pm-again-round", root).addEventListener("click", () => { paintPools(); startRound(); });
    ui.shuffle.addEventListener("change", () => startRound());
    ui.pools.addEventListener("click", (event) => {
      const button = event.target.closest(".pm-pool");
      if (!button) return;
      session.poolKey = button.dataset.pool;
      paintPools(); startRound();
    });
    root.addEventListener("mousedown", (event) => { if (event.target === root) closeOverlay(); });
    document.addEventListener("keydown", (event) => {
      if (!activeOverlay || activeOverlay.root !== root) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Escape") { event.preventDefault(); closeOverlay(); return; }
      if (ui.done.hidden === false) return;
      const onControl = event.target.closest && event.target.closest("button, a, input, label");
      const key = event.key.toLowerCase();
      if ((key === " " || key === "enter") && !onControl) { event.preventDefault(); if (!session.revealed) reveal(); else markGot(); }
      else if (key === "arrowright") { event.preventDefault(); move(1); }
      else if (key === "arrowleft") { event.preventDefault(); move(-1); }
      else if (key === "l") { if (!session.revealed) reveal(); else markGot(); }
      else if (key === "r") markAgain();
      else if (key === "s" && current()) { const record = current(); setSaved(record, !isSaved(record.id)); showSavedState(); }
    });
    const showSavedState = () => {
      const record = current();
      if (!record) return;
      toast(isSaved(record.id) ? "Saved for later" : "Removed from saved", isSaved(record.id) ? "⭐" : "☆");
      ui.meta.innerHTML = ui.meta.innerHTML.replace(/ &middot; <span class="pm-saved">.*?<\/span>/, "") + (isSaved(record.id) ? ' &middot; <span class="pm-saved">★ Saved</span>' : "");
    };

    return {
      open(config) {
        session.pools = config.pools;
        session.poolKey = config.start || Object.keys(config.pools)[0];
        $(".pm-kicker", root).textContent = config.title || "Practice mode";
        paintPools();
        openOverlay(root, config.opener);
        startRound();
      },
    };
  }
  const openPractice = (config) => {
    if (!practice) practice = buildPractice();
    practice.open(config);
  };
  const mixedPractice = (opener) => {
    const answered = all.filter((record) => record.q.answer);
    openPractice({
      title: "Mixed practice",
      opener,
      pools: {
        mixed: { label: "Mixed set", get: () => sample(answered.filter((record) => !isLearned(record.id)).length >= 10 ? answered.filter((record) => !isLearned(record.id)) : answered, 12) },
      },
    });
  };

  /* ---------- Quick search palette (Ctrl/Cmd + K or /) ---------- */
  let palette = null;
  const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const highlight = (text, terms) => {
    if (!terms.length) return escapeHtml(text);
    const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
    return text.split(pattern).map((part, i) => (i % 2 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part))).join("");
  };
  function buildPalette() {
    const root = make("div", "overlay qs-overlay");
    root.hidden = true;
    root.innerHTML = `
      <div class="overlay-shell qs-shell" role="dialog" aria-modal="true" aria-label="Search all questions">
        <div class="qs-input-row">${icon("search")}<input class="qs-input" type="search" placeholder="Search every question and topic..." autocomplete="off" aria-label="Search every question and topic"><kbd>Esc</kbd></div>
        <ul class="qs-results" role="listbox"></ul>
        <p class="qs-foot"><kbd>&uarr;</kbd> <kbd>&darr;</kbd> to move &middot; <kbd>Enter</kbd> to open</p>
      </div>`;
    document.body.append(root);
    const input = $(".qs-input", root);
    const results = $(".qs-results", root);
    let rows = [];
    let active = 0;
    let prepared = false;
    const prepare = () => {
      if (prepared) return;
      all.forEach((record) => { record.lc = record.q.question.toLowerCase(); record.al = (record.q.answer || "").toLowerCase(); });
      prepared = true;
    };
    const setActive = (index) => {
      active = Math.max(0, Math.min(index, rows.length - 1));
      $$(".qs-row", results).forEach((row, i) => { row.classList.toggle("is-active", i === active); row.setAttribute("aria-selected", String(i === active)); });
      const row = $$(".qs-row", results)[active];
      if (row) row.scrollIntoView({ block: "nearest" });
    };
    const rowHtml = (row, terms) => `<li role="option" class="qs-row" data-href="${row.href}" aria-selected="false"><span class="qs-emoji" aria-hidden="true">${row.emoji}</span><span class="qs-text"><span class="qs-title">${highlight(row.title, terms)}</span><span class="qs-sub">${escapeHtml(row.sub)}</span></span><span class="qs-go" aria-hidden="true">&rarr;</span></li>`;
    function render(query) {
      prepare();
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      rows = [];
      if (!terms.length) {
        const last = state.last && byId.get(state.last.id);
        if (last) rows.push({ emoji: "▶️", title: last.q.question, sub: `Continue where you left off · ${last.topic.name}`, href: `${last.topic.id}.html#q-${last.id}` });
        rows.push({ emoji: "⚡", title: "Start mixed practice", sub: "12 flashcards from across every topic", action: "mixed" });
        interviewTopics.forEach((topic) => rows.push({ emoji: emojiOf(topic), title: topic.name, sub: `${plural(topic.questions.length, "question")} · ${learnedIn(topic)} learned`, href: `${topic.id}.html` }));
      } else {
        interviewTopics.filter((topic) => terms.every((word) => topic.name.toLowerCase().includes(word))).forEach((topic) => rows.push({ emoji: emojiOf(topic), title: topic.name, sub: `Topic · ${plural(topic.questions.length, "question")}`, href: `${topic.id}.html` }));
        interviewTopics.forEach((topic) => (topic.concepts || []).filter((concept) => terms.every((word) => concept.title.toLowerCase().includes(word))).forEach((concept) => rows.push({ emoji: "📘", title: concept.title, sub: `${topic.name} · Quick concept`, href: `${topic.id}.html#concept-${slugify(concept.title)}` })));
        const questionHits = all.filter((record) => terms.every((word) => record.lc.includes(word))).sort((a, b) => a.lc.indexOf(terms[0]) - b.lc.indexOf(terms[0])).slice(0, 40);
        questionHits.forEach((record) => rows.push({ emoji: emojiOf(record.topic), title: record.q.question, sub: `${record.topic.name}${isLearned(record.id) ? " · ✓ learned" : ""}`, href: `${record.topic.id}.html#q-${record.id}` }));
        if (questionHits.length < 12) {
          let extra = 0;
          for (const record of all) {
            if (extra >= 12) break;
            if (record.al && terms.every((word) => record.al.includes(word)) && !terms.every((word) => record.lc.includes(word))) { rows.push({ emoji: emojiOf(record.topic), title: record.q.question, sub: `${record.topic.name} · match inside the answer`, href: `${record.topic.id}.html#q-${record.id}` }); extra++; }
          }
        }
      }
      results.innerHTML = rows.length ? rows.map((row) => rowHtml(row, terms)).join("") : `<li class="qs-empty">No matches. Try fewer or different words.</li>`;
      $$(".qs-row", results).forEach((node, i) => { node.dataset.index = String(i); });
      setActive(0);
    }
    const choose = (index) => {
      const row = rows[index];
      if (!row) return;
      closeOverlay();
      if (row.action === "mixed") { mixedPractice(); return; }
      const target = new URL(row.href, location.href);
      if (target.pathname === location.pathname && target.hash) { location.hash = target.hash; if (window.__openFromHash) setTimeout(window.__openFromHash, 0); }
      else location.href = row.href;
    };
    input.addEventListener("input", () => render(input.value));
    results.addEventListener("click", (event) => { const row = event.target.closest(".qs-row"); if (row) choose(Number(row.dataset.index)); });
    results.addEventListener("mousemove", (event) => { const row = event.target.closest(".qs-row"); if (row && Number(row.dataset.index) !== active) setActive(Number(row.dataset.index)); });
    root.addEventListener("mousedown", (event) => { if (event.target === root) closeOverlay(); });
    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { event.preventDefault(); closeOverlay(); }
      else if (event.key === "ArrowDown") { event.preventDefault(); setActive(active + 1); }
      else if (event.key === "ArrowUp") { event.preventDefault(); setActive(active - 1); }
      else if (event.key === "Enter") { event.preventDefault(); choose(active); }
    });
    return { open(opener) { input.value = ""; render(""); openOverlay(root, opener); input.focus(); } };
  }
  const openPalette = (opener) => { if (!palette) palette = buildPalette(); palette.open(opener); };
  document.addEventListener("keydown", (event) => {
    const typing = event.target.closest && event.target.closest("input, textarea, [contenteditable='true']");
    if ((event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey)) || (event.key === "/" && !typing && !activeOverlay)) {
      event.preventDefault();
      if (activeOverlay) return;
      openPalette(document.activeElement);
    }
  });

  /* ---------- Sidebar: search button + first-visit stagger ---------- */
  const nav = $("#topic-nav");
  if (nav) {
    const searchButton = make("button", "nav-search", `${icon("search")}<span>Search everything</span><kbd>Ctrl K</kbd>`);
    searchButton.type = "button";
    searchButton.addEventListener("click", () => openPalette(searchButton));
    nav.prepend(searchButton);
    let seen = false;
    try { seen = sessionStorage.getItem("lwc.nav.intro") === "1"; sessionStorage.setItem("lwc.nav.intro", "1"); } catch (error) { /* ignore */ }
    if (!seen && motionOn && innerWidth > 900) {
      const links = $$(".nav-links > a, .nav-group");
      after(M.animate(links, { opacity: [0, 1], transform: ["translateX(-14px)", "translateX(0px)"] }, { duration: 0.45, delay: M.stagger(0.03), ease: EASE }), () => links.forEach((node) => clearInline(node)));
    }
  }

  /* ---------- Welcome page ---------- */
  function setupHome() {
    const hero = $(".hero");
    if (!hero) return;

    hero.prepend(make("div", "hero-bg", '<span class="blob blob-1"></span><span class="blob blob-2"></span><span class="blob blob-3"></span>'));
    $(".hero-bg", hero).setAttribute("aria-hidden", "true");

    if (motionOn) {
      const words = [];
      const split = (node) => {
        [...node.childNodes].forEach((child) => {
          if (child.nodeType === 3) {
            const fragment = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { fragment.append(document.createTextNode(" ")); return; }
              const word = make("span", "word"); word.textContent = part; words.push(word); fragment.append(word);
            });
            child.replaceWith(fragment);
          } else if (child.nodeType === 1 && child.tagName !== "BR") split(child);
        });
      };
      split($(".hero h1"));
      words.forEach((word) => { word.style.opacity = "0"; });
      after(M.animate(words, { opacity: [0, 1], transform: ["translateY(0.6em) rotate(3deg)", "translateY(0em) rotate(0deg)"], filter: ["blur(8px)", "blur(0px)"] }, { duration: 0.7, delay: M.stagger(0.07), ease: EASE }), () => words.forEach((word) => clearInline(word)));
      const rest = [$(".hero-copy > .eyebrow"), $(".hero-description"), $(".hero-actions"), $(".hero-stats"), $(".hero-note")].filter(Boolean);
      rest.forEach((node) => { node.style.opacity = "0"; });
      after(M.animate(rest, { opacity: [0, 1], transform: ["translateY(18px)", "translateY(0px)"] }, { duration: 0.6, delay: M.stagger(0.09, { startDelay: 0.35 }), ease: EASE }), () => rest.forEach((node) => clearInline(node)));
      const art = $(".hero-art");
      art.style.opacity = "0";
      after(M.animate(art, { opacity: [0, 1], transform: ["translateY(24px) scale(.94)", "translateY(0px) scale(1)"] }, { duration: 0.8, delay: 0.3, ease: EASE }), () => clearInline(art));
    }

    setupDailyCard();
    setupJourneyStrip();
    setupTopicCards();
    revealOnScroll($$(".section-top, .how-it-works li, .journey-card"), { perRow: 3 });
  }

  function setupDailyCard() {
    const card = $("#daily-card");
    if (!card) return;
    const pool = all.filter((record) => record.q.answer);
    if (!pool.length) return;
    let index = parseInt(hashString(todayKey), 36) % pool.length;
    card.classList.add("is-live");
    card.setAttribute("aria-label", "Question of the day");
    card.innerHTML = `
      <div class="practice-top"><span><span class="status-dot"></span> QUESTION OF THE DAY</span><span class="dc-count"></span></div>
      <div class="dc-body">
        <div class="dc-meta"><span class="dc-emoji" aria-hidden="true"></span><span class="practice-category dc-topic"></span></div>
        <h2 class="dc-question"></h2>
        <div class="dc-answer" hidden><p class="dc-snippet"></p><a class="dc-more" href="#">Read the full answer &rarr;</a></div>
      </div>
      <div class="dc-actions"><button class="dc-reveal" type="button">Reveal answer</button><button class="dc-shuffle" type="button" aria-label="Show another question">&#8635; Another</button></div>`;
    const body = $(".dc-body", card), answer = $(".dc-answer", card), reveal = $(".dc-reveal", card);
    const fill = () => {
      const record = pool[index];
      $(".dc-emoji", card).textContent = emojiOf(record.topic);
      $(".dc-topic", card).textContent = record.topic.name.toUpperCase();
      $(".dc-question", card).textContent = record.q.question;
      $(".dc-snippet", card).textContent = plainSnippet(record.q.answer);
      $(".dc-more", card).href = `${record.topic.id}.html#q-${record.id}`;
      $(".dc-count", card).textContent = isLearned(record.id) ? "✓ LEARNED" : "";
      answer.hidden = true; clearInline(answer);
      reveal.textContent = "Reveal answer"; reveal.setAttribute("aria-expanded", "false");
    };
    fill();
    reveal.addEventListener("click", () => {
      if (answer.hidden) { expand(answer); reveal.textContent = "Hide answer"; reveal.setAttribute("aria-expanded", "true"); }
      else { collapse(answer); reveal.textContent = "Reveal answer"; reveal.setAttribute("aria-expanded", "false"); }
    });
    $(".dc-shuffle", card).addEventListener("click", () => {
      index = (index + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length;
      const out = play(body, { opacity: [1, 0], transform: ["translateX(0px)", "translateX(-24px)"] }, { duration: 0.18 });
      after(out, () => { fill(); play(body, { opacity: [0, 1], transform: ["translateX(24px)", "translateX(0px)"] }, { duration: 0.3, ease: EASE }); });
    });
  }

  function setupJourneyStrip() {
    const topics = $("#topics");
    if (!topics) return;
    const total = all.length;
    const learnedCount = all.filter((record) => isLearned(record.id)).length;
    const savedCount = all.filter((record) => isSaved(record.id)).length;
    const last = state.last && byId.get(state.last.id);
    const percent = total ? Math.round((learnedCount / total) * 100) : 0;
    const percentLabel = learnedCount > 0 && percent === 0 ? "<1" : String(percent);
    const circumference = 2 * Math.PI * 34;
    const sub = last
      ? `Last time you were on “${escapeHtml(last.q.question.length > 90 ? `${last.q.question.slice(0, 87)}…` : last.q.question)}” in ${escapeHtml(last.topic.name)}.`
      : "Open a question, mark it learned, and watch this fill up. Your progress stays in this browser.";
    const strip = make("section", "journey-strip container", `
      <div class="js-ring" role="img" aria-label="${percentLabel}% of questions learned"><svg viewBox="0 0 84 84" aria-hidden="true"><circle class="js-track" cx="42" cy="42" r="34"/><circle class="js-bar" cx="42" cy="42" r="34" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"/></svg><span class="js-pct"><b>${percentLabel}</b>%</span></div>
      <div class="js-main"><p class="eyebrow">YOUR JOURNEY</p><h2><span class="js-learned">0</span> <small>of ${total} questions learned</small></h2><p class="js-sub">${sub}</p></div>
      <div class="js-chips"><span class="chip chip-streak"><i aria-hidden="true">🔥</i><b>${state.streak.count}</b> day streak</span><span class="chip"><i aria-hidden="true">⭐</i><b>${savedCount}</b> saved</span><span class="chip"><i aria-hidden="true">🏆</i>best <b>${state.streak.best}</b></span></div>
      <div class="js-actions"><a class="button button-primary" href="${last ? `${last.topic.id}.html#q-${last.id}` : "agentic-ai.html"}">${last ? "Continue where you left off" : "Start your first question"} ${icon("arrow")}</a><button class="button button-secondary js-mixed" type="button">⚡ Mixed practice</button></div>`);
    topics.before(strip);
    $(".js-mixed", strip).addEventListener("click", (event) => mixedPractice(event.currentTarget));
    const bar = $(".js-bar", strip);
    const target = circumference * (1 - (total ? learnedCount / total : 0));
    countUp($(".js-learned", strip), learnedCount);
    if (motionOn) {
      M.inView(strip, () => { M.animate(bar, { strokeDashoffset: [circumference, target] }, { duration: 1.2, ease: EASE }); });
      revealOnScroll([strip]);
    } else bar.setAttribute("stroke-dashoffset", String(target));
    bar.style.strokeDashoffset = String(target);
  }

  function setupTopicCards() {
    const cards = $$(".topic-card");
    cards.forEach((card, i) => {
      const topic = interviewTopics[i];
      if (!topic) return;
      const learned = learnedIn(topic);
      const totalCount = topic.questions.length;
      const mastered = learned === totalCount && totalCount > 0;
      const progress = make("div", "card-progress", `<span class="cp-track"><span class="cp-fill"></span></span><span class="cp-label">${mastered ? "✓ Mastered" : learned ? `${learned} / ${totalCount} learned` : "Not started"}</span>`);
      progress.setAttribute("role", "img");
      progress.setAttribute("aria-label", `${learned} of ${totalCount} learned`);
      $(".card-bottom", card).before(progress);
      if (mastered) card.classList.add("is-mastered");
      const fill = $(".cp-fill", progress);
      requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.transform = `scaleX(${totalCount ? learned / totalCount : 0})`; }));
    });
    revealOnScroll(cards, { perRow: 3 });
    if (motionOn && window.matchMedia("(hover: hover)").matches) {
      cards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;
          card.style.setProperty("--mx", `${x * 100}%`);
          card.style.setProperty("--my", `${y * 100}%`);
          card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 7}deg) translateY(-4px)`;
          card.classList.add("is-tilting");
        });
        card.addEventListener("pointerleave", () => { card.style.removeProperty("transform"); card.classList.remove("is-tilting"); });
      });
    }
  }

  /* ---------- Topic page ---------- */
  function setupTopicPage() {
    const topic = currentTopic;
    const list = $(".question-list");
    if (!list) return;
    const items = $$(".question-item", list);
    const records = recordsOf(topic);
    const intro = $(".topic-intro");
    const totalCount = topic.questions.length;

    /* Reading progress bar */
    const readBar = make("div", "read-progress", "<span></span>");
    readBar.setAttribute("aria-hidden", "true");
    document.body.append(readBar);
    const readFill = $("span", readBar);
    const paintRead = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      readFill.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    };
    addEventListener("scroll", paintRead, { passive: true });
    paintRead();

    /* Progress header */
    const progress = make("div", "topic-progress", `
      <div class="tp-head"><span class="tp-label"><strong class="tp-n">0</strong> of ${totalCount} learned</span><span class="tp-msg"></span><span class="tp-pct">0%</span></div>
      <div class="tp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${totalCount}" aria-valuenow="0" aria-label="Questions learned in ${escapeHtml(topic.name)}"><span class="tp-fill"></span></div>`);
    $(".topic-meta", intro).after(progress);

    /* Toolbar: practice mode */
    const toolbar = $(".question-toolbar");
    const expandButton = $("#expand-all");
    const actions = make("div", "toolbar-actions");
    const practiceButton = make("button", "button button-primary practice-btn", '<span aria-hidden="true">▶</span> Practice mode');
    practiceButton.type = "button";
    toolbar.append(actions);
    actions.append(expandButton, practiceButton);

    /* Filter chips */
    const hasUnanswered = topic.questions.some((question) => !question.answer);
    const chipDefs = [["all", "All"], ["todo", "To learn"], ["learned", "Learned"], ["saved", "Saved"]];
    if (hasUnanswered && topic.questions.some((question) => question.answer)) chipDefs.push(["answered", "With answers"]);
    const chips = make("div", "filter-chips", chipDefs.map(([key, label]) => `<button type="button" class="filter-chip${key === "all" ? " is-active" : ""}" data-filter="${key}" aria-pressed="${key === "all"}">${label} <span data-count="${key}">0</span></button>`).join(""));
    chips.setAttribute("role", "group");
    chips.setAttribute("aria-label", "Filter questions");
    $(".question-search").after(chips);
    let activeFilter = "all";
    const predicates = {
      all: () => true,
      todo: (index) => !isLearned(records[index].id),
      learned: (index) => isLearned(records[index].id),
      saved: (index) => isSaved(records[index].id),
      answered: (index) => Boolean(records[index].q.answer),
    };
    window.questionFilter = (index) => predicates[activeFilter](index);
    chips.addEventListener("click", (event) => {
      const chip = event.target.closest(".filter-chip");
      if (!chip) return;
      activeFilter = chip.dataset.filter;
      $$(".filter-chip", chips).forEach((node) => { node.classList.toggle("is-active", node === chip); node.setAttribute("aria-pressed", String(node === chip)); });
      window.refreshQuestionFilter();
      const visible = items.filter((item) => !item.hidden);
      if (motionOn && visible.length) M.animate(visible.slice(0, 14), { opacity: [0, 1], transform: ["translateY(10px)", "translateY(0px)"] }, { duration: 0.35, delay: M.stagger(0.025), ease: EASE });
    });

    /* Per-question wiring */
    items.forEach((li, i) => {
      const record = records[i];
      li.id = `q-${record.id}`;
      li.dataset.qid = record.id;
      const summary = $("summary", li);
      const answer = $(".answer", li);
      const wrap = make("div", "answer-wrap");
      answer.before(wrap);
      wrap.append(answer);
      summary.insertBefore(make("span", "q-badges", '<span class="q-badge q-badge-learned" title="Learned">✓<span class="sr-only"> Learned</span></span><span class="q-badge q-badge-saved" title="Saved">★<span class="sr-only"> Saved</span></span>'), $(".answer-toggle", summary));
      answer.append(make("div", "q-actions", `<button type="button" class="q-btn q-learned" aria-pressed="false"><span class="q-btn-icon" aria-hidden="true">✓</span><span class="q-btn-text">Mark as learned</span></button><button type="button" class="q-btn q-save" aria-pressed="false"><span class="q-btn-icon" aria-hidden="true">☆</span><span class="q-btn-text">Save for later</span></button><button type="button" class="q-btn q-copy"><span class="q-btn-icon" aria-hidden="true">🔗</span><span class="q-btn-text">Copy link</span></button>`));
    });

    const paint = () => {
      const learned = records.filter((record) => isLearned(record.id)).length;
      const percent = totalCount ? Math.round((learned / totalCount) * 100) : 0;
      $(".tp-n", progress).textContent = String(learned);
      $(".tp-pct", progress).textContent = `${percent}%`;
      $(".tp-fill", progress).style.transform = `scaleX(${totalCount ? learned / totalCount : 0})`;
      $(".tp-bar", progress).setAttribute("aria-valuenow", String(learned));
      $(".tp-msg", progress).textContent = learned === totalCount && totalCount ? "Topic mastered! 🎉" : percent >= 50 ? "More than halfway there" : learned ? "Great start, keep going" : "Pick a question to begin";
      items.forEach((li, i) => {
        const record = records[i];
        const learnedNow = isLearned(record.id), savedNow = isSaved(record.id);
        li.classList.toggle("is-learned", learnedNow);
        li.classList.toggle("is-saved", savedNow);
        const learnedButton = $(".q-learned", li), saveButton = $(".q-save", li);
        learnedButton.setAttribute("aria-pressed", String(learnedNow));
        $(".q-btn-text", learnedButton).textContent = learnedNow ? "Learned" : "Mark as learned";
        saveButton.setAttribute("aria-pressed", String(savedNow));
        $(".q-btn-icon", saveButton).textContent = savedNow ? "★" : "☆";
        $(".q-btn-text", saveButton).textContent = savedNow ? "Saved" : "Save for later";
      });
      const counts = { all: totalCount, todo: records.filter((r) => !isLearned(r.id)).length, learned, saved: records.filter((r) => isSaved(r.id)).length, answered: records.filter((r) => r.q.answer).length };
      $$("[data-count]", chips).forEach((node) => { node.textContent = String(counts[node.dataset.count]); });
    };
    listeners.push(paint);
    paint();

    /* Learned / save / copy */
    list.addEventListener("click", (event) => {
      const button = event.target.closest("button.q-btn");
      if (!button) return;
      const li = button.closest(".question-item");
      const record = byId.get(li.dataset.qid);
      if (button.classList.contains("q-learned")) {
        const value = !isLearned(record.id);
        setLearned(record, value);
        if (value) {
          play(button, { transform: ["scale(1)", "scale(1.12)", "scale(1)"] }, { duration: 0.4, ease: EASE });
          burstFrom(button, 24, 0.7);
          const learned = records.filter((r) => isLearned(r.id)).length;
          if (learned === totalCount) { celebrate(); toast(`You've mastered ${topic.name}!`, "🏆"); }
          else toast(`${learned} of ${totalCount} learned in ${topic.name}`, "✅");
        }
      } else if (button.classList.contains("q-save")) {
        const value = !isSaved(record.id);
        setSaved(record, value);
        play(button, { transform: ["scale(1)", "scale(1.12)", "scale(1)"] }, { duration: 0.35, ease: EASE });
        toast(value ? "Saved for later" : "Removed from saved", value ? "⭐" : "☆");
      } else if (button.classList.contains("q-copy")) {
        const url = new URL(location.href);
        url.hash = `q-${record.id}`;
        const done = () => toast("Link copied to clipboard", "🔗");
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url.href).then(done, () => toast("Couldn't copy automatically. Copy the address bar instead.", "ℹ️"));
        else toast("Couldn't copy automatically. Copy the address bar instead.", "ℹ️");
      }
    });

    /* Animated accordion */
    let bulk = false;
    expandButton.addEventListener("click", () => { bulk = true; setTimeout(() => { bulk = false; }, 400); });
    list.addEventListener("click", (event) => {
      const summary = event.target.closest("summary");
      if (!summary || !motionOn) return;
      const details = summary.parentElement;
      const wrap = $(".answer-wrap", details);
      if (!details.open) return;
      event.preventDefault();
      if (wrap._busy) return;
      wrap._busy = true;
      const height = wrap.offsetHeight;
      wrap.style.overflow = "hidden";
      after(M.animate(wrap, { height: [`${height}px`, "0px"], opacity: [1, 0] }, { duration: 0.24, ease: "easeInOut" }), () => {
        details.open = false;
        clearInline(wrap);
        wrap._busy = false;
      });
    });
    list.addEventListener("toggle", (event) => {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement)) return;
      const li = details.closest(".question-item");
      if (details.open && !bulk) {
        state.last = { id: li.dataset.qid, topic: topic.id, t: Date.now() };
        save();
      }
      if (!details.open || bulk || !motionOn || li._skipAnim) return;
      const wrap = $(".answer-wrap", details);
      wrap._busy = true;
      const height = wrap.scrollHeight;
      wrap.style.overflow = "hidden";
      after(M.animate(wrap, { height: ["0px", `${height}px`], opacity: [0, 1] }, { duration: 0.35, ease: EASE }), () => { clearInline(wrap); wrap._busy = false; });
    }, true);

    /* Practice launcher */
    practiceButton.addEventListener("click", () => {
      openPractice({
        title: `Practice · ${topic.name}`,
        opener: practiceButton,
        start: records.some((record) => !isLearned(record.id)) ? "todo" : "all",
        pools: {
          todo: { label: "To learn", get: () => records.filter((record) => !isLearned(record.id)) },
          all: { label: "All", get: () => records.slice() },
          saved: { label: "Saved", get: () => records.filter((record) => isSaved(record.id)) },
        },
      });
    });
    if (/[?&]practice=1\b/.test(location.search)) setTimeout(() => practiceButton.click(), 300);

    /* Deep links */
    const openFromHash = () => {
      const conceptMatch = location.hash.match(/^#(concept-.+)$/);
      if (conceptMatch) {
        const card = document.getElementById(conceptMatch[1]);
        if (!card) return;
        card.open = true;
        card.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
        card.classList.remove("is-flash");
        void card.offsetWidth;
        card.classList.add("is-flash");
        setTimeout(() => card.classList.remove("is-flash"), 2400);
        return;
      }
      const match = location.hash.match(/^#q-(.+)$/);
      if (!match) return;
      const li = document.getElementById(`q-${match[1]}`);
      if (!li) return;
      if (li.hidden) {
        activeFilter = "all";
        $$(".filter-chip", chips).forEach((node) => { const on = node.dataset.filter === "all"; node.classList.toggle("is-active", on); node.setAttribute("aria-pressed", String(on)); });
        const search = $("#question-search");
        if (search) search.value = "";
        window.refreshQuestionFilter();
      }
      li._skipAnim = true;
      $("details", li).open = true;
      setTimeout(() => { li._skipAnim = false; }, 100);
      li.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      li.classList.remove("is-flash");
      void li.offsetWidth;
      li.classList.add("is-flash");
      setTimeout(() => li.classList.remove("is-flash"), 2400);
    };
    window.__openFromHash = openFromHash;
    addEventListener("hashchange", openFromHash);
    if (/^#(q|concept)-/.test(location.hash)) requestAnimationFrame(() => setTimeout(openFromHash, 60));

    /* Quick Concepts: animated open, lesson rail, read progress */
    const conceptCards = $$(".concept-card");
    const railNode = $(".lesson-rail");
    const lessonKey = (card) => `${topic.id}|${card.id}`;
    const isRead = (card) => Boolean((state.lessons || {})[lessonKey(card)]);
    const titleOf = (card) => $(".concept-title", card).textContent;
    const RING = 2 * Math.PI * 20;
    if (railNode && conceptCards.length) {
      railNode.innerHTML = `<div class="rail-card"><div class="rail-head"><svg class="rail-ring" viewBox="0 0 50 50" aria-hidden="true"><circle class="track" cx="25" cy="25" r="20"></circle><circle class="fill" cx="25" cy="25" r="20" stroke-dasharray="${RING}" stroke-dashoffset="${RING}"></circle></svg><div><strong class="rail-count"></strong><span>lessons read</span></div></div><ol class="rail-list">${conceptCards.map((card, i) => `<li><a href="#${card.id}" data-card="${card.id}"><span class="rail-dot">${i + 1}</span><span class="rail-title">${escapeHtml(titleOf(card))}</span></a></li>`).join("")}</ol></div>`;
    }
    const syncLessons = () => {
      conceptCards.forEach((card, i) => {
        const read = isRead(card);
        card.classList.toggle("is-read", read);
        const button = $(".mark-read", card);
        button.classList.toggle("is-on", read);
        button.setAttribute("aria-pressed", String(read));
        button.textContent = read ? "✓ Read" : "Mark as read";
        const link = railNode && $(`[data-card="${card.id}"]`, railNode);
        if (link) { link.classList.toggle("is-done", read); $(".rail-dot", link).textContent = read ? "✓" : String(i + 1); }
      });
      if (railNode) {
        const done = conceptCards.filter(isRead).length;
        $(".rail-count", railNode).textContent = `${done} of ${conceptCards.length}`;
        $(".fill", railNode).style.strokeDashoffset = String(RING * (1 - done / conceptCards.length));
      }
    };
    conceptCards.forEach((card, i) => {
      card.insertAdjacentHTML("beforeend", '<span class="concept-read-bar" aria-hidden="true"></span>');
      card.addEventListener("toggle", () => {
        updateLessonProgress();
        if (!card.open || !motionOn) return;
        const body = $(".concept-body", card);
        after(M.animate(body, { opacity: [0, 1], transform: ["translateY(-8px)", "translateY(0px)"] }, { duration: 0.4, ease: EASE }), () => clearInline(body));
      });
      $(".mark-read", card).addEventListener("click", (event) => {
        state.lessons = state.lessons || {};
        const key = lessonKey(card);
        if (state.lessons[key]) { delete state.lessons[key]; save(); syncLessons(); return; }
        state.lessons[key] = Date.now();
        save();
        syncLessons();
        if (conceptCards.every(isRead)) { celebrate(); toast("All lessons read. Nice work!", "🎉"); return; }
        burstFrom(event.currentTarget, 18, 0.5);
        toast(`${titleOf(card)} marked as read`, "✅");
        const upcoming = conceptCards.slice(i + 1).find((c) => !isRead(c)) || conceptCards.find((c) => !isRead(c));
        if (!upcoming) return;
        card.open = false;
        upcoming.open = true;
        setTimeout(() => upcoming.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" }), 250);
      });
    });
    let progressQueued = false;
    function updateLessonProgress() {
      progressQueued = false;
      let current = null;
      conceptCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const fraction = card.open ? Math.min(1, Math.max(0, (innerHeight * 0.6 - rect.top) / Math.max(1, rect.height))) : 0;
        $(".concept-read-bar", card).style.transform = `scaleX(${fraction.toFixed(3)})`;
        if (!current && rect.bottom > innerHeight * 0.3 && rect.top < innerHeight * 0.6) current = card;
      });
      if (railNode) $$("[data-card]", railNode).forEach((link) => link.classList.toggle("is-active", Boolean(current) && link.dataset.card === current.id));
    }
    const queueProgress = () => { if (!progressQueued) { progressQueued = true; requestAnimationFrame(updateLessonProgress); } };
    if (conceptCards.length) {
      addEventListener("scroll", queueProgress, { passive: true });
      addEventListener("resize", queueProgress);
      syncLessons();
      updateLessonProgress();
    }
    revealOnScroll(conceptCards, { perRow: 1, distance: 16 });

    /* Entrance animations */
    if (motionOn) {
      const intro_parts = $$(".topic-intro > *", document).concat($(".practice-tip") || []);
      intro_parts.forEach((node) => { node.style.opacity = "0"; });
      after(M.animate(intro_parts, { opacity: [0, 1], transform: ["translateY(16px)", "translateY(0px)"] }, { duration: 0.55, delay: M.stagger(0.07), ease: EASE }), () => intro_parts.forEach((node) => clearInline(node)));
      const topicEmoji = $(".topic-intro .topic-icon .topic-emoji");
      if (topicEmoji) M.animate(topicEmoji, { transform: ["scale(0.5) rotate(-15deg)", "scale(1) rotate(0deg)"] }, { duration: 0.7, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] });
    }
    revealOnScroll(items.slice(0, 400), { perRow: 1, distance: 14 });
  }

  /* Boot */
  if (typeof currentTopic !== "undefined" && currentTopic) setupTopicPage();
  else setupHome();
})();
