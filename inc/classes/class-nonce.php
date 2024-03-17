<?php
/**
 * Managing nonces and verify them
 *
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;

class Nonce {
	use Singleton;
	private $_nonce;
	protected function __construct() {
		// load class.
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		$this->_nonce = false;
		add_action('esign/project/nonce/verify', [$this, 'verify'], 1, 2);
		add_filter('esign/project/nonce/create', [$this, 'create'], 1, 2);
		// 
	}
	/**
	 * Verify nonce script to check vulnarability
	 * @param $post_nonce to pass requested nonce string
	 * @param $_isJson to pass whether it would return json string or bool
	 * 
	 * @return bool
	 * @return string
	 */
	public function verify($post_nonce = false, $_isJson = true) {
		$post_nonce = ($post_nonce && !empty($post_nonce))?$post_nonce:(isset($_POST['_nonce'])?$_POST['_nonce']:false);
		if ($post_nonce) {
			if (!wp_verify_nonce($post_nonce, 'esign/project/nonce/key')) {
				if ($_isJson) {
					wp_send_json_error('Invalid nonce.');
				}
			} else {
				return true;
			}
		}
		return false;
	}
	/**
	 * Create nonce string to check vulnarability
	 * @param $_nonce is default string to pass if nonce doesn't generated properly
	 * @param $_key to pass specific nonce key
	 * 
	 * @return string
	 */
	public function create($_nonce = false, $_key = false) {
		if ($this->_nonce && !empty($this->_nonce)) {
			return $this->_nonce;
		}
		$_nonce = wp_create_nonce(($_key)?$_key:'esign/project/nonce/key');
		return $_nonce;
	}

}
