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

function postCoverUrl(post) {
  return post.cover && /^media\/[a-z0-9]+(?:[._-][a-z0-9]+)*\.(?:png|jpe?g|webp)$/i.test(post.cover)
    ? new URL(post.cover, activeFeedUrl).href
    : null;
}

function entryCard(post) {
  const card = document.createElement('a');
  card.className = 'entry-card';
  card.href = `?post=${encodeURIComponent(post.slug)}`;
  const imageUrl = postCoverUrl(post);
  if (imageUrl) {
    card.style.backgroundImage = `linear-gradient(90deg, rgba(7,20,15,.9), rgba(7,20,15,.62) 72%, rgba(7,20,15,.48)), linear-gradient(0deg, rgba(6,17,12,.68), transparent 52%), url("${imageUrl}")`;
    card.style.backgroundPosition = 'center';
    card.style.backgroundSize = 'cover';
  }
  const bottom = document.createElement('span');
  bottom.className = 'entry-bottom';
  bottom.append(
    textElement('span', 'entry-reading-time', `${post.readingMinutes} MIN READ`),
    textElement('span', 'entry-separator', '·'),
    textElement('span', 'entry-cta', 'READ ENTRY  ↗')
  );
  card.append(
    textElement('span', 'entry-meta', `${post.typeLabel}  /  ${formattedDate(post.date)}`),
    textElement('strong', 'entry-title', post.title),
    textElement('span', 'entry-excerpt', post.excerpt),
    bottom
  );
  return card;
}

function showList(type = 'all') {
  document.documentElement.classList.remove('article-route');
  const posts = type === 'all' ? allPosts : allPosts.filter(post => post.type === type);
  grid.replaceChildren(...posts.map(entryCard));
  status.textContent = posts.length ? `${posts.length} ${posts.length === 1 ? 'entry' : 'entries'}` :
    type === 'all' ? 'The first post is on its way. Come back soon.' : 'No posts in this collection yet.';
  status.classList.toggle('journal-status-empty', posts.length === 0);
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === type)));
}

function showArticle(post) {
  document.documentElement.classList.add('article-route');
  list.hidden = true;
  article.hidden = false;
  const imageUrl = postCoverUrl(post);
  const page = document.querySelector('.journal-page');
  if (imageUrl) page.style.setProperty('--article-cover', `url("${imageUrl}")`);
  else page.style.removeProperty('--article-cover');
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

async function loadFileFeed() {
  const feed = await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL('feed.js', location.href).href;
    script.onload = () => resolve(window.STUDIOHENGE_LOCAL_FEED);
    script.onerror = () => reject(new Error('Local posts feed unavailable'));
    document.head.append(script);
  });
  if (feed?.schemaVersion !== 1 || !Array.isArray(feed.posts)) throw new Error('Invalid local feed');
  return feed;
}

async function loadJournal() {
  const localFeed = new URL('feed.json', location.href).href;
  const localPreview = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const remoteFeed = localPreview ? '' : window.STUDIOHENGE_BLOG_FEED_URL;
  let feed;
  if (location.protocol === 'file:') {
    activeFeedUrl = localFeed;
    feed = await loadFileFeed();
  } else {
    try {
      activeFeedUrl = remoteFeed || localFeed;
      feed = await fetchFeed(activeFeedUrl);
    } catch (error) {
      if (!remoteFeed) throw error;
      activeFeedUrl = localFeed;
      feed = await fetchFeed(localFeed);
    }
  }
  allPosts = feed.posts;
  const slug = new URLSearchParams(location.search).get('post');
  if (slug) {
    const post = allPosts.find(item => item.slug === slug);
    if (post) return showArticle(post);
    showList();
    status.textContent = 'That post could not be found. Browse the posts below.';
    return;
  }
  showList();
}

filters.forEach(button => button.addEventListener('click', () => showList(button.dataset.filter)));
loadJournal().catch(() => {
  document.documentElement.classList.remove('article-route');
  status.textContent = 'The posts are temporarily unavailable. Please try again shortly.';
  status.classList.add('journal-status-empty');
});
