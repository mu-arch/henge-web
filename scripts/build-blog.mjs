import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const root = fileURLToPath(new URL('../', import.meta.url));
const postsDirectory = path.join(root, 'content/posts');
const mediaDirectory = path.join(root, 'content/media');
const outputDirectory = path.join(root, 'dist/notes');
const markdown = new MarkdownIt({ html: false, linkify: true, typographer: false });
const types = new Map([
  ['field-note', 'Field Note'],
  ['dev-diary', 'Dev Diary']
]);

function requiredText(value, name, filename) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${filename}: ${name} must be nonempty text`);
  }
  return value.trim();
}

function normalizedDate(frontMatter, filename) {
  const line = frontMatter.match(/^date:\s*(.*?)\s*$/m)?.[1];
  const date = line?.trim().replace(/^['"]|['"]$/g, '') ?? '';
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`${filename}: date must be YYYY-MM-DD`);
  }
  return date;
}

export function compilePost(filename, source) {
  const slug = filename.replace(/\.md$/i, '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`${filename}: filename must use lowercase words separated by hyphens`);
  }

  const { data, content, matter: frontMatter } = matter(source);
  if (data.draft === true) return null;

  const title = requiredText(data.title, 'title', filename);
  const excerpt = requiredText(data.excerpt, 'excerpt', filename);
  const type = requiredText(data.type, 'type', filename);
  if (!types.has(type)) {
    throw new Error(`${filename}: type must be field-note or dev-diary`);
  }
  const date = normalizedDate(frontMatter, filename);
  if (!content.trim()) throw new Error(`${filename}: post body is empty`);

  const words = content.match(/\b[\p{L}\p{N}’'-]+\b/gu)?.length ?? 0;
  return {
    slug,
    title,
    excerpt,
    type,
    typeLabel: types.get(type),
    date,
    readingMinutes: Math.max(1, Math.ceil(words / 200)),
    html: markdown.render(content)
  };
}

export async function buildFeed(sourceDir = postsDirectory) {
  const files = (await readdir(sourceDir)).filter(file => file.endsWith('.md')).sort();
  const posts = [];
  for (const filename of files) {
    const post = compilePost(filename, await readFile(path.join(sourceDir, filename), 'utf8'));
    if (post) posts.push(post);
  }
  posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  return { schemaVersion: 1, posts };
}

async function copyMedia() {
  const target = path.join(outputDirectory, 'media');
  await rm(target, { recursive: true, force: true });
  let files;
  try {
    files = await readdir(mediaDirectory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  await mkdir(target, { recursive: true });
  for (const file of files) {
    if (file.isFile() && !file.name.startsWith('.')) {
      await copyFile(path.join(mediaDirectory, file.name), path.join(target, file.name));
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const feed = await buildFeed();
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, 'feed.json'), `${JSON.stringify(feed, null, 2)}\n`);
  await copyMedia();
  process.stdout.write(`Built ${feed.posts.length} published blog post(s).\n`);
}
