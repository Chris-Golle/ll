/**
 * Initializes the CPT board animation on the CPT single page.
 * This script provides the entry point for the animation on its canonical page.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Find the root element of the animation on the page.
  const root = document.querySelector('.board-animation-root');

  // If the root element exists, call the global init function,
  // passing the root element as the context.
  if (root && typeof window.initBoardAnimation === 'function') {
    window.initBoardAnimation(root);
  }
});
