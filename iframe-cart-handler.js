jQuery(document).ready(function ($) {
    $(document.body).on('added_to_cart', function() {
        window.parent.postMessage({ action: 'cart_updated' }, window.location.origin);
    });
});
