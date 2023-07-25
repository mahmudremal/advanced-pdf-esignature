// import { htmlToElement } from './utils';

import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

export const loadPDF = (url, container) => {
  return new Promise((resolve, reject) => {
    PDFJS.getDocument(url).promise.then((pdf) => {
      const numPages = pdf.numPages;
      const promises = [];

      for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
        promises.push(
          pdf.getPage(pageNumber).then((page) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            const viewport = page.getViewport({ scale: 1 });
            const scale = container.offsetWidth / viewport.width;

            const scaledViewport = page.getViewport({ scale });

            canvas.height = scaledViewport.height;
            canvas.width = container.offsetWidth;

            const renderContext = {
              canvasContext: context,
              viewport: scaledViewport,
            };

            return page.render(renderContext).promise.then(() => {
              container.appendChild(canvas);
            });
          })
        );
      }

      Promise.all(promises)
        .then(() => resolve())
        .catch((error) => reject(error));
    });
  });
};

export const htmlToElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
};
