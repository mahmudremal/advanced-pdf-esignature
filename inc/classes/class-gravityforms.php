<?php
/**
 * LoadmorePosts
 *
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;
use \WP_Query;use ESIGNBINDING_ADDONS\Inc\Option;
class Gravityforms {
	use Singleton;
	private $settings;
	private $settingSlug;
	private $gformSetting;
	private $currentEntry;
	protected function __construct() {
		global $fwpGravityforms;$fwpGravityforms = $this;
		$this->settingSlug = 'flutterwaveaddons';
		$this->settings = ESIGNBINDING_ADDONS_OPTIONS;
		$this->id = 'flutterlovesgravity';
		$this->currentEntry = false;
		// load class.
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		// add_action( 'init', [ $this, 'wp_init' ], 10, 0 );
		// add_action( 'admin_init', [ $this, 'admin_init' ], 10, 0 );
		// add_filter( 'pre_get_posts', [ $this, 'pre_get_posts' ], 10, 1 );

		// Hook into the Gravity Forms submission process
		add_action('gform_entry_post_save', [$this, 'process_flutterwave_payment'], 10, 2);

		// Handle the return URL after the Flutterwave payment
		add_action('template_redirect', [$this, 'handle_flutterwave_payment_return']);
		
		add_action('gform_field_standard_settings', [$this, 'gform_field_standard_settings'], 10, 2);
		// add_action('gform_field_content', [$this, 'gform_field_content'], 10, 5);
		// add_filter('gform_pre_update_filter', [$this, 'gform_pre_update_filter'], 10, 2);
		// Action to inject supporting script to the form editor page
		// add_action('gform_editor_js', [$this, 'editor_script']);
		//Filter to add a new tooltip
		add_filter('gform_tooltips', [$this, 'gform_tooltips']);

		add_filter('gform_settings_menu', [$this, 'gform_settings_menu'], 10, 1);

		add_action('gform_settings_flutterwaveaddons', [$this, 'gform_settings_flutterwaveaddons'], 10, 0);
		
		// Refund Woocommerce Order
		// add_action('woocommerce_order_status_refunded', [$this, 'process_flutterwave_refund'], 10, 1);


		/**
		 * Gravity form addon.
		 */
		// add_action( 'gform_loaded', [$this, 'load_gravityform_addon'], 5, 0 );

		/**
		 * Gravity form custom field.
		 */
		add_action('gform_loaded', [$this, 'register_credit_card_field'], 5, 0);
		// add_action('gform_field_standard_fields', [$this, 'gform_field_standard_fields'], 10, 1);
		// add_action('gform_add_field_buttons', [$this, 'gform_add_field_buttons'], 10, 1);
		// Add a custom payment button
		
		// add_filter('gform_submit_button', [$this, 'gform_submit_button'], 10, 2);
		// add_filter('gform_editor_js', [$this, 'gform_editor_js'], 10, 2);
		// add_filter('gform_field_css_class', [$this, 'gform_field_css_class'], 10, 3);
		add_filter('gform_editor_js_set_default_values', [$this, 'gform_editor_js_set_default_values'], 10, 0);

		// Gravityforms single form settings.
		add_filter('gform_tooltips', [$this, 'gform_tooltips'], 10, 1);

		// add_filter('gform_form_settings_fields', [$this, 'gform_form_settings_fields'], 10, 2);
		// add_filter('gform_form_settings_menu', [$this, 'gform_form_settings_menu'], 10, 2);

		// add_action('gform_form_settings_page_flutterwave', [$this, 'gform_form_settings_page_flutterwave'], 10, 1);

		// add_action('init', function() {$this->gformSetting = \GFFormsModel::get_form_meta(1);}, 1, 0);


		add_filter('gform_pre_send_email', [$this, 'gform_pre_send_email'], 10, 4);
		add_action('gform_entry_created', [$this, 'gform_entry_created'], 10, 2);
		// add_filter('gform_payment_complete', [$this, 'approve_entry_and_trigger_notifications'], 10, 2);

		// add_action('gform_pre_submission', [$this, 'gform_pre_submission'], 10, 1);
		// add_action('gform_after_submission', [$this, 'gform_after_submission'], 10, 2);

		add_filter('gform_currencies', [$this, 'gform_currencies'], 10, 1);

		add_action('wp_ajax_esign/project/mailsystem/sendreminder', [$this, 'sendReminder'], 10, 0);
		add_action('wp_ajax_esign/project/payment/updatelink', [$this, 'updateLink'], 10, 0);
		add_action('wp_ajax_esign/project/payment/refund', [$this, 'paymentRefund'], 10, 0);
		add_action('wp_ajax_esign/project/payment/flutterwave/cardtoken', [$this, 'cardToken'], 10, 0);
		add_action('wp_ajax_nopriv_esign/project/payment/flutterwave/cardtoken', [$this, 'cardToken'], 10, 0);
		add_action('wp_ajax_esign/project/payment/flutterwave/cardotp', [$this, 'cardOTP'], 10, 0);
		add_action('wp_ajax_nopriv_esign/project/payment/flutterwave/cardotp', [$this, 'cardOTP'], 10, 0);

		// add_action( 'init', [ $this, 'wp_init' ], 10, 0 );
	}
	public function wp_init() {
		$entry_id = 64;
		$entry = \GFAPI::get_entry($entry_id);
		if (is_wp_error($entry)) {
			echo 'Entry not found.';
		} else {
			// print_r($entry);
			$custom_data = $this->extract_gravityentry_fields($entry);
			print_r($custom_data);
		}
		wp_die();
	}
	public function admin_init() {}
	public function pre_get_posts( $query ) {}
	
	public function gform_currencies($currencies) {
		$currencies['NGN'] = [
			'name'               => esc_html__( 'Nigerian Naira', 'gravityforms' ),
			'symbol_left'        => '&#8358;',
			'symbol_right'       => '',
			'symbol_padding'     => ' ',
			'thousand_separator' => ',',
			'decimal_separator'  => '.',
			'decimals'           => 2,
			'code'               => 'NGN'
		];
		return $currencies;
	}
	public function extract_gravityentry_fields($entry) {
		$custom_data = [];
		$form = \GFAPI::get_form($entry['form_id']);
		$fields = $form['fields'];
		foreach ($fields as $field) {
			$field_id = $field->id;
			$field_type = $field->type;
			$field_label = $field->label;
			// print_r($field->type."\n");
			switch ($field->type) {
				case 'email':
				case 'total':
				case 'website':
				case 'phone':
				case 'quantity':
					$custom_data[$field->type] = rgar($entry, $field_id);
					break;
				case 'name':
					$custom_data['name'] = array(
						'first' => rgar($entry, $field_id . '.3'),
						'last' => rgar($entry, $field_id . '.6')
					);
					break;
				case 'address':
					$custom_data['address'] = [
						'street' => rgar($entry, $field_id . '.1'),
						'address2' => rgar($entry, $field_id . '.2'),
						'city' => rgar($entry, $field_id . '.3'),
						'state' => rgar($entry, $field_id . '.4'),
						'zip' => rgar($entry, $field_id . '.5'),
						'country' => rgar($entry, $field_id . '.6'),
					];
					break;
				case 'product':
					$custom_data['product'] = isset($custom_data['product'])?(array)$custom_data['product']:[];
					$custom_data['product'][] = rgar($entry, $field_id);
					break;
				case 'flutterwave_credit_card':
					$custom_data[$field->type] = [
						'number'		=> rgar($entry, $field_id.'.1'),
						'month'			=> rgar($entry, $field_id.'.month'),
						'year'			=> rgar($entry, $field_id.'.year'),
						'expire'		=> rgar($entry, $field_id.'.2_month'),
						'code'			=> rgar($entry, $field_id.'.3'),
						'card'			=> rgar($entry, $field_id.'.4'), // card type
						'name'			=> rgar($entry, $field_id.'.5'),
						'mode'			=> (rgar($entry, $field_id.'.6'))?rgar($entry, $field_id.'.6'):(isset($_POST['input_'.$field_id.'_6'])?$_POST['input_'.$field_id.'_6']:false),
					];
					break;
				default:
					break;
			}
		}
		return $custom_data;
	}
	
	public function process_flutterwave_payment($entry, $form) {
		// Check if the form has the required payment field
		if (!isset($form['paymentMethod']) || $form['paymentMethod']['gateway'] !== 'flutterwave') {
			return;
		}
		// Get the submission ID and transaction reference from the entry
		$submission_id = $entry['id'];
		$txref = 'your_transaction_reference'; // Replace with your transaction reference generation logic
		// Get the total payment amount from the entry
		$payment_amount = rgar($entry, 'payment_amount');
		// Create a payment request to Flutterwave
		$payment_request = $this->create_flutterwave_payment_request($txref, $payment_amount);
		// Store the payment request details in the entry meta
		gform_update_meta($submission_id, 'flutterwave_payment_request', $payment_request);
		// Redirect the user to the payment URL
		wp_redirect($payment_request['data']['link']);
		exit();
	}
	public function handle_flutterwave_payment_return() {
		// Check if the current request is the return URL from Flutterwave
		if (!isset($_GET['flutterwave_payment_return']) || $_GET['flutterwave_payment_return'] !== 'true') {
			return;
		}
	
		// Get the submission ID from the query string or session data
		$submission_id = isset($_GET['entry']) ? intval($_GET['entry']) : intval($_SESSION['flutterwave_submission_id']);
	
		// Get the payment request details from the entry meta
		$payment_request = gform_get_meta($submission_id, 'flutterwave_payment_request');
	
		// Verify the payment status and process the payment response
		$payment_status = $this->verify_flutterwave_payment_status($payment_request);
	
		// Update the entry with the payment status
		gform_update_meta($submission_id, 'flutterwave_payment_status', $payment_status);
	
		// Redirect the user to the appropriate confirmation page based on the payment status
		$confirmation_url = $this->get_flutterwave_confirmation_url($payment_status);
		wp_redirect($confirmation_url);
		exit();
	}
	// Example functions for creating a payment request, verifying payment status, and getting the confirmation URL
	public function create_flutterwave_payment_request($txref, $amount) {
		// Make a cURL request to Flutterwave API to create a payment request
		// Replace with your own implementation using the Flutterwave API

		// Return the payment request details (e.g., response from Flutterwave API)
		return $payment_request;
	}
	public function verify_flutterwave_payment_status($payment_request) {
		// Verify the payment status using the payment request details
		// Replace with your own implementation using the Flutterwave API

		// Return the payment status (e.g., success, failed, pending, etc.)
		return $payment_status;
	}
	public function get_flutterwave_confirmation_url($payment_status) {
		// Return the appropriate confirmation page URL based on the payment status
		// Replace with your own implementation or customize the logic as needed

		if ($payment_status === 'success') {
			return home_url('/payment-success');
		} else {
			return home_url('/payment-failed');
		}
	}


    public function is_flutterwave_enabled() {
        return (isset($this->settings['secretkey']) && $this->settings['secretkey'] !== '');
    }
	
	public function gform_field_content($content, $field, $value, $lead_id, $form_id) {
		if( $field->type == 'select' && $field->multiple ) {
			$input_type = $field->enableChoiceValue ? 'checkbox' : 'multiselect';
			$field->inputType = $input_type;
			$content = \GFCommon::get_select( $field, $value, $form_id, $lead_id );
		}
		return $content;
	}
	public function enable_multiple_select( $form ) {
		foreach( $form['fields'] as &$field ) {
			if( $field->type === 'select' && $field->multiple ) {
				$field->enableChoiceValue = true;
				$field->inputType = 'checkbox';
			}
		}
		return $form;
	}
	public function gform_pre_update_filter($form, $settings) {
		if($form['slug'] === 'flutterwaveaddons') {
			$settings['paymentReminder'] = stripslashes($settings['paymentReminder']);
			return $settings;
		}
		return $form;
	}
	public function editor_script(){
		?>
		<script type='text/javascript'>
			//adding setting to fields of type "text"
			fieldSettings.text += ', .encrypt_setting';
			//binding to the load field settings event to initialize the checkbox
			jQuery(document).on('gform_load_field_settings', function(event, field, form){
				jQuery( '#field_encrypt_value' ).prop( 'checked', Boolean( rgar( field, 'encryptField' ) ) );
			});
		</script>
		<?php
	}
	public function gform_settings_menu($setting_tabs) {
		if(!current_user_can('manage_options')) {return $setting_tabs;}
		$icon = ESIGNBINDING_ADDONS_BUILD_PATH . '/icons/money-business-and-finance-svgrepo-com.svg';
		$icon = (file_exists($icon)&&!is_dir($icon))?file_get_contents($icon):'gform-icon gform-icon--api';
		$tab = [
			'name'	=> 'flutterwaveaddons',
            'label'	=> 'Flutterwave',
            'title'	=> 'Gravity Forms FlutterWave Payment addons.',
            'icon'	=> $icon
		];
		$setting_tabs[12] = $tab;
		// $setting_tabs = array_merge(array_slice($setting_tabs, 0, 2), [$tab], array_slice($setting_tabs, 2));
		return $setting_tabs;
	}
	public function print_settings_fields($fields) {
		$html = '';
		foreach($fields as $field) {
			$html .= $this->display_field([
				'field'	=> $field
			]);
		}
		return $html;
	}
	public function gform_settings_flutterwaveaddons() {
		// Check if the user has permissions to access the settings page
		if (!current_user_can('manage_options')) {
			wp_die(__('You do not have sufficient permissions to access this page.'));
		}
		// Save settings if form is submitted
		if (isset($_POST['gform_settings_flutterwaveaddons'])) {
			// Perform validation and save the settings
			update_option('flutterwaveaddons', $_POST['flutterwaveaddons']);
			$this->settings = $_POST['flutterwaveaddons'];
			// Add other necessary settings update code here
			// Display a success message
			echo '<div class="notice notice-success is-dismissible"><p>Settings saved successfully!</p></div>';
		}
		// Retrieve the current settings values
		$api_key = get_option('gf_flutterwave_api_key');
		// Render the settings page HTML
		$settings = $this->settings_fields();
		?>
		<form id="gform-settings" class="gform_settings_form" action="" method="post" enctype="multipart/form-data">
			<?php wp_nonce_field('gform_settings_flutterwaveaddons', 'gform_settings_flutterwaveaddons', true, true ); ?>
			<fieldset class="gform-settings-panel gform-settings-panel--full gform-settings-panel--with-title">
				<legend class="gform-settings-panel__title gform-settings-panel__title--header">
					<?php echo esc_html($settings['title']); ?>
				</legend>
				<div class="gform-settings-panel__content">
					<div class="gform-settings-description gform-kitchen-sink">
						<?php echo wp_kses_post($settings['description']); ?>
					</div>
					<?php echo $this->print_settings_fields($settings['fields']); ?>
				</div>
			</fieldset>
			<div class="gform-settings-save-container">
				<button type="submit" id="gform-settings-save" name="gform-settings-save" value="save" form="gform-settings" class="primary button large">Save Settings &nbsp;→</button>
			</div>
			<script type="text/javascript" src="http://localhost/wordpress/wp-content/plugins/gravityforms/js/plugin_settings.js"></script>
		</form>
		<?php
	}

	public function process_flutterwave_refund($order_id) {
		$order = wc_get_order($order_id);
	
		// Check if the order is paid using the Flutterwave payment gateway
		if( $this->id === $order->get_payment_method()) {
			// Get the Flutterwave transaction ID from the order metadata
			$transaction_id = $order->get_meta('_transaction_id');
	
			// Make the refund request to Flutterwave using the transaction ID
			$refund_amount = $order->get_total();
			$api_key = get_option('gf_flutterwave_api_key');
	
			// Make the API request to initiate the refund
			$url = 'https://api.flutterwave.com/v3/refunds';
			$headers = [
				'Authorization: Bearer ' . $api_key,
				'Content-Type: application/json',
			];
			$data = [
				'transaction_id' => $transaction_id,
				'amount' => $refund_amount,
				// Add any additional refund parameters as needed
			];
	
			$response = wp_remote_post($url, [
				'headers' => $headers,
				'body' => json_encode($data),
			]);
	
			// Process the response and update order status accordingly
			if (!is_wp_error($response) && 200 === wp_remote_retrieve_response_code($response)) {
				$order->add_order_note('Refund processed successfully via Flutterwave.');
				$order->update_status('refunded');
			} else {
				$error_message = is_wp_error($response) ? $response->get_error_message() : 'Refund request failed.';
				$order->add_order_note('Failed to process refund via Flutterwave: ' . $error_message);
			}
		}
	}


	public function settings_fields() {
		$args = [
			'title'							=> __( 'General', 'esignbinding' ),
			'description'				=> sprintf(
				__('Gravity Forms integration with FlutterWave payments will work on both Gravity Forms and WooCommerce plugins. A secret key is mostly required to connect with FlutterWave. If you don\'t have this API key, you can %sfollow this link.%s', 'esignbinding' ),
				'<a href="https://flutterwave.com/" target="_blank">', '</a>'
			),
			'fields'						=> [
				[
					'id' 					=> 'testMode',
					'label'					=> __('Test mode', 'esignbinding'),
					'type'					=> 'checkbox',
					'default'				=> false,
					'description'			=> __('Check if you want to enable test mode.', 'esignbinding'),
					'help'					=> '<strong>Test mode</strong>Check if you want to enable test mode.'
				],
				[
					'id' 						=> 'publickey',
					'label'					=> __( 'Public Key', 'esignbinding' ),
					'type'					=> 'text',
					'default'				=> true,
					// 'description'			=> __( 'Mark to enable flutterwave payment functionalities.', 'esignbinding' ),
					'help'					=> '<strong>Public Key</strong>Enter your Public Key, if you do not have a key you can register for one at the provided link.'
				],
				[
					'id' 					=> 'secretkey',
					'label'					=> __( 'Secret Key', 'esignbinding' ),
					'type'					=> 'text',
					'default'				=> true,
					// 'description'			=> __( 'Mark to enable function of this Plugin.', 'esignbinding' ),
					'help'					=> '<strong>Secret Key</strong>Enter your Secret Key, if you do not have a key you can register for one at the provided link.'
				],
				[
					'id' 						=> 'encryptionkey',
					'label'					=> __( 'Encryption Key', 'esignbinding' ),
					'type'					=> 'text',
					'default'				=> true,
					// 'description'			=> __( 'Mark to enable function of this Plugin.', 'esignbinding' ),
					'help'					=> '<strong>Encryption Key</strong>Enter your Encryption Key, if you do not have a key you can register for one at the provided link.'
				],
				[
					'id' 						=> 'amountZeroMsg',
					'label'					=> __( 'Amount required message', 'esignbinding' ),
					'description'		=> __( 'This message will be the default message on settings field if the calculated amount is zero.', 'esignbinding' ),
					'type'					=> 'text',
					'default'				=> 'You must calculate an amount to make pay and proceed. Currently calculated amount is zero or less then zero!'
				],
				[
					'id'					=> 'paymentSuccess',
					'label'					=> __( 'Success status', 'esignbinding' ),
					'description'			=> __( 'Give here a long success message that will be display on payment success page. With the confirmation message that the form submitted successfully.', 'esignbinding' ),
					'type'					=> 'text',
					'default_value'			=> "Congratulations! Your payment was successful. Thank you for your trust and support. We're delighted to inform you that your form submission has been received and processed successfully. Your payment has been successfully completed, and we appreciate your valuable contribution. We're grateful for your business and look forward to serving you again in the future. If you have any questions or need further assistance, please don't hesitate to reach out to our support team. Once again, thank you for choosing us, and have a wonderful day!"
				],
				[
					'id' 						=> 'paymentFailed',
					'label'					=> __( 'Failed status', 'esignbinding' ),
					'description'		=> __( "Give here a long error message that will be display on payment failed/cancelled/denaid status. With the confirmation message that the form didn't submitted.", 'esignbinding' ),
					'type'					=> 'text',
					'default_value'			=> "We apologize for the inconvenience. Unfortunately, your payment was not successful. We understand that this may be disappointing. Please note that your form submission was not completed successfully. If you encountered any issues or have any questions regarding the payment or form submission process, please feel free to contact our support team. We're here to assist you and resolve any concerns you may have. We value your interest and hope to have the opportunity to serve you better in the future. Thank you for your understanding."
				],
				[
					'id' 					=> 'paymentReminderSubject',
					'label'					=> __( 'Mail reminder subject', 'esignbinding' ),
					'description'		=> __( "Give here a long error message that will be display on payment failed/cancelled/denaid status. With the confirmation message that the form didn't submitted.", 'esignbinding' ),
					'type'					=> 'text'
				],
				[
					'id' 					=> 'paymentReminder',
					'name' 					=> 'paymentReminder',
					'label'					=> __( 'Payment Reminder', 'esignbinding' ),
					'type'					=> 'text',
					'description'		=> sprintf(
						__( "Give here any html template that will be applied for payment reminder email template from Entry list screen. Following tags could be applicable on this template. %s", 'esignbinding' ),
						'{{mailImagePath}}, {{customFullName}}, {{senderFullName}}, {{dateMMMMdd}}, {{dateYYYMMDD}}, {{productName}}, {{invoiceNumber}}, {{siteEmail}}, {{siteURL}}, {{siteAddress}}, {{customAddressFull}}, {{invoiceIssuedOn}}, {{invoiceUnit}}, {{invoiceTotal}}, {{invoiceTax}}, {{invoiceSubtotal}}'
					),
					'default_value'			=> ''
				],
			]
		];
		return $args;
	}
	public function display_field( $args ) {
		$field = wp_parse_args( $args['field'], [
			'placeholder'	=> ''
		] );
		$html = '';
		$option_name = $this->settingSlug ."[". $field['id']. "]";
		$field[ 'default' ] = isset( $field[ 'default' ] ) ? $field[ 'default' ] : '';
		$data = (isset($this->options[$field['id']]))?$this->options[$field['id']]:$field['default'];
		$field['value'] = isset($this->settings[$field['id']])?$this->settings[$field['id']]:'';
		switch( $field['type'] ) {
			case 'text':case 'email':case 'password':case 'number':
			case 'date':case 'time':case 'color':case 'url':
				$html .= '
					<div class="gform-settings-field gform-settings-field__'.esc_attr($field['type']).'">
						<div class="gform-settings-field__header">
							<label class="gform-settings-label" for="public_key">'.esc_html($field['label']).'</label>
							'.wp_kses_post(
								(isset($field['help'])) ? '<button onclick="return false;" onkeypress="return false;" class="gf_tooltip tooltip tooltip_settings_recaptcha_public" aria-label="'.esc_attr($field['help']).'">
								<i class="gform-icon gform-icon--question-mark" aria-hidden="true"></i>
							</button>': ''
							).'
						</div>
						<span class="gform-settings-input__container">
						<input type="'.$field['type'].'" name="'.esc_attr($option_name).'" value="'.esc_attr($field['value']).'" id="'.esc_attr($field['id']).'" placeholder="'.esc_attr($field['placeholder']).'" value="'.esc_attr($data).'"'.$this->attributes($field).'>
						</span>
					</div>
				';
			break;
			case 'text_secret':
				$html .= '<input id="' . esc_attr( $field['id'] ) . '" type="text" name="' . esc_attr( $option_name ) . '" placeholder="' . esc_attr( $field['placeholder'] ) . '" value="" ' . $this->attributes( $field ) . '/>' . "\n";
			break;
			case 'textarea':
				$html .= '<textarea id="' . esc_attr( $field['id'] ) . '" rows="5" cols="50" name="' . esc_attr( $option_name ) . '" placeholder="' . esc_attr( $field['placeholder'] ) . '" ' . $this->attributes( $field ) . '>' . $data . '</textarea><br/>'. "\n";
			break;
			case 'checkbox':
				$checked = ($data&&'on'==$data)?'checked="checked"':'';
				$this->settings[$field['id']] = isset($this->settings[$field['id']])?$this->settings[$field['id']]:false;
				$html .= '<input id="' . esc_attr( $field['id'] ) . '" type="' . $field['type'] . '" name="' . esc_attr( $option_name ) . '" value="on" '.$this->attributes($field).' '.esc_attr(($this->settings[$field['id']]=='on')?'checked':'').'/>' . "\n";
			break;
			case 'checkbox_multi':
				foreach( $field['options'] as $k => $v ) {
					$checked = false;
					if( is_array($data) && in_array( $k, $data ) ) {
						$checked = true;
					}
					$html .= '<label for="' . esc_attr( $field['id'] . '_' . $k ) . '"><input type="checkbox" ' . checked( $checked, true, false ) . ' name="' . esc_attr( $option_name ) . '[]" value="' . esc_attr( $k ) . '" id="' . esc_attr( $field['id'] . '_' . $k ) . '" /> ' . $v . '</label> ';
				}
			break;
			case 'radio':
				foreach( $field['options'] as $k => $v ) {
					$checked = false;
					if( $k == $data ) {$checked = true;}
					if( ! $checked && $k == $field[ 'default' ] ) {$checked = true;}
					$html .= '<label for="' . esc_attr( $field['id'] . '_' . $k ) . '"><input type="radio" ' . checked( $checked, true, false ) . ' name="' . esc_attr( $option_name ) . '" value="' . esc_attr( $k ) . '" id="' . esc_attr( $field['id'] . '_' . $k ) . '" ' . $this->attributes( $field ) . '/> ' . $v . '</label> ';
				}
			break;
			case 'select':
				$html .= '<select name="' . esc_attr( $option_name ) . '" id="' . esc_attr( $field['id'] ) . '" ' . $this->attributes( $field ) . '>';
				foreach( $field['options'] as $k => $v ) {
					$selected = ( $k == $data );
					if( empty( $data ) && ! $selected && $k == $field[ 'default' ] ) {$selected = true;}
					$html .= '<option ' . selected( $selected, true, false ) . ' value="' . esc_attr( $k ) . '">' . $v . '</option>';
				}
				$html .= '</select> ';
			break;
			case 'select_multi':
				$html .= '<select name="' . esc_attr( $option_name ) . '[]" id="' . esc_attr( $field['id'] ) . '" multiple="multiple" ' . $this->attributes( $field ) . '>';
				foreach( $field['options'] as $k => $v ) {
					$selected = false;
					if( in_array( $k, $data ) ) {
						$selected = true;
					}
					$html .= '<option ' . selected( $selected, true, false ) . ' value="' . esc_attr( $k ) . '">' . $v . '</option> ';
				}
				$html .= '</select> ';
			break;
		}
		switch( $field['type'] ) {
			case 'checkbox_multi':
			case 'radio':
			case 'select_multi':
				$html .= apply_filters( 'esign/project/settings/fields/label', '<br/><span class="description">' . $field['description'] . '</span>', $field );
			break;
			default:
				$html .= isset($field['description'])?apply_filters( 'esign/project/settings/fields/label', '<label for="' . esc_attr( $field['id'] ) . '"><span class="description">' . $field['description'] . '</span></label>' . "\n", $field ):'';
			break;
		}
		echo $html;
	}
	public function attributes( $field ) {
		if( ! isset( $field[ 'attr' ] ) || ! is_array( $field[ 'attr' ] ) || count( $field[ 'attr' ] ) < 1 ) {return '';}
		$html = '';
		foreach( $field[ 'attr' ] as $attr => $value ) {
			$html .= $attr . '="' . $value . '" ';
		}
		return $html;
	}

	public function load_gravityform_addon() {
		if(class_exists('GFForms')) {
			if(!method_exists('GFForms','include_addon_framework')) {return;}
			\GFForms::include_addon_framework();
		}
        require_once(untrailingslashit(ESIGNBINDING_ADDONS_DIR_PATH).'/inc/widgets/widget-flutterwave-payment.php'); // GFFlutterwavePaymentAddon::get_instance();
        \GFAddOn::register( 'ESIGNBINDING_ADDONS\Inc\GFFlutterwavePaymentAddon' );
		
        // require_once(untrailingslashit(ESIGNBINDING_ADDONS_DIR_PATH).'/inc/widgets/widget-flutterwave-simple.php'); // GFFlutterwaveSimpleAddon::get_instance();
        // \GFAddOn::register( 'ESIGNBINDING_ADDONS\Inc\GFFlutterwaveSimpleAddon' );
		
	}


	public function register_credit_card_field() {
		if (class_exists('GFForms')) {
			require_once(untrailingslashit(ESIGNBINDING_ADDONS_DIR_PATH).'/inc/widgets/widget-flutterwave-cards.php');
			\GF_Fields::register(new GF_FlutterWave_Credit_Card_Field());
		}
	}
	public function gform_field_standard_fields($fields) {
		require_once(untrailingslashit(ESIGNBINDING_ADDONS_DIR_PATH).'/inc/widgets/widget-flutterwave-cards.php');
		$fields['credit_card'] = 'ESIGNBINDING_ADDONS\Inc\GF_FlutterWave_Credit_Card_Field';
		return $fields;
	}
	public function gform_add_field_buttons($field_groups) {
		foreach ($field_groups as &$group) {
			if ($group['name'] === 'advanced_fields') {
				$group['fields'][] = array(
					'class' => 'button',
					'value' => __('Credit Card', 'esignbinding'),
					'onclick' => "StartAddField('credit_card');",
				);
				break;
			}
		}
		return $field_groups;
	}
	public function gform_submit_button($button, $form) {
		if(!isset($form['enableFlutterwave']) || !$form['enableFlutterwave']) {return $button;}
		$payment_gateway = 'flutterwave'; // Replace with your Flutterwave payment gateway ID | 
		$button_text = __('Pay with Flutterwave', 'esignbinding'); // Replace with your desired button text

		$has_payment = true;
		// $has_payment = array_search('flutterwave_credit_card', array_column($form['fields'], 'type'));
		// $button = ($has_payment)?"<button class='gform_button btn btn-primary button do_flutterwave_submit' type='button'>{$form['submitBtnText']}</button>":$button;
		$button = ($has_payment)?str_replace('gform_button', 'gform_button do_flutterwave_submit', $button):$button;
		$button = empty($form['submitBtnText'])?$button:preg_replace("/value='[^']*'/", "value='" . $form['submitBtnText'] . "'", $button);

		// Check if the form has the specified payment gateway
		// if(isset($form['gateway']) && in_array($payment_gateway, $form['gateway'])) {
		// 	$button = "<button class='gform_button button' onclick='alert(this);'>$button_text</button>";
		// }
	
		return $button;
	}
	public function gform_editor_js() {
		do_action('esign/project/assets/register_styles');
        do_action('esign/project/assets/register_scripts');
        wp_enqueue_style('esignscripts');wp_enqueue_script('imask');
        wp_enqueue_script('esignscripts');
		?>
		<script type="text/javascript">
			// Enable the custom field in the form editor
			if(typeof fieldSettings !== 'undefined') {
				fieldSettings['credit_card'] = ".label_setting, .admin_label_setting, .visibility_setting, .css_class_setting, .size_setting";
			}

			// Define the field button
			if(typeof fieldButtons !== 'undefined') {
				fieldButtons['credit_card'] = {
					title: '<?php echo esc_js(__('Credit Card', 'esignbinding')); ?>',
					onclick: function() {
						StartAddField('credit_card');
					}
				};
			}
			
		</script>
		<?php
	}
	public function gform_field_css_class($classes, $field, $form) {
		if ($field->type == 'custom_field_type') {
			$classes .= 'custom_field_setting';
		}
		return $classes;
	}
	public function gform_tooltips($tooltips) {
		$tooltips['form_field_encrypt_value'] = "<h6>Encryption</h6>Check this box to encrypt this field's data";
		$tooltips['form_flutterwave'] = sprintf(
			__('%s Enable Flutterwave %s Check this option to enable Flutterwave Payment for this form. This will calculate prices, taxes and prevent submittion before payment.', 'esignbinding'),
			'<strong>', '</strong>'
		);
		$tooltips['form_alsocard'] = sprintf(
			__('%s Enable Card Payment %s Check this option to enable Credit card Payment through flutterwave for this form. This will apear a choice of both credit card or secure payment.', 'esignbinding'),
			'<strong>', '</strong>'
		) . sprintf(esc_html__('Available payment methods can be configured in your %s Flutterwave Dashboard%s.', 'esignbinding'), '<a href="https://dashboard.flutterwave.com/" target="_blank">', '</a>');
		$tooltips['form_comissiontype'] = sprintf(
			__("%s Comission Type %s Choose a commission type: percentage or flat rate. If you select 'percentage,' the plugin will calculate a commission amount based on the percentage of the total payment. If you choose 'flat rate,' the plugin will deduct the specified flat amount from the total payment if the total exceeds that amount.", 'esignbinding'),
			'<strong>', '</strong>'
		);
		$tooltips['form_comissionamount'] = sprintf(
			__("%s Comission Percent %s Give here a percentage of amount of comission for sub accounts.", 'esignbinding'),
			'<strong>', '</strong>'
		);
		$tooltips['form_comissionflat'] = sprintf(
			__("%s Flat Amount %s Give here a flat amount of comission for sub accounts. If calculated total is less then this flat amount, it won't be applied.", 'esignbinding'),
			'<strong>', '</strong>'
		);
		$tooltips['form_subaccounts'] = sprintf(
			__("%s Sub Accounts %s Select sub accounts for serving comissions. Flat amount or percentage, both will be prioritize on ascending order.", 'esignbinding'),
			'<strong>', '</strong>'
		);
		$tooltips['form_submittext'] = sprintf(
			__("%s Submit Button Text %s You can setup a submit button text here. E.g. Pay, Register, Submit.", 'esignbinding'),
			'<strong>', '</strong>'
		);
		$tooltips['form_statusBtnLink'] = sprintf(
			__("%s Button Link %s Payment returned status page button link. Set homepage to setup Back to home like, site homepage link. Selecting form will set button link form entry screen link.", 'esignbinding'),
			'<strong>', '</strong>'
		);
		$tooltips['form_fluttercard_message'] = sprintf(
			__("%s Card message %s Secure card payment message around 300 characters.", 'esignbinding'),
			'<strong>', '</strong>'
		);
		$tooltips['form_require_amount_message'] = sprintf(
			__('%s Required Amount %s Give here a message that will show if form doesn\'t provide an amount to pay.', 'esignbinding'),
			'<strong>', '</strong>'
		);
		return $tooltips;
	}
	public function gform_form_settings_fields($fields, $form) {
		$fields[$this->id] = [
			'title'  => esc_html__( 'Flutterwave Payment', 'esignbinding' ),
			'fields' => [
				[
					'name'    => 'enableFlutterwave',
					'type'    => 'toggle',
					'label'   => esc_html__( 'Enable flutterwave Payment', 'esignbinding' ),
					'tooltip' => gform_tooltip( 'form_flutterwave', '', true )
				],
				[
					'name'    => 'enableCard',
					'type'    => 'toggle',
					'label'   => esc_html__( 'Enable Card Payment', 'esignbinding' ),
					'tooltip' => gform_tooltip( 'form_alsocard', '', true ),
					'description' => __('Enable credit card payment as well.', 'esignbinding'),
					'dependency' => [
						'live'   => true,
						'fields' => [
							['field' => 'enableFlutterwave'],
						],
					],
				],
				[
					'name'    => 'comissionType',
					'type'    => 'radio',
					'label'   => esc_html__( 'Comission type', 'esignbinding' ),
					'tooltip' => gform_tooltip( 'form_comissiontype', '', true ),
					'choices' => [
						['label' => esc_html__( 'Percentage', 'esignbinding' ), 'value' => 'percentage'],
						['label' => esc_html__( 'Flat amount', 'esignbinding' ), 'value' => 'flatamount'],
					],
					'dependency' => [
						'live'   => true,
						'fields' => [
							['field' => 'enableFlutterwave'],
						],
					],
				],
				[
					'name'    => 'percentageAmount',
					'type'    => 'text',
					'label'   => esc_html__( 'Comission Percent', 'esignbinding' ),
					'tooltip' => gform_tooltip( 'form_comissionamount', '', true ),
					'dependency' => [
						'live'   => true,
						'fields' => [
							['field' => 'enableFlutterwave'],
							['field' => 'comissionType', 'values' => ['percentage']]
						],
					],
				],
				[
					'name'    => 'flatrateAmount',
					'type'    => 'text',
					'label'   => esc_html__( 'Flat amount', 'esignbinding' ),
					'tooltip' => gform_tooltip( 'form_comissionflat', '', true ),
					'dependency' => [
						'live'   => true,
						'fields' => [
							['field' => 'enableFlutterwave'],
							['field' => 'comissionType', 'values' => ['flatamount']]
						],
					],
				],
				[
					'name'    => 'subAccounts',
					'type'    => 'checkbox',
					'label'   => esc_html__( 'Sub Accounts', 'esignbinding' ),
					'tooltip' => gform_tooltip( 'form_subaccounts', '', true ),
					'choices' => $this->gforms_sub_accounts(),
					// 'multiple' => true,
					'dependency' => [
						'live'   => true,
						'fields' => [
							['field' => 'enableFlutterwave'],
						],
					],
				],
				[
					'name'    => 'submitBtnText',
					'type'    => 'text',
					'label'   => esc_html__( 'Submit text', 'esignbinding' ),
					'tooltip' => gform_tooltip( 'form_submittext', '', true ),
					'default_value' => 'Submit',
					'dependency' => [
						'live'   => true,
						'fields' => [
							['field' => 'enableFlutterwave']
						],
					],
				],
			],
		];
		
		// Error Messages
		$fields[$this->id]['fields'][] = [
			'name'       => 'requireAmountMessage',
			'type'       => 'textarea',
			'label'      => esc_html__( 'Required Amount', 'esignbinding' ),
			'tooltip'    => gform_tooltip( 'form_require_amount_message', '', true ),
			'allow_html' => true,
			'default'	 => isset($this->settings['amountZeroMsg'])?$this->settings['amountZeroMsg']:'',
			'dependency' => [
				'live'   => true,
				'fields' => [
					['field' => 'enableFlutterwave']
				],
			],
		];
		return $fields;
	}
	public function gform_form_settings_menu($setting_tabs, $form_id) {
		$icon = ESIGNBINDING_ADDONS_BUILD_PATH . '/icons/money-business-and-finance-svgrepo-com.svg';
		$icon = (file_exists($icon)&&!is_dir($icon))?file_get_contents($icon):'gform-icon gform-icon--api';
		$setting_tabs['60'] = [
			'name'         => 'flutterwave',
			'label'        => __( 'Flutterwave', 'esignbinding' ),
			'icon'         => $icon,
			'query'        => ['nid' => null],
			'capabilities' => ['gravityforms_edit_forms']
		];
		return $setting_tabs;
	}
	public function gform_form_settings_page_flutterwave($subview) {
		// \GFFormSettings::page_header( __( 'Flutterwave Gateway', 'esignbinding' ) );
		\GFFormSettings::page_header();
		$form_id = absint(rgget('id'));
		

		
		\GFFormSettings::page_footer();
	}
	public function gforms_sub_accounts() {
		global $FWPFlutterwave;
		// $subaccounts = [];
		// for ($i=1; $i <= 6; $i++) {
		// 	$subaccounts[] = ['name' => 'account '.$i, 'label' => esc_html__( 'Sub account '.$i, 'esignbinding' ), 'value' => 'flatamount'];
		// }
		// $subaccounts = (array) apply_filters('esign/project/payment/getallsubaccounts',[], false);
		try {
			$subaccounts = $FWPFlutterwave->getAllSubAccounts();
			if(count($subaccounts)>=1) {
				foreach($subaccounts as $i => $subac) {
					if(isset($subac['id'])) {
						$subaccounts[$i] = [
							'id'		=> $subac['id'],
							'name'		=> 'subAccounts['.$subac['id'].']',
							'value'		=> $subac['id'],
							'label'		=> "{$subac['full_name']} ({$subac['business_name']})",
						];
					}
					
				}
			}
			return $subaccounts;
		} catch (\Exception $e) {
			return [];
		}
	}


	public function isPayable($entry, $form) {
		foreach($form['fields'] as $i => $field) {
			if($field->type == 'flutterwave_credit_card') {
				return true;
			}
		}
		return false;
		// return (isset($form['enableFlutterwave']) && $form['enableFlutterwave']);
	}
	public function gform_pre_send_email($email, $message_format, $notification, $entry) {
		// print_r([$email, $message_format, $notification, $entry]);
		if(!$entry && $this->currentEntry) {$entry = $this->currentEntry;}
		$form = (\GFAPI::form_id_exists((int)$entry['form_id']))?\GFAPI::get_form((int)$entry['form_id']):false;
		if(!$form || !$this->isPayable($entry, $form)) {return $notification;}
		 // Check the payment status of the entry
		 $payment_status = rgar($entry, 'payment_status');
		 // Disable notifications if payment status is not success
		 if($payment_status !== 'success') {
			$notification['disableAutoformat'] = true;
			// $notification['sendTo'] = '';
			$email['abort_email'] = true;
		 }
		 return $email;
	}
	public function gform_entry_created($entry, $form) {
		$this->currentEntry = $entry;
		if(!$this->isPayable($entry, $form)) {return;}
		$this->createPayLinkandGo($entry, $form);
	}
	public function createPayLinkandGo($entry, $form, $go = true) {
		global $FWPFlutterwave;
		
		$paymentField = false;$subaccounts = [];
		foreach($form['fields'] as $i => $field) {
			if($field->type == 'flutterwave_credit_card') {
				$paymentField = $field;
				foreach($field as $key => $val) {
					if(strpos($key, 'comissionAccount-') !== false) {
						$agent = str_replace(['comissionAccount-'], [''], $key);
						if(
						in_array($agent, ['client', 'partner', 'stuff']) &&
						!empty($val) && isset($field['comissionType-'.$agent]) && !empty($field['comissionType-'.$agent]) && isset($field['comissionAmount-'.$agent]) && !empty($field['comissionAmount-'.$agent])
						) {
							$subaccounts[] = [
								'id'						=> (int) $val,
								'transaction_charge_type'	=> ($field['comissionType-'.$agent]=='percentage')?'percentage_subaccount':'flat_subaccount',
								'transaction_charge'		=> (int) $field['comissionAmount-'.$agent]
							];
						}
					} else {}
				}
				break;
			}
		}
		// print_r([$subaccounts]);wp_die('Hi there');

		// Perform your payment processing logic here
		// Assuming the payment is successful, update the entry status to "Pending Payment"
		$txref = 'gfrm.'.time().'.'.$entry['id'];
		
		/**
		 * 
		 */
		$formDate = $this->extract_gravityentry_fields($entry);
		
		$user_id = get_current_user_id();

		$payment_amount = (isset($entry['payment_amount']) && $entry['payment_amount']!==null && (int) $entry['payment_amount'] > 0)?(int) $entry['payment_amount']:(isset($formDate['total'])?(int)$formDate['total']:1);

		$entry['transaction_id'] = $txref;
		$entry['payment_status'] = 'pending';
		$entry['payment_date'] = null;
		$entry['payment_amount'] = $payment_amount;
		$entry['payment_method'] = '';
		$entry['is_fulfilled'] = null;
		$entry['created_by'] = $user_id;
		$entry['transaction_type'] = null;
		$entry['status'] = 'pending_payment';
		
		// Update the entry with the new status
		\GFAPI::update_entry($entry);
		$args = [
			'txref' => $txref,
            'amount' => $payment_amount,
            'currency' => isset($entry['currency'])?$entry['currency']:'USD',
            'customer_info' => [
				'email' => isset($formDate['email'])?$formDate['email']:get_bloginfo('admin_email'),
				'customer_name' => join(' ', isset($formDate['name'])?[$formDate['name']['first'], $formDate['name']['last']]:['N/A']),
				'customer_phone' => isset($formDate['phone'])?$formDate['phone']:0
			],
			'subaccounts'	=> []
		];

		try {
			// $form['subAccounts'] = $subAccounts;
			if(count($subaccounts)>=1) {
				$args['subaccounts'] = $subaccounts;
			} elseif(false && count($subaccounts)>=1) {
				$getAllSubAccounts = $FWPFlutterwave->getAllSubAccounts();
				foreach($getAllSubAccounts as $i => $subAC) {
					if(in_array($subAC['id'], $subaccounts)) {
						$args['subaccounts'] = isset($args['subaccounts'])?$args['subaccounts']:[];
						$args['subaccounts'][] = [
							'id'						=> $subAC['id'],
							'transaction_charge_type'	=> ($paymentField['comissionType']=='percentage')?'percentage_subaccount':'flat_subaccount',
							'transaction_charge'		=> (int) $paymentField['comissionAmount']
						];
					}
				}
			} else {}
		} catch (\Exception $e) {}
		
		if($paymentField && isset($paymentField['enableCardPaymentMethod']) && $paymentField['enableCardPaymentMethod'] && isset($formDate['flutterwave_credit_card']) && isset($formDate['flutterwave_credit_card']['mode']) && $formDate['flutterwave_credit_card']['mode'] == 'credit') {
			$card = $formDate['flutterwave_credit_card'];
			$expire = explode('/', $card['expire']);$expire[1] = isset($expire[1])?$expire[1]:'';
			$argv = $args;
			$args = [
				'token'					=> [
					'card_number'      => $card['number'],
					'expiry_month'     => ($card['month']=='')?$expire[0]:$card['month'],
					'expiry_year'      => ($card['year']=='')?$expire[1]:$card['year'],
					'cvv'              => $card['code'],
				],
				'amount'                => $args['amount'],
				'currency'              => $args['currency'],
				// 'customer_email'		=> $args['customer_info']['email'],
				// 'customer_info'			=> [
				// 	'customer_email'		=> $args['customer_info']['email'],
				// 	'customer_name'		=> $args['customer_info']['customer_name'],
				// 	'customer_phone'	=> $args['customer_info']['customer_phone'],
				// ],
				// 'subaccounts'			=> $args['subaccounts'],
				'tx_ref'				=> $args['txref'],
			];
			if(isset($argv['subaccounts'])) {$args['subaccounts'] = $argv['subaccounts'];}
			
			if(!is_array($args['subaccounts']) || count($args['subaccounts']) <= 0) {unset($args['subaccounts']);}
			return true;
		} else {
			$link = $FWPFlutterwave->createPayment($args);
		}
		if($link) {
			gform_update_meta($entry['id'], '_paymentlink', $link);
			if($go) {wp_redirect($link);} else {return $link;}
		} else {
			if($go) {
				wp_die(
					__('Can\'t create payment link. Please contact with administrative.', 'esignbinding'),
					__('Error happening on creating payment.', 'esignbinding')
				);exit;
			} else {
				return false;
			}
			
		}
	}
	public function approve_entry_and_trigger_notifications($entry, $payment_result) {
		// Approve the entry
		\GFAPI::update_entry_property($entry['id'], 'is_approved', true);
		// Trigger notifications
		\GFCommon::send_notifications($entry, $form);
	}
	// Assuming you have a function to handle the payment success webhook
	public function handle_payment_success_webhook($payment_data) {
		$entry_id = $payment_data['entry_id']; // Assuming the entry ID is passed in the payment data

		// Approve the entry
		\GFAPI::update_entry_property($entry_id, 'is_approved', true);

		// Get the entry object
		$entry = \GFAPI::get_entry($entry_id);

		// Trigger notifications
		\GFCommon::send_notifications($entry, $entry['form_id']);
	}

	
	public function gform_pre_submission($form) {
		add_filter('gform_disable_post_creation', '__return_true');
	}
	public function gform_after_submission($entry, $form) {
		$this->currentEntry = $entry;
		$this->createPayLinkandGo($entry, $form);exit;
	}


	public function updateLink() {
		$request = $_POST;
		check_ajax_referer('esign/project/verify/nonce', '_nonce', true);
		$args = [];
		$args['hooks'] = ['payment-link-updated'];
		$args['message'] = __('Something went wrong. We can\'t update payment link.', 'esignbinding');
		$entry = (\GFAPI::entry_exists((int)$_POST['entry']))?\GFAPI::get_entry((int)$_POST['entry']):false;
		if(!$entry && !is_wp_error($entry)) {wp_send_json_error($args);}
		$form = (\GFAPI::form_id_exists((int)$_POST['form_id']))?\GFAPI::get_form((int)$_POST['form_id']):false;
		if(!$form && !is_wp_error($form)) {wp_send_json_error($args);}
		
		$payment_link = $this->createPayLinkandGo($entry, $form, false);

		if($payment_link) {
			$args['message'] = __('Payment link updated successfully!', 'esignbinding');
			$args['payment_link'] = $payment_link;
			wp_send_json_success($args);
		} else {
			$args['message'] = __('Something went wrong. We can\'t update payment link.', 'esignbinding');
			wp_send_json_error($args);
		}
	}
	public function paymentRefund() {
		check_ajax_referer('esign/project/verify/nonce', '_nonce', true);
		global $FWPFlutterwave;$request = $_POST;$args = [];
		$args['hooks'] = ['payment-refunded-failed'];$refund_amount = $request['amount'];
		$args['message'] = __('Something went wrong. We can\'t update payment link.', 'esignbinding');
		$entry = (\GFAPI::entry_exists((int)$_POST['entry']))?\GFAPI::get_entry((int)$_POST['entry']):false;
		if(!$entry && !is_wp_error($entry)) {wp_send_json_error($args);}
		$form = (\GFAPI::form_id_exists((int)$_POST['form_id']))?\GFAPI::get_form((int)$_POST['form_id']):false;
		if(!$form && !is_wp_error($form)) {wp_send_json_error($args);}
		
		$refunded = gform_get_meta($entry['id'], '_paymentrefunded');
		if(!$refunded || empty($refunded)) {$refunded = 0;}
		if(($refunded + $refund_amount) > $entry['payment_amount']) {
			$args['message'] = sprintf(__('You can\'t refund more then %s.', 'esignbinding'), ($entry['payment_amount'] - $refunded).' '.$entry['currency']);
			wp_send_json_error($args);
		}
		$refundable = ($refunded + $refund_amount);
		
		try {
			$RefundedPayment = $FWPFlutterwave->refund($entry['transaction_id'], $request['amount']);
			if($RefundedPayment) {
				$refunded = gform_update_meta($entry['id'], '_paymentrefunded', $refundable);
				$args['message'] = __('Payment refunded successfully!', 'esignbinding');
				$args['hooks'] = ['payment-refunded-success'];
				$args['refund'] = $RefundedPayment;
				wp_send_json_success($args);
			} else {
				$args['message'] = __('Something went wrong. Please try again later.', 'esignbinding');
				wp_send_json_error($args);
			}
		} catch (\Exception $e) {
			$args['message'] = $e->getMessage();
			wp_send_json_error($args);
		}
	}
	public function sendReminder() {
		$request = $_POST;
		check_ajax_referer('esign/project/verify/nonce', '_nonce', true);
		$args = [];
		$args['hooks'] = ['reminder-sent'];
		$args['message'] = __('Payment reminder mail sent successfully!', 'esignbinding');
		$template = $this->replaceMagicWords(stripslashes(ESIGNBINDING_ADDONS_OPTIONS['paymentReminder']), ['entry'=>$_POST['entry'],'form_id'=>$_POST['form_id']]);
		// $args['template'] = $template;

		if($template) {
			wp_send_json_success($args);
		} else {
			$args['message'] = __('Mail didn\'t properly sent. Entry ID or customer mail address not found!', 'esignbinding');
			wp_send_json_error($args);
		}
	}

	public function replaceMagicWords($str, $args) {
		$user_info = get_userdata(get_current_user_id());
		$entry = (\GFAPI::entry_exists((int)$args['entry']))?\GFAPI::get_entry((int)$args['entry']):false;
		if(!$entry && !is_wp_error($entry)) {return false;}
		$form = (\GFAPI::form_id_exists((int)$args['form_id']))?\GFAPI::get_form((int)$args['form_id']):false;
		if(!$form && !is_wp_error($form)) {return false;}
		
		$formDate = $this->extract_gravityentry_fields($entry);
		
		// print_r($form);
		$replaceingData = [
			'mailImagePath' => ESIGNBINDING_ADDONS_BUILD_IMG_URI.'/images',
			'customFullName' => join(' ', isset($formDate['name'])?[$formDate['name']['first'], $formDate['name']['last']]:[]),
			'senderFullName' => $user_info->first_name.' '.$user_info->last_name,
			'dateMMMMdd' => wp_date('M, d'),
			'dateYYYMMDD' => wp_date('Y-m-d'),
			'invoiceNumber' => bin2hex((int)$args['entry']),
			'siteEmail' => get_bloginfo('admin_email'),
			'siteURL' => site_url(),
			'siteAddress' => '',
			'customAddressFull' => isset($formDate['address'])?$formDate['address']['street'] . '. ' . $formDate['address']['city'] . ' '.$formDate['address']['state'].' '.$formDate['address']['country']:'',
			'invoiceIssuedOn' => wp_date('M, d, H:i', strtotime($entry['date_created'])),
			'productName' => isset($formDate['product'][0])?$formDate['product'][0]:'Submission charge',
			'invoiceUnit' => isset($formDate['quantity'])?$formDate['quantity']:1,
			'invoiceTotal' => $entry['currency'].$entry['payment_amount'],
			'invoiceTax' => $entry['currency'].'0',
			'invoiceSubtotal' => $entry['currency'].$entry['payment_amount'],
			'paymentLink' => gform_get_meta($entry['id'], '_paymentlink'),
		];
		foreach($replaceingData as $needle => $replace) {
			$str = str_replace('{{'.$needle.'}}', $replace, $str);
		}
		if(isset($formDate['email']) && !empty($formDate['email'])) {
			wp_mail($formDate['email'], stripslashes(ESIGNBINDING_ADDONS_OPTIONS['paymentReminderSubject']), $str, [
				'From: '.get_bloginfo().' <'.get_bloginfo('admin_email').'>',
				'Content-Type: text/html; charset=UTF-8'
			]);
		} else {
			return false;
		}
		return $str;
	}
	public function gform_editor_js_set_default_values() {
		?>
		case 'flutterwave_credit_card':
			if (!field.label)
				var ccNumber, ccExpirationMonth, ccExpirationYear, ccSecruityCode, ccCardType, ccName, enableCardPaymentMethod, flutterwaveDefaultModeCard, enablePreviewField, statusBtnLink;
				
				field.label = <?php echo json_encode(esc_html__('Flutterwave Payment', 'esignbinding')); ?>;
				var inputs = field.inputs || [];
	
				ccNumber = new Input(field.id + ".1", <?php echo json_encode(gf_apply_filters(array('gform_card_number', rgget('id')), esc_html__('Card Number', 'esignbinding'), rgget('id'))); ?>);
				ccExpirationMonth = new Input(field.id + ".month", <?php echo json_encode(gf_apply_filters(array('gform_card_expiration', rgget('id')), esc_html__('Expiration Month', 'esignbinding'), rgget('id'))); ?>);
				ccExpirationMonth.defaultLabel = <?php echo json_encode(esc_html__('Expiration Date', 'esignbinding')); ?>;
				ccExpirationYear = new Input(field.id + ".year", <?php echo json_encode(gf_apply_filters(array('gform_card_expiration', rgget('id')), esc_html__('Expiration Year', 'esignbinding'), rgget('id'))); ?>);
				ccSecruityCode = new Input(field.id + ".3", <?php echo json_encode(gf_apply_filters(array('gform_card_security_code', rgget('id')), esc_html__('Security Code', 'esignbinding'), rgget('id'))); ?>);
				ccCardType = new Input(field.id + ".4", <?php echo json_encode(gf_apply_filters(array('gform_card_type', rgget('id')), __( 'Card Type', 'esignbinding'), rgget('id'))); ?>);
				ccName = new Input(field.id + ".5", <?php echo json_encode(gf_apply_filters(array('gform_card_name', rgget('id')), esc_html__('Cardholder Name', 'esignbinding'), rgget('id'))); ?>);
				
				enableCardPaymentMethod = new Input(field.id + ".enableCardPaymentMethod", <?php echo json_encode(gf_apply_filters(array('gform_enable_card_payment_method', rgget('id')), esc_html__('Enable multiple payment methods', 'esignbinding'), rgget('id'))); ?>);
				flutterwaveDefaultModeCard = new Input(field.id + ".flutterwaveDefaultModeCard", <?php echo json_encode(gf_apply_filters(array('gform_flutterwave_default_mode_card', rgget('id')), esc_html__('Enable multiple payment methods', 'esignbinding'), rgget('id'))); ?>);
	
				enablePreviewField = new Input(field.id + ".enablePreviewField", <?php echo json_encode(gf_apply_filters(array('gform_enable_preview_field', rgget('id')), esc_html__('Show preview card', 'esignbinding'), rgget('id'))); ?>);
	
				submitBtnText = new Input(field.id + ".submitBtnText", <?php echo json_encode(esc_html__('Submit', 'esignbinding')); ?>);
				statusBtnLink = new Input(field.id + ".statusBtnLink", <?php echo json_encode(esc_html__('Button Link', 'esignbinding')); ?>);

				inputs.push(ccNumber, ccExpirationMonth, ccExpirationYear, ccSecruityCode, ccCardType, ccName, enableCardPaymentMethod, flutterwaveDefaultModeCard, enablePreviewField, statusBtnLink);
				
				<?php foreach(['client', 'partner', 'stuff'] as $type): ?>
					var comissionAccount_<?php echo esc_attr($type); ?> = new Input(field.id + ".comissionAccount-<?php echo esc_attr($type); ?>", <?php echo json_encode(esc_html__('Sub account', 'esignbinding')); ?>);
					inputs.push(comissionAccount_<?php echo esc_attr($type); ?>);

					var comissionType_<?php echo esc_attr($type); ?> = new Input(field.id + ".comissionType-<?php echo esc_attr($type); ?>", <?php echo json_encode(esc_html__('Comission type', 'esignbinding')); ?>);
					inputs.push(comissionType_<?php echo esc_attr($type); ?>);

					var comissionAmount_<?php echo esc_attr($type); ?> = new Input(field.id + ".comissionAmount-<?php echo esc_attr($type); ?>", <?php echo json_encode(esc_html(ucfirst($type).' subaccount')); ?>);
					inputs.push(comissionAmount_<?php echo esc_attr($type); ?>);
				<?php endforeach; ?>
	
				field.inputs = inputs;
				console.log(field);
			break;
		<?php
	}
	public function gform_field_standard_settings($position, $form_id) {
		// Create settings on position 25 (right after Field Label)
		if($position !== 1415) {return;}
		?>
		<li class="enable_multiple_payment_methods_setting field_setting">
			<?php
			if($this->is_flutterwave_enabled()) {
				$form = \GFAPI::get_form( $form_id );
				$options = [ 'email' => [] ];
				foreach($form['fields'] as $field) {
					$selected = selected( $field->id, rgar( $field, 'enableCardPaymentMethod' ), false );
					$options[ $field->type ] = isset( $options[ $field->type ] ) ? $options[ $field->type ] : [];
					$options[ $field->type ][] = sprintf(
						'<option value="%s" %s>%s</option>',
						esc_attr( $field->id ), $selected,
						esc_html( $field->label . ' - Field ID:' . $field->id )
					);
				}
				?>
				<div class="flutterwave_settings_advanced">
					<?php include untrailingslashit(ESIGNBINDING_ADDONS_DIR_PATH).'/templates/dashboard/admin/field_settings.php'; ?>
				</div>
				<?php
			} else {
				?>
				<div>
					<?php
					// translators: variables are the markup to generate a link.
					printf( esc_html__( 'This option is disabled because Flutterwave function disabled from this form settings or Secret keys not provided on settings or the key expired to your account is in live mode but the secret key you provided is in test mode. %1$sDo a reCheck over Flutterwave dashboard%2$s.', 'esignbinding' ), '<a href="https://dashboard.flutterwave.com/" target="_blank">', '</a>' );
					?>
				</div>
				<?php
			}
			?>
		</li>
		<?php
	}
	public function cardToken() {
		// check_ajax_referer('esign/project/verify/nonce', '_nonce', true);
		// Example usage
		global $FWPFlutterwave;
		$request = wp_parse_args($_POST, []);
		$json = ['hooks' => ['card_issued_falied']];
		$request['total'] = intval($request['total']);
		try {
			$args = [
				'name' => isset($request['name'])?$request['name']:'N/A',
				'amount' => ($request['total']*100),
				'currency' => $request['currency'],
				
				'card_number' => str_replace([' '], [''], $request['number']),
				'expiry_month' => explode('/', $request['expire'])[0],
				'expiry_year' => explode('/', $request['expire'])[1],
				'cvv' => $request['code'],
				// 'otp' => '123456' // Provide the received OTP here

				'customer_email' => $request['email'],
				'tx_ref' => $request['unique']
			];
			$issuedCard = $FWPFlutterwave->processCardPayment($args);
			// if(isset($issuedCard['meta']) && isset($issuedCard['meta']['authorization']) && isset($issuedCard['meta']['authorization']['mode'])) {}
			$json['hooks'] = ['card_issued_success'];
			$json['message'] = __('Successfully Issued your card. Please input the OPT just sent to your number.', 'esignbinding');
			$json['issuedData'] = $issuedCard;
			wp_send_json_success($json);
		} catch (\Exception $e) {
			$json['message'] = 'Payment Error: ' . $e->getMessage();
			wp_send_json_error($json);
		}
	}
	public function cardOTP() {
		// check_ajax_referer('esign/project/verify/nonce', '_nonce', true);
		global $FWPFlutterwave;
		$request = wp_parse_args($_POST, []);
		$json = ['hooks' => ['cardotp_falied']];
		$request['total'] = intval($request['total']);
		try {
			$args = [
				'otp' => $request['otp'],
				'flw_ref' => $request['flw_ref']
			];
			$issuedCard = $FWPFlutterwave->processCardVerify($args);

			$json['hooks'] = ['cardotp_success'];
			$json['message'] = __('Successfully Issued your card. Please input the OPT just sent to your number.', 'esignbinding');
			$json['issuedData'] = $issuedCard;
			wp_send_json_success($json);
		} catch (\Exception $e) {
			$json['message'] = 'Verification Error: ' . $e->getMessage();
			wp_send_json_error($json);
		}
	}

}