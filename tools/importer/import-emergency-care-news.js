/* eslint-disable */
/* global WebImporter */

// TRANSFORMER IMPORTS
import strykerCleanupTransformer from './transformers/stryker-cleanup.js';

// TRANSFORMER REGISTRY
const transformers = [strykerCleanupTransformer];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'emergency-care-news',
  description: 'Emergency care news article pages with H1 title, publication date, hero image, article body content with H2/H3 headings, paragraphs, bullet lists, inline links. Includes Related products cards section, Resources columns section with Explore/Learn/Support/More links, and footnotes/disclaimers section.',
  urls: [
    'https://www.stryker.com/us/en/emergency-care/news/2026/streamlining-hospital-workflows-with-data-and-devices.html'
  ],
  blocks: [
    {
      name: 'cards',
      instances: ['.c-customizeable']
    },
    {
      name: 'columns',
      instances: ['.experienceFragment']
    }
  ]
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, payload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Parse the Related products section into a Cards block.
 * Source: .c-customizeable container with .item children
 * Each item has .img-cont (image) and .desc-container (h3, p, a.action-link)
 * Creates a single Cards block with 2-column rows (image | content)
 */
function parseRelatedCards(main, document) {
  const container = main.querySelector('.c-customizeable');
  if (!container) return false;

  const items = container.querySelectorAll('.item');
  if (!items.length) return false;

  const cells = [];
  items.forEach((item) => {
    const imageCell = document.createElement('div');
    const contentCell = document.createElement('div');

    // Image
    const img = item.querySelector('img');
    if (img) {
      const imgEl = document.createElement('img');
      imgEl.src = img.src;
      imgEl.alt = img.alt || '';
      imageCell.append(imgEl);
    }

    // Title (h3 as bold text)
    const h3 = item.querySelector('h3');
    if (h3) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = h3.textContent.trim();
      p.append(strong);
      contentCell.append(p);
    }

    // Description paragraph
    const descP = item.querySelector('.desc-container > p');
    if (descP && descP.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = descP.textContent.trim();
      contentCell.append(p);
    }

    // CTA link
    const cta = item.querySelector('a.action-link');
    if (cta) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = cta.href;
      a.textContent = cta.textContent.trim();
      p.append(a);
      contentCell.append(p);
    }

    cells.push([imageCell, contentCell]);
  });

  if (cells.length === 0) return false;

  // Get the section heading (e.g., "Related")
  const heading = container.querySelector('h2');
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards', cells });

  // Build replacement: <hr> + heading + block
  const wrapper = document.createElement('div');
  wrapper.append(document.createElement('hr'));
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.trim();
    wrapper.append(h2);
  }
  wrapper.append(block);

  // Replace the container (or its parent .customizable wrapper)
  const parent = container.closest('.customizable') || container;
  parent.replaceWith(wrapper);

  return true;
}

/**
 * Parse the Resources section into a Columns block.
 * Source: .experienceFragment containing .aem-Grid with .text.parbase columns
 * Each column has .c-rich-text-editor with heading (.futura-bold) and link paragraphs
 * Creates a single Columns block with one row of N cells
 */
function parseResourcesColumns(main, document) {
  const expFrag = main.querySelector('.experienceFragment');
  if (!expFrag) return false;

  const grid = expFrag.querySelector('.aem-Grid');
  if (!grid) return false;

  // Get the section heading (e.g., "Resources")
  const sectionHeading = grid.querySelector('.section-title h2')
    || grid.querySelector('.c-section-title h2')
    || expFrag.querySelector('h2');

  // Get column divs (text parbase elements with aem-GridColumn class)
  const colDivs = grid.querySelectorAll('.text.parbase');
  if (!colDivs.length) return false;

  const row = [];
  colDivs.forEach((colDiv) => {
    const cellContent = document.createElement('div');

    // Column heading (in .futura-bold span)
    const headingEl = colDiv.querySelector('.futura-bold');
    if (headingEl) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = headingEl.textContent.trim();
      p.append(strong);
      cellContent.append(p);
    }

    // Extract links from paragraphs
    const richText = colDiv.querySelector('.c-rich-text-editor');
    if (richText) {
      const paras = richText.querySelectorAll('p');
      paras.forEach((para) => {
        // Skip the heading paragraph (already extracted above)
        if (para.querySelector('.futura-bold')) return;

        const link = para.querySelector('a');
        if (link && link.textContent.trim()) {
          const p = document.createElement('p');
          const a = document.createElement('a');
          a.href = link.href;
          a.textContent = link.textContent.trim();
          p.append(a);
          cellContent.append(p);
        }
      });
    }

    if (cellContent.children.length > 0) {
      row.push(cellContent);
    }
  });

  if (row.length === 0) return false;

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells: [row] });

  // Build replacement: <hr> + heading + block
  const wrapper = document.createElement('div');
  wrapper.append(document.createElement('hr'));
  if (sectionHeading) {
    const h2 = document.createElement('h2');
    h2.textContent = sectionHeading.textContent.trim();
    wrapper.append(h2);
  }
  wrapper.append(block);

  expFrag.replaceWith(wrapper);
  return true;
}

/**
 * Add a section break before the disclaimers section
 */
function addDisclaimerSectionBreak(main, document) {
  const disclaimer = main.querySelector('.c-disclaimer');
  if (!disclaimer) return;

  const container = disclaimer.closest('.container') || disclaimer.parentElement;
  if (container) {
    const hr = document.createElement('hr');
    container.insertAdjacentElement('beforebegin', hr);
  }
}

// EXPORT DEFAULT CONFIGURATION
export default {
  /**
   * Main transformation function for emergency-care-news template
   */
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Parse blocks on page
    const blocksFound = [];

    // Parse Related products → Cards block
    if (parseRelatedCards(main, document)) {
      blocksFound.push('cards');
    }

    // Parse Resources → Columns block
    if (parseResourcesColumns(main, document)) {
      blocksFound.push('columns');
    }

    // Add section break before disclaimers
    addDisclaimerSectionBreak(main, document);

    // 3. Execute afterTransform transformers (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 4. Apply WebImporter built-in rules
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5. Generate sanitized path (full localized path without extension)
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: blocksFound,
      }
    }];
  }
};
