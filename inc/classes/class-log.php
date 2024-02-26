<?php
/**
 * LoadmorePosts
 *
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;
class Log {
	use Singleton;
	private $logs;
	protected function __construct() {
		// load class.
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		add_option('init', [$this, 'init'], 1, 0);
		add_filter('esign/project/logs/add', [$this, 'logsAdd'], 1, 2);
		add_filter('esign/project/logs/clean', [$this, 'logsClean'], 1, 2);
	}
	public function init() {
		$this->logs = get_option('esign/project/logs', []);
	}
	public function logsAdd($return, $args) {
		$this->logsUpdate();
	}
	private function logsUpdate() {
		update_option('esign/project/logs', $this->logs);
	}
	private function logsClean() {
		update_option('esign/project/logs', []);
	}
}
