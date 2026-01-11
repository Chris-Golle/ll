<?php
/**
 * Product Overlay Template
 *
 * This template is loaded via the template_include filter in functions.php when the 'overlay_mode' GET parameter is set.
 * It's designed to be displayed in an iframe and contains the essential product loop without the standard site header and footer
 * to prevent a "UI inception" effect.
 *
 * It enqueues the necessary scripts for the board animation and the iframe-to-parent cart communication.
 */

// Scripts are now enqueued via the 'wp_enqueue_scripts' action in functions.php.

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class('product-overlay'); ?>>

<div id="product-overlay-content">
    <?php
    // Standard WooCommerce product loop
    while ( have_posts() ) :
        the_post();
        wc_get_template_part( 'content', 'single-product' );
    endwhile;
    ?>
</div>

<?php wp_footer(); ?>

</body>
</html>
