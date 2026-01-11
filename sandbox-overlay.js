jQuery(document).ready(function($) {
    // START Sandbox Overlay Logic
    $(document).on('click', '.product-fullscreen-button', function() {
        var button = $(this);
        var permalink = button.data('permalink');

        if (!permalink) {
            console.error('No permalink found for fullscreen button.');
            return;
        }

        var overlay = $('<div id="product-overlay"></div>');
        var spinner = $('<div class="overlay-spinner"></div>');
        var iframe = $('<iframe id="product-iframe" src="' + permalink + '?overlay_mode=1" style="opacity:0;"></iframe>');
        var closeButton = $('<button class="overlay-close-button">&times;</button>');

        overlay.append(spinner);
        overlay.append(iframe);
        overlay.append(closeButton);
        $('body').append(overlay);
        $('html, body').css('overflow', 'hidden');

        iframe.on('load', function() {
            spinner.hide();
            iframe.css('opacity', 1);
        });

        closeButton.on('click', function() {
            overlay.remove();
            $('html, body').css('overflow', '');
        });
    });

    // Listen for messages from the iframe (for cart updates)
    window.addEventListener('message', function(event) {
        if (event.origin !== window.location.origin) {
            return;
        }

        if (event.data && event.data.action === 'update_cart') {
            var fragments = event.data.fragments;
            if (fragments) {
                $.each(fragments, function(key, value) {
                    $(key).replaceWith(value);
                });
            }
        }
    });
    // END Sandbox Overlay Logic
});
