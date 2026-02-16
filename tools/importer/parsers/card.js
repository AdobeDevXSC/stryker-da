/* eslint-disable */
/* global WebImporter */

/**
 * Parser for Card block
 *
 * Source: https://www.stryker.com/us/en/index.html
 * Base Block: card
 *
 * Block Structure:
 * - Single cell with: image, title, description, CTA link
 *
 * Source HTML Pattern (Latest News):
 * <div class="item">
 *   <img class="img-responsive" src="..." alt="...">
 *   <div class="m-c-subheading-description"><h3>Title</h3></div>
 *   <p class="description">Description text</p>
 *   <a class="news-link action-link" href="...">Read More</a>
 * </div>
 *
 * Source HTML Pattern (Our Focus - standaloneimage + text):
 * <div class="xf-master-building-block">
 *   <div class="standaloneimage">
 *     <a href="..."><img class="img-responsive" src="..." alt="..."></a>
 *   </div>
 *   <div class="text parbase">
 *     <div class="c-rich-text-editor">
 *       <p><span class="futura-bold">Title</span><span class="urw-egyptienne">Subtitle</span></p>
 *       <p>Description</p>
 *       <p><a href="..."><span class="standalone-link">Learn more</span></a></p>
 *     </div>
 *   </div>
 * </div>
 *
 * Generated: 2026-02-16
 */
export default function parse(element, { document }) {
  const contentCell = [];

  // Extract image
  // VALIDATED: .item contains img.img-responsive directly
  // VALIDATED: .standaloneimage contains img.img-responsive inside <a>
  const img = element.querySelector('img.img-responsive') ||
              element.querySelector('img');

  if (img) {
    const imgEl = document.createElement('img');
    imgEl.src = img.src;
    imgEl.alt = img.alt || '';
    const p = document.createElement('p');
    p.append(imgEl);
    contentCell.push(p);
  }

  // Extract title
  // VALIDATED: .m-c-subheading-description h3 for news cards
  // VALIDATED: .futura-bold span for focus cards
  const titleEl = element.querySelector('.m-c-subheading-description h3') ||
                  element.querySelector('h3') ||
                  element.querySelector('.futura-bold');

  if (titleEl) {
    const strong = document.createElement('strong');
    strong.textContent = titleEl.textContent.trim();
    const p = document.createElement('p');
    p.append(strong);

    // Check for subtitle (focus cards have italic subtitle)
    // VALIDATED: .urw-egyptienne span contains subtitle text
    const subtitleEl = element.querySelector('.urw-egyptienne');
    if (subtitleEl) {
      const br = document.createElement('br');
      const em = document.createElement('em');
      em.textContent = subtitleEl.textContent.trim();
      p.append(br, em);
    }

    contentCell.push(p);
  }

  // Extract description
  // VALIDATED: p.description for news cards
  // VALIDATED: .c-rich-text-editor .has-background p (second p, not first with title)
  const descEl = element.querySelector('p.description');
  if (descEl) {
    const p = document.createElement('p');
    p.textContent = descEl.textContent.trim();
    contentCell.push(p);
  } else {
    // Focus card pattern: description is in paragraphs after the title paragraph
    const richTextParas = element.querySelectorAll('.c-rich-text-editor .has-background > p');
    for (const para of richTextParas) {
      // Skip the title paragraph and the link paragraph
      if (para.querySelector('.futura-bold') || para.querySelector('a')) continue;
      const text = para.textContent.trim();
      if (text) {
        const p = document.createElement('p');
        p.textContent = text;
        contentCell.push(p);
      }
    }
  }

  // Extract CTA link
  // VALIDATED: a.news-link.action-link for news cards
  // VALIDATED: a containing .standalone-link for focus cards
  const ctaEl = element.querySelector('a.news-link') ||
                element.querySelector('a.action-link') ||
                element.querySelector('.standalone-link')?.closest('a') ||
                element.querySelector('.c-rich-text-editor a');

  if (ctaEl) {
    const link = document.createElement('a');
    link.href = ctaEl.href;
    link.textContent = ctaEl.textContent.trim();
    const p = document.createElement('p');
    p.append(link);
    contentCell.push(p);
  }

  const cells = [contentCell];

  const block = WebImporter.Blocks.createBlock(document, { name: 'Card', cells });
  element.replaceWith(block);
}
