<?php
/**
 * This plugin ordered by a client and done by Remal Mahmud (fiverr.com/mahmud_remal). Authority dedicated to that cient.
 *
 * @wordpress-plugin
 * Plugin Name:       Advanced PDF E-Signature
 * Plugin URI:        https://github.com/mahmudremal/advanced-pdf-esignature/
 * Description:       Integrated Electronic signature with WordPress CMS, email notifications, email template custmizations and customized featured with users signers. Leatest version capabilities, mobile friendly, easy to use and on-click singning capabilities.
 * Version:           1.0.0
 * Requires at least: 5.2
 * Requires PHP:      7.2
 * Author:            Remal Mahmud
 * Author URI:        https://github.com/mahmudremal/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       esignbinding
 * Domain Path:       /languages
 * 
 * @package ESignBindingAddons
 * @author  Remal Mahmud (https://github.com/mahmudremal)
 * @version 1.0.2
 * @link https://github.com/mahmudremal/advanced-pdf-esignature/
 * @category	WordPress Plugin
 * @copyright	Copyright (c) 2024-26
 * 
 * 
 * webdevayon
 * @Webdevayon#.12321
 * 
 */

/**
 * Bootstrap the plugin.
 */

defined('ESIGNBINDING_ADDONS__FILE__') || define('ESIGNBINDING_ADDONS__FILE__',untrailingslashit(__FILE__));
defined('ESIGNBINDING_ADDONS_DIR_PATH') || define('ESIGNBINDING_ADDONS_DIR_PATH',untrailingslashit(plugin_dir_path(ESIGNBINDING_ADDONS__FILE__)));
defined('ESIGNBINDING_ADDONS_DIR_URI') || define('ESIGNBINDING_ADDONS_DIR_URI',untrailingslashit(plugin_dir_url(ESIGNBINDING_ADDONS__FILE__)));
defined('ESIGNBINDING_ADDONS_BUILD_URI') || define('ESIGNBINDING_ADDONS_BUILD_URI',untrailingslashit(ESIGNBINDING_ADDONS_DIR_URI).'/assets/build');
defined('ESIGNBINDING_ADDONS_BUILD_PATH') || define('ESIGNBINDING_ADDONS_BUILD_PATH',untrailingslashit(ESIGNBINDING_ADDONS_DIR_PATH).'/assets/build');
defined('ESIGNBINDING_ADDONS_BUILD_JS_URI') || define('ESIGNBINDING_ADDONS_BUILD_JS_URI',untrailingslashit(ESIGNBINDING_ADDONS_DIR_URI).'/assets/build/js');
defined('ESIGNBINDING_ADDONS_BUILD_JS_DIR_PATH') || define('ESIGNBINDING_ADDONS_BUILD_JS_DIR_PATH',untrailingslashit(ESIGNBINDING_ADDONS_DIR_PATH).'/assets/build/js');
defined('ESIGNBINDING_ADDONS_BUILD_IMG_URI') || define('ESIGNBINDING_ADDONS_BUILD_IMG_URI',untrailingslashit(ESIGNBINDING_ADDONS_DIR_URI).'/assets/build/src/img');
defined('ESIGNBINDING_ADDONS_BUILD_CSS_URI') || define('ESIGNBINDING_ADDONS_BUILD_CSS_URI',untrailingslashit(ESIGNBINDING_ADDONS_DIR_URI).'/assets/build/css');
defined('ESIGNBINDING_ADDONS_BUILD_CSS_DIR_PATH') || define('ESIGNBINDING_ADDONS_BUILD_CSS_DIR_PATH',untrailingslashit(ESIGNBINDING_ADDONS_DIR_PATH).'/assets/build/css');
defined('ESIGNBINDING_ADDONS_BUILD_LIB_URI') || define('ESIGNBINDING_ADDONS_BUILD_LIB_URI',untrailingslashit(ESIGNBINDING_ADDONS_DIR_URI).'/assets/build/library');
defined('ESIGNBINDING_ADDONS_ARCHIVE_POST_PER_PAGE') || define('ESIGNBINDING_ADDONS_ARCHIVE_POST_PER_PAGE',9);
defined('ESIGNBINDING_ADDONS_SEARCH_RESULTS_POST_PER_PAGE') || define('ESIGNBINDING_ADDONS_SEARCH_RESULTS_POST_PER_PAGE',9);
defined('ESIGNBINDING_ADDONS_OPTIONS') || define('ESIGNBINDING_ADDONS_OPTIONS', get_option('flutterwaveaddons', []));
defined('ESIGNBINDING_ADDONS_TEST_MODE') || define('ESIGNBINDING_ADDONS_TEST_MODE', (bool)(isset(ESIGNBINDING_ADDONS_OPTIONS['testMode']) && ESIGNBINDING_ADDONS_OPTIONS['testMode']));

require_once ESIGNBINDING_ADDONS_DIR_PATH . '/inc/helpers/autoloader.php';
// require_once ESIGNBINDING_ADDONS_DIR_PATH . '/inc/helpers/template-tags.php';


try {
	if(!function_exists('electronicdocumentsigningandmanagement_plugin_instance')) {
		function electronicdocumentsigningandmanagement_plugin_instance() {\ESIGNBINDING_ADDONS\Inc\Project::get_instance();}
		electronicdocumentsigningandmanagement_plugin_instance();
	}
} catch (\Exception $e) {
	// echo "Exception: " . $e->getMessage();
} catch (\Error $e) {
	// echo "Error: " . $e->getMessage();
} finally {
	// Optional code that always runs
	// echo "Finally block executed.";
}


