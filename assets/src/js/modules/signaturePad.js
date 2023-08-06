// import ColorPicker from 'simple-color-picker';


export const signaturePadEVENT = (thisClass) => {
    const signaturePad = thisClass.signaturePad;
    const wrapper = document.getElementById("signature-pad");
    const clearButton = wrapper.querySelector("[data-action=clear]");
    const changeBackgroundColorButton = wrapper.querySelector("[data-action=change-background-color]");
    const changeColorButton = wrapper.querySelector("[data-action=change-color]");
    const changeWidthButton = wrapper.querySelector("[data-action=change-width]");
    const changeuploadedButton = wrapper.querySelector("[data-action=change-uploaded]");
    const undoButton = wrapper.querySelector("[data-action=undo]");
    const savePNGButton = wrapper.querySelector("[data-action=save-png]");
    const saveJPGButton = wrapper.querySelector("[data-action=save-jpg]");
    const saveSVGButton = wrapper.querySelector("[data-action=save-svg]");
    const saveSVGWithBackgroundButton = wrapper.querySelector("[data-action=save-svg-with-background]");
    const canvas = wrapper.querySelector("canvas");

    // Adjust canvas coordinate space taking into account pixel ratio,
    // to make it look crisp on mobile devices.
    // This also causes canvas to be cleared.
    function resizeCanvas() {
    // When zoomed out to less than 100%, for some very strange reason,
    // some browsers report devicePixelRatio as less than 1
    // and only part of the canvas is cleared then.
    const ratio =  Math.max(window.devicePixelRatio || 1, 1);

    // This part causes the canvas to be cleared
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);

    // This library does not listen for canvas changes, so after the canvas is automatically
    // cleared by the browser, SignaturePad#isEmpty might still return false, even though the
    // canvas looks empty, because the internal data of this library wasn't cleared. To make sure
    // that the state of this library is consistent with visual state of the canvas, you
    // have to clear it manually.
    //signaturePad.clear();
    
    // If you want to keep the drawing on resize instead of clearing it you can reset the data.
    signaturePad.fromData(signaturePad.toData());
    }

    // On mobile devices it might make more sense to listen to orientation change,
    // rather than window resize events.
    window.onresize = resizeCanvas;
    resizeCanvas();


    function loadSignatureImage(file, signaturePad) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const base64Signature = event.target.result.split(',')[1];
            signaturePad.fromDataURL('data:image/png;base64,' + base64Signature);
            // const data = signaturePad.toData();
            // signaturePad.fromData(data);
        };
        reader.readAsDataURL(file);
    }
    
    function download(dataURL, filename) {
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

    // One could simply use Canvas#toBlob method instead, but it's just to show
    // that it can be done using result of SignaturePad#toDataURL.
    function dataURLToBlob(dataURL) {
        // Code taken from https://github.com/ebidel/filer.js
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(":")[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], { type: contentType });
    }

    clearButton.addEventListener("click", () => {
        signaturePad.clear();
    });

    undoButton.addEventListener("click", () => {
        const data = signaturePad.toData();
        if (data) {
            data.pop(); // remove the last dot or line
            signaturePad.fromData(data);
        }
    });

    changeBackgroundColorButton.addEventListener("input", (event) => {
        const color = event.target?.value??false;
        if(!color) {return;}
        signaturePad.backgroundColor = color;
        const data = signaturePad.toData();
        signaturePad.clear();
        signaturePad.fromData(data);
    });
    changeColorButton.addEventListener("input", (event) => {
        const color = event.target?.value??false;
        if(!color) {return;}
        signaturePad.penColor = color;
    });

    changeWidthButton.addEventListener("click", () => {
        const min = Math.round(Math.random() * 100) / 10;
        const max = Math.round(Math.random() * 100) / 10;

        signaturePad.minWidth = Math.min(min, max);
        signaturePad.maxWidth = Math.max(min, max);
    });
    changeuploadedButton.addEventListener("change", (event) => {
        if(event.target.files[0]) {
            loadSignatureImage(event.target.files[0], signaturePad);
        }
    });

    savePNGButton.addEventListener("click", () => {
        if (signaturePad.isEmpty()) {
            alert("Please provide a signature first.");
        } else {
            const dataURL = signaturePad.toDataURL();
            download(dataURL, "signature.png");
        }
    });

    saveJPGButton.addEventListener("click", () => {
        if (signaturePad.isEmpty()) {
            alert("Please provide a signature first.");
        } else {
            const dataURL = signaturePad.toDataURL("image/jpeg");
            download(dataURL, "signature.jpg");
        }
    });

    saveSVGButton.addEventListener("click", () => {
    if (signaturePad.isEmpty()) {
        alert("Please provide a signature first.");
    } else {
        const dataURL = signaturePad.toDataURL('image/svg+xml');
        download(dataURL, "signature.svg");
    }
    });

    saveSVGWithBackgroundButton.addEventListener("click", () => {
    if (signaturePad.isEmpty()) {
        alert("Please provide a signature first.");
    } else {
        const dataURL = signaturePad.toDataURL('image/svg+xml', {includeBackgroundColor: true});
        download(dataURL, "signature.svg");
    }
    });
}

