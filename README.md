# AlInterviewHub - AI Interview Field Guide

A responsive static website built with HTML, CSS, and vanilla JavaScript. No build step, backend, or package installation is required.

## Open the website

Public website: **https://udaykumargajavalli.github.io/AlInterviewHub/**

Open `index.html` in a browser for local use. Each of the fourteen topics has its own HTML page, so links also work on static hosting such as GitHub Pages or Azure Static Web Apps.

## Deployment

GitHub Pages serves this site using the workflow in `.github/workflows/deploy-pages.yml`. Every push to `main` deploys the HTML, JavaScript, CSS, and image files; the workflow can also be run manually from the Actions tab. No build step or secrets are required.

In the repository's **Settings > Pages**, set **Source** to **GitHub Actions**. Deployment status and the published URL appear in the workflow's `github-pages` environment.

The site includes topic and question search, individually expandable answers, a show/hide-all control, and keyboard-accessible left-side navigation. On smaller screens the vertical menu collapses behind the Menu button; Escape closes it. RAG contains 108 questions, including 15 supplied answers displayed in bordered text boxes headed "30 seconds answer". Agentic AI contains 60 questions, including 11 supplied answers in the same style. Prompt Engineering contains 30 questions with supplied answers. Evals & Guardrails contains 72 questions, including 22 supplied answers in the same style. LLMOPS & Production contains 102 questions, including 27 supplied answers in the same style. AI Fine Tuning contains 50 questions, including 30 supplied answers in the same style. Linux contains 51 unanswered questions. AI Security contains 8 unanswered questions. AI Case Studies contains 61 unanswered questions. AI Inference contains 9 unanswered questions. AI Infrastructure contains 13 unanswered questions. There are 714 questions across all fourteen topics. LLM Fundamentals also has 50 supplied answers; unanswered questions have empty answer blocks.

Each topic displays one continuous numbered question list, without difficulty sections.

Use the sun/moon icon button in the top-right corner to switch between light and dark appearances: the moon switches to dark, and the sun switches to light. The button includes an accessible label and tooltip. The initial theme follows your system preference, and your selection is saved in browser local storage for future visits and other topic pages. If browser storage is blocked, a visible message explains that the preference cannot be saved.

Both themes use a coordinated navy/blue palette: cool light surfaces in light mode and deep navy surfaces in dark mode. Shared colors are defined in the `:root` and `[data-theme="dark"]` variables in `styles.css`; topic accents use the `navy`, `indigo`, `blue`, `steel`, `cobalt`, `periwinkle`, and `slate` classes.

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
- The fourteen topic HTML files: directly linkable topic pages, including `prompt-engineering.html`, `linux.html`, `ai-fine-tuning.html`, and `ai-security.html`.
- `questions.js`: editable topic and Q&A data.
- `app.js`: shared page rendering, navigation, and search behavior.
- `theme.js`: applies the saved or system theme before the page is painted.
- `styles.css`: layout, colors, typography, and responsive styles.

Fonts are optionally loaded from Google Fonts; system fonts are used when offline. No external images, libraries, or API keys are needed. JavaScript must be enabled.
