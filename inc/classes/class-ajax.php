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
		global $eSign_Ajax;
		$eSign_Ajax = $this;
    	$this->base = [];
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		add_action('wp_ajax_esign/project/ajax/template/data', [$this,'templateData'], 10, 0);
		add_action('wp_ajax_esign/project/ajax/template/fields', [$this, 'get_fields']);
		// add_action('wp_ajax_nopriv_esign/project/ajax/template/fields', 'get_fields');
		add_action('wp_ajax_esign/project/ajax/template/update', [$this, 'update_template']);
		add_action('wp_ajax_esign/project/ajax/signing/confirm', [$this, 'signing_confirm']);

		// add_action('init', function() {});
		
	}
	public function templateData() {
		// $dataset = json_decode(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', stripslashes(html_entity_decode(isset($_POST['dataset'])?$_POST['dataset']:'{}'))), true);
		
		$meta = get_post_meta($_POST['template'], '__esign_builder', true);
		if(isset($meta['fields'])) {
			foreach($meta['fields'] as $rowI => $row) {
				if(isset($row['data']) && isset($row['data']['field']) && isset($row['data']['field']['user'])) {
					$_user = get_user_by('ID', (int) $row['data']['field']['user']);
					if($_user) {
						$display_name = $_user->display_name;
						$meta['fields'][$rowI]['data']['field']['user_name'] = $display_name;
						$meta['fields'][$rowI]['signDone'] = false;
					}
				}
			}
		}

		$authod_id = get_the_author($_POST['template']);

		$json = [
			'hooks' => ['gotsignaturepopupresult'],
			'signature' => [
				'custom_fields'	=> $meta,
				'title'			=> get_the_title($_POST['template']),
				'author'		=> [
					'id'		=> $authod_id,
					'name'		=> get_the_author_meta('display_name', $authod_id)
				],
				'toast'			=> false, // '<strong>' . count($requested) . '</strong> people requested this service in the last 10 minutes!',
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
						'default' => 'MMMM, dd, yyyy',
						'required' => true,
						'attr'			=> [
							'pattern'	=> "^(d{1,2}|dd|MMMM|yyyy|HH|mm|ss|a)$",
							'title'		=> sprintf(__('Valid formats: "%s"', 'esignbinding'), 'd, dd, MMMM, yyyy, HH, mm, ss, a')
						]
					],
					[
						'fieldID' => 'fontSize',
						'type' => 'number',
						'label' => 'Font size',
						'headerbg' => false,
						'heading' => false,
						'subtitle' => '',
						'tooltip' => 'Give here a font size in numeric value. like 10, 12, etc.',
						'placeholder' => '',
						'default' => 12,
						'required' => true,
						'attr'			=> []
					],
					[
						'fieldID' => 'fontColor',
						'type' => 'color',
						'label' => 'Text color',
						'headerbg' => false,
						'heading' => false,
						'subtitle' => '',
						'tooltip' => 'Select a text/font color.',
						'placeholder' => '',
						'default' => '#333',
						'required' => true,
						'attr'			=> []
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
						'fieldID'		=> 'format',
						'type'			=> 'text',
						'label'			=> 'Time',
						'headerbg'		=> false,
						'heading'		=> 'Signing time',
						'subtitle'		=> 'Give here a time formate that would replace while signing. EG. "H:i:s".',
						'placeholder'	=> '',
						'default'		=> 'HH:mm:ss a',
						'required'		=> true,
						'attr'			=> [
							'pattern'	=> "^(d{1,2}|dd|MMMM|yyyy|HH|mm|ss|a)$",
							'title'		=> sprintf(__('Valid formats: "%s"', 'esignbinding'), 'd, dd, MMMM, yyyy, HH, mm, ss, a')
						]
					],
					[
						'fieldID' => 'fontSize',
						'type' => 'number',
						'label' => 'Font size',
						'headerbg' => false,
						'heading' => false,
						'subtitle' => '',
						'tooltip' => 'Give here a font size in numeric value. like 10, 12, etc.',
						'placeholder' => '',
						'default' => 12,
						'required' => true,
						'attr'			=> []
					],
					[
						'fieldID' => 'fontColor',
						'type' => 'color',
						'label' => 'Text color',
						'headerbg' => false,
						'heading' => false,
						'subtitle' => '',
						'tooltip' => 'Select a text/font color.',
						'placeholder' => '',
						'default' => '#333',
						'required' => true,
						'attr'			=> []
					]
				]
			],
		];
		$args['hooks'] = ['custom_fields_getting_done'];
		wp_send_json_success($args, 200);
	}
	public function update_template() {
		$args = ['message' => __('Something went wrong. Failed to update Signature template.', 'esignbinding'), 'hooks' => ['template_update_failed']];
		try {
			$dataset = json_decode(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', stripslashes(html_entity_decode($_POST['dataset']))), true);
			
			if(isset($_FILES['pdf'])) {
				$result = $this->upload_pdf_to_custom_directory('pdf');
				if(is_wp_error($result)) {
					$args['message'] = $result->get_error_message();
					wp_send_json_error($args);
				} else {
					$args['hooks'] = ['template_update_success'];
					$args['message'] = sprintf(__('File uploaded successfully. URL: %s', 'esignbinding'), $result);
					$args['lastUploaded'] = $result;
					$dataset['pdf'] = $result;
				}
			}
			if($dataset['pdf']) {
				update_post_meta($_POST['template'], '__esign_builder', $dataset);

				$orders = [];
				foreach($dataset['fields'] as $i => $row) {
					if(
						$row['field'] == 'sign' && isset($row['data']) && isset($row['data']['field']) && isset($row['data']['field']['user'])
					) {
						$orders[] = [
							(int) $row['data']['field']['user'],
							(int) $row['data']['field']['order']
						];
					}
				}
				$this->update_all_users_for_this_sign($_POST['template'], $orders);
				
				$args['message'] = __('Document template updated successfully', 'esignbinding');
				$args['orders'] = $orders;
				wp_send_json_success($args);
			}
		} catch (\Error $e) {
			$args['message'] = $e->getMessage();
		}
		wp_send_json_error($args);
	}
	public function signing_confirm() {
		$args = ['message' => __('Something went wrong. Failed to confirm Signature.', 'esignbinding'), 'hooks' => ['signature_confirmation_failed']];
		// wp_send_json_error($args);
		$post_id = (int) $_POST['template'];
		$meta = get_post_meta($post_id, '__esign_builder', true);
		$args['meta'] = $meta;
		if($meta && isset($_FILES['pdf'])) {
			$is_changed = false;
			foreach($meta['fields'] as $i => $field) {
				if(isset($field['data']) && isset($field['data']['field']) && isset($field['data']['field']['user']) && (int) $field['data']['field']['user'] == get_current_user_id()) {
					$meta['fields'][$i]['signDone'] = true;$is_changed = true;
				}
			}
			if($is_changed) {
				// $allowed_users = $this->get_all_users_for_this_sign($post_id);
				// $args['user'] = $allowed_user;
				$upload_path = str_replace([site_url('/'), '/'], [ABSPATH, '\\'], $meta['pdf']);
				// $uploaded = move_uploaded_file($_FILES['pdf']['tmp_name'], $upload_path);
				$uploaded = false;
				if($uploaded) {
					$updated = update_post_meta($post_id, '__esign_builder', $meta);
					$noti_sent = $this->send_notification_to_next_user($post_id);
					$args = ['message' => __('Successfully confirmed contract.', 'esignbinding'), 'hooks' => ['signature_confirmation_success']];

					$args['message'] .= ($noti_sent)?__('Mail sent successfully.', 'esignbinding'):__('Mail failed to sent.', 'esignbinding');
					
					wp_send_json_success($args);
				}
			}
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
			return new \WP_Error('invalid_file_type', __('Only PDF files are allowed.', 'esignbinding'), ['status' => 400]);
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
			$target_dir = str_replace([site_url('/', 'https'), site_url('/', 'http')], [ABSPATH, ABSPATH], pathinfo($_POST['lastUploaded'], PATHINFO_DIRNAME));
			$filename = pathinfo($_POST['lastUploaded'], PATHINFO_BASENAME);
		} else {
			$filename = wp_unique_filename($target_dir, $file['name']);
		}

		// Move the uploaded file to the custom directory
		$uploaded = move_uploaded_file($file['tmp_name'], $target_dir . '/' . $filename);

		if (!$uploaded) {
			// wp_die($target_dir . '/' . $filename."\n");
			return new \WP_Error('move_file_error', __('Error moving uploaded file.', 'esignbinding'), ['status' => 500]);
		}

		// Generate the URL of the uploaded file
		$file_url = $upload_dir['baseurl'] . '/' . $custom_directory . '/' . $filename;

		return $file_url;
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
	
	public function update_all_users_for_this_sign($post_id, $data) {
		global $wpdb;
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM $wpdb->postmeta WHERE post_id = %d AND meta_key LIKE %s",
				$post_id, '%' . $wpdb->esc_like('__esign_signer_') . '%'
			)
		);
		foreach($data as $i => $_usr) {
			update_post_meta($post_id, '__esign_signer_' . $_usr[0], $_usr[1]);
		}
	}

	public function send_notification_to_next_user($post_id) {
		$_noti_sent = get_post_meta($post_id, '_notification_sent', true);
		$_sign_done = get_post_meta($post_id, '_signature_done', true);
		// $_last_sent = get_post_meta($post_id, '_notilast_sent', true);
		$_all_signer = $this->get_all_users_for_this_sign($post_id);
		$the_notifier = false;
		$_noti_sent = ($_noti_sent && !is_wp_error($_noti_sent))?$_noti_sent:[];
		$_sign_done = ($_sign_done && !is_wp_error($_sign_done))?$_sign_done:[];
		foreach($_all_signer as $i => $row) {
			if(
				!in_array($row->_user, $_noti_sent) && 
				!in_array($row->_user, $_sign_done) && 
				(
					($i >= 1 && in_array($_all_signer[($i-1)]->_user, $_sign_done)) || $i == 0
				)
			) {
				$the_notifier = get_user_by('ID', $row->_user);break;
			}
		}
		
		$_user = $the_notifier;
		// update_post_meta($post_id, '_notification_sent', []);
		if($_user && !empty($_user->user_email)) {

			$_noti_sent[] = $_user->ID;$_post = get_post($post_id);
			update_post_meta($post_id, '_notification_sent', $_noti_sent);
			
			$email = $this->generate_email_template($_user, $_post);

			$mail_sent = wp_mail($email->to, $email->subject, $email->body, $email->headers);
			return ($mail_sent && !is_wp_error($mail_sent));
		}
		return false;
	}
	public function generate_email_template($_user, $_post) {
		$args = (object) ['to' => $_user->user_email];
		$args->to = 'mahmudremal@yahoo.com';
		$args->headers = ['Content-Type: text/html; charset=UTF-8'];
		$args->subject = __('You Just Received a Signing Request', 'domain');

		$args->body = sprintf(__('Dear %s,\n\nYou are receiving this email because a signing request has been initiated for a document that requires your signature. Please follow the link below to access the eSignature screen and provide your signature:\n\n%s\n\nBy clicking the provided link, you will be directed to the eSignature platform where you can securely sign the document. If you have any questions or concerns, please do not hesitate to contact our support team.\n\nThank you for your prompt attention to this matter.\n\nBest regards,\n%s\n%s', 'domain'),
		$_user->display_name,
		'[Insert Signing Link Here]',
		the_author_meta('display_name', $_post->post_author), // get_the_author($post_id)
		get_user_meta($_user->ID, 'user_phone', true)||$_user->user_email
		// '[Your Contact Information]'
		);
		return $args;
	}


}
