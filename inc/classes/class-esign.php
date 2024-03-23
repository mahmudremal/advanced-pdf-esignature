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
	public function get_user_contracts($user_id = false) {
		global $wpdb;global $eSign_Ajax;global $eSign_Esign;
		if (!$user_id) {$user_id = get_current_user_id();}
		$signings = [];

		$_all_posts = get_posts([
			'fields'			=> 'ids',
			'posts_per_page'	=> -1,
			'post_type'			=> 'esignatures',
			'post_status'		=> 'publish',
			'order'				=> 'DESC'
		]);
		foreach($_all_posts as $_post_id) {
			if($this->is_authorized_signer($_post_id, $user_id)) {$signings[] = $_post_id;}
		}
		$signings = implode(',', $signings);
		$lists = $this->signing_list_by_ids($signings);
		return $lists;
	}
	public function is_authorized_signer($_post_id, $user_id = false) {
		if (is_user_logged_in()) {
			if (!$user_id) {$user_id = get_current_user_id();}
			$signers = $this->get_all_users_for_this_sign($_post_id);
			foreach($signers as $signer) {
				if($signer->_user == $user_id) {
					return true;
				}
			}
		}
		return false;
	}
	public function get_all_users_for_this_sign($post_id) {
		global $wpdb;
		$_all_metas = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT meta_key as _user, meta_value as _order FROM $wpdb->postmeta WHERE post_id = %d AND meta_key LIKE %s",
				$post_id, '%' . $wpdb->esc_like('__esign_signer_') . '%'
			)
		);
		foreach($_all_metas as $i => $_meta) {
			$_meta->_user = (int) str_replace(['__esign_signer_'], [''], $_meta->_user);
		}
		usort($_all_metas, function($a, $b) {
			return $a->_order - $b->_order;
		});
		return $_all_metas;
	}
	public function signing_list_by_ids($signings) {
		global $wpdb;
		return $wpdb->get_results(
			$wpdb->prepare(
				"SELECT ID, post_title, post_date FROM $wpdb->posts WHERE post_status=%s AND post_type=%s AND ID IN ($signings) ORDER BY ID DESC LIMIT 0, 100;",
				'publish', 'esignatures'
			)
		);
	}
}
