/* eslint-disable */
/* global WebImporter */

/**
 * Parser for Columns block
 *
 * Source: https://www.stryker.com/us/en/index.html
 * Base Block: columns
 *
 * Block Structure:
 * - Row per content group, each row has N columns
 *
 * Source HTML Pattern (People section - cols2):
 * <div class="cols2">
 *   <div class="colctrl container">
 *     <div class="row">
 *       <div class="col-xs-12 col-sm-6">Text content with heading + CTA</div>
 *       <div class="col-xs-12 col-sm-6">Image</div>
 *     </div>
 *   </div>
 * </div>
 *
 * Source HTML Pattern (Quick Links - cols2 with multiple sub-columns):
 * <div class="cols2">
 *   <div class="colctrl container">
 *     <div class="row">
 *       <div class="col-xs-12 col-sm-3">Column with links</div>
 *       ...
 *     </div>
 *   </div>
 * </div>
 *
 * Generated: 2026-02-16
 */
export default function parse(element, { document }) {
  // Find the row container with column children
  // VALIDATED: .colctrl .row contains col-* divs
  const rowEl = element.querySelector('.colctrl .row') ||
                element.querySelector('.row');

  if (!rowEl) {
    // Fallback: treat entire element as single-column
    const cells = [[element.cloneNode(true)]];
    const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });
    element.replaceWith(block);
    return;
  }

  // Extract columns from the row
  // VALIDATED: Columns use Bootstrap classes col-xs-*, col-sm-*, col-md-*
  const colDivs = rowEl.querySelectorAll(':scope > [class*="col-"]');

  if (colDivs.length === 0) {
    const cells = [[element.cloneNode(true)]];
    const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });
    element.replaceWith(block);
    return;
  }

  // Build a single row with N columns
  const rowCells = [];

  for (const colDiv of colDivs) {
    const cellContent = document.createElement('div');

    // Extract headings
    // VALIDATED: .largeheadline .line1 contains heading text
    const headline = colDiv.querySelector('.largeheadline .line1');
    if (headline) {
      const headingText = headline.textContent.trim();
      if (headingText) {
        const h2 = document.createElement('h2');
        h2.textContent = headingText;
        cellContent.append(h2);
      }
    }

    // Extract rich text content
    // VALIDATED: .c-rich-text-editor .has-background contains paragraphs
    const richText = colDiv.querySelector('.c-rich-text-editor .has-background') ||
                     colDiv.querySelector('.c-rich-text-editor');
    if (richText) {
      const paras = richText.querySelectorAll('p');
      for (const para of paras) {
        const p = document.createElement('p');
        // Preserve links within paragraphs
        const link = para.querySelector('a');
        if (link) {
          const a = document.createElement('a');
          a.href = link.href;
          a.textContent = link.textContent.trim();
          p.append(a);
        } else {
          const text = para.textContent.trim();
          if (text) {
            // Check for bold text
            const bold = para.querySelector('.futura-bold, strong, b');
            if (bold) {
              const strong = document.createElement('strong');
              strong.textContent = text;
              p.append(strong);
            } else {
              p.textContent = text;
            }
          }
        }
        if (p.textContent.trim() || p.querySelector('a')) {
          cellContent.append(p);
        }
      }
    }

    // Extract standalone images
    // VALIDATED: .c-standalone-image-content contains images
    const img = colDiv.querySelector('.c-standalone-image-content img') ||
                colDiv.querySelector('img.img-responsive') ||
                colDiv.querySelector('img');
    if (img && !richText) {
      const imgEl = document.createElement('img');
      imgEl.src = img.src;
      imgEl.alt = img.alt || '';
      cellContent.append(imgEl);
    }

    // Extract CTA links not already in rich text
    // VALIDATED: .curatedcta a for standalone CTAs
    if (!richText) {
      const ctas = colDiv.querySelectorAll('.curatedcta a, a.action-link');
      for (const cta of ctas) {
        const a = document.createElement('a');
        a.href = cta.href;
        a.textContent = cta.textContent.trim();
        const p = document.createElement('p');
        p.append(a);
        cellContent.append(p);
      }
    }

    // Only add column if it has content
    if (cellContent.children.length > 0) {
      rowCells.push(cellContent);
    }
  }

  const cells = rowCells.length > 0 ? [rowCells] : [];

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });
  element.replaceWith(block);
}
