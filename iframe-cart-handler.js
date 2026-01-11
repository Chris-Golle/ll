jQuery(document).ready(function ($) {
    $(document.body).on('added_to_cart', function (event, fragments, cart_hash) {
        if (window.parent) {
            window.parent.postMessage({
                action: 'woocommerce_added_to_cart',
                fragments: fragments,
                cart_hash: cart_hash
            }, window.location.origin);
        }
    });
});
