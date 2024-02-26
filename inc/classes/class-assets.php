<?php
/**
 * Enqueue theme assets
 *
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;
class Assets {
	use Singleton;
	protected function __construct() {
		// load class.
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		/**
		 * Actions.
		 */
		add_action('wp_enqueue_scripts',[$this,'register_styles']);
		add_action('esign/project/assets/register_styles',[$this,'register_styles']);
		add_action('wp_enqueue_scripts',[$this,'register_scripts']);
		add_action('esign/project/assets/register_scripts',[$this,'register_scripts']);
		/**
		 * The 'enqueue_block_assets' hook includes styles and scripts both in editor and frontend,
		 * except when is_admin() is used to include them conditionally
		 */
		add_action('admin_enqueue_scripts', [$this, 'admin_enqueue_scripts'], 1, 1);
		// add_action('admin_enqueue_scripts', [$this, 'admin_denqueue_scripts'], 99);
		add_filter('esign/project/javascript/siteconfig', [$this, 'siteConfig'], 1, 1);
	}
	public function register_styles() {
		$version = $this->filemtime(ESIGNBINDING_ADDONS_BUILD_CSS_DIR_PATH.'/frontend.css');
		// Register styles.
		wp_register_style('esignscripts', ESIGNBINDING_ADDONS_BUILD_CSS_URI.'/frontend.css?vers'.$version, [], $version, 'all');
		wp_enqueue_style('esignscripts');
	}
	public function register_scripts() {
		$version = $this->filemtime(ESIGNBINDING_ADDONS_BUILD_JS_DIR_PATH.'/frontend.js');
		// Register scripts.
		// 'https://cdnjs.cloudflare.com/ajax/libs/imask/3.4.0/imask.min.js'
		wp_enqueue_script('pdfjs', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js', [], null, true);
		wp_register_script('esignscripts', ESIGNBINDING_ADDONS_BUILD_JS_URI.'/frontend.js?vers'.$version, ['jquery'], $version, true);
		wp_enqueue_script('esignscripts');
		
		// if($this->allow_enqueue()) {}
		wp_localize_script('esignscripts', 'fwpSiteConfig', apply_filters('esign/project/javascript/siteconfig', []));
	}
	private function allow_enqueue() {
		return (function_exists('is_checkout') && (is_checkout() || is_order_received_page() || is_wc_endpoint_url('order-received')));
	}
	public function admin_enqueue_scripts($curr_page) {
		global $post;
		// if(! in_array($curr_page, ['edit.php', 'post.php']) || 'shop_order' !== $post->post_type) {return;}
		
		$version = $this->filemtime(ESIGNBINDING_ADDONS_BUILD_CSS_DIR_PATH.'/backend.css');
		wp_register_style('esignscripts',ESIGNBINDING_ADDONS_BUILD_CSS_URI.'/backend.css?v='.$version,[],$version, 'all');
		wp_enqueue_style('esignscripts');

		wp_enqueue_script('jquery-ui', 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js', ['jquery'], null, true);
		wp_enqueue_script('bootstrap', 'https://netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js', [], null, true);
		wp_enqueue_style('bootstrap', 'https://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css', [], null, 'all');
		wp_enqueue_script('pdfjs', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js', [], null, true);

		$version = $this->filemtime(ESIGNBINDING_ADDONS_BUILD_JS_DIR_PATH.'/backend.js');
		wp_register_script('esignscripts',ESIGNBINDING_ADDONS_BUILD_JS_URI.'/backend.js?v='.$version,['jquery', 'jquery-ui', 'bootstrap', 'pdfjs'],$version,true);
		wp_enqueue_script('esignscripts');

		wp_localize_script('esignscripts', 'fwpSiteConfig', apply_filters('esign/project/javascript/siteconfig', []));
	}
	private function filemtime($path) {
		return (file_exists($path)&&!is_dir($path))?filemtime($path):false;
	}
	public function siteConfig($args) {
		return wp_parse_args([
			'ajaxUrl'    		=> admin_url('admin-ajax.php'),
			'ajax_nonce' 		=> wp_create_nonce('esign/project/verify/nonce'),
			'is_admin' 			=> is_admin(),
			'buildPath'  		=> ESIGNBINDING_ADDONS_BUILD_URI,
			'template_id'  		=> get_the_id(),
			'user_id'			=> is_user_logged_in()?get_current_user_id():false,
			'i18n'				=> [],
			'leadStatus'		=> apply_filters('esign/project/action/statuses', ['no-action' => __('No action fetched', 'esignbinding')], false)
		], (array) $args);
	}
}
