<?php
/**
 * Register Menus
 *
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;
class Menus {
	use Singleton;
	protected function __construct() {
		// load class.
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		/**
		 * Actions.
		 */
		add_filter('esign/project/settings/general', [$this, 'general'], 10, 1);
		add_filter('esign/project/settings/fields', [$this, 'menus'], 10, 1);
	}
	public function commontags($html = false) {
		$arg = [];$tags = [
			'username', 'sitename', 
		];
		if($html === false) {return $tags;}
		foreach($tags as $tag) {
			$arg[] = sprintf("%s{$tag}%s", '<code>{', '}</code>');
		}
		return implode(', ', $arg);
	}
	public function contractTags($tags) {
		$arg = [];
		foreach($tags as $tag) {
			$arg[] = sprintf("%s{$tag}%s", '<code>{', '}</code>');
		}
		return implode(', ', $arg);
	}

	/**
	 * WordPress Option page.
	 * 
	 * @return array
	 */
	public function general($args) {
		return $args;
	}
	public function menus($args) {
    	// apply_filters('esign/project/system/getoption', 'key', 'default')
		// apply_filters('esign/project/system/isactive', 'key')
		$args = [];
		$args['standard'] 		= [
			'title'							=> __('General', 'esignbinding'),
			'description'				=> __('Generel fields comst commonly used to changed.', 'esignbinding'),
			'fields'						=> [
				[
					'id' 						=> 'general-enable',
					'label'					=> __('Enable', 'esignbinding'),
					'description'		=> __('Mark to enable function of this Plugin.', 'esignbinding'),
					'type'					=> 'checkbox',
					'default'				=> true
				],
				[
					'id' 						=> 'general-address',
					'label'					=> __('Address', 'esignbinding'),
					'description'		=> __('Company address, that might be used on invoice and any public place if needed.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'general-archivedelete',
					'label'					=> __('Archive delete', 'esignbinding'),
					'description'		=> __('Enable archive delete permission on frontend, so that user can delete archive files and data from their profile.', 'esignbinding'),
					'type'					=> 'checkbox',
					'default'				=> ''
				],
				[
					'id' 						=> 'general-leaddelete',
					'label'					=> __('Delete User', 'esignbinding'),
					'description'		=> __('Enable this option to apear a possibility to delete user/lead with one click. If it\'s disabled, then user delete option on list and single user details page will gone until turn it on.', 'esignbinding'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
			]
		];
		$args['permalink'] 		= [
			'title'						=> __('Permalink', 'esignbinding'),
			'description'			=> __('Setup some permalink like dashboard and like this kind of things.', 'esignbinding'),
			'fields'					=> [
				[
					'id' 							=> 'permalink-dashboard',
					'label'						=> __('Dashboard Slug', 'esignbinding'),
					'description'			=> __('Enable dashboard parent Slug. By default it is "/dashboard". Each time you change this field you\'ve to re-save permalink settings.', 'esignbinding'),
					'type'						=> 'text',
					'default'					=> 'dashboard'
				],
				[
					'id' 						=> 'permalink-userby',
					'label'					=> __('Dashboard Slug', 'esignbinding'),
					'description'		=> __('Enable dashboard parent Slug. By default it is "/dashboard".', 'esignbinding'),
					'type'					=> 'radio',
					'default'				=> 'id',
					'options'				=> ['id' => __('User ID', 'esignbinding'), 'slug' => __('User Unique Name', 'esignbinding')]
				],
			]
		];
		$args['dashboard'] 		= [
			'title'							=> __('Dashboard', 'esignbinding'),
			'description'				=> __('Dashboard necessery fields, text and settings can configure here. Some tags on usable fields can be replace from here.', 'esignbinding') . $this->commontags(true),
			'fields'						=> [
				[
					'id' 						=> 'dashboard-disablemyaccount',
					'label'					=> __('Disable My Account', 'esignbinding'),
					'description'		=> __('Disable WooCommerce My Account dashboard and form redirect user to new dashboard. If you enable it, it\'ll apply. But be aware, WooCommerce orders and paid downloads are listed on My Account page.', 'esignbinding'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 						=> 'dashboard-title',
					'label'					=> __('Dashboard title', 'esignbinding'),
					'description'		=> __('The title on dahsboard page. make sure you user tags properly.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> sprintf(__('Client Dashoard | %s | %s', 'esignbinding'), '{username}', '{sitename}')
				],
				[
					'id' 						=> 'dashboard-yearstart',
					'label'					=> __('Year Starts', 'esignbinding'),
					'description'		=> __('The Year range on dashboard starts from.', 'esignbinding'),
					'type'					=> 'number',
					'default'				=> date('Y')
				],
				[
					'id' 						=> 'dashboard-yearend',
					'label'					=> __('Yeah Ends with', 'esignbinding'),
					'description'		=> __('The Year range on dashboard ends on.', 'esignbinding'),
					'type'					=> 'number',
					'default'				=> (date('Y') + 3)
				],
				[
					'id' 						=> 'dashboard-headerbg',
					'label'					=> __('Header Background', 'esignbinding'),
					'description'		=> __('Dashboard header background image url.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
			]
		];
		$args['links'] 		= [
			'title'							=> __('Links', 'esignbinding'),
			'description'				=> __('Documentation feature and their links can be change from here. If you leave blank anything then these "Learn More" never display.', 'esignbinding') . $this->commontags(true),
			'fields'						=> [
				[
					'id' 						=> 'docs-monthlyretainer',
					'label'					=> __('Monthly Retainer', 'esignbinding'),
					'description'		=> __('Your Monthly retainer that could be chaged anytime. Once you\'ve changed this amount, will be sync with your stripe account.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-monthlyretainerurl',
					'label'					=> __('Learn more', 'esignbinding'),
					'description'		=> __('The URL to place on Learn more.', 'esignbinding'),
					'type'					=> 'url',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-contentcalendly',
					'label'					=> __('Content Calendar', 'esignbinding'),
					'description'		=> __('See your content calendar on Calendly.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-contentcalendlyurl',
					'label'					=> __('Learn more', 'esignbinding'),
					'description'		=> __('The URL to place on Learn more.', 'esignbinding'),
					'type'					=> 'url',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-contentlibrary',
					'label'					=> __('Content Library', 'esignbinding'),
					'description'		=> __('Open content library from here.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-contentlibraryurl',
					'label'					=> __('Learn more', 'esignbinding'),
					'description'		=> __('The URL to place on Learn more.', 'esignbinding'),
					'type'					=> 'url',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-clientrowvideos',
					'label'					=> __('Client Raw Video Archive', 'esignbinding'),
					'description'		=> __('All of the video files are here. Click on the buton to open all archive list.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-clientrowvideosurl',
					'label'					=> __('Learn more', 'esignbinding'),
					'description'		=> __('The URL to place on Learn more.', 'esignbinding'),
					'type'					=> 'url',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-manageretainer',
					'label'					=> __('Manage your Retainer', 'esignbinding'),
					'description'		=> __('Manage your retainer from here. You can pause or cancel it from here.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-manageretainerurl',
					'label'					=> __('Learn more', 'esignbinding'),
					'description'		=> __('The URL to place on Learn more.', 'esignbinding'),
					'type'					=> 'url',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-paymenthistory',
					'label'					=> __('Payment History', 'esignbinding'),
					'description'		=> __('Payment history is synced form your stripe account since you started subscription.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-paymenthistoryurl',
					'label'					=> __('Learn more', 'esignbinding'),
					'description'		=> __('The URL to place on Learn more.', 'esignbinding'),
					'type'					=> 'url',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-changepassword',
					'label'					=> __('Payment History', 'esignbinding'),
					'description'		=> __('Change your password from here. This won\'t store on our database. Only encrypted password we store and make sure you\'ve saved your password on a safe place.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-changepasswordurl',
					'label'					=> __('Learn more', 'esignbinding'),
					'description'		=> __('The URL to place on Learn more.', 'esignbinding'),
					'type'					=> 'url',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-emailaddress',
					'label'					=> __('Email Address', 'esignbinding'),
					'description'		=> __('Email address required. Don\'t worry, we won\'t sent spam.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-emailaddressurl',
					'label'					=> __('Learn more', 'esignbinding'),
					'description'		=> __('The URL to place on Learn more.', 'esignbinding'),
					'type'					=> 'url',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-contactnumber',
					'label'					=> __('Contact Number', 'esignbinding'),
					'description'		=> __('Your conatct number is necessery in case if you need to communicate with you.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-contactnumberurl',
					'label'					=> __('Learn more', 'esignbinding'),
					'description'		=> __('The URL to place on Learn more.', 'esignbinding'),
					'type'					=> 'url',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-website',
					'label'					=> __('Website URL', 'esignbinding'),
					'description'		=> __('Give here you websute url if you have. Some case we might need to get idea about your and your company information.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'docs-websiteurl',
					'label'					=> __('Learn more', 'esignbinding'),
					'description'		=> __('The URL to place on Learn more.', 'esignbinding'),
					'type'					=> 'url',
					'default'				=> ''
				],
			]
		];
		$args['rest'] 		= [
			'title'							=> __('Rest API', 'esignbinding'),
			'description'				=> __('Setup what happened when a rest api request fired on this site.', 'esignbinding'),
			'fields'						=> [
				[
					'id' 						=> 'rest-createprofile',
					'label'					=> __('Create profile', 'esignbinding'),
					'description'		=> __('When a request email doesn\'t match any account, so will it create a new user account?.', 'esignbinding'),
					'type'					=> 'checkbox',
					'default'				=> true
				],
				[
					'id' 						=> 'rest-updateprofile',
					'label'					=> __('Update profile', 'esignbinding'),
					'description'		=> __('When a request email detected an account, so will it update profile with requested information?.', 'esignbinding'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 						=> 'rest-preventemail',
					'label'					=> __('Prevent Email', 'esignbinding'),
					'description'		=> __('Creating an account will send an email by default. Would you like to prevent sending email from rest request operation?', 'esignbinding'),
					'type'					=> 'checkbox',
					'default'				=> true
				],
				[
					'id' 						=> 'rest-defaultpass',
					'label'					=> __('Default Password', 'esignbinding'),
					'description'		=> __('The default password will be applied if any request contains emoty password or doesn\'t. Default value is random number.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
			]
		];
		$args['auth'] 		= [
			'title'							=> __('Social Auth', 'esignbinding'),
			'description'				=> __('Social anuthentication requeired provider API keys and some essential information. Claim them and setup here. Every API has an expiry date. So further if you face any problem with social authentication, make sure if api validity expired.', 'esignbinding'),
			'fields'						=> [
				[
					'id' 						=> 'auth-enable',
					'label'					=> __('Enable Social Authetication', 'esignbinding'),
					'description'		=> __('Mark this field to run social authentication. Once you disable from here, social authentication will be disabled from everywhere.', 'esignbinding'),
					'type'					=> 'checkbox',
					'default'				=> true
				],
				[
					'id' 						=> 'auth-google',
					'label'					=> __('Enable Google Authetication', 'esignbinding'),
					'description'		=> __('If you don\'t want to enable google authentication, you can disable this function from here.', 'esignbinding'),
					'type'					=> 'checkbox',
					'default'				=> true
				],
				[
					'id' 						=> 'auth-connectdrive',
					'label'					=> __('Connect with Google Drive?', 'esignbinding'),
					'description'		=> sprintf(__('Click on this %slink%s and allow access to connect with it.', 'esignbinding'), '<a href="'. site_url('/auth/drive/redirect/') . '" target="_blank">', '</a>'),
					'type'					=> 'textcontent'
				],
				[
					'id' 						=> 'auth-googleclientid',
					'label'					=> __('Google Client ID', 'esignbinding'),
					'description'		=> __('Your Google client or App ID, that you created for Authenticate.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'auth-googleclientsecret',
					'label'					=> __('Google Client Secret', 'esignbinding'),
					'description'		=> __('Your Google client or App Secret. Is required here.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'auth-googledrivefolder',
					'label'					=> __('Storage Folder ID', 'esignbinding'),
					'description'		=> __('ID of that specific folder where you want to sync files.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'auth-googleclientredirect',
					'label'					=> __('Google App Redirect', 'esignbinding'),
					'description'		=> __('Place this link on Google Auth Callback or Redirect field on your Google App.', 'esignbinding') . '<code>' . apply_filters('esign/project/socialauth/redirect', '/handle/google', 'google') . '</code>',
					'type'					=> 'textcontent'
				],
				[
					'id' 						=> 'auth-googleauthlink',
					'label'					=> __('Google Auth Link', 'esignbinding'),
					'description'		=> __('Use this link on your "Login with Google" button.', 'esignbinding') . '<code>' . apply_filters('esign/project/socialauth/link', '/auth/google', 'google') . '</code>',
					'type'					=> 'textcontent'
				],
			]
		];
		$args['social'] 		= [
			'title'							=> __('Social', 'esignbinding'),
			'description'				=> __('Setup your social links her for client dashboard only. Only people who loggedin, can access these social links.', 'esignbinding'),
			'fields'						=> [
				[
					'id' 						=> 'social-contact',
					'label'					=> __('Enable Contact', 'esignbinding'),
					'description'		=> __('Enable contact now tab on client dashboard.', 'esignbinding'),
					'type'					=> 'checkbox',
					'default'				=> true
				],
				[
					'id' 						=> 'social-telegram',
					'label'					=> __('Telegram', 'esignbinding'),
					'description'		=> __('Provide Telegram messanger link here.', 'esignbinding'),
					'type'					=> 'url',
					'default'				=> ''
				],
				[
					'id' 						=> 'social-whatsapp',
					'label'					=> __('WhatsApp', 'esignbinding'),
					'description'		=> __('Provide WhatsApp messanger link here.', 'esignbinding'),
					'type'					=> 'url',
					'default'				=> ''
				],
				[
					'id' 						=> 'social-email',
					'label'					=> __('Email', 'esignbinding'),
					'description'		=> __('Email address for instant support.', 'esignbinding'),
					'type'					=> 'email',
					'default'				=> ''
				],
				[
					'id' 						=> 'social-contactus',
					'label'					=> __('Contact Us', 'esignbinding'),
					'description'		=> __('Place the Contact Us page link here.', 'esignbinding'),
					'type'					=> 'url',
					'default'				=> ''
				],
			]
		];
		$args['signature'] 		= [
			'title'							=> __('E-Signature', 'esignbinding'),
			'description'				=> __('Setup e-signature plugin some customize settings from here. Four tags for Contract is given below.', 'esignbinding') . $this->contractTags(['{client_name}','{client_address}','{todays_date}','{retainer_amount}']),
			'fields'						=> [
				[
					'id' 						=> 'signature-addressplaceholder',
					'label'					=> __('Address Placeholder', 'esignbinding'),
					'description'		=> __('What shouldbe replace if address1 & address2 both are empty. If you leave it blank, then it\'ll be blank.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> 'N/A'
				],
				[
					'id' 						=> 'signature-dateformat',
					'label'					=> __('Date formate', 'esignbinding'),
					'description'		=> __('The date format which will apply on {{todays_date}} place.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> get_option('date_format')
				],
				[
					'id' 						=> 'signature-emptyrrtainer',
					'label'					=> __('Empty Retainer amount', 'esignbinding'),
					'description'		=> __('if anytime we found empty retainer amount, so what will be replace there?', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> 'N/A'
				],
				[
					'id' 						=> 'signature-defaultcontract',
					'label'					=> __('Default contract form', 'esignbinding'),
					'description'		=> __('When admin doesn\'t select a registration from before sending it to client, user is taken to this contract. It should be a page where a simple wp-form will apear with client name, service type, retainer amount if necessery.', 'esignbinding'),
					'type'					=> 'url',
					'default'				=> ''
				],
			]
		];
		$args['email'] 		= [
			'title'							=> __('E-Mail', 'esignbinding'),
			'description'				=> __('Setup email configuration here', 'esignbinding') . $this->contractTags(['{client_name}','{client_address}','{todays_date}','{retainer_amount}', '{registration_link}', '{{site_name}}', '{{passwordreset_link}}']),
			'fields'						=> [
				// [
				// 	'id' 						=> 'email-registationlink',
				// 	'label'					=> __('Registration Link', 'esignbinding'),
				// 	'description'		=> __('Registration link that contains WP-Form registration form.', 'esignbinding'),
				// 	'type'					=> 'text',
				// 	'default'				=> ""
				//],
				[
					'id' 						=> 'email-registationsubject',
					'label'					=> __('Subject', 'esignbinding'),
					'description'		=> __('The Subject, used on registration link sending mail.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> "Invitation to Register for [Event/Service/Product]"
				],
				[
					'id' 						=> 'email-sendername',
					'label'					=> __('Sender name', 'esignbinding'),
					'description'		=> __('Sender name that should be on mail metadata..', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> "Invitation to Register for [Event/Service/Product]"
				],
				[
					'id' 						=> 'email-registationbody',
					'label'					=> __('Registration link Template', 'esignbinding'),
					'description'		=> __('The template, used on registration link sending mail.', 'esignbinding'),
					'type'					=> 'textarea',
					'default'				=> "Dear [Name],\nWe are delighted to invite you to join us for [Event/Service/Product], a [brief description of event/service/product].\n[Event/Service/Product] offers [brief summary of benefits or features]. As a valued member of our community, we would like to extend a special invitation for you to be part of this exciting opportunity.\nTo register, simply click on the link below:\n[Registration link]\nShould you have any questions or require additional information, please do not hesitate to contact us at [contact information].\nWe look forward to seeing you at [Event/Service/Product].\nBest regards,\n[Your Name/Company Name]",
					'attr'					=> ['data-a-tinymce' => true]
				],
				[
					'id' 						=> 'email-passresetsubject',
					'label'					=> __('Password Reset Subject', 'esignbinding'),
					'description'		=> __('The email subject on password reset mail.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> __('Password Reset Request',   'esignbinding')
				],
				[
					'id' 						=> 'email-passresetbody',
					'label'					=> __('Password Reset Template', 'esignbinding'),
					'description'		=> __('The template, used on password reset link sending mail.', 'esignbinding'),
					'type'					=> 'textarea',
					'default'				=> "Dear {{client_name}},\n\nYou recently requested to reset your password for your {{site_name}} account. Please follow the link below to reset your password:\n\n{{passwordreset_link}}\n\nIf you did not make this request, you can safely ignore this email.\n\nBest regards,\n{{site_name}} Team"
				],
			]
		];
		$args['stripe'] 		= [
			'title'							=> __('Stripe', 'esignbinding'),
			'description'				=> __('Stripe payment system configuration process should be do carefully. Here some field is importent to work with no inturrupt. Such as API key or secret key, if it\'s expired on your stripe id, it won\'t work here. New user could face problem fo that reason.', 'esignbinding'),
			'fields'						=> [
				[
					'id' 						=> 'stripe-cancelsubscription',
					'label'					=> __('Cancellation', 'esignbinding'),
					'description'		=> __('Enable it to make a possibility to user to cancel subscription from client dashboard.', 'esignbinding'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 						=> 'stripe-publishablekey',
					'label'					=> __('Publishable Key', 'esignbinding'),
					'description'		=> __('The key which is secure, could import into JS, and is safe evenif any thirdparty got those code. Note that, secret key is not a publishable key.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'stripe-secretkey',
					'label'					=> __('Secret Key', 'esignbinding'),
					'description'		=> __('The secret key that never share with any kind of frontend functionalities and is ofr backend purpose. Is required.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 						=> 'stripe-currency',
					'label'					=> __('Currency', 'esignbinding'),
					'description'		=> __('Default currency which will use to create payment link.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> 'usd'
				],
				[
					'id' 						=> 'stripe-productname',
					'label'					=> __('Product name text', 'esignbinding'),
					'description'		=> __('A text to show on product name place on checkout sanbox.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> __('Subscription',   'esignbinding')
				],
				[
					'id' 						=> 'stripe-productdesc',
					'label'					=> __('Product Description', 'esignbinding'),
					'description'		=> __('Some text to show on product description field.', 'esignbinding'),
					'type'					=> 'text',
					'default'				=> __('Payment for',   'esignbinding') . ' ' . get_option('blogname', 'We Make Content')
				],
				[
					'id' 						=> 'stripe-productimg',
					'label'					=> __('Product Image', 'esignbinding'),
					'description'		=> __('A valid image url for product. If image url are wrong or image doesn\'t detect by stripe, process will fail.', 'esignbinding'),
					'type'					=> 'url',
					'default'				=> esc_url(ESIGNBINDING_ADDONS_BUILD_URI . '/icons/Online payment_Flatline.svg')
				],
				[
					'id' 						=> 'stripe-paymentmethod',
					'label'					=> __('Payment Method', 'esignbinding'),
					'description'		=> __('Select which payment method you will love to get payment.', 'esignbinding'),
					'type'					=> 'select',
					'default'				=> 'card',
					'options'				=> apply_filters('esign/project/payment/stripe/payment_methods', [])
				],
			]
		];
		$args['regis'] 		= [
			'title'							=> __('Registrations', 'esignbinding'),
			'description'				=> sprintf(__('Setup registration link and WP-forms information here. %s will replace with a unique number to avoid cache.', 'esignbinding'), '<code>{{nonce}}</code>'),
			'fields'						=> [
				[
					'id' 						=> 'regis-rows',
					'label'					=> __('Rows', 'esignbinding'),
					'description'		=> __('How many registration links do you have.', 'esignbinding'),
					'type'					=> 'number',
					'default'				=> 2
				],
			]
		];
		for($i = 1;$i <= apply_filters('esign/project/system/getoption', 'regis-rows', 3); $i++) {
			$args['regis']['fields'][] = [
				'id' 						=> 'regis-link-title-' . $i,
				'label'					=> __('Link title #' . $i, 'esignbinding'),
				'description'		=> '',
				'type'					=> 'text',
				'default'				=> 'Link #' . $i
			];
			$args['regis']['fields'][] = [
				'id' 						=> 'regis-link-url-' . $i,
				'label'					=> __('Link URL #' . $i, 'esignbinding'),
				'description'		=> '',
				'type'					=> 'url',
				'default'				=> ''
			];
			$args['regis']['fields'][] = [
				'id' 						=> 'regis-link-pageid-' . $i,
				'label'					=> __('Page ID#' . $i, 'esignbinding'),
				'description'		=> __('Registration Page ID, leave it blank if you don\'t want to disable it without invitation.', 'esignbinding'),
				'type'					=> 'text',
				'default'				=> ''
			];
		}
		$args['docs'] 		= [
			'title'							=> __('Documentations', 'esignbinding'),
			'description'				=> __('The workprocess is tring to explain here.', 'esignbinding'),
			'fields'						=> [
				[
					'id' 						=> 'auth-brifing',
					'label'					=> __('How to setup thank you page?', 'esignbinding'),
					'description'		=> sprintf(__('first go to %sthis link%s Create or Edit an "Stand Alone" document. Give your thankyou custom page link here %s', 'esignbinding'), '<a href="'. admin_url('admin.php?page=esign-docs&document_status=stand_alone') . '" target="_blank">', '</a>', '<img src="' . ESIGNBINDING_ADDONS_DIR_URI . '/docs/Stand-alone-esign-metabox.PNG' . '" alt="" />'),
					'type'					=> 'textcontent'
				],
			]
		];
		return $args;
	}
}

/**
 * {{client_name}}, {{client_address}}, {{todays_date}}, {{retainer_amount}}
 */
