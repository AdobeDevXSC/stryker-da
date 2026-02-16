function decorateCards(cards, hashAware) {
  cards.classList.add('cards-card');
  const pic = cards.querySelector('picture');
  if (pic) {
    const picPara = pic.closest('p');
    if (picPara) {
      const picDiv = document.createElement('div');
      picDiv.className = 'cards-card-image';
      picDiv.append(pic);
      cards.insertAdjacentElement('afterbegin', picDiv);
      picPara.remove();
    }
  }
  // Decorate content
  const con = cards.querySelector(':scope > div:not([class])');
  if (!con) return;
  con.classList.add('cards-card-body');

  // Decorate CTA
  const ctaPara = con.querySelector('p:last-of-type');
  if (!ctaPara) return;
  const cta = ctaPara.querySelector('a');
  if (!cta) return;
  if (hashAware) {
    cta.href = `${cta.getAttribute('href')}${window.location.hash}`;
  }
  ctaPara.classList.add('cards-card-cta');
  cards.append(ctaPara);
}

export default function decorate(block) {
  const hashAware = block.classList.contains('hash-aware');
  const rows = [...block.children];
  rows.forEach((row) => decorateCards(row, hashAware));
}
