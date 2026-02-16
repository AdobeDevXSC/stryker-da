/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for Stryker website cleanup
 * Purpose: Remove non-content elements, fix HTML issues
 * Applies to: www.stryker.com (all templates)
 * Generated: 2026-02-16
 *
 * SELECTORS EXTRACTED FROM:
 * - Captured DOM during migration of https://www.stryker.com/us/en/index.html
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove header/navigation - handled by dedicated nav skill
    // EXTRACTED: Found <header id="header" class="g-header"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '#header',
      '.g-header',
    ]);

    // Remove footer - handled by dedicated footer skill
    // EXTRACTED: Found <footer> element in captured DOM
    WebImporter.DOMUtils.remove(element, [
      'footer',
      '.g-footer',
    ]);

    // Remove mega menu navigation overlay
    // EXTRACTED: Found <div class="g-megamenu"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.g-megamenu',
    ]);

    // Remove language/country selector
    // EXTRACTED: Found <div class="language-country-select"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.language-country-select',
    ]);

    // Remove utility navigation links (Careers, Investor Relations, etc.)
    // EXTRACTED: Found <nav class="utility-links"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.utility-links',
    ]);

    // Remove search bar overlay
    // EXTRACTED: Found <div class="search-bar"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.search-bar',
    ]);

    // Remove menu toggle button (mobile hamburger)
    // EXTRACTED: Found <div class="menu-btn"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.menu-btn',
    ]);

    // Remove slick carousel controls (dots, arrows) - content only
    // EXTRACTED: Found slick-dots and slick-arrow elements in carousel DOM
    WebImporter.DOMUtils.remove(element, [
      '.slick-dots',
      '.slick-arrow',
      '.slick-prev',
      '.slick-next',
    ]);

    // Remove empty model paragraphs in news items
    // EXTRACTED: Found <p class="model"></p> empty elements in .c-latestnews
    const emptyModels = element.querySelectorAll('p.model');
    for (const model of emptyModels) {
      if (!model.textContent.trim()) {
        model.remove();
      }
    }
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove remaining non-content elements
    WebImporter.DOMUtils.remove(element, [
      'noscript',
      'link',
      'source',
    ]);

    // Clean up tracking and AEM-specific attributes
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
      el.removeAttribute('data-sly-resource');
      el.removeAttribute('data-component');
    });
  }
}
