/**
 * Initializes the CPT board animation on the CPT single page.
 */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('.board-animation-root');
  if (root && typeof window.initBoardAnimation === 'function') {
    window.initBoardAnimation(root);
  }
});
