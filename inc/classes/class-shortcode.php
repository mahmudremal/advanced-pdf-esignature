<?php
/**
 * Theme Sidebars.
 *
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;
/**
 * Class Shortcode.
 */
class Shortcode {
	use Singleton;
	/**
	 * Construct method.
	 */
	protected function __construct() {
		$this->setup_hooks();
	}
	/**
	 * To register action/filter.
	 *
	 * @return void
	 */
	protected function setup_hooks() {
		/**
		 * Actions
		 */
		// add_shortcode('checkout_video', [$this, 'checkout_video']);
	}
	public function checkout_video($args) {}
}
