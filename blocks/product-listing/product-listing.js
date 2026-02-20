function filterProducts(block) {
  const activeTab = block.querySelector('.product-listing-tab.active');
  const typeFilter = activeTab ? activeTab.dataset.type : 'all';
  const items = block.querySelectorAll('.product-listing-item');

  items.forEach((item) => {
    const itemType = item.dataset.type || 'product';
    if (typeFilter === 'all' || itemType === typeFilter) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
}

function buildFilters(block) {
  const filterRow = block.querySelector(':scope > div:first-child');
  if (!filterRow) return;

  filterRow.classList.add('product-listing-filters');
  const cells = filterRow.querySelectorAll(':scope > div');

  // Parse filter definitions from the first row cells
  const filters = [];
  cells.forEach((cell) => {
    const text = cell.textContent.trim();
    if (text.toLowerCase().startsWith('procedure:') || text.toLowerCase().startsWith('product type:')) {
      const [label, ...optionsParts] = text.split(':');
      const options = optionsParts.join(':').split(',').map((o) => o.trim()).filter(Boolean);
      filters.push({ label: label.trim(), options });
    }
  });

  // Build filter UI
  const filtersContainer = document.createElement('div');
  filtersContainer.className = 'product-listing-filter-bar';

  // Dropdowns
  if (filters.length) {
    const dropdowns = document.createElement('div');
    dropdowns.className = 'product-listing-dropdowns';
    filters.forEach(({ label, options }) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'product-listing-dropdown';
      const labelEl = document.createElement('div');
      labelEl.className = 'product-listing-dropdown-label';
      labelEl.textContent = label;
      const select = document.createElement('select');
      select.dataset.filter = label.toLowerCase().replace(/\s+/g, '-');
      const allOption = document.createElement('option');
      allOption.value = '';
      allOption.textContent = 'Show All';
      select.append(allOption);
      options.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.append(option);
      });
      wrapper.append(labelEl, select);
      dropdowns.append(wrapper);
    });
    filtersContainer.append(dropdowns);
  }

  // Show tabs (All / Product / Procedure)
  const tabs = document.createElement('div');
  tabs.className = 'product-listing-tabs';
  const tabLabel = document.createElement('span');
  tabLabel.className = 'product-listing-tab-label';
  tabLabel.textContent = 'Show:';
  tabs.append(tabLabel);
  ['All', 'Product', 'Procedure'].forEach((tabName) => {
    const tab = document.createElement('button');
    tab.className = 'product-listing-tab';
    tab.textContent = tabName;
    tab.dataset.type = tabName.toLowerCase();
    if (tabName === 'All') tab.classList.add('active');
    tab.addEventListener('click', () => {
      tabs.querySelectorAll('.product-listing-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      filterProducts(block);
    });
    tabs.append(tab);
  });
  filtersContainer.append(tabs);

  filterRow.innerHTML = '';
  filterRow.append(filtersContainer);

  // Add change listeners to dropdowns
  filtersContainer.querySelectorAll('select').forEach((select) => {
    select.addEventListener('change', () => filterProducts(block));
  });
}

function buildProducts(block) {
  const rows = [...block.querySelectorAll(':scope > div:not(:first-child)')];
  const grid = document.createElement('div');
  grid.className = 'product-listing-grid';

  const INITIAL_SHOW = 4;
  let visibleCount = 0;

  rows.forEach((row) => {
    const item = document.createElement('div');
    item.className = 'product-listing-item';

    const cols = [...row.children];
    const imgCol = cols[0];
    const textCol = cols[1];

    // Check for procedure type
    const typeText = textCol?.querySelector('em')?.textContent?.trim().toLowerCase();
    if (typeText === 'procedure') {
      item.dataset.type = 'procedure';
      textCol.querySelector('em')?.remove();
    } else {
      item.dataset.type = 'product';
    }

    // Build link wrapping the card
    const link = textCol?.querySelector('a');
    const href = link?.getAttribute('href') || '#';
    const name = link?.textContent?.trim() || textCol?.textContent?.trim() || '';

    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.className = 'product-listing-link';

    // Image
    const pic = imgCol?.querySelector('picture');
    if (pic) {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'product-listing-image';
      imgContainer.append(pic);
      anchor.append(imgContainer);
    }

    // Name
    const nameEl = document.createElement('h4');
    nameEl.className = 'product-listing-name';
    nameEl.textContent = name;
    anchor.append(nameEl);

    // Procedure badge
    if (item.dataset.type === 'procedure') {
      const badge = document.createElement('span');
      badge.className = 'product-listing-badge';
      badge.textContent = 'Procedure';
      const imgCont = anchor.querySelector('.product-listing-image');
      if (imgCont) imgCont.append(badge);
    }

    item.append(anchor);

    visibleCount += 1;
    if (visibleCount > INITIAL_SHOW) {
      item.classList.add('load-more-hidden');
    }

    grid.append(item);
    row.remove();
  });

  block.append(grid);

  // Load more button
  const hiddenItems = grid.querySelectorAll('.load-more-hidden');
  if (hiddenItems.length > 0) {
    const loadMore = document.createElement('button');
    loadMore.className = 'product-listing-load-more';
    loadMore.textContent = 'Load More';
    loadMore.addEventListener('click', () => {
      grid.querySelectorAll('.load-more-hidden').forEach((item) => {
        item.classList.remove('load-more-hidden');
      });
      loadMore.remove();
    });
    block.append(loadMore);
  }
}

export default function decorate(block) {
  buildFilters(block);
  buildProducts(block);
}
