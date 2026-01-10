<?php get_header(); ?>

<!-- Mobile viewport meta tag will be handled by WordPress theme -->
 <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0">

<style>
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
}
</style>



<!-- Board Animation Template - Messages are now loaded via wp_localize_script in functions.php -->

<?php 

global $post;
setup_postdata( $post );

// Use the correct WordPress function to load the template part from the /template-parts/ directory.
get_template_part('template-parts/board-animation-markup');

// Call the animation initialization function directly after the markup is rendered.
echo '<script type="text/javascript">document.addEventListener("DOMContentLoaded", function() { if (typeof window.initBoardAnimation === "function") { window.initBoardAnimation(); } });</script>';

wp_reset_postdata();


get_footer(); ?>
