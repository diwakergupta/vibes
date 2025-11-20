# AGENTS.md

This repository contains "vibe-coded" experiments, tools, and demos.

## Repository Structure & Workflow

1.  **Directory Structure**:
    *   Each new tool or experiment must live in its own unique subdirectory (e.g., `my-new-tool/`).
    *   Do not clutter the root directory with tool files.

2.  **Tool Requirements**:
    *   **Self-Contained**: Each tool should typically be a single, self-contained `index.html` file.
    *   **Documentation**: Each subdirectory **must** contain a `README.md` file.
        *   This README must describe the tool.
        *   This README must include the **Prompt** used to create the tool.

3.  **Root README**:
    *   When adding a new tool, you **must** update the list of experiments in the root `README.md`.
    *   Format: `- [Tool Name](./tool-directory/)`

4.  **Deployment**:
    *   The repository is automatically deployed to GitHub Pages via GitHub Actions on push to `main`.
    *   The custom domain is `vibes.diwaker.io`.
    *   Ensure your changes work as static HTML files.

## Context & Identity

*   The author is Diwaker Gupta (https://diwaker.io/about).
*   This is a collection of fun, lightweight, often AI-generated ("vibe-coded") web experiments.
