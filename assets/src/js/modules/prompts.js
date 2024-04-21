/**
 * Propmts popup.
 */
// import { PDFDocument, rgb, degrees, SVGPath, drawSvgPath, StandardFonts } from 'pdf-lib';
// import PDFJSExpress from "@pdftron/pdfjs-express";
// import { PDFDocument, rgb, values } from 'pdf-lib';

import PDFUtils from './pdfUtils';
// import interact from 'interactjs';
class PROMPTS extends PDFUtils {
    constructor(thisClass) {
        super(thisClass);
    }
    get_template(thisClass) {
        const eSign = this;var json, html;
        html = document.createElement('div');html.classList.add('dynamic_popup');
        if(eSign?.data) {
            eSign.checkif_signature_exists(thisClass);
            html.appendChild(eSign.generate_template(thisClass));
        } else {
            html.innerHTML = `<div class="spinner-material"></div><h3>${thisClass.i18n?.pls_wait??'Please wait...'}</h3>`;
        }
        return html;
    }
    init_individualFields(thisClass) {
        const eSign = this;
        var fields, card, single, handle, image;
        // ${(eSign.data.custom_fields?.pdf??false)?`style="display: none;"`:''}
        eSign.dropZoneHTML = `
            <div class="upload-pdf">
                <div class="pdf-dropzone">
                    <form class="pdf-dropzone__form needsclick" action="/upload">
                        <div class="dz-message needsclick">
                            <h1 class="svelte-12uhhij">${eSign.i18n?.upload_pdf??'Upload PDF'}</h1>
                            <p>${eSign.i18n?.dropdf_subtitle??'Drop PDF document here or click to upload.'}<p>
                            <span class="note needsclick">${eSign.i18n?.upload_pdf_details??'PDF file will generate a preview and you\'ll be forwarded to Signature builder screen.'}</span>
                        </div>
                    </form>
                </div>
            </div>
        `;
        fields = eSign.get_custom_fields(thisClass);
        eSign.esignEditorHTML = `
            <div class="pdf_builder__row ${(thisClass.isFrontend)?'pdf_builder__frontend':''}">
                <div class="pdf_builder__builder ${(thisClass.isFrontend && !eSign.signatureExists)?'w-full':''}">
                    <div id="signature-builder" class="esign-body">
                        <canvas id="contractCanvas" class="${(thisClass.isFrontend)?'canvas__frontend':'canvas__backend'}">
                    </div>
                    ${(thisClass.isFrontend && !eSign.signatureExists)?``:`
                    <button class="btn btn-primary pull-right ${(thisClass.isFrontend)?'update_esign_signature':`update_esign_template`}"><span>${(thisClass.isFrontend)?(eSign.i18n?.confirm_singing??'Confirm Signing'):(eSign.i18n?.save??'Save')}</span><div class="spinner-circular-tube"></div></button>
                    `}
                </div>
                ${(thisClass.isFrontend)?(
                    (!eSign.signatureExists)?'':`
                    <div class="pdf_builder__fields">
                        <div class="pdf_builder__fields__grid">
                            <span class="modal__collapse" aria-label="Collapse sidebar">
                                <svg width="42px" height="42px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.5 7L14.5 12L9.5 17" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                            </span>
                            <h3>${eSign.i18n?.e_signature??'e-Signature'}</h3>
                            <p>${eSign.i18n?.custmfields_subtitle??'Find the signature field, click over your signature field, draw or upload your signature & confirm the contract.'}</p>
                            ${(thisClass.isFrontend)?``:`<div id="signature-modules" class="esign-fields"></div>`}
                            ${(thisClass.isFrontend)?`<button class="btn btn-primary pull-right update_esign_signature"><span>${eSign.i18n?.confirm_singing??'Confirm Signing'}</span><div class="spinner-circular-tube"></div></button>`:``}
                        </div>
                        ${(thisClass.isFrontend)?'':`
                        <div class="pdf_builder__fields__settings">
                            <div class="pdf_builder__fields__settings__header">
                                <button type="button" title="Back to Fields"><span class="dashicons-before dashicons-arrow-left-alt"></span></button>
                                <span class="pdf_builder__fields__settings__header__title">Settings</span>
                            </div>
                            <div class="pdf_builder__fields__settings__body"></div>
                            <div class="pdf_builder__fields__settings__footer">
                                <button class="btn btn-primary pull-right  ${(thisClass.isFrontend)?'update_esign_signature':`update_esign_template`}"><span>${(thisClass.isFrontend)?(eSign.i18n?.confirm_singing??'Confirm Signing'):(eSign.i18n?.save??'Save')}</span><div class="spinner-circular-tube"></div></button>
                            </div>
                        </div>
                        `}
                    </div>
                    `
                ):`
                <div class="pdf_builder__fields">
                    <div class="pdf_builder__fields__grid">
                        <h3>${eSign.i18n?.custmfields_title??'Field widgets'}</h3>
                        <p>${eSign.i18n?.custmfields_subtitle??'Drag & Drop each fields on the desired location and select necessery data to make it functional.'}</p>
                        <div id="signature-modules" class="esign-fields">
                            ${fields.map((row, index) => {
                                single = document.createElement('div');single.classList.add('esign-fields__single');
                                if((row?.icon??'') != '') {
                                    image = document.createElement('img');
                                    image.classList.add('esign-fields__image');
                                    image.src = row.icon;image.alt = '';
                                    single.appendChild(image);
                                }
                                handle = document.createElement('div');handle.classList.add('esign-fields__handle');
                                handle.dataset.config = JSON.stringify({id: row.id, title: row.title});handle.innerHTML = row.title;handle.dataset.index = index;
                                single.appendChild(handle);card = document.createElement('div');card.appendChild(single);
                                return card.innerHTML;
                            }).join('')}
                        </div>
                    </div>
                    <div class="pdf_builder__fields__settings">
                        <div class="pdf_builder__fields__settings__header">
                            <button type="button" title="Back to Fields"><span class="dashicons-before dashicons-arrow-left-alt"></span></button>
                            <span class="pdf_builder__fields__settings__header__title">Settings</span>
                        </div>
                        <div class="pdf_builder__fields__settings__body"></div>
                        <div class="pdf_builder__fields__settings__footer">
                            <button class="btn btn-primary pull-right update_esign_template"><span>${eSign.i18n?.save??'Save'}</span><div class="spinner-circular-tube"></div></button>
                        </div>
                    </div>
                </div>
                `}

            </div>
        `;
    }
    init_prompts(thisClass) {
        // eSign.core = thisClass;
    }
    prompts_events(thisClass) {
        const eSign = this;
        // 
        document.querySelectorAll('.pdf_builder__fields__settings__header button:not([data-handled])').forEach(el => {
            el.dataset.handled = true;
            el.addEventListener('click', (event) => {
                event.preventDefault();
                document.querySelector('.pdf_builder__fields').classList.remove('settings_enabled');
            });
        });
        document.querySelectorAll('.pdf_fields__group__fieldset select.form-control[data-select2-handled]').forEach(select => {
            select.dataset.select2Handled = true;
            jQuery(select).select2();
        });
        window.addEventListener('beforeunload', function (event) {
            if(thisClass?.isPreventClose) {
                if(thisClass.isFrontend && !(eSign?.signatureExists)) {
                    // Pass without preventing.
                } else {
                    event.preventDefault();event.returnValue = '';return '';
                }
            }
        });
        eSign.update_btns = document.querySelectorAll('.pdf_builder__row .update_esign_template');
        eSign.update_btns.forEach((btn) => {
            btn.addEventListener('click', (event) => {
                const formData = {fields: [], pdf: false};
                formData.fields = Object.values(document.querySelectorAll('.pdf_builder__builder .esign-body__single')).map((el) => {
                    var field = thisClass.fieldsData.find((row)=>row.unique == el.dataset.storedOn);
                    return {
                      height: el.style.height, width: el.style.width, dx: parseFloat(el.dataset.x), dy: parseFloat(el.dataset.y),
                      field: field.id,
                      data: thisClass.transformObjectKeys(thisClass.generate_formdata(field.html))
                    };
                });

                // formData.fields.forEach((row) {
                //     if(((row?.data)?.field)?.user) {
                //         users.push(row.data.field.user);
                //     }
                // });
                // console.log(formData);
                
                eSign.update_btns.forEach((btn) => {btn.disabled = true;});
                var formdata = new FormData();
                formdata.append('action', 'esign/project/ajax/template/update');
                formdata.append('_nonce', thisClass.ajaxNonce);
                if((thisClass?.lastUploaded??false)) {
                    formdata.append('lastUploaded', thisClass.lastUploaded);
                    formData.pdf = thisClass.lastUploaded;formData.canvas = [];
                    // 
                    document.querySelectorAll('.pdf_builder__container #signature-builder canvas').forEach((el, i) => {
                        formData.canvas.push({width: el.width, height: el.height, serial: i});
                    });
                }
                formdata.append('dataset', JSON.stringify(formData));
                formdata.append('template', thisClass.config.template_id);
                if((eSign?.currentPDF??false)) {
                    formdata.append('pdf', eSign.currentPDF, eSign.currentPDF.name);
                }
                
                thisClass.sendToServer(formdata);
            });
        });
        document.querySelectorAll('.pdf_builder__row .update_esign_signature').forEach(btn => {
            btn.addEventListener('click', (event) => {
                eSign.update_btns.forEach((btn) => {btn.disabled = true;});
                thisClass.eSignVex = thisClass.vex.dialog.confirm({
                    message: 'Are you absolutely sure you want to agree with the following agreement?',
                    callback: async (agree) => {
                        if(agree) {
                            // thisClass.toastify({text: 'Rest of the process is to attach signature with PDF permanently & forword to next signer, is under development.',className: "warning", duration: 7500, stopOnFocus: true, style: {background: "linear-gradient(to right, #00b09b, #96c93d)"}}).showToast();

                            eSign.toEsign = eSign?.toEsign??{};
                            eSign.toEsign.pdfBlob = eSign.currentPDF;
                            const fieldsToProcess = eSign.fields.filter(field =>
                                field?.enableSign && !field?.signDone
                            );
                            // console.log(fieldsToProcess);
                            const result = await eSign.attachImageTextToPDF(thisClass, fieldsToProcess);

                            window.open(eSign.toEsign.pdfURL);
                            // 
                            if(false) {
                                thisClass.vex.dialog.confirm({
                                    message: 'Signature Attached Preview',
                                    className: 'signature-preview', // input: '',
                                    unsafeContent: `<embed src="${eSign.toEsign.pdfURL}"/>`,
                                    overlayClosesOnClick: true,
                                    callback: async (agree) => {
                                        console.log(agree);
                                    }
                                });
                            }

                            /**
                             * Submit Contract with signatures
                             */
                            if(agree && false) {
                                var formdata = new FormData();
                                formdata.append('pdf', eSign.toEsign.pdfBlob, eSign.currentPDF.name);
                                formdata.append('template', eSign.config.id);
                                formdata.append('action', 'esign/project/ajax/signing/confirm');
                                (eSign.attachments??[]).forEach(file => {
                                    formdata.append('attach', file.name, file);
                                });
                                
                                formdata.append('_nonce', thisClass.ajaxNonce);
                                thisClass.sendToServer(formdata);
                            }
                            
                        }
                    }
                });
            });
        });
        // Init mouse pointer position
        document.querySelectorAll('#signature-builder').forEach(element => {
            element.addEventListener('mousemove', (event) => {
                var rect = element.getBoundingClientRect();
                event.pointerX = event.clientX - rect.left;
                event.pointerY = event.clientY - rect.top;
                // 
                eSign.canvasPointer = event;
            });
        });
        // 
        // eSign.init_drag_n_drop(thisClass);
        eSign.init_pdf_dropzone(thisClass);
        eSign.dragFromRight2Left(thisClass);
    }
    generate_template(thisClass) {
        return this.generate_fields(thisClass);
    }
    generate_fields(thisClass) {
        this.init_individualFields(thisClass);
        return this.generate_builder(thisClass);
    }
    htmlToElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }
    get_custom_fields(thisClass) {
        const eSign = this;
        thisClass.fields = (thisClass?.fields??false)?thisClass.fields:[
            // {
            //     id: 'sign',
            //     title: thisClass.i18n?.signature??'Signature',
            //     tip: thisClass.i18n?.signature_desc??'E-Signature field with defining a user will be sent mail to signer according to their order.',
            //     icon: thisClass.config.buildPath+'/icons/signature.svg',
            //     fields: [
            //         {
            //             fieldID: 4,
            //             type: "text",
            //             label: 'Signer ID',
            //             headerbg: false,
            //             heading: '',
            //             subtitle: '',
            //             tooltip: 'Select a user as signer for this field. This is required.',
            //             placeholder: '',
            //             required: true
            //         },
            //         {
            //             fieldID: 4,
            //             type: "select",
            //             label: 'Signer',
            //             headerbg: false,
            //             heading: '',
            //             subtitle: '',
            //             tooltip: 'Select a user as signer for this field. This is required.',
            //             placeholder: '',
            //             required: true,
            //             options: [
            //                 {label: 'Remal Mahmud', value: 'remal'},
            //                 {label: 'Nathalia', value: 'nathalia'},
            //             ]
            //         }
            //     ]
            // },
            // {
            //     id: 'date',
            //     title: thisClass.i18n?.date??'Date',
            //     tip: thisClass.i18n?.date_desc??'Pick this date that will replace with Sining time or date.',
            //     icon: thisClass.config.buildPath+'/icons/date.svg',
            //     fields: [
            //         {
            //             fieldID: 4,
            //             type: "text",
            //             label: 'Date format',
            //             headerbg: false,
            //             heading: 'Bears Birth',
            //             subtitle: '',
            //             tooltip: 'Give here a date format for signing. EG: "M d, Y H:i:s"',
            //             placeholder: '',
            //             default: 'M d, Y H:i',
            //             required: true
            //         }
            //     ]
            // },
            // {
            //     id: 'time',
            //     title: thisClass.i18n?.time??'Time',
            //     tip: thisClass.i18n?.time_desc??'Time field with defining a user will be sent mail to signer according to their order.',
            //     icon: thisClass.config.buildPath+'/icons/time.svg',
            //     fields: [
            //         {
            //             fieldID: 4,
            //             type: "text",
            //             label: 'Signer ID',
            //             headerbg: false,
            //             heading: 'Bears Birth',
            //             subtitle: 'Select a user as signer for this field. This is required.',
            //             placeholder: '',
            //             required: true
            //         }
            //     ]
            // }
        ];
        return (thisClass.fields);
    }
    generate_builder(thisClass) {
        var builder = document.createElement('div');builder.classList.add('pdf_builder__container');
        builder.innerHTML = `${(!thisClass.isFrontend)?this.dropZoneHTML:''} ${this.esignEditorHTML}`;
        return builder;
    }
    addCustomField(el, target) {
        // 
    }
    init_drag_n_drop(thisClass) {
        const eSign = this;
        const container = document.querySelector('.dynamic_popup .container');
        const draggableElements = Array.from(document.querySelectorAll('.dynamic_popup .drag.btn'));
        const dragZone = document.querySelector('.dynamic_popup #signature-modules');
        eSign.dropZone = document.querySelector('.dynamic_popup #signature-builder');
      
        eSign.dropZone.addEventListener('drop', async (event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          console.log(event.dataTransfer);
          if (file.type === 'application/pdf') {
            // Step 2: Load and preview the PDF
            await eSign.loadAndPreviewPDF(file, thisClass);
            // Initialize drag and drop for custom fields
            eSign.initDragAndDrop(thisClass);
          }
        });
      
        eSign.dropZone.addEventListener('dragover', (event) => {
          event.preventDefault();
        });
    }
    initDragAndDrop(thisClass) {
        console.log('initDragAndDrop...');
        const draggableElements = Array.from(document.querySelectorAll('.dynamic_popup .drag.btn'));
        const dropZone = document.querySelector('.dynamic_popup #signature-builder');
      
        // Add dragula event listeners
        // if(dragZone) {}
        const drake = dragula([dragZone, dropZone], {
          copy: true,
          accepts: function (el, target, source, sibling) {
            return !el.classList.contains('ui-sortable-helper');
          }
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
    }
    
    init_pdf_dropzone(thisClass) {
        console.log(thisClass);
        const eSign = this;
        document.querySelectorAll('.upload-pdf .pdf-dropzone:not([data-handled])').forEach(el => {
            el.dataset.handled = true;
            const output = document.createElement('div');
            eSign.uploadPDF = document.createElement('div');
            eSign.previewEl = document.querySelector('#signature-builder') || document.createElement('div');
            eSign.dropzone = new thisClass.Dropzone(el, {
                url: thisClass.ajaxUrl,
                method: 'post',
                uploadMultiple: false,
                maxFilesize: 256,
                // previewTemplate: '',
                disablePreviews: true,
                // addedfiles() => {},
                addedfile: async (file) => {
                    eSign.currentPDF = file;
                    const pdfFields = await eSign.loadAndPreviewPDF(file, thisClass);
                    const uploadPDF = document.querySelector('.upload-pdf');
                    if(uploadPDF) {uploadPDF.style.display = 'none';}
                    // const pdfUrl = URL.createObjectURL(file);
                    // Create an <embed> element to display the PDF preview
                    // const embed = document.createElement('embed');
                    // embed.src = pdfUrl;
                    // embed.type = 'application/pdf';
                    // embed.width = '100%';
                    // embed.height = '600px';
                
                    // eSign.previewPDF = file;
                    // eSign.previewPDFUrl = pdfUrl;
                    // eSign.previewEl.innerHTML = '';
                    // eSign.previewEl.appendChild(embed);
                    // eSign.uploadPDF.appendChild(el.parentElement);
                },
                acceptedFiles: 'application/pdf,.pdf',
                autoProcessQueue: false, // Disable auto-processing of files for preview only
            });
            // eSign.dropzone.on('addedfile', (file) {});
        });
    }
    async loadAndPreviewPDF(file, thisClass) {
        this.previewPDFile(file, thisClass);
    }

    init_parser(thisClass) {
        // 
    }

    addSignatureToCanvas(src, canvas, position) {
        const canvasContext = canvas.getContext('2d');
        const image = new Image();
        image.src = src;
  
        image.onload = () => {
          canvasContext.drawImage(image, 100, 100, 200, 150); // Adjust position and size
        };
    }
    async attachImageTextToPDF(thisClass, fields) {
        const eSign = this;
        const pdfBlob = eSign.toEsign.pdfBlob;
        try {
            // Load the PDF blob
            const pdfData = await pdfBlob.arrayBuffer();
            const pdfDoc = await thisClass.PDFLib.PDFDocument.load(pdfData);
    
            // await Promise.all(fields.map(new Promise(async (resolve, reject) {
            await Promise.all(fields.map(async (field) => {
                try {
                    const index = await eSign.get_field_page_index(field, thisClass);
                    const pdfSelectedPage = pdfDoc.getPages()[index];
                    const canvas = eSign.data.custom_fields.canvas[index];
                    console.log(index, field)
                    // Calculate image position and size
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;
                    // const posY = ;
                    const posY = eSign?.indexedPosY??parseFloat(field.dy);
                    // console.log(posY, [canvasWidth, canvasHeight])
                    const position = {
                        x: parseFloat(field.dx) / canvasWidth * pdfSelectedPage.getWidth(),
                        y: pdfSelectedPage.getHeight() - posY / canvasHeight * pdfSelectedPage.getHeight(),
                        width: (parseFloat(field.width) / canvasWidth) * pdfSelectedPage.getWidth(),
                        height: (parseFloat(field.height) / canvasHeight) * pdfSelectedPage.getHeight(),
                    };
                    // 
                    position.height--;position.width--;
                    position.y = position.y - position.height - 0;
                    position.x = position.x + 0;
                    position.y = Math.abs(position.y);
                    // 
                    switch (field?.field) {
                        case 'sign':
                            const imagePath = thisClass.signatureDataUrl;
                            const imageBytes = await fetch(imagePath).then((response) => response.arrayBuffer());
                            const image = await pdfDoc.embedPng(imageBytes);
                            const drawArgs = {
                                // 
                                x: position.x, // * thisClass.eSignature.canvas.ratio.width,
                                // / thisClass.eSignature.canvas.ratio.height
                                y: position.y, // * thisClass.eSignature.canvas.ratio.height,
                                width: position.width,
                                height: position.height
                            };
                            
                            if (Object.values(drawArgs).includes(NaN)) {
                                console.log(drawArgs, position);
                                throw new Error('One or more of the Parameter is not a number!');
                            }
                            // console.log(image, drawArgs)
                            await pdfSelectedPage.drawImage(image, drawArgs);
                            return true;
                            break;
                        case 'date':
                        case 'time':
                        case 'name':
                            var currentDate = new Date();
                            var fontSize, fontColor = [0, 0, 0];
                            var dateFormate = ((field?.data)?.field)?.format;
                            fontSize = parseFloat(((field?.data)?.field)?.fontSize);
                            fontSize = (fontSize >= 1)?fontSize:12;
                            fontColor = ((field?.data)?.field)?.fontColor;
                            fontColor = eSign.hexToRgb(fontColor, false);
                            switch (field.field) {
                                case 'date':
                                case 'time':
                                    var text = thisClass.date_formate(currentDate, dateFormate);
                                    break;
                                case 'name':
                                    var text = field.data.field.user_name;
                                    break;
                                default:
                                    var text = '';
                                    break;
                            }
                            
                            pdfSelectedPage.drawText(text, {
                                x: position.x,
                                y: position.y,
                                size: fontSize,
                                color: thisClass.PDFLib.rgb(...fontColor)
                            });
                            break;
                        default:
                            break;
                    }
                    return false;
                } catch (error) {
                    console.error('Error:', error);
                    return false;
                }
                // }))).then(async (values) {
            })).then(async (values) => {
                // console.log(values);
                // Save the modified PDF as a new blob
                eSign.modifiedPdfBlob = await pdfDoc.save();
                const blob = new Blob([eSign.modifiedPdfBlob], {type: 'application/pdf'});
                eSign.toEsign.pdfBlob = blob;
                eSign.toEsign.pdfURL = URL.createObjectURL(blob);
                
                return eSign.toEsign.pdfURL;
            });
            return null;
        } catch (error) {
            console.error('Error:', error);
            // Handle error as needed
            return null;
        }
    }
    pixelsToPoints(pixels) {
        if(typeof pixels == 'string') {pixels = parseFloat(pixels);}
        const DPI = 72; // Standard DPI for PDFs
        return pixels / DPI / window.devicePixelRatio;
    }
    hexToRgb(hex, str = true) {
        hex = hex?.replace('#', '');
        if(hex == '') {return (str)?`rgb(0, 0, 0)`:[0, 0, 0];}
        // const r = parseInt(hex.substring(0, 2), 16);
        // const g = parseInt(hex.substring(2, 4), 16);
        // const b = parseInt(hex.substring(4, 6), 16);
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        
        return (str)?`rgb(${r}, ${g}, ${b})`:[r, g, b];
    }
    checkif_signature_exists(thisClass) {
        const eSign = this;
        var fieldsExists = ((eSign?.data)?.custom_fields)?.fields;
        if(fieldsExists) {
            fieldsExists = fieldsExists?.map(row => {
                row.enableSign = true;if(thisClass.isFrontend && thisClass.config.user_id != ((row?.data??{})?.field??{})?.user) {row.enableSign = false;}return row;
            });
            const isExists = fieldsExists?.find(row => ((row?.enableSign) && !(row?.signDone)));
            if(isExists) {eSign.signatureExists = true;}
        }
    }
    get_field_page_index(field, thisClass) {
        const eSign = this;
        let index = 0;
        let posY = field?.dy;
        const canvases = (((eSign?.data)?.custom_fields)?.canvas);
        if(field?.dy && canvases) {
            for(let i = 0; i < canvases.length; i++) {
                var canvas = canvases[i];
                posY -= canvas.height;
                if(posY <= 0) {break;}
                // if(posY <= (canvases[i + 1]?.height ?? canvas.height)) {break;}
                index++;eSign.indexedPosY = Math.abs(posY);
            }
        }
        return index;
    }
    updateCanvasWidth() {
        window.addEventListener('resize', () => {
            const deviceWidth = window.innerWidth;
            const desiredWidth = deviceWidth * 0.9; // Adjust the scaling factor as needed
            // esignSingle.style.transform = `translate(${desiredWidth}px, ${esignSingle.dataset.y}px)`;
        });
    }
    drawLoadingSpinner(thisClass, canvas = false) {
        const eSign = this;
        const fieldsObj = (eSign?.data)?.custom_fields;
        const canvasHeight = parseFloat(window.getComputedStyle(
            (canvas)?canvas:document.querySelector('.swal2-container.swal2-center>.swal2-popup.swal2-show.swal2-modal.fwp-swal2-popup')
        ).getPropertyValue('height'));
        canvas = (canvas)?canvas:document.querySelector('.pdf_builder__container #signature-builder canvas');
        if (!canvas) {
            var message = eSign.i18n?.canvas_not_found??'Canvas not found';
            thisClass.toastify({text: message,className: "info", duration: 3000, stopOnFocus: true, style: {background: 'linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))'}}).showToast();
        } else if (fieldsObj && fieldsObj?.canvas && fieldsObj.canvas[0]) {
            const canvasObj = fieldsObj.canvas[0];
            if (canvasObj) {
                canvas.height = canvasHeight;
                canvas.width = canvasObj.width;
                // canvasObj.height;
            }
        } else {
            const args = {
                ctx: canvas.getContext('2d'),
                centerY: canvas.height / 2,
                centerX: canvas.width / 2,
                canvas: canvas,
                lineWidth: 4,
                radius: 20,
                speed: 1,
                angle: 0
            };
            eSign.drawFrame(args);
        }
    }
    drawFrame(args) {
        const eSign = this;
        const ctx = args.ctx;
        ctx.clearRect(0, 0, args.canvas.width, args.canvas.height);
        
        ctx.beginPath();
        ctx.arc(args.centerX, args.centerY, args.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#3498db'; // Spinner color
        ctx.lineWidth = args.lineWidth;
        ctx.stroke();
        
        // Draw "Loading..." text
        ctx.font = '16px Arial'; // Adjust the font size and style as needed
        ctx.fillStyle = '#3498db'; // Text color
        ctx.textAlign = 'center';
        ctx.fillText('Loading...', args.centerX, args.centerY + args.radius + 30); // Adjust the Y coordinate as needed
        
        args.angle += args.speed;
        if (args.angle >= 360) {
            args.angle = 0;
        }
        
        ctx.save();
        ctx.translate(args.centerX, args.centerY);
        ctx.rotate((args.angle * Math.PI) / 180);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(args.radius, 0);
        ctx.strokeStyle = '#3498db'; // Spinner color
        ctx.lineWidth = args.lineWidth;
        ctx.stroke();
        ctx.restore();
        
        requestAnimationFrame(eSign.drawFrame(args));
    }
    
}
export default PROMPTS;