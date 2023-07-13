<?php
/**
 * Custom template tags for the theme.
 *
 * @package ESignBindingAddons
 */
if( ! function_exists( 'is_FwpActive' ) ) {
  function is_FwpActive( $opt ) {
    if( ! defined( 'ESIGNBINDING_ADDONS_OPTIONS' ) ) {return false;}
    return ( isset( ESIGNBINDING_ADDONS_OPTIONS[ $opt ] ) && ESIGNBINDING_ADDONS_OPTIONS[ $opt ] == 'on' );
  }
}
if( ! function_exists( 'get_FwpOption' ) ) {
  function get_FwpOption( $opt, $def = false ) {
    if( ! defined( 'ESIGNBINDING_ADDONS_OPTIONS' ) ) {return false;}
    return isset( ESIGNBINDING_ADDONS_OPTIONS[ $opt ] ) ? ESIGNBINDING_ADDONS_OPTIONS[ $opt ] : $def;
  }
}