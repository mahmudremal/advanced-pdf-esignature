const initializeSignatureBuilder = {
    init_events: (thisClass) => {
        var template, html;
        document.body.addEventListener('gotsignaturepopupresult', async (event) => {
            thisClass.prompts.lastJson = thisClass.lastJson;
            template = await thisClass.prompts.get_template(thisClass);
            html = document.createElement('div');html.appendChild(template);
            // && json.header.signature_photo
            if(thisClass.Swal && thisClass.Swal.isVisible()) {
                thisClass.Swal.update({
                    html: html.innerHTML
                });
                thisClass.prompts.lastJson = thisClass.lastJson;
                if(thisClass.lastJson.signature && thisClass.lastJson.signature.toast) {
                    thisClass.toastify({
                        text: thisClass.lastJson.signature.toast.replace(/(<([^>]+)>)/gi, ""),
                        duration: 45000,
                        close: true,
                        gravity: "top", // `top` or `bottom`
                        position: "left", // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        style: {background: 'linear-gradient(to right, #4b44bc, #8181be)'},
                        onClick: function(){} // Callback after click
                    }).showToast();
                }
                setTimeout(() => {
                    thisClass.prompts.init_events(thisClass);
                }, 300);
            }
        });
        document.body.addEventListener('popup_submitting_done', async (event) => {
            var submit = document.querySelector('.popup_foot .button[data-react="continue"]');
            if(submit) {submit.removeAttribute('disabled');}
            if(thisClass.lastJson.redirectedTo) {location.href = thisClass.lastJson.redirectedTo;}
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
                    didOpen: async () => {
                        config = JSON.parse(el.dataset?.config??'{}');
                        json = {template_id: config.id};
                        
                        var formdata = new FormData();
                        formdata.append('action', 'esign/project/ajax/template/data');
                        formdata.append('dataset', await JSON.stringify(json));
                        formdata.append('_nonce', thisClass.ajaxNonce);

                        thisClass.sendToServer(formdata);
                        // thisClass.prompts.init_prompts(thisClass);
                    },
                    preConfirm: async (login) => {return thisClass.prompts.on_Closed(thisClass);}
                }).then( async (result) => {
                    if(result.isConfirmed) {}
                })
            });
        });
    }
};

export default initializeSignatureBuilder;