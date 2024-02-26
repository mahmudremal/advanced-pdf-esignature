<?php
/**
 * Register Post Types
 *
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;
class Post_Types {
	use Singleton;
	protected function __construct() {
		// load class.
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		/**
		 * Actions.
		 */
		add_action('init', [$this, 'create_esignature_cpt'], 0);
	}
	// Register Custom Post Type esignature
	public function create_esignature_cpt() {
		$icon = untrailingslashit(ESIGNBINDING_ADDONS_BUILD_PATH.'/icons/contract.svg');
		$icon = (file_exists($icon)&&!is_dir($icon))?esc_url(ESIGNBINDING_ADDONS_BUILD_URI.'/icons/contract.svg'):'dashicons-superhero';

		$labels = [
			'name'                  => _x('eSignatures', 'Post Type General Name', 'esignbinding'),
			'singular_name'         => _x('eSignature', 'Post Type Singular Name', 'esignbinding'),
			'menu_name'             => _x('eSignatures', 'Admin Menu text', 'esignbinding'),
			'name_admin_bar'        => _x('eSignature', 'Add New on Toolbar', 'esignbinding'),
			'archives'              => __('eSignature Archives', 'esignbinding'),
			'attributes'            => __('eSignature Attributes', 'esignbinding'),
			'parent_item_colon'     => __('Parent eSignature:', 'esignbinding'),
			'all_items'             => __('All eSignatures', 'esignbinding'),
			'add_new_item'          => __('Add New eSignature', 'esignbinding'),
			'add_new'               => __('Add New', 'esignbinding'),
			'new_item'              => __('New eSignature', 'esignbinding'),
			'edit_item'             => __('Edit eSignature', 'esignbinding'),
			'update_item'           => __('Update eSignature', 'esignbinding'),
			'view_item'             => __('View eSignature', 'esignbinding'),
			'view_items'            => __('View eSignatures', 'esignbinding'),
			'search_items'          => __('Search eSignature', 'esignbinding'),
			'not_found'             => __('Not found', 'esignbinding'),
			'not_found_in_trash'    => __('Not found in Trash', 'esignbinding'),
			'featured_image'        => __('Featured Image', 'esignbinding'),
			'set_featured_image'    => __('Set featured image', 'esignbinding'),
			'remove_featured_image' => __('Remove featured image', 'esignbinding'),
			'use_featured_image'    => __('Use as featured image', 'esignbinding'),
			'insert_into_item'      => __('Insert into eSignature', 'esignbinding'),
			'uploaded_to_this_item' => __('Uploaded to this eSignature', 'esignbinding'),
			'items_list'            => __('eSignatures list', 'esignbinding'),
			'items_list_navigation' => __('eSignatures list navigation', 'esignbinding'),
			'filter_items_list'     => __('Filter eSignatures list', 'esignbinding'),
		];
		$args   = [
			'label'               => __('eSignature', 'esignbinding'),
			'description'         => __('The eSignatures', 'esignbinding'),
			'labels'              => $labels,
			'menu_icon'           => $icon,
			'supports'            => [
				'title',
				// 'editor',
				// 'excerpt',
				// 'thumbnail',
				// 'revisions',
				'author',
				// 'comments',
				// 'trackbacks',
				// 'page-attributes',
				// 'custom-fields',
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
		register_post_type('esignatures', $args);
	}
}
