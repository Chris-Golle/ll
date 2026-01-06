jQuery(document).ready(function($) {
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
    
    // Set initial text (with safety checks)
    // Left board: shows odd positions (0, 2, 4...)
    // Right board: shows even positions (1, 3, 5...)
    if (frontFace && finalMessages && finalMessages[0]) frontFace.innerHTML = finalMessages[0];
    if (backFace && finalMessages && finalMessages[2]) backFace.innerHTML = finalMessages[2];
    if (rightFrontFace && finalMessages && finalMessages[1]) rightFrontFace.innerHTML = finalMessages[1];
    if (rightBackFace && finalMessages && finalMessages[3]) rightBackFace.innerHTML = finalMessages[3];
    
    function handleScroll() {
        if (!animationContainer) return;
        
        const rect = animationContainer.getBoundingClientRect();
        
        // Check if we need to reactivate sticky positioning when scrolling back up
        // Only reactivate if we haven't completed the animation yet
        if (rect.top < window.innerHeight && animationContainer) {
            const stickyWrapper = animationContainer.querySelector('.sticky-wrapper');
            if (stickyWrapper && stickyWrapper.style.position === 'static') {
                // Check if we should reactivate (not at the end of animation)
                const containerHeight = animationContainer.offsetHeight;
                const viewportUnits = containerHeight / window.innerHeight;
                const currentProgress = Math.max(0, Math.min(1, -rect.top / (window.innerHeight * viewportUnits)));
                
                // Mobile-aware reactivation threshold - match the main detection logic
                const screenWidthReactivation = window.innerWidth;
                const isMobileReactivation = screenWidthReactivation <= 768 || viewportUnits > 2;
                const reactivationThreshold = isMobileReactivation ? 0.5 : 0.999; // Much lower threshold for mobile
                
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

        // DYNAMIC CONTAINER HEIGHT: Calculate height based on actual number of pairs
        const totalMessages = finalMessages ? finalMessages.length : 0;
        
        // Calculate required height for smooth scrolling
        // PROPER APPROACH: Container height must match the scroll distance needed for rotation
        // For 20 rotations × 180° = 3600°, we need enough scroll distance to complete the rotation
        // The container height should be: viewport height + scroll distance for rotation
        const rotationScrollDistance = window.innerHeight * 4; // 4 viewport heights for smooth rotation
        const requiredHeightPx = Math.max(400, rotationScrollDistance);
        const requiredHeightVh = (requiredHeightPx / window.innerHeight) * 100;
        
        // Update container height if needed
        if (Math.abs(animationContainer.offsetHeight - requiredHeightPx) > 10) {
            animationContainer.style.setProperty('height', requiredHeightPx + 'px', 'important');
        }
        
        // EARLY EXIT: Check if animation should stop BEFORE any calculations
        // This prevents phantom boards from appearing
        
        // PROPER APPROACH: Rotation synchronized with container height and sticky positioning
        // Container height controls duration, rotation completes when sticky ends
        // This ensures perfect synchronization between scroll progress and rotation
        // Key insight: Container height must match the scroll distance needed for rotation
        const containerHeight = animationContainer.offsetHeight;
        const viewportHeight = window.innerHeight;
        
        // Calculate progress based on actual scroll position relative to container bounds
        // This ensures rotation and sticky positioning are perfectly synchronized
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const containerTop = animationContainer.offsetTop;
        const containerBottom = containerTop + containerHeight;
        
        // Progress calculation: 0 = container enters viewport, 1 = container exits viewport
        const progress = Math.max(0, Math.min(1, (scrollTop - containerTop) / (containerHeight - viewportHeight)));
        
        // Rotation calculation: tied to scroll progress, not arbitrary values
        const totalRotations = 20; // 20 pairs × 180° = 3600° total rotation
        const maxRotation = totalRotations * 180;
        const targetRotation = progress * maxRotation;
        const currentRotation = Math.min(targetRotation, maxRotation);
        
        // ULTRA EARLY EXIT: If we're at or beyond maximum rotation, stop completely
        if (currentRotation >= maxRotation) return;
        
        // Quick mobile detection for early stop
        const screenWidth = window.innerWidth;
        const isMobileEarly = screenWidth <= 768 || containerHeight / window.innerHeight > 2;
        
        // CRITICAL FIX: Ensure we never go beyond pair 20 (since pairs are 0-indexed)
        // For 21 pairs, valid pairs are 0, 1, 2, ..., 20 (not 21)
        // HARDCODED FOR 21 PAIRS: Always exactly 21 pairs, no dynamic calculations
        const totalPairs = 21; // Hardcoded: always 21 pairs
        const expectedMessages = totalPairs * 2; // Hardcoded: 42 messages for 21 pairs
        
        // NEW APPROACH: Only calculate rotation for pairs 0-19
        // Pair 20 is special - it appears when rotation reaches 3600° and stays flat
        const maxValidPair = 19; // Changed: only pairs 0-19 rotate, pair 20 stays flat
        let shouldRelease = false; // Track sticky release state
        let leftCurrentMessage, leftNextMessage, rightCurrentMessage, rightNextMessage; // Message content variables
        const currentPairIndex = Math.min(Math.floor(currentRotation / 180), maxValidPair);
        const clampedPairIndex = currentPairIndex; // Clamp to available pairs
        
        // NEW APPROACH: Special handling for pair 20
        // Pair 20 appears when rotation reaches 3600° and stays flat
        let isPair20Visible = false;
        if (currentRotation >= 3600) {
            isPair20Visible = true;
    
        }
        
        // Calculate message indices based on current pair index
        // SCROLL-FRIENDLY: Always clamp to valid indices, even when scrolling beyond available pairs
        const clampedLeftMessageIndex = Math.min(currentPairIndex * 2, totalMessages - 2);
        const clampedRightMessageIndex = Math.min(currentPairIndex * 2 + 1, totalMessages - 1);
        
        // NEW APPROACH: No more complex flat detection needed
        // Pair 20 automatically appears and stays flat when rotation reaches 3600°
        // The old flat detection logic is no longer needed
        
        // SCROLL-FRIENDLY PAIR ACCESS: Allow scrolling up/down by checking message availability
        // Instead of blocking access, gracefully handle when we don't have enough messages
        
        // Update last rotation for scroll direction detection
        // window.lastRotation = currentRotation;
        
        // Stop conditions - prevent going beyond the last valid pair  
        // Stop when we would access invalid message indices
        const hasExceededMessages = clampedLeftMessageIndex >= totalMessages || clampedRightMessageIndex >= totalMessages;
        const isAtMaxRotation = currentRotation >= maxRotation;
        const isAtLastPossiblePair = (clampedLeftMessageIndex >= totalMessages - 2) && (clampedRightMessageIndex >= totalMessages - 1);
        const shouldStopAtMaxRotation = isAtMaxRotation && isAtLastPossiblePair;
        
        // IMMEDIATE STOP: Only stop when we've exceeded messages, not at the last valid pair
        // Allow the last pair to complete its full rotation
        if (hasExceededMessages && !isAtLastPossiblePair) {
            return; // Stop completely - no content rendering, no sticky release
        }
        
        // Handle scroll-back-up: Reset animation if we're scrolling back and not at the end
        if (animationStopped && !hasExceededMessages) {
            animationStopped = false;
            // Show the scenes again
            const leftScene = document.querySelector('.scene-left');
            const rightScene = document.querySelector('.scene-right');
            if (leftScene) leftScene.style.display = '';
            if (rightScene) rightScene.style.display = '';
            if (board) board.style.display = '';
            if (rightBoard) rightBoard.style.display = '';
        }
        
        // IMPORTANT: Always show boards when we have valid rotation, even when scrolling up
        // This prevents blank space when scrolling back up
        if (board) board.style.display = '';
        if (rightBoard) rightBoard.style.display = '';
        
        // Get scene elements for later use
        const leftScene = document.querySelector('.scene-left');
        const rightScene = document.querySelector('.scene-right');
        
        // Also ensure scenes are visible when scrolling up
        if (leftScene) leftScene.style.display = '';
        if (rightScene) rightScene.style.display = '';
        


        // Apply the rotation to both boards
        if (board) board.style.transform = `rotateX(${currentRotation}deg)`;
        if (rightBoard) rightBoard.style.transform = `rotateX(${currentRotation}deg)`;

        // Calculate trapezoid effect synchronized with board rotation
        // Use the same progress calculation as the board rotation
        // Ensure we never exceed maximum rotation in trapezoid calculations
        const clampedTrapezoidRotation = Math.min(currentRotation, maxRotation);
        const trapezoidProgress = Math.min(clampedTrapezoidRotation / maxRotation, 1);
        
        // Distance between boards: starts at 400px, goes down to 300px
        const boardDistance = 400 - (trapezoidProgress * 100);
        
        // Board size: starts at 150px, grows to 200px
        const boardSize = 150 + (trapezoidProgress * 50);
        
        // Update CSS custom properties for positioning (don't modify board dimensions directly)
        if (animationContainer) {
            animationContainer.style.setProperty('--board-distance', `${boardDistance}px`);
            animationContainer.style.setProperty('--board-size', `${boardSize}px`);
        }

        // Update trapezoid dimensions based on rotation progress (synchronized with boards)
        const trapezoidHeight = 333 - (trapezoidProgress * 222); // Shrinks from 333px to 111px
        const trapezoidTopWidth = 111 + (trapezoidProgress * 88); // Grows from 111px to 199px
        const trapezoidBottomWidth = 222; // Stays constant at 222px
        
        // Calculate the offset for the top edge to create trapezoid
        const trapezoidTopOffset = (trapezoidBottomWidth - trapezoidTopWidth) / 2;
        
        // Update the left trapezoid shape
        const leftTrapezoidSvg = document.getElementById('trapezoid-svg');
        const leftTrapezoidPolygon = document.getElementById('trapezoid-polygon');
        if (leftTrapezoidSvg && leftTrapezoidPolygon) {
            leftTrapezoidSvg.setAttribute('height', trapezoidHeight);
            leftTrapezoidSvg.setAttribute('viewBox', `0 0 ${trapezoidBottomWidth} ${trapezoidHeight}`);
            
            // Update the polygon points for the trapezoid
            const leftPoints = `${trapezoidTopOffset},0 ${trapezoidTopOffset + trapezoidTopWidth},0 ${trapezoidBottomWidth},${trapezoidHeight} 0,${trapezoidHeight}`;
            leftTrapezoidPolygon.setAttribute('points', leftPoints);
        }
        
        // Update the right trapezoid shape
        const rightTrapezoidSvg = document.getElementById('right-trapezoid-svg');
        const rightTrapezoidPolygon = document.getElementById('right-trapezoid-polygon');
        if (rightTrapezoidSvg && rightTrapezoidPolygon) {
            rightTrapezoidSvg.setAttribute('height', trapezoidHeight);
            rightTrapezoidSvg.setAttribute('viewBox', `0 0 ${trapezoidBottomWidth} ${trapezoidHeight}`);
            
            // Update the polygon points for the right trapezoid (mirrored)
            const rightPoints = `${trapezoidTopOffset + trapezoidTopWidth},0 ${trapezoidTopOffset},0 0,${trapezoidHeight} ${trapezoidBottomWidth},${trapezoidHeight}`;
            rightTrapezoidPolygon.setAttribute('points', rightPoints);
        }

        // Update text based on rotation
        // Map rotation to message pairs: 0-180° = first pair, 180-360° = second pair
        const messagePairIndex = Math.floor(currentRotation / 180);
        
        // Message indices already calculated in early exit section
        // Declare remaining variables needed for message content
        
        // Early stop logic moved to beginning of function
        
        // Reset logic handled by early exit section
        
        // Check if we're showing the last message pair
        const isLastPair = (clampedLeftMessageIndex + 2 >= totalMessages) || (clampedRightMessageIndex + 2 >= totalMessages);
        
        // MOBILE-AWARE APPROACH: Different logic for desktop vs mobile
        // Desktop (150vh): Animation fills most of container, wait for full scroll
        // Mobile (600vh): Animation completes early, release when animation is done
        
        const isRotationComplete = currentRotation >= maxRotation;
        const currentRotationMod = currentRotation % 180;
        const isFlat = currentRotationMod < 15 || currentRotationMod > 165; // More relaxed flat detection - within 15° of flat
        
        // Detect if we're on mobile - prioritize screen width to match CSS
        // screenWidth already declared in early exit section
        const isMobileByWidth = screenWidth <= 768; // Same as CSS media query
        const isMobileByContainer = containerHeight / window.innerHeight > 2; // Mobile has 300vh = 3 viewport units
        
        // Primary mobile detection: if screen width matches CSS breakpoint, treat as mobile
        // This ensures JavaScript logic matches CSS layout
        const isMobile = isMobileByWidth || isMobileByContainer;
        
        // Mobile-specific stop logic moved to beginning of function
        
        // TRACK PAIR DISPLAY: Only release stickiness when ALL N pairs have been shown
        
        // Calculate which pair we're currently showing
        // const totalPairs = 21; // Hardcoded: always 21 pairs // This line is moved to the top
        
        // Check if we've shown all pairs AND completed the rotation of the last pair
        // HARDCODED FOR 21 PAIRS: For 21 pairs, we need to show pairs 0, 1, 2, ..., 20 AND complete the rotation
        // The last pair needs to complete its full 180° rotation before releasing stickiness
        const hasShownAllPairs = currentPairIndex >= totalPairs - 1;
        const isLastPairComplete = currentRotation >= maxRotation; // Must complete full rotation
        
        // Only release when we've shown all pairs AND completed the full rotation
        if (hasShownAllPairs && isLastPairComplete) {
            shouldRelease = true;
        }
        
        // Fallback: if user has scrolled way past the container, force release
        const hasScrolledPastContainer = -rect.top > containerHeight;
        
        if (shouldRelease || hasScrolledPastContainer) {
            const stickyWrapper = animationContainer.querySelector('.sticky-wrapper');
            if (stickyWrapper && stickyWrapper.style.position !== 'static') {
                // Log when sticky positioning is released

                
                stickyWrapper.style.setProperty('position', 'static', 'important');
                stickyWrapper.style.setProperty('top', 'auto', 'important');
                stickyWrapper.style.setProperty('height', 'auto', 'important');
                stickyWrapper.style.setProperty('overflow', 'visible', 'important');
            }
        }
        
        // Get the actual messages
        // Ensure message indices are always valid (non-negative and within bounds)
        // Special handling for maximum rotation to always show last pair
        let finalLeftIndex, finalRightIndex;
        
        if (isPair20Visible) {
            // SPECIAL CASE: Pair 20 is visible and stays flat
            // Always show the last two messages (indices 40, 41)
            finalLeftIndex = totalMessages - 2; // 42 - 2 = 40
            finalRightIndex = totalMessages - 1; // 42 - 1 = 41
        } else if (currentRotation >= maxRotation) {
            // At maximum rotation, show the last rotating pair (pair 19)
            finalLeftIndex = totalMessages - 4; // 42 - 4 = 38 (pair 19 left)
            finalRightIndex = totalMessages - 3; // 42 - 3 = 39 (pair 19 right)
        } else {
            // Normal rotation, use calculated indices from clamped values
            // These are already clamped to valid bounds
            finalLeftIndex = clampedLeftMessageIndex;
            finalRightIndex = clampedRightMessageIndex;
        }
        
        // CRITICAL FIX: Ensure next message indices don't exceed array bounds
        // This prevents accessing finalMessages[42] when we only have 42 messages (indices 0-41)
        leftCurrentMessage = finalMessages[finalLeftIndex] || '';
        leftNextMessage = finalMessages[Math.min(finalLeftIndex + 2, totalMessages - 1)] || '';
        rightCurrentMessage = finalMessages[finalRightIndex] || '';
        rightNextMessage = finalMessages[Math.min(finalRightIndex + 2, totalMessages - 1)] || '';
        
        // SPECIAL DEBUG: Track message content for pair 20 to identify blank board issue
        // MOVED: This debug now runs after message retrieval to show actual content
        
        // More precise hiding logic - hide when we've exceeded the available messages
        // AND when the current message is empty
        const shouldHideLeft = (finalLeftIndex >= totalMessages) || (!leftCurrentMessage && !leftNextMessage);
        const shouldHideRight = (finalRightIndex >= totalMessages) || (!rightCurrentMessage && !rightNextMessage);
        
        if (leftScene) {
            leftScene.style.display = shouldHideLeft ? 'none' : '';
        }
        if (rightScene) {
            rightScene.style.display = shouldHideRight ? 'none' : '';
        }
        
        // Only show messages if they exist (prevents empty boards)
        // But allow showing when scrolling up by checking if we have any valid messages
        // Special handling for maximum rotation to always show last pair
        let hasValidMessages;
        if (currentRotation >= maxRotation) {
            // At maximum rotation, we should always have the last pair
            hasValidMessages = true;
        } else {
            // Normal rotation, check for valid messages
            hasValidMessages = leftCurrentMessage || rightCurrentMessage || 
                              finalMessages[Math.max(0, Math.floor(currentRotation / 180) * 2)] ||
                              finalMessages[Math.max(0, Math.floor(currentRotation / 180) * 2 + 1)];
        }
        
        if (!hasValidMessages) {
            return; // Skip this rotation if no messages exist
        }
        

        

        
        // Don't update text content if animation has been stopped
        if (animationStopped) {
            return;
        }
        
        // Determine which face should show which message based on rotation
        const isEvenFlip = Math.floor(currentRotation / 180) % 2 === 0;
        
        // Use normal rotation logic for all message counts
        if (isEvenFlip) {
            // On EVEN flips (0, 2, 4, ...), the .front div is the leading face
            if (frontFace) frontFace.innerHTML = leftCurrentMessage;
            if (backFace) backFace.innerHTML = leftNextMessage;
            // Right board shows even positions
            if (rightFrontFace) rightFrontFace.innerHTML = rightCurrentMessage;
            if (rightBackFace) rightBackFace.innerHTML = rightNextMessage;
        } else {
            // On ODD flips (1, 3, ...), the .back div is now the leading face
            if (backFace) backFace.innerHTML = leftCurrentMessage;
            if (frontFace) frontFace.innerHTML = leftNextMessage;
            // Right board shows even positions
            if (rightBackFace) rightBackFace.innerHTML = rightCurrentMessage;
            if (rightFrontFace) rightFrontFace.innerHTML = rightNextMessage;
        }
        
        // Stop rotation processing when we've exceeded messages to prevent phantom content
        if (hasExceededMessages && !animationStopped) {
            animationStopped = true;
            return; // Stop processing but let normal release logic handle sticky positioning
        }
    }
    
    // Calculate optimal font size based on longest text item
    calculateOptimalFontSize();
    
    // Set initial CSS custom properties
    if (animationContainer) {
        animationContainer.style.setProperty('--board-distance', '400px');
        animationContainer.style.setProperty('--board-size', '150px');
    }
    
    // Calculate optimal font size based on longest text item
    function calculateOptimalFontSize() {
        if (!finalMessages || finalMessages.length === 0) return;
        
        // Find the longest text item
        let longestText = '';
        let maxLength = 0;
        
        finalMessages.forEach(message => {
            if (message && message.length > maxLength) {
                maxLength = message.length;
                longestText = message;
            }
        });
        
        if (!longestText) return;
        
        // Get board dimensions (desktop: 350x200, mobile: 280x160)
        const isMobile = window.innerWidth <= 768;
        const boardWidth = isMobile ? 280 : 350;
        const boardHeight = isMobile ? 160 : 200;
        
        // Account for padding (20px desktop, 15px mobile)
        const padding = isMobile ? 15 : 20;
        const availableWidth = boardWidth - (padding * 2);
        const availableHeight = boardHeight - (padding * 2);
        
        // Create a temporary element to measure text
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
        
        // More conservative font size calculation
        let minFontSize = 8;
        let maxFontSize = isMobile ? 32 : 40; // Reduced max sizes
        let optimalFontSize = minFontSize;
        
        // Test font sizes from small to large
        for (let fontSize = minFontSize; fontSize <= maxFontSize; fontSize += 2) {
            tempElement.style.fontSize = fontSize + 'px';
            tempElement.textContent = longestText;
            
            const textRect = tempElement.getBoundingClientRect();
            const textWidth = textRect.width;
            const textHeight = textRect.height;
            
            // More conservative fit check - leave some margin
            if (textWidth <= availableWidth * 0.9 && textHeight <= availableHeight * 0.9) {
                optimalFontSize = fontSize;
            } else {
                break; // Stop when text gets too big
            }
        }
        
        // Clean up temporary element
        document.body.removeChild(tempElement);
        
        // Ensure font size is reasonable (fallback)
        const fallbackFontSize = isMobile ? 16 : 20;
        if (optimalFontSize < 12) {
            optimalFontSize = fallbackFontSize;
        }
        
        // Apply the optimal font size to all faces
        const faces = document.querySelectorAll('.face');
        faces.forEach(face => {
            face.style.fontSize = optimalFontSize + 'px';
        });
        

    }
    
    // Force mobile layout if CSS media query isn't working
    function forceMobileLayoutIfNeeded() {
        const screenWidth = window.innerWidth;
        const isMobileWidth = screenWidth <= 768;
        
        if (isMobileWidth) {
            
            // Get all scenes
            const scenes = document.querySelectorAll('.scene');
            const leftScene = document.querySelector('.scene-left');
            const rightScene = document.querySelector('.scene-right');
            const stickyWrapper = document.querySelector('.sticky-wrapper');
            
            // Apply mobile styles directly via JavaScript
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
            
            // Recalculate font size for mobile layout
            calculateOptimalFontSize();
            
            // Update padding for mobile
            const faces = document.querySelectorAll('.face');
            faces.forEach(face => {
                face.style.padding = '15px';
            });
        }
    }
    
    // Apply mobile layout on load and resize
    forceMobileLayoutIfNeeded();
    window.addEventListener('resize', forceMobileLayoutIfNeeded);
    
    // Set initial trapezoid state
    const initialHeight = 333;
    const initialTopWidth = 111;
    const initialBottomWidth = 222;
    const initialTopOffset = (initialBottomWidth - initialTopWidth) / 2;
    
    // Set initial left trapezoid
    const leftTrapezoidPolygon = document.getElementById('trapezoid-polygon');
    if (leftTrapezoidPolygon) {
        const leftInitialPoints = `${initialTopOffset},0 ${initialTopOffset + initialTopWidth},0 ${initialBottomWidth},${initialHeight} 0,${initialHeight}`;
        leftTrapezoidPolygon.setAttribute('points', leftInitialPoints);
    }
    
    // Set initial right trapezoid
    const rightTrapezoidPolygon = document.getElementById('right-trapezoid-polygon');
    if (rightTrapezoidPolygon) {
        const rightInitialPoints = `${initialTopOffset + initialTopWidth},0 ${initialTopOffset},0 0,${initialHeight} ${initialBottomWidth},${initialHeight}`;
        rightTrapezoidPolygon.setAttribute('points', rightInitialPoints);
    }
    
    // Run once on load to set the initial state correctly
    handleScroll();
    
    // Listen for scroll events (with safety check)
    if (typeof window !== 'undefined') {
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
    }






/**
 * Board Animation Pop-up JavaScript
 */

    
    // Open pop-up when trigger button is clicked
    $(document).on('click', '.board-animation-trigger', function(e) {
        e.preventDefault();
        
        const postId = $(this).data('animation-id');
        const $modal = $('#board-animation-modal');
        const $modalBody = $modal.find('.board-modal-body');
        
        // Show modal with loading state
        $modal.addClass('show').css('display', 'flex');
        $modalBody.html('<div class="board-modal-loading">Loading animation...</div>');
        $('body').css('overflow', 'hidden');
        
        // Load content via AJAX
        $.ajax({
            url: boardAnimationData.ajax_url,
            type: 'POST',
            data: {
                action: 'load_board_animation',
                post_id: postId,
                nonce: boardAnimationData.nonce
            },
            success: function(response) {
                console.log('Full AJAX Response:', response); // Log the entire response for debugging
                if (response.success) {
                    const data = response.data;
                    let html = '';
                    
                    // Build content
                    if (data.title) {
                        html += '<h2 class="board-modal-title">' + data.title + '</h2>';
                    }
                    
                    if (data.featured_image) {
                        html += '<div class="board-modal-image">';
                        html += '<img src="' + data.featured_image + '" alt="' + data.title + '">';
                        html += '</div>';
                    }
                    
                    if (data.content) {
                        html += '<div class="board-modal-content-area">' + data.content + '</div>';
                    }
                    
                    $modalBody.html(html);
                } else {
                    $modalBody.html('<p class="error">Failed to load animation.</p>');
                }
            },
            error: function() {
                $modalBody.html('<p class="error">An error occurred. Please try again.</p>');
            }
        });
    });
    
    // Close pop-up
    function closeBoardModal() {
        $('#board-animation-modal').removeClass('show').fadeOut(300);
        $('body').css('overflow', '');
    }
    
    // Close button click
    $('#close-board-modal').on('click', closeBoardModal);
    
    // Click outside modal to close
    $('#board-animation-modal').on('click', function(e) {
        if ($(e.target).is('#board-animation-modal')) {
            closeBoardModal();
        }
    });
    
    // ESC key to close
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $('#board-animation-modal').hasClass('show')) {
            closeBoardModal();
        }
    });
    
});