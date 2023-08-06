const initializeSignatureBuilder = {
    update_btn: false,
    init_fields: (thisClass) => {
        var formdata = new FormData();
        formdata.append('action', 'esign/project/ajax/template/fields');
        formdata.append('_nonce', thisClass.ajaxNonce);
        thisClass.sendToServer(formdata);
    },
    init_events: (thisClass) => {
        var template, html;
        document.body.addEventListener('gotsignaturepopupresult', async (event) => {
            thisClass.prompts.lastJson = thisClass.lastJson;
            template = await thisClass.prompts.get_template(thisClass);
            var div = document.createElement('div');div.classList.add('dynamic_popup');
            html = document.createElement('div');html.appendChild(div);
            // && json.header.signature_photo
            if(thisClass.Swal && thisClass.Swal.isVisible()) {
                thisClass.Swal.update({
                    html: html.innerHTML
                });
                thisClass.prompts.lastJson = thisClass.lastJson;
                setTimeout(() => {
                    var popup = document.querySelector('.dynamic_popup');
                    if(popup) {popup.appendChild(template);}
                    setTimeout(async () => {
                        thisClass.isPreventClose = true;
                        thisClass.prompts.init_events(thisClass);
                        if((thisClass.prompts.lastJson.signature.custom_fields?.pdf??false)) {

                            const uploadPDF = document.querySelector('.upload-pdf');
                            if(uploadPDF) {uploadPDF.style.display = 'none';}

                            const pdFile = thisClass.prompts.lastJson.signature.custom_fields.pdf;
                            var filename = pdFile.split('/').pop().split('#')[0].split('?')[0];
                            let response = await fetch(pdFile);
                            let data = await response.blob();
                            let metadata = {type: 'image/jpeg'};
                            let file = new File([data], filename, metadata);

                            // console.log(file);
                            
                            thisClass.lastUploaded = pdFile;
                            thisClass.prompts.currentPDF = file;
                            await thisClass.prompts.loadAndPreviewPDF(file);
                            // thisClass.prompts.initDragAndDrop(thisClass);
                            thisClass.prompts.loadPreviousFields(thisClass);

                            
                            
                        }
                    }, 300);
                }, 300);
            }
        });
        document.body.addEventListener('popup_submitting_done', async (event) => {
            var submit = document.querySelector('.popup_foot .button[data-react="continue"]');
            if(submit) {submit.removeAttribute('disabled');}
            if(thisClass.lastJson.redirectedTo) {location.href = thisClass.lastJson.redirectedTo;}
        });
        document.body.addEventListener('custom_fields_getting_done', async (event) => {
            if(thisClass.lastJson?.fields??false) {
                thisClass.fields = thisClass.lastJson.fields;
                thisClass.eSignature.init_popup(thisClass);
            }
        });
        document.body.addEventListener('template_update_success', (event) => {
            if((thisClass.lastJson?.lastUploaded??false)) {
                thisClass.lastUploaded = thisClass.lastJson.lastUploaded;
            }
            initializeSignatureBuilder.update_btns.forEach((btn)=>{btn.disabled = false;});
        });
        document.body.addEventListener('template_update_failed', (event) => {
            initializeSignatureBuilder.update_btns.forEach((btn)=>{btn.disabled = false;});
        });
    },
    init_popup: (thisClass) => {
        var form, html, config, json;
        document.querySelectorAll('.fwp-launch-esignature-builder:not([data-handled])').forEach((el)=>{
            el.dataset.handled = true;
            el.addEventListener('click', (event) => {
                event.preventDefault();
                html = thisClass.prompts.get_template(thisClass);
                thisClass.Swal.fire({
                    title: false, // thisClass.i18n?.generateaicontent??'Generate AI content',
                    width: 600,
                    // padding: '3em',
                    // color: '#716add',
                    // background: 'url(https://png.pngtree.com/thumb_back/fh260/background/20190221/ourmid/pngtree-ai-artificial-intelligence-technology-concise-image_19646.jpg) rgb(255, 255, 255) center center no-repeat',
                    showConfirmButton: false,
                    showCancelButton: false,
                    showCloseButton: true,
                    allowOutsideClick: false,
                    allowEscapeKey: true,
                    // confirmButtonText: 'Generate',
                    // cancelButtonText: 'Close',
                    // confirmButtonColor: '#3085d6',
                    // cancelButtonColor: '#d33',
                    customClass: {popup: 'fwp-swal2-popup'},
                    // focusConfirm: true,
                    // reverseButtons: true,
                    // backdrop: `rgba(0,0,123,0.4) url("https://sweetalert2.github.io/images/nyan-cat.gif") left top no-repeat`,
                    backdrop: `rgba(0,0,123,0.4)`,

                    showLoaderOnConfirm: true,
                    allowOutsideClick: false, // () => !Swal.isLoading(),
                    
                    html: html,
                    // footer: '<a href="">Why do I have this issue?</a>',
                    // onClose: () => {thisClass.isPreventClose = false;},
                    didOpen: async () => {
                        config = JSON.parse(el.dataset?.config??'{}');
                        
                        var formdata = new FormData();
                        formdata.append('action', 'esign/project/ajax/template/data');
                        formdata.append('template', config?.id??'');
                        formdata.append('_nonce', thisClass.ajaxNonce);

                        thisClass.sendToServer(formdata);
                        // thisClass.prompts.init_prompts(thisClass);
                    },
                    preConfirm: async (login) => {return thisClass.prompts.on_Closed(thisClass);}
                }).then( async (result) => {
                    // if(result.isConfirmed) {}
                    thisClass.isPreventClose = false;
                })
            });
        });
    }
};

export default initializeSignatureBuilder;