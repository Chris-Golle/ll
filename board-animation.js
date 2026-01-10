window.initBoardAnimation = function (root) {
  if (!root) return false;
  if (root.dataset.boardAnimationInit === '1') return false;
  root.dataset.boardAnimationInit = '1';

  const container = root;
  if (!container) return false;

  const board = container.querySelector('#board');
  const frontFace = container.querySelector('#front-face');
  const backFace = container.querySelector('#back-face');
  const rightBoard = container.querySelector('#right-board');
  const rightFrontFace = container.querySelector('#right-front-face');
  const rightBackFace = container.querySelector('#right-back-face');

  const messages = window.boardAnimationData ? window.boardAnimationData.messages : [];
  const finalMessages = messages;

  if (frontFace && finalMessages[0]) frontFace.innerHTML = finalMessages[0];
  if (backFace && finalMessages[2]) backFace.innerHTML = finalMessages[2];
  if (rightFrontFace && finalMessages[1]) rightFrontFace.innerHTML = finalMessages[1];
  if (rightBackFace && finalMessages[3]) rightBackFace.innerHTML = finalMessages[3];

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

  const scrollParent = container.closest('.product-overlay-scroll') || window;

  function handleScroll() {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const containerHeight = container.offsetHeight;
      const viewportHeight = scrollParent === window ? window.innerHeight : scrollParent.clientHeight;
      const scrollTop = scrollParent === window ? (window.pageYOffset || document.documentElement.scrollTop) : scrollParent.scrollTop;

      const progress = Math.max(0, Math.min(1, scrollTop / (containerHeight - viewportHeight)));

      const totalRotations = 20;
      const maxRotation = totalRotations * 180;
      const targetRotation = progress * maxRotation;
      const currentRotation = Math.min(targetRotation, maxRotation);

      const visualRotation = currentRotation % 360;
      if (board) board.style.transform = `translate3d(0,0,0) rotateX(${visualRotation}deg)`;
      if (rightBoard) rightBoard.style.transform = `translate3d(0,0,0) rotateX(${visualRotation}deg)`;
  }

  function calculateOptimalFontSize() {
    if (!finalMessages || finalMessages.length === 0) return;
    let longestText = '';
    finalMessages.forEach(message => {
        if (message && message.length > longestText.length) longestText = message;
    });
    if (!longestText) return;
    const isMobile = window.innerWidth <= 768;
    const boardWidth = isMobile ? 280 : 350, boardHeight = isMobile ? 160 : 200, padding = isMobile ? 15 : 20;
    const availableWidth = boardWidth - (padding * 2), availableHeight = boardHeight - (padding * 2);
    const tempElement = document.createElement('div');
    Object.assign(tempElement.style, { position: 'absolute', visibility: 'hidden', whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600', textAlign: 'center', width: availableWidth + 'px', height: availableHeight + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
    document.body.appendChild(tempElement);
    let optimalFontSize = 8;
    for (let fontSize = 8; fontSize <= (isMobile ? 32 : 40); fontSize += 2) {
        tempElement.style.fontSize = fontSize + 'px';
        tempElement.textContent = longestText;
        if (tempElement.getBoundingClientRect().width <= availableWidth * 0.9 && tempElement.getBoundingClientRect().height <= availableHeight * 0.9) {
            optimalFontSize = fontSize;
        } else {
            break;
        }
    }
    document.body.removeChild(tempElement);
    if (optimalFontSize < 12) optimalFontSize = isMobile ? 16 : 20;
    container.querySelectorAll('.face').forEach(face => { face.style.fontSize = optimalFontSize + 'px'; });
  }

  function forceMobileLayoutIfNeeded() {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 768) {
          const scenes = container.querySelectorAll('.scene');
          const leftScene = container.querySelector('.scene-left');
          const rightScene = container.querySelector('.scene-right');
          scenes.forEach(scene => { Object.assign(scene.style, { width: '280px', height: '160px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }); });
          if (leftScene) Object.assign(leftScene.style, { top: '35%', transform: 'translate(-50%, -50%)', zIndex: '2' });
          if (rightScene) Object.assign(rightScene.style, { top: '65%', transform: 'translate(-50%, -50%)', zIndex: '1' });
          const stickyWrapper = container.querySelector('.sticky-wrapper');
          if (stickyWrapper) Object.assign(stickyWrapper.style, { display: 'flex', justifyContent: 'center', alignItems: 'center' });
          calculateOptimalFontSize();
          container.querySelectorAll('.face').forEach(face => { face.style.padding = '15px'; });
      }
  }

  scrollParent.addEventListener('scroll', handleScroll);
  scrollParent.addEventListener('resize', handleScroll);

  forceMobileLayoutIfNeeded();
  calculateOptimalFontSize();
  handleScroll();

  container.classList.add('board-animation-live');
  return true;
};
