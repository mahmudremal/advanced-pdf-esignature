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
		global $eSign_Log;$eSign_Log					= Log::get_instance();
		global $eSign_Ajax;$eSign_Ajax					= Ajax::get_instance();
		global $eSign_Files;$eSign_Files				= Files::get_instance();
		global $eSign_Nonce;$eSign_Nonce				= Nonce::get_instance();
		global $eSign_Menus;$eSign_Menus				= Menus::get_instance();
		global $eSign_Esign;$eSign_Esign				= Esign::get_instance();
		global $eSign_Mailer;$eSign_Mailer				= Mailer::get_instance();
		global $eSign_Assets;$eSign_Assets				= Assets::get_instance();
		global $eSign_Option;$eSign_Option				= Option::get_instance();
		global $eSign_Restapi;$eSign_Restapi			= Restapi::get_instance();
		global $eSign_Rewrite;$eSign_Rewrite			= Rewrite::get_instance();
		global $eSign_Install;$eSign_Install			= Install::get_instance();
		global $eSign_Frontend;$eSign_Frontend			= Frontend::get_instance();
		global $eSign_Shortcode;$eSign_Shortcode		= Shortcode::get_instance();
		global $eSign_Post_Types;$eSign_Post_Types		= Post_Types::get_instance();
		global $eSign_Meta_Boxes;$eSign_Meta_Boxes		= Meta_Boxes::get_instance();

		$this->setup_hooks();
	}
	protected function setup_hooks() {
		add_filter('esign/project/system/getoption', [$this, 'getoption'], 1, 2);
	}
	public function getoption($key, $default = false) {
		return isset(ESIGNBINDING_ADDONS_OPTIONS[$key])?ESIGNBINDING_ADDONS_OPTIONS[$key]:$default;
	}
}
