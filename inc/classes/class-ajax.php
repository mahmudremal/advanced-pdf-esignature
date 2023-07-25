<?php
/**
 * The OpenAI ChatGPT-3.
 * https://www.npmjs.com/package/openai
 * https://www.npmjs.com/package/chatgpt
 * 
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;

class Ajax {
	use Singleton;
	private $base;
	protected function __construct() {
    	$this->base = [];
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		add_action('wp_ajax_esign/project/ajax/template/data', [$this,'templateData'], 10, 0);
	}
	public function templateData() {
		// $dataset = json_decode(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', stripslashes(html_entity_decode(isset($_POST['dataset'])?$_POST['dataset']:'{}'))), true);
		
		$json = [
			'hooks' => ['gotsignaturepopupresult'],
			'header' => [
				'signature_photo' => '' // 'https://eu-bark-media.s3.eu-west-1.amazonaws.com/category_header_photos/74-1530804797752.jpg'
			],
			'country' => false,
			'signature' => [
				'is_parent' => false,
				'name' => '',
				'toast' => false, // '<strong>' . count($requested) . '</strong> people requested this service in the last 10 minutes!',
				'thumbnail' => ['1x' => '', '2x' => ''],
				'custom_fields' => get_post_meta($dataset['template_id'],'_signature_custom_popup',true)
			],
		];
		wp_send_json_success($json);
	}
  
}
