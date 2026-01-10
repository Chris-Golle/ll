<?php
/**
 * Shortcode to display a WooCommerce product in a fullscreen overlay.
 */
if ( ! defined( 'ABSPATH' ) ) exit;

function register_product_fullscreen_shortcode() {
	add_shortcode( 'product_fullscreen', 'render_product_fullscreen_shortcode' );
}
add_action( 'init', 'register_product_fullscreen_shortcode' );

function render_product_fullscreen_shortcode( $atts ) {
	$atts = shortcode_atts(
		array( 'product_id' => 0 ),
		$atts,
		'product_fullscreen'
	);

	$product_id = intval( $atts['product_id'] );
	if ( ! $product_id || 'product' !== get_post_type( $product_id ) ) {
		return '<!-- Invalid Product ID -->';
	}

	enqueue_product_overlay_assets( $product_id );

	return sprintf(
		'<button class="product-fullscreen-trigger" data-product-id="%d">%s</button>',
		esc_attr( $product_id ),
		esc_html__( 'View Product', 'twentytwentyfive-child' )
	);
}

function enqueue_product_overlay_assets( $product_id ) {
	static $assets_enqueued = false;
	if ( $assets_enqueued ) return;
	$assets_enqueued = true;

	wp_enqueue_style('product-overlay-style', get_stylesheet_directory_uri() . '/product-overlay.css');
	wp_enqueue_script('product-overlay-script', get_stylesheet_directory_uri() . '/product-overlay.js', array(), false, true);
	wp_localize_script('product-overlay-script', 'productOverlayData',
		array(
			'ajax_url' => admin_url( 'admin-ajax.php' ),
			'nonce'    => wp_create_nonce( 'product_overlay_nonce' ),
		)
	);

	// This wrapper is necessary to provide the correct context (the product)
	// to the main enqueueing function, which relies on global state.
	if ( function_exists( 'enqueue_board_animation_assets' ) ) {
		$original_post = $GLOBALS['post'];
		$GLOBALS['post'] = get_post( $product_id );
		setup_postdata( $GLOBALS['post'] );

		enqueue_board_animation_assets();

		wp_reset_postdata();
		$GLOBALS['post'] = $original_post;
		if ( $GLOBALS['post'] ) {
			setup_postdata( $GLOBALS['post'] );
		}
	}
}
