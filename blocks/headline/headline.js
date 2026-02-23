export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cols = [...row.children];
  if (cols.length < 2) return;

  const textCol = cols[0];
  const mediaCol = cols[1];

  // Decorate text column as a card
  textCol.classList.add('headline-card');

  // Find the standalone link and make it a CTA
  const ctaPara = textCol.querySelector('p > a:only-child')?.parentElement;
  if (ctaPara) ctaPara.classList.add('headline-cta');

  // Decorate media column
  mediaCol.classList.add('headline-media');

  // Find the large headline text (first heading in media col)
  const headlineText = mediaCol.querySelector('h1, h2, h3, h4, h5, h6');
  if (headlineText) {
    headlineText.classList.add('headline-number');
    headlineText.setAttribute('aria-hidden', 'true');
  }

  // Find the image
  const pic = mediaCol.querySelector('picture');
  if (pic) {
    const picWrapper = pic.closest('p') || pic.parentElement;
    picWrapper.classList.add('headline-image');
  }
}
