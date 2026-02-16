/* eslint-disable */
/* global WebImporter */

/**
 * Parser for Hero block
 *
 * Source: https://www.stryker.com/us/en/index.html
 * Base Block: hero
 *
 * Block Structure (from block library):
 * - Row 1: Background image (optional)
 * - Row 2: Content (heading, description, CTA)
 *
 * Source HTML Patterns:
 * 1. Carousel hero: .carouselslidegroup > .carouselslide with video/image + text overlay
 * 2. Fullbleed panel: .fullbleedpanel with background image + .curatedcta text overlay
 *
 * Generated: 2026-02-16
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract background image
  // VALIDATED: .carouselslide contains img.img-responsive for poster images
  // VALIDATED: .fullbleedpanel contains img.img-responsive for background
  const bgImage = element.querySelector('img.img-responsive') ||
                  element.querySelector('img[class*="background"]') ||
                  element.querySelector('img');

  if (bgImage) {
    const imgEl = document.createElement('img');
    imgEl.src = bgImage.src;
    imgEl.alt = bgImage.alt || '';
    cells.push([imgEl]);
  }

  // Extract heading
  // VALIDATED: .largeheadline contains nested spans with heading text
  // VALIDATED: .fullbleedpanel uses .largeheadline for title
  const headlineEl = element.querySelector('.largeheadline .line1');
  let headingText = '';
  if (headlineEl) {
    headingText = headlineEl.textContent.trim();
  }

  // Extract description
  // VALIDATED: .c-rich-text-editor contains description paragraphs
  // VALIDATED: .fullbleedpanel has description in .has-background p elements
  const descriptionEl = element.querySelector('.c-rich-text-editor .has-background p:not(:has(a))') ||
                        element.querySelector('.description') ||
                        element.querySelector('p:not(:has(a)):not(.model)');
  let descText = '';
  if (descriptionEl) {
    descText = descriptionEl.textContent.trim();
  }

  // Extract CTA links
  // VALIDATED: .curatedcta contains CTA links with .action-link class
  // VALIDATED: Also found as a.news-link.action-link in some contexts
  const ctaLinks = Array.from(
    element.querySelectorAll('.curatedcta a, a.action-link, .standalone-link')
  );

  // Build content cell
  const contentCell = [];

  if (headingText) {
    const h2 = document.createElement('h2');
    h2.textContent = headingText;
    contentCell.push(h2);
  }

  if (descText) {
    const p = document.createElement('p');
    p.textContent = descText;
    contentCell.push(p);
  }

  for (const cta of ctaLinks) {
    const link = document.createElement('a');
    link.href = cta.href || cta.closest('a')?.href || '#';
    link.textContent = cta.textContent.trim();
    const p = document.createElement('p');
    p.append(link);
    contentCell.push(p);
  }

  if (contentCell.length > 0) {
    cells.push(contentCell);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Hero', cells });
  element.replaceWith(block);
}
