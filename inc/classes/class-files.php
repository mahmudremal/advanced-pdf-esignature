<?php
/**
 * Upload and managing attachments and files on file system.
 *
 * @package ESignBindingAddons
 */
namespace ESIGNBINDING_ADDONS\Inc;
use ESIGNBINDING_ADDONS\Inc\Traits\Singleton;

class Files {
	use Singleton;
	private $path;
	private $pathDirName;
	protected function __construct() {
		// load class.
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		$this->pathDirName = 'esign';
		$this->path			= true;
		$this->has_created_dir();
		add_action('wp_ajax_esign/project/filesystem/upload', [$this, 'filesystemUpload']);
		add_action('wp_ajax_esign/project/filesystem/remove', [$this, 'filesystemRemove']);
	}
	public function has_created_dir() {
		$upload_dir = wp_upload_dir();
		if (!empty($upload_dir['basedir'])) {
			$this->path = $upload_dir['basedir'] . '/' . $this->pathDirName;
			if (!file_exists($this->path) || !is_dir($this->path)) {wp_mkdir_p($this->path);}
		}
	}
	public function filesystemUpload() {
		do_action('esign/project/nonce/verify', false, true);
		$json = ['hooks' => ['file_upload_failed'], 'files' => []];
		// 
		$_files = isset($_FILES['files'])?$_FILES['files']:false;
		if ($_files) {
			foreach ($_files['name'] as $index => $file) {
				$source			= $_files['tmp_name'][$index];
				$destination	= trailingslashit($this->path) . $_files['name'][$index];
				$queryInfo		= [
					'success'			=> false,
					'time'				=> time(),
					// 'source'			=> $source,
					'destination'		=> $destination,
					'full_url'			=> str_replace([ABSPATH], [''], $destination),
				];
				// 
				if (
					move_uploaded_file($source, $destination)
				) {
					$queryInfo['success'] = true;
					$queryInfo['message'] = sprintf('File (%s) uploaded successfully!', pathinfo($destination, PATHINFO_BASENAME));
				}
				$json['files'][$index] = $queryInfo;
			}
		}
		wp_send_json_success($json);
	}
	public function filesystemRemove() {
		do_action('esign/project/nonce/verify', false, true);
		// 
	}

}
