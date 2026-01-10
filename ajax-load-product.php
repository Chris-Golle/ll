<?php
/**
 * AJAX handler for loading WooCommerce product content.
 *
 * @package TwentyTwentyFive-Child
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the AJAX actions for loading the product content.
 */
function register_ajax_load_product_actions() {
	add_action( 'wp_ajax_nopriv_load_product', 'ajax_load_product_callback' );
	add_action( 'wp_ajax_load_product', 'ajax_load_product_callback' );
}
add_action( 'init', 'register_ajax_load_product_actions' );

/**
 * The callback function for the 'load_product' AJAX action.
 *
 * This function handles the request, validates security, and returns the
 * rendered HTML of a single WooCommerce product.
 */
function ajax_load_product_callback() {
	// 1. Security Check: Verify the nonce.
	check_ajax_referer( 'product_overlay_nonce', 'nonce' );

	// 2. Get Product ID: Sanitize and validate the product ID from the request.
	$product_id = isset( $_POST['product_id'] ) ? intval( $_POST['product_id'] ) : 0;

	if ( ! $product_id || 'product' !== get_post_type( $product_id ) ) {
		wp_send_json_error( 'Invalid Product ID' );
	}

	// 3. Set Up Global Post Data: This is crucial for WooCommerce template functions.
	global $post, $product;
	$post    = get_post( $product_id );
	$product = wc_get_product( $product_id );

	if ( ! $product ) {
		wp_send_json_error( 'Product not found.' );
	}

	setup_postdata( $post );

	// 4. Capture Output: Use an output buffer to capture the HTML.
	ob_start();

	// 5. Render WooCommerce Template: Use wc_get_template_part to render the product.
	// This is the standard WooCommerce way and avoids issues with the_content().
	wc_get_template_part( 'content', 'single-product' );

	// 6. Include CPT Animation Markup:
	// This replicates the logic from the 'woocommerce_after_single_product_summary' action
	// to ensure the animation markup is included in our AJAX response.
	if ( function_exists( 'get_field' ) ) {
		$board_id = get_field( 'board_animation', $product_id );
		if ( $board_id ) {
			$board_post = get_post( $board_id );
			if ( $board_post && 'board_animation' === $board_post->post_type ) {
				// Temporarily set up postdata for the board animation CPT.
				$temp_post = $post;
				$post = $board_post;
				setup_postdata( $post );

				require get_stylesheet_directory() . '/board-animation-markup.php';

				// Restore the original product postdata.
				$post = $temp_post;
				setup_postdata( $post );
			}
		}
	}


	// 7. Get Buffered Content: Get the captured HTML.
	$html = ob_get_clean();

	// 8. Restore Original Post Data: Clean up the global state.
	wp_reset_postdata();

	// 9. Send Response: Send the HTML back to the frontend.
	wp_send_json_success( $html );
}
