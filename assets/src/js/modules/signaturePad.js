/**
 * Singlature Pad Template Script.
 * 
 * @package ESignBindingAddons
 */
class Pad {
    constructor(thisClass, signPad) {
        this.signPad = signPad;
        thisClass.Pad = this;
        this.setup_hooks(thisClass);
    }
    setup_hooks(thisClass) {
        this.get_fields(thisClass);

        window.onresize = this.resizeCanvas;
        this.resizeCanvas();

        this.init_events(thisClass);
    }
    get_fields(thisClass) {
        const Pad = this;Pad.attachments = [];
        this.wrapper = document.getElementById("signature-pad");
        this.actions = document.querySelectorAll(".signature-pad__actions > .dashicons");
        this.clearButton = this.wrapper.querySelector("[data-action=clear]");
        this.changeBackgroundColorButton = this.wrapper.querySelector("[data-action=change-background-color]");
        this.changeColorButton = this.wrapper.querySelector("[data-action=change-color]");
        this.changeWidthButton = this.wrapper.querySelector("[data-action=change-width]");
        this.changeuploadedButton = this.wrapper.querySelector("[data-action=change-uploaded]");
        this.undoButton = this.wrapper.querySelector("[data-action=undo]");
        this.attachButton = this.wrapper.querySelector("[data-action=attachments]");
        this.savePNGButton = this.wrapper.querySelector("[data-action=save-png]");
        this.saveJPGButton = this.wrapper.querySelector("[data-action=save-jpg]");
        this.saveSVGButton = this.wrapper.querySelector("[data-action=save-svg]");
        this.saveSVGWithBackgroundButton = this.wrapper.querySelector("[data-action=save-svg-with-background]");
        this.attachArea = this.wrapper.querySelector('.modal__content__attachments');
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
            Pad.signPad.clear();
        });
        Pad.undoButton.addEventListener("click", (event) => {
            const data = Pad.signPad.toData();
            if (data) {
                data.pop(); // remove the last dot or line
                Pad.signPad.fromData(data);
            }
        });
        Pad.attachButton.addEventListener("click", (event) => {
            event.preventDefault();
            Pad.attachArea.classList.toggle('visible');
            Pad.attachButton.parentElement.classList.toggle('activated');
        });
    
        Pad.changeBackgroundColorButton.addEventListener("input", (event) => {
            const color = event.target?.value??false;
            if(!color) {return;}
            Pad.signPad.backgroundColor = color;
            const data = Pad.signPad.toData();
            Pad.signPad.clear();
            Pad.signPad.fromData(data);
        });
        Pad.changeColorButton.addEventListener("input", (event) => {
            const color = event.target?.value??false;
            if(!color) {return;}
            Pad.signPad.penColor = color;
        });
    
        Pad.changeWidthButton.addEventListener("click", (event) => {
            const min = Math.round(Math.random() * 100) / 10;
            const max = Math.round(Math.random() * 100) / 10;
    
            Pad.signPad.minWidth = Math.min(min, max);
            Pad.signPad.maxWidth = Math.max(min, max);
        });
        Pad.changeuploadedButton.addEventListener("change", (event) => {
            if(event.target.files[0]) {
                Pad.loadSignatureImage(event.target.files[0], Pad.signPad);
            }
        });
    
        Pad.savePNGButton.addEventListener("click", (event) => {
            if (Pad.signPad.isEmpty()) {
                alert("Please provide a signature first.");
            } else {
                const dataURL = Pad.signPad.toDataURL();
                Pad.download(dataURL, "signature.png");
            }
        });
        Pad.saveJPGButton.addEventListener("click", (event) => {
            if (Pad.signPad.isEmpty()) {
                alert("Please provide a signature first.");
            } else {
                const dataURL = Pad.signPad.toDataURL("image/jpeg");
                Pad.download(dataURL, "signature.jpg");
            }
        });
        Pad.saveSVGButton.addEventListener("click", (event) => {
            if (Pad.signPad.isEmpty()) {
                alert("Please provide a signature first.");
            } else {
                const dataURL = Pad.signPad.toDataURL('image/svg+xml');
                Pad.download(dataURL, "signature.svg");
            }
        });
        Pad.saveSVGWithBackgroundButton.addEventListener("click", (event) => {
            if (Pad.signPad.isEmpty()) {
                alert("Please provide a signature first.");
            } else {
                const dataURL = Pad.signPad.toDataURL('image/svg+xml', {includeBackgroundColor: true});
                Pad.download(dataURL, "signature.svg");
            }
        });

        Pad.init_dragzone(thisClass);
    }
    init_scripts(thisClass) {
        const styles = [
            {rel: 'stylesheet', type: 'text/css', href: 'https://unpkg.com/dropzone@6.0.0-beta.1/dist/dropzone.css'}
        ];
        styles.forEach(row => {
            const link = document.createElement('link');
            if (row?.rel) {link.rel = row.rel;}
            if (row?.href) {link.href = row.href;}
            if (row?.type) {link.type = row.type;}
            document.head.appendChild(link);
        });
        // 
        const scripts = [
            // {type: 'text/javascript', src: 'https://unpkg.com/dropzone@6.0.0-beta.1/dist/dropzone-min.js'}
        ];
        scripts.forEach(row => {
            const script = document.createElement('script');
            if (row?.src) {script.src = row.src;}
            if (row?.type) {script.type = row.type;}
            document.head.appendChild(script);
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
            Pad.signPad.fromData(Pad.signPad.toData());
        } else {
            console.log('Resizing failed due to offsetWidth method not found.', Pad.canvas)
        }
    }
    loadSignatureImage(file, signaturePad) {
        const Pad = this;
        const reader = new FileReader();
        reader.onload = function (event) {
            const base64Signature = event.target.result.split(',')[1];
            Pad.signPad.fromDataURL('data:image/png;base64,' + base64Signature);
            // const data = Pad.signPad.toData();
            // Pad.signPad.fromData(data);
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
    init_dragzone(thisClass) {
        const Pad = this;
        Pad.attachZone = new thisClass.Dropzone(Pad.attachArea.querySelector('.pdf-dropzone'), {
            url: thisClass.ajaxUrl,
            method: 'post',
            uploadMultiple: true,
            maxFilesize: 256,
            filesizeBase: 1024,
            defaultHeaders: true,
            addRemoveLinks: true,
            paramName: 'files',
            previewTemplate: Pad.dropZonepreviewTemplate(),
            // disablePreviews: true,
            // addedfiles: as
            // addedfile: async (file) => {},
            // acceptedFiles: 'application/pdf,.pdf',
            // thumbnailWidth: 120,
            // thumbnailHeight: 120,
            maxFiles: 20,
            clickable: true,
            headers: {'Secure-Server': 'true'},
            autoProcessQueue: true, // Disable auto-processing of files for preview only
            dictFileSizeUnits: {tb: 'TB', gb: 'GB', mb: 'MB', kb: 'KB', b: 'b'},
            dictRemoveFile: "✘",
        });
        setTimeout(() => {
            Pad.initdropZoneHooks(thisClass);
        }, 300);
    }
    dropZonepreviewTemplate() {
        return (`
      <div class="dz-preview dz-file-preview">
        <div class="dz-image"><img data-dz-thumbnail /></div>
        <div class="dz-details">
          <div class="dz-size"><span data-dz-size></span></div>
          <div class="dz-filename"><span data-dz-name></span></div>
        </div>
        <div class="dz-progress">
          <span class="dz-upload" data-dz-uploadprogress></span>
        </div>
        <div class="dz-error-message"><span data-dz-errormessage></span></div>
        <div class="dz-success-mark">
          <svg width="54" height="54" viewBox="0 0 54 54" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.2071 29.7929L14.2929 25.7071C14.6834 25.3166 15.3166 25.3166 15.7071 25.7071L21.2929 31.2929C21.6834 31.6834 22.3166 31.6834 22.7071 31.2929L38.2929 15.7071C38.6834 15.3166 39.3166 15.3166 39.7071 15.7071L43.7929 19.7929C44.1834 20.1834 44.1834 20.8166 43.7929 21.2071L22.7071 42.2929C22.3166 42.6834 21.6834 42.6834 21.2929 42.2929L10.2071 31.2071C9.81658 30.8166 9.81658 30.1834 10.2071 29.7929Z"/>
          </svg>
        </div>
        <div class="dz-error-mark">
          <svg width="54" height="54" viewBox="0 0 54 54" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M26.2929 20.2929L19.2071 13.2071C18.8166 12.8166 18.1834 12.8166 17.7929 13.2071L13.2071 17.7929C12.8166 18.1834 12.8166 18.8166 13.2071 19.2071L20.2929 26.2929C20.6834 26.6834 20.6834 27.3166 20.2929 27.7071L13.2071 34.7929C12.8166 35.1834 12.8166 35.8166 13.2071 36.2071L17.7929 40.7929C18.1834 41.1834 18.8166 41.1834 19.2071 40.7929L26.2929 33.7071C26.6834 33.3166 27.3166 33.3166 27.7071 33.7071L34.7929 40.7929C35.1834 41.1834 35.8166 41.1834 36.2071 40.7929L40.7929 36.2071C41.1834 35.8166 41.1834 35.1834 40.7929 34.7929L33.7071 27.7071C33.3166 27.3166 33.3166 26.6834 33.7071 26.2929L40.7929 19.2071C41.1834 18.8166 41.1834 18.1834 40.7929 17.7929L36.2071 13.2071C35.8166 12.8166 35.1834 12.8166 34.7929 13.2071L27.7071 20.2929C27.3166 20.6834 26.6834 20.6834 26.2929 20.2929Z"/>
          </svg>
        </div>
      </div>
      `);
    }
    initdropZoneHooks(thisClass) {
        const Pad = this;var zone;
        const dropzone = Pad.attachZone;
        Pad.attachments = [];
        window.attachZone = dropzone;
        
        dropzone.on("addedfile", (file) => {
            // console.log(`File added: ${file.name}`);
        });
        dropzone.on("sending", function(file, xhr, formData) {
            // Will send the filesize along with the file as POST data.
            // formData.append("filesize", file.size);
            formData.append('action', 'esign/project/filesystem/upload');
            formData.append('_nonce', thisClass.ajaxNonce);
        });
        dropzone.on("complete", function(file, xhr, formData) {
            // console.log('complete')
        });
        dropzone.on("removedfile", function(file) {
          var formdata = new FormData();
          formdata.append('todelete', file.name);
          formdata.append('fileinfo', JSON.stringify(file));
          formdata.append('action', 'esign/project/filesystem/remove');
          formdata.append('_nonce', thisClass.ajaxNonce);
          thisClass.sendToServer(formdata);
        });
        document.onpaste = function(event) {
          var items = (event.clipboardData || event.originalEvent.clipboardData).items;
          if(items.length > 0) {
            items.forEach((item) => {
              if(item.kind === 'file') {
                dropzone.addFile(item.getAsFile());
              // } else {console.log(item);
              }
            });
          }
        };
        dropzone.on("completemultiple", function(files) {
            files.forEach(file => {
                if (file?.xhr) {
                    try {
                        const json = JSON.parse(file.xhr?.response??'{}')
                        if (json?.success) {
                            if (json?.data?.files) {
                                Object.values(json.data.files).forEach(fileInfo => {
                                    console.log(fileInfo)
                                    Pad.attachments.push(fileInfo);
                                });
                            }
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
            });
        });
    }
}

export default Pad;