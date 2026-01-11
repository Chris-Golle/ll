jQuery(document).ready(function ($) {
    $(document.body).on('added_to_cart', function() {
        window.top.sessionStorage.setItem('cart_updated_in_overlay', 'true');
    });
});
