<?php
/**
 * Board Animation Custom Post Type and Functions
 */

// 1. Register Custom Post Type
add_action('init', 'register_board_animation_post_type');
function register_board_animation_post_type() {
    register_post_type('board_animation', array(
        'labels' => array(
            'name' => 'Board Animations',
            'singular_name' => 'Board Animation',
            'add_new_item' => 'Add New Board Animation',
            'edit_item' => 'Edit Board Animation',
        ),
        'public' => true,
        'has_archive' => true,
        'menu_icon' => 'dashicons-admin-customizer',
        'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'rewrite' => array('slug' => 'board-animation'),
    ));
}

// 2. Meta Boxes (Messages & Completion)
add_action('add_meta_boxes', 'add_board_animation_meta_boxes');
function add_board_animation_meta_boxes() {
    add_meta_box('board_messages', 'Board Messages', 'board_messages_callback', 'board_animation');
    add_meta_box('completion_message', 'Completion Message', 'completion_message_callback', 'board_animation');
}

function board_messages_callback($post) {
    wp_nonce_field('board_messages_nonce', 'board_messages_nonce');
    $messages = get_post_meta($post->ID, '_board_messages', true);
    // Display logic... (kept simple for brevity, standard editor output)
    $display_text = (is_array($messages)) ? implode(',', array_map(function($m) { return '"'.str_replace('{{NEWLINE}}', "\n", $m).'"'; }, $messages)) : '';
    
    echo '<p><strong>Format:</strong> "Message 1","Message 2"... (Use quotes)</p>';
    wp_editor($display_text, 'board_messages_text', array('media_buttons' => false, 'textarea_rows' => 10));
}

function completion_message_callback($post) {
    wp_nonce_field('completion_message_nonce', 'completion_message_nonce');
    $msg = get_post_meta($post->ID, '_completion_message', true);
    wp_editor($msg, 'completion_message_text', array('media_buttons' => false, 'textarea_rows' => 5));
}

// 3. Save Meta Data
add_action('save_post', 'save_board_animation_meta');
function save_board_animation_meta($post_id) {
    if (!isset($_POST['board_messages_nonce']) || !wp_verify_nonce($_POST['board_messages_nonce'], 'board_messages_nonce')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

    // Save Messages
    if (isset($_POST['board_messages_text'])) {
        $raw = html_entity_decode($_POST['board_messages_text']);
        // Simplified parsing logic: standard regex for quoted strings
        preg_match_all('/"((?:[^"\\\\]|\\\\.)*)"/', $raw, $matches);
        $messages = $matches[1] ?: [];
        $messages = array_map('trim', $messages);
        $messages = array_filter($messages); // Remove empty
        
        // Store as array
        update_post_meta($post_id, '_board_messages', $messages);
        // Backup as JSON
        update_post_meta($post_id, '_board_messages_json', json_encode($messages, JSON_UNESCAPED_UNICODE));
    }

    // Save Completion Message
    if (isset($_POST['completion_message_text'])) {
        update_post_meta($post_id, '_completion_message', wp_kses_post($_POST['completion_message_text']));
    }
}

// 4. Enqueue Board Animation Assets (CPT + WooCommerce products)
add_action( 'wp_enqueue_scripts', 'enqueue_board_animation_assets' );

function enqueue_board_animation_assets() {

    $board_post_id = null;

    // Case 1: Single board_animation CPT page
    if ( is_singular( 'board_animation' ) ) {
        $board_post_id = get_the_ID();
    }

    // Case 2: WooCommerce product page with linked board animation (ACF)
    elseif ( function_exists( 'is_product' ) && is_product() && function_exists( 'get_field' ) ) {
        $linked_board_id = get_field( 'board_animation' );
        if ( $linked_board_id ) {
            $board_post_id = $linked_board_id;
        }
    }

    // If no board animation is relevant, bail early
    if ( ! $board_post_id ) {
        return;
    }

    // Enqueue CSS
    wp_enqueue_style(
        'board-style',
        get_stylesheet_directory_uri() . '/css/board-animation.css',
        array(),
        '1.1'
    );

    // Enqueue Modal CSS
    wp_enqueue_style(
        'board-modal-style',
        get_stylesheet_directory_uri() . '/css/board-modal.css',
        array(),
        '1.0'
    );

    // Enqueue JS
    wp_enqueue_script(
        'board-script',
        get_stylesheet_directory_uri() . '/board-animation.js',
        array( 'jquery' ),
        '1.1',
        true
    );


    // Prepare messages for JS
    $messages = get_post_meta( $board_post_id, '_board_messages', true );
    if ( ! is_array( $messages ) ) {
        $messages = [];
    }

    $messages = array_map(
        function ( $m ) {
            return str_replace( '{{NEWLINE}}', "\n", $m );
        },
        $messages
    );

    // Localize data for JS
    wp_localize_script(
        'board-script',
        'boardAnimationData',
        array(
            'messages' => $messages,
            'boardId'  => $board_post_id,
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'nonce'    => wp_create_nonce( 'load-board-animation-nonce' ),
        )
    );
}


// AJAX handler for loading single product content
function lullberry_load_product_quick_view() {
    check_ajax_referer('load-board-animation-nonce', 'nonce');

    $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
    if (empty($product_id) || 'product' !== get_post_type($product_id)) {
        wp_send_json_error('Invalid product ID.');
    }

    // Set up global post data for WooCommerce templates
    global $post, $product;
    $post = get_post($product_id);
    $product = wc_get_product($product_id);

    if (!$product) {
        wp_send_json_error('Product not found.');
    }

    setup_postdata($post);

    ob_start();
    // Use the standard WooCommerce template for single product content
    wc_get_template_part('content', 'single-product');
    $content = ob_get_clean();

    wp_reset_postdata();

    wp_send_json_success($content);
}
add_action('wp_ajax_lullberry_load_product_quick_view', 'lullberry_load_product_quick_view');
add_action('wp_ajax_nopriv_lullberry_load_product_quick_view', 'lullberry_load_product_quick_view');


// 5. The Modern Iframe Modal System
// Shortcode: [product_quick_view product_id="123" button_text="Quick View"]
// Also accepts `id` as an alias for `product_id`.
add_shortcode('product_quick_view', 'lullberry_product_quick_view_shortcode');
function lullberry_product_quick_view_shortcode($atts) {
    $atts = shortcode_atts(array(
        'product_id'  => 0,
        'id'          => 0, // Accept 'id' as an alias
        'button_text' => 'Quick View',
    ), $atts, 'product_quick_view');

    // Use 'product_id' if available, otherwise fall back to 'id'
    $product_id = absint($atts['product_id'] ? $atts['product_id'] : $atts['id']);

    // --- DEBUGGING START ---
    error_log('[Quick View Debug] Shortcode attributes received: ' . print_r($atts, true));
    error_log('[Quick View Debug] Processed Product ID: ' . $product_id);

    if (empty($product_id)) {
        error_log('[Quick View Debug] Exiting: Product ID is empty.');
        return '';
    }

    $post_type = get_post_type($product_id);
    error_log('[Quick View Debug] Post type for ID ' . $product_id . ' is: ' . $post_type);

    if ('product' !== $post_type) {
        error_log('[Quick View Debug] Exiting: Post type is not "product".');
        return '';
    }
    // --- DEBUGGING END ---

    // Enqueue scripts needed for Add to Cart to work in the modal
    wp_enqueue_script('wc-add-to-cart');
    wp_enqueue_script('wc-add-to-cart-variation');

    // Enqueue our new quick view script
    wp_enqueue_script(
        'product-quick-view-script',
        get_stylesheet_directory_uri() . '/product-quick-view.js',
        array('wc-add-to-cart-variation'), // Dependency
        '1.0',
        true
    );

    // Ensure the single reusable modal is added to the footer
    add_action('wp_footer', 'lullberry_render_single_board_modal', 1);

    return sprintf(
        '<button class="product-quick-view-trigger" data-product-id="%d">%s</button>',
        $product_id,
        esc_html($atts['button_text'])
    );
}

// Renders a single, reusable modal in the footer
function lullberry_render_single_board_modal() {
    // Ensure this function runs only once
    static $modal_rendered = false;
    if ($modal_rendered) {
        return;
    }
    $modal_rendered = true;
    ?>
    <dialog id="board-animation-modal" class="board-modal">
        <div class="board-modal-content">
            <button class="board-modal-close" aria-label="Close">×</button>
            <div class="board-modal-body">
                <!-- AJAX content will be loaded here -->
            </div>
        </div>
    </dialog>
    <?php
}

function lullberry_display_board_animation_on_product_page() {
    if ( ! function_exists( 'get_field' ) ) {
        return;
    }

    $board_id = get_field( 'board_animation' );
    if ( ! $board_id ) {
        return;
    }

    $board_post = get_post( $board_id );
    if ( ! $board_post || 'board_animation' !== $board_post->post_type ) {
        return;
    }

    // Setup post data for the board animation
    global $post;
    $post = $board_post;
    setup_postdata( $post );

    require get_stylesheet_directory() . '/board-animation-markup.php';

    // Restore original post data
    wp_reset_postdata();
}
add_action( 'woocommerce_after_single_product_summary', 'lullberry_display_board_animation_on_product_page', 5 );
