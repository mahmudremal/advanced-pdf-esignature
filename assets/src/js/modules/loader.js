class CanvasLoader {
  constructor(canvas, args) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.args = {
      animate: true,
      width: canvas.width,
      height: canvas.height,
      showProgressBar: true,
      showGuideGrid: true,
      rotateAngle: 0,
      ...args
    };
    this.progress = {
      active: true,
      font: '12pt Arial ',
      textColor: '#000',
      text: 'Loading',
      percent: '0%',
      strokeColor: "#333",
      boxColor: "#ddd",
      // ...progress
    };
    this.setup_hooks();
    this.init_preloader();
  }
  setup_hooks() {}
  init_preloader() {
    this.updateCanvas(true);
    // 
    this.loadRemoteFileToBlob(this.canvas.dataset.contract, {}, (progress) => {
      if (progress?.ratio) {
        // We have progress ratio; update the bar.
        this.progress.percent = `${progress.ratio}%`;
      } else {
        this.progress.percent = false;
      }
      console.log(progress);
      // 
      this.updateCanvas();
    }).then(imgSrc => {
      console.log(imgSrc)
      this.progress.active = false;
      this.updateCanvas();
    }).catch(xhr => {
      this.progress.active = false;
      this.updateCanvas();
    });
  }
  updateCanvas(first = false) {
    if (this.args.animate) {
      this.loadingAnimation(first);
    } else {
      this.loadingDrawing();
    }
  }
  loadingAnimation(repeat = true) {
    this.canvas.width = this.args.width; // redraw canvas for animation effect
    this.loadingDrawing();
    this.args.rotateAngle += 5;
    if (this.args.rotateAngle > 360) {
      this.args.rotateAngle = 5;
    }
    if (repeat) {
      setTimeout(() => {this.loadingAnimation();}, 30);
    }
    
  }
  loadingDrawing() {
    this.context.save();

    if (this.args.showGuideGrid) {
      this.renderGuideGrid(20, "red");
    }

    if (this.args.showProgressBar) {
      this.renderProgressBar();
    }

    this.context.translate(this.canvas.width/2, this.canvas.height/2);
    this.context.rotate(this.args.rotateAngle * Math.PI/180);
    this.context.translate(-150, -150);

    
    this.context.beginPath();
    this.context.strokeStyle = "white";
    this.context.lineWidth = this.args?.lineWidth??15;
    this.context.lineCap = "round";

    this.context.fillStyle = "rgba(255,255,255,1)";
    this.context.moveTo(150, 120);
    this.context.lineTo(150, 50);
    this.context.stroke();

    this.context.strokeStyle = "rgba(255,255,255,0.8)";
    this.context.moveTo(130, 130);
    this.context.lineTo(80, 80);
    this.context.stroke();

    this.context.strokeStyle = "rgba(19, 175, 241,0.5)";
    this.context.moveTo(120, 150);
    this.context.lineTo(50, 150);
    this.context.stroke();

    this.context.strokeStyle = "rgba(19, 175, 241,0.35)";
    this.context.moveTo(130, 170);
    this.context.lineTo(80, 220);
    this.context.stroke();

    this.context.strokeStyle = "rgba(19, 175, 241,0.2)";
    this.context.moveTo(150, 180);
    this.context.lineTo(150, 250);
    this.context.stroke();

    this.context.closePath();

    this.context.save();

    this.context.restore();
  }
  renderGuideGrid(gridPixelSize, color) {
    this.context.save();
    this.context.lineWidth = 0.5;
    this.context.strokeStyle = color;

    // horizontal grid lines
    for(var i = 0; i <= this.canvas.height; i = i + gridPixelSize)   {
      this.context.beginPath();
      this.context.moveTo(0, i);
      this.context.lineTo(this.canvas.width, i);
      this.context.closePath();
      this.context.stroke();
    }

    // vertical grid lines
    for(var j = 0; j <= this.canvas.width; j = j + gridPixelSize)  {
      this.context.beginPath();
      this.context.moveTo(j, 0);
      this.context.lineTo(j, this.canvas.height);
      this.context.closePath();
      this.context.stroke();
    }

    this.context.restore();
  }
  renderProgressBar() {
    if (!(this.progress?.active)) {return;}
    this.context.strokeStyle = this.progress?.strokeColor??"#333";
    this.context.lineWidth = 3;
    this.context.strokeRect(18.5, this.canvas.height * 0.7, this.canvas.width-37, 32);
    this.context.fillStyle = this.progress?.boxColor??"#ddd";
    this.context.fillRect(
      18.5,
      this.canvas.height * 0.7,
      (this.progress?.percent??90 / 100) * this.canvas.width-37,
      32
    );
    // 
    this.context.fillStyle = this.progress?.textColor??"#000";
    this.context.font = this.progress?.font??'12pt Arial ';
    this.context.fillText([
      this.progress.text,
      this.progress.percent,
    ].join(' '), (this.canvas.width-37) * 0.5 + 20, 0.5 + this.canvas.height - 51 + 20);
  }

  
  /**
   * @param {string} imageUrl The pure url of the image or file
   * @param {string} onprogress The function
   * @returns string blob file url
   */
  loadRemoteFileToBlob(imageUrl, args = {}, onprogress = false) {
    args = {
      noCache: 'no-cache, no-store, max-age=0',
      method: 'GET',
      responseType: 'arraybuffer',
      ...args
    };
      if (onprogress === false) {
          onprogress = (progress) => {};
      }
      return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          let notifiedNotComputable = false;
  
          xhr.open(args.method, imageUrl, true);
          if (args?.responseType) {
            xhr.responseType = 'arraybuffer';
          }
          if (args?.noCache) {
            xhr.setRequestHeader("Cache-Control", args.noCache);
            xhr.setRequestHeader('Pragma', 'no-cache');
          }
          
          xhr.onprogress = function(ev) {
              const args = {
                  loaded: ev?.loaded,
                  total: ev?.total,
                  ratio: false,
              };
              args.total = args.total / 1000;
              args.loaded = args.loaded / 1000;
              if (ev.lengthComputable) {
                  args.ratio = parseInt((ev.loaded / ev.total) * 100);
              }
              onprogress(args);
          }
          xhr.onloadend = function() {
              if (!xhr.status.toString().match(/^2/)) {
                  reject(xhr);return;
              }
              const options = {}
              const headers = xhr.getAllResponseHeaders();
              const m = headers.match(/^Content-Type\:\s*(.*?)$/mi);
              if (m && m[1]) {options.type = m[1];}
              resolve(window.URL.createObjectURL(new Blob([this.response], options)));
          }
          xhr.send();
    });
  }



}
export default CanvasLoader;