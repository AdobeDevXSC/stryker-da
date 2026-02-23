import { getConfig, getMetadata } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';
import { setColorScheme } from '../section-metadata/section-metadata.js';

const { locale } = getConfig();

const HEADER_PATH = '/fragments/nav/header';
const HEADER_ACTIONS = [
  '/tools/widgets/scheme',
  '/tools/widgets/language',
  '/tools/widgets/toggle',
];

function closeAllMenus() {
  const openMenus = document.body.querySelectorAll('header .is-open');
  for (const openMenu of openMenus) {
    openMenu.classList.remove('is-open');
  }
}

function docClose(e) {
  if (e.target.closest('header')) return;
  closeAllMenus();
}

function toggleMenu(menu) {
  if (!menu) return;

  const isOpen = menu.classList.contains('is-open');
  closeAllMenus();
  if (isOpen) {
    document.removeEventListener('click', docClose);
    return;
  }

  // Setup the global close event
  document.addEventListener('click', docClose);
  menu.classList.add('is-open');
}

function decorateLanguage(btn) {
  if (!btn) return;

  const section = btn.closest('.section');
  if (!section) return;

  btn.addEventListener('click', async () => {
    let menu = section.querySelector('.language.menu');
    if (!menu) {
      const content = document.createElement('div');
      content.classList.add('block-content');

      const fragment = await loadFragment(`${locale.prefix}${HEADER_PATH}/languages`);
      if (!fragment) {
        console.warn('decorateLanguage: no language fragment found');
        return;
      }

      menu = document.createElement('div');
      menu.className = 'language menu';
      menu.append(fragment);
      content.append(menu);
      section.append(content);
    }
    toggleMenu(section);
  });
}

function decorateScheme(btn) {
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const { body } = document;

    let currPref = localStorage.getItem('color-scheme');
    if (!currPref) {
      currPref = matchMedia('(prefers-color-scheme: dark)')
        .matches ? 'dark-scheme' : 'light-scheme';
    }

    const theme = currPref === 'dark-scheme'
      ? { add: 'light-scheme', remove: 'dark-scheme' }
      : { add: 'dark-scheme', remove: 'light-scheme' };

    body.classList.remove(theme.remove);
    body.classList.add(theme.add);
    localStorage.setItem('color-scheme', theme.add);

    // Re-calculate section schemes
    const sections = document.querySelectorAll('.section');
    for (const section of sections) {
      setColorScheme(section);
    }
  });
}

function decorateNavToggle(btn) {
  if (!btn) return;

  btn.addEventListener('click', () => {
    const header = document.body.querySelector('header');
    if (header) header.classList.toggle('is-mobile-open');
  });
}

async function decorateAction(header, pattern) {
  if (!header) return;

  const link = header.querySelector(`[href*="${pattern}"]`);
  if (!link) return;

  const icon = link.querySelector('.icon');
  const text = link.textContent && link.textContent.trim();
  const btn = document.createElement('button');

  if (icon) btn.append(icon);
  if (text) {
    const textSpan = document.createElement('span');
    textSpan.className = 'text';
    textSpan.textContent = text;
    btn.append(textSpan);
  }

  const wrapper = document.createElement('div');
  const baseClass = icon?.classList?.[1]?.replace('icon-', '') || 'action';
  wrapper.className = `action-wrapper ${baseClass}`;
  wrapper.append(btn);

  const linkLi = link.parentElement;
  const linkContainer = linkLi && linkLi.parentElement;
  if (!linkLi || !linkContainer) return;

  linkContainer.replaceChild(wrapper, linkLi);

  if (pattern === '/tools/widgets/language') decorateLanguage(btn);
  if (pattern === '/tools/widgets/scheme') decorateScheme(btn);
  if (pattern === '/tools/widgets/toggle') decorateNavToggle(btn);
}

function decorateMenu() {
  // TODO: finish single menu support
  return null;
}

function decorateMegaMenu(li) {
  if (!li) return null;

  const menu = li.querySelector('.fragment-content');
  if (!menu) return null;

  const wrapper = document.createElement('div');
  wrapper.className = 'mega-menu';
  wrapper.append(menu);
  li.append(wrapper);
  return wrapper;
}

function decorateNavItem(li) {
  if (!li) return;

  li.classList.add('main-nav-item');
  const link = li.querySelector(':scope > p > a');
  if (link) link.classList.add('main-nav-link');

  const menu = decorateMegaMenu(li) || decorateMenu(li);
  if (!(menu || link)) return;

  if (link) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMenu(li);
    });
  }
}

function decorateBrandSection(section) {
  if (!section) return;

  section.classList.add('brand-section');
  const brandLink = section.querySelector('a');
  if (!brandLink) return;

  const [, text] = brandLink.childNodes;
  if (!text) return;

  const span = document.createElement('span');
  span.className = 'brand-text';
  span.append(text);
  brandLink.append(span);
}

function decorateNavSection(section) {
  if (!section) return;

  section.classList.add('main-nav-section');
  const navContent = section.querySelector('.default-content');
  const navList = section.querySelector('ul');
  if (!navList) return;

  navList.classList.add('main-nav-list');

  const nav = document.createElement('nav');
  nav.append(navList);

  // In UE, .default-content might not exist yet
  if (navContent) {
    navContent.append(nav);
  } else {
    section.append(nav);
  }

  const mainNavItems = nav.querySelectorAll('ul > li');
  for (const navItem of mainNavItems) {
    decorateNavItem(navItem);
  }
}

async function decorateActionSection(section) {
  if (!section) return;

  section.classList.add('actions-section');
}

async function decorateHeader(fragment) {
  if (!fragment) return;

  const sections = fragment.querySelectorAll(':scope > .section');
  if (sections[0]) decorateBrandSection(sections[0]);
  if (sections[1]) decorateNavSection(sections[1]);
  if (sections[2]) await decorateActionSection(sections[2]);

  for (const pattern of HEADER_ACTIONS) {
    await decorateAction(fragment, pattern);
  }
}

/**
 * loads and decorates the header
 * @param {Element} el The header element
 */
export default async function init(el) {
  // Fallback for UE/instrumentation: use the real <header> if no element is passed
  const container = el || document.querySelector('header');

  if (!container) {
    console.warn('Header init called without a valid container');
    return;
  }

  const headerMeta = getMetadata('header');
  const path = headerMeta || HEADER_PATH;

  try {
    const fragment = await loadFragment(`${locale.prefix}${path}`);
    if (!fragment) {
      console.warn(`No header fragment found at ${locale.prefix}${path}`);
      return;
    }

    fragment.classList.add('header-content');
    await decorateHeader(fragment);

    // Clear old header content to avoid duplicates
    container.innerHTML = '';
    container.append(fragment);
  } catch (e) {
    console.error('Error loading header', e);
  }
}