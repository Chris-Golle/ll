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

require get_stylesheet_directory() . '/board-animation-markup.php';

wp_reset_postdata();


get_footer(); ?>
