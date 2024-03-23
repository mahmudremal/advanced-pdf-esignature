/**
 * Enqueue assets after page load like lazy load to reduce loading time.
 * 
 * @package ESignBindingAddons
 */


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
      'https://cdnjs.cloudflare.com/ajax/libs/vex-js/4.1.0/css/vex-theme-os.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/vex-js/4.1.0/css/vex.min.css',
      'https://unpkg.com/dropzone@5/dist/min/dropzone.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/tippy.js/2.5.4/tippy.css',
      // 'https://cdnjs.cloudflare.com/ajax/libs/dragula/3.7.3/dragula.min.css',
      // `${thisClass.config.buildPath}/js/date_formate.js`,
      'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css',
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
        callback: () => {
          thisClass.Popper = window.Popper;
        }
      },
      {
        src     : 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.3/moment.min.js',
        callback: () => {
          thisClass.moment = window.moment;
        }
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
      // {
      //   src     : 'https://unpkg.com/tippy.js@5',
      //   callback: () => {thisClass.tippy = window.tippy;}
      // },
      {
        src     : 'https://cdn.datatables.net/2.0.2/js/dataTables.min.js',
        callback: () => {
          thisClass.DataTable = window.DataTable;
          if (thisClass?.isFrontend) {
            thisClass.init_datable();
          }
          
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
          if (thisClass?.isFrontend) {
            thisClass.init_launch_buttons();
          }
        }
      },
      {
        src     : 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js',
        adminOnly: true,
        callback: () => {
          thisClass.PDFLib = window.PDFLib;
          if (thisClass?.isFrontend) {
            thisClass.init_launch_buttons();
          }
        }
      },
      {
        src     : `${thisClass.config.buildPath}/js/date_formate.js?v=2`,
        callback: () => {
          thisClass.date_formate = window.date_formate;
          thisClass.vex = window.vex;
          thisClass.tippy = window.tippy;
          thisClass.SignaturePad = window.SignaturePad;
          if (thisClass?.isFrontend) {
            thisClass.init_datable();
            thisClass.init_launch_buttons();
          }
          
        }
      },
      // {
      //   src     : 'https://cdnjs.cloudflare.com/ajax/libs/signature_pad/1.3.4/signature_pad.min.js',
      //   callback: () => {
      //     thisClass.SignaturePad = window.SignaturePad;
      //     if (thisClass?.isFrontend) {
      //       thisClass.init_launch_buttons();
      //     }
          
      //   }
      // },
      {
        src     : `${thisClass.config.buildPath}/js/interact.js`,
        callback: () => {
          thisClass.interact = window.interact;
          if (thisClass?.isFrontend) {
            thisClass.init_launch_buttons();
          }
          
        }
      },
    ];
    scripts.forEach(fileRow => {
      this.addScript(fileRow, thisClass);
    });
  }
  /**
   * Add script tags and load events.
   * @param {Object} fileRow Script JS URI
   * @param {Object} thisClass Object of the root parent structure.
   */
  addScript(fileRow, thisClass) {
    if (fileRow?.adminOnly && thisClass.isFrontend) {return;}
    const defaultCallback = () => {};
    const fileSrc = fileRow?.src??false;
    const callback = fileRow?.callback??defaultCallback;
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