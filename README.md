# StudioHenge Website

The website and its journal are maintained in this repository. The journal reads Markdown files from `content/posts/`. Each change to the `main` branch runs a GitHub Actions build and publishes the site at https://mu-arch.github.io/henge-web/. The StudioHenge Site also reads the published journal feed, so new posts appear at both addresses.

GitHub Pages is configured to publish through **GitHub Actions**. The workflow publishes the `dist/` folder, including `notes/feed.json` and any images uploaded to `content/media/`. The StudioHenge Site reads the feed URL configured in `dist/notes/config.js` whenever a reader opens the journal.

## Publish a note or dev diary

1. In GitHub, open `content/posts/` and choose **Add file → Create new file** or **Upload files**. Give the file a lowercase, hyphenated name ending in `.md`, such as `building-the-first-village.md`.
2. Add front matter and the body:

   ```md
   ---
   title: Building the first village
   date: 2026-10-06
   type: dev-diary
   excerpt: A short introduction for the journal index.
   ---

   Your post begins here.
   ```

   Use `type: field-note` for a worldbuilding note or `type: dev-diary` for a development diary. Add `draft: true` to keep an unfinished file out of the public feed.
3. Commit the file to `main`. The **Build and publish StudioHenge** workflow validates the posts, builds the feed, and publishes it. The journal picks up the new feed automatically.

Images can be uploaded to `content/media/` and referenced from Markdown as `![Description](media/filename.png)`. Raw HTML in posts is displayed as text for safety.

To preview locally, run `pnpm install`, `pnpm build`, then serve the `dist/` directory. Run `pnpm test` before changing the build script.
