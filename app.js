const icons = {
  agent: '<rect x="5" y="7" width="14" height="13" rx="4"/><path d="M12 3v4M9 12h.01M15 12h.01M9 16h6M2 12h3M19 12h3"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  brain: '<path d="M12 5c-3-5-8-1-7 3-4 2-3 7 0 8-1 5 5 7 7 3 2 4 8 2 7-3 3-1 4-6 0-8 1-4-4-8-7-3ZM12 5v14M8 8l4 3M16 14l-4 2"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3M13 15h4"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  network: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/>',
  rocket: '<path d="M9 15c-2-5 3-11 12-12 0 9-6 14-12 12ZM9 9H5l-3 5h6M15 15v4l-5 3v-6M5 18l-2 3M16 8h.01"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  spark: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  moon: '<path d="M20.5 13A9 9 0 0 1 11 3.5 9 9 0 1 0 20.5 13Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>'
};
const icon = (name, className = "") => `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const navEmojis = {
  "agentic-ai": "🤖", "rag": "📚", "llm-fundamentals": "🧠", "llmops-production": "⚙️", "evals-guardrails": "🛡️",
  "ai-system-design": "🏗️", "ai-forward-deployed-engineer": "🚀", "prompt-engineering": "✨", "linux": "🐧",
  "ai-fine-tuning": "🎛️", "ai-security": "🔐", "ai-case-studies": "📊", "ai-inference": "⚡", "ai-infrastructure": "🖥️"
};
const escapeHtml = (text) => text.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const topicId = document.body.dataset.topic;
const currentTopic = interviewTopics.find((topic) => topic.id === topicId);
const totalQuestions = interviewTopics.reduce((total, topic) => total + topic.questions.length, 0);

function header() {
  return `<header class="site-header">
    <div class="header-top">
      <a class="brand" href="index.html" aria-label="learn_with_cu home"><span class="brand-mark"><img src="logo-mark.png" alt=""></span><span class="brand-text">learn_with_cu</span></a>
      <button class="menu-toggle" type="button" aria-controls="topic-nav" aria-expanded="false">Menu <span aria-hidden="true">+</span></button>
    </div>
    <p class="sidebar-caption">Your AI interview field guide.</p>
    <nav id="topic-nav" class="topic-nav" aria-label="Main navigation"><div class="nav-links">
      <a href="index.html"${!currentTopic ? ' aria-current="page"' : ""}>${icon("spark")}<span>Welcome</span></a>
      <p class="nav-heading">EXPLORE TOPICS</p>
      ${interviewTopics.map((topic) => `<a href="${topic.id}.html"${topic.id === topicId ? ' aria-current="page"' : ""}><span class="nav-emoji" aria-hidden="true">${navEmojis[topic.id] || ""}</span><span>${escapeHtml(topic.name)}</span></a>`).join("")}
    </div></nav>
    <div class="sidebar-bottom"><p class="sidebar-note">A little practice. A lot of possibility.</p></div>
  </header>`;
}

function footer() {
  return `<footer class="site-footer container"><a class="brand footer-brand" href="index.html" aria-label="learn_with_cu home"><span class="brand-mark"><img src="logo-mark.png" alt=""></span><span class="brand-text">learn_with_cu</span></a><span>Learn. Practice. Grow.</span></footer>`;
}

function topicCard(topic, index) {
  return `<a class="topic-card ${topic.color}" href="${topic.id}.html">
    <div class="card-top"><span class="topic-icon">${icon(topic.icon)}</span><span class="card-index">${String(index + 1).padStart(2, "0")}</span></div>
    <p class="card-label">${topic.label}</p><h3>${escapeHtml(topic.name)}</h3><p class="card-description">${escapeHtml(topic.description)}</p>
    <div class="card-bottom"><span>${topic.questions.length} questions <span class="small-dot"></span> ${topic.questions.some((item) => item.answer) ? "Answers available" : "Answers coming soon"}</span><span class="card-arrow">${icon("arrow")}</span></div>
  </a>`;
}

function home() {
  return `<main id="main">
    <section class="hero container">
      <div class="hero-copy"><p class="eyebrow"><span class="status-dot"></span> YOUR AI INTERVIEW FIELD GUIDE</p>
        <h1>Big ambitions.<br>Better answers.<br><span>Start here.</span></h1>
        <p class="hero-description">Your next opportunity starts with a little preparation. Get comfortable with the ideas shaping AI, one interview question at a time.</p>
        <div class="hero-actions"><a class="button button-primary" href="agentic-ai.html">Start practicing ${icon("arrow")}</a><a class="text-link" href="#topics">Explore the topics <span aria-hidden="true">&#8595;</span></a></div>
        <div class="hero-note">${icon("check")} No sign-ups. No pressure. Just progress.</div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
        <span class="floating-tag tag-top">${icon("spark")} A little more confident.</span>
        <div class="practice-card"><div class="practice-top"><span><span class="status-dot"></span> A QUESTION A DAY</span><span>01 / ${interviewTopics[0].questions.length}</span></div>
          <div class="practice-icon">${icon("agent")}</div><span class="practice-category">AGENTIC AI</span>
          <h2>What turns a language<br>model into an agent?</h2>
          <div class="mock-answer">${icon("check")} A good place to start.</div>
          <div class="practice-lines"><span></span><span></span><span></span></div>
          <div class="practice-bottom"><span>Small steps. Real understanding.</span>${icon("arrow")}</div>
        </div>
        <span class="floating-tag tag-bottom"><span class="mini-check">${icon("check")}</span> You've got this.</span>
        <svg class="art-spark" viewBox="0 0 50 50" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M25 2v46M2 25h46M9 9l32 32M9 41 41 9"/></svg>
        <span class="art-caption">a brighter next chapter</span>
      </div>
    </section>
    <section class="stats-bar container" aria-label="Library at a glance"><div><strong>${String(interviewTopics.length).padStart(2, "0")}</strong><span>focused learning paths</span></div><div><strong>${totalQuestions}</strong><span>questions to get you started</span></div><div><strong>Your pace.</strong><span>your preparation, your way</span></div><span class="stats-decoration">${icon("spark")}</span></section>
    <section id="topics" class="topics-section container" aria-labelledby="topics-heading">
      <div class="section-top"><div><p class="eyebrow">FIND YOUR NEXT CHALLENGE</p><h2 id="topics-heading">A topic for every next step<span>.</span></h2><p class="section-description">Build your foundations. Go deeper. Connect the dots.</p></div>
      <div class="search-wrap"><label class="sr-only" for="topic-search">Search topics and questions</label>${icon("search")}<input type="search" id="topic-search" placeholder="Find your topic..." autocomplete="off"></div></div>
      <p class="search-status sr-only" id="search-status" role="status"></p>
      <div id="topic-grid" class="topic-grid">${interviewTopics.map(topicCard).join("")}
        <aside class="journey-card"><span class="journey-spark">${icon("spark")}</span><p class="eyebrow">ONE QUESTION AT A TIME</p><h3>You don't have to<br>know it all. <em>Yet.</em></h3><p>Pick a topic. Think it through.<br>Reveal the answer. Repeat.</p><span class="journey-rule"></span><span class="journey-caption">Consistency &gt; cramming.</span></aside>
      </div><div class="empty-state" id="empty-state" hidden><h3>No matching topics yet.</h3><p>Try a topic name or a keyword such as "retrieval" or "model".</p><button class="button button-secondary" id="clear-search" type="button">Clear search</button></div>
    </section>
    <section class="how-it-works container"><div><p class="eyebrow">A SIMPLE WAY TO PREPARE</p><h2>Less overwhelm.<br>More "I've got this."</h2></div><ol><li><span>01</span><div><h3>Pick your path</h3><p>Choose a topic that matches your next opportunity.</p></div></li><li><span>02</span><div><h3>Give it a thought</h3><p>Try answering out loud before you reveal the answer.</p></div></li><li><span>03</span><div><h3>Make it your own</h3><p>Check your understanding, then practice again.</p></div></li></ol></section>
  </main>`;
}

function questionItem(item, index) {
  return `<li class="question-item"><details><summary><span class="question-number">${String(index + 1).padStart(2, "0")}</span><span class="question-title">${escapeHtml(item.question)}</span><span class="answer-toggle"><span class="show-label">Show answer</span><span class="hide-label">Hide answer</span><span class="toggle-symbol" aria-hidden="true">+</span></span></summary><div class="answer">${item.answer ? `<div class="answer-box"><h4 class="answer-label">${escapeHtml(currentTopic.answerHeading || "Answer")}</h4><p>${escapeHtml(item.answer)}</p></div>` : ""}</div></details></li>`;
}

function topicPage(topic) {
  const index = interviewTopics.indexOf(topic);
  const next = interviewTopics[(index + 1) % interviewTopics.length];
  const hasAnswers = topic.questions.some((item) => item.answer);
  return `<main id="main" class="container topic-main">
    <a class="back-link" href="index.html#topics"><span aria-hidden="true">&#8592;</span> All topics</a>
    <section class="topic-intro"><span class="topic-icon ${topic.color}">${icon(topic.icon)}</span><p class="eyebrow">THE FIELD GUIDE / ${String(index + 1).padStart(2, "0")}</p><h1>${escapeHtml(topic.name)}</h1><p>${escapeHtml(topic.description)}</p><div class="topic-meta"><span>${topic.questions.length} questions</span><span class="small-dot"></span><span>Learn at your own pace</span></div></section>
    <div class="practice-tip">${icon("spark")}<p><strong>Make the most of each question.</strong> ${hasAnswers ? "Try your own answer first, then reveal the answer to compare." : "Practice your own answers. Answer blocks are empty for now."}</p></div>
    <section class="questions-section" aria-labelledby="questions-heading"><div class="question-toolbar"><h2 id="questions-heading">Your practice questions<span>.</span></h2><button class="button button-secondary" id="expand-all" type="button">Show all answers</button></div>
      <div class="question-search search-wrap">${icon("search")}<label class="sr-only" for="question-search">Search questions and answers</label><input id="question-search" type="search" placeholder="Search questions and answers..." autocomplete="off"></div>
      <p id="question-status" class="result-count" role="status">${topic.questions.length} questions &middot; ${hasAnswers ? "Answers available" : "Answers coming soon"}</p>
      <ol class="question-list">${topic.questions.map(questionItem).join("")}</ol>
      <div class="empty-state" id="empty-state" hidden><h3>No matching questions.</h3><p>Try a different keyword or clear your search.</p><button class="button button-secondary" id="clear-search" type="button">Clear search</button></div>
    </section><div class="next-topic"><div><p class="eyebrow">KEEP YOUR MOMENTUM</p><h2>Ready for a different angle?</h2></div><a class="button button-primary" href="${next.id}.html">${escapeHtml(next.name)} ${icon("arrow")}</a></div>
  </main>`;
}

document.getElementById("app").innerHTML = header() + `<div class="theme-controls"><button class="theme-toggle" id="theme-toggle" type="button" aria-label="Switch to dark theme" title="Switch to dark theme">${icon("moon")}</button><p id="theme-status" class="theme-status" role="status"></p></div><div class="page-content">${currentTopic ? topicPage(currentTopic) : home()}${footer()}</div>`;

const themeButton = document.getElementById("theme-toggle");
const updateThemeButton = () => {
  const dark = document.documentElement.dataset.theme === "dark";
  const label = `Switch to ${dark ? "light" : "dark"} theme`;
  themeButton.setAttribute("aria-label", label);
  themeButton.title = label;
  themeButton.innerHTML = icon(dark ? "sun" : "moon");
};
updateThemeButton();
document.getElementById("theme-status").textContent = themeStorageMessage;
themeButton.addEventListener("click", () => {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  updateThemeButton();
  try {
    localStorage.setItem(themeStorageKey, theme);
    document.getElementById("theme-status").textContent = "";
  } catch (error) {
    if (error.name !== "SecurityError" && error.name !== "QuotaExceededError") throw error;
    console.warn("Theme preference could not be saved.", error);
    document.getElementById("theme-status").textContent = "Theme changed, but your browser could not save it for your next visit.";
  }
});

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const expanded = button.getAttribute("aria-expanded") !== "true";
  button.setAttribute("aria-expanded", String(expanded));
  document.getElementById("topic-nav").classList.toggle("is-open", expanded);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.querySelector(".menu-toggle").getAttribute("aria-expanded") === "true") {
    document.querySelector(".menu-toggle").click();
    document.querySelector(".menu-toggle").focus();
  }
});

if (!currentTopic) {
  const search = document.getElementById("topic-search");
  const cards = [...document.querySelectorAll(".topic-card")];
  const filter = () => {
    const query = search.value.trim().toLowerCase();
    let count = 0;
    cards.forEach((card, index) => {
      const topic = interviewTopics[index];
      const matches = [topic.name, topic.description, ...topic.questions.flatMap((item) => [item.question, item.answer])].join(" ").toLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) count++;
    });
    document.querySelector(".journey-card").hidden = Boolean(query);
    document.getElementById("empty-state").hidden = count > 0;
    document.getElementById("search-status").textContent = `${count} matching topics`;
  };
  search.addEventListener("input", filter);
  document.getElementById("clear-search").addEventListener("click", () => { search.value = ""; filter(); search.focus(); });
} else {
  const search = document.getElementById("question-search");
  const items = [...document.querySelectorAll(".question-item")];
  const expandButton = document.getElementById("expand-all");
  const visibleDetails = () => items.filter((item) => !item.hidden).map((item) => item.querySelector("details"));
  const updateExpandButton = () => {
    const details = visibleDetails();
    expandButton.disabled = details.length === 0;
    expandButton.textContent = details.length && details.every((item) => item.open) ? "Hide all answers" : "Show all answers";
  };
  const filter = () => {
    const query = search.value.trim().toLowerCase();
    items.forEach((item, index) => {
      const question = currentTopic.questions[index];
      item.hidden = !`${question.question} ${question.answer}`.toLowerCase().includes(query);
    });
    const count = visibleDetails().length;
    document.getElementById("question-status").textContent = `${count} of ${items.length} questions${query ? " match your search" : currentTopic.questions.some((item) => item.answer) ? " - Answers available" : " - Answers coming soon"}`;
    document.getElementById("empty-state").hidden = count > 0;
    updateExpandButton();
  };
  search.addEventListener("input", filter);
  document.getElementById("clear-search").addEventListener("click", () => { search.value = ""; filter(); search.focus(); });
  expandButton.addEventListener("click", () => {
    const details = visibleDetails();
    const shouldOpen = !details.every((item) => item.open);
    details.forEach((item) => { item.open = shouldOpen; });
    updateExpandButton();
  });
  items.forEach((item) => item.querySelector("details").addEventListener("toggle", updateExpandButton));
}
