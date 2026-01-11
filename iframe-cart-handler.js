jQuery(document).ready(function ($) {
    $(document.body).on('added_to_cart', function() {
        window.top.sessionStorage.setItem('cart_updated_in_overlay', 'true');
    });

    // Delegated handler for the close button, now in the correct iframe context
    $(document.body).on('click', '.product-overlay-close', function() {
        const wasUpdated = window.top.sessionStorage.getItem('cart_updated_in_overlay');
        if (wasUpdated === 'true') {
            window.top.sessionStorage.removeItem('cart_updated_in_overlay');
            window.top.location.reload();
        } else {
            // Close the overlay by removing it in the parent window
            window.top.$('.product-overlay-container').remove();
            window.top.$('html, body').css('overflow', '');
        }
    });

    // Escape key handler, now in the correct iframe context
    $(document).keyup(function(e) {
        if (e.key === "Escape") {
            const wasUpdated = window.top.sessionStorage.getItem('cart_updated_in_overlay');
            if (wasUpdated === 'true') {
                window.top.sessionStorage.removeItem('cart_updated_in_overlay');
                window.top.location.reload();
            } else {
                // Close the overlay by removing it in the parent window
                window.top.$('.product-overlay-container').remove();
                window.top.$('html, body').css('overflow', '');
            }
        }
    });
});
