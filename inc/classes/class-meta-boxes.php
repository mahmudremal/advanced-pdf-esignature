<?php
/**
 * Register Meta Boxes
 *
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;
/**
 * Class Meta_Boxes
 */
class Meta_Boxes {
	use Singleton;
	protected function __construct() {
		// load class.
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		/**
		 * Actions.
		 */
		add_action('add_meta_boxes', [$this, 'add_custom_meta_box']);
		// add_action('save_post', [$this, 'save_post_meta_data']);
	}
	/**
	 * Add custom meta box.
	 *
	 * @return void
	 */
	public function add_custom_meta_box() {
		$screens = ['esignatures'];
		foreach ($screens as $screen) {
			add_meta_box(
				'esignature_builder_metabox',           				// Unique ID
				__('ESignature', 'esignbinding'),  					// Box title
				[$this, 'custom_meta_box_html'],  					// Content callback, must be of type callable
				$screen,                   								// Post type
				'advanced',                   							// context
				'high'													// priority
			);
		}
	}
	/**
	 * Custom meta box HTML(for form)
	 *
	 * @param object $post Post.
	 *
	 * @return void
	 */
	public function custom_meta_box_html($post) {
		global $eSign_Esign;
		$json = ['id' => $post->ID];
		$eSing = get_post_meta(get_the_ID(), '__esign_builder', true);
		// if (!$eSing || !isset($eSing['pdf']) || empty($eSing['pdf'])) {return;}
		if (isset($eSing['pdf'])) {
			$eSing['pdf'] = preg_replace("/^http:/i", "https:", $eSing['pdf']);
		}
		$eSign_Esign->print_assets();
		?>
		<div class="fwp__esign">
			<div class="fwp__esign__header">
				<button type="button" class="launch-esignature" data-config="<?php echo esc_attr(json_encode($json)); ?>"><?php esc_html_e('Open Signature Builder', 'esignbinding'); ?></button>
			</div>
			<div class="fwp__esign__body">
				<canvas id="preview_contract" data-contract="<?php echo (isset($eSing['pdf']) && !empty($eSing['pdf']))?esc_url($eSing['pdf']):''; ?>" width="800" height="1200" data-config="<?php echo esc_attr(json_encode($json)); ?>"></canvas>
			</div>
			<div class="fwp__esign__footer"></div>
		</div>
		<script type="module">import * as scrawl from "https://unpkg.com/scrawl-canvas@8.12.0";window.scrawl = scrawl;</script>
		<?php
	}
	/**
	 * Save post meta into database
	 * when the post is saved.
	 *
	 * @param integer $post_id Post id.
	 *
	 * @return void
	 */
	public function save_post_meta_data($post_id) {
		/**
		 * When the post is saved or updated we get $_POST available
		 * Check if the current user is authorized
		 */
		if (! current_user_can('edit_post', $post_id)) {
			return;
		}
		/**
		 * Check if the nonce value we received is the same we created.
		 */
		if (! isset($_POST['hide_title_meta_box_nonce_name']) ||
		     ! wp_verify_nonce($_POST['hide_title_meta_box_nonce_name'], plugin_basename(__FILE__))
		) {
			return;
		}
		if (array_key_exists('aquila_hide_title_field', $_POST)) {
			update_post_meta(
				$post_id,
				'_hide_page_title',
				$_POST['aquila_hide_title_field']
			);
		}
	}
}
