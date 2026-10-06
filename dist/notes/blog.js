document.querySelectorAll('[data-dummy-link]').forEach(link => {
  link.addEventListener('click', event => event.preventDefault());
});

const list = document.querySelector('#journal-list');
const grid = document.querySelector('#journal-grid');
const status = document.querySelector('#journal-status');
const article = document.querySelector('#journal-article');
const filters = [...document.querySelectorAll('[data-filter]')];
let allPosts = [];
let activeFeedUrl = '';

function formattedDate(date) {
  return new Intl.DateTimeFormat('en', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${date}T00:00:00Z`));
}

function textElement(tag, className, value) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = value;
  return element;
}

function entryCard(post, featured) {
  const card = document.createElement('a');
  card.className = `entry-card${featured ? ' entry-card-featured' : ''}`;
  card.href = `?post=${encodeURIComponent(post.slug)}`;
  card.append(
    textElement('span', 'entry-meta', `${post.typeLabel}  /  ${formattedDate(post.date)}`),
    textElement('strong', 'entry-title', post.title),
    textElement('span', 'entry-excerpt', post.excerpt),
    textElement('span', 'entry-bottom', `${post.readingMinutes} MIN READ    ·    READ ENTRY  ↗`)
  );
  return card;
}

function showList(type = 'all') {
  const posts = type === 'all' ? allPosts : allPosts.filter(post => post.type === type);
  grid.replaceChildren(...posts.map((post, index) => entryCard(post, index === 0 && type === 'all')));
  status.textContent = posts.length ? `${posts.length} ${posts.length === 1 ? 'entry' : 'entries'}` :
    type === 'all' ? 'The first entry is on its way. Come back soon.' : 'No entries in this collection yet.';
  status.classList.toggle('journal-status-empty', posts.length === 0);
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === type)));
}

function showArticle(post) {
  list.hidden = true;
  article.hidden = false;
  document.querySelector('#article-meta').textContent = `${post.typeLabel}  /  ${formattedDate(post.date)}  /  ${post.readingMinutes} MIN READ`;
  document.querySelector('#article-title').textContent = post.title;
  document.querySelector('#article-excerpt').textContent = post.excerpt;
  // The build step renders Markdown with raw HTML disabled and safe link handling.
  const body = document.querySelector('#article-body');
  body.innerHTML = post.html;
  body.querySelectorAll('[src], [href]').forEach(element => {
    const attribute = element.hasAttribute('src') ? 'src' : 'href';
    const value = element.getAttribute(attribute);
    if (value && !/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(value)) {
      element.setAttribute(attribute, new URL(value, activeFeedUrl).href);
    }
  });
  document.title = `${post.title} · StudioHenge`;
}

async function fetchFeed(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
    if (!response.ok) throw new Error(`Feed returned ${response.status}`);
    const feed = await response.json();
    if (feed.schemaVersion !== 1 || !Array.isArray(feed.posts)) throw new Error('Invalid feed');
    return feed;
  } finally {
    clearTimeout(timeout);
  }
}

async function loadJournal() {
  const localFeed = new URL('feed.json', location.href).href;
  const remoteFeed = window.STUDIOHENGE_BLOG_FEED_URL;
  let feed;
  try {
    activeFeedUrl = remoteFeed || localFeed;
    feed = await fetchFeed(activeFeedUrl);
  } catch (error) {
    if (!remoteFeed) throw error;
    activeFeedUrl = localFeed;
    feed = await fetchFeed(localFeed);
  }
  allPosts = feed.posts;
  const slug = new URLSearchParams(location.search).get('post');
  if (slug) {
    const post = allPosts.find(item => item.slug === slug);
    if (post) return showArticle(post);
    showList();
    status.textContent = 'That entry could not be found. Browse the journal below.';
    return;
  }
  showList();
}

filters.forEach(button => button.addEventListener('click', () => showList(button.dataset.filter)));
loadJournal().catch(() => {
  status.textContent = 'The journal is temporarily unavailable. Please try again shortly.';
  status.classList.add('journal-status-empty');
});
