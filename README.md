# StudioHenge Website

The website and its journal are maintained in this repository. The journal reads Markdown files from `content/posts/`. Each change to the `main` branch runs a GitHub Actions build and publishes the latest journal feed to GitHub Pages. The StudioHenge Site loads that feed when a reader opens the journal.

For the initial setup, enable **GitHub Actions** as the publishing source in **Settings → Pages**. The workflow publishes the `dist/` folder, including `notes/feed.json` and any images uploaded to `content/media/`. Set `window.STUDIOHENGE_BLOG_FEED_URL` in `dist/notes/config.js` to the public GitHub Pages URL ending in `/notes/feed.json`; the StudioHenge Site then reads the latest posts on each visit.

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
