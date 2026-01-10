<?php
/**
 * Shortcode to display a WooCommerce product in a fullscreen overlay.
 *
 * Shortcode: [product_fullscreen product_id="123"]
 *
 * @package TwentyTwentyFive-Child
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the [product_fullscreen] shortcode.
 */
function register_product_fullscreen_shortcode() {
	add_shortcode( 'product_fullscreen', 'render_product_fullscreen_shortcode' );
}
add_action( 'init', 'register_product_fullscreen_shortcode' );

/**
 * Renders the [product_fullscreen] shortcode.
 *
 * @param array $atts Shortcode attributes.
 * @return string The shortcode output.
 */
function render_product_fullscreen_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'product_id' => 0,
		),
		$atts,
		'product_fullscreen'
	);

	$product_id = intval( $atts['product_id'] );

	if ( ! $product_id || 'product' !== get_post_type( $product_id ) ) {
		return '<!-- Invalid Product ID -->';
	}

	// Enqueue assets required for the overlay.
	enqueue_product_overlay_assets();

	// Return a button that will trigger the overlay.
	// The data-product-id attribute is used by product-overlay.js to fetch the correct product.
	return sprintf(
		'<button class="product-fullscreen-trigger" data-product-id="%d">%s</button>',
		esc_attr( $product_id ),
		esc_html__( 'View Product', 'twentytwentyfive-child' )
	);
}

/**
 * Enqueues the CSS and JavaScript assets for the product overlay.
 *
 * This function is designed to be called only when the shortcode is rendered,
 * ensuring that these assets are only loaded on pages where they are needed.
 */
function enqueue_product_overlay_assets() {
	// Ensure assets are only enqueued once.
	static $assets_enqueued = false;
	if ( $assets_enqueued ) {
		return;
	}
	$assets_enqueued = true;

	$theme_version = wp_get_theme()->get( 'Version' );

	// Enqueue the overlay CSS.
	wp_enqueue_style(
		'product-overlay-style',
		get_stylesheet_directory_uri() . '/product-overlay.css',
		array(),
		$theme_version
	);

	// Enqueue the overlay JavaScript.
	wp_enqueue_script(
		'product-overlay-script',
		get_stylesheet_directory_uri() . '/product-overlay.js',
		array(), // No dependencies.
		$theme_version,
		true // Load in the footer.
	);

	// Pass data to our script.
	// This includes the URL for AJAX requests and a security nonce.
	// The boardAnimationData is passed to ensure the global object exists,
	// but it's populated by the AJAX response.
	wp_localize_script(
		'product-overlay-script',
		'productOverlayData',
		array(
			'ajax_url' => admin_url( 'admin-ajax.php' ),
			'nonce'    => wp_create_nonce( 'product_overlay_nonce' ),
		)
	);

	// Manually enqueue all board animation assets.
	// The original enqueue function has logic that prevents it from running on non-product/non-CPT pages,
	// which would cause the animation script to be missing when the shortcode is used on other pages.
	// By enqueueing them here directly, we guarantee they are loaded.

	// Enqueue Board CSS
	wp_enqueue_style(
		'board-style',
		get_stylesheet_directory_uri() . '/css/board-animation.css',
		array(),
		'1.1'
	);

	// Enqueue Board JS
	wp_enqueue_script(
		'board-script',
		get_stylesheet_directory_uri() . '/board-animation.js',
		array( 'jquery' ),
		'1.1',
		true
	);

	// The animation script depends on this object, even if it's empty initially.
	// The actual data will be populated by the animation script itself.
	wp_localize_script(
		'board-script',
		'boardAnimationData',
		array(
			'messages' => array(),
			'boardId'  => 0,
		)
	);
}
