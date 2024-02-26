<?php
/**
 * LoadmorePosts
 *
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;
class Mailer {
	use Singleton;
	protected function __construct() {
		// load class.
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		// apply_filters('wp_mail', [$this, 'wp_mail'], 10, 1);
		// add_action('wp_ajax_esign/project/email/send', [$this,'emailSend'], 10, 0);
	}
	public function wp_mail($args) {
		if (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || $_SERVER['SERVER_ADDR'] === '::1') {
			$ch = curl_init('https://sci-bono.org/wp-admin/admin-ajax.php?action=esign/project/email/send');
			curl_setopt($ch, CURLOPT_POST, true);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $args);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			$response = curl_exec($ch);
			if ($response === false) {
				// echo 'cURL Error: ' . curl_error($ch);
				// 
			}
			curl_close($ch);
			return false;
		}
		return $args;
	}
	public function emailSend() {
		// $dataset = json_decode(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', stripslashes(html_entity_decode(isset($_POST['dataset'])?$_POST['dataset']:'{}'))), true);
		$is_updated = apply_filters('esign/project/logs/add', true, $_POST);
		// if ($is_updated) {}
		$is_sent = wp_mail($_POST['to'], $_POST['subject'], $_POST['message'], $_POST['headers'], $_POST['attachments']);
		
		wp_send_json_success($_POST, 200);
	}
}
