<?php
/**
 * Plugin Name: Board Animation Modal
 * Description: Handles the modal popup for the board animation CPT.
 * Version: 1.0
 * Author: Jules
 */

// === 1. CPT REGISTRATION ===
// Registers the 'board_animation' custom post type.
add_action('init', 'register_board_animation_post_type');
function register_board_animation_post_type() {
    $labels = array(
        'name'               => 'Board Animations',
        'singular_name'      => 'Board Animation',
        'menu_name'          => 'Board Animations',
        'add_new'            => 'Add New',
        'add_new_item'       => 'Add New Board Animation',
        'edit_item'          => 'Edit Board Animation',
        'new_item'           => 'New Board Animation',
        'view_item'          => 'View Board Animation',
        'search_items'       => 'Search Board Animations',
        'not_found'          => 'No board animations found',
        'not_found_in_trash' => 'No board animations found in trash'
    );

    $args = array(
        'labels'              => $labels,
        'public'              => true,
        'publicly_queryable'  => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_rest'        => true,
        'query_var'           => true,
        'rewrite'             => array('slug' => 'board-animation'),
        'capability_type'     => 'post',
        'has_archive'         => true,
        'hierarchical'        => false,
        'menu_position'       => 20,
        'menu_icon'           => 'dashicons-admin-customizer',
        'supports'            => array('title', 'editor', 'thumbnail', 'custom-fields')
    );

    register_post_type('board_animation', $args);
}


// === 2. SHORTCODE REGISTRATION ===
// Registers the [board_animation_trigger] shortcode.
add_shortcode('board_animation_trigger', 'board_animation_trigger_shortcode');

/**
 * Renders the HTML for the shortcode.
 *
 * @param array $atts Shortcode attributes.
 * @return string HTML output for the shortcode.
 */
function board_animation_trigger_shortcode($atts) {
    // Sanitize attributes
    $atts = shortcode_atts(
        array(
            'post_id'     => 0,
            'button_text' => 'Launch',
        ),
        $atts,
        'board_animation_trigger'
    );

    $post_id = intval($atts['post_id']);

    // Basic validation
    if (empty($post_id)) {
        return '<!-- Board Animation: Invalid post_id -->';
    }

    // Return a semantic button with a data attribute.
    return sprintf(
        '<button class="board-animation-trigger-button" data-post-id="%d">%s</button>',
        esc_attr($post_id),
        esc_html($atts['button_text'])
    );
}

// === 2. ASSET ENQUEUEING ===
// Enqueues the necessary JavaScript and localizes data.
add_action('wp_enqueue_scripts', 'board_animation_enqueue_assets');

function board_animation_enqueue_assets() {
    // Enqueue the CSS file.
    wp_enqueue_style(
        'board-animation-style',
        get_stylesheet_directory_uri() . '/css/board-animation.css',
        array(),
        '1.0'
    );

    // Enqueue the JavaScript file.
    wp_enqueue_script(
        'board-modal-js',
        get_stylesheet_directory_uri() . '/board-modal.js',
        array(), // No dependencies
        '1.0',   // Version number
        true     // Load in footer
    );

    // Localize data to pass to the script.
    wp_localize_script(
        'board-modal-js',
        'boardAnimation',
        array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce'    => wp_create_nonce('board_animation_nonce'),
        )
    );
}

// === 3. AJAX HANDLERS ===
// Registers AJAX handlers for both logged-in and non-logged-in users.
add_action('wp_ajax_load_board_content', 'board_animation_ajax_handler');
add_action('wp_ajax_nopriv_load_board_content', 'board_animation_ajax_handler');

/**
 * Handles the AJAX request to load CPT content.
 */
function board_animation_ajax_handler() {
    // Verify the nonce for security.
    check_ajax_referer('board_animation_nonce', 'nonce');

    // Validate post_id.
    if (!isset($_POST['post_id']) || !is_numeric($_POST['post_id'])) {
        wp_send_json_error(array('message' => 'Invalid post ID.'), 400);
    }

    $post_id = intval($_POST['post_id']);
    $post = get_post($post_id);

    // Validate that the post exists and is the correct post type.
    if (!$post || 'board_animation' !== get_post_type($post)) {
        wp_send_json_error(array('message' => 'Post not found or invalid post type.'), 404);
    }

    // Prepare the data to be returned.
    $data = array(
        'title'   => get_the_title($post),
        'content' => apply_filters('the_content', $post->post_content),
    );

    // Send a success response.
    wp_send_json_success($data);

    // IMPORTANT: Always exit after an AJAX handler.
    wp_die();
}


// === 4. MODAL HTML INJECTION ===
// Injects the modal container into the footer.
add_action('wp_footer', 'board_animation_add_modal_container');

/**
 * Outputs the modal's HTML structure in the footer.
 */
function board_animation_add_modal_container() {
    echo '
    <div id="board-animation-modal" class="board-animation-modal" style="display:none;">
        <div class="board-animation-modal-content">
            <button class="board-animation-modal-close">&times;</button>
            <div class="board-animation-modal-body">
                <!-- Content will be loaded here -->
            </div>
        </div>
    </div>';
}
