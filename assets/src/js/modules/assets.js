class Assets {
  constructor(thisClass) {
    this.init_assets(thisClass);
  }
  init_assets(thisClass) {
    this.init_styles(thisClass);
    this.init_scripts(thisClass);
  }
  init_styles(thisClass) {
    var csses = [
      'https://cdn.jsdelivr.net/npm/keen-slider@latest/keen-slider.min.css',
      // 'https://glidejs.com/css/app.css',
      'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/toastify-js/1.6.1/toastify.min.css',
      'https://cdn.datatables.net/2.0.2/css/dataTables.dataTables.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/vex-js/4.1.0/css/vex-theme-default.min.css',
      'https://unpkg.com/dropzone@5/dist/min/dropzone.min.css',
      // 'https://cdnjs.cloudflare.com/ajax/libs/dragula/3.7.3/dragula.min.css',
    ];
    csses.forEach(url => {
      var link = document.createElement('link');
      link.rel = 'stylesheet';link.href = url;
      document.head.appendChild(link);
    });
  }
  init_scripts(thisClass) {
    var scripts = [
      {
        src     : 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/2.9.2/umd/popper.min.js',
        callback: () => {}
      },
      {
        src     : 'https://cdn.jsdelivr.net/npm/sweetalert2@11',
        callback: () => {
          thisClass.Swal = window.Swal;
          thisClass.init_toast();
        }
      },
      {
        src     : 'https://cdnjs.cloudflare.com/ajax/libs/toastify-js/1.6.1/toastify.min.js',
        callback: () => {
          thisClass.Toastify = window.Toastify;
          thisClass.init_toast();
        }
      },
      {
        src     : 'https://unpkg.com/tippy.js@5',
        callback: () => {thisClass.tippy = window.tippy;}
      },
      {
        src     : 'https://cdn.datatables.net/2.0.2/js/dataTables.min.js',
        callback: () => {
          thisClass.DataTable = window.DataTable;
          thisClass.init_datable();
        }
      },
      {
        src     : 'https://cdnjs.cloudflare.com/ajax/libs/vex-js/4.1.0/js/vex.min.js',
        callback: () => {
          thisClass.vex = window.vex;
          thisClass.init_datable();
        }
      },
      {
        src     : 'https://unpkg.com/dropzone@5/dist/min/dropzone.min.js',
        callback: () => {
          thisClass.Dropzone = window.Dropzone;
          thisClass.Dropzone.autoDiscover = false;
        }
      },
      {
        src     : 'https://cdnjs.cloudflare.com/ajax/libs/dragula/3.7.3/dragula.min.js',
        callback: () => {
          thisClass.dragula = window.dragula;
        }
      },
      {
        src     : 'https://unpkg.com/pdf-lib/dist/pdf-lib.min.js',
        callback: () => {
          thisClass.PDFLib = window.PDFLib;
          thisClass.init_launch_buttons();
        }
      },
      {
        src     : `${thisClass.config.buildPath}/js/date_formate.js`,
        callback: () => {
          thisClass.date_formate = window.date_formate;
          thisClass.init_launch_buttons();
        }
      },
      {
        src     : 'https://cdnjs.cloudflare.com/ajax/libs/signature_pad/1.3.4/signature_pad.min.js',
        callback: () => {
          thisClass.SignaturePad = window.SignaturePad;
          thisClass.init_launch_buttons();
        }
      },
      {
        src     : `${thisClass.config.buildPath}/js/interact.js`,
        callback: () => {
          thisClass.interact = window.interact;
          thisClass.init_launch_buttons();
        }
      },
    ];
    scripts.forEach(row => {
      this.addScript(row.src, row.callback);
    });
  }
  /**
   * Add script tags and load events.
   * @param {string} fileSrc Script JS URI
   * @param {function} callback Function callback will load after scripts loaded
   */
  addScript(fileSrc, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onreadystatechange = function() {
      if (this.readyState == 'complete') {
        callback();
      }
    } 
    script.onload = callback;
    script.src = fileSrc;
    head.appendChild(script);
  }
}
export default Assets;