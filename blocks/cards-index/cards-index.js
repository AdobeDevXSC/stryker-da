export default async function decorate(block) {
  // Read configuration from block content rows
  const config = {};
  [...block.children].forEach((row) => {
    const key = row.children[0]?.textContent?.trim().toLowerCase();
    const value = row.children[1]?.textContent?.trim();
    if (key && value) config[key] = value;
  });

  block.innerHTML = '';

  const { source } = config;
  if (!source) return;

  const resp = await fetch(source);
  if (!resp.ok) return;

  const json = await resp.json();
  const entries = json.data || json;

  entries.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'cards-card';

    // Image column
    const imageCol = document.createElement('div');
    imageCol.className = 'cards-card-image';
    if (item.image) {
      const picture = document.createElement('picture');
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title || '';
      img.loading = 'lazy';
      picture.append(img);
      imageCol.append(picture);
    }
    card.append(imageCol);

    // Text column
    const textCol = document.createElement('div');
    textCol.className = 'cards-card-body';
    const h3 = document.createElement('h3');
    h3.textContent = item.title || '';
    textCol.append(h3);
    if (item.description) {
      const desc = document.createElement('p');
      desc.textContent = item.description;
      textCol.append(desc);
    }

    // CTA link
    if (item.path) {
      const ctaPara = document.createElement('p');
      ctaPara.className = 'cards-card-cta';
      const a = document.createElement('a');
      const firstName = (item.title || '').split(' ')[0];
      a.href = item.path;
      a.textContent = `Meet ${firstName}`;
      ctaPara.append(a);
      textCol.append(ctaPara);
    }

    card.append(textCol);
    block.append(card);
  });
}
