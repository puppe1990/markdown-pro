# Markdown Pro

Markdown Pro is a React + Vite editor focused on writing, previewing, importing, and exporting Markdown documents. The app includes multi-tab editing, version history, reading mode, theme switching, clipboard copy, and export flows for `.md`, `.pdf`, and `.docx`.

## Stack

- React 19
- TypeScript
- Vite
- Vitest + Testing Library
- ESLint + Prettier

## Features

- Live Markdown editing with side-by-side preview
- Multiple document tabs
- Version history with revert support
- Markdown import from local files
- Export to Markdown, PDF, and DOCX
- Reading mode and light/dark theme
- Clipboard copy for the current document

## Getting Started

### Prerequisites

- Node.js 20+ recommended
- npm

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

The Vite dev server will print the local URL in the terminal, usually `http://localhost:5173`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run test
npm run test:watch
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## Project Structure

```text
components/   UI components
hooks/        State and editor behavior hooks
services/     Export and image handling services
src/test/     Test setup
App.tsx       App composition
index.tsx     Entry point
types.ts      Shared types
```

## Working Rules

Development guidelines for this repository live in [AGENTS.md](./AGENTS.md).

## Verification

Before opening or merging changes, run:

```bash
npm run test
npm run lint
npm run build
```
