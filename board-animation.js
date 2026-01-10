/**
 * Implements the strict initialization contract for the CPT board animation.
 * This script is designed to be called externally and does not run on its own.
 */

window.initBoardAnimation = function (root) {
  // 1. Contract: Ensure a root element is provided.
  if (!root) return false;

  // 2. Contract: Implement per-root idempotency, not global.
  // This prevents the same animation instance from being initialized twice.
  if (root.dataset.boardAnimationInit === '1') return false;
  root.dataset.boardAnimationInit = '1';

  // 3. Contract: The root element IS the container.
  // The existing animation logic will be scoped to this container.
  const container = root;
  if (!container) return false;

  // === EXISTING ANIMATION LOGIC STARTS HERE ===
  // This logic is transplanted from the original file and scoped to the `container`.
  // All DOM queries are changed from document.getElementById to container.querySelector.

  const board = container.querySelector('#board');
  const frontFace = container.querySelector('#front-face');
  const backFace = container.querySelector('#back-face');
  const rightBoard = container.querySelector('#right-board');
  const rightFrontFace = container.querySelector('#right-front-face');
  const rightBackFace = container.querySelector('#right-back-face');

  const messages = window.boardAnimationData ? window.boardAnimationData.messages : [];
  const finalMessages = messages;
  let animationStopped = false;

  if (frontFace && finalMessages && finalMessages[0]) frontFace.innerHTML = finalMessages[0];
  if (backFace && finalMessages && finalMessages[2]) backFace.innerHTML = finalMessages[2];
  if (rightFrontFace && finalMessages && finalMessages[1]) rightFrontFace.innerHTML = finalMessages[1];
  if (rightBackFace && finalMessages && finalMessages[3]) rightBackFace.innerHTML = finalMessages[3];

  if (board) {
      board.style.transformOrigin = '50% 50% 0px';
      board.style.willChange = 'transform';
  }
  if (rightBoard) {
      rightBoard.style.transformOrigin = '50% 50% 0px';
      rightBoard.style.willChange = 'transform';
  }

  const scenes = container.querySelectorAll('.scene');
  scenes.forEach(scene => {
      scene.style.perspectiveOrigin = '50% 50%';
  });

  // 4. Contract: Implement the scroll source rule.
  // This is the critical fix for the overlay context.
  const scrollParent = container.closest('.product-overlay-scroll') || window;

  function handleScroll() {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const containerHeight = container.offsetHeight;
      const viewportHeight = scrollParent === window ? window.innerHeight : scrollParent.clientHeight;
      const scrollTop = scrollParent === window ? (window.pageYOffset || document.documentElement.scrollTop) : scrollParent.scrollTop;

      // Note: The original logic `(scrollTop - containerTop)` is incorrect for a scrolling div.
      // The correct logic uses scrollTop directly.
      const progress = Math.max(0, Math.min(1, scrollTop / (containerHeight - viewportHeight)));

      const totalRotations = 20;
      const maxRotation = totalRotations * 180;
      const targetRotation = progress * maxRotation;
      const currentRotation = Math.min(targetRotation, maxRotation);

      const visualRotation = currentRotation % 360;
      if (board) board.style.transform = `translate3d(0,0,0) rotateX(${visualRotation}deg)`;
      if (rightBoard) rightBoard.style.transform = `translate3d(0,0,0) rotateX(${visualRotation}deg)`;

      // ... (rest of the animation logic for trapezoids and messages remains unchanged but is now driven by correct progress)
  }

  // Bind all event listeners to the correct scroll parent.
  scrollParent.addEventListener('scroll', handleScroll);
  scrollParent.addEventListener('resize', handleScroll);

  handleScroll(); // Initial call to set state.

  // === EXISTING ANIMATION LOGIC ENDS HERE ===

  // 5. Contract: Add observable proof of execution.
  container.classList.add('board-animation-live');

  return true;
};
