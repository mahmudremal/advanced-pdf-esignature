<?php
// single-esignatures.php - Custom template for single esignatures post

// Ensure that WordPress is loaded
defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) {
    the_post();
    // Your custom template code goes here
    echo '<h1>' . get_the_title() . '</h1>';
    echo '<div>' . get_the_content() . '</div>';
}

get_footer();
