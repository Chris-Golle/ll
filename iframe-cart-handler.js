jQuery(document).ready(function ($) {
    $(document.body).on('added_to_cart', function() {
        if (window.parent) {
            window.parent.postMessage({ action: 'wc_force_refresh' }, window.location.origin);
        }
    });
});
