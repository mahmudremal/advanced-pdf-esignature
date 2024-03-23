/**
 * Esignature Template Script.
 * 
 * @package ESignBindingAddons
 */
import PROMPTS from "./prompts";
class eSignature extends PROMPTS {
    /**
     * Constructor
     */
    constructor(thisClass, element, oneCanvas = true) {
        super(thisClass);
        this.update_btn = false;
        this.id = 'asdfghjklmnopqrstuvwxyz'.split('').sort(() => 0.5-Math.random()).join('');
        if (element) {
            this.element = element;
            element.dataset.esign = this.id;
        }
        if (oneCanvas) {
            this.oneCanvas = true;
        }
        if (element.nodeName === 'CANVAS') {
            this.isCanvasNode = true;
        }
        this.init_events(thisClass);
        this.init_fields(thisClass);
        // this.init_popup(this);
    }
    init_fields(thisClass) {
        var formdata = new FormData();
        formdata.append('action', 'esign/project/ajax/template/fields');
        formdata.append('_nonce', thisClass.ajaxNonce);
        thisClass.sendToServer(formdata);
    }
    init_events(thisClass) {
        const eSign = this;eSign.database = {};
        document.body.addEventListener('custom_fields_getting_done', async (event) => {
            if (thisClass.lastJson?.fields??false) {
                thisClass.fields = thisClass.lastJson.fields;
                eSign.database.users = thisClass.lastJson.users;
                if (eSign) {eSign.init_popup(thisClass);}
            }
        });
        if (eSign?.isCanvasNode) {
            var formdata = new FormData();
            formdata.append('action', 'esign/project/ajax/template/data');
            formdata.append('template', thisClass.config?.template_id??'');
            formdata.append('_nonce', thisClass.ajaxNonce);
            thisClass.sendToServer(formdata);
        }
    }
    init_popup(thisClass) {
        const eSign = this;
    }
    fix_pdf_schema(thisClass) {
        const eSign = this;
        var pdFile = ((eSign?.data)?.custom_fields)?.pdf;
        if (pdFile && location.protocol.startsWith('https') && pdFile.startsWith('http://')) {pdFile = 'https://' + pdFile.slice(7);}
        if (pdFile) {eSign.data.custom_fields.pdf = pdFile;}
    }
}

export default eSignature;