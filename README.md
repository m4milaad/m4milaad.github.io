# Personal portfolio

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![WebGL2](https://img.shields.io/badge/WebGL2-scene-orange)](https://www.khronos.org/webgl/)

Personal site blending a **React / Next.js** layout (left hero, scrollable right column, tech stack marquees) with a **legacy WebGL2 desk scene** and **retro terminal** driven by scripts in `public/Scripts/`.

**Live site:** [m4milaad.github.io](https://m4milaad.github.io/)

## Features

- **Two-pane layout** — Fixed left panel (profile, theme toggle, links) and scrollable right panel (tech stack, projects, experience, education, accolades).
- **3D + terminal** — WebGL2 rendering, custom shaders, and an interactive CLI loaded from legacy JavaScript (`Main.js`, `RenderingFunctions.js`, etc.).
- **Static export** — `output: "export"` in Next.js; deployable to **GitHub Pages** with no server runtime.
- **CI deploy** — Push to `main` runs `.github/workflows/deploy.yml`, builds with `npm ci` / `npm run build`, and publishes the `out/` directory.

## Getting started

Requirements: **Node.js 20+** (matches the deploy workflow).

```bash
git clone https://github.com/m4milaad/m4milaad.github.io.git
cd m4milaad.github.io
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script    | Description                          |
| --------- | ------------------------------------ |
| `npm run dev`   | Next.js dev server                   |
| `npm run build` | Production build → `out/` (static)   |
| `npm run start` | Serve production build (after build) |
| `npm run lint`  | ESLint (`eslint-config-next`)        |

## Project layout

| Path | Role |
| ---- | ---- |
| `app/` | App Router: `layout.tsx`, `page.tsx` |
| `components/PortfolioShell.tsx` | Page shell: `#MainDiv`, `#RightPanel`, script loader, section nav |
| `components/LeftPanelHero.tsx` | Left column hero |
| `components/tech-stack/` | Tech stack marquees and icon data |
| `components/site-theme/` | Light/dark context (`SiteThemeProvider`) |
| `public/Scripts/` | WebGL / terminal / model logic consumed by the shell |
| `public/Images/`, `public/Sounds/` | Static assets |
| `styles/` | `portfolio-layout.css`, `right-panel-*.css`, `left-panel-hero.css` |

## Built with

- [Next.js](https://nextjs.org/) 14 (App Router), [React](https://react.dev/) 18, [TypeScript](https://www.typescriptlang.org/)
- WebGL2, HTML, CSS, and vanilla JS for the 3D scene and terminal (see `public/Scripts/`)
- [GitHub Pages](https://pages.github.com/) for hosting

## Inspirations

- Modern layout influenced by [Brittany Chiang’s portfolio](https://brittanychiang.com/).
- Retro terminal / desk vibe influenced by [Edward Hwang’s site](https://www.edwardh.io/).

## Contact

Questions: [mb4milad.bhattt@gmail.com](mailto:mb4milad.bhattt@gmail.com).
