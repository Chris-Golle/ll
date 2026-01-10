jQuery(document).ready(function($) {
    // ===================================================================================
    // LULLBERRY PRODUCT QUICK VIEW LOGIC
    // ===================================================================================

    // 1. MODAL & TRIGGER HANDLING
    // -----------------------------------------------------------------------------------

    // Listen for clicks on our quick view button
    $(document).on('click', '.lullberry-quick-view-trigger', function(e) {
        e.preventDefault();
        const productId = $(this).data('product-id');

        // Check if modal exists, if not, create it and append to body
        if ($('#lullberry-quick-view-modal').length === 0) {
            $('body').append(`
                <div id="lullberry-quick-view-modal" class="lullberry-modal">
                    <div class="lullberry-modal-content">
                        <button class="lullberry-modal-close">&times;</button>
                        <div class="lullberry-modal-body"></div>
                    </div>
                </div>
            `);
        }

        const $modal = $('#lullberry-quick-view-modal');
        const $modalBody = $modal.find('.lullberry-modal-body');

        // Show modal with loading state
        $modal.addClass('show');
        $('body').addClass('lullberry-modal-open');
        $modalBody.html('<div class="lullberry-loading-spinner"></div>');

        // 2. AJAX REQUEST
        // -----------------------------------------------------------------------------------
        // Fetch the product content and animation data
        $.ajax({
            url: lullberry_quick_view_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'lullberry_load_product_quick_view',
                product_id: productId,
                nonce: lullberry_quick_view_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    const data = response.data;

                    // Inject the HTML content into the modal body
                    $modalBody.html(data.html);

                    // IMPORTANT: The board animation script depends on a global
                    // window.boardAnimationData object. We create it here using
                    // the data returned from our AJAX call.
                    if (data.animation_data) {
                        window.boardAnimationData = data.animation_data;

                        // Now that the data is available and the markup is in the DOM,
                        // we can initialize the animation script.
                        // We wrap it in a small timeout to ensure the browser has rendered the new HTML.
                        setTimeout(function() {
                            if (typeof window.initBoardAnimation === 'function') {
                                window.initBoardAnimation();
                            }
                        }, 100);
                    }
                } else {
                    $modalBody.html('<p class="error">' + (response.data.message || 'Failed to load product details.') + '</p>');
                }
            },
            error: function() {
                $modalBody.html('<p class="error">An unexpected error occurred. Please try again.</p>');
            }
        });
    });

    // 3. MODAL CLOSE HANDLERS
    // -----------------------------------------------------------------------------------
    function closeLullberryModal() {
        const $modal = $('#lullberry-quick-view-modal');
        $modal.removeClass('show');
        $('body').removeClass('lullberry-modal-open');

        // Use a timeout to allow the closing animation to finish before clearing content
        setTimeout(function() {
            if (!$modal.hasClass('show')) {
                $modal.find('.lullberry-modal-body').html('');
                // Unbind scroll/resize listeners specific to the animation
                $(window).off('.boardAnimation');
                // Clean up global state
                window.boardAnimationData = null;
                window.__boardAnimationRunning = false;
            }
        }, 300); // Should match the CSS transition duration
    }

    // Close on button click
    $(document).on('click', '.lullberry-modal-close', closeLullberryModal);

    // Close on clicking the modal background
    $(document).on('click', '#lullberry-quick-view-modal', function(e) {
        if ($(e.target).is('#lullberry-quick-view-modal')) {
            closeLullberryModal();
        }
    });

    // Close on 'Escape' key press
    $(document).on('keydown', function(e) {
        if (e.key === "Escape" && $('#lullberry-quick-view-modal').hasClass('show')) {
            closeLullberryModal();
        }
    });


    // ===================================================================================
    // LULLBERRY BOARD ANIMATION SCRIPT (UNIFIED & SCOPED)
    // ===================================================================================

    window.initBoardAnimation = function () {
        if (window.__boardAnimationRunning) return;

        const modalContent = document.getElementById('lullberry-quick-view-modal');
        if (!modalContent) return;

        const animationContainer = modalContent.querySelector('#animation-container');
        if (!animationContainer) return;

        window.__boardAnimationRunning = true;

        const messages = window.boardAnimationData ? window.boardAnimationData.messages : [];
        if (!messages || messages.length === 0) {
            window.__boardAnimationRunning = false;
            return;
        }

        const board = animationContainer.querySelector('#board');
        const frontFace = animationContainer.querySelector('#front-face');
        const backFace = animationContainer.querySelector('#back-face');
        const rightBoard = animationContainer.querySelector('#right-board');
        const rightFrontFace = animationContainer.querySelector('#right-front-face');
        const rightBackFace = animationContainer.querySelector('#right-back-face');

        if (!board || !rightBoard) {
            console.error("Board animation elements not found within the modal.");
            window.__boardAnimationRunning = false;
            return;
        }

        const finalMessages = messages;

        if (frontFace && finalMessages[0]) frontFace.innerHTML = finalMessages[0];
        if (backFace && finalMessages[2]) backFace.innerHTML = finalMessages[2];
        if (rightFrontFace && finalMessages[1]) rightFrontFace.innerHTML = finalMessages[1];
        if (rightBackFace && finalMessages[3]) rightBackFace.innerHTML = finalMessages[3];

        board.style.transformOrigin = '50% 50% 0px';
        board.style.willChange = 'transform';
        rightBoard.style.transformOrigin = '50% 50% 0px';
        rightBoard.style.willChange = 'transform';

        const scenes = animationContainer.querySelectorAll('.scene');
        scenes.forEach(scene => {
            scene.style.perspectiveOrigin = '50% 50%';
        });

        // The scroll handler needs to be bound to the modal body, not the window
        const modalBody = modalContent.querySelector('.lullberry-modal-body');

        function handleScroll() {
            const rect = animationContainer.getBoundingClientRect();
            // Adjust scroll calculations for the modal's scroll container
            const scrollTop = modalBody.scrollTop;
            const containerTop = animationContainer.offsetTop;
            const containerHeight = animationContainer.offsetHeight;
            const viewportHeight = modalBody.clientHeight;

            // Prevent calculations when the element is not in view within the modal
            if ( (animationContainer.offsetTop + containerHeight) < scrollTop || animationContainer.offsetTop > (scrollTop + viewportHeight)) {
                 return;
            }

            const progress = Math.max(0, Math.min(1, (scrollTop - containerTop) / (containerHeight - viewportHeight)));
            const totalRotations = 20;
            const maxRotation = totalRotations * 180;
            const targetRotation = progress * maxRotation;
            const currentRotation = Math.min(targetRotation, maxRotation);

            if (currentRotation >= maxRotation) return;

            const visualRotation = currentRotation % 360;
            board.style.transform = `translate3d(0,0,0) rotateX(${visualRotation}deg)`;
            rightBoard.style.transform = `translate3d(0,0,0) rotateX(${visualRotation}deg)`;

            const messagePairIndex = Math.floor(currentRotation / 180);
            const leftCurrentIndex = messagePairIndex * 2;
            const rightCurrentIndex = leftCurrentIndex + 1;

            let leftCurrentMessage = finalMessages[leftCurrentIndex] || '';
            let leftNextMessage = finalMessages[leftCurrentIndex + 2] || '';
            let rightCurrentMessage = finalMessages[rightCurrentIndex] || '';
            let rightNextMessage = finalMessages[rightCurrentIndex + 2] || '';

            const isEvenFlip = messagePairIndex % 2 === 0;

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
        }

        // Initial setup calls
        handleScroll();

        // Bind to the modal's scroll event, with namespacing for easy removal.
        $(modalBody).on('scroll.boardAnimation', handleScroll);
    };
});
