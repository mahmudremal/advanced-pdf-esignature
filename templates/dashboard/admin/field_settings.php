<?php
/**
 * Custom field settings.
 * 
 * @package ESignBindingAddons
 */
?>


<fieldset id="gform-settings-section-flutterwave-payment" class="gform-settings-panel gform-settings-panel--with-title" data-style="display: none;">
  <legend class="gform-settings-panel__title gform-settings-panel__title--header">
    <?php esc_html_e( 'Flutterwave Payment', 'esignbinding' ); ?>
    <?php gform_tooltip( 'form_field_enable_card_payment_method' ); ?>
  </legend>
  <div class="gform-settings-panel__content">

    <div class="enable-card-payment-method">
      <input type="checkbox" id="field_enable_multiple_payment_methods" onclick="SetFieldProperty('enableCardPaymentMethod', this.checked);" onkeypress="SetFieldProperty('enableCardPaymentMethod', this.checked);" <?php echo checked(rgar($field,'enableCardPaymentMethod'), true); ?> />
      <label for="field_enable_multiple_payment_methods" class="inline">
          <?php esc_html_e( 'Enable multiple payment methods. Payer will be able to pay through card & direct checkout method.', 'esignbinding' ); ?>
          <?php gform_tooltip( 'form_alsocard' ); ?>
      </label>
      <input type="checkbox" id="field_flutterwave_default_mode" data-js="flutterwave_default_mode" onclick="SetFieldProperty('flutterwaveDefaultModeCard', this.checked);" onkeypress="SetFieldProperty('flutterwaveDefaultModeCard', this.checked);" <?php echo checked(rgar($field,'flutterwaveDefaultModeCard'), true); ?> />
      <label for="field_flutterwave_default_mode" class="inline">
          <?php esc_html_e( 'Set credit card as default selected method.', 'esignbinding' ); ?>
          <?php gform_tooltip( 'form_field_flutterwave_default_mode' ); ?>
      </label>
    </div>
    <!-- <div id="link_email_field_container" class="d-none">
        <label for="link_email_field" class="section_label">
            <?php esc_html_e( 'Link Email Field', 'esignbinding' ); ?>
        </label>
        <select id="link_email_field" data-js="link_email_field" class="inline">
            <?php echo implode( '', $options['email'] ); ?>
        </select>
    </div> -->
    <div class="mt-2">
        <input type="checkbox" id="field_enable_preview_field" data-js="enable_preview_field" onclick="SetFieldProperty('enablePreviewField', this.checked);" onkeypress="SetFieldProperty('enablePreviewField', this.checked);" <?php checked( rgar( $field, 'enablePreviewField' ), true ); ?> />
        <label for="field_enable_preview_field" class="inline">
            <?php esc_html_e( 'Show preview card', 'esignbinding' ); ?>
            <?php gform_tooltip( 'form_field_enable_card_payment_method' ); ?>
        </label>
    </div>
  
    <!-- <div id="gform_setting_enableFlutterwave" class="gform-settings-field gform-settings-field__toggle">
      <div class="gform-settings-field__header">
        <label class="gform-settings-label" for="enableFlutterwave">Enable flutterwave Payment</label>
		    <?php echo gform_tooltip('form_flutterwave', '', true); ?>
      </div>
      <span class="gform-settings-input__container">
        <input type="checkbox" data-js="_gform_setting_enableFlutterwave" id="_gform_setting_enableFlutterwave" value="1" checked="checked">
        <label class="gform-field__toggle-container" for="_gform_setting_enableFlutterwave" onclick="SetFieldProperty('enableFlutterwave', this.checked);" onkeypress="SetFieldProperty('enableFlutterwave', this.checked);" <?php echo checked(rgar($field,'enableFlutterwave'), true); ?> checked>
          <span class="gform-field__toggle-switch"></span>
        </label>
      </span>
    </div> -->

    <!-- <div id="gform_setting_enableCard" class="gform-settings-field gform-settings-field__checkbox">
      <div class="gform-settings-field__header">
        <label class="gform-settings-label" for="enableCard">Enable Card Payment</label>
        <?php echo gform_tooltip('form_alsocard', '', true); ?>
      </div>
      <span class="gform-settings-input__container">
        <input type="checkbox" id="description-enableCard" value="1" aria-describedby="description-enableCard" onchange="SetFieldProperty('enableCreditCard', this.checked);" onkeypress="SetFieldProperty('enableCreditCard', this.checked);" <?php checked(rgar($field,'enableCreditCard'), 1, true); ?> />
        <label for="description-enableCard" class="inline">
            <?php esc_html_e( 'Enable credit card payment as well.', 'esignbinding' ); ?>
            <?php gform_tooltip( 'form_field_enable_credit_card' ); ?>
        </label>
      </span>
    </div> -->

    <div class="gform_setting_subaccounts_card-body">
      <div id="gform_setting_subAccounts" class="gform-settings-field gform-settings-field__checkbox">
        <div class="gform-settings-field__header">
          <label class="gform-settings-label" for="subAccounts">Sub Accounts</label>
          <?php echo gform_tooltip('form_subaccounts', '', true); ?>
        </div>
        <span class="gform-settings-input__container">
          
          <?php $getSubAccounts = $this->gforms_sub_accounts(); ?>
          <?php if(count($getSubAccounts)<=0): ?>
            <div class="card">
              <p class="text-muted">
                <?php esc_html_e('Flutterwave sub-accounts not found. If you believe sub-accounts should be available, please contact the administrator for assistance.', 'esignbinding'); ?>
              </p>
            </div>
          <?php else: ?>
            <?php if(true): ?>
              <?php foreach(['client', 'partner', 'stuff'] as $type): ?>
                <div class="gform-settings-tab">
                  <div class="gform-settings-tab__header">
                    <span><?php echo esc_html(ucfirst($type).' subaccount'); ?></span>
                  </div>
                  <div class="gform-settings-tab__body">
                    <div id="gform-settings-select-subaccounts<?php echo esc_attr($type); ?>" class="gform-settings-select">
                      <label for="subaccounts-<?php echo esc_attr($type); ?>">
                        <span><?php esc_html_e('Select Account', 'esignbinding'); ?></span>
                      </label>
                      <select id="subaccounts-<?php echo esc_attr($type); ?>" onchange="SetFieldProperty('comissionAccount-<?php echo esc_attr($type); ?>', this.value);" onkeypress="SetFieldProperty('comissionAccount-<?php echo esc_attr($type); ?>', this.value);">
                        <?php foreach($getSubAccounts as $i => $subAC):
                          if(!isset($subAC['id'])) {continue;} ?>
                            <option value="<?php echo esc_attr($subAC['id']); ?>" <?php selected(rgar($field, 'comissionAccount-'.esc_attr($type)), $subAC['id'], true); ?>><?php echo esc_html($subAC['label']); ?></option>
                          <?php endforeach; ?>
                      </select>
                    </div>
                    <div id="gform_setting_comissionType" class="gform-settings-field gform-settings-field__radio">
                      <div class="gform-settings-field__header">
                        <label class="gform-settings-label" for="comissionType">Comission type</label>
                        <?php echo gform_tooltip('form_comissiontype', '', true); ?>
                      </div>
                      <span class="gform-settings-input__container">
                        <div id="gform-settings-radio-select-comissionType" class="gform-settings-select">
                          <select id="comissionType" onchange="SetFieldProperty('comissionType-<?php echo esc_attr($type); ?>', this.value);" onkeypress="SetFieldProperty('comissionType-<?php echo esc_attr($type); ?>', this.value);">
                            <option value="percentage" <?php selected(rgar($field,'comissionType-'.esc_attr($type)), 'percentage', true); ?>><?php esc_html_e('Percentage', 'esignbinding'); ?></option>
                            <option value="flatamount" <?php selected(rgar($field,'comissionType-'.esc_attr($type)), 'flatamount', true); ?>><?php esc_html_e('Flat amount', 'esignbinding'); ?></option>
                          </select>
                        </div>
                      </span>
                    </div>
                    <div id="gform_setting_comissionAmount" class="gform-settings-field gform-settings-field__text">
                      <div class="gform-settings-field__header">
                        <label class="gform-settings-label" for="comissionAmount-<?php echo esc_attr($type); ?>"><?php esc_html_e('Comission Percent', 'esignbinding'); ?></label>
                        <?php echo gform_tooltip('form_comissionamount', '', true); ?>
                      </div>
                      <span class="gform-settings-input__container">
                        <input type="text" id="comissionAmount-<?php echo esc_attr($type); ?>"  onchange="SetFieldProperty('comissionAmount-<?php echo esc_attr($type); ?>', this.value);" onkeypress="SetFieldProperty('comissionAmount-<?php echo esc_attr($type); ?>', this.value);" value="<?php echo esc_attr(rgar($field,'comissionAmount-'.esc_attr($type))); ?>">
                      </span>
                    </div>
                  </div>
                </div>
              <?php endforeach; ?>
            <?php else: ?>
              <?php foreach($getSubAccounts as $i => $subAC):
                if(!isset($subAC['value'])) {continue;} ?>
                <div id="gform-settings-checkbox-choice-subaccounts<?php echo esc_attr($subAC['value']); ?>" class="gform-settings-choice">
                  <input type="checkbox" data_format="bool" id="subaccounts<?php echo esc_attr($subAC['value']); ?>" data-js="<?php echo esc_attr($subAC['name']); ?>"  onchange="SetFieldProperty('<?php echo esc_attr($subAC['name']); ?>', this.checked);" onkeypress="SetFieldProperty('<?php echo esc_attr($subAC['name']); ?>', this.checked);" <?php echo checked(rgar($field, esc_attr($subAC['name'])), true); ?>>
                  <label for="subaccounts<?php echo esc_attr($subAC['value']); ?>">
                    <span><?php echo esc_html($subAC['label']); ?></span>
                  </label>
                </div>
              <?php endforeach; ?>
            <?php endif; ?>
          <?php endif; ?>


        </span>
      </div>
    </div>

    <div id="gform_setting_submitBtnText" class="gform-settings-field gform-settings-field__text">
      <div class="gform-settings-field__header">
        <label class="gform-settings-label" for="submitBtnText"><?php esc_html_e('Submit text', 'esignbinding'); ?></label>
        <?php echo gform_tooltip('form_submittext', '', true); ?>
      </div>
      <span class="gform-settings-input__container">
        <input type="text" data-js="_gform_setting_submitBtnText" id="submitBtnText"  onchange="SetFieldProperty('submitBtnText', this.value);" onkeypress="SetFieldProperty('submitBtnText', this.value);" value="<?php echo esc_attr(rgar($field, 'submitBtnText')); ?>">
      </span>
    </div>
    <div id="gform_setting_statusBtnLink" class="gform-settings-field gform-settings-field__radio">
      <div class="gform-settings-field__header">
        <label class="gform-settings-label" for="statusBtnLink"><?php esc_html_e('Button Link', 'esignbinding'); ?></label>
        <?php echo gform_tooltip('form_statusBtnLink', '', true); ?>
      </div>
      <span class="gform-settings-input__container">
        <div id="gform-settings-radio-select-statusBtnLink0" class="gform-settings-select">
          <select id="statusBtnLink" data-js="_gform_setting_statusBtnLink" onchange="SetFieldProperty('statusBtnLink', this.value);" onkeypress="SetFieldProperty('statusBtnLink', this.value);">
            <option value="home" <?php selected(rgar($field,'statusBtnLink'), 'home', true); ?>><?php esc_html_e('Home Page', 'esignbinding'); ?></option>
            <option value="form" <?php selected(rgar($field,'statusBtnLink'), 'form', true); ?>><?php esc_html_e('Form entry page', 'esignbinding'); ?></option>
          </select>
        </div>
      </span>
    </div>
    <div id="gform_setting_fluttercardMessage" class="gform-settings-field gform-settings-field__textarea">
      <div class="gform-settings-field__header">
        <label class="gform-settings-label" for="fluttercardMessage"><?php esc_html_e('Card message', 'esignbinding'); ?></label>
        <?php echo gform_tooltip('form_fluttercard_message', '', true); ?>
      </div>
      <span class="gform-settings-input__container">
        <textarea data-js="_gform_setting_fluttercardMessage" allow_html="1" default="You must calculate an amount to make pay and proceed. Currently calculated amount is zero or less then zero!" rows="4" editor_height="200" id="fluttercardMessage" onchange="SetFieldProperty('fluttercardMessage', this.value);" onkeypress="SetFieldProperty('fluttercardMessage', this.value);"><?php echo esc_textarea(rgar($field, 'fluttercardMessage')); ?></textarea>
      </span>
    </div>
    <div id="gform_setting_requireAmountMessage" class="gform-settings-field gform-settings-field__textarea">
      <div class="gform-settings-field__header">
        <label class="gform-settings-label" for="requireAmountMessage">Required Amount</label>
        <button onclick="return false;" onkeypress="return false;" class="gf_tooltip tooltip tooltip_form_require_amount_message" aria-label="<strong> Required Amount </strong> Give here a message that will show if form doesn't provide an amount to pay.">
          <i class="gform-icon gform-icon--question-mark" aria-hidden="true"></i>
        </button>
      </div>
      <span class="gform-settings-input__container">
        <textarea data-js="_gform_setting_requireAmountMessage" allow_html="1" default="You must calculate an amount to make pay and proceed. Currently calculated amount is zero or less then zero!" rows="4" editor_height="200" id="requireAmountMessage" onclick="SetFieldProperty('requireAmountMessage', this.checked);" onkeypress="SetFieldProperty('requireAmountMessage', this.checked);" <?php echo checked(rgar($field,'requireAmountMessage'), true); ?>>Require Amount</textarea>
      </span>
    </div>
  </div>
</fieldset>