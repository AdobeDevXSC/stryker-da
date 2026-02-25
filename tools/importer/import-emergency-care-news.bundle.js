var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-emergency-care-news.js
  var import_emergency_care_news_exports = {};
  __export(import_emergency_care_news_exports, {
    default: () => import_emergency_care_news_default
  });

  // tools/importer/transformers/stryker-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#header",
        ".g-header"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "footer",
        ".g-footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".g-megamenu"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".language-country-select"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".utility-links"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".search-bar"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".menu-btn"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".slick-dots",
        ".slick-arrow",
        ".slick-prev",
        ".slick-next"
      ]);
      const emptyModels = element.querySelectorAll("p.model");
      for (const model of emptyModels) {
        if (!model.textContent.trim()) {
          model.remove();
        }
      }
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "noscript",
        "link",
        "source"
      ]);
      const allElements = element.querySelectorAll("*");
      allElements.forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-track");
        el.removeAttribute("data-sly-resource");
        el.removeAttribute("data-component");
      });
    }
  }

  // tools/importer/import-emergency-care-news.js
  var transformers = [transform];
  var PAGE_TEMPLATE = {
    name: "emergency-care-news",
    description: "Emergency care news article pages with H1 title, publication date, hero image, article body content with H2/H3 headings, paragraphs, bullet lists, inline links. Includes Related products cards section, Resources columns section with Explore/Learn/Support/More links, and footnotes/disclaimers section.",
    urls: [
      "https://www.stryker.com/us/en/emergency-care/news/2026/streamlining-hospital-workflows-with-data-and-devices.html"
    ],
    blocks: [
      {
        name: "cards",
        instances: [".c-customizeable"]
      },
      {
        name: "columns",
        instances: [".experienceFragment"]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, payload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function parseRelatedCards(main, document) {
    const container = main.querySelector(".c-customizeable");
    if (!container) return false;
    const items = container.querySelectorAll(".item");
    if (!items.length) return false;
    const cells = [];
    items.forEach((item) => {
      const imageCell = document.createElement("div");
      const contentCell = document.createElement("div");
      const img = item.querySelector("img");
      if (img) {
        const imgEl = document.createElement("img");
        imgEl.src = img.src;
        imgEl.alt = img.alt || "";
        imageCell.append(imgEl);
      }
      const h3 = item.querySelector("h3");
      if (h3) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = h3.textContent.trim();
        p.append(strong);
        contentCell.append(p);
      }
      const descP = item.querySelector(".desc-container > p");
      if (descP && descP.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = descP.textContent.trim();
        contentCell.append(p);
      }
      const cta = item.querySelector("a.action-link");
      if (cta) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = cta.href;
        a.textContent = cta.textContent.trim();
        p.append(a);
        contentCell.append(p);
      }
      cells.push([imageCell, contentCell]);
    });
    if (cells.length === 0) return false;
    const heading = container.querySelector("h2");
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards", cells });
    const wrapper = document.createElement("div");
    wrapper.append(document.createElement("hr"));
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = heading.textContent.trim();
      wrapper.append(h2);
    }
    wrapper.append(block);
    const parent = container.closest(".customizable") || container;
    parent.replaceWith(wrapper);
    return true;
  }
  function parseResourcesColumns(main, document) {
    const expFrag = main.querySelector(".experienceFragment");
    if (!expFrag) return false;
    const grid = expFrag.querySelector(".aem-Grid");
    if (!grid) return false;
    const sectionHeading = grid.querySelector(".section-title h2") || grid.querySelector(".c-section-title h2") || expFrag.querySelector("h2");
    const colDivs = grid.querySelectorAll(".text.parbase");
    if (!colDivs.length) return false;
    const row = [];
    colDivs.forEach((colDiv) => {
      const cellContent = document.createElement("div");
      const headingEl = colDiv.querySelector(".futura-bold");
      if (headingEl) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = headingEl.textContent.trim();
        p.append(strong);
        cellContent.append(p);
      }
      const richText = colDiv.querySelector(".c-rich-text-editor");
      if (richText) {
        const paras = richText.querySelectorAll("p");
        paras.forEach((para) => {
          if (para.querySelector(".futura-bold")) return;
          const link = para.querySelector("a");
          if (link && link.textContent.trim()) {
            const p = document.createElement("p");
            const a = document.createElement("a");
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
    const block = WebImporter.Blocks.createBlock(document, { name: "Columns", cells: [row] });
    const wrapper = document.createElement("div");
    wrapper.append(document.createElement("hr"));
    if (sectionHeading) {
      const h2 = document.createElement("h2");
      h2.textContent = sectionHeading.textContent.trim();
      wrapper.append(h2);
    }
    wrapper.append(block);
    expFrag.replaceWith(wrapper);
    return true;
  }
  function addDisclaimerSectionBreak(main, document) {
    const disclaimer = main.querySelector(".c-disclaimer");
    if (!disclaimer) return;
    const container = disclaimer.closest(".container") || disclaimer.parentElement;
    if (container) {
      const hr = document.createElement("hr");
      container.insertAdjacentElement("beforebegin", hr);
    }
  }
  var import_emergency_care_news_default = {
    /**
     * Main transformation function for emergency-care-news template
     */
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const blocksFound = [];
      if (parseRelatedCards(main, document)) {
        blocksFound.push("cards");
      }
      if (parseResourcesColumns(main, document)) {
        blocksFound.push("columns");
      }
      addDisclaimerSectionBreak(main, document);
      executeTransformers("afterTransform", main, payload);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: blocksFound
        }
      }];
    }
  };
  return __toCommonJS(import_emergency_care_news_exports);
})();
