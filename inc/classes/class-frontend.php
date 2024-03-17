<?php
/**
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;

class Frontend {
	use Singleton;
	/**
	 * Constructor
	 */
	public function __construct() {
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		add_filter('template_include', [$this, 'load_esignature_template'], 10, 1);

		add_action('init', [$this, 'register_esignature_endpoint']);
		add_filter('woocommerce_account_menu_items', [$this, 'woocommerce_account_menu_items'], 10, 2);
		add_action('woocommerce_account_esignature_endpoint', [$this, 'woocommerce_account_esignature_endpoint'], 10, 0);
		add_shortcode('esignatures', [$this, 'esignatures']);
	}
	public function load_esignature_template($template) {
		if(is_singular('esignatures')) {
			$custom_template = untrailingslashit(ESIGNBINDING_ADDONS_DIR_PATH).'/templates/single-esignatures.php';
			if(file_exists($custom_template)) {
				return $custom_template;
			}
		}
		return $template;
	}
	public function esignatures($args) {
		ob_start();
		$this->woocommerce_account_esignature_endpoint();
		return ob_get_clean();
	}

	public function register_esignature_endpoint() {
		add_rewrite_endpoint('esignature', EP_PAGES);
	}
	public function woocommerce_account_menu_items($items, $endpoints) {
		$items['esignature'] = __('eSignature', 'esignbinding');
		return $items;
	}
	public function woocommerce_account_esignature_endpoint() {
		global $wpdb;global $eSign_Ajax;global $eSign_Esign;
		$signings = [];

		$_all_posts = get_posts([
			'fields'			=> 'ids',
			'posts_per_page'	=> -1,
			'post_type'			=> 'esignatures',
			'post_status'		=> 'publish',
			'order'				=> 'DESC'
		]);
		foreach($_all_posts as $_post_id) {
			$signers = $eSign_Ajax->get_all_users_for_this_sign($_post_id);
			// $signers = array_map(function($signer) {return (array) $signer;}, $signers);
			// $signer_exists = array_search(get_current_user_id(), array_column($signers, '_user'));
			$signer_exists = false;
			foreach($signers as $signer) {
				if($signer->_user == get_current_user_id()) {
					$signer_exists = true;
				}
			}
			
			if($signer_exists) {$signings[] = $_post_id;}
		}
		$signings = implode(',', $signings);
		$lists = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT ID, post_title, post_date FROM $wpdb->posts WHERE post_status=%s AND post_type=%s AND ID IN ($signings) ORDER BY ID DESC LIMIT 0, 100;",
				'publish', 'esignatures'
			)
		);
		// print_r($lists);
		$eSign_Esign->print_assets();
		?>
		
		<table id="my-signature-templates" class="display" width="100%"></table>
		<script>
			<?php
			$data = [];
			foreach($lists as $i => $row) {
				$data[] = [
					($i + 1), $row->post_title,
					wp_date('M d, Y', strtotime($row->post_date)),
					sprintf('%s%s%s', '<span class="bg-success p-2 text-light rounded">', __('Important', 'esignbinding'), '</span>'),
					sprintf('%s%s%s', '<span class="bg-danger p-2 text-light rounded">', __('Pending', 'esignbinding'), '</span>'),
					sprintf('%s%s%s', '<button class="bg-default p-1 rounded launch-esignature" data-config="'.esc_attr(json_encode(['id' => $row->ID])).'" type="button">', __('Launch', 'esignbinding'), '</button>') . 
					sprintf('%s%s%s', '<a class="bg-default p-1 rounded linked-esignature" href="' . get_the_permalink($row->ID) . '" target="_blank">', __('Launch', 'esignbinding'), '</a>')
				];
			}
			$datatable = [
				'columns' => [
					['title' => __('SL', 'esignbinding')],
					['title' => __('Title', 'esignbinding')],
					['title' => __('Date', 'esignbinding')],
					['title' => __('Priority', 'esignbinding')],
					['title' => __('Status', 'esignbinding')],
					['title' => __('Action', 'esignbinding')]
				],
				'data' => $data
			];
			?>
			window.do_datatable = [];
			window.do_datatable.push([
				'#my-signature-templates', <?php echo json_encode($datatable); ?>
			]);
		</script>
		<?PHP
	}

}
