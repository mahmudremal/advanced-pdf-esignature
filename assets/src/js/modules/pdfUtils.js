import interact from 'interactjs';
import { PDFDocument, rgb, degrees, SVGPath, drawSvgPath, StandardFonts } from 'pdf-lib';


export const renderPages = (numPages, pdf) => {
  const pdfCanvas = document.querySelector('#signature-builder canvas');
  for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
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
  }
}
export const addElementToPDF = (config, position) => {
  const addedElement = document.createElement('div');
  addedElement.classList.add('added-element-class');
  addedElement.style.left = Math.abs(position.x) + 'px';
  addedElement.style.top = Math.abs(position.y) + 'px';
  addedElement.innerText = 'eSignature';

  init_dragging(addedElement);
  addedElement.addEventListener('click', (event) => {
      console.log(event);
      Swal.fire({
          title: 'Popup Title',
          text:  'Popup Content',
          icon:  'info',
      });
  });
  // Append the added element to the canvas container
  canvasContainer.appendChild(addedElement);
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
export const dragFromRight2Left = () => {
  interact('.esign-fields__handle').draggable({
    inertia: true,
    autoScroll: true,
    restrict: {
        restriction: 'parent', endOnly: true,
        elementRect: {top: 0, left: 0, bottom: 1, right: 1},
    },
    onend: function (event) {
        const target = event.target;
        const targetConfig = target.getAttribute('data-config');
        const dropPosition = {
            x: event.pageX - pdfContainer.offsetLeft,
            y: event.pageY - pdfContainer.offsetTop,
        };
        addElementToPDF(targetConfig, dropPosition);
    },
  });
}