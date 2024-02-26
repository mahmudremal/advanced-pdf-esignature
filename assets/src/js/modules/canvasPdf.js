// import Phaser from 'phaser';
import {
    library as L,
    makeDragZone,
    makeRender,
    makeShape,
    makeWheel,
} from 'scrawl-canvas'
import * as scrawl from 'scrawl-canvas';
import { reportSpeed, killArtefact } from 'scrawl-canvas/source/core/utilities';

const perSerPdf = {
    
    
};
class canvasPdf {
    constructor(thisClass) {
        this.namespace = 'esign';
        this.setup_canvas(thisClass);
    }
    setup_canvas(thisClass) {
        const eSign = this;
        this.scrawlConfig = false;
        this.pdfURL = false;
        this.pdfCanvas = false;
        this.pdfContext = false;
        this.viewport = false;
        this.page = false;
        this.scrawl = scrawl;
        this.images = [];
        this.pdfPreview = false;
        this.pdfPages = [];
        this.currentPDF = false;
        console.log('setup_canvas..');
    }
    canvasPdf_name(name) {
        return `${this.namespace}-${name}`;
    }
    canvasPdf_init(thisClass) {
        const eSign = this;
        eSign.pdfPages = [];
        scrawl.init(document.querySelector('#contractCanvas'));
        eSign.canvas = scrawl.library.canvas?.contractCanvas??scrawl.getCanvas('contractCanvas');
        eSign.canvas.setAsCurrentCanvas();
        // eSign.images.sort((a, b) => a.order - b.order);
        // let yOffset = 0;
        // eSign.images.map((row, i)=> {row.yOffset = yOffset;yOffset +=  row.height;return row;});

        // eSign.images = eSign.images.slice(0, 26);
        
        // const imageWidths = eSign.images.map(image => image.width).reduce((max, curr) => (max <= curr)?curr:max);
        // const imageHeights = eSign.images.map(image => image.height).reduce((till, curr) => till + curr, 0);
        // const canvasHeight = imageHeights;
        // const canvasWidth = imageWidths;

        // eSign.canvasPdf_load_pdf();
        // eSign.canvasPdf_events();
        
    }
    canvasPdf_load_page(page) {
        const eSign = this;
        eSign.pdfPages.push(page);
    }
    canvasPdf_load_pdf() {
        const eSign = this;
        // scrawl.library.pdf.load(pdfUrl).then(pdf => {});
        // each pdfPages is a PDFPageProxy  object
        eSign.canvas.set({
            width: Math.max(eSign.pdfPages.map(pdf => pdf._pageInfo.view[2])), // Set the desired width of the canvas
            height: Math.max(eSign.pdfPages.map(pdf => pdf._pageInfo.view[3])), // Set the desired height of the canvas
            scrollBound: true, // Enable scrolling within the canvas
        });
        eSign.pdfPages.forEach((page, index) => {
            const newCell = eSign.canvas.addCell({
                name: `page${index}`,
                // width: eSign.canvas.width,
                // height: eSign.canvas.height,
                width: page._pageInfo.view[2],
                height: page._pageInfo.view[3],
            });
            page.render({
                canvas: newCell,
                viewport: page.getViewport({scale: 1}),
                canvasContext: newCell.domElement.getContext('2d'),
            });
        });

        // const numPages = pdf.numPages;
        // for (let i = 1; i <= numPages; i++) {
        //     pdf.getPage(i).then((page) => {
                
        //     });
        // }
    }
    canvasPdf_events() {
        const eSign = this;
        // eSign.canvas.domElement.addEventListener('wheel', (event) => {
        //     console.log(event, eSign.canvas);
        //     // eSign.canvas.scroll(event.deltaY);
        // });
        
        
        eSign.test_area();
    }
    canvasPdf_load_widgets() {
        const eSign = this;const canvas = eSign.canvas;
        const name = (n) => eSign.canvasPdf_name(n);
        // 
        canvas.set({
            cursor: 'auto',
            backgroundColor: 'honeydew',
        }).setAsCurrentCanvas();
        const box = scrawl.makeBlock({
            name: name('box'),
            width: 100,
            height: 100,
            startX: 100,
            startY: 100,
            fillStyle: 'yellow',
        });
        scrawl.makeBlock({
            name: name('box-relative'),
            width: '20%',
            height: '20%',
            start: ['70%', '70%'],
            handle: ['50%', '50%'],
            fillStyle: 'red',
        }).clone({
            fillStyle: 'black',
            handle: ['70%', '70%'],
        });
        scrawl.makeBlock({
            name: 'my-block',
            dimensions: [30,50], 
            start: ['55%',100],
            handle: ['18%','57%'],
            roll: 120,
            scale: 2.0,
            flipReverse: false,
            flipUpend: true,
          
            // fillStyle: 'linen',
          
            lineWidth: 25,
            strokeStyle: 'moccasin',
            method: 'fillThenDraw'
        });
        scrawl.makePhrase({
            name: name('label'),
            text: 'Hello, world!',
            font: '4.5em bold Garamond, sans-serif',
            width: '100%',
            justify: 'center',
          
            start: ['center', 'center'],
            handle: ['center', 'center'],
            fillStyle: 'lightblue',
            lineWidth: 2,
            strokeStyle: 'blue',
            method: 'fillThenDraw'
        });
        scrawl.makePicture({
            name: name('image'),
            // asset: "river",
            imageSource: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/128723/river-300.jpg',
          
            width: "20%",
            height: "20%",
          
            copyWidth: "100%",
            copyHeight: "100%",
          
            start: ['center', 'center'],
            handle: ['center', 'center'],
            dimensions: [100, 150],
            // copyDimensions: ['100%', '100%'],
            
            onEnter: (event) => {alert('Hi there')},
            onUp: (event) => {alert('Hi there')},
            onDown: (event) => {alert('Hi there')},
            onLeave: (event) => {alert('Hi there')}
        });

        scrawl.makeWheel({
            name: name('disc-1'),
            radius: '12%',
            start: ['17%', 'center'],
            handle: ['center', 'center'],
            fillStyle: 'pink',
            strokeStyle: 'red',
            lineWidth: 6,
            method: 'drawThenFill',
        }).clone({
            name: name('disc-2'),
            radius: '10%',
            fillStyle: 'lightblue',
            strokeStyle: 'blue',
        }).clone({
            name: name('disc-3'),
            radius: '8%',
            fillStyle: 'yellow',
            strokeStyle: 'orange',
        });
        scrawl.makeGroup({
            name: name('discs'),
        }).addArtefacts(
            name('disc-1'),
            name('disc-2'),
            name('disc-3'),
        );
        const setCursorTo = {
            auto: () => canvas.set({css: {cursor: 'auto'}}),
            pointer: () => canvas.set({css: {cursor: 'pointer'}}),
            grabbing: () => canvas.set({css: {cursor: 'grabbing'}})
        };
        canvas.set({
            checkForEntityHover: true,
            onEntityHover: setCursorTo.pointer,
            onEntityNoHover: setCursorTo.auto,
        });
        scrawl.makeDragZone({
            zone: canvas,
            endOn: ['up', 'leave'],
            collisionGroup: name('discs'),
            exposeCurrentArtefact: true,
            preventTouchDefaultWhenDragging: true,
            updateOnStart: setCursorTo.grabbing,
            updateOnEnd: setCursorTo.pointer,
        });
        // console.log()
        scrawl.makeRender({
            name: name('animation'),
            target: canvas,
        });
    }
    test_area() {
        const eSign = this;
        window.eSign = eSign;window.scrawl = scrawl;
        // 
        const widgetBox = scrawl.makeRectangle({
            name: eSign.canvasPdf_name('myRectangle'),
            startX: 50,
            startY: 50,
            width: 200,
            height: 100,
            strokeStyle: 'black',
            fillStyle: 'red'
        });
        eSign.widgetBox = widgetBox;
        widgetBox.set({drag: true});
        widgetBox.set({resize: true});
        console.log(widgetBox);

        // const group = scrawl.makeGroup({
        //     name: eSign.canvasPdf_name('clip-group'),
        //     host: eSign.canvasPdf_name('cell'),
        //     order: 0,
        // });
        window.group = eSign.canvas.get('baseGroup');
        group.addArtefacts(widgetBox);
        // eSign.canvas.add(group);

        eSign.canvas.buildCell({
            name: eSign.canvasPdf_name('cell-pattern'),
            width: 50,
            height: 50,
            backgroundColor: 'lightblue',
            shown: false,
            useAsPattern: true,
        });
        eSign.canvas.base.set({
            compileOrder: 1,
        });
        scrawl.makePattern({
            name: eSign.canvasPdf_name('water-pattern'),
            imageSource: 'https://scrawl.rikweb.org.uk/demo/img/water.png',
        
        })
        scrawl.makeBlock({
            name: eSign.canvasPdf_name('cell-pattern-block'),
            group: eSign.canvasPdf_name('cell-pattern'),
            width: 40,
            height: 40,
            startX: 'center',
            startY: 'center',
            handleX: 'center',
            handleY: 'center',
        
            method: 'fill',
        
            fillStyle: eSign.canvasPdf_name('water-pattern'),

            delta: {
                roll: -0.3
            },
        });

        
        // widgetBox.addTo(eSign.canvas);
        // widgetBox.addListener('up', () => {
        //     alert('Box clicked!');
        // });
    }
}
export default canvasPdf;