<?php
// single-esignatures.php - Custom template for single esignatures post

// Ensure that WordPress is loaded
defined('ABSPATH') || exit;
global $eSign_Esign;

get_header(); ?>

	<?php do_action('ocean_before_content_wrap'); ?>

	<div id="content-wrap" class="container clr">

		<?php do_action('ocean_before_primary'); ?>

		<div id="primary" class="content-area clr">

			<?php do_action('ocean_before_content'); ?>

			<div id="content" class="site-content clr">

				<?php do_action('ocean_before_content_inner'); ?>

				<?php
				// Elementor `single` location.
				if ( ! function_exists('elementor_theme_do_location') || ! elementor_theme_do_location('single') ) {

					// Start loop.
					while ( have_posts() ) :
						the_post();

						// get_template_part('partials/page/layout');

						if ($eSign_Esign->is_authorized_signer(get_the_ID())) :
							
							$eSing = get_post_meta(get_the_ID(), '__esign_builder', true);
							if (!$eSing || !isset($eSing['pdf']) || empty($eSing['pdf'])) {continue;}
							if (isset($eSing['pdf'])) {
								$eSing['pdf'] = preg_replace("/^http:/i", "https:", $eSing['pdf']);
							}
							$eSign_Esign->print_assets();
							// $eSing['pdf'] = 'https://sci-bono.org/wp-content/uploads/2024/03/How-to-Make-People-like-You-in-90-Seconds-or-Less.pdf';
							?>
							<canvas id="preview_contract" data-contract="<?php echo esc_url($eSing['pdf']); ?>" width="800" height="1200"></canvas>
							<?php
						else :
							echo do_shortcode(apply_filters('esign/project/system/getoption', 'signature-unauthorized', '[esign_unauthorized]'));
						endif;
					endwhile;

				}
				?>

				<?php do_action('ocean_after_content_inner'); ?>

			</div><!-- #content -->

			<?php do_action('ocean_after_content'); ?>

		</div><!-- #primary -->

		<?php do_action('ocean_after_primary'); ?>

	</div><!-- #content-wrap -->

	<?php do_action('ocean_after_content_wrap'); ?>

<?php get_footer(); ?>
