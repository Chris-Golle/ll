window.initBoardAnimation = function () {
    if (window.__boardAnimationRunning) return;
    window.__boardAnimationRunning = true;

    const $ = jQuery;
    // ========================================
    // BOARD ANIMATION INITIALIZATION
    // ========================================

    // Get messages from WordPress post meta
    const messages = window.boardAnimationData ? window.boardAnimationData.messages : [];

    // Animation elements
    const animationContainer = document.getElementById('animation-container');
    const board = document.getElementById('board');
    const frontFace = document.getElementById('front-face');
    const backFace = document.getElementById('back-face');
    const rightBoard = document.getElementById('right-board');
    const rightFrontFace = document.getElementById('right-front-face');
    const rightBackFace = document.getElementById('right-back-face');

    // Use WordPress messages
    const finalMessages = messages;

    // Flag to track if animation has been stopped
    let animationStopped = false;

    // Set initial text
    if (frontFace && finalMessages && finalMessages[0]) frontFace.innerHTML = finalMessages[0];
    if (backFace && finalMessages && finalMessages[2]) backFace.innerHTML = finalMessages[2];
    if (rightFrontFace && finalMessages && finalMessages[1]) rightFrontFace.innerHTML = finalMessages[1];
    if (rightBackFace && finalMessages && finalMessages[3]) rightBackFace.innerHTML = finalMessages[3];

    // ============================================================
    // CRITICAL FIREFOX FIX: 3-VALUE TRANSFORM ORIGIN
    // ============================================================
    // Firefox requires the 3rd value (Z-axis) to be explicitly '0px'.
    // Without this, the axis can drift deep into the element during
    // complex rotations, causing the "swing" radius to increase
    // and making the board appear to grow towards the camera.
    if (board) {
        board.style.transformOrigin = '50% 50% 0px';
        board.style.willChange = 'transform'; // Hint to the browser to optimize rendering
    }
    if (rightBoard) {
        rightBoard.style.transformOrigin = '50% 50% 0px';
        rightBoard.style.willChange = 'transform';
    }

    // Also enforce perspective origin on the parent scenes to prevent camera drift
    const scenes = document.querySelectorAll('.scene');
    scenes.forEach(scene => {
        scene.style.perspectiveOrigin = '50% 50%';
        // Firefox rendering hint: forcing flat on parent sometimes helps contain 3D children issues
        // though we need preserve-3d for the children, the scene itself is the stage.
    });

    function handleScroll() {
        if (!animationContainer) return;

        const rect = animationContainer.getBoundingClientRect();

        // Check if we need to reactivate sticky positioning
        if (rect.top < window.innerHeight && animationContainer) {
            const stickyWrapper = animationContainer.querySelector('.sticky-wrapper');
            if (stickyWrapper && stickyWrapper.style.position === 'static') {
                const containerHeight = animationContainer.offsetHeight;
                const viewportUnits = containerHeight / window.innerHeight;
                const currentProgress = Math.max(0, Math.min(1, -rect.top / (window.innerHeight * viewportUnits)));
                
                const screenWidthReactivation = window.innerWidth;
                const isMobileReactivation = screenWidthReactivation <= 768 || viewportUnits > 2;
                const reactivationThreshold = isMobileReactivation ? 0.5 : 0.999;

                if (currentProgress < reactivationThreshold) {
                    stickyWrapper.style.setProperty('position', 'sticky', 'important');
                    stickyWrapper.style.setProperty('top', '0', 'important');
                    stickyWrapper.style.setProperty('height', '100vh', 'important');
                    stickyWrapper.style.setProperty('overflow', 'hidden', 'important');
                }
            }
        }
        
        // Prevent calculations when the element is not in view
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
            return;
        }

        // DYNAMIC CONTAINER HEIGHT
        const totalMessages = finalMessages ? finalMessages.length : 0;
        
        // Container height calculations
        const rotationScrollDistance = window.innerHeight * 4;
        const requiredHeightPx = Math.max(400, rotationScrollDistance);
        
        if (Math.abs(animationContainer.offsetHeight - requiredHeightPx) > 10) {
            animationContainer.style.setProperty('height', requiredHeightPx + 'px', 'important');
        }
        
        // ROTATION CALCULATIONS
        const containerHeight = animationContainer.offsetHeight;
        const viewportHeight = window.innerHeight;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const containerTop = animationContainer.offsetTop;
        
        const progress = Math.max(0, Math.min(1, (scrollTop - containerTop) / (containerHeight - viewportHeight)));
        
        const totalRotations = 20; 
        const maxRotation = totalRotations * 180;
        const targetRotation = progress * maxRotation;
        const currentRotation = Math.min(targetRotation, maxRotation);
        
        // ULTRA EARLY EXIT
        if (currentRotation >= maxRotation) return;
        
        const screenWidth = window.innerWidth;
        const isMobileEarly = screenWidth <= 768 || containerHeight / window.innerHeight > 2;
        
        const totalPairs = 21; 
        const maxValidPair = 19; 
        let shouldRelease = false; 
        let leftCurrentMessage, leftNextMessage, rightCurrentMessage, rightNextMessage;
        const currentPairIndex = Math.min(Math.floor(currentRotation / 180), maxValidPair);
        
        let isPair20Visible = false;
        if (currentRotation >= 3600) {
            isPair20Visible = true;
        }
        
        const clampedLeftMessageIndex = Math.min(currentPairIndex * 2, totalMessages - 2);
        const clampedRightMessageIndex = Math.min(currentPairIndex * 2 + 1, totalMessages - 1);
        
        const hasExceededMessages = clampedLeftMessageIndex >= totalMessages || clampedRightMessageIndex >= totalMessages;
        const isAtLastPossiblePair = (clampedLeftMessageIndex >= totalMessages - 2) && (clampedRightMessageIndex >= totalMessages - 1);
        
        if (hasExceededMessages && !isAtLastPossiblePair) {
            return;
        }
        
        // Handle scroll-back-up visibility
        if (animationStopped && !hasExceededMessages) {
            animationStopped = false;
            const leftScene = document.querySelector('.scene-left');
            const rightScene = document.querySelector('.scene-right');
            if (leftScene) leftScene.style.display = '';
            if (rightScene) rightScene.style.display = '';
            if (board) board.style.display = '';
            if (rightBoard) rightBoard.style.display = '';
        }
        
        if (board) board.style.display = '';
        if (rightBoard) rightBoard.style.display = '';
        
        const leftScene = document.querySelector('.scene-left');
        const rightScene = document.querySelector('.scene-right');
        
        if (leftScene) leftScene.style.display = '';
        if (rightScene) rightScene.style.display = '';

        // ============================================================
        // VISUAL ROTATION NORMALIZATION (0-360)
        // ============================================================
        // We use the modulo operator to keep the CSS rotation value small.
        // This prevents floating point drift in all browsers.
        const visualRotation = currentRotation % 360;

        if (board) {
            // translate3d(0,0,0) ensures hardware acceleration
            // rotateX applies the rotation
            // The transform-origin set above (50% 50% 0px) ensures the axis is stable
            board.style.transform = `translate3d(0,0,0) rotateX(${visualRotation}deg)`;
        }
        if (rightBoard) {
            rightBoard.style.transform = `translate3d(0,0,0) rotateX(${visualRotation}deg)`;
        }

        // Trapezoid calculation (uses full rotation progress)
        const trapezoidProgress = Math.min(currentRotation / maxRotation, 1);
        const trapezoidHeight = 333 - (trapezoidProgress * 222);
        const trapezoidTopWidth = 111 + (trapezoidProgress * 88);
        const trapezoidBottomWidth = 222;
        const trapezoidTopOffset = (trapezoidBottomWidth - trapezoidTopWidth) / 2;

        const leftTrapezoidSvg = document.getElementById('trapezoid-svg');
        const leftTrapezoidPolygon = document.getElementById('trapezoid-polygon');
        if (leftTrapezoidSvg && leftTrapezoidPolygon) {
            leftTrapezoidSvg.setAttribute('height', trapezoidHeight);
            leftTrapezoidSvg.setAttribute('viewBox', `0 0 ${trapezoidBottomWidth} ${trapezoidHeight}`);
            const leftPoints = `${trapezoidTopOffset},0 ${trapezoidTopOffset + trapezoidTopWidth},0 ${trapezoidBottomWidth},${trapezoidHeight} 0,${trapezoidHeight}`;
            leftTrapezoidPolygon.setAttribute('points', leftPoints);
        }

        const rightTrapezoidSvg = document.getElementById('right-trapezoid-svg');
        const rightTrapezoidPolygon = document.getElementById('right-trapezoid-polygon');
        if (rightTrapezoidSvg && rightTrapezoidPolygon) {
            rightTrapezoidSvg.setAttribute('height', trapezoidHeight);
            rightTrapezoidSvg.setAttribute('viewBox', `0 0 ${trapezoidBottomWidth} ${trapezoidHeight}`);
            const rightPoints = `${trapezoidTopOffset + trapezoidTopWidth},0 ${trapezoidTopOffset},0 0,${trapezoidHeight} ${trapezoidBottomWidth},${trapezoidHeight}`;
            rightTrapezoidPolygon.setAttribute('points', rightPoints);
        }

        // Logic continues using original currentRotation
        const messagePairIndex = Math.floor(currentRotation / 180);
        
        // Stickiness release logic
        const hasShownAllPairs = currentPairIndex >= totalPairs - 1;
        const isLastPairComplete = currentRotation >= maxRotation; 
        
        if (hasShownAllPairs && isLastPairComplete) {
            shouldRelease = true;
        }
        
        const hasScrolledPastContainer = -rect.top > containerHeight;
        
        if (shouldRelease || hasScrolledPastContainer) {
            const stickyWrapper = animationContainer.querySelector('.sticky-wrapper');
            if (stickyWrapper && stickyWrapper.style.position !== 'static') {
                stickyWrapper.style.setProperty('position', 'static', 'important');
                stickyWrapper.style.setProperty('top', 'auto', 'important');
                stickyWrapper.style.setProperty('height', 'auto', 'important');
                stickyWrapper.style.setProperty('overflow', 'visible', 'important');
            }
        }
        
        // Message determination
        let finalLeftIndex, finalRightIndex;
        
        if (isPair20Visible) {
            finalLeftIndex = totalMessages - 2; 
            finalRightIndex = totalMessages - 1;
        } else if (currentRotation >= maxRotation) {
            finalLeftIndex = totalMessages - 4; 
            finalRightIndex = totalMessages - 3; 
        } else {
            finalLeftIndex = clampedLeftMessageIndex;
            finalRightIndex = clampedRightMessageIndex;
        }
        
        leftCurrentMessage = finalMessages[finalLeftIndex] || '';
        leftNextMessage = finalMessages[Math.min(finalLeftIndex + 2, totalMessages - 1)] || '';
        rightCurrentMessage = finalMessages[finalRightIndex] || '';
        rightNextMessage = finalMessages[Math.min(finalRightIndex + 2, totalMessages - 1)] || '';
        
        const shouldHideLeft = (finalLeftIndex >= totalMessages) || (!leftCurrentMessage && !leftNextMessage);
        const shouldHideRight = (finalRightIndex >= totalMessages) || (!rightCurrentMessage && !rightNextMessage);
        
        if (leftScene) leftScene.style.display = shouldHideLeft ? 'none' : '';
        if (rightScene) rightScene.style.display = shouldHideRight ? 'none' : '';
        
        let hasValidMessages;
        if (currentRotation >= maxRotation) {
            hasValidMessages = true;
        } else {
            hasValidMessages = leftCurrentMessage || rightCurrentMessage || 
                              finalMessages[Math.max(0, Math.floor(currentRotation / 180) * 2)] ||
                              finalMessages[Math.max(0, Math.floor(currentRotation / 180) * 2 + 1)];
        }
        
        if (!hasValidMessages) return;
        if (animationStopped) return;
        
        const isEvenFlip = Math.floor(currentRotation / 180) % 2 === 0;
        
        if (isEvenFlip) {
            if (frontFace) frontFace.innerHTML = leftCurrentMessage;
            if (backFace) backFace.innerHTML = leftNextMessage;
            if (rightFrontFace) rightFrontFace.innerHTML = rightCurrentMessage;
            if (rightBackFace) rightBackFace.innerHTML = rightNextMessage;
        } else {
            if (backFace) backFace.innerHTML = leftCurrentMessage;
            if (frontFace) frontFace.innerHTML = leftNextMessage;
            if (rightBackFace) rightBackFace.innerHTML = rightCurrentMessage;
            if (rightFrontFace) rightFrontFace.innerHTML = rightNextMessage;
        }
        
        if (hasExceededMessages && !animationStopped) {
            animationStopped = true;
            return; 
        }
    }
    
    // Calculate optimal font size
    calculateOptimalFontSize();
    
    // Set initial CSS custom properties
    if (animationContainer) {
        animationContainer.style.setProperty('--board-distance', '400px');
    }
    
    function calculateOptimalFontSize() {
        if (!finalMessages || finalMessages.length === 0) return;
        
        let longestText = '';
        let maxLength = 0;
        
        finalMessages.forEach(message => {
            if (message && message.length > maxLength) {
                maxLength = message.length;
                longestText = message;
            }
        });
        
        if (!longestText) return;
        
        const isMobile = window.innerWidth <= 768;
        const boardWidth = isMobile ? 280 : 350;
        const boardHeight = isMobile ? 160 : 200;
        const padding = isMobile ? 15 : 20;
        const availableWidth = boardWidth - (padding * 2);
        const availableHeight = boardHeight - (padding * 2);
        
        const tempElement = document.createElement('div');
        tempElement.style.position = 'absolute';
        tempElement.style.visibility = 'hidden';
        tempElement.style.whiteSpace = 'pre-wrap';
        tempElement.style.wordWrap = 'break-word';
        tempElement.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        tempElement.style.fontWeight = '600';
        tempElement.style.textAlign = 'center';
        tempElement.style.width = availableWidth + 'px';
        tempElement.style.height = availableHeight + 'px';
        tempElement.style.display = 'flex';
        tempElement.style.alignItems = 'center';
        tempElement.style.justifyContent = 'center';
        
        document.body.appendChild(tempElement);
        
        let minFontSize = 8;
        let maxFontSize = isMobile ? 32 : 40;
        let optimalFontSize = minFontSize;
        
        for (let fontSize = minFontSize; fontSize <= maxFontSize; fontSize += 2) {
            tempElement.style.fontSize = fontSize + 'px';
            tempElement.textContent = longestText;
            
            const textRect = tempElement.getBoundingClientRect();
            const textWidth = textRect.width;
            const textHeight = textRect.height;
            
            if (textWidth <= availableWidth * 0.9 && textHeight <= availableHeight * 0.9) {
                optimalFontSize = fontSize;
            } else {
                break;
            }
        }
        
        document.body.removeChild(tempElement);
        
        const fallbackFontSize = isMobile ? 16 : 20;
        if (optimalFontSize < 12) {
            optimalFontSize = fallbackFontSize;
        }
        
        const faces = document.querySelectorAll('.face');
        faces.forEach(face => {
            face.style.fontSize = optimalFontSize + 'px';
        });
    }
    
    function forceMobileLayoutIfNeeded() {
        const screenWidth = window.innerWidth;
        const isMobileWidth = screenWidth <= 768;
        
        if (isMobileWidth) {
            const scenes = document.querySelectorAll('.scene');
            const leftScene = document.querySelector('.scene-left');
            const rightScene = document.querySelector('.scene-right');
            const stickyWrapper = document.querySelector('.sticky-wrapper');
            
            scenes.forEach(scene => {
                scene.style.width = '280px';
                scene.style.height = '160px';
                scene.style.position = 'absolute';
                scene.style.left = '50%';
                scene.style.transform = 'translateX(-50%)';
            });
            
            if (leftScene) {
                leftScene.style.top = '35%';
                leftScene.style.transform = 'translate(-50%, -50%)';
                leftScene.style.zIndex = '2';
            }
            
            if (rightScene) {
                rightScene.style.top = '65%';
                rightScene.style.transform = 'translate(-50%, -50%)';
                rightScene.style.zIndex = '1';
            }
            
            if (stickyWrapper) {
                stickyWrapper.style.display = 'flex';
                stickyWrapper.style.justifyContent = 'center';
                stickyWrapper.style.alignItems = 'center';
            }
            
            calculateOptimalFontSize();
            
            const faces = document.querySelectorAll('.face');
            faces.forEach(face => {
                face.style.padding = '15px';
            });
        }
    }
    
    forceMobileLayoutIfNeeded();
    window.addEventListener('resize', forceMobileLayoutIfNeeded);
    
    const initialHeight = 333;
    const initialTopWidth = 111;
    const initialBottomWidth = 222;
    const initialTopOffset = (initialBottomWidth - initialTopWidth) / 2;
    
    const leftTrapezoidPolygon = document.getElementById('trapezoid-polygon');
    if (leftTrapezoidPolygon) {
        const leftInitialPoints = `${initialTopOffset},0 ${initialTopOffset + initialTopWidth},0 ${initialBottomWidth},${initialHeight} 0,${initialHeight}`;
        leftTrapezoidPolygon.setAttribute('points', leftInitialPoints);
    }
    
    const rightTrapezoidPolygon = document.getElementById('right-trapezoid-polygon');
    if (rightTrapezoidPolygon) {
        const rightInitialPoints = `${initialTopOffset + initialTopWidth},0 ${initialTopOffset},0 0,${initialHeight} ${initialBottomWidth},${initialHeight}`;
        rightTrapezoidPolygon.setAttribute('points', rightInitialPoints);
    }
    
    handleScroll();
    
    if (typeof window !== 'undefined') {
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
    }

    // Modal Handlers (Refactored to Vanilla JS)
    document.addEventListener('click', async (e) => {
        if (!e.target.matches('.board-animation-trigger')) return;

        e.preventDefault();
        const postId = e.target.dataset.animationId;
        const modal = document.getElementById('board-animation-modal');
        const modalBody = modal.querySelector('.board-modal-body');

        modal.classList.add('show');
        modal.style.display = 'flex';
        modalBody.innerHTML = '<div class="board-modal-loading">Loading animation...</div>';
        document.body.style.overflow = 'hidden';

        try {
            const formData = new FormData();
            formData.append('action', 'load_board_animation');
            formData.append('post_id', postId);
            formData.append('nonce', boardAnimationData.nonce);

            const response = await fetch(boardAnimationData.ajax_url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const result = await response.json();

            if (result.success) {
                const data = result.data;
                let html = '';
                if (data.title) html += `<h2 class="board-modal-title">${data.title}</h2>`;
                if (data.featured_image) html += `<div class="board-modal-image"><img src="${data.featured_image}" alt="${data.title}"></div>`;
                if (data.content) html += `<div class="board-modal-content-area">${data.content}</div>`;
                modalBody.innerHTML = html;
            } else {
                modalBody.innerHTML = '<p class="error">Failed to load animation.</p>';
            }
        } catch (error) {
            console.error('Error fetching board animation:', error);
            modalBody.innerHTML = '<p class="error">An error occurred. Please try again.</p>';
        }
    });

    function closeBoardModal() {
        const modal = document.getElementById('board-animation-modal');
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300); // For fadeOut effect
        document.body.style.overflow = '';
    }

    document.getElementById('close-board-modal')?.addEventListener('click', closeBoardModal);
    document.getElementById('board-animation-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'board-animation-modal') {
            closeBoardModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('board-animation-modal')?.classList.contains('show')) {
            closeBoardModal();
        }
    });
};

document.addEventListener("DOMContentLoaded", function() {
    window.initBoardAnimation();
});

document.addEventListener('click', function (e) {
  const btn = e.target.closest('.board-modal-trigger');
  if (!btn) return;
  const id = btn.dataset.modalId;
  const dlg = document.getElementById('board-modal-' + id);
  if (!dlg) return;
  dlg.showModal();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        window.initBoardAnimation();      
    });
  });
});