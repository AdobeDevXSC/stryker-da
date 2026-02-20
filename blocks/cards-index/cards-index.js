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

    // Image
    if (item.image) {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'cards-card-image';
      const picture = document.createElement('picture');
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title || '';
      img.loading = 'lazy';
      picture.append(img);
      imageDiv.append(picture);
      card.append(imageDiv);
    }

    // Body
    const body = document.createElement('div');
    body.className = 'cards-card-body';
    const h3 = document.createElement('h3');
    h3.textContent = item.title || '';
    body.append(h3);
    if (item.description) {
      const desc = document.createElement('p');
      desc.textContent = item.description;
      body.append(desc);
    }
    card.append(body);

    // CTA link
    if (item.path) {
      const ctaPara = document.createElement('p');
      ctaPara.className = 'cards-card-cta';
      const a = document.createElement('a');
      const firstName = (item.title || '').split(' ')[0];
      a.href = item.path;
      a.textContent = `Meet ${firstName}`;
      ctaPara.append(a);
      card.append(ctaPara);
    }

    block.append(card);
  });
}
