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
		add_action('wp_ajax_esign/project/ajax/template/fields', [$this, 'get_fields']);
		// add_action('wp_ajax_nopriv_esign/project/ajax/template/fields', 'get_fields');
		add_action('wp_ajax_esign/project/ajax/template/update', [$this, 'update_template']);
	}
	public function templateData() {
		// $dataset = json_decode(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', stripslashes(html_entity_decode(isset($_POST['dataset'])?$_POST['dataset']:'{}'))), true);
		
		$json = [
			'hooks' => ['gotsignaturepopupresult'],
			'signature' => [
				'toast' => false, // '<strong>' . count($requested) . '</strong> people requested this service in the last 10 minutes!',
				'custom_fields' => get_post_meta($_POST['template'], '__esign_builder', true)
			],
		];
		wp_send_json_success($json);
	}
	public function get_fields() {
		$args = ['fields' => []];
		$users = get_users([
			// 'role__in' => ['author', 'subscriber']
		]);
		$blogusers = [];
		foreach($users as $usr) {
			$blogusers[] = [
				'label' => sprintf(__('%s (id %d)', 'esignbinding'), $usr->data->display_name, $usr->ID),
				'value' => $usr->ID
			];
		}
		$args['fields'] = [
			[
				'id' => 'sign',
				'title' => 'Signature',
				'tip' => 'E-Signature field with defining a user will be sent mail to signer according to their order.',
				'icon' => ESIGNBINDING_ADDONS_BUILD_URI.'/icons/signature.svg',
				'fields' => [
					[
						'fieldID' => 'user',
						'type' => 'select',
						'label' => 'Signer',
						'headerbg' => false,
						'heading' => '',
						'subtitle' => '',
						'tooltip' => 'Select an user as signer for this field. This is required.',
						'placeholder' => '',
						'required' => true,
						'options' => $blogusers
					],
					[
						'fieldID' => 'order',
						'type' => 'text',
						'label' => 'Signing order',
						'headerbg' => false,
						'heading' => '',
						'subtitle' => '',
						'tooltip' => 'Input an order value that will be applied while we noticed user for signing.',
						'placeholder' => '1',
						'required' => false,
						'attr' => ['pattern' => '[0-9]+']
					]
				]
			],
			[
				'id' => 'date',
				'title' => 'Date',
				'tip' => 'Pick this date that will replace with Sining time or date.',
				'icon' => ESIGNBINDING_ADDONS_BUILD_URI.'/icons/date.svg',
				'fields' => [
					[
						'fieldID' => 'user',
						'type' => 'select',
						'label' => 'Signer',
						'headerbg' => false,
						'heading' => '',
						'subtitle' => '',
						'tooltip' => 'Select an user as signer for this field. This is required.',
						'placeholder' => '',
						'required' => true,
						'options' => $blogusers
					],
					[
						'fieldID' => 'format',
						'type' => 'text',
						'label' => 'Signing date',
						'headerbg' => false,
						'heading' => false,
						'subtitle' => '',
						'tooltip' => 'Give here a date format that replace on signing time. EG: "M d, Y"',
						'placeholder' => '',
						'default' => 'M d, Y',
						'required' => true
					]
				]
			],
			[
				'id' => 'time',
				'title' => 'Time',
				'tip' => 'Time field with defining a user will be sent mail to signer according to their order.',
				'icon' => ESIGNBINDING_ADDONS_BUILD_URI.'/icons/time.svg',
				'fields' => [
					[
						'fieldID' => 'user',
						'type' => 'select',
						'label' => 'Signer',
						'headerbg' => false,
						'heading' => '',
						'subtitle' => '',
						'tooltip' => 'Select an user as signer for this field. This is required.',
						'placeholder' => '',
						'required' => true,
						'options' => $blogusers
					],
					[
						'fieldID' => 'format',
						'type' => 'text',
						'label' => 'Time',
						'headerbg' => false,
						'heading' => 'Signing time',
						'subtitle' => 'Give here a time formate that would replace while signing. EG. "H:i:s".',
						'placeholder' => '',
						'default' => 'H:i',
						'required' => true
					]
				]
			],
		];
		$args['hooks'] = ['custom_fields_getting_done'];
		wp_send_json_success($args, 200);
	}
	public function update_template() {
		$args = ['message' => __('Something went wrong. Failed to update Signature template.', 'domain'), 'hooks' => ['template_update_failed']];
		try {
			$dataset = json_decode(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', stripslashes(html_entity_decode($_POST['dataset']))), true);
			
			if(isset($_FILES['pdf'])) {
				$result = $this->upload_pdf_to_custom_directory('pdf');
				if(is_wp_error($result)) {
					$args['message'] = $result->get_error_message();
					wp_send_json_error($args);
				} else {
					$args['hooks'] = ['template_update_success'];
					$args['message'] = sprintf(__('File uploaded successfully. URL: %s', 'domain'), $result);
					$args['lastUploaded'] = $result;
					$dataset['pdf'] = $result;
				}
			}
			if($dataset['pdf']) {
				update_post_meta($_POST['template'], '__esign_builder', $dataset);
				$args['message'] = __('Document template updated successfully', 'domain');
				wp_send_json_success($args);
			}
		} catch (\Error $e) {
			$args['message'] = $e->getMessage();
		}
		wp_send_json_error($args);
	}
	/**
	 * Uploads a PDF file to a custom directory within the WordPress uploads directory.
	 *
	 * @param string $file_key The key of the file in the $_FILES array.
	 * @return string|WP_Error The URL of the uploaded file on success, or a WP_Error object on failure.
	 */
	public function upload_pdf_to_custom_directory($file_key) {
		$custom_directory = 'esign';
		if (empty($_FILES[$file_key])) {
			return new \WP_Error('missing_file', 'No file found in the uploaded data.', ['status' => 400]);
		}

		$file = $_FILES[$file_key];

		// Check for upload errors
		if ($file['error'] !== UPLOAD_ERR_OK) {
			return new \WP_Error('upload_error', 'Error uploading file. Please try again.', ['status' => 500]);
		}

		// Check file type
		$file_type = wp_check_filetype($file['name']);
		if ($file_type['ext'] !== 'pdf') {
			return new \WP_Error('invalid_file_type', __('Only PDF files are allowed.', 'domain'), ['status' => 400]);
		}

		// Get the upload directory
		$upload_dir = wp_upload_dir();
		$target_dir = $upload_dir['basedir'] . '/' . $custom_directory;

		// Create the custom directory if it doesn't exist
		if (!file_exists($target_dir)) {
			mkdir($target_dir, 0755, true);
		}

		// Generate a unique filename || Rewrite on previous file.
		if(isset($_POST['lastUploaded'])) {
			$target_dir = str_replace([site_url('/')], [ABSPATH], pathinfo($_POST['lastUploaded'], PATHINFO_DIRNAME));
			$filename = pathinfo($_POST['lastUploaded'], PATHINFO_BASENAME);
		} else {
			$filename = wp_unique_filename($target_dir, $file['name']);
		}

		// Move the uploaded file to the custom directory
		$uploaded = move_uploaded_file($file['tmp_name'], $target_dir . '/' . $filename);

		if (!$uploaded) {
			return new \WP_Error('move_file_error', __('Error moving uploaded file.', 'domain'), ['status' => 500]);
		}

		// Generate the URL of the uploaded file
		$file_url = $upload_dir['baseurl'] . '/' . $custom_directory . '/' . $filename;

		return $file_url;
	}

}
