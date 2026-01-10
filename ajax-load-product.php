<?php
/**
 * AJAX handler for loading WooCommerce product content.
 */
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'wp_ajax_nopriv_load_product', 'ajax_load_product_callback' );
add_action( 'wp_ajax_load_product', 'ajax_load_product_callback' );

function ajax_load_product_callback() {
	check_ajax_referer( 'product_overlay_nonce', 'nonce' );

	$product_id = isset( $_POST['product_id'] ) ? intval( $_POST['product_id'] ) : 0;
	if ( ! $product_id || 'product' !== get_post_type( $product_id ) ) {
		wp_send_json_error( 'Invalid Product ID' );
	}

	// Set up global post data for the WooCommerce template and our hooked function.
	$GLOBALS['post'] = get_post( $product_id );
	setup_postdata( $GLOBALS['post'] );

	ob_start();
	// This will render the product and, via the 'woocommerce_after_single_product_summary' hook,
	// our 'lullberry_display_board_animation_on_product_page' function will run and include the markup.
	wc_get_template_part( 'content', 'single-product' );
	$html = ob_get_clean();

	wp_reset_postdata();

	// Fetch the messages to send along with the HTML
	$messages = array();
	if ( function_exists( 'get_field' ) ) {
		$board_id = get_field( 'board_animation', $product_id );
		if ( $board_id ) {
			$raw_messages = get_post_meta( $board_id, '_board_messages', true );
			if ( is_array( $raw_messages ) ) {
				$messages = array_map(
					function ( $m ) {
						return str_replace( '{{NEWLINE}}', "\n", $m );
					},
					$raw_messages
				);
			}
		}
	}

	wp_send_json_success( array( 'html' => $html, 'messages' => $messages ) );
}
