document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('board-animation-modal');
    if (!modal) return;

    const modalBody = modal.querySelector('.board-modal-body');
    const closeModalButton = modal.querySelector('.board-modal-close');

    const openModal = async (productId) => {
        modal.showModal();
        modalBody.innerHTML = '<div class="board-modal-loading">Loading product...</div>';

        try {
            const formData = new FormData();
            formData.append('action', 'lullberry_load_product_quick_view');
            formData.append('product_id', productId);
            formData.append('nonce', lullberry_quick_view_data.nonce);

            const response = await fetch(lullberry_quick_view_data.ajax_url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const result = await response.json();

            if (result.success) {
                modalBody.innerHTML = result.data;

                // VERY IMPORTANT: Trigger WooCommerce events to make variations and add-to-cart work
                // This tells the WooCommerce scripts to initialize the forms we just loaded via AJAX
                const variationsForm = modalBody.querySelector('.variations_form');
                if (variationsForm) {
                    // wc-add-to-cart-variation.js listens for this event
                    variationsForm.dispatchEvent(new Event('wc_variation_form'));
                }

                // CRITICAL: Initialize the animation script now that the markup is in the DOM
                if (window.initBoardAnimation) {
                    window.initBoardAnimation();
                }
            } else {
                throw new Error(result.data || 'Failed to load product content.');
            }
        } catch (error) {
            console.error('Error loading product quick view:', error);
            modalBody.innerHTML = '<p class="error">Sorry, we could not load the product. Please try again later.</p>';
        }
    };

    const closeModal = () => {
        modal.close();
        modalBody.innerHTML = ''; // Clean up
    };

    // Main event listener for trigger buttons
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.product-quick-view-trigger');
        if (trigger && trigger.dataset.productId) {
            openModal(trigger.dataset.productId);
        }
    });

    // Listeners for closing the modal
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});
