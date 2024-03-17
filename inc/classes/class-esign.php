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
class Esign {
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
		add_filter('template_include', [$this, 'template_include'], 10, 1);
	}
	public function template_include($template) {
		$post_type = 'esignatures';
		// if ( is_post_type_archive( $post_type ) && file_exists( ESIGNBINDING_ADDONS_DIR_PATH . "/templates/archive-$post_type.php" ) ){
		// 	$template = ESIGNBINDING_ADDONS_DIR_PATH . "/templates/archive-$post_type.php";
		// }

		if ( is_singular( $post_type ) && file_exists( ESIGNBINDING_ADDONS_DIR_PATH . "/templates/single-$post_type.php" ) ){
			$template = ESIGNBINDING_ADDONS_DIR_PATH . "/templates/single-$post_type.php";
		}

		return $template;
	}

	public function print_assets() {
		return;
		?>
		<!-- <link rel="stylesheet" href="https://github.hubspot.com/vex/dist/css/vex.css" />
		<link rel="stylesheet" href="https://github.hubspot.com/vex/dist/css/vex-theme-os.css" /> -->
		<!-- <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script> -->
		<!-- <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css"> -->
		<!-- <script type="module">import * as scrawl from "https://unpkg.com/scrawl-canvas@8.12.0";window.scrawl = scrawl;</script> -->
		<!-- <script type="module" src="https://cdn.interactjs.io/v1.10.26/interactjs/index.js"></script> -->
		<!-- <script src="https://unpkg.com/pdf-lib"></script> -->
		<!-- <script src="https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js"></script> -->
		<?php
	}
}
