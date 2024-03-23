<?php
/**
 * Theme Sidebars.
 *
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;
/**
 * Class Shortcode.
 */
class Shortcode {
	use Singleton;
	/**
	 * Construct method.
	 */
	protected function __construct() {
		$this->setup_hooks();
	}
	/**
	 * To register action/filter.
	 *
	 * @return void
	 */
	protected function setup_hooks() {
		/**
		 * Actions
		 */
		// add_shortcode('checkout_video', [$this, 'checkout_video']);
		add_shortcode('esign_unauthorized', [$this, 'esign_unauthorized']);
		add_shortcode('esign_unauthorized', [$this, 'esign_unauthorized']);
	}
	public function checkout_video($args) {}
	public function esign_unauthorized($args) {
		$args = wp_parse_args([
			// 
		], $args);
		ob_start();
		?>
		<div class="esign__unauthorized">
			<div class="esign__unauthorized__widget">
				<h2><?php echo esc_html(__('You are not Authorized to view this contract.', 'esignbinding')); ?></h2>
				<a class="btn button btn-default" href="<?php echo esc_url(home_url()); ?>"><?php echo esc_html(__('Back to home', 'esignbinding')); ?></a>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

}
