<?php
/**
 * Single Product Overlay Template
 *
 * This template is loaded when ?overlay_mode=1 is set.
 * It's a minimal template for use within an iframe.
 *
 * @package twentytwentyfive-child
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<?php wp_head(); ?>
</head>
<body <?php body_class('body-overlay-active'); ?>>
	<div class="product-overlay-wrapper">
		<?php
		if ( have_posts() ) {
			while ( have_posts() ) {
				the_post();
				wc_get_template_part( 'content', 'single-product' );
			}
		}
		?>
	</div>
	<?php wp_footer(); ?>
</body>
</html>
