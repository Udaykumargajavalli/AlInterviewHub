# AlInterviewHub – AI Interview Field Guide

A free, responsive interview-preparation website covering **24 topics and 5,460 questions**, with answers for roughly half of them. Built with plain HTML, CSS, and vanilla JavaScript: no backend, no build step, no sign-up.

🌐 **Live site:** https://udaykumargajavalli.github.io/AlInterviewHub/

## Topics

| Area | Topics |
| --- | --- |
| **AI & LLMs** | Generative AI · LLM Fundamentals · Prompt Engineering · RAG · Agentic AI · AI Fine Tuning · AI Inference |
| **AI in production** | LLMOPS & Production · Evals & Guardrails · AI Security · AI Infrastructure · AI System Design · AI Case Studies · AI Forward Deployed Engineer |
| **ML & data** | Machine Learning · Deep Learning · NLP · Data Science · Statistics & Probability · Time Series Forecasting · SQL |
| **Engineering & career** | Linux · Git · Behavioral & Teamwork |

Each topic is a directly linkable page (for example `rag.html`). Questions are numbered in one list and may be grouped into subsections, which also appear in the left navigation.

## Features

- **Search:** filter topics and questions on each page, or press `Ctrl K` (or `/`) to search everything.
- **Answers on demand:** expand questions one at a time, or show/hide all.
- **Progress tracking:** mark questions as learned or saved, filter by status, and see per-topic progress and a daily streak. Progress stays in your browser's `localStorage`; nothing is sent anywhere.
- **Practice mode:** flashcards per topic or a mixed set across topics (`Space` reveal, arrow keys move, `L` got it, `R` review again, `S` save, `Esc` close).
- **Question of the day:** a featured question on the welcome page.
- **Quick Concepts:** short pre-reading lessons with math support and a progress rail on selected topics.
- **Deep links:** every question has a stable link with a Copy link button.
- **Light and dark themes:** follows your system setting; the toggle is in the top-right corner.
- **Accessible:** keyboard navigation, focus-trapped overlays, and reduced-motion support.

## Run locally

No installation is needed. Open `index.html` in a browser. To serve it instead:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` and `<topic>.html` | Welcome page and one page per topic |
| `questions.js` | All topics, questions, answers, and concepts |
| `app.js` | Page rendering, navigation, and search |
| `engage.js` | Progress, practice mode, quick search, and animations |
| `theme.js` | Applies the saved or system theme before first paint |
| `styles.css` | Layout, colors, typography, and responsive styles |
| `images/` | Images used in answers |
| `vendor/` | Bundled third-party libraries: [KaTeX](https://katex.org) (math) and [Motion](https://motion.dev) (animation), both MIT licensed |
| `.github/workflows/deploy-pages.yml` | GitHub Pages deployment |

## Add or edit content

Edit `questions.js`, find the topic by its `id`, and add entries to its `questions` array:

```js
{
  question: "Your interview question?",
  answer: "Your answer goes here.",
  section: "Optional subsection title" // groups questions under a heading
}
```

- Use `\n` for line breaks. Answers are plain text by default.
- Set `answerFormat: "markdown"` on a topic to render code blocks, tables, headings, lists, bold, inline code, and images. Put image files in `images/` and reference them on their own line as `![description](images/file.png)`.
- Set `answerHeading` on a topic to change the answer box heading (default: "Answer").
- Topic names, descriptions, icons, and colors are also defined in this file. Counts update automatically.
- Progress and links are keyed by a hash of the topic and question text, so rewording a question resets its learned/saved status.

### Quick Concepts

Add lessons to a topic before its `questions:` array:

```js
concepts: [{ title: "Conditional Probability", body: `Markdown with $inline$ and $$display$$ math` }]
```

Escape backslashes inside the template literal (`\\frac`). A page that uses math must load `vendor/katex/katex.min.css` (before `styles.css`) and `vendor/katex/katex.min.js` (before `questions.js`); `statistics-probability.html` and `machine-learning.html` already do.

## Deployment

Pushes to `main` deploy automatically to GitHub Pages through `.github/workflows/deploy-pages.yml`; it can also be run manually from the Actions tab. The workflow publishes the root HTML, JS, CSS, and PNG files plus `images/` and `vendor/`. No secrets are required. In **Settings → Pages**, the source must be **GitHub Actions**.

## Notes

Fonts load optionally from Google Fonts and fall back to system fonts offline. JavaScript must be enabled.
