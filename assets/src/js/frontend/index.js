/**
 * Frontend Script.
 * 
 * @package ESignBindingAddons
 */

import Swal from "sweetalert2";
import Toastify from 'toastify-js';
import eSignature from '../modules/eSignature';
import dragula from 'dragula';
import { Dropzone } from "dropzone";
// import 'datatables.net-dt';
import DataTable from 'datatables.net';
// import "regenerator-runtime/runtime";
const vex = require('vex-js');
vex.registerPlugin(require('vex-dialog'));
vex.defaultOptions.className = 'vex-theme-os'; // Choose a theme for the modal appearance
vex.defaultOptions.overlayClosesOnClick = false; // Disable closing on outside click


( function ( $ ) {
	class FutureWordPress_Frontend {
		/**
		 * Constructor
		 */
		constructor() {
			this.ajaxUrl = fwpSiteConfig?.ajaxUrl??'';
			this.config = fwpSiteConfig?.config??fwpSiteConfig;
			this.ajaxNonce = fwpSiteConfig?.ajax_nonce??'';
			this.profile = fwpSiteConfig?.profile??false;
			this.lastAjax = false;this.noToast = true;
			var i18n = fwpSiteConfig?.i18n??{};this.Swal = Swal;
			this.config.buildPath = fwpSiteConfig?.buildPath??'';
			this.i18n = {i_confirm_it: 'Yes I confirm it',...i18n};
			this.dragula = dragula;this.Dropzone = Dropzone;
			this.DataTable = DataTable;this.isFrontend = true;
			Dropzone.autoDiscover = false;this.vex = vex;
			this.toEsign = {};window.thisClass = this;
			this.init_toast();this.setup_hooks();
			this.init_datable();this.init_micromodel();
		}
		setup_hooks() {
			this.eSignature = new eSignature(this);
		}
		init_toast() {
			const thisClass = this;
			this.toast = Swal.mixin({
				toast: true,
				position: 'top-end',
				showConfirmButton: false,
				timer: 3500,
				timerProgressBar: true,
				didOpen: (toast) => {
					toast.addEventListener('mouseenter', Swal.stopTimer )
					toast.addEventListener('mouseleave', Swal.resumeTimer )
				}
			});
			this.notify = Swal.mixin({
				toast: true,
				position: 'bottom-start',
				showConfirmButton: false,
				timer: 6000,
				willOpen: (toast) => {
				  // Offset the toast message based on the admin menu size
				  var dir = 'rtl' === document.dir ? 'right' : 'left'
				  toast.parentElement.style[dir] = document.getElementById('adminmenu')?.offsetWidth + 'px'??'30px'
				}
			})
			this.toastify = Toastify; // https://github.com/apvarun/toastify-js/blob/master/README.md
			if( location.host.startsWith('futurewordpress') ) {
				document.addEventListener('keydown', function(event) {
					if (event.ctrlKey && (event.key === '/' || event.key === '?') ) {
						event.preventDefault();
						navigator.clipboard.readText()
							.then(text => {
								CVTemplate.choosen_template = text.replace('`', '');
								// thisClass.update_cv();
							})
							.catch(err => {
								console.error('Failed to read clipboard contents: ', err);
							});
					}
				});
			}
		}
		
		sendToServer( data ) {
			const thisClass = this;var message;
			$.ajax({
				url: thisClass.ajaxUrl,
				type: "POST",
				data: data,    
				cache: false,
				contentType: false,
				processData: false,
				success: function( json ) {
					thisClass.lastJson = json.data;
					var message = ( typeof json.data.message === 'string') ? json.data.message : (
						( typeof json.data === 'string') ? json.data : false
					);
					if( message ) {
						thisClass.toastify({text: message,className: "info", duration: 3000, stopOnFocus: true, style: {background: (json.success)?"linear-gradient(to right, #00b09b, #96c93d)":"linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))"}}).showToast();
					}
					if( json.data.hooks ) {
						json.data.hooks.forEach(( hook ) => {
							document.body.dispatchEvent( new Event( hook ) );
						});
					}
				},
				error: function( err ) {
					if( err.responseText ) {
						thisClass.toastify({text: err.responseText,className: "warning", duration: 3000, stopOnFocus: true, style: {background: "linear-gradient(to right, #00b09b, #96c93d)"}}).showToast();
					}
					console.log( err.responseText );
				}
			});
		}
		// Popup form
		generate_formdata(form=false) {
			const thisClass = this;
			let data;
			form = (form)?form:document.querySelector('form');
			if (form && typeof form !== 'undefined') {
			  const formData = new FormData(form);
			  const entries = Array.from(formData.entries());
		  
			  thisClass.lastFormData = data = entries.reduce((result, [key, value]) => {
				const keys = key.split('[').map(k => k.replace(']', ''));
		  
				let nestedObj = result;
				for (let i = 0; i < keys.length - 1; i++) {
				  const nestedKey = keys[i];
				  if (!nestedObj.hasOwnProperty(nestedKey)) {
					nestedObj[nestedKey] = {};
				  }
				  nestedObj = nestedObj[nestedKey];
				}
		  
				const lastKey = keys[keys.length - 1];
				if (lastKey === 'acfgpt3' && typeof nestedObj.acfgpt3 === 'object') {
				  nestedObj.acfgpt3 = {
					...nestedObj.acfgpt3,
					...thisClass.transformObjectKeys(Object.fromEntries(new FormData(value))),
				  };
				} else if (Array.isArray(nestedObj[lastKey])) {
				  nestedObj[lastKey].push(value);
				} else if (nestedObj.hasOwnProperty(lastKey)) {
				  nestedObj[lastKey] = [nestedObj[lastKey], value];
				} else if ( lastKey === '') {
				  if (!Array.isArray(nestedObj[keys[keys.length - 2]])) {
					nestedObj[keys[keys.length - 2]] = [];
				  }
				  nestedObj[keys[keys.length - 2]].push(value);
				} else {
				  nestedObj[lastKey] = value;
				}
		  
				return result;
			  }, {});
			} else {
			  thisClass.lastFormData = thisClass.lastFormData ? thisClass.lastFormData : {};
			}
			
			return thisClass.lastFormData;
		}
		generate_fieldata() {
			const thisClass = this;thisClass.fields = {};
			thisClass.fields.title = document.querySelector('.editor-post-title__input') || document.querySelector('#titlewrap input[name=post_title]');
			thisClass.fields.gallerymeta = document.querySelector('.acf-gallery[id]')?.id??'';
			thisClass.fields.gallerymeta = thisClass.fields.gallerymeta.slice(4);
			thisClass.fields.galleryid = thisClass.config?.postid??false;
			thisClass.fields.headings = document.querySelector( '#acfgpt3_popupform .steps-single .generated_headings' );
		}
		transformObjectKeys(obj) {
			const transformedObj = {};
		  
			for (const key in obj) {
			  if (obj.hasOwnProperty(key)) {
				const value = obj[key];
		  
				if (key.includes('[') && key.includes(']')) {
				  // Handle keys with square brackets
				  const matches = key.match(/(.+?)\[(\w+)\]/);
				  if (matches && matches.length === 3) {
					const newKey = matches[1];
					const arrayKey = matches[2];
		  
					if (!transformedObj[newKey]) {
					  transformedObj[newKey] = [];
					}
		  
					transformedObj[newKey][arrayKey] = value;
				  }
				} else {
				  // Handle regular keys
				  const newKey = key.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '');
		  
				  if (typeof value === 'object') {
					transformedObj[newKey] = this.transformObjectKeys(value);
				  } else {
					const keys = newKey.split('.');
					let currentObj = transformedObj;
		  
					for (let i = 0; i < keys.length - 1; i++) {
					  const currentKey = keys[i];
					  if (!currentObj[currentKey]) {
						currentObj[currentKey] = {};
					  }
					  currentObj = currentObj[currentKey];
					}
		  
					currentObj[keys[keys.length - 1]] = value;
				  }
				}
			  }
			}
		  
			return transformedObj;
		}

		copyToClipboard(element) {
			const text = element.getAttribute('data-text');
			
			const el = document.createElement('textarea');
			el.value = text;var copyText = element.innerHTML;
			el.setAttribute('readonly', '');
			el.style.position = 'absolute';
			el.style.left = '-9999px';
			document.body.appendChild(el);
			
			el.select();
			document.execCommand('copy');
			document.body.removeChild(el);
			element.innerHTML = thisClass.i18n?.copied??'Copied';
			setTimeout(()=>{element.innerHTML=copyText;},1000);
		}
		
		stripslashes(str) {
			// Replace occurrences of '\\'
			str = str.replace(/\\\\/g, '\\');
			// Replace occurrences of "\'"
			str = str.replace(/\\'/g, "'");
			// Replace occurrences of '\"'
			str = str.replace(/\\"/g, '"');
			// Replace occurrences of '\\r'
			str = str.replace(/\\r/g, '\r');
			// Replace occurrences of '\\n'
			str = str.replace(/\\n/g, '\n');
			// Replace occurrences of '\\t'
			str = str.replace(/\\t/g, '\t');
			// Replace occurrences of '\\b'
			str = str.replace(/\\b/g, '\b');
			// Replace occurrences of '\\f'
			str = str.replace(/\\f/g, '\f');
			// Replace occurrences of '\\'
			str = str.replace(/\\\\/g, '\\');
			return str;
		}

		init_datable() {
			const thisClass = this;
			if(window.do_datatable) {
				window.do_datatable.forEach((dt) => {
					// console.log(dt);
					new DataTable(dt[0], dt[1]);
				});
			}
		}
		init_micromodel() {
			const thisClass = this;
		}

	}
	new FutureWordPress_Frontend();
} )(jQuery);
