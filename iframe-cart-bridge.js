jQuery(document).ready(function($) {
    // START Iframe Cart Bridge Logic
    $(document.body).on('added_to_cart', function(event, fragments) {
        window.parent.postMessage({
            action: 'update_cart',
            fragments: fragments
        }, window.location.origin);
    });
    // END Iframe Cart Bridge Logic
});
