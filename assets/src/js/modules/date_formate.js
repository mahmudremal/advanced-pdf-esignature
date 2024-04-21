// import {format as date_formate} from 'date-fns';
// window.date_formate = date_formate;
// const moment = require('moment');
// window.moment = moment;
// window.date_formate = moment().format;
import SignaturePad from 'signature_pad';
import tippy from "tippy.js";
const vex = require('vex-js');
const vexDialog = require('vex-dialog');
vex.registerPlugin(vexDialog);
vex.defaultOptions.className = 'vex-theme-os'; // Choose a theme for the modal appearance
vex.defaultOptions.overlayClosesOnClick = false; // Disable closing on outside click


// window.moment = moment;
window.vex = vex;
window.tippy = tippy;
window.SignaturePad = SignaturePad;
