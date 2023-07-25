/**
 * Propmts popup.
 */
// import { PDFDocument, rgb, degrees, SVGPath, drawSvgPath, StandardFonts } from 'pdf-lib';
import PDFJSExpress from "@pdftron/pdfjs-express";
import { initDragAndDropFeature, previewPDFile } from './pdfUtils';
import interact from 'interactjs';


const PROMPTS = {
    i18n: {},
    get_template: (thisClass) => {
        var json, html;
        html = document.createElement('div');html.classList.add('dynamic_popup');
        if(PROMPTS.lastJson) {
            html.innerHTML = PROMPTS.generate_template(thisClass);
        } else {
            html.innerHTML = `<div class="spinner-material"></div><h3>${thisClass.i18n?.pls_wait??'Please wait...'}</h3>`;
        }
        return html;
    },

    generate_field_upload: (thisClass) => {
        var node, title, subtitle, texts, upload;
    },




    init_individualFields: (thisClass) => {
        var fields, card, single, handle;
        PROMPTS.dropZoneHTML = `
            <div class="upload-pdf">
                <div class="pdf-dropzone">
                    <form class="pdf-dropzone__form needsclick" action="/upload">
                    <div class="dz-message needsclick">
                        <h1 class="svelte-12uhhij">${PROMPTS.i18n?.upload_pdf??'Upload PDF'}</h1>
                        <p>${PROMPTS.i18n?.dropdf_subtitle??'Drop PDF document here or click to upload.'}<p>
                        <span class="note needsclick">${PROMPTS.i18n?.upload_pdf_details??'PDF file will generate a preview and you\'ll be forwarded to Signature builder screen.'}</span>
                    </div>
                    </form>
                </div>
            </div>
        `;
        fields = PROMPTS.get_custom_fields(thisClass);
        PROMPTS.esignEditorHTML = `
            <div class="pdf_builder__row">
                <div class="pdf_builder__builder">
                    <div id="signature-builder" class="esign-body"></div>
                    <button class="btn btn-primary pull-right">${PROMPTS.i18n?.save??'Save'}</button>
                </div>
                <div class="pdf_builder__fields">
                    <div class="pdf_builder__fields__grid">
                        <h3>${PROMPTS.i18n?.custmfields_title??'Field widgets'}</h3>
                        <p>${PROMPTS.i18n?.custmfields_subtitle??'Drag & Drop each fields on the desired location and select necessery data to make it functional.'}</p>
                        <div id="signature-modules" class="esign-fields">
                            ${fields.map((row, index) => {
                                single = document.createElement('div');single.classList.add('esign-fields__single');
                                handle = document.createElement('div');handle.classList.add('esign-fields__handle');
                                handle.dataset.config = JSON.stringify({id: row.id, title: row.title});handle.innerHTML = row.title;handle.dataset.index = index;
                                single.appendChild(handle);card = document.createElement('div');card.appendChild(single);
                                return card.innerHTML;
                            }).join('')}
                        </div>
                    </div>
                    <div class="pdf_builder__fields__settings"></div>
                </div>

            </div>
        `;
    },
    init_prompts: (thisClass) => {
        PROMPTS.core = thisClass;
    },
    init_events: (thisClass) => {
        document.querySelectorAll('.popup_foot .button[data-react]').forEach((el) => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                switch (el.dataset.react) {
                    case 'back':
                        PROMPTS.do_pagination(false, thisClass);
                        break;
                    default:
                        PROMPTS.do_pagination(true, thisClass);
                        break;
                }
            });
        });
        document.querySelectorAll('.toggle-password:not([data-handled])').forEach((el) => {
            el.dataset.handled = true;
            el.addEventListener('click', (event) => {
                event.preventDefault();
                var icon = (el.childNodes && el.childNodes[0])?el.childNodes[0]:false;
                if(!icon) {return;}
                switch (icon.classList.contains('fa-eye')) {
                    case false:
                        el.previousSibling.type = 'password';
                        icon.classList.add('fa-eye');
                        icon.classList.remove('fa-eye-slash');
                        break;
                    default:
                        el.previousSibling.type = 'text';
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                        break;
                }
            });
        });
        document.querySelectorAll('.form-control[name="field.9000"]:not([data-handled])').forEach((input)=>{
            input.dataset.handled = true;
            let awesomplete = new Awesomplete(input, {
                minChars: 3,
                maxItems: 5,
                autoFirst: true,
                // list: suggestions
            });
            input.addEventListener('input', function() {
                const query = input.value;
                let keyword = document.querySelector('#keyword_search');
                keyword = (keyword)?keyword.value:'';
                // Make the AJAX request to fetch suggestions
                fetch(thisClass.ajaxUrl + '?action=esign/project/teddybearpopupaddon/action/get_autocomplete&term=location&query='+encodeURIComponent(query)+'&keyword='+encodeURIComponent(keyword))
                  .then(response => response.json())
                  .then(data => {
                    awesomplete.list = (data?.data??data).map((row)=>row?.name??row); // Update the suggestions list
                  })
                  .catch(error => {
                    console.error('Error fetching suggestions:', error);
                  });
            });
        });
        document.querySelectorAll('.popup_close:not([data-handled])').forEach((el)=>{
            el.dataset.handled = true;
            el.addEventListener('click', (event)=>{
                event.preventDefault();
                if(confirm(thisClass.i18n?.rusure2clspopup??'Are you sure you want to close this popup?')) {
                    thisClass.Swal.close();
                }
            });
        });

        document.querySelectorAll('.dynamic_popup').forEach((popup)=>{
            if(popup) {
                var fields = document.querySelector('.tc-extra-signature-options.tm-extra-signature-options');
                if(!fields) {return;}
                if(!document.querySelector('.tc-extra-signature-options-parent')) {
                    var node = document.createElement('div');
                    node.classList.add('tc-extra-signature-options-parent');
                    fields.parentElement.insertBefore(node, fields);
                }
                popup.innerHTML = '';popup.appendChild(fields);// jQuery(fields).clone().appendTo(popup);
                
                setTimeout(() => {
                    popup.querySelectorAll('[id]').forEach((el)=>{el.id = el.id+'_popup';});
                    popup.querySelectorAll('label[for]').forEach((el)=>{el.setAttribute('for', el.getAttribute('for')+'_popup');});
                }, 200);

                document.querySelectorAll('.dynamic_popup .tm-collapse').forEach((el)=>{
                    var head = el.firstChild;var body = el.querySelector('.tm-collapse-wrap');
                    head.classList.remove('toggle-header-closed');head.classList.add('toggle-header-open');
                    head.querySelector('.tcfa.tm-arrow').classList.add('tcfa-angle-up');
                    head.querySelector('.tcfa.tm-arrow').classList.remove('tcfa-angle-down');
                    body.classList.remove('closed');body.classList.add('open', 'tm-animated', 'fadein');
                });
            }
        });
        document.querySelectorAll('.dynamic_popup input[type="checkbox"], .dynamic_popup input[type="radio"]').forEach((el)=>{
            el.addEventListener('click', (event)=>{
                if(el.parentElement) {
                    if(el.parentElement.classList.contains('form-control-checkbox__image')) {
                        if(el.checked) {
                            el.parentElement.classList.add('checked_currently');
                        } else {
                            el.parentElement.classList.remove('checked_currently');
                        }
                    } else if(el.parentElement.classList.contains('form-control-radio__image')) {
                        if(el.checked) {
                            document.querySelectorAll('input[name="'+el.name+'"]').forEach((radio)=>{
                                radio.parentElement.classList.remove('checked_currently');
                            });
                            el.parentElement.classList.add('checked_currently');
                        }
                    } else {}
                }
            });
        });


        PROMPTS.init_drag_n_drop(thisClass);
        PROMPTS.init_pdf_dropzone(thisClass);
        
        PROMPTS.currentStep=0;PROMPTS.do_pagination(true, thisClass);
    },
    generate_template: (thisClass) => {
        var json, html;
        json = PROMPTS.lastJson;
        html = '';
        html += (json.header)?`
            ${(json.header.signature_photo)?`<div class="header_image" style="background-image: url('${json.header.signature_photo}');"></div>`:''}
        `:'';
        html += PROMPTS.generate_fields(thisClass);
        return html;
    },
    generate_fields: (thisClass) => {
        var fields = PROMPTS.get_data(thisClass);
        PROMPTS.init_individualFields(thisClass);
        // if(!fields && (thisClass.config?.buildPath??false)) {
        //     return '<img src="'+thisClass.config.buildPath+'/icons/undraw_file_bundle_re_6q1e.svg">';
        // }
        return PROMPTS.generate_builder(thisClass);

        // On the previous Way.
        var div = PROMPTS.generate_fields__(thisClass, fields);return div.innerHTML;
    },
    generate_fields__: (thisClass, fields) => {
        var div, node, step, foot, btn, back, close, prices;
        close = document.createElement('div');close.classList.add('popup_close', 'fa', 'fa-times');
        div = document.createElement('div');node = document.createElement('form');
        node.action=thisClass.ajaxUrl;node.type='post';node.classList.add('popup_body');
        fields.forEach((field, i) => {
            step = PROMPTS.do_field(field);i++;
            step.dataset.step = field.fieldID;
            node.appendChild(step);
            PROMPTS.totalSteps=(i+1);
        });
        foot = document.createElement('div');foot.classList.add('popup_foot');

        back = document.createElement('button');back.classList.add('btn', 'btn-default', 'button');
        back.type='button';back.dataset.react = 'back';back.innerHTML=thisClass.i18n?.back??'Back';
        foot.appendChild(back);
        
        prices = document.createElement('div');prices.classList.add('calculated-prices');
        prices.innerHTML=`<span>${thisClass.i18n?.total??'Total'}</span><div class="price_amount">${(thisClass.prompts.lastJson && thisClass.prompts.lastJson.signature && thisClass.prompts.lastJson.signature.priceHtml)?thisClass.prompts.lastJson.signature.priceHtml:'0.00'}</div>`;
        foot.appendChild(prices);
        
        btn = document.createElement('button');btn.classList.add('btn', 'btn-primary', 'button');
        btn.type='button';btn.dataset.react='continue';
        btn.innerHTML=`<span>${thisClass.i18n?.continue??'Continue'}</span><div class="spinner-circular-tube"></div>`;
        foot.appendChild(btn);
        
        div.appendChild(close);div.appendChild(node);div.appendChild(foot);
        return div;
    },
    str_replace: (str) => {
        var data = PROMPTS.lastJson,
        searchNeedles = {'signature.name': data.signature.name};
        Object.keys(searchNeedles).forEach((needle)=> {
            str = str.replaceAll(`{{${needle}}}`, searchNeedles[needle]);
        });
        return str;
    },
    get_data: (thisClass) => {
        var fields = PROMPTS.lastJson.signature.custom_fields;
        if(!fields || fields=='') {return false;}
        fields.forEach((row, i) => {row.orderAt = (i+1);});
        return fields;
    },
    do_field: (field, child = false) => {
        var fields, form, group, fieldset, input, level, span, option, head, image, others, body, div, info, i = 0;
        div = document.createElement('div');if(!child) {div.classList.add('popup_step', 'd-none');}
        head = document.createElement('h2');head.innerHTML=PROMPTS.str_replace(field?.heading??'');
        div.appendChild(head);
        if((field?.subtitle??'')!='') {
            info = document.createElement('p');
            info.innerHTML=PROMPTS.str_replace(field?.subtitle??'');
            div.appendChild(info);
        }
        
        input = level = false;
        fieldset = document.createElement('fieldset');
        level = document.createElement('level');
        level.innerHTML = PROMPTS.str_replace(field?.label??'');
        level.setAttribute('for',`field_${field?.fieldID??i}`);
        
        switch (field.type) {
            case 'textarea':
                input = document.createElement('textarea');input.classList.add('form-control');
                input.name = 'field.'+field.fieldID;
                input.placeholder = PROMPTS.str_replace(field?.placeholder??'');
                input.id = `field_${field?.fieldID??i}`;input.innerHTML = field?.value??'';
                input.dataset.fieldId = field.fieldID;
                break;
            case 'input':case 'text':case 'number':case 'date':case 'time':case 'local':case 'color':case 'range':
                input = document.createElement('input');input.classList.add('form-control');
                input.name = 'field.'+field.fieldID;
                input.placeholder = PROMPTS.str_replace(field?.placeholder??'');
                input.id = `field_${field?.fieldID??i}`;input.type = (field.type=='input')?'text':field.type;
                input.value = field?.value??'';input.dataset.fieldId = field.fieldID;
                if(level) {fieldset.appendChild( level );}
                if(input) {fieldset.appendChild( input );}
                if(input || level) {div.appendChild(fieldset);}
                break;
            case 'select':
                input = document.createElement('select');input.classList.add('form-control');
                input.name = 'field.'+field.fieldID;input.id = `field_${field?.fieldID??i}`;
                input.dataset.fieldId = field.fieldID;
                field.options.forEach((opt,i)=> {
                    option = document.createElement('option');option.value=opt?.label??'';option.innerHTML=opt?.label??'';option.dataset.index = i;
                    input.appendChild(option);
                });
                if(level) {fieldset.appendChild( level );}
                if(input) {fieldset.appendChild( input );}
                if(input || level) {div.appendChild(fieldset);}
                break;
            case 'radio':case 'checkbox':
                input = document.createElement('div');input.classList.add('form-wrap');
                field.options = (field.options)?field.options:[];
                // field.options = field.options.reverse();
                field.options.forEach((opt, optI)=> {
                    if(opt && opt.label) {
                        level = document.createElement('label');level.classList.add('form-control-label', 'form-control-'+field.type);
                        // level.setAttribute('for', `field_${field?.fieldID??i}_${optI}`);
                        if(opt.input) {level.classList.add('form-flexs');}
                        span = document.createElement('span');
                        if(opt.imageUrl) {
                            image = document.createElement('img');image.src = opt.imageUrl;
                            image.alt = opt.label;level.appendChild(image);
                            level.classList.add('form-control-'+field.type+'__image');
                            input.classList.add('form-wrap__image');
                        }
                        if(!opt.input) {span.innerHTML = opt.label;} else {
                            others = document.createElement('input');others.type='text';
                            others.name='field.'+field.fieldID+'.others';others.placeholder=opt.label;
                            others.dataset.fieldId = field.fieldID;others.dataset.index = optI;
                            span.appendChild(others);
                        }
                        option = document.createElement('input');option.value=opt.label;option.type=field.type;option.name='field.'+field.fieldID+'.option';
                        option.dataset.index = optI;option.dataset.fieldId = field.fieldID;
                        option.id=`field_${field?.fieldID??i}_${optI}`;
                        level.appendChild(option);level.appendChild(span);input.appendChild(level);
                        fieldset.appendChild(input);div.appendChild(fieldset);
                    }
                });
                break;
            case 'password':
                group = document.createElement('div');group.classList.add('input-group', 'mb-3');
                input = document.createElement('input');input.classList.add('form-control');
                input.name = 'field.'+field.fieldID;
                input.placeholder = PROMPTS.str_replace(field?.placeholder??'');
                input.id = `field_${field?.fieldID??i}`;input.type = (field.type=='input')?'text':field.type;
                input.value = field?.value??'';input.dataset.fieldId = field.fieldID;
                var eye = document.createElement('div');
                eye.classList.add('input-group-append', 'toggle-password');
                eye.innerHTML = '<i class="fa fa-eye"></i>';
                group.appendChild(input);group.appendChild(eye);
                if(level) {fieldset.appendChild(level);}
                if(input) {fieldset.appendChild(group);}
                if(input || level) {div.appendChild(fieldset);}
                break;
            case 'confirm':
                input = document.createElement('div');input.classList.add('the-success-icon');
                input.innerHTML = field?.icon??'';
                fieldset.appendChild(input);div.appendChild(fieldset);
                break;
            case 'voice':
                input = document.createElement('div');input.classList.add('do_recorder');
                input.innerHTML = field?.icon??'';
                fieldset.appendChild(input);div.appendChild(fieldset);
                break;
            default:
                input = level = false;
                break;
        }
        i++;
        if((field?.extra_fields??false)) {
            field.extra_fields.forEach((extra)=>{
                div.appendChild(PROMPTS.do_field(extra, true));
            });
        }
        return div;
    },
    do_submit: async (thisClass, el) => {
        var data = thisClass.generate_formdata(el);
        var args = thisClass.lastReqs = {
            best_of: 1,frequency_penalty: 0.01,presence_penalty: 0.01,top_p: 1,
            max_tokens: parseInt( data?.max_tokens??700 ),temperature: 0.7,model: data?.model??"text-davinci-003",
        };
        try {
            args.prompt = thisClass.str_replace(
                Object.keys(data).map((key)=>'{{'+key+'}}'),
                Object.values(data),
                thisClass.popup.thefield?.syntex??''
            );
            PROMPTS.lastJson = await thisClass.openai.createCompletion( args );
            var prompt = thisClass.popup.generate_results( thisClass );
            document.querySelector('#the_generated_result').value = prompt;
            // console.log( prompt );
        } catch (error) {
            thisClass.openai_error( error );
        }
    },
    do_pagination: async (plus, thisClass) => {
        var step, root, header, field, back, data, submit;PROMPTS.currentStep = PROMPTS?.currentStep??0;
        root = '.fwp-swal2-popup .popup_body .popup_step';
        if(!PROMPTS.lastJson.signature || !PROMPTS.lastJson.signature.custom_fields || PROMPTS.lastJson.signature.custom_fields=='') {return;}
        if(await PROMPTS.beforeSwitch(thisClass, plus)) {
            PROMPTS.currentStep = (plus)?(
                (PROMPTS.currentStep < PROMPTS.totalSteps)?(PROMPTS.currentStep+1):PROMPTS.currentStep
            ):(
                (PROMPTS.currentStep > 0)?(PROMPTS.currentStep-1):PROMPTS.currentStep
            );
            if(PROMPTS.currentStep<=0) {return;}
            
            field = PROMPTS.lastJson.signature.custom_fields.find((row)=>row.orderAt==PROMPTS.currentStep);
            if(plus && field && field.type == 'confirm' && ! await PROMPTS.do_search(field, thisClass)) {
                return false;
            }

            if(PROMPTS.currentStep >= PROMPTS.totalSteps) {
                step = document.querySelector('.popup_step.step_visible');
                data = thisClass.transformObjectKeys(thisClass.generate_formdata(document.querySelector('.popup_body')));

                console.log('Submitting...');
                submit = document.querySelector('.popup_foot .button[data-react="continue"]');
                if(submit && submit.classList) {
                    submit.setAttribute('disabled', true);

                    data.signature = PROMPTS.lastJson.signature.id;
                    var formdata = new FormData();
                    formdata.append('action', 'esign/project/ajax/submit/popup');
                    formdata.append('dataset', JSON.stringify(data));
                    formdata.append('_nonce', thisClass.ajaxNonce);
                    thisClass.sendToServer(formdata);

                    setTimeout(() => {submit.removeAttribute('disabled');}, 100000);
                }
                // if(PROMPTS.validateField(step, data, thisClass)) {
                // } else {console.log('Didn\'t Submit');}
            } else {
                back = document.querySelector('.popup_foot .button[data-react="back"]');
                if(back && back.classList) {
                    if(!plus && PROMPTS.currentStep<=1) {back.classList.add('invisible');} else {back.classList.remove('invisible');}
                }
                
                field = PROMPTS.lastJson.signature.custom_fields.find((row)=>row.orderAt==PROMPTS.currentStep);
                header = document.querySelector('.header_image');
                if(header && field && field.headerbgurl!='') {
                    jQuery(document.querySelector('.header_image')).css('background-image', 'url('+field.headerbgurl+')');
                }
                document.querySelectorAll(root+'.step_visible').forEach((el)=>{el.classList.add('d-none');el.classList.remove('step_visible');});
                step = document.querySelector(root+'[data-step="'+(field?.fieldID??PROMPTS.currentStep)+'"]');
                if(step) {
                    if(!plus) {step.classList.add('popup2left');}
                    step.classList.remove('d-none');setTimeout(()=>{step.classList.add('step_visible');},300);
                    if(!plus) {setTimeout(()=>{step.classList.remove('popup2left');},1500);}
                }

                // Change swal step current one.
                var popup = document.querySelector('.dynamic_popup');
                var popupParent = (popup)?popup.parentElement:document.querySelector('.swal2-html-container');
                thisClass.frozenNode = document.createElement('div');
                thisClass.frozenNode.appendChild(popup);

                thisClass.Swal.update({currentProgressStep: (PROMPTS.currentStep-1)});

                if(popupParent) {popupParent.innerHTML = '';popupParent.appendChild(thisClass.frozenNode.childNodes[0])}
                
            }
        } else {
            console.log('Proceed failed');
        }
    },
    beforeSwitch: async (thisClass, plus) => {
        var field, back, next, elem, last;last = elem = false;
        if(plus) {
            field = PROMPTS.lastJson.signature.custom_fields.find((row)=>row.orderAt==PROMPTS.currentStep);
            elem = document.querySelector('.popup_body .popup_step[data-step="'+(field?.fieldID??PROMPTS.currentStep)+'"]');
            elem = (elem && elem.nextElementSibling)?parseInt(elem.nextElementSibling.dataset?.step??0):0;
            // if(!elem || typeof elem.nextElementSibling === 'undefined') {return false;}
            if(elem>=1 && (PROMPTS.currentStep+1) < elem) {
                last = PROMPTS.currentStep;
                PROMPTS.currentStep = (elem-1);
            }
        }
        if(plus && PROMPTS.totalSteps!=0 && PROMPTS.totalSteps<=PROMPTS.currentStep) {
            // Submitting popup!
            if(elem) {PROMPTS.currentStep = last;}
            return (PROMPTS.totalSteps != PROMPTS.currentStep);
        }
        if(plus) {
            var data = thisClass.generate_formdata( document.querySelector('.popup_body') );
            var step = document.querySelector('.popup_step.step_visible'), prev = [];
            if(!step) {return (PROMPTS.currentStep<=0);}
            if(!PROMPTS.validateField(step, data, thisClass)) {return false;}

            step.querySelectorAll('input, select').forEach((el,ei)=>{
                // el is the element input
                if(!prev.includes(el.name) && data[el.name] && data[el.name]==el.value) {
                    // item is the fieldset
                    var item = PROMPTS.lastJson.signature.custom_fields.find((row, i)=>row.fieldID==el.dataset.fieldId);
                    if(item) {
                        // opt is the options
                        var opt = (item?.options??[]).find((opt,i)=>i==el.dataset.index);
                        if(opt) {
                            prev.push(el.dataset.index);
                            if(!item.is_conditional && opt.next && opt.next!='') {
                                next = PROMPTS.lastJson.signature.custom_fields.find((row)=>row.fieldID==parseInt(opt.next));
                                if(next) {
                                    next.returnStep = item.orderAt;
                                    PROMPTS.currentStep = (next.fieldID-1);
                                    return true;
                                }
                            } else {
                                // return false;
                            }
                        }
                    }
                }
                return true;
            });
        }
        if(!plus) {
            var current = PROMPTS.lastJson.signature.custom_fields.find((row)=>row.orderAt==PROMPTS.currentStep);
            var returnStep = current?.returnStep??false;
            var next = PROMPTS.lastJson.signature.custom_fields.find((row)=>row.orderAt==returnStep);
            if(returnStep && next) {
                PROMPTS.currentStep = (parseInt(returnStep)+1);
                current.returnStep=false;
                return true;
            }
        }
        
        return true;
        // return (!plus || PROMPTS.currentStep < PROMPTS.totalSteps);
        // setTimeout(()=>{return true;},100);
    },
    validateField: (step, data, thisClass) => {
        // data = thisClass.generate_formdata(document.querySelector('.popup_body'));
        var fieldValue, field;fieldValue = step.querySelector('input, select');
        fieldValue = (fieldValue)?fieldValue?.name??false:false;
        field = PROMPTS.lastJson.signature.custom_fields.find((row)=>row.fieldID==step.dataset.step);
        if(!field) {return false;}

        thisClass.Swal.resetValidationMessage();
        switch (field?.type??false) {
            case 'text':case 'number':case 'color':case 'date':case 'time':case 'local':case 'range':case 'checkbox':case 'radio':
                if(field.required && (!data[fieldValue] || data[fieldValue]=='')) {
                    thisClass.Swal.showValidationMessage('You can\'t leave it blank.');
                    return false;
                }
                break;
            default:
                return true;
                break;
        }
        return true;
    },
    do_search: async (field, thisClass) => {
        var submit = document.querySelector('.popup_foot .button[data-react="continue"]');
        if(submit) {submit.disabled = true;}
        var args, request, formdata;
        args = thisClass.transformObjectKeys(thisClass.generate_formdata(document.querySelector('.popup_body')));
        formdata = new FormData();
        // for (const key in args) {
        //     formdata.append(key, args[key]);
        // }
        args.field.signature = PROMPTS.lastJson.signature.name;
        formdata.append('formdata', JSON.stringify(args));
        formdata.append('_nonce', thisClass.ajaxNonce);
        formdata.append('action', 'esign/project/ajax/search/popup');
    
        request = await fetch(thisClass.ajaxUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formdata
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(err => console.error(err));
        
        if(submit) {submit.removeAttribute('disabled');}
        return true;
    },
    on_Closed: (thisClass) => {
        var popup = document.querySelector('.dynamic_popup .tc-extra-signature-options.tm-extra-signature-options');
        var parent = document.querySelector('.tc-extra-signature-options-parent');
        if(parent && popup) {parent.innerHTML = '';parent.appendChild(popup);}
        return true;
    },




    htmlToElement: (html) => {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    },
    

    get_custom_fields: (thisClass) => {
        thisClass.fields = [
            {
                id: 'sign',
                title: thisClass.i18n?.signature??'Signature',
                tip: thisClass.i18n?.signature_desc??'E-Signature field with defining a user will be sent mail to signer according to their order.',
                icon: '',
                fields: [
                    {
                        fieldID: 4,
                        type: "text",
                        title: 'Signer ID',
                        headerbg: false,
                        heading: 'Bears Birth',
                        subtitle: 'Select a user as signer for this field. This is required.',
                        placeholder: '',
                        required: true
                    }
                ]
            },
            {
                id: 'date',
                title: thisClass.i18n?.date??'Date',
                tip: thisClass.i18n?.date_desc??'Pick this date that will replace with Sining time or date.',
                icon: '',
                fields: [
                    {
                        fieldID: 4,
                        type: "text",
                        title: 'Date format',
                        headerbg: false,
                        heading: 'Bears Birth',
                        subtitle: 'Give here a date format for signing. EG: "M d, Y H:i:s"',
                        placeholder: '',
                        default: 'M d, Y H:i',
                        required: true
                    }
                ]
            },
            {
                id: 'sign',
                title: thisClass.i18n?.signature??'Signature',
                tip: thisClass.i18n?.signature_desc??'E-Signature field with defining a user will be sent mail to signer according to their order.',
                icon: '',
                fields: [
                    {
                        fieldID: 4,
                        type: "text",
                        title: 'Signer ID',
                        headerbg: false,
                        heading: 'Bears Birth',
                        subtitle: 'Select a user as signer for this field. This is required.',
                        placeholder: '',
                        required: true
                    }
                ]
            },
        ];
        return (thisClass.fields);
    },
    generate_builder: (thisClass) => {
        var html;
        
        html = `
        <div class="pdf_builder__container">
            ${PROMPTS.dropZoneHTML}
            ${PROMPTS.esignEditorHTML}
        </div>
        `;
        return html;
    },
    addCustomField: (el, target) => {},
    init_drag_n_drop: (thisClass) => {
        const container = document.querySelector('.dynamic_popup .container');
        const draggableElements = Array.from(document.querySelectorAll('.dynamic_popup .drag.btn'));
        const dragZone = document.querySelector('.dynamic_popup #signature-modules');
        PROMPTS.dropZone = document.querySelector('.dynamic_popup #signature-builder');
      
        PROMPTS.dropZone.addEventListener('drop', async (event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          console.log(event.dataTransfer);
          if (file.type === 'application/pdf') {
            // Step 2: Load and preview the PDF
            await PROMPTS.loadAndPreviewPDF(file);
      
            // Initialize drag and drop for custom fields
            PROMPTS.initDragAndDrop(thisClass);
          }
        });
      
        PROMPTS.dropZone.addEventListener('dragover', (event) => {
          event.preventDefault();
        });
    },
    initDragAndDrop: (thisClass) => {
        console.log('initDragAndDrop...');
        const draggableElements = Array.from(document.querySelectorAll('.dynamic_popup .drag.btn'));
        const dropZone = document.querySelector('.dynamic_popup #signature-builder');
      
        // Add dragula event listeners
        const drake = dragula([dragZone, dropZone], {
          copy: true,
          accepts: function (el, target, source, sibling) {
            return !el.classList.contains('ui-sortable-helper');
          },
        });
      
        drake.on('drop', (el, target, source) => {
          el.classList.remove('esign-fields__single');
          el.classList.add('esign-body__single');
      
          const draggableText = el.textContent.trim();
          const newElementHTML = `
            <details>
              <summary>${draggableText}</summary>
              <div>
                <label>More Data</label>
                <input type="text" name="signer[].name"/>
              </div>
            </details>
            <button type="button" class="btn btn-default btn-xs remove">
              <span class="glyphicon glyphicon-trash"></span>
            </button>
          </details>
        `;
    
        const newElement = htmlToElement(newElementHTML);
        el.innerHTML = '';
        el.appendChild(newElement);
      });
    
      dropZone.addEventListener('sort', () => {
        dropZone.classList.remove('active');
      });
    },
    
    renderPDF:  async (file) => {
        const container = document.querySelector('#signature-builder');
        // const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement('canvas');
        // canvas.width = viewport.width;
        // canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        // const renderTask = page.render({ canvasContext: context, viewport });
        // console.log(URL.createObjectURL(file), canvas);
        await PROMPTS.loadAndPreviewPDF(file);

        container.appendChild(canvas);
    },

    init_pdf_dropzone: (thisClass) => {
        document.querySelectorAll('.upload-pdf .pdf-dropzone:not([data-handled])').forEach((el)=>{
            el.dataset.handled = true;
            const output = document.createElement('div');
            PROMPTS.uploadPDF = document.createElement('div');
            PROMPTS.previewEl = document.querySelector('#signature-builder') || document.createElement('div');
            PROMPTS.dropzone = new thisClass.Dropzone(el, {
                url: thisClass.ajaxUrl,
                method: 'post',
                uploadMultiple: false,
                maxFilesize: 256,
                // previewTemplate: '',
                disablePreviews: true,
                addedfiles() {},
                addedfile (file) {
                    PROMPTS.renderPDF(file);
                
                    // const pdfUrl = URL.createObjectURL(file);
                    // Create an <embed> element to display the PDF preview
                    // const embed = document.createElement('embed');
                    // embed.src = pdfUrl;
                    // embed.type = 'application/pdf';
                    // embed.width = '100%';
                    // embed.height = '600px';
                
                    // PROMPTS.previewPDF = file;
                    // PROMPTS.previewPDFUrl = pdfUrl;
                    // PROMPTS.previewEl.innerHTML = '';
                    // PROMPTS.previewEl.appendChild(embed);
                    // PROMPTS.uploadPDF.appendChild(el.parentElement);
                },
                acceptedFiles: 'application/pdf,.pdf',
                autoProcessQueue: false, // Disable auto-processing of files for preview only
            });
            // PROMPTS.dropzone.on('addedfile', (file) => {});
        });
    },



    
    loadAndPreviewPDF__: async (file) => {
        console.log('loadAndPreviewPDF...', file);
        const reader = new FileReader();
        reader.onload = async (event) => {
          const pdfData = new Uint8Array(event.target.result);
          const pdfDoc = await PDFDocument.load(pdfData);
      
          // Clear existing preview
          const eSignBuilder = document.querySelector('.dynamic_popup #signature-builder');
          eSignBuilder.innerHTML = '';
      
          // Iterate through all pages and create preview images
          for (let i = 0; i < pdfDoc.getPageCount(); i++) {
            const page = pdfDoc.getPage(i);
            console.log(page);
            const { width, height } = page.getSize();
            console.log(width, height);
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            console.log(canvas);

            // Render PDF page on canvas
            const context = canvas.getContext('2d');
      
            // Get the PDF page as a Uint8Array
            const pdfPageAsArray = await page.save();
      
            // Convert the Uint8Array to a Blob and then to an object URL
            const blob = new Blob([pdfPageAsArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
      
            // Create an image and set its source to the object URL
            const image = new Image();
            image.src = url;
      
            // Draw the image on the canvas
            image.onload = () => {
              context.drawImage(image, 0, 0, width, height);
              URL.revokeObjectURL(url); // Clean up the object URL
            };
      
            // Append canvas to eSignBuilder for preview
            eSignBuilder.appendChild(canvas);
          }
        };
        reader.readAsArrayBuffer(file);
    },
    loadAndPreviewPDF___: async (file) => {
        console.log('loadAndPreviewPDF...', file);
        const reader = new FileReader();
        reader.onload = async (event) => {
          const pdfData = new Uint8Array(event.target.result);
      
          // Clear existing preview
          const eSignBuilder = document.querySelector('.dynamic_popup #signature-builder');
          eSignBuilder.innerHTML = '';
      
          // Load and initialize the PDF.js Express Viewer
          const viewerElement = document.createElement('div');
          eSignBuilder.appendChild(viewerElement);
          const viewer = new PDFJSExpress.Viewer({
            l: window.sampleL,
            initialDoc: pdfData,
          }, viewerElement);
      
          // You can also customize the viewer options, for example:
          // const viewer = new PDFJSExpress.Viewer({
          //   l: window.sampleL,
          //   initialDoc: pdfData,
          //   enableAnnotations: true,
          //   showSideWindow: false,
          //   showSearchBox: true,
          //   showAnnotationTools: true,
          //   disableFlattenedAnnotations: false,
          // }, viewerElement);
      
          // If you need to access the viewer instance for later use, you can store it in a variable:
          // const viewerInstance = new PDFJSExpress.Viewer({
          //   l: window.sampleL,
          //   initialDoc: pdfData,
          // }, viewerElement);
      
          // For more configuration options, refer to the PDF.js Express Viewer documentation:
          // https://pdfjs.express/documentation
      
          // You can also listen to viewer events, for example:
          // viewerInstance.on('documentLoaded', () => {
          //   console.log('Document loaded!');
          // });
      
          // IMPORTANT: Make sure to handle any errors that may occur during loading or rendering the PDF
          // viewerInstance.on('error', (err) => {
          //   console.error('PDF.js Express Viewer error:', err);
          // });
      
          // ... Add any other customizations or event listeners as needed ...
        };
        reader.readAsArrayBuffer(file);
    },
    loadAndPreviewPDF: async (file) => {
        previewPDFile(file);
    },

};
export default PROMPTS;