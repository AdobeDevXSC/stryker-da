function decorateCards(cards, hashAware) {
  cards.classList.add('cards-card');

  const cols = [...cards.children];

  // 2-column content model: col 0 = image, col 1 = text
  if (cols.length >= 2) {
    const imageCol = cols[0];
    const textCol = cols[1];

    imageCol.classList.add('cards-card-image');
    textCol.classList.add('cards-card-body');

    // Decorate CTA
    const ctaPara = textCol.querySelector('p:last-of-type');
    if (ctaPara) {
      const cta = ctaPara.querySelector('a');
      if (cta) {
        if (hashAware) {
          cta.href = `${cta.getAttribute('href')}${window.location.hash}`;
        }
        ctaPara.classList.add('cards-card-cta');
      }
    }
  }
}

export default function decorate(block) {
  const hashAware = block.classList.contains('hash-aware');
  const rows = [...block.children];
  rows.forEach((row) => decorateCards(row, hashAware));
}
