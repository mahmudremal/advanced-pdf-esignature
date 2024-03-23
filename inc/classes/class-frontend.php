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
		$lists = $eSign_Esign->get_user_contracts();
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
