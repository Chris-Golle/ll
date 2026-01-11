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

    // Case 2: Iframe overlay mode
    elseif (isset($_GET['overlay_mode']) && is_product()) {
        $linked_board_id = get_field('board_animation', get_the_ID());
        if ($linked_board_id) {
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
        )
    );
}

// 5. Refactored Content Injection Logic
add_action('woocommerce_after_single_product', 'lullberry_product_page_content_injection');
function lullberry_product_page_content_injection() {
    if (!function_exists('get_field') || !get_field('board_animation')) {
        return;
    }

    if (isset($_GET['overlay_mode'])) {
        // Inside the iframe: render the animation markup
        global $post;
        $original_post = $post;
        $post = get_post(get_field('board_animation'));
        setup_postdata($post);
        require get_stylesheet_directory() . '/board-animation-markup.php';
        wp_reset_postdata();
        $post = $original_post;
    } else {
        // On the main product page: render the fullscreen button
        echo do_shortcode('[product_fullscreen product_id="' . get_the_ID() . '"]');
    }
}

