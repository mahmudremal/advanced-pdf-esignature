<?php
/**
 * Bootstraps the Theme.
 *
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;
class Project {
	use Singleton;
	protected function __construct() {
		Ajax::get_instance();
		Assets::get_instance();
		Install::get_instance();
		Frontend::get_instance();
		Post_Types::get_instance();
		Meta_Boxes::get_instance();

		// Flutterwave::get_instance();
		// Gravityforms::get_instance();
		// Rewrite::get_instance();
		// Bulks::get_instance();

		// Woo_Flutter::get_instance();
		// Option::get_instance();

		// Load class.
		// Core::get_instance();
		// Helpers::get_instance();
		// Dashboard::get_instance();
		// Roles::get_instance();
		// Restapi::get_instance();
		// GoogleDrive::get_instance();
		// SocialAuth::get_instance();
		// Notices::get_instance();
		// Admin::get_instance();
		// Blocks::get_instance();
		// Menus::get_instance();
		// Profile::get_instance();
		// Update::get_instance();
		// Shortcode::get_instance();
		// Taxonomies::get_instance();
		// Events::get_instance();
		// Ftp::get_instance();
		// Gpt3::get_instance();
		// $this->setup_hooks();
	}
	protected function setup_hooks() {
		// Some additional functionalities can be added here.
	}
}
