// import Phaser from 'phaser';
// import * as eSign.scrawl from 'scrawl-canvas';
// import { reportSpeed, killArtefact } from 'scrawl-canvas/source/core/utilities';


class canvasPdf {
    constructor(thisClass) {
        this.layers = [];
        this.namespace = 'esign';

        window.eSign = this;
        
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
        this.scrawl = window?.scrawl;
        this.images = [];
        this.pdfPreview = false;
        this.pdfPages = [];
        this.currentPDF = false;
    }
    name(name) {
        return `${this.namespace}-${name}`;
    }
    async canvasPdf_init(thisClass) {
        const eSign = this;
        eSign.pdfPages = [];
        var canvas = document.querySelector('#contractCanvas');
        if (canvas) {
            // eSign.freezeEl = document.createElement('div');
            // eSign.freezeEl.appendChild(canvas);
            canvas.width = 800;canvas.height = 1200;
            // canvas.dataset.scrawlCanvas = true;
            // canvas.dataset.isResponsive = true;
            // canvas.dataset.fit = 'contain';
            // canvas.dataset.baseWidth = 800;
            // canvas.dataset.baseHeight = 1200;
            // eSign.canvas = canvas = eSign.freezeEl.querySelector('canvas');
            // 
            eSign.scrawl.init(canvas);
            eSign.canvas = eSign.scrawl.library.canvas?.contractCanvas??eSign.scrawl.getCanvas('contractCanvas');
            eSign.canvas.setAsCurrentCanvas();
        }
    }
    canvasPdf_reset() {
        const eSign = this;
        this.layers = [];
        this.pdfPages = [];
        Object.values(eSign.scrawl.library.artefact).forEach(widget => widget.deregister());
        eSign.scrawl.makeRender({
            name: eSign.name('contract'),
            target: eSign.canvas,
        });
    }
    canvasPdf_load_page(page) {
        const eSign = this;
        if (!page) {return;}
        eSign.pdfPages.push(page);
    }
    async canvasPdf_load_pdf() {
        const eSign = this;
        // eSign.scrawl.library.pdf.load(pdfUrl).then(pdf => {});
        // each pdfPages is a PDFPageProxy  object
        eSign.canvas.height = eSign.pdfPages.map(pdf => pdf._pageInfo.view[3]).reduce((total, num) => total + num, 0);
        var args = {
            width: Math.max(...[800, ...eSign.pdfPages.map(pdf => pdf._pageInfo.view[2])]),
            height: Math.max(...[800, ...eSign.pdfPages.map(pdf => pdf._pageInfo.view[3])])
        };
        eSign.canvasArgs = args;

        // console.log(eSign)
        
        eSign.canvas.set({
            width: args.width,
            height: args.height,
            scrollBound: true,
        });

        const promises = await eSign.pdfPages.map(async (page) => {
            return new Promise(async (resolve, reject) => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = page._pageInfo.view[2];
                canvas.height = page._pageInfo.view[3];
                const renderTask = await page.render({
                    canvasContext: context,
                    viewport: page.getViewport({scale: 1}),
                });
                await renderTask.promise.then(async () => {
                    return await canvas.toBlob(async (blob) => {
                        const blobUrl = await URL.createObjectURL(blob);
                        // const screenshot = canvas.toDataURL('image/png');
                        const cellArgs = {
                            width: page._pageInfo.view[2],
                            height: page._pageInfo.view[3],
                        };
                        // const newCell = eSign.canvas.addCell({
                        //     ...cellArgs,
                        //     name: `page${page._pageIndex}`,
                        //     // width: eSign.canvas.width,
                        //     // height: eSign.canvas.height,
                        // });
                        var scale = Math.max(1, (eSign.canvas.width / cellArgs.width));
                        eSign.layers.push({
                            page: page,
                            scale: scale,
                            // cell: newCell,
                            image: blobUrl,
                            width: cellArgs.width,
                            height: cellArgs.height,
                            pageIndex: page._pageIndex,
                        });
                        resolve(blobUrl);
                    });
                })
                .catch((err) => {
                    console.error(err)
                    reject(err);
                });
            })
            // .then(async () => {
            // })
            // .catch((err) => {
            //     console.error(err)
            // });
        });
        Promise.all(promises).then(async (files) => {
            if (eSign.oneCanvas) {
                return await eSign.render_layers();
                // return await eSign.render_artifaces();
                // return await eSign.canvasPdf_load_widgets();
            }
        });
    }
    canvasPdf_events() {
        const eSign = this;
        // eSign.canvas.domElement.addEventListener('wheel', (event) => {
        //     console.log(event, eSign.canvas);
        //     // eSign.canvas.scroll(event.deltaY);
        // });
        
        
    }
    async canvasPdf_load_widgets() {
        const eSign = this;const canvas = eSign.canvas;
        const name = (n) => eSign.name(n);
        // 
        canvas.set({
            cursor: 'auto',
            backgroundColor: 'honeydew',
        }).setAsCurrentCanvas();
        const group = eSign.scrawl.makeGroup({
            name: 'widgetGroup',
            host: canvas,
        });
        const block = eSign.scrawl.makeBlock({
            width: 100,
            height: 50,
            start: ['center', 'center'],
            fillStyle: 'lightblue',
            strokeStyle: 'black',
            lineWidth: 2,
            method: 'fillAndDraw',
            group: group,
            // Make the block draggable
            events: {
                start: function () {
                    this.set({ zIndex: 1 }); // Bring block to the front when dragging starts
                },
                move: function () {
                    this.set({
                        startX: this.start.x + this.state.currentDragDelta.x,
                        startY: this.start.y + this.state.currentDragDelta.y,
                    });
                },
            },
        });
        // Render the canvas
        eSign.scrawl.makeRender({
            name: 'widgetRender',
            target: canvas,
        });

        return;
        
        const box = eSign.scrawl.makeBlock({
            name: name('box'),
            width: 100,
            height: 100,
            startX: 100,
            startY: 100,
            fillStyle: 'yellow',
        });
        eSign.scrawl.makeBlock({
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
        eSign.scrawl.makeBlock({
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
        eSign.scrawl.makePhrase({
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
        eSign.scrawl.makePicture({
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

        eSign.scrawl.makeWheel({
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
        eSign.scrawl.makeGroup({
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
        eSign.scrawl.makeDragZone({
            zone: canvas,
            endOn: ['up', 'leave'],
            collisionGroup: name('discs'),
            exposeCurrentArtefact: true,
            preventTouchDefaultWhenDragging: true,
            updateOnStart: setCursorTo.grabbing,
            updateOnEnd: setCursorTo.pointer,
        });
        eSign.scrawl.makeRender({
            name: name('animation'),
            target: canvas,
        });
    }
    canvasPdf_preview() {
        const eSign = this;
        document.querySelectorAll('#signature-builder').forEach(ground => ground.appendChild(eSign.canvas.cloneNode(true)));
    }
    slideshow_data() {
        return {
            "cut-citrus": {
                "text": "Lorem Ipsum",
                "alt": "cut citrus fruits. ",
                "src": "https://source.unsplash.com/ezSFnAFi9hY/500x500"
            },
            "sliced-mango": {
                "text": "Dolor Sit",
                "alt": "sliced mango. ",
                "src": "https://source.unsplash.com/TIGDsyy0TK4/500x500"
            },
            "blueberries": {
                "text": "Amet Consectetur",
                "alt": "a bunch of blueberries. ",
                "src": "https://source.unsplash.com/TdDtTu2rv4s/500x500"
            },
            "pineapple": {
                "text": "Adipiscing Elit",
                "alt": "a pineapple sitting on a table. ",
                "src": "https://source.unsplash.com/eudGUrDdBB0/500x500"
            },
            "frozen-raspberries": {
                "text": "Nunc Tortor",
                "alt": "frozen raspberries. ",
                "src": "https://source.unsplash.com/eJH4f1rlG7g/500x500"
            },
            "sliced-strawberry": {
                "text": "Metus Mollis",
                "alt": "a sliced strawberry. ",
                "src": "https://source.unsplash.com/24RUrLSW1HI/500x500"
            },
            "assorted-slices": {
                "text": "Congue Sagittis",
                "alt": "an arrangement of assorted sliced fruits. ",
                "src": "https://source.unsplash.com/h5yMpgOI5nI/500x500"
            },
            "sliced-watermelon": {
                "text": "Vestibulum Et",
                "alt": "sliced watermelons. ",
                "src": "https://source.unsplash.com/2TYrR2IB72s/500x500"
            },
            "grapefruit-lemon-pomegranite": {
                "text": "Donec Eget",
                "alt": "grapefruits, lemons, and pomegranates. ",
                "src": "https://source.unsplash.com/1cWZgnBhZRs/500x500"
            },
            "half-avocado": {
                "text": "Maecenas et Justo",
                "alt": "half of an avocado. ",
                "src": "https://source.unsplash.com/9aOswReDKPo/500x500"
            },
            "half-lime": {
                "text": "Malesuada Quam",
                "alt": "half of a lime. ",
                "src": "https://source.unsplash.com/Nl7eLS8E2Ss/500x500"
            },
            "cherry": {
                "text": "Ultricies Sollicitudin",
                "alt": "a single cherry with stem. ",
                "src": "https://source.unsplash.com/3HhXWJzG5Ko/500x500"
            },
            "banana-bunch": {
                "text": "Gravida Nibh",
                "alt": "a bunch of bananas. ",
                "src": "https://source.unsplash.com/fczCr7MdE7U/500x500"
            },
            "three-pears": {
                "text": "Pellentesque Sapien",
                "alt": "three pears. ",
                "src": "https://source.unsplash.com/uI900SItAyY/500x500"
            },
            "assorted-peaches": {
                "text": "Suspendisse Vel",
                "alt": "a basket full of peaches next to a plate with sliced peaches. ",
                "src": "https://source.unsplash.com/0AynZdszfz0/500x500"
            },
            "bowl-of-avocados": {
                "text": "Mauris Consectetur",
                "alt": "a bowl of avocados. ",
                "src": "https://source.unsplash.com/C6JhUKs9q8M/500x500"
            }
        };
    }
    async render_layers(renderOnly = false) {
        const eSign = this;eSign.group = {widgets: {}};const canvas = eSign.canvas;
        const name = window.name = (n) => eSign.name(n);

        if (!renderOnly) {
            const setCursorTo = {
                auto: () => canvas.set({css: {cursor: 'auto'}}),
                pointer: () => canvas.set({css: {cursor: 'pointer'}}),
                grabbing: () => canvas.set({css: {cursor: 'grabbing'}})
            };
            eSign.canvas.set({
                cursor: 'auto',
                checkForEntityHover: true,
                includeInTabNavigation: true,
                onEntityNoHover: setCursorTo.auto,
                onEntityHover: setCursorTo.pointer,

                fit: "cover",
                checkForResize: true,
                ignoreCanvasCssDimensions: true,
                baseMatchesCanvasDimensions: true
            }).setBase({
                compileOrder: 1
            }).setAsCurrentCanvas();
            // 
            eSign.group.pages = eSign.scrawl.makeGroup({
                order: 0,
                host: eSign.canvas.base.name,
                name: name('pages'),
            });
            eSign.group.text = eSign.scrawl.makeGroup({
                order: 1,
                host: eSign.canvas.base.name,
                name: name('text'),
            });
            eSign.group.widgets[name('widget-1')] = eSign.scrawl.makeGroup({
                order: 2,
                host: eSign.canvas.base.name,
                name: name('widget-1'),
            });
            var pghooked = false;
            const indexes = eSign.layers.map(async (row, index) => {
                pghooked = (pghooked)?await pghooked.clone({
                    handleX: 100,
                    width: row.width,
                    height: row.height,
                    // imageSource: row.image,
                    startY: pghooked.start[1] + pghooked.dimensions[1],
                    handleY: pghooked.handle[0] + pghooked.dimensions[1],
                    name: name('page-' + index), // row?.pageIndex??
                }):await eSign.scrawl.makePicture({
                    name: name('page-' + index), // row?.pageIndex??
                    imageSource: 'http://localhost:8040/esignature/wp-content/plugins/advanced-pdf-esignature/assets/page.png', // row.image,
                    
                    width: row.width,
                    height: row.height,
                    
                    copyWidth: row.width,
                    copyHeight: row.height,
                    
                    startX: 10,
                    startY: 10,
                    handleX: 10,
                    handleY: 10,
                    dimensions: [row.width, row.height],
                    // copyDimensions: ['100%', '100%'],
                    
                    group: name('pages'),

                    onEnter: (event) => {alert('Hi there')},
                    onUp: (event) => {alert('Hi there')},
                    onDown: (event) => {alert('Hi there')},
                    onLeave: (event) => {alert('Hi there')}
                });
                return row?.pageIndex??index;
            });
            eSign.scrawl.makeGradient({
                name: name('linear1'),
                endX: '100%',
                colors: [
                    [0, 'pink'],
                    [999, 'darkgreen']
                ],
            });
            /*
            eSign.scrawl.makePhrase({
                name: name('label'),
                text: 'Hello, world!',
                font: '4.5em bold Garamond, sans-serif',
                width: '100%',
                justify: 'center',
            
                start: ['center', 250],
                handle: ['center', 'center'],
                fillStyle: 'lightblue',
                lineWidth: 2,
                strokeStyle: 'blue',
                method: 'fillThenDraw',
                group: eSign.group.widgets[name('widget-1')]

            });
            */
            eSign.scrawl.makeBlock({
                width: 200,
                height: 150,
                lineWidth: 4,
                startX: 100,
                startY: 250,
                name: name('block-1-box'),
                strokeStyle: 'coral',
                method: 'fillAndDraw',
                memoizeFilterOutput: true,
                fillStyle: name('linear1'),
                lockFillStyleToEntity: true,
                group: eSign.group.widgets[name('widget-1')]
            });
            eSign.scrawl.makePhrase({
                name: name('block-1-text'),
            
                text: 'Remal Mahmud',
                font: 'bold 40px Garamond, serif',
            
                startX: '14%',
                startY: '28%',
                handleX: 'center',
                handleY: 'center',
            
                fillStyle: 'green',
                strokeStyle: 'gold',
            
                lineWidth: 2,
                lineJoin: 'round',
                shadowOffsetX: 2,
                shadowOffsetY: 2,
                shadowBlur: 2,
                shadowColor: 'black',
            
                showBoundingBox: true,
                boundingBoxColor: 'red',
        
                group: eSign.group.widgets[name('widget-1')]
            });

            // positioning
            eSign.scrawl.library.artefact[name('block-1-box')].set({
                height: 60, width: 200, strokeStyle: 'gray', lineWidth: 2,
                start: [100, 100], fillStyle: 'gray'
            });
            eSign.scrawl.library.artefact[name('block-1-text')].set({
                font: 'bold 22px Garamond, serif', width: 160, start: [200, 135],
                fillStyle: 'black', strokeStyle: 'none', lineWidth: 0,
                shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0,
                showBoundingBox: false
            });

            
            eSign.scrawl.makeDragZone({
                zone: eSign.canvas,
                endOn: ['up', 'leave'],
                exposeCurrentArtefact: true,
                preventTouchDefaultWhenDragging: true,
                reactionHooks: ['myDragBehavior']
            });
            eSign.scrawl.makeAction({
                name: 'myDragBehavior',
                method: (artefact) => {
                    console.log(artefact.start, artefact.state);
                    artefact.set({
                        startX: artefact.start.x + artefact.state.currentDragDelta.x,
                        startY: artefact.start.y + artefact.state.currentDragDelta.y,
                    });
                },
            });
        }
        // Finally Render contents
        eSign.scrawl.makeRender({
            name: name('contract'),
            target: eSign.canvas,
        });
    }
    render_artifaces() {
        const eSign = this;
        const artefacts = eSign.scrawl.library.artefact,
        canvas = this.canvas,
        base = canvas.base,
        baseGroup = eSign.scrawl.library.group[base.name];

        // For this demo we'll use a fixed-dimensions base canvas and fit it into the display canvas so all of the base always shows in the display
        canvas.set({
            breakToLandscape: 2,
            breakToPortrait: 0.5,
            actionLandscapeShape: () => {
                canvas.setBase({
                    width: 1600,
                    height: 400
                });
                updateTilePositions("landscape");
            },
            actionPortraitShape: () => {
                canvas.setBase({
                    width: 400,
                    height: 1600
                });
                updateTilePositions("portrait");
            },
            actionRectangleShape: () => {
                canvas.setBase({
                    width: 800,
                    height: 800
                });
                updateTilePositions("rectangle");
            }
        });
        // 
        const updateTilePositions = (label) => {
            switch (label) {
                case "landscape":
                slideshowKeys.forEach((key, index) => {
                    let tile = artefacts[key];
                    tile.set({
                    start: [`${Math.floor(index / 2) * 12.5}%`, `${(index % 2) * 50}%`]
                    });
                });
                break;

                case "portrait":
                slideshowKeys.forEach((key, index) => {
                    let tile = artefacts[key];
                    tile.set({
                    start: [`${Math.floor(index / 8) * 50}%`, `${(index % 8) * 12.5}%`]
                    });
                });
                break;

                case "rectangle":
                slideshowKeys.forEach((key, index) => {
                    let tile = artefacts[key];
                    tile.set({
                    start: [`${Math.floor(index / 4) * 25}%`, `${(index % 4) * 25}%`]
                    });
                });
                break;
            }
        };
        // 
        const slideshowData = {
            "half-lime": {
                text: "Malesuada Quam",
                alt: "half of a lime. ",
                src: "https://source.unsplash.com/Nl7eLS8E2Ss/500x500"
            },
            "cut-citrus": {
                text: "Lorem Ipsum",
                alt: "cut citrus fruits. ",
                src: "https://source.unsplash.com/ezSFnAFi9hY/500x500"
            },
            "sliced-mango": {
                text: "Dolor Sit",
                alt: "sliced mango. ",
                src: "https://source.unsplash.com/TIGDsyy0TK4/500x500"
            },
            "blueberries": {
                text: "Amet Consectetur",
                alt: "a bunch of blueberries. ",
                src: "https://source.unsplash.com/TdDtTu2rv4s/500x500"
            },
            "pineapple": {
                text: "Adipiscing Elit",
                alt: "a pineapple sitting on a table. ",
                src: "https://source.unsplash.com/eudGUrDdBB0/500x500"
            },
            "frozen-raspberries": {
                text: "Nunc Tortor",
                alt: "frozen raspberries. ",
                src: "https://source.unsplash.com/eJH4f1rlG7g/500x500"
            },
            "sliced-strawberry": {
                text: "Metus Mollis",
                alt: "a sliced strawberry. ",
                src: "https://source.unsplash.com/24RUrLSW1HI/500x500"
            },
            "assorted-slices": {
                text: "Congue Sagittis",
                alt: "an arrangement of assorted sliced fruits. ",
                src: "https://source.unsplash.com/h5yMpgOI5nI/500x500"
            },
            "sliced-watermelon": {
                text: "Vestibulum Et",
                alt: "sliced watermelons. ",
                src: "https://source.unsplash.com/2TYrR2IB72s/500x500"
            },
            "grapefruit-lemon-pomegranite": {
                text: "Donec Eget",
                alt: "grapefruits, lemons, and pomegranates. ",
                src: "https://source.unsplash.com/1cWZgnBhZRs/500x500"
            },
            "half-avocado": {
                text: "Maecenas et Justo",
                alt: "half of an avocado. ",
                src: "https://source.unsplash.com/9aOswReDKPo/500x500"
            },
            "cherry": {
                text: "Ultricies Sollicitudin",
                alt: "a single cherry with stem. ",
                src: "https://source.unsplash.com/3HhXWJzG5Ko/500x500"
            },
            "banana-bunch": {
                text: "Gravida Nibh",
                alt: "a bunch of bananas. ",
                src: "https://source.unsplash.com/fczCr7MdE7U/500x500"
            },
            "three-pears": {
                text: "Pellentesque Sapien",
                alt: "three pears. ",
                src: "https://source.unsplash.com/uI900SItAyY/500x500"
            },
            "assorted-peaches": {
                text: "Suspendisse Vel",
                alt: "a basket full of peaches next to a plate with sliced peaches. ",
                src: "https://source.unsplash.com/0AynZdszfz0/500x500"
            },
            "bowl-of-avocados": {
                text: "Mauris Consectetur",
                alt: "a bowl of avocados. ",
                src: "https://source.unsplash.com/C6JhUKs9q8M/500x500"
            }
        };
        // 
        const slideshowKeys = Object.keys(slideshowData);
        // 
        new Promise((resolve, reject) => {
            const pictures = [];var picture = false;
            slideshowKeys.forEach(async (key, index) => {
                picture = (picture)?await picture.clone({
                    name: key,
                    imageSource: slideshowData[key].src
                }):await eSign.scrawl.makePicture({
                    name: key,
                    dimensions: [200, 200],
                    imageSource: slideshowData[key].src,
                    copyDimensions: ["100%", "100%"]
                });
                pictures.push(picture);
            });
            setTimeout(() => {
                console.log('resolved');
                resolve(pictures)
            }, 3000);
        })
        .then(data => {
            updateTilePositions("rectangle");
            // This function checks the browser's current cursor position and updates the 'click to replace' text
            let lastPointerLocation = false;
            const checkMousePosition = () => {
                const baseHere = base.here;
                baseGroup.setArtefacts({
                    globalAlpha: 0.75
                });
                if (baseHere.active) {
                    let tile = getHoveredArtefact();
                    if (tile) {
                        if (lastPointerLocation !== tile.name) {
                            tile.set({globalAlpha: 1});
                            console.log('Pointer At:', slideshowData[tile.name].text);
                        }
                    }
                }
            };

            const getHoveredArtefact = () => {
                const baseHere = base.here;
                if (baseHere.active) {
                    let target = baseGroup.getArtefactAt(baseHere);
                    if (target && target.artefact) {
                        return target.artefact;
                    }
                }
                return false;
            };

            // Canvas display and animation
            eSign.scrawl.makeRender({
                name: "demo-animation",
                target: canvas,
                commence: checkMousePosition
            });

            // Add event listener to canvas to make the background image magic happen
            eSign.scrawl.addNativeListener("click", () => {
                const tile = getHoveredArtefact();

                if (tile) {
                    console.log('Selected image:', slideshowData[tile.name].text);
                } else {
                    // No artiface clicked
                }
            }, canvas.domElement);
        })
        .catch(err => {});
    }
}
export default canvasPdf;