# StudioHenge Website

The website and its Posts page are maintained in this repository. Posts are written as Markdown files in `content/posts/`. Each change to the `main` branch runs a GitHub Actions build and publishes the site at https://mu-arch.github.io/henge-web/. The StudioHenge Site also reads the published posts feed, so new posts appear at both addresses.

GitHub Pages is configured to publish through **GitHub Actions**. The workflow publishes the `dist/` folder, including `notes/feed.json` and any images uploaded to `content/media/`. The StudioHenge Site reads the feed URL configured in `dist/notes/config.js` whenever a reader opens the Posts page.

## Publish a post

1. In GitHub, open `content/posts/` and choose **Add file → Create new file** or **Upload files**. Give the file a lowercase, hyphenated name ending in `.md`, such as `building-the-first-village.md`.
2. Add front matter and the body:

   ```md
   ---
   title: Building the first village
   date: 2026-10-06
   type: dev-diary
   excerpt: A short introduction for the Posts index.
   ---

   Your post begins here.
   ```

   Use `type: henge-news` for game updates, `type: company-announcement` for studio announcements, or `type: dev-diary` for a development diary. Older `type: field-note` posts are still accepted and appear under Henge News. Add `draft: true` to keep an unfinished file out of the public feed.
3. Commit the file to `main`. The **Build and publish StudioHenge** workflow validates the posts, builds the feed, and publishes it. The Posts page picks up the new feed automatically.

Images can be uploaded to `content/media/` and referenced from Markdown as `![Description](media/filename.png)`. Raw HTML in posts is displayed as text for safety.
Add `cover: media/filename.webp` to a post's front matter to use an uploaded image on its Posts index card and as a faded background on the post page. Add an image to the Markdown body only when it should appear inside the post.

Full-resolution pixel-art backgrounds and post covers are archived in `fullsize/`. Pages use compressed copies so readers do not download the source files.

To preview locally, run `pnpm install` and `pnpm build`, then serve the `dist/` directory or open `dist/notes/index.html` directly. The build also creates `feed.js` so the direct-file Posts preview can show local Markdown posts. Run `pnpm test` before changing the build script.
