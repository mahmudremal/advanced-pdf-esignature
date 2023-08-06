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

	public function register_esignature_endpoint() {
		add_rewrite_endpoint('esignature', EP_PAGES);
	}
	public function woocommerce_account_menu_items($items, $endpoints) {
		$items['esignature'] = __('eSignature', 'domain');
		return $items;
	}
	public function woocommerce_account_esignature_endpoint() {
		global $wpdb;
		$lists = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT ID, post_title, post_date FROM $wpdb->posts WHERE post_status=%s AND post_type=%s ORDER BY ID DESC LIMIT 0, 100;",
				'publish', 'esignatures'
			)
		);
		// print_r($lists);
		?>
		<link rel="stylesheet" href="https://github.hubspot.com/vex/dist/css/vex.css" />
		<link rel="stylesheet" href="https://github.hubspot.com/vex/dist/css/vex-theme-os.css" />
		<!-- <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script> -->
		<link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
		<table id="my-signature-templates" class="display" width="100%"></table>
		<script>
			<?php
			$data = [];
			foreach($lists as $i => $row) {
				$data[] = [
					($i + 1), $row->post_title,
					wp_date('M d, Y', strtotime($row->post_date)),
					sprintf('%s%s%s', '<span class="bg-success p-2 text-light rounded">', __('Important', 'domain'), '</span>'),
					sprintf('%s%s%s', '<span class="bg-danger p-2 text-light rounded">', __('Pending', 'domain'), '</span>'),
					sprintf('%s%s%s', '<button class="bg-default p-1 rounded fwp-launch-esignature-builder" data-config="'.esc_attr(json_encode(['id' => $row->ID])).'" type="button">', __('Launch', 'domain'), '</button>')
				];
			}
			$datatable = [
				'columns' => [
					['title' => __('SL', 'domain')],
					['title' => __('Title', 'domain')],
					['title' => __('Date', 'domain')],
					['title' => __('Priority', 'domain')],
					['title' => __('Status', 'domain')],
					['title' => __('Action', 'domain')]
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
