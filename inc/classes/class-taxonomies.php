<?php
/**
 * Register Custom Taxonomies
 *
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;
class Taxonomies {
	use Singleton;
	protected function __construct() {
		// load class.
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		/**
		 * Actions.
		 */
		add_action( 'init', [ $this, 'create_genre_taxonomy' ] );
		add_action( 'init', [ $this, 'create_year_taxonomy' ] );
	}
	// Register Taxonomy Genre
	public function create_genre_taxonomy() {
		$labels = [
			'name'              => _x( 'Genres', 'taxonomy general name', 'esignbinding' ),
			'singular_name'     => _x( 'Genre', 'taxonomy singular name', 'esignbinding' ),
			'search_items'      => __( 'Search Genres', 'esignbinding' ),
			'all_items'         => __( 'All Genres', 'esignbinding' ),
			'parent_item'       => __( 'Parent Genre', 'esignbinding' ),
			'parent_item_colon' => __( 'Parent Genre:', 'esignbinding' ),
			'edit_item'         => __( 'Edit Genre', 'esignbinding' ),
			'update_item'       => __( 'Update Genre', 'esignbinding' ),
			'add_new_item'      => __( 'Add New Genre', 'esignbinding' ),
			'new_item_name'     => __( 'New Genre Name', 'esignbinding' ),
			'menu_name'         => __( 'Genre', 'esignbinding' ),
		];
		$args   = [
			'labels'             => $labels,
			'description'        => __( 'Movie Genre', 'esignbinding' ),
			'hierarchical'       => true,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'show_in_nav_menus'  => true,
			'show_tagcloud'      => true,
			'show_in_quick_edit' => true,
			'show_admin_column'  => true,
			'show_in_rest'       => true,
		];
		register_taxonomy( 'genre', [ 'movies' ], $args );
	}
	// Register Taxonomy Year
	public function create_year_taxonomy() {
		$labels = [
			'name'              => _x( 'Years', 'taxonomy general name', 'esignbinding' ),
			'singular_name'     => _x( 'Year', 'taxonomy singular name', 'esignbinding' ),
			'search_items'      => __( 'Search Years', 'esignbinding' ),
			'all_items'         => __( 'All Years', 'esignbinding' ),
			'parent_item'       => __( 'Parent Year', 'esignbinding' ),
			'parent_item_colon' => __( 'Parent Year:', 'esignbinding' ),
			'edit_item'         => __( 'Edit Year', 'esignbinding' ),
			'update_item'       => __( 'Update Year', 'esignbinding' ),
			'add_new_item'      => __( 'Add New Year', 'esignbinding' ),
			'new_item_name'     => __( 'New Year Name', 'esignbinding' ),
			'menu_name'         => __( 'Year', 'esignbinding' ),
		];
		$args   = [
			'labels'             => $labels,
			'description'        => __( 'Movie Release Year', 'esignbinding' ),
			'hierarchical'       => false,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'show_in_nav_menus'  => true,
			'show_tagcloud'      => true,
			'show_in_quick_edit' => true,
			'show_admin_column'  => true,
			'show_in_rest'       => true,
		];
		register_taxonomy( 'movie-year', [ 'movies' ], $args );
	}
}
