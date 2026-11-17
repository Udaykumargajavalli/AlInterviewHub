# learn_with_cu - AI Interview Field Guide

A responsive static website built with HTML, CSS, and vanilla JavaScript. No build step, backend, or package installation is required.

## Open the website

Public website: **https://udaykumargajavalli.github.io/AlInterviewHub/**

Open `index.html` in a browser for local use. Each of the twenty-four topics has its own HTML page, so links also work on static hosting such as GitHub Pages or Azure Static Web Apps.

## Deployment

GitHub Pages serves this site using the workflow in `.github/workflows/deploy-pages.yml`. Every push to `main` deploys the HTML, JavaScript, CSS, and image files plus the `images/` and `vendor/` folders; the workflow can also be run manually from the Actions tab. No build step or secrets are required.

The welcome page shows the live number of learning paths and questions once, as two clickable cards under the main call to action that count up on load (skipped when the visitor prefers reduced motion); both figures are calculated from `questions.js`. The site includes topic and question search, individually expandable answers, a show/hide-all control, and keyboard-accessible left-side navigation. On smaller screens the vertical menu collapses behind the Menu button; Escape closes it. RAG contains 179 questions, including 24 supplied answers displayed in bordered text boxes headed "30 seconds answer". Agentic AI contains 81 questions, including 13 supplied answers in the same style. Prompt Engineering contains 68 questions, including 32 supplied answers in the same style. Evals & Guardrails contains 285 questions, including 46 supplied answers in the same style. LLMOPS & Production contains 330 questions, including 93 supplied answers in the same style. AI Fine Tuning contains 132 questions, including 33 supplied answers in the same style. Linux contains 51 unanswered questions. AI Security contains 106 unanswered questions. AI Case Studies contains 61 unanswered questions. AI Inference contains 38 questions, including 4 supplied answers in the same style. AI System Design contains 844 questions, including 306 supplied answers (rendered with markdown formatting); 210 sit under an "Architecture & Trade-offs" subsection, followed by two unanswered subsections, "Generative AI System Design" and "Generative AI Scenario Questions", and two answered scenario subsections, "Scenario: Recommendation Systems" and "Scenario: Anomaly, Fraud & Predictive Maintenance". AI Infrastructure contains 14 questions (one with a supplied answer, under "Interview Q&A: GPU Programming"). Git contains 51 unanswered questions. Time Series Forecasting contains 47 questions, 32 with supplied answers in the same style (the last 11 under "Scenario: Forecasting", plus one under "Interview Q&A: Techniques", unanswered). SQL contains 81 questions, 80 with supplied answers (code blocks and tables are rendered) and one unanswered. Machine Learning contains 901 questions (663 with supplied answers), and Deep Learning contains 306 questions (204 with supplied answers), organized into four subsections after the main list: "RNN, LSTM & Sequence Models", "NLP & Transformers", "Computer Vision", and "Computer Vision & Coding", followed by an unanswered "Generative AI & Deep Learning Foundations" subsection, an answered "Core Deep Learning Interview Q&A" subsection, and "Scenario: Computer Vision & Neural Networks". Machine Learning continues after "Core ML Interview Q&A" (18 questions) with answered scenario subsections: "Scenario: Class Imbalance", "Improving & Diagnosing Models", "Model Selection & Evaluation", "Healthcare & Life-Science Predictions", and "Other Applied ML Problems", then "More ML Interview Q&A" and three answered subsections ("ML Interview Q&A: Evaluation Metrics", "Training & Generalization", "Data Preparation & Features") that include several differently worded versions of the same fundamentals question. RAG ends with "Interview Q&A: Vector Databases". NLP contains 171 questions (73 with supplied answers) (rendered with markdown formatting), the last 50 under "Scenario: Natural Language Processing". Data Science contains 245 questions (125 with supplied answers) (markdown formatting), including 116 scenario questions under "Handling Missing Data", "Feature Selection & Engineering", and "Data Preparation & Quality"; "Scenario: Deployment & MLOps" (LLMOPS & Production) and "Scenario: Bias, Fairness & Responsible AI" (Evals & Guardrails) hold the remaining scenario questions, and Statistics & Probability contains 85 questions (26 with supplied answers). There are 5460 questions across all twenty-four topics. Generative AI contains 652 questions (rendered with markdown formatting): 210 with supplied answers organized into fifteen numbered lessons ("01. Language Modeling" through "15. Cost, Privacy and Deployment"), plus 442 unanswered interview questions in six more numbered subsections ("16. Concepts, Applications & Trends" through "21. Coding: Evaluation & Utilities"), each a subsection with its own link in the left navigation. Behavioral & Teamwork contains 558 unanswered behavioral and hiring-manager questions in three subsections (Projects, Teamwork & Collaboration; Pressure, Feedback & Prioritization; Motivation, Growth & Staying Current). LLM Fundamentals contains 124 questions, including 53 supplied answers; 14 sit under a "Language Models Internal Working" subsection and are unanswered, followed by an unanswered "Transformers & Language Models" subsection, and any topic can group questions by adding a `section` property to a question in `questions.js`. Other unanswered questions have empty answer blocks; unanswered questions have empty answer blocks.

Interview questions imported from a Generative AI question bank (duplicates removed) were added, unanswered, to the best-matching topic under subsections whose names start with "Generative AI" (for example RAG, Prompt Engineering, AI Fine Tuning, AI Security, AI Inference, LLMOPS & Production, Evals & Guardrails, and Machine Learning).

Interview questions from a "Domain Deep-Dive" set (unanswered, company names removed) were added to Machine Learning, Deep Learning, NLP, Data Science, LLMOPS & Production, AI System Design, Evals & Guardrails, Time Series Forecasting, and RAG under subsections whose names start with "Domain Deep-Dive:".

A "Technical Screen Q&A" set (with supplied answers; scraper tags and company details removed) was added to Machine Learning, Deep Learning, NLP, Evals & Guardrails, LLMOPS & Production, RAG, and Time Series Forecasting under subsections whose names start with "Technical Screen Q&A:".

Answers are plain text by default; a topic can set `answerFormat: "markdown"` in `questions.js` to render fenced code blocks, tables, headings, bullet lists, bold, inline code, and images in its answers (put image files in the `images/` folder and reference them on their own line as `![description](images/file.png)`) (the SQL topic does). Each topic displays one continuous numbered question list, without difficulty sections; an optional `section` property on a question adds a subsection heading above the first question of that group and a matching link in the left navigation. Subsection links are tucked under their topic behind a chevron button that expands or collapses them; they are collapsed by default except on that topic's own page, and your choice is remembered for the browser session.

Use the sun/moon icon button in the top-right corner to switch between light and dark appearances: the moon switches to dark, and the sun switches to light. The button includes an accessible label and tooltip. The initial theme follows your system preference, and your selection is saved in browser local storage for future visits and other topic pages. If browser storage is blocked, a visible message explains that the preference cannot be saved.

Both themes use a coordinated charcoal and amber palette: warm off-white surfaces with charcoal text in light mode, and charcoal surfaces in dark mode, with amber (`#b45f06` light, `#f0b429` dark) as the accent for buttons, links, and highlights. Shared colors are defined in the `:root` and `[data-theme="dark"]` variables in `styles.css`; topic accents keep their class names (`navy`, `indigo`, `blue`, `steel`, `cobalt`, `periwinkle`, `slate`) but now render as slightly different ambers and neutrals.

## Quick Concepts (pre-reading lessons)

A topic can carry short lessons that are shown above its questions, with a "Quick Concepts" link in the left navigation and in the Ctrl+K search. Add them in `questions.js` before the `questions:` array:

```js
concepts: [{ title: "Conditional Probability", body: `markdown text with $inline$ and $$display$$ math` }]
```

The body uses the same markdown as `answerFormat: "markdown"`, plus LaTeX math (`$...$` inline, `$$...$$` display), rendered by the bundled KaTeX in `vendor/katex/`. Escape backslashes inside the template literal (`\\frac`). A page that uses math must include `vendor/katex/katex.min.css` (before `styles.css`) and `vendor/katex/katex.min.js` (before `questions.js`); currently `statistics-probability.html` and `machine-learning.html` do.

On wide screens a sticky lesson rail sits beside the lessons: it lists every lesson, highlights the one you are reading, and shows a progress ring. Each lesson has a "Mark as read" button (saved in the browser's `localStorage` with the rest of your progress) and a thin reading-progress bar along its top edge. Nothing needs to be added to `questions.js` for this; it is built from the lesson titles.

## Engagement features

The site is still a no-build static site: open `index.html` and everything works. Interactive behaviour lives in `engage.js`, which enhances the pages rendered by `app.js` using the [Motion](https://motion.dev) animation library (MIT licensed, vendored in `vendor/motion.js` so there is no CDN dependency; licence in `vendor/motion-LICENSE.md`).

- **Animated welcome page:** staggered headline reveal, drifting background, scroll-reveal sections, count-up numbers, and topic cards with a pointer-following spotlight and gentle 3D tilt.
- **Question of the day:** the hero card shows a real question (the same one all day), with Reveal answer and Another question controls and a deep link to the full answer.
- **Progress tracking:** mark questions as learned or save them for later. Each topic shows a progress bar, filter chips (All / To learn / Learned / Saved / With answers), and the welcome page shows overall progress, a daily streak, and a Continue where you left off button. Progress is stored in this browser's `localStorage` under `learn_with_cu.progress.v1` (no accounts, nothing leaves the device).
- **Practice mode:** flashcard sessions per topic (To learn / All / Saved pools, shuffle) and a Mixed practice set from every topic. Keyboard: Space reveal, arrow keys move, L got it, R review again, S save, Esc close.
- **Quick search:** press `Ctrl K` (or `/`) anywhere to search every question and topic and jump straight to a question.
- **Deep links:** every question has a stable link (`topic.html#q-...`) with a Copy link button.
- **Delight:** smooth accordion, confetti when you master a topic, toasts, and a reading-progress bar.
- **Accessibility and motion:** animations are skipped when the browser asks for reduced motion; overlays trap focus and close with Esc.

Question links and progress are keyed by a hash of the topic and question text, so editing a question's wording resets its learned/saved status.

## Add your questions and answers

Edit `questions.js`. Find the topic by its `id` and replace or add entries in its `questions` array:

```js
{
  question: "Your interview question?",
  answer: "Your answer goes here."
}
```

Keep the surrounding commas and quote strings correctly. Use `\n` in an answer for line breaks. Content is rendered as plain text, not HTML. Counts update automatically. Topic names, descriptions, icons, and colors are also defined in this file. Set a topic's optional `answerHeading` to customize its answer box heading; the default is "Answer".

## Files

- `index.html`: welcome page.
- The eleven topic HTML files: directly linkable topic pages, including `prompt-engineering.html`, `linux.html`, `ai-fine-tuning.html`, and `ai-security.html`.
- `questions.js`: editable topic and Q&A data.
- `app.js`: shared page rendering, navigation, and search behavior.
- `theme.js`: applies the saved or system theme before the page is painted.
- `styles.css`: layout, colors, typography, and responsive styles.

Fonts are optionally loaded from Google Fonts; system fonts are used when offline. No external images, libraries, or API keys are needed. JavaScript must be enabled.
