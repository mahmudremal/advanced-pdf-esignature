// import interact from 'interactjs';
// import {PDFDocument, rgb, degrees, SVGPath, drawSvgPath, StandardFonts} from 'pdf-lib';
// import SignaturePad from "signature_pad";
import Pad from './signaturePad';
// import {format as date_formate} from 'date-fns';
// import canvasPdf from "./canvasPdf";
// import tippy from 'tippy.js';
import Events from "./events"


// extends canvasPdf
class PDFUtils extends Events {
  constructor(thisClass) {
    super(thisClass);
    this.data = true;
    this.widgets = [];
    this.oneCanvas = false;
    this.uploadedPDF = false;
    this.signatureExists = false;
    this.STOREDATA = {i18n: {}};
    // 
    this.setup_i18n(thisClass);
    this.setup_hooks(thisClass);
  }
  setup_hooks(thisClass) {
  }
  setup_i18n(thisClass) {
    this.i18n = thisClass.i18n;
  }

  do_field(field, child = false, esitingData = {}, thisClass) {
    const eSign = this;
    var fields, form, group, fieldset, input, label, span, option, head, image, others, body, div, info, tooltip, i = 0;
    div = document.createElement('div');if (!child) {div.classList.add('pdf_fields__group');}
    if ((field?.heading??'') != '') {head = document.createElement('h2');head.innerHTML = eSign.str_replace(field?.heading??'');div.appendChild(head);}
    
    if ((field?.subtitle??'')!='') {
        info = document.createElement('p');
        info.innerHTML = eSign.str_replace(field?.subtitle??'');
        div.appendChild(info);
   }
    
    input = label = false;
    fieldset = document.createElement('fieldset');
    fieldset.classList.add('pdf_fields__group__fieldset');
    label = document.createElement('label');
    label.innerHTML = eSign.str_replace(field?.label??'');
    label.setAttribute('for',`field_${field?.fieldID??i}`);
    if ((field?.tooltip??'') != '') {
      tooltip = document.createElement('span');// tooltip.classList.add('pdf_fields__tooltip');
      tooltip.setAttribute('tabindex', 1);tooltip.setAttribute('tooltip', field?.tooltip??'');
      tooltip.setAttribute('flow', 'up');tooltip.innerHTML = '?';label.appendChild(tooltip);
      // 
      thisClass.tippy(tooltip, {content: field.tooltip});
   }
    
    switch (field.type) {
      case 'textarea':
        input = document.createElement('textarea');input.classList.add('form-control');
        input.name = 'field.'+field.fieldID;
        input.placeholder = eSign.str_replace(field?.placeholder??'');
        input.id = `field_${field?.fieldID??i}`;
        input.innerHTML = esitingData[field.fieldID];
        Object.keys(field?.attr??{}).forEach((key) => {input.setAttribute(key, field.attr[key])});
        // if (field?.dataset??false) {input.dataset = field.dataset;}
        input.dataset.fieldId = field.fieldID;
        break;
      case 'input':case 'text':case 'number':case 'date':case 'time':case 'local':case 'color':case 'range':
        input = document.createElement('input');input.classList.add('form-control');
        input.name = 'field.'+field.fieldID;input.id = `field_${field?.fieldID??i}`;
        input.setAttribute('value', esitingData?.[field.fieldID]??(field?.default??''));
        input.placeholder = eSign.str_replace(field?.placeholder??'');
        input.type = (field.type=='input')?'text':field.type;
        Object.keys(field?.attr??{}).forEach((key) => {input.setAttribute(key, field.attr[key])});
        // if (field?.dataset??false) {input.dataset = field.dataset;}
        input.dataset.fieldId = field.fieldID;// input.value = field?.value??'';
        if (label) {fieldset.appendChild( label );}
        if (input) {fieldset.appendChild( input );}
        if (input || label) {div.appendChild(fieldset);}
        break;
      case 'select':
        input = document.createElement('select');input.classList.add('form-control');
        input.name = 'field.'+field.fieldID;input.id = `field_${field?.fieldID??i}`;
        // if (field?.dataset??false) {input.dataset = field.dataset;}
        input.dataset.fieldId = field.fieldID;
        Object.keys(field?.attr??{}).forEach((key) => {input.setAttribute(key, field.attr[key])});
        if (field?.options && field.options == 'users') {field.options = eSign.database.users;}
        (field?.options??[]).forEach((opt,i) =>  {
          option = document.createElement('option');option.value=opt?.value??'';option.innerHTML=opt?.label??'';option.dataset.index = i;
          if (esitingData[field.fieldID] == option.value) {
            option.setAttribute('selected', true);
          }
          input.appendChild(option);
        });
        if (label) {fieldset.appendChild( label );}
        if (input) {fieldset.appendChild( input );}
        if (input || label) {div.appendChild(fieldset);}
        break;
      case 'radio':case 'checkbox':
        var group = document.createElement('div');group.classList.add('form-area');
        var title = document.createElement('span');title.classList.add('field_title');
        var tooltip = document.createElement('span');tooltip.classList.add('field_title');
        title.innerHTML = field?.label??'';
        tooltip.setAttribute('tooltip', field.tooltip);tooltip.innerHTML = '?';
        group.appendChild(title);group.appendChild(tooltip);fieldset.appendChild(group);
        // <label for="field_user">Signer<span tabindex="1" tooltip="Select an user as signer for this field. This is required." flow="up">?</span></label>
        input = document.createElement('div');input.classList.add('form-wrap', 'form-wrap__'+field.type);
        field.options = (field.options)?field.options:[];
        // field.options = field.options.reverse();
        Object.values(field.options).forEach((opt, optI) =>  {
          if (opt && opt.label) {
            label = document.createElement('label');label.classList.add('form-control-label', 'form-control-'+field.type);
            // label.setAttribute('for', `field_${field?.fieldID??i}_${optI}`);
            if (opt.input) {label.classList.add('form-flexs');}
            span = document.createElement('span');
            if (opt.imageUrl) {
              image = document.createElement('img');image.src = opt.imageUrl;
              image.alt = opt.label;label.appendChild(image);
              label.classList.add('form-control-'+field.type+'__image');
              input.classList.add('form-wrap__image');
              if ((opt?.thumbUrl??false) && opt.thumbUrl != '') {
                image.src = opt.thumbUrl;image.dataset.outfit = opt.imageUrl;
              }
            }
            if (!opt.input) {
              span.innerHTML = opt.label;
            } else {
              others = document.createElement('input');others.type='text';
              others.name='field.'+field.fieldID+'.others';others.placeholder=opt.label;
              others.dataset.fieldId = field.fieldID;others.dataset.index = optI;
              span.appendChild(others);
            }
            option = document.createElement('input');option.value=opt.label;
            option.name='field.'+field.fieldID+'.option'+((field.type == 'checkbox')?'.' + optI:'');
            if (option.value == esitingData[field.fieldID]) {option.setAttribute('checked', true);}
            option.dataset.index = optI;option.dataset.fieldId = field.fieldID;
            option.id=`field_${field?.fieldID??i}_${optI}`;option.type=field.type;
            if (field?.layer??false) {option.dataset.layer=field.layer;}
            if ((opt?.cost??'') == '') {opt.cost = '0';}option.dataset.cost=opt.cost;
            if (child) {option.dataset.preview=child;}
            label.appendChild(option);label.appendChild(span);input.appendChild(label);
            fieldset.appendChild(input);div.appendChild(fieldset);
          }
        });
        break;
      case 'password':
        group = document.createElement('div');group.classList.add('input-group', 'mb-3');
        input = document.createElement('input');input.classList.add('form-control');
        input.name = 'field.'+field.fieldID;
        input.setAttribute('value', esitingData?.[field.fieldID]??(field?.default??''));
        input.placeholder = eSign.str_replace(field?.placeholder??'');
        input.id = `field_${field?.fieldID??i}`;input.type = (field.type=='input')?'text':field.type;
        Object.keys(field?.attr??{}).forEach((key) => {input.setAttribute(key, field.attr[key])});
        // if (field?.dataset??false) {input.dataset = field.dataset;}
        input.dataset.fieldId = field.fieldID;
        var eye = document.createElement('div');
        eye.classList.add('input-group-append', 'toggle-password');
        eye.innerHTML = '<i class="fa fa-eye"></i>';
        group.appendChild(input);group.appendChild(eye);
        if (label) {fieldset.appendChild(label);}
        if (input) {fieldset.appendChild(group);}
        if (input || label) {div.appendChild(fieldset);}
        break;
      case 'confirm':
        input = document.createElement('div');input.classList.add('the-success-icon');
        input.innerHTML = field?.icon??'';
        fieldset.appendChild(input);div.appendChild(fieldset);
        break;
      default:
        // console.log('Failed implimenting '+field.type);
        input = label = false;
        break;
    }
    i++;
    if ((field?.extra_fields??false)) {
      field.extra_fields.forEach((extra) => {
        div.appendChild(
          eSign.do_field(extra, true, {}, thisClass)
        );
      });
   }
    return div;
  }
  async renderPages(numPages, pdf, thisClass) {
    const eSign = this;
    const pdfPreview = document.querySelector('#signature-builder');
    // pdfPreview.querySelectorAll('canvas').forEach((el) => {el.remove();});
    const promises = [];eSign.pdfCanvases = [];
    eSign.pdfPreview = pdfPreview;
    let xOffset = 0; let yOffset = 0;
    for(let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
      const pagePromise = new Promise(async (resolve, reject) => {
        try {
          if (eSign.oneCanvas) {
            await pdf.getPage(pageNumber).then((page) => {
              eSign.canvasPdf_load_page(page);
              
              // const canvas = document.createElement('canvas');
              // const context = canvas.getContext('2d');
              // // console.log(page.view);
              // // Set the canvas dimensions
              // canvas.id = 'signatureCanvas';
              // canvas.width = page.view[2];
              // canvas.height = page.view[3];
  
              // // Render the PDF page on the canvas
              // const viewport = page.getViewport({scale: 4});
              // const renderContext = {canvasContext: context, viewport: viewport};
              // page.render(renderContext).promise.then(() => {
              //   // Convert the canvas to a Phaser image
              //   eSign.images.push({
              //     order: pageNumber,
              //     id: `page-${pageNumber}`, src: false,
              //     width: viewport.width, height: viewport.height,
              //     // width: 200, height: 250, 
              //     canvas: canvas, xOffset: xOffset, yOffset: yOffset
              //  });
                resolve();
              //});
            });
            // pdfCanvas.toBlob((blob) => {
            //   const dataUrl = URL.createObjectURL(blob);
            //});
         } else {
            const page = await pdf.getPage(pageNumber);
            const pdfCanvas = document.createElement('canvas');
            // const pdfCanvas = document.querySelector('#contractCanvas');
            const pageViewport = page.getViewport({scale: 2});
            const context = pdfCanvas.getContext('2d');
            const renderContext = {canvasContext: context, viewport: pageViewport, textRenderingMode: "smooth"};
            pdfCanvas.dataset.pageOrder = pageNumber;
            pdfCanvas.width = pageViewport.width;
            pdfCanvas.height = pageViewport.height;
            pdfCanvas.style.width = pageViewport.width + 'px';
            pdfCanvas.style.height = pageViewport.height + 'px';
            await page.render(renderContext).promise;
    
            eSign.pdfCanvases.push({
              order: pageNumber,
              canvas: pdfCanvas
            });
            // eSign.pdfPreview.appendChild(pdfCanvas);
            resolve(); // Resolve the promise
         }
       } catch (error) {reject(error);}
      });
  
      promises.push(pagePromise);
    }
    // Wait for all page promises to resolve
    await Promise.all(promises).then(res => {
      eSign.pdfCanvases = eSign.pdfCanvases.sort((a, b) => a.order - b.order);
      const pdfCanvas = document.querySelector('#contractCanvas');
      eSign.renderMultipleCanvases(
        eSign.pdfCanvases, // .map(row => row.canvas)
        pdfCanvas
      );
      return pdfCanvas;
    }).then(pdfCanvas => {
      // Add event listener to detect mouse movements on the destination canvas
      const totalHeight = eSign.pdfCanvases.map(page => page.canvas.height).reduce((accumulator, currentValue) => accumulator + currentValue)
      const maxWidth = Math.max(0, ...eSign.pdfCanvases.map(page => page.canvas.width));
      const cssRatio = [1, totalHeight/maxWidth];
      pdfCanvas.style.aspectRatio = cssRatio.join('/');
      eSign.canvas = {
        rect: {},
        width: maxWidth,
        element: pdfCanvas,
        height: totalHeight,
        cssRatio: cssRatio,
        ratio: {width: 1, height: 1},
        bounding: () => pdfCanvas.getBoundingClientRect()
      };
      
      eSign.canvas.ratio = {
        update: () => {
          const canvasRect = eSign.canvas.bounding();
          eSign.canvas.ratio.width = canvasRect.width / eSign.canvas.width;
          eSign.canvas.ratio.height = canvasRect.height / eSign.canvas.height;
          return eSign.canvas.ratio;
        },
      };
      eSign.canvas.ratio.update();
      pdfCanvas.addEventListener('mousemove', event => {
        eSign.event_mousemove(event, thisClass);
      });
      pdfCanvas.addEventListener('click', event => {
        eSign.event_mouseclick(event, thisClass);
      });
      return pdfCanvas;
    }).then(pdfCanvas => {
      eSign.loadPreviousFields(thisClass);
    });
    return true;
  }
  renderMultipleCanvases(canvasRows, destinationCanvas) {
    const eSign = this;
    // Get the context of the destination canvas
    const destCtx = destinationCanvas.getContext('2d');
    // Find the maximum width and total height of all canvasRows
    let maxWidth = 0;
    eSign.totalHeight = 0;
    canvasRows.forEach(canvasRow => {
      if (canvasRow.canvas.width > maxWidth) {
        maxWidth = canvasRow.canvas.width;
      }
      eSign.totalHeight += canvasRow.canvas.height;
    });
    // Set the destination canvas width and height
    destinationCanvas.width = maxWidth;
    destinationCanvas.height = eSign.totalHeight;
    // Loop through each source canvas
    let offsetY = 0;
    canvasRows.forEach(canvasRow => {
      // Calculate the horizontal position for centering
      canvasRow.offsetX = (maxWidth - canvasRow.canvas.width) / 2;
      canvasRow.offsetY = offsetY;
      canvasRow.maxWidth = maxWidth;
      // Get the context of the source canvas
      const ctx = canvasRow.canvas.getContext('2d');
      // Draw the contents of the source canvas onto the destination canvas
      destCtx.drawImage(canvasRow.canvas, canvasRow.offsetX, canvasRow.offsetY);
      // Update the Y offset for the next canvas
      offsetY += canvasRow.canvas.height;
    });
  }
  addElementToPDF(field, position, thisClass, data = false) {
    const eSign = this;const widget = (data)?data:{};widget.args = widget.args || {};
    if (thisClass.isFrontend && position?.signDone) {return;}
    // 
    // let's fix position objects methods
    position.height = (typeof position.height == 'string')?parseFloat(position.height.replace('px', '')):position.height;
    position.width = (typeof position.width == 'string')?parseFloat(position.width.replace('px', '')):position.width;
    const config = JSON.parse(field.querySelector('.esign-fields__handle').dataset?.config??'{}');
    if (!(thisClass?.fieldsData??false)) {thisClass.fieldsData = [];}
    const args = {unique: (thisClass.fieldsData.length+1), ...config};
    thisClass.fieldsData.push(args);

    if (thisClass.isFrontend) {
      const canvas = (widget.args?.ctx && widget.args.ctx?.canvas)?widget.args.ctx.canvas:eSign.canvas.element;
      const ctx = widget.args.ctx || canvas.getContext('2d');
      widget.bBox = {
        topLeft:      {x: widget.dx, y: widget.dy},
        bottomLeft:   {x: widget.dx, y: widget.dy + widget.height},
        topRight:     {x: widget.dx + widget.width, y: widget.dy},
        bottomRight:  {x: widget.dx + widget.width, y: widget.dy + widget.height}
      };
      widget.onClick = (event, widget, thisClass) => {
        eSign.launch_signature_operation(event, widget, thisClass);
      };
      widget.args = {
        borderStyle: 'dotted',
        boxTitle: args.title,
        borderColor: 'blue',
        fontFamily: 'Arial',
        borderGap: [3, 3],
        isPreview: false,
        borderWidth: 1,
        fontSize: 20,
        ...widget.args,
        ctx: ctx
      };
      // if (!(widget?.enableSign)) {widget.args.isPreview = true;}
      const currentDate = new Date();
      switch (widget?.field) {
        case 'sign':
          if (widget?.enableSign && ((widget?.data)?.field)?.user_name) {} else {
            widget.args.boxTitle = widget.data.field.user_name;
          }
          break;
        case 'date':
          var format = ((((data?.data??{})?.field??{})?.format??'') == '')?'M d, Y':(((data?.data??{})?.field??{})?.format??'');
          widget.args.boxTitle = thisClass.date_formate(currentDate, format);
          break;
        case 'time':
          var format = ((((data?.data??{})?.field??{})?.format??'') == '')?'H:i:s':(((data?.data??{})?.field??{})?.format??'');
          widget.args.boxTitle = thisClass.date_formate(currentDate, format);
          break;
        case 'name':
          widget.args.boxTitle = widget.data.field.user_name;
          break;
        default:
          break;
      }
      // 
      eSign.widgets.push(widget);
      // Set background color
      ctx.fillStyle = (widget?.enableSign)?'lightblue':'white';
      ctx.fillRect(widget.dx, widget.dy, widget.width, widget.height);
      // Set border color and draw the border
      ctx.strokeStyle = widget.args.borderColor;
      ctx.lineWidth = widget.args.borderWidth;
      switch (widget.args.borderStyle) {
        case 'dotted':
          ctx.setLineDash(widget.args.borderGap);
          break;
        default:
          break;
      }
      ctx.strokeRect(widget.dx, widget.dy, widget.width, widget.height);
      // Set the text
      ctx.font = `${widget.args.fontSize}px ${widget.args.fontFamily}`;
      ctx.fillStyle = '#000';
      eSign.wrapText(
        ctx,
        widget.args.boxTitle,
        widget.dx + 10, // (widget.width / 10) margin-left is 10px
        widget.dy + (widget.height / 1.5),
        widget.width,
        widget.height,
        widget.args.fontSize + 3,
        widget.args.fontSize,
        widget.args.fontFamily
      );
      // ctx.fillText(
      //   widget.args.boxTitle,
      //   widget.dx + 10, // (widget.width / 10) margin-left is 10px
      //   widget.dy + (widget.height / 1.5)
      // );
      if (widget.args?.isPreview) {
        switch (widget.args.isPreview.type) {
          case 'image':
            const image = new Image();
            image.src = widget.args.isPreview.image;
            image.onload = function() {
              if (widget.data.field?.clearRect) {
                ctx.clearRect(widget.dx, widget.dy, widget.width, widget.height);
              }
              ctx.drawImage(image, widget.dx, widget.dy, widget.width, widget.height);
            };
            break;
          case 'canvas':
            if (widget.data.field?.clearRect) {
              ctx.clearRect(widget.dx, widget.dy, widget.width, widget.height);
            }
            ctx.drawImage(widget.args.isPreview.canvas, widget.dx, widget.dy, widget.width, widget.height);
            break;
          default:
            break;
        }
      }
    } else {
      const addedElement = document.createElement('div');
      addedElement.classList.add('esign-body__single');
      if (data?.enableSign) {
        data.fieldEL = addedElement;
        addedElement.classList.add('esign-body__single__enabled', 
          thisClass.isFrontend?'esign-body__single__front':'esign-body__single__back'
        );
      }
      addedElement.dataset.type = data?.field??'';
      addedElement.dataset.storedOn = args.unique;

      var pointer = eSign?.canvasPointer;
      if (pointer && !data) {
        position.dx = pointer.pointerX;
        position.dy = pointer.pointerY;
      }

      const canvasWidth = eSign.canvas.width;
      const canvasHeight = eSign.canvas.height;
      
      if (position.dx && (position?.canvas??false)) {}
      if (position.dx) {addedElement.style.left = (thisClass.isFrontend)?`${((100 / canvasWidth) * position.dx)}%`:`${position.dx}px`;}
      if (position.dy) {addedElement.style.top = (thisClass.isFrontend)?`${((100 / canvasHeight) * position.dy)}%`:`${position.dy}px`;}

      if (position?.height) {addedElement.dataset.height = position.height;}
      if (position?.width) {addedElement.dataset.width = position.width;}
      if (position?.height) {addedElement.style.height = `${position.height * eSign.canvas.ratio.height}px`;}
      if (position.width) {addedElement.style.width = `${position.width * eSign.canvas.ratio.width}px`;}

      if (position.width) {addedElement.style.width = (thisClass.isFrontend)?`${((100 / canvasWidth) * position.width)}%`:position.width;}
      
      if (position.dx) {addedElement.dataset.x = position.dx;}
      if (position.dy) {addedElement.dataset.y = position.dy;}
      if (position.dx || position.dy) {
        // addedElement.style.transform = (
        //   (position.dx && !position.dy)?'translateX('+position.dx+'px)':(
        //     (!position.dx && position.dy)?'translateY('+position.dy+'px)':(
        //       (position.dx && position.dy)?'translate('+position.dx+'px, '+position.dy+'px)':'unset'
        //     )
        //   )
        // );
      }
      if (thisClass.isFrontend && !(data?.enableSign) && (data?.field??'') == 'sign') {
        addedElement.classList.add('esign-body__pattern');
        addedElement.title = thisClass.i18n?.notsignedyet??'User not signed yet!';
      }
      addedElement.innerHTML = `
        <div class="esign-body__single__title" style="color: ${((data?.data)?.field)?.fontColor};font-size: ${((data?.data)?.field)?.fontSize}px;">${
          (thisClass.isFrontend && !(data?.enableSign) && (data?.field??'') == 'sign')?(
            ((data?.data)?.field)?.user_name??'Pending Sign'
          ):(args?.title??'eSignature')}</div>
        ${(thisClass.isFrontend)?``:`
        <button type="button" class="btn btn-default btn-xs remove">
          <span class="dashicons-before dashicons-trash"></span>
        </button>
        `}
      `;
      if (thisClass.isFrontend) {
        const currentDate = new Date();
        switch (data?.field) {
          case 'date':
            var dateFormate = ((((data?.data??{})?.field??{})?.format??'') == '')?'M d, Y':(((data?.data??{})?.field??{})?.format??'');
            addedElement.innerHTML = thisClass.date_formate(currentDate, dateFormate);
            break;
          case 'time':
            var dateFormate = ((((data?.data??{})?.field??{})?.format??'') == '')?'H:i:s':(((data?.data??{})?.field??{})?.format??'');
            addedElement.innerHTML = thisClass.date_formate(currentDate, dateFormate);
            break;
          case 'name':
            addedElement.innerHTML = data.data.field.user_name;
            break;
          default:
            break;
        }
      }
      if (!thisClass.isFrontend) {
        eSign.init_dragging(addedElement, thisClass);
      }
      addedElement.addEventListener('click', (event) => {
        eSign.launch_signature_operation({
          event: event, element: addedElement
        }, data, thisClass);
      });
      addedElement.querySelectorAll('.remove').forEach((trash) => {
        trash.addEventListener('click', (event) => {
          event.preventDefault();
          var rusure = thisClass.i18n?.rusure??'Are you sure?';
          if (confirm(rusure)) {
            trash.parentElement.remove();
            document.querySelector('.pdf_builder__fields')?.classList.remove('settings_enabled');
            if (data && data?.settingsEL) {data.settingsEL.remove();}
        }
        });
      });
      // Append the added element to the canvas container
      document.querySelector('#signature-builder').appendChild(addedElement);
      if (!thisClass.isFrontend) {setTimeout(() => {addedElement.click();}, 800);}
    }
  }
  init_dragging(el, thisClass) {
    thisClass.interact(el)
    .resizable({
      // resize from all edges and corners
      edges: {left: true, right: true, bottom: true, top: true},
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
  
          target.style.left =  `${x}px`;target.style.top =  `${y}px`;
          // target.style.transform =  `translate(${x}px, ${y}px)`; // 'translate(' + x + 'px,' + y + 'px)'
  
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
      listeners: {move: window.dragMoveListener},
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
          // 
          // console.log('onmove', event);
          // 
          // Update the element's position
          target.style.left =  `${x}px`;target.style.top =  `${y}px`;
          // target.style.transform = `translate(${x}px, ${y}px)`;
  
          // Store the new position
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
     },
    })
  }
  str_replace(str) {
    const searchNeedles = {'product.name': ''};
    Object.keys(searchNeedles).forEach((needle) =>  {
        str = str.replaceAll(`{{${needle}}}`, searchNeedles[needle]);
    });
    return str;
  }
  async previewPDFile(file, thisClass) {
    const eSign = this;
    if (!file) {return;}
    
    const canvasContainer = document.getElementById('pdfContainer');
    const fileReader = new FileReader();
    // Initialize for canvasic contract
    if (eSign.oneCanvas) {await eSign.canvasPdf_init(thisClass);}
    fileReader.onload = async (event = false) => {
        const typedArray = event.target.result; // new Uint8Array(this.result);
        
        // reset pdf previous session objects
        if (eSign.oneCanvas) {await eSign.canvasPdf_reset();}
        // Load the PDF file using PDF.js
        pdfjsLib.getDocument(typedArray).promise.then(async (pdf) => {
          await eSign.renderPages(pdf.numPages, pdf, thisClass);
        }).then(async (data) => {
          // Start PDF functionality
          if (eSign.oneCanvas) {
            return await eSign.canvasPdf_load_pdf();
         }
         return data;
        }).then(async (data) => {
          // start implementing events
          if (eSign.oneCanvas) {
            return await eSign.canvasPdf_events();
         }
        }).then(async (data) => {
          // render layers
          // if (eSign.oneCanvas) {
          //   return await eSign.render_layers();
          //}
        }).catch(error => {
          console.error('Error loading PDF:', error);
        });
   };
  
    fileReader.readAsArrayBuffer(file);
  }
  dragFromRight2Left(thisClass) {
    const eSign = this;
    thisClass.interact('.esign-fields__single').draggable({
      inertia: true, autoScroll: true,
      restrict: {
        restriction: 'parent', endOnly: true,
        elementRect: {top: 0, left: 0, bottom: 1, right: 1},
     },
      onend: function (event) {
        const target = event.target;
        const pdfContainer = document.querySelector('#signature-builder');
        const dropPosition = {
          dx: event.pageX - pdfContainer.offsetLeft,
          dy: event.pageY - pdfContainer.offsetTop,
       };
        eSign.addElementToPDF(target, dropPosition, thisClass);
     },
    });
  }
  loadPreviousFields(thisClass) {
    const eSign = this;
    const custom_fields = eSign.data.custom_fields;
    const fields = custom_fields.fields;const canvas = custom_fields?.canvas;
    fields.forEach(widget => {
      // if (widget.enableSign) {
        widget.canvas = (canvas && canvas[0])?canvas[0]:false;// console.log(widget);
        var fieldwidget = thisClass.fields.find((widgetf) => widgetf.id==widget.field);
        var field = document.createElement('div');field.classList.add('esign-fields__single');
        var handle = document.createElement('div');handle.classList.add('esign-fields__handle');
        handle.dataset.config = JSON.stringify({id: fieldwidget?.id??'', title: fieldwidget?.title??''});
        field.appendChild(handle);var position = widget;widget.fieldNode = field;
        eSign.addElementToPDF(field, position, thisClass, widget);
      //}
    });
  }
  async init_eSignature(widget, thisClass) {
    const eSign = this;
    // Implement signature capturing using signature_pad
    var signatureCanvas = document.getElementById('signatureCanvas');
    if ((thisClass?.signaturePadEl)?.querySelector('canvas')) {
      signatureCanvas.parentElement.insertBefore(
        thisClass.signaturePadEl.querySelector('canvas'), signatureCanvas
      );
      signatureCanvas.remove();signatureCanvas = document.getElementById('signatureCanvas');
    } else {
      thisClass.Pad = new Pad(
        thisClass, 
        new thisClass.SignaturePad(signatureCanvas, {
          // backgroundColor: 'rgb(255, 255, 255)',
          // penWidth: 2, minWidth: 2, maxWidth: 4
        })
      );
      // thisClass.Pad.signPad.penWidth = 2; // Example pen width
      // thisClass.Pad.signPad.minWidth = 2; // Example min width
      // thisClass.Pad.signPad.maxWidth = 4; // Example max width
    
      // thisClass.Pad.signPad.resizeCanvas({
      //   width: 500, // Your desired width
      //   height: 300, // Your desired height
      //});
    
    }
    document.querySelectorAll('[data-esign-popup-proceed]').forEach((el) => {
      el.addEventListener('click', (event) => {
        eSign.importSignature2Element(thisClass, widget);
      });
    });
  }
  async addSignatureToPDF(pdfBytes, signatureDataUrl) {
    const eSign = this;
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
  async upload_esignature(thisClass) {
    const eSign = this;
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
          thisClass.signatureDataUrl = reader.result; // The signature data URL
  
          // Use the pdf-lib and the addSignatureToPDF function from the previous example
          // to add the signature to the PDF
          const originalPdfBytes = '...'; // Load your original PDF bytes here
          const modifiedPdfBytes = await eSign.addSignatureToPDF(originalPdfBytes, thisClass.signatureDataUrl);
  
          // Now you have the modified PDF with the uploaded signature (modifiedPdfBytes)
          // You can save it, send it to the client, or use it as needed
       };
     }
    });
    
  }
  async importSignature2Element(thisClass, widget) {
    const eSign = this;
    if (thisClass.Pad.signPad.isEmpty()) {
      var text = thisClass.i18n?.plsdosign??'Please provide a signature.';
      thisClass.toastify({text: text, className: "warning", duration: 3000, stopOnFocus: true, style: {background: "linear-gradient(to right, rgb(255 200 153), rgb(255 166 33))"}}).showToast();
   } else {
      thisClass.signatureDataUrl = thisClass.Pad.signPad.toDataURL('image/png');
      // console.log(thisClass.signatureDataUrl);
      // const originalPdfBytes = '...'; // Load your original PDF bytes here
      // const modifiedPdfBytes = await eSign.addSignatureToPDF(originalPdfBytes, thisClass.signatureDataUrl);
  
      thisClass.signatureFieldEl = widget;
      if (widget?.nodeType) {
        widget.querySelectorAll('img').forEach((img) => {img.remove();});
        const sign_image = document.createElement('img');
        sign_image.src = thisClass.signatureDataUrl;
        widget.classList.add('esign-body__single__signpreview');
        widget.appendChild(sign_image);
      } else {
        eSign.frame_signature(widget, thisClass).then(prevCanvas => {
          const ctx = widget.args.ctx;
          const canvas = ctx.canvas;
          widget.args.isPreview = {
            type:   'canvas', // 'image', // image: thisClass.signatureDataUrl,
            canvas:  prevCanvas
          };
          eSign.addElementToPDF(widget?.fieldNode, widget, thisClass, widget);
        }).catch(err => {
          console.error(err);
        });
      }
      thisClass.signaturePadEl = document.createElement('div');
      thisClass.signaturePadEl.appendChild(thisClass.Pad.canvas);
      thisClass.vex.close(thisClass.eSignVex);
   }
  }
  launch_signature_operation(event, widget, thisClass) {
    const eSign = this;const data = widget;
    const addedElement = event?.element;
    if (thisClass.isFrontend) {
      if ((data?.field??'') == 'sign' && data?.enableSign && !(data?.signDone)) {
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
              </div>
              <div class="modal__content" id="modal-1-content">
                <div class="modal__content__wrap">
                  
                  <div id="signature-pad" class="signature-pad">
                    <div class="signature-pad__header">
                      <div class="signature-pad__actions">

                        <span class="dashicons dashicons-color-picker" data-content="Change pen color">
                          <input type="color" class="button" data-action="change-color" title="Change color" data-title="Color">
                        </span>
                        <span class="dashicons dashicons-admin-appearance" data-content="Change background color">
                          <input type="color" class="button" data-action="change-background-color" title="Change background color" data-title="BG">
                        </span>
                        <span class="dashicons dashicons-align-wide" data-content="Change width">
                          <button type="button" class="button" data-action="change-width">Change width</button>
                        </span>
                        <span class="dashicons dashicons-upload" data-content="Upload Signature">
                          <input type="file" class="button" data-action="change-uploaded" title="Upload Signature" data-title="Upload" accept="image/*">
                        </span>
                        <span class="dashicons dashicons-trash" data-content="Clear">
                          <button type="button" class="button clear" data-action="clear">Clear</button>
                        </span>
                        <span class="dashicons dashicons-undo" data-content="Undo">
                          <button type="button" class="button" data-action="undo">Undo</button>
                        </span>
                        <span class="dashicons dashicons-paperclip" data-content="Attachments">
                          <button type="button" class="button" data-action="attachments">Attachments</button>
                        </span>
                          
                      </div>
                    </div>
                    <div class="signature-pad__body">
                      <canvas class="modal__content__canvas" id="signatureCanvas"></canvas>
                      <div class="modal__content__attachments">
                        ${eSign?.dropZoneHTML??''}
                      </div>
                    </div>
                    <div class="signature-pad__footer">
                      <div class="description">Sign above</div>
                      <div class="signature-pad__actions">
                        <div class="column disabled">
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
                eSign.importSignature2Element(thisClass, widget);
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
          afterOpen: () => {
            document.querySelectorAll('.signature-pad__actions .dashicons[data-content]:not([data-tippyhandled])').forEach(elem => {
              elem.dataset.tippyhandled = true;
              thisClass.tippy(elem, {arrow: true, content: elem.dataset.content});
            });
            setTimeout(() => {
              eSign.init_eSignature(widget, thisClass);
              document.querySelectorAll('[data-esign-popup-close]').forEach((el) => {
                el.addEventListener('click', (e) => {thisClass.vex.close(thisClass.eSignVex);});
              });
            }, 500);
          }
        });
      } else {}
    } else {
      const eSignBuilder = document.querySelector('.pdf_builder__fields');
      if (!eSignBuilder) {return;}eSignBuilder.classList.add('settings_enabled');
      const stored = (thisClass?.fieldsData??[]).find((row) => row.unique == parseInt(addedElement.dataset?.storedOn??0));
      // 
      // console.log([addedElement, eSign, stored, thisClass.fieldsData]);
      // 
      const field = (thisClass?.fields??[]).find((row) => row.id == stored.id);
      const esitingData = (data?.data??{})?.field??{};

      var body, wrap, fieldHTML;
      body = document.querySelector('.pdf_builder__fields__settings__body');
      wrap = stored?.html??false;
      if (!wrap) {
        wrap = document.createElement('form');wrap.classList.add('pdf_fields');
        (field?.fields??[]).forEach((field) => {
          fieldHTML = eSign.do_field(field, false, esitingData, thisClass);
          wrap.appendChild(fieldHTML);
        });
        stored.html = wrap;
        if (data) {data.settingsEL = wrap;}
        
        wrap.querySelectorAll('[data-field-id]').forEach((inputEl) => {
          switch(inputEl.dataset.fieldId) {
            case 'format':
              break;
            case 'fontColor':
              inputEl.addEventListener('change', (event) => {
                if (!data) {return;}
                var title = data.fieldEL?.firstElementChild;
                if (!title || !(title?.style)) {return;}
                title.style.color = event.target.value;
              });
              break;
            case 'fontSize':
              inputEl.addEventListener('change', (event) => {
                if (!data) {return;}
                var title = data.fieldEL?.firstElementChild;
                if (!title || !(title?.style)) {return;}
                title.style.fontSize = event.target.value + 'px';
              });
              break;
            default:
              break;
          }
        });
      }
      // Push it on FIELD BODY
      body.innerHTML = '';body.appendChild(stored.html);
    }
  }
  frame_signature(widget, thisClass) {
    return new Promise(function (resolve, reject) {
      var canvas = document.createElement('canvas');
      canvas.width = widget?.width??200;
      canvas.height = widget?.height??100;
      var ctx = canvas.getContext('2d');
      var ctxRatio = {
        width: canvas.width,
        height: canvas.height
      };
      ctx.beginPath();
      // ctx.moveTo(0, ctxRatio.height * 0.15);
      // ctx.lineTo(ctxRatio.height * 0.40, ctxRatio.height * 0.15);
      // ctx.lineTo(ctxRatio.height * 0.40, 0);
      // ctx.arcTo(ctxRatio.height * 0.40, 0, 0, 0, ctxRatio.height * 0.10);
      // Draw the black background
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, ctxRatio.width * 0.35, ctxRatio.height * 0.25);
      ctx.closePath();
      ctx.fill();
      // Draw the image
      var img = new Image();
      img.onload = function() {
        var imgRatio = {
          width: canvas.width / img.width,
          height: canvas.height / img.height
        };
        // ctx.drawImage(img, 0, 0, 200, 100);
        ctx.drawImage(img, 0, 0, img.width * imgRatio.width, img.height * imgRatio.height);
        // Draw the text
        ctx.font = `${ctxRatio.width * 0.05}px Arial`;
        ctx.fillStyle = "#fff";
        ctx.fillText("Signature", ctxRatio.width * 0.07, ctxRatio.height * 0.25 * 0.666);
        // return the result
        resolve(canvas);
      };
      img.src = thisClass.signatureDataUrl;
      // return canvas;
    });
  }
  wrapText(ctx, text, x, y, maxWidth, maxHeight, lineHeight, fontSize, fontFace) {
    ctx.font = fontSize + ' ' + fontFace; // Set the font size and font face
    var words = text.split(' ');
    var line = '';
    var lines = [];
  
    for (var i = 0; i < words.length; i++) {
      var testLine = line + words[i] + ' ';
      var metrics = ctx.measureText(testLine);
      console.log(text, [metrics, maxWidth])
      var testWidth = metrics.width;
      if (testWidth > maxWidth && i > 0) {
        lines.push({ text: line, x, y });
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    lines.push({ text: line, x, y });
  
    if (lines.length * lineHeight > maxHeight) {
      var lastLine = lines.pop();
      var truncatedText = lastLine.text.slice(0, -4) + '...'; // Ellipsis for truncated text
      lines.push({ text: truncatedText, x: lastLine.x, y: lastLine.y });
    }
  
    for (var j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j].text, lines[j].x, lines[j].y);
    }
  }
}
export default PDFUtils;