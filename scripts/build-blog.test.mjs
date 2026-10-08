import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildFeed, compilePost } from './build-blog.mjs';

test('published posts sort newest first, drafts stay out, and raw HTML stays inert', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'studiohenge-blog-'));
  try {
    await writeFile(path.join(directory, 'older-note.md'), `---\ntitle: Older note\ndate: 2026-01-01\ntype: field-note\nexcerpt: First note.\n---\n\nHello.\n`);
    await writeFile(path.join(directory, 'newer-diary.md'), `---\ntitle: Newer diary\ndate: 2026-02-01\ntype: dev-diary\nexcerpt: Second note.\n---\n\n<script>alert('no')</script>\n\nA **real** paragraph.\n`);
    await writeFile(path.join(directory, 'unfinished.md'), `---\ndraft: true\n---\n\nNot published.\n`);
    const feed = await buildFeed(directory);
    assert.deepEqual(feed.posts.map(post => post.slug), ['newer-diary', 'older-note']);
    assert.equal(feed.posts[1].type, 'henge-news');
    assert.equal(feed.posts[1].typeLabel, 'Henge News');
    assert.equal(feed.posts[0].html.includes('<script>'), false);
    assert.match(feed.posts[0].html, /<strong>real<\/strong>/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('bad dates and unsupported categories stop publication', () => {
  const body = '\n---\n\nA post.';
  assert.throws(() => compilePost('bad-date.md', `---\ntitle: Test\ndate: 2026-02-31\ntype: field-note\nexcerpt: Test.${body}`), /date must be/);
  assert.throws(() => compilePost('bad-type.md', `---\ntitle: Test\ndate: 2026-02-01\ntype: news\nexcerpt: Test.${body}`), /type must be/);
  assert.equal(compilePost('henge-news.md', `---\ntitle: Test\ndate: 2026-02-01\ntype: henge-news\nexcerpt: Test.${body}`).typeLabel, 'Henge News');
  assert.equal(compilePost('company-news.md', `---\ntitle: Test\ndate: 2026-02-01\ntype: company-announcement\nexcerpt: Test.${body}`).typeLabel, 'Company Announcement');
  assert.equal(compilePost('with-cover.md', `---\ntitle: Test\ndate: 2026-02-01\ntype: dev-diary\nexcerpt: Test.\ncover: media/henge-cogwheels.webp${body}`).cover, 'media/henge-cogwheels.webp');
  assert.throws(() => compilePost('bad-cover.md', `---\ntitle: Test\ndate: 2026-02-01\ntype: dev-diary\nexcerpt: Test.\ncover: ../other.png${body}`), /cover must be/);
});
