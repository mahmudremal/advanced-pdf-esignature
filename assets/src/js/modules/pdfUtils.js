import interact from 'interactjs';
import { PDFDocument, rgb, degrees, SVGPath, drawSvgPath, StandardFonts } from 'pdf-lib';
import SignaturePad from "signature_pad";
import {signaturePadEVENT} from "./signaturePad";

const STOREDATA = {i18n: {}};
const str_replace = (str) => {
  const searchNeedles = {'product.name': ''};
  Object.keys(searchNeedles).forEach((needle)=> {
      str = str.replaceAll(`{{${needle}}}`, searchNeedles[needle]);
  });
  return str;
}

export const do_field = (field, child = false, esitingData = {}) => {
  var fields, form, group, fieldset, input, label, span, option, head, image, others, body, div, info, tooltip, i = 0;
  div = document.createElement('div');if(!child) {div.classList.add('pdf_fields__group');}
  if((field?.heading??'') != '') {head = document.createElement('h2');head.innerHTML=str_replace(field?.heading??'');div.appendChild(head);}
  
  if((field?.subtitle??'')!='') {
      info = document.createElement('p');
      info.innerHTML=str_replace(field?.subtitle??'');
      div.appendChild(info);
  }
  
  input = label = false;
  fieldset = document.createElement('fieldset');
  fieldset.classList.add('pdf_fields__group__fieldset');
  label = document.createElement('label');
  label.innerHTML = str_replace(field?.label??'');
  label.setAttribute('for',`field_${field?.fieldID??i}`);
  if((field?.tooltip??'') != '') {
    tooltip = document.createElement('span');tooltip.classList.add('pdf_fields__tooltip');
    tooltip.setAttribute('tabindex', 1);tooltip.setAttribute('tooltip', field?.tooltip??'');
    tooltip.setAttribute('flow', 'up');tooltip.innerHTML = '?';label.appendChild(tooltip);
  }
  
  switch (field.type) {
      case 'textarea':
          input = document.createElement('textarea');input.classList.add('form-control');
          input.name = 'field.'+field.fieldID;
          input.placeholder = str_replace(field?.placeholder??'');
          input.id = `field_${field?.fieldID??i}`;
          input.innerHTML = esitingData[field.fieldID];
          Object.keys(field?.attr??{}).forEach((key)=>{input.setAttribute(key, field.attr[key])});
          // if(field?.dataset??false) {input.dataset = field.dataset;}
          input.dataset.fieldId = field.fieldID;
          break;
      case 'input':case 'text':case 'number':case 'date':case 'time':case 'local':case 'color':case 'range':
          input = document.createElement('input');input.classList.add('form-control');
          input.name = 'field.'+field.fieldID;input.id = `field_${field?.fieldID??i}`;
          input.setAttribute('value', esitingData[field.fieldID]);
          input.placeholder = str_replace(field?.placeholder??'');
          input.type = (field.type=='input')?'text':field.type;
          Object.keys(field?.attr??{}).forEach((key)=>{input.setAttribute(key, field.attr[key])});
          // if(field?.dataset??false) {input.dataset = field.dataset;}
          input.dataset.fieldId = field.fieldID;// input.value = field?.value??'';
          if(label) {fieldset.appendChild( label );}
          if(input) {fieldset.appendChild( input );}
          if(input || label) {div.appendChild(fieldset);}
          break;
      case 'select':
          input = document.createElement('select');input.classList.add('form-control');
          input.name = 'field.'+field.fieldID;input.id = `field_${field?.fieldID??i}`;
          // if(field?.dataset??false) {input.dataset = field.dataset;}
          input.dataset.fieldId = field.fieldID;
          Object.keys(field?.attr??{}).forEach((key)=>{input.setAttribute(key, field.attr[key])});
          (field?.options??[]).forEach((opt,i)=> {
              option = document.createElement('option');option.value=opt?.value??'';option.innerHTML=opt?.label??'';option.dataset.index = i;
              if(esitingData[field.fieldID] == option.value) {
                option.setAttribute('selected', true);
              }
              input.appendChild(option);
          });
          if(label) {fieldset.appendChild( label );}
          if(input) {fieldset.appendChild( input );}
          if(input || label) {div.appendChild(fieldset);}
          break;
      case 'doll':case 'radio':case 'checkbox':
          input = document.createElement('div');input.classList.add('form-wrap');
          field.options = (field.options)?field.options:[];
          field.type = (field.type == 'doll')?'radio':field.type;
          // field.options = field.options.reverse();
          Object.values(field.options).forEach((opt, optI)=> {
              if(opt && opt.label) {
                  label = document.createElement('label');label.classList.add('form-control-label', 'form-control-'+field.type);
                  // label.setAttribute('for', `field_${field?.fieldID??i}_${optI}`);
                  if(opt.input) {label.classList.add('form-flexs');}
                  span = document.createElement('span');
                  if(opt.imageUrl) {
                      image = document.createElement('img');image.src = opt.imageUrl;
                      image.alt = opt.label;label.appendChild(image);
                      label.classList.add('form-control-'+field.type+'__image');
                      input.classList.add('form-wrap__image');
                      if((opt?.thumbUrl??false) && opt.thumbUrl != '') {
                          image.src = opt.thumbUrl;image.dataset.outfit = opt.imageUrl;
                      }
                  }
                  if(!opt.input) {
                      span.innerHTML = opt.label+(
                          (opt?.cost??false)?(
                          ' <strong>'+(thisClass.config?.currencySign??'$')+''+ parseFloat(opt.cost).toFixed(2)+'</strong>'
                          ):''
                      );
                  } else {
                      others = document.createElement('input');others.type='text';
                      others.name='field.'+field.fieldID+'.others';others.placeholder=opt.label;
                      others.dataset.fieldId = field.fieldID;others.dataset.index = optI;
                      span.appendChild(others);
                  }
                  option = document.createElement('input');option.value=opt.label;
                  option.name='field.'+field.fieldID+'.option'+((field.type == 'checkbox')?'.' + optI:'');
                  if(option.value == esitingData[field.fieldID]) {option.setAttribute('checked', true);}
                  option.dataset.index = optI;option.dataset.fieldId = field.fieldID;
                  option.id=`field_${field?.fieldID??i}_${optI}`;option.type=field.type;
                  if(field?.layer??false) {option.dataset.layer=field.layer;}
                  if((opt?.cost??'') == '') {opt.cost = '0';}option.dataset.cost=opt.cost;
                  if(child) {option.dataset.preview=child;}
                  label.appendChild(option);label.appendChild(span);input.appendChild(label);
                  fieldset.appendChild(input);div.appendChild(fieldset);
              }
          });
          break;
      case 'password':
          group = document.createElement('div');group.classList.add('input-group', 'mb-3');
          input = document.createElement('input');input.classList.add('form-control');
          input.name = 'field.'+field.fieldID;input.setAttribute('value', esitingData[field.fieldID]);
          input.placeholder = str_replace(field?.placeholder??'');
          input.id = `field_${field?.fieldID??i}`;input.type = (field.type=='input')?'text':field.type;
          Object.keys(field?.attr??{}).forEach((key)=>{input.setAttribute(key, field.attr[key])});
          // if(field?.dataset??false) {input.dataset = field.dataset;}
          input.dataset.fieldId = field.fieldID;
          var eye = document.createElement('div');
          eye.classList.add('input-group-append', 'toggle-password');
          eye.innerHTML = '<i class="fa fa-eye"></i>';
          group.appendChild(input);group.appendChild(eye);
          if(label) {fieldset.appendChild(label);}
          if(input) {fieldset.appendChild(group);}
          if(input || label) {div.appendChild(fieldset);}
          break;
      case 'confirm':
          input = document.createElement('div');input.classList.add('the-success-icon');
          input.innerHTML = field?.icon??'';
          fieldset.appendChild(input);div.appendChild(fieldset);
          break;
      case 'voice':
          input = document.createElement('div');input.classList.add('do_recorder');
          // if(field?.dataset??false) {input.dataset = field.dataset;}
          input.innerHTML = field?.icon??'';input.dataset.cost = field?.cost??0;
          fieldset.appendChild(input);div.appendChild(fieldset);
          break;
      case 'outfit':
          fields = document.createElement('div');fields.classList.add('form-fields', 'form-pdf_fields__group', 'form-pdf_fields__group__'+(field.type).replaceAll(' ', ''));
          (field?.groups??[]).forEach((group, groupI)=> {
              group.fieldID = (field?.fieldID??0)+'.'+(group?.fieldID??groupI);
              fields.appendChild(do_field(group, true));
          });
          fieldset.appendChild(fields);div.appendChild(fieldset);
          break;
      case 'info':
          fields = document.createElement('div');fields.classList.add('form-fields', 'form-pdf_fields__group', 'form-pdf_fields__group__'+(field.type).replaceAll(' ', ''));
          // field.groups = field.groups.reverse();
          var inputsArgs = {}, inputs = {
              teddy_name: {
                  type: 'text',
                  // label: STOREDATA.i18n?.teddyname??'DubiDo\'s Name',
                  placeholder: STOREDATA.i18n?.teddyfullname??'Teddy full Name',
                  dataset: {title: STOREDATA.i18n?.teddyfullname??'Teddy full Name'}
              },
              teddy_birth: {
                  type: 'date', // default: new Date().toLocaleDateString('en-US'),
                  // label: STOREDATA.i18n?.teddybirth??'DubiDo\'s Birthday',
                  placeholder: STOREDATA.i18n?.teddybirth??'Birth date',
                  dataset: {title: STOREDATA.i18n?.teddybirth??'Birth date'}
              },
              teddy_sender: {
                  type: 'text',
                  // label: STOREDATA.i18n?.sendersname??'Sender\'s Name',
                  placeholder: STOREDATA.i18n?.sendersname??'Sender\'s Name',
                  dataset: {title: STOREDATA.i18n?.sendersname??'Sender\'s Name'}
              },
              teddy_reciever: {
                  type: 'text',
                  // label: STOREDATA.i18n?.recieversname??'Reciever\'s Name',
                  placeholder: STOREDATA.i18n?.recieversname??'Reciever\'s Name',
                  dataset: {title: STOREDATA.i18n?.recieversname??'Reciever\'s Name'}
              }
          };
          Object.keys(inputs).forEach((type, typeI)=>{
              inputsArgs = {
                  fieldID: (field?.fieldID??0)+'.'+(type?.fieldID??typeI),
                  ...inputs[type]
              };
              if(field[type] == 'on') {fields.appendChild(do_field(inputsArgs, true));}
          });
          fieldset.appendChild(fields);div.appendChild(fieldset);
          break;
      default:
          // console.log('Failed implimenting '+field.type);
          input = label = false;
          break;
  }
  i++;
  if((field?.extra_fields??false)) {
    field.extra_fields.forEach((extra)=>{
      div.appendChild(do_field(extra, true));
    });
  }
  return div;
}

export const renderPages = (numPages, pdf) => {
  const pdfPreview = document.querySelector('#signature-builder');
  pdfPreview.querySelectorAll('canvas').forEach((el)=>{el.remove();});
  for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
    const pdfCanvas = document.createElement('canvas');
    pdf.getPage(pageNumber).then(function (page) {
      // Set the canvas dimensions to the PDF page dimensions
      const viewport = page.getViewport({scale: 2});
      pdfCanvas.width = viewport.width;
      pdfCanvas.height = viewport.height;

      // Render the PDF page on the canvas
      const context = pdfCanvas.getContext('2d');
      const renderContext = {canvasContext: context,viewport: viewport};
      page.render(renderContext);
    });
    pdfPreview.appendChild(pdfCanvas);
  }
}
export const addElementToPDF = (field, position, thisClass, data = false) => {
  const config = JSON.parse(field.querySelector('.esign-fields__handle').dataset?.config??'{}');
  if(!(thisClass?.fieldsData??false)) {thisClass.fieldsData = [];}
  const args = {unique: (thisClass.fieldsData.length+1), ...config};
  thisClass.fieldsData.push(args);
  const addedElement = document.createElement('div');
  addedElement.classList.add('esign-body__single');
  addedElement.dataset.storedOn = args.unique;
  if(position.dx && (position?.canvas??false)) {}
  // if(position.dx) {addedElement.style.left = position.dx + 'px';addedElement.dataset.x = position.dx;}
  // if(position.dy) {addedElement.style.top = position.dy + 'px';addedElement.dataset.y = position.dy;}
  if(position.height) {addedElement.style.height = position.height;}
  if(position.width) {addedElement.style.width = position.width;}
  if(position.dx) {addedElement.dataset.x = position.dx;}
  if(position.dy) {addedElement.dataset.y = position.dy;}
  if(position.dx || position.dy) {
    addedElement.style.transform = (
      (position.dx && !position.dy)?'translateX('+position.dx+'px)':(
        (!position.dx && position.dy)?'translateY('+position.dy+'px)':(
          (position.dx && position.dy)?'translate('+position.dx+'px, '+position.dy+'px)':'unset'
        )
      )
    );
  }
  addedElement.innerHTML = `
    <div class="esign-body__single__title">${args?.title??'eSignature'}</div>
    ${(thisClass.isFrontend)?``:`
    <button type="button" class="btn btn-default btn-xs remove">
      <span class="dashicons-before dashicons-trash"></span>
    </button>
    `}
  `;
  if(thisClass.isFrontend) {
    
  if((data?.field??'') == 'date') {
    const date_formate = (((data?.data??{})?.field??{})['2'] == '')?'M d, Y':(((data?.data??{})?.field??{})['2']);
    const currentDate = new Date();
    addedElement.innerHTML = currentDate.getMonth()+' '+currentDate.getDate()+', '+currentDate.getFullYear();
  } else if((data?.field??'') == 'time') {
    const date_formate = (((data?.data??{})?.field??{})['2'] == '')?'H:i:s':(((data?.data??{})?.field??{})['2']);
    const currentDate = new Date();
    addedElement.innerHTML = currentDate.getHours()+':'+currentDate.getMinutes()+':'+currentDate.getSeconds();
  } else {}
  }
  if(!thisClass.isFrontend) {init_dragging(addedElement);}
  addedElement.addEventListener('click', (event) => {
    if(thisClass.isFrontend) {
      if((data?.field??'') == 'sign') {
        // alert('Signature poup is under development');
        thisClass.eSignVex = thisClass.vex.dialog.open({
          showCloseButton: true,
          escapeButtonCloses: false,
          overlayClosesOnClick: false,
          unsafeMessage: `
          <!-- <div class="modal micromodal-slide is-open" id="modal-esignature" aria-hidden="true">
            <div class="modal__overlay" tabindex="-1"> -->
              <!-- Removed data-micromodal-close attribute from the overlay to disable closing on outside click -->
              <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">
              <div class="modal__header">
                <h2 class="modal__title" id="modal-1-title">E-Signature Pad.</h2>
                <!-- <button class="modal__close" aria-label="Close modal" data-esign-popup-close="true"></button> -->
              </div>
              <div class="modal__content" id="modal-1-content">
                <div class="modal__content__wrap">
                  
                  <div id="signature-pad" class="signature-pad">
                    <div class="signature-pad__body">
                      <canvas class="modal__content__canvas" id="signatureCanvas"></canvas>
                    </div>
                    <div class="signature-pad__footer">
                      <div class="description">Sign above</div>

                      <div class="signature-pad__actions">
                        <div class="column">
                          <button type="button" class="button clear" data-action="clear">Clear</button>
                          <input type="color" class="button" data-action="change-background-color" title="Change background color" data-title="BG">
                          <input type="color" class="button" data-action="change-color" title="Change color" data-title="Color">
                          <button type="button" class="button" data-action="change-width">Change width</button>
                          <input type="file" class="button" data-action="change-uploaded" title="Upload Signature" data-title="Upload" accept="image/*">
                          <button type="button" class="button" data-action="undo">Undo</button>

                        </div>
                        <div class="column">
                          <button type="button" class="button save" data-action="save-png">Save as PNG</button>
                          <button type="button" class="button save" data-action="save-jpg">Save as JPG</button>
                          <button type="button" class="button save" data-action="save-svg">Save as SVG</button>
                          <button type="button" class="button save" data-action="save-svg-with-background">Save as SVG with background</button>
                        </div>
                      </div>
                    </div>
                  </div>


                </div>
              </div>
              <div class="modal__footer">
                <button class="modal__btn modal__btn-primary" data-esign-popup-proceed="true">Continue</button>
                <button class="modal__btn" data-esign-popup-close="true" aria-label="Close this dialog window">Close</button>
              </div>
              </div>
            <!-- </div>
          </div> -->
          `,
          buttons: [
            {
              text: 'OK',
              type: 'button',
              className: 'vex-dialog-button-primary',
              click: function () {
                importSignature2Element(thisClass, addedElement);
              },
            },
            {
              text: 'Cancel',
              type: 'button',
              className: 'vex-dialog-button-secondary',
              click: function () {
                thisClass.vex.close(thisClass.eSignVex);
              },
            },
          ],
          // callback: function (data = false) {
          //   // Handle the modal closing (optional)
          //   // console.log('Modal closed', data);
          // },
        });
        // console.log(data);
        
        setTimeout(() => {
          init_eSignature(addedElement, thisClass);
          document.querySelectorAll('[data-esign-popup-close]').forEach((el)=>{
            el.addEventListener('click', (e) => {thisClass.vex.close(thisClass.eSignVex);});
          });
        }, 500);
      } else {}
    } else {
      const eSignBuilder = document.querySelector('.pdf_builder__fields');
      if(!eSignBuilder) {return;}eSignBuilder.classList.add('settings_enabled');
      const stored = (thisClass?.fieldsData??[]).find((row)=>row.unique==addedElement.dataset.storedOn);
      const field = (thisClass?.fields??[]).find((row)=>row.id==stored.id);
      const esitingData = (data?.data??{})?.field??{};

      var body, wrap, fieldHTML;
      body = document.querySelector('.pdf_builder__fields__settings__body');
      wrap = stored?.html??false;
      if(!wrap) {
        wrap = document.createElement('form');wrap.classList.add('pdf_fields');
        (field?.fields??[]).forEach((field) => {
          fieldHTML = do_field(field, false, esitingData);
          wrap.appendChild(fieldHTML);
        });
        stored.html = wrap;
      }
      // Push it on FIELD BODY
      body.innerHTML = '';body.appendChild(stored.html);
    }
  });
  addedElement.querySelectorAll('.remove').forEach((trash)=>{
    trash.addEventListener('click', (event) => {
      event.preventDefault();
      if(confirm('Are you sure?')) {
        trash.parentElement.remove();
        document.querySelector('.pdf_builder__fields').classList.remove('settings_enabled');
      }
    });
  });
  // Append the added element to the canvas container
  document.querySelector('#signature-builder').appendChild(addedElement);
  if(!thisClass.isFrontend) {setTimeout(() => {addedElement.click();}, 800);}
}
export const init_dragging = (el) => {
  interact(el)
  .resizable({
    // resize from all edges and corners
    edges: { left: true, right: true, bottom: true, top: true },

    listeners: {
      move (event) {
        var target = event.target
        var x = (parseFloat(target.getAttribute('data-x')) || 0)
        var y = (parseFloat(target.getAttribute('data-y')) || 0)

        // update the element's style
        target.style.width = event.rect.width + 'px'
        target.style.height = event.rect.height + 'px'

        // translate when resizing from top or left edges
        x += event.deltaRect.left
        y += event.deltaRect.top

        target.style.transform = 'translate(' + x + 'px,' + y + 'px)'

        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)
        // target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
      }
    },
    modifiers: [
      // keep the edges inside the parent
      interact.modifiers.restrictEdges({
        outer: 'parent'
      }),

      // minimum size
      interact.modifiers.restrictSize({
        min: {width: 100, height: 20}
      })
    ],

    inertia: true
  })
  .draggable({
    listeners: { move: window.dragMoveListener },
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true
      })
    ],
    restrict: {
        restriction: 'parent', endOnly: true,
        elementRect: {top: 0, left: 0, bottom: 1, right: 1},
    },
    onmove: function (event) {
        const target = event.target;const pdfCanvas = document.querySelector('#signature-builder');
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // Update the element's position
        target.style.transform = `translate(${x}px, ${y}px)`;

        // Store the new position
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    },
  })
}
export const initDragAndDropFeature = (el) => {
  interact(el)
  .resizable({
    // resize from all edges and corners
    edges: { left: true, right: true, bottom: true, top: true },

    listeners: {
      move (event) {
        var target = event.target
        var x = (parseFloat(target.getAttribute('data-x')) || 0)
        var y = (parseFloat(target.getAttribute('data-y')) || 0)

        // update the element's style
        target.style.width = event.rect.width + 'px'
        target.style.height = event.rect.height + 'px'

        // translate when resizing from top or left edges
        x += event.deltaRect.left
        y += event.deltaRect.top

        target.style.transform = 'translate(' + x + 'px,' + y + 'px)'

        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)
        target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
      }
    },
    modifiers: [
      // keep the edges inside the parent
      interact.modifiers.restrictEdges({
        outer: 'parent'
      }),

      // minimum size
      interact.modifiers.restrictSize({
        min: { width: 100, height: 50 }
      })
    ],

    inertia: true
  })
  .draggable({
    listeners: { move: window.dragMoveListener },
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true
      })
    ],
    restrict: {
        restriction: 'parent', endOnly: true,
        elementRect: {top: 0, left: 0, bottom: 1, right: 1},
    },
    onmove: function (event) {
        const target = event.target;const pdfCanvas = document.querySelector('#pdfCanvas');
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        console.log([
          event.dx, event.dy, pdfCanvas.clientWidth, pdfCanvas.clientHeight
        ]);
        // Update the element's position
        target.style.transform = `translate(${x}px, ${y}px)`;

        // Store the new position
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    },
  })
}
export const previewPDFile = (file) => {
  if (!file) {return;}
  
  const canvasContainer = document.getElementById('pdfContainer');
  const fileReader = new FileReader();
  fileReader.onload = function () {
      const typedArray = new Uint8Array(this.result);
      // Load the PDF file using PDF.js
      pdfjsLib.getDocument(typedArray).promise.then(function (pdf) {
          renderPages(pdf.numPages, pdf);
      });
  };

  fileReader.readAsArrayBuffer(file);
}
export const dragFromRight2Left = (thisClass) => {
  interact('.esign-fields__single').draggable({
    inertia: true, autoScroll: true,
    restrict: {
        restriction: 'parent', endOnly: true,
        elementRect: {top: 0, left: 0, bottom: 1, right: 1},
    },
    onend: function (event) {
        const target = event.target;
        const pdfContainer = document.querySelector('#signature-builder');
        const dropPosition = {
            // dx: event.pageX - pdfContainer.offsetLeft,
            // dy: event.pageY - pdfContainer.offsetTop,
        };
        console.log({
          dx: event.pageX - pdfContainer.offsetLeft,
          dy: event.pageY - pdfContainer.offsetTop,
        });
        addElementToPDF(target, dropPosition, thisClass);
    },
  });
}

export const loadPreviousFields = (thisClass) => {
  const custom_fields = thisClass.prompts.lastJson.signature.custom_fields;
  const fields = custom_fields.fields;const canvas = custom_fields.canvas;
  fields.forEach((row)=>{var proceed = true;
    if(thisClass.isFrontend && thisClass.config.user_id != ((row?.data??{})?.field??{})['1']) {
      proceed = false;// console.log(row, fields);
    }
    if(proceed) {
      row.canvas = canvas[0];// console.log(row);
      var fieldRow = thisClass.fields.find((rowf)=>rowf.id==row.field);
      var field = document.createElement('div');field.classList.add('esign-fields__single');
      var handle = document.createElement('div');handle.classList.add('esign-fields__handle');
      handle.dataset.config = JSON.stringify({id: fieldRow?.id??'', title: fieldRow?.title??''});
      field.appendChild(handle);var position = row;addElementToPDF(field, position, thisClass, row);
    }
  });
}

export const init_eSignature = async (addedElement, thisClass) => {
  // Implement signature capturing using signature_pad
  const signatureCanvas = document.getElementById('signatureCanvas');
  thisClass.signaturePad = new SignaturePad(signatureCanvas, {
    // backgroundColor: 'rgb(255, 255, 255)'
  });
  signaturePadEVENT(thisClass);
  
  document.querySelectorAll('[data-esign-popup-proceed]').forEach((el)=>{
    el.addEventListener('click', (event) => {
      importSignature2Element(thisClass, addedElement);
    });
  });
}

// Function to add signature to PDF using pdf-lib
async function addSignatureToPDF(pdfBytes, signatureDataUrl) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  // Decode the data URL and create a pdf-lib image object from it
  const signatureImageBytes = Buffer.from(signatureDataUrl.split(',')[1], 'base64');
  const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
  // Define the signature position on the PDF page
  const signatureWidth = 100;
  const signatureHeight = 50;
  const x = 100;const y = 100;
  // Draw the signature image on the PDF page
  firstPage.drawImage(signatureImage, {
    x, y,
    width: signatureWidth,
    height: signatureHeight,
    opacity: 0.8, // You can adjust the opacity as needed
  });
  // Serialize the PDF with the signature added
  const modifiedPdfBytes = await pdfDoc.save();
  return modifiedPdfBytes;
}
export const upload_esignature = async (thisClass) => {
  // <input type="file" id="signatureInput" accept="image/*">
  // <button id="uploadButton">Upload Signature</button>
  const signatureInput = document.getElementById('signatureInput');
  const uploadButton = document.getElementById('uploadButton');
  uploadButton.addEventListener('click', () => {signatureInput.click();});
  signatureInput.addEventListener('change', async (event) => {
    // Get the selected file
    const file = event.target.files[0];

    // Check if a file was selected
    if (file) {
      // Read the file as a data URL
      const reader = new FileReader();
      reader.readAsDataURL(file);

      // Handle the data URL after reading is complete
      reader.onloadend = async () => {
        const signatureDataUrl = reader.result; // The signature data URL

        // Use the pdf-lib and the addSignatureToPDF function from the previous example
        // to add the signature to the PDF
        const originalPdfBytes = '...'; // Load your original PDF bytes here
        const modifiedPdfBytes = await addSignatureToPDF(originalPdfBytes, signatureDataUrl);

        // Now you have the modified PDF with the uploaded signature (modifiedPdfBytes)
        // You can save it, send it to the client, or use it as needed
      };
    }
  });
  
}
export const importSignature2Element = async (thisClass, addedElement) => {
  if(thisClass.signaturePad.isEmpty()) {
    thisClass.toastify({text: 'Please provide a signature.',className: "warning", duration: 3000, stopOnFocus: true, style: {background: "linear-gradient(to right, rgb(255 200 153), rgb(255 166 33))"}}).showToast();
  } else {
    const signatureDataUrl = thisClass.signaturePad.toDataURL('image/png');
    // console.log(signatureDataUrl);
    // const originalPdfBytes = '...'; // Load your original PDF bytes here
    // const modifiedPdfBytes = await addSignatureToPDF(originalPdfBytes, signatureDataUrl);

    addedElement.querySelectorAll('img').forEach((img)=>{img.remove();});
    const sign_image = document.createElement('img');
    sign_image.src = signatureDataUrl;
    addedElement.classList.add('signpreview');
    addedElement.appendChild(sign_image);
    
    thisClass.vex.close(thisClass.eSignVex);
  }
}