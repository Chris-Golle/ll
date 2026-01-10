<?php
/**
 * Lullberry Product Quick View Feature
 *
 * This file contains all the PHP logic for the product quick view modal,
 * including shortcode registration, asset enqueueing, AJAX handling,
 * and WooCommerce integration.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// ===================================================================================
// SHORTCODE REGISTRATION & ASSET ENQUEUEING
// ===================================================================================

/**
 * Registers the [lullberry_product_quick_view] shortcode.
 *
 * This shortcode is responsible for outputting the trigger button and ensuring
 * that all necessary JavaScript and CSS files for the quick view functionality
 * are loaded on the page.
 *
 * @param array $atts Shortcode attributes. Expects 'product_id'.
 * @return string The HTML for the trigger button.
 */
add_shortcode( 'lullberry_product_quick_view', 'lullberry_quick_view_shortcode' );
function lullberry_quick_view_shortcode( $atts ) {
    // 1. Enqueue Assets
    // ---------------------------------------------------------------------------------
    // This is the correct way to load scripts and styles for a shortcode.
    // They will only be added to the page when the shortcode is actually used.

    // Register the main JavaScript file which contains all modal and animation logic.
    wp_register_script(
        'lullberry-quick-view-js',
        get_stylesheet_directory_uri() . '/assets/js/quick-view.js',
        array( 'jquery' ),
        filemtime( get_stylesheet_directory() . '/assets/js/quick-view.js' ), // Cache busting
        true // Load in footer
    );

    // Pass critical data from PHP to our JavaScript file.
    // This includes the URL for AJAX requests and a security nonce.
    wp_localize_script(
        'lullberry-quick-view-js',
        'lullberry_quick_view_ajax',
        array(
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'nonce'    => wp_create_nonce( 'lullberry_quick_view_nonce' ),
        )
    );

    // Enqueue the script to be loaded on the page.
    wp_enqueue_script( 'lullberry-quick-view-js' );

    // Enqueue the stylesheet for the modal.
    wp_enqueue_style(
        'lullberry-quick-view-css',
        get_stylesheet_directory_uri() . '/assets/css/quick-view.css',
        array(),
        filemtime( get_stylesheet_directory() . '/assets/css/quick-view.css' ) // Cache busting
    );

    // 2. Process Attributes & Generate Output
    // ---------------------------------------------------------------------------------
    // Normalize attribute keys to lowercase.
    $atts = array_change_key_case( (array) $atts, CASE_LOWER );

    // Set up default attributes and merge with user-provided ones.
    $shortcode_atts = shortcode_atts(
        array(
            'product_id' => null,
        ),
        $atts
    );

    // Get the product ID. If not provided, try to get it from the global post object.
    $product_id = $shortcode_atts['product_id'] ? $shortcode_atts['product_id'] : get_the_ID();

    if ( ! $product_id ) {
        return '<!-- Lullberry Quick View: Product ID not found -->';
    }

    // Prepare the output buffer.
    ob_start();
    ?>
    <button class="lullberry-quick-view-trigger" data-product-id="<?php echo esc_attr( $product_id ); ?>">
        <?php esc_html_e( 'Quick View', 'twentytwentyfive-child' ); ?>
    </button>
    <?php
    return ob_get_clean();
}


// ===================================================================================
// AJAX HANDLER
// ===================================================================================

/**
 * Handles the AJAX request for loading the product quick view content.
 *
 * This function fetches all necessary product data, finds the associated
 * board animation, gathers its data, and returns everything in a structured
 * JSON format for the frontend JavaScript to process.
 */
add_action( 'wp_ajax_lullberry_load_product_quick_view', 'lullberry_ajax_load_product_quick_view' );
add_action( 'wp_ajax_nopriv_lullberry_load_product_quick_view', 'lullberry_ajax_load_product_quick_view' );

function lullberry_ajax_load_product_quick_view() {
    // 1. Security Check
    check_ajax_referer( 'lullberry_quick_view_nonce', 'nonce' );

    // 2. Get Product Data
    $product_id = isset( $_POST['product_id'] ) ? intval( $_POST['product_id'] ) : 0;
    if ( ! $product_id ) {
        wp_send_json_error( array( 'message' => 'Error: Product ID not provided.' ) );
        return;
    }

    // Setup post data for the product to make WooCommerce template functions work.
    global $post;
    $post = get_post( $product_id );
    setup_postdata( $post );

    $product = wc_get_product( $product_id );
    if ( ! $product ) {
        wp_send_json_error( array( 'message' => 'Error: Product not found.' ) );
        return;
    }

    // 3. Find Associated Board Animation CPT
    // Use the ACF get_field() function as required, which is the correct way to get ACF field values.
    $animation_id = get_field( 'associated_board_animation', $product_id );

    $animation_data = null;
    $animation_html = '';

    if ( $animation_id ) {
        // Retrieve animation messages
        $messages = [];
        for ( $i = 1; $i <= 40; $i++ ) {
            $message = get_post_meta( $animation_id, 'message_' . $i, true );
            if ( $message ) {
                $messages[] = esc_textarea( $message );
            }
        }

        // Prepare the data object that our JS expects.
        $animation_data = array( 'messages' => $messages );

        // Get the animation markup using the correct template loading function.
        ob_start();
        get_template_part( 'template-parts/board-animation-markup' );
        $animation_html = ob_get_clean();
    }

    // 4. Build the complete HTML response for the modal body
    ob_start();
    ?>
    <div class="product-quick-view-content">
        <h2><?php echo esc_html( $product->get_name() ); ?></h2>
        <div class="product-details">
            <div class="product-image">
                <?php echo $product->get_image('large'); ?>
            </div>
            <div class="product-summary">
                <?php woocommerce_template_single_price(); ?>
                <?php echo wc_get_stock_html( $product ); ?>
                <?php woocommerce_template_single_add_to_cart(); ?>
            </div>
        </div>

        <?php if ( ! empty( $animation_html ) ) : ?>
            <div class="animation-section">
                <?php echo $animation_html; ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
    $final_html = ob_get_clean();

    // Reset post data to avoid conflicts.
    wp_reset_postdata();

    // 5. Send JSON Response
    wp_send_json_success( array(
        'html'           => $final_html,
        'animation_data' => $animation_data,
    ) );
}

// ===================================================================================
// WOOCOMMERCE INTEGRATION
// ===================================================================================

/**
 * Automatically adds the quick view trigger button after the summary
 * on single WooCommerce product pages.
 */
add_action( 'woocommerce_after_single_product_summary', 'lullberry_add_quick_view_trigger_to_product_page', 25 );
function lullberry_add_quick_view_trigger_to_product_page() {
    global $product;
    if ( ! is_product() || ! $product ) {
        return;
    }
    // Output the shortcode, which handles asset loading and button markup.
    echo do_shortcode( '[lullberry_product_quick_view product_id="' . get_the_ID() . '"]' );
}
