<?php
/**
 * Register Post Types
 *
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;
class PostTypes {
	use Singleton;
	protected function __construct() {
		// load class.
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		/**
		 * Actions.
		 */
		add_action( 'init', [ $this, 'create_movie_cpt' ], 0 );
	}
	// Register Custom Post Type Movie
	public function create_movie_cpt() {
		$labels = [
			'name'                  => _x( 'Movies', 'Post Type General Name', 'esignbinding' ),
			'singular_name'         => _x( 'Movie', 'Post Type Singular Name', 'esignbinding' ),
			'menu_name'             => _x( 'Movies', 'Admin Menu text', 'esignbinding' ),
			'name_admin_bar'        => _x( 'Movie', 'Add New on Toolbar', 'esignbinding' ),
			'archives'              => __( 'Movie Archives', 'esignbinding' ),
			'attributes'            => __( 'Movie Attributes', 'esignbinding' ),
			'parent_item_colon'     => __( 'Parent Movie:', 'esignbinding' ),
			'all_items'             => __( 'All Movies', 'esignbinding' ),
			'add_new_item'          => __( 'Add New Movie', 'esignbinding' ),
			'add_new'               => __( 'Add New', 'esignbinding' ),
			'new_item'              => __( 'New Movie', 'esignbinding' ),
			'edit_item'             => __( 'Edit Movie', 'esignbinding' ),
			'update_item'           => __( 'Update Movie', 'esignbinding' ),
			'view_item'             => __( 'View Movie', 'esignbinding' ),
			'view_items'            => __( 'View Movies', 'esignbinding' ),
			'search_items'          => __( 'Search Movie', 'esignbinding' ),
			'not_found'             => __( 'Not found', 'esignbinding' ),
			'not_found_in_trash'    => __( 'Not found in Trash', 'esignbinding' ),
			'featured_image'        => __( 'Featured Image', 'esignbinding' ),
			'set_featured_image'    => __( 'Set featured image', 'esignbinding' ),
			'remove_featured_image' => __( 'Remove featured image', 'esignbinding' ),
			'use_featured_image'    => __( 'Use as featured image', 'esignbinding' ),
			'insert_into_item'      => __( 'Insert into Movie', 'esignbinding' ),
			'uploaded_to_this_item' => __( 'Uploaded to this Movie', 'esignbinding' ),
			'items_list'            => __( 'Movies list', 'esignbinding' ),
			'items_list_navigation' => __( 'Movies list navigation', 'esignbinding' ),
			'filter_items_list'     => __( 'Filter Movies list', 'esignbinding' ),
		];
		$args   = [
			'label'               => __( 'Movie', 'esignbinding' ),
			'description'         => __( 'The movies', 'esignbinding' ),
			'labels'              => $labels,
			'menu_icon'           => 'dashicons-video-alt',
			'supports'            => [
				'title',
				'editor',
				'excerpt',
				'thumbnail',
				'revisions',
				'author',
				'comments',
				'trackbacks',
				'page-attributes',
				'custom-fields',
			],
			'taxonomies'          => [],
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'menu_position'       => 5,
			'show_in_admin_bar'   => true,
			'show_in_nav_menus'   => true,
			'can_export'          => true,
			'has_archive'         => true,
			'hierarchical'        => false,
			'exclude_from_search' => false,
			'show_in_rest'        => true,
			'publicly_queryable'  => true,
			'capability_type'     => 'post',
		];
		register_post_type( 'movies', $args );
	}
}
