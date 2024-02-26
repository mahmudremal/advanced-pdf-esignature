// import ColorPicker from 'simple-color-picker';


// export const signaturePadEVENT = (thisClass) => {
// }
/**
 * Singlature Pad Template Script.
 * 
 * @package ESignBindingAddons
 */
class Pad {
    constructor(thisClass) {
        this.setup_hooks(thisClass);
    }
    setup_hooks(thisClass) {
        this.get_fields(thisClass);

        window.onresize = this.resizeCanvas;
        this.resizeCanvas();

        this.init_events(thisClass);
    }
    get_fields(thisClass) {
        this.signaturePad = thisClass.signaturePad;
        this.wrapper = document.getElementById("signature-pad");
        this.actions = document.querySelectorAll(".signature-pad__actions > .dashicons");
        this.clearButton = this.wrapper.querySelector("[data-action=clear]");
        this.changeBackgroundColorButton = this.wrapper.querySelector("[data-action=change-background-color]");
        this.changeColorButton = this.wrapper.querySelector("[data-action=change-color]");
        this.changeWidthButton = this.wrapper.querySelector("[data-action=change-width]");
        this.changeuploadedButton = this.wrapper.querySelector("[data-action=change-uploaded]");
        this.undoButton = this.wrapper.querySelector("[data-action=undo]");
        this.savePNGButton = this.wrapper.querySelector("[data-action=save-png]");
        this.saveJPGButton = this.wrapper.querySelector("[data-action=save-jpg]");
        this.saveSVGButton = this.wrapper.querySelector("[data-action=save-svg]");
        this.saveSVGWithBackgroundButton = this.wrapper.querySelector("[data-action=save-svg-with-background]");
        this.canvas = this.wrapper.querySelector("canvas");
    }
    init_events(thisClass) {
        const Pad = this;
        Pad.actions.forEach(el => {
            el.addEventListener("click", (event) => {
                [...el.children].forEach(input => input.click());
            });
        });
        Pad.clearButton.addEventListener("click", (event) => {
            Pad.signaturePad.clear();
        });
        Pad.undoButton.addEventListener("click", (event) => {
            const data = Pad.signaturePad.toData();
            if (data) {
                data.pop(); // remove the last dot or line
                Pad.signaturePad.fromData(data);
            }
        });
    
        Pad.changeBackgroundColorButton.addEventListener("input", (event) => {
            const color = event.target?.value??false;
            if(!color) {return;}
            Pad.signaturePad.backgroundColor = color;
            const data = Pad.signaturePad.toData();
            Pad.signaturePad.clear();
            Pad.signaturePad.fromData(data);
        });
        Pad.changeColorButton.addEventListener("input", (event) => {
            const color = event.target?.value??false;
            if(!color) {return;}
            Pad.signaturePad.penColor = color;
        });
    
        Pad.changeWidthButton.addEventListener("click", (event) => {
            const min = Math.round(Math.random() * 100) / 10;
            const max = Math.round(Math.random() * 100) / 10;
    
            Pad.signaturePad.minWidth = Math.min(min, max);
            Pad.signaturePad.maxWidth = Math.max(min, max);
        });
        Pad.changeuploadedButton.addEventListener("change", (event) => {
            if(event.target.files[0]) {
                Pad.loadSignatureImage(event.target.files[0], Pad.signaturePad);
            }
        });
    
        Pad.savePNGButton.addEventListener("click", (event) => {
            if (Pad.signaturePad.isEmpty()) {
                alert("Please provide a signature first.");
            } else {
                const dataURL = Pad.signaturePad.toDataURL();
                Pad.download(dataURL, "signature.png");
            }
        });
        Pad.saveJPGButton.addEventListener("click", (event) => {
            if (Pad.signaturePad.isEmpty()) {
                alert("Please provide a signature first.");
            } else {
                const dataURL = Pad.signaturePad.toDataURL("image/jpeg");
                Pad.download(dataURL, "signature.jpg");
            }
        });
        Pad.saveSVGButton.addEventListener("click", (event) => {
            if (Pad.signaturePad.isEmpty()) {
                alert("Please provide a signature first.");
            } else {
                const dataURL = Pad.signaturePad.toDataURL('image/svg+xml');
                Pad.download(dataURL, "signature.svg");
            }
        });
        Pad.saveSVGWithBackgroundButton.addEventListener("click", (event) => {
            if (Pad.signaturePad.isEmpty()) {
                alert("Please provide a signature first.");
            } else {
                const dataURL = Pad.signaturePad.toDataURL('image/svg+xml', {includeBackgroundColor: true});
                Pad.download(dataURL, "signature.svg");
            }
        });
    }

    resizeCanvas() {
        const Pad = this;
        // 
        const ratio = Math.max(window.devicePixelRatio || 1, 1);

        if (Pad.canvas?.offsetWidth) {
            Pad.canvas.width = Pad.canvas.offsetWidth * ratio;
            Pad.canvas.height = Pad.canvas.offsetHeight * ratio;
            Pad.canvas.getContext("2d").scale(ratio, ratio);
            Pad.signaturePad.fromData(Pad.signaturePad.toData());
        } else {
            console.log('Resizing failed deu t offsetWidth method not found.')
        }
    }
    loadSignatureImage(file, signaturePad) {
        const Pad = this;
        const reader = new FileReader();
        reader.onload = function (event) {
            const base64Signature = event.target.result.split(',')[1];
            Pad.signaturePad.fromDataURL('data:image/png;base64,' + base64Signature);
            // const data = Pad.signaturePad.toData();
            // Pad.signaturePad.fromData(data);
        };
        reader.readAsDataURL(file);
    }
    download(dataURL, filename) {
        const Pad = this;
        const blob = dataURLToBlob(dataURL);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style = "display: none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    }
    dataURLToBlob(dataURL) {
        const Pad = this;
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(":")[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], {type: contentType});
    }
}

export default Pad;