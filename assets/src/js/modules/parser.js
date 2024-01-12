import Phaser from 'phaser';

export const perSerPdf = {
    gameConfig: false, pdfURL: false, pdfCanvas: false, pdfContext: false,
    viewport: false, page: false, Phaser: Phaser, game: false, images: [],
    pdfPreview: false, pdfPages: [], currentPDF: false,
    init: (thisClass) => {
        perSerPdf.currentPDF = thisClass.prompts.currentPDF;
        console.log('init..');
        perSerPdf.pdfPages = [];
        perSerPdf.images.sort((a, b) => a.order - b.order);
        let yOffset = 0;
        perSerPdf.images.map((row, i)=> {row.yOffset = yOffset;yOffset +=  row.height;return row;});

        perSerPdf.images = perSerPdf.images.slice(0, 26);
        
        const imageWidths = perSerPdf.images.map(image => image.width).reduce((max, curr) => (max <= curr)?curr:max);
        const imageHeights = perSerPdf.images.map(image => image.height).reduce((till, curr) => till + curr, 0);
        const canvasHeight = imageHeights;
        const canvasWidth = imageWidths;
        perSerPdf.gameConfig = {
            parent: document.querySelector('.pdf_builder__builder.w-full #signature-builder'),
            type: Phaser.AUTO,
            width: canvasWidth, height: canvasHeight,
            scene: {preload: preload, create: create, update: update},
            // scene: {preload: preload},
            // scene: [PDFPreviewScene]
        };
        perSerPdf.game = new Phaser.Game(perSerPdf.gameConfig);
        // const imageContainer = perSerPdf.game.add.container(0, 0);
        let totalImageHeight = 0;
        perSerPdf.game.start();
        function preload() {
            perSerPdf.pdfCanvas = this;
            console.log('Image loading..');
            perSerPdf.images.forEach((row) => {
                if(row?.src) {
                    this.load.image(row.id, row.src);
                } else if(row?.canvas) {
                    const pdfImage = this.textures.addCanvas(row.id, row.canvas);
                } else {}
                // this.load.image(row.id, 'http://localhost/wordpress/wp-content/uploads/2023/02/logo.png'); // row.src
                
                totalImageHeight += row.height;
            });
        }
        function create__() {
            perSerPdf.pdfCanvas = this;
            console.log('init adding..');
            const imagesPerRow = 1; // Adjust this as needed (number of images per row)
            let xOffset = 0;let yOffset = 0;
            perSerPdf.images.forEach((row, index) => {
                console.log('Image adding: ' + index);
                // Image width || height adjustments
                // row.width = (row.width / 0.2);
                // row.height = (row.height / 0.2);
                row.width = 20;
                row.height = 35;

                const desiredWidth = (row.width * 1); // Adjust this as needed
                const desiredHeight = (row.height * 1); // Adjust this as needed
                // Calculate the x and y position for the image
                const x = xOffset;
                const y = yOffset;
                // Create the image
                const image = this.add.image(x, y, row.id);
                image.setDisplaySize(row.width, row.height);
                // const image = this.add.sprite(x, y, row.id);
                image.setOrigin(0, 0);
                // image.setScale(0.2);
                // image.flipY = true;
                // image.flipX = true;
        
                // Set the image scale to fit within the desired dimensions
                // const scaleX = (desiredWidth / row.width) / 2;
                // const scaleY = (desiredHeight / row.height) / 2;
                // image.setScale(scaleX, scaleY);
                // image.setScale(0.1, 0.1);
        
                perSerPdf.pdfPages.push(image);
                // If we've reached the maximum number of images per row, move to the next row
                yOffset += desiredHeight;
            });
        }
        function create() {
            console.log('create...');
            perSerPdf.images.forEach((row, index) => {
                const image = this.add.image(0, row.yOffset, row.id);
                image.setDisplaySize(row.width, row.height);
                image.setOrigin(0, 0);
            });
        }
        function update() {
            // console.log('Updating..');
        }
    },
};