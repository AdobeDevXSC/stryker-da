const PAGE_SIZE = 10;

function buildCard(article) {
  const card = document.createElement('article');
  card.className = 'news-feed-card';

  const imageDiv = document.createElement('div');
  imageDiv.className = 'news-feed-card-image';
  if (article.image) {
    const img = document.createElement('img');
    img.src = article.image;
    img.alt = article.title || '';
    img.loading = 'lazy';
    imageDiv.append(img);
  }
  card.append(imageDiv);

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'news-feed-card-body';

  const title = document.createElement('h2');
  title.textContent = article.title || '';
  bodyDiv.append(title);

  if (article.description) {
    const desc = document.createElement('p');
    desc.textContent = article.description;
    bodyDiv.append(desc);
  }

  const link = document.createElement('a');
  link.href = `${article.path}.html`;
  link.className = 'news-feed-card-cta';
  link.textContent = 'Read More';
  const arrow = document.createElement('span');
  arrow.className = 'news-feed-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  link.append(arrow);
  bodyDiv.append(link);

  card.append(bodyDiv);
  return card;
}

function buildTabs(categories, activeCategory, onSelect) {
  const nav = document.createElement('nav');
  nav.className = 'news-feed-tabs';
  nav.setAttribute('aria-label', 'News categories');

  categories.forEach(({ label, value }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'news-feed-tab';
    btn.textContent = label;
    btn.dataset.category = value;
    if (value === activeCategory) btn.classList.add('active');
    btn.addEventListener('click', () => onSelect(value));
    nav.append(btn);
  });

  return nav;
}

function categorizeArticle(article) {
  const p = (article.path || '').toLowerCase();
  if (p.includes('/video/')) return 'videos';
  if (p.includes('/news/video/')) return 'videos';
  const t = (article.title || '').toLowerCase();
  if (t.startsWith('survivor:') || t.startsWith('survivor ')) return 'survivors';
  return 'articles';
}

export default async function decorate(block) {
  const rows = [...block.children];

  // First row, first cell: query-index URL (plain text, not a link)
  const firstCell = rows[0]?.children[0];
  const feedUrl = firstCell?.querySelector('a')?.href
    || firstCell?.textContent?.trim();

  // Second column of first row: sidebar content
  const sidebarSource = rows[0]?.children[1];

  // Build layout
  block.textContent = '';
  block.classList.add('news-feed-loaded');

  const layout = document.createElement('div');
  layout.className = 'news-feed-layout';

  const mainCol = document.createElement('div');
  mainCol.className = 'news-feed-main';

  const sideCol = document.createElement('div');
  sideCol.className = 'news-feed-sidebar';

  // Move sidebar content
  if (sidebarSource) {
    const clone = sidebarSource.cloneNode(true);
    clone.className = 'news-feed-sidebar-content';
    // Restore any video embeds back to plain links (EDS auto-converts YouTube links)
    clone.querySelectorAll('.video[data-src]').forEach((vid) => {
      const li = vid.closest('li');
      if (li) {
        const a = document.createElement('a');
        a.href = vid.dataset.src;
        a.textContent = 'YouTube';
        a.target = '_blank';
        a.rel = 'noopener';
        li.textContent = '';
        li.append(a);
      }
    });
    sideCol.append(clone);
  }

  layout.append(mainCol, sideCol);
  block.append(layout);

  // State
  let allArticles = [];
  let activeCategory = 'all';
  let displayCount = PAGE_SIZE;

  const categories = [
    { label: 'All News', value: 'all' },
    { label: 'Articles', value: 'articles' },
    { label: 'Survivor Stories', value: 'survivors' },
    { label: 'Videos', value: 'videos' },
  ];

  // Fetch all articles
  async function fetchArticles() {
    if (!feedUrl) return;
    try {
      const url = new URL(feedUrl, window.location.href);
      url.searchParams.set('limit', '500');
      const resp = await fetch(url.toString());
      if (!resp.ok) return;
      const json = await resp.json();
      allArticles = (json.data || []).map((a) => ({
        ...a,
        category: categorizeArticle(a),
      }));
      // Sort by lastModified descending
      allArticles.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
    } catch {
      /* silently fail */
    }
  }

  function getFiltered() {
    if (activeCategory === 'all') return allArticles;
    return allArticles.filter((a) => a.category === activeCategory);
  }

  function render() {
    mainCol.textContent = '';

    // Tabs
    const tabs = buildTabs(categories, activeCategory, (cat) => {
      activeCategory = cat;
      displayCount = PAGE_SIZE;
      render();
    });
    mainCol.append(tabs);

    const filtered = getFiltered();

    // Count indicator
    const showing = Math.min(displayCount, filtered.length);
    const counter = document.createElement('p');
    counter.className = 'news-feed-counter';
    counter.textContent = `Showing ${showing} of ${filtered.length}`;
    mainCol.append(counter);

    // Cards
    const cardList = document.createElement('div');
    cardList.className = 'news-feed-cards';
    filtered.slice(0, displayCount).forEach((article) => {
      cardList.append(buildCard(article));
    });
    mainCol.append(cardList);

    // Load More
    if (displayCount < filtered.length) {
      const loadMore = document.createElement('button');
      loadMore.type = 'button';
      loadMore.className = 'news-feed-load-more';
      loadMore.textContent = 'Load More';
      loadMore.addEventListener('click', () => {
        displayCount += PAGE_SIZE;
        render();
      });
      mainCol.append(loadMore);
    }
  }

  await fetchArticles();
  render();
}
