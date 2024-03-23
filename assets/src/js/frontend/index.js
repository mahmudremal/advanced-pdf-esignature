/**
 * Frontend Script.
 * 
 * @package ESignBindingAddons
 */

// import Swal from "sweetalert2";
// import Toastify from 'toastify-js';
import eSignature from '../modules/eSignature';
// import dragula from 'dragula';
// import { Dropzone } from "dropzone";
// import DataTable from 'datatables.net';
// import tippy from "tippy.js";
// import "regenerator-runtime/runtime";

// const vex = require('vex-js');
// const vexDialog = require('vex-dialog');
// vex.registerPlugin(vexDialog);
// vex.defaultOptions.className = 'vex-theme-os'; // Choose a theme for the modal appearance
// vex.defaultOptions.overlayClosesOnClick = false; // Disable closing on outside click

import CanvasLoader from "../modules/loader";
import Assets from "../modules/assets";

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
			var i18n = fwpSiteConfig?.i18n??{};
			this.config.buildPath = fwpSiteConfig?.buildPath??'';
			this.i18n = {i_confirm_it: 'Yes I confirm it',...i18n};
			// this.dragula = dragula;
			// this.DataTable = DataTable;
			this.isFrontend = true;
			// this.Dropzone = Dropzone;
			// Dropzone.autoDiscover = false;
			// this.vex = vex;
			// this.tippy = tippy;
			this.Assets = new Assets(this);
			this.toEsign = {};window.thisClass = this;
			// this.init_toast();
			this.setup_hooks();
			// this.init_datable();
			this.init_micromodel();
			this.init_events();
			this.init_single_esign();
		}
		setup_hooks() {
		}
		
		init_events() {
			const thisClass = this;var eSign = this.eSignature;var template, html;
			document.body.addEventListener('gotsignaturepopupresult', async (event) => {
				// console.log(eSign, thisClass.eSignature);
				eSign = thisClass.eSignature;
				eSign.signatureExists = false;
				eSign.config = {id: thisClass.config.template_id};
				eSign.data = thisClass.lastJson.signature;
				eSign.fields = eSign.data.custom_fields.fields;
				// 
				eSign.fix_pdf_schema(thisClass);
				template = await eSign.get_template(thisClass);
				var div = document.createElement('div');div.classList.add('dynamic_popup');
				html = document.createElement('div');html.appendChild(div);
				// && json.header.signature_photo
				if (eSign?.isCanvasNode) {
					var preview = document.querySelector('#preview_contract');
					var previewParent = preview.parentElement;
					setTimeout(async () => {
						var contractCanvas = template.querySelector('#contractCanvas');
						// template.querySelector('#signature-builder').appendChild(preview);
						preview.remove();
						previewParent.appendChild(template);
						// thisClass.isPreventClose = true;
						if (eSign.data.custom_fields?.pdf??false) {
							const uploadPDF = document.querySelector('.upload-pdf');
							if (uploadPDF) {uploadPDF.style.display = 'none';}
							// 
							// await eSign.drawLoadingSpinner(thisClass);
							// 
							var pdFile = eSign.data.custom_fields.pdf;
							var filename = pdFile.split('/').pop().split('#')[0].split('?')[0];
							let response = await fetch(pdFile, {cache: "no-store"});
							let data = await response.blob();
							let metadata = {type: 'image/jpeg'};
							let file = new File([data], filename, metadata);
							eSign.currentPDFBlob = data;
							thisClass.lastUploaded = pdFile;
							eSign.currentPDF = file;
							// 
							await eSign.loadAndPreviewPDF(file, thisClass);
							// eSign.initDragAndDrop(thisClass);
							// eSign.loadPreviousFields(thisClass);
						}
						// 
						eSign.prompts_events(thisClass);
					}, 300);
				} else {
					if (thisClass.Swal && thisClass.Swal.isVisible()) {
						thisClass.Swal.update({html: html.innerHTML});
						eSign.fix_pdf_schema(thisClass);
						setTimeout(() => {
							var popup = document.querySelector('.dynamic_popup');
							if (popup) {popup.appendChild(template);}
							// 
							setTimeout(async () => {
								thisClass.isPreventClose = true;
								if (eSign.data.custom_fields?.pdf??false) {
									const uploadPDF = document.querySelector('.upload-pdf');
									if (uploadPDF) {uploadPDF.style.display = 'none';}
									// 
									// await eSign.drawLoadingSpinner(thisClass);
									// 
									var pdFile = eSign.data.custom_fields.pdf;
									var filename = pdFile.split('/').pop().split('#')[0].split('?')[0];
									let response = await fetch(pdFile, {cache: "no-store"});
									let data = await response.blob();
									let metadata = {type: 'image/jpeg'};
									let file = new File([data], filename, metadata);
									eSign.currentPDFBlob = data;
									thisClass.lastUploaded = pdFile;
									eSign.currentPDF = file;
									// 
									await eSign.loadAndPreviewPDF(file, thisClass);
								}
								// 
								eSign.prompts_events(thisClass);
							}, 300);
						}, 300);
					}
				}
			});
			document.body.addEventListener('popup_submitting_done', async (event) => {
				var submit = document.querySelector('.popup_foot .button[data-react="continue"]');
				if (submit) {submit.removeAttribute('disabled');}
				if (thisClass.lastJson.redirectedTo) {location.href = thisClass.lastJson.redirectedTo;}
			});
			document.body.addEventListener('template_update_success', (event) => {
				if ((thisClass.lastJson?.lastUploaded??false)) {
					thisClass.lastUploaded = thisClass.lastJson.lastUploaded;
				}
				eSign.update_btns.forEach((btn)=>{btn.disabled = false;});
			});
			document.body.addEventListener('template_update_failed', (event) => {
				eSign.update_btns.forEach((btn)=>{btn.disabled = false;});
			});
			document.body.addEventListener('signature_confirmation_failed', (event) => {
				// thisClass.Swal?.close();
			});
			document.body.addEventListener('signature_confirmation_success', (event) => {
				thisClass.Swal?.close();
			});
		}
		init_toast() {
			const thisClass = this;
			if (this?.Swal && (!(this?.toast) || !(this?.notify))) {
				this.toast = thisClass.Swal.mixin({
					toast: true,
					position: 'top-end',
					showConfirmButton: false,
					timer: 3500,
					timerProgressBar: true,
					didOpen: (toast) => {
						toast.addEventListener('mouseenter', thisClass.Swal.stopTimer )
						toast.addEventListener('mouseleave', thisClass.Swal.resumeTimer )
					}
				});
				this.notify = thisClass.Swal.mixin({
					toast: true,
					position: 'bottom-start',
					showConfirmButton: false,
					timer: 6000,
					willOpen: (toast) => {
					  // Offset the toast message based on the admin menu size
					  var dir = 'rtl' === document.dir ? 'right' : 'left'
					  toast.parentElement.style[dir] = document.getElementById('adminmenu')?.offsetWidth + 'px'??'30px'
					}
				});
			}
			
			if (this?.Toastify && !(this?.toastify)) {
				this.toastify = this.Toastify; // https://github.com/apvarun/toastify-js/blob/master/README.md
			}
		}
		
		sendToServer(data) {
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
			thisClass.launchBtns = [];
			if(window.do_datatable) {
				window.do_datatable.forEach(table => {
					var [id, rows] = table;
					document.querySelectorAll(`${id}:not([data-handled])`).forEach(tablEl => {
						tablEl.dataset.handled = true;
						console.log('datatable', tablEl)
						var table = new thisClass.DataTable(id, rows);
						// table.on('init', () => {
						// 	console.log('init.dt');
						thisClass.launchBtns.push(tablEl);
						// });
					});
				});
			}
		}
		init_micromodel() {
			const thisClass = this;
		}
		init_launch_buttons() {
			const thisClass = this;var html, config;

			if (!(thisClass?.PDFLib && thisClass?.date_formate && thisClass?.SignaturePad)) {return;}
			
			thisClass.launchBtns.forEach(element => {
				element.querySelectorAll('.launch-esignature:not([data-handled])').forEach(el => {
					el.dataset.handled = true;
					const eSign = thisClass.eSignature = new eSignature(this, el, false);
					el.addEventListener('click', (event) => {
						event.preventDefault();
						// eSign.data = false;
						html = eSign.get_template(thisClass);
						thisClass.Swal.fire({
							title: false, // thisClass.i18n?.generateaicontent??'Generate AI content',
							width: 600,
							// padding: '3em',
							// color: '#716add',
							// background: 'url(https://png.pngtree.com/thumb_back/fh260/background/20190221/ourmid/pngtree-ai-artificial-intelligence-technology-concise-image_19646.jpg) rgb(255, 255, 255) center center no-repeat',
							showConfirmButton: false,
							showCancelButton: false,
							showCloseButton: true,
							allowOutsideClick: false,
							allowEscapeKey: true,
							// confirmButtonText: 'Generate',
							// cancelButtonText: 'Close',
							// confirmButtonColor: '#3085d6',
							// cancelButtonColor: '#d33',
							customClass: {popup: 'fwp-swal2-popup'},
							// focusConfirm: true,
							// reverseButtons: true,
							// backdrop: `rgba(0,0,123,0.4) url("https://sweetalert2.github.io/images/nyan-cat.gif") left top no-repeat`,
							backdrop: `rgba(0,0,123,0.4)`,
		
							showLoaderOnConfirm: true,
							allowOutsideClick: false, // () => !Swal.isLoading(),
							
							html: html,
							// footer: '<a href="">Why do I have this issue?</a>',
							// onClose: () => {thisClass.isPreventClose = false;},
							didOpen: async () => {
								config = JSON.parse(el.dataset?.config??'{}');
								eSign.config = config;
								var formdata = new FormData();
								formdata.append('action', 'esign/project/ajax/template/data');
								formdata.append('template', config?.id??'');
								formdata.append('_nonce', thisClass.ajaxNonce);
		
								thisClass.sendToServer(formdata);
								// eSign.init_prompts(thisClass);
							},
							preConfirm: async (login) => {return eSign.on_Closed(thisClass);}
						}).then( async (result) => {
							// if (result.isConfirmed) {}
							thisClass.isPreventClose = false;
						})
					});
				});
			});
		}
		init_single_esign() {
			const thisClass = this;
			thisClass.esings = [];
			// document
			document.querySelectorAll('#preview_contract').forEach(canvas => {
				// 
				const canvasArgs = {
					element: canvas,
					assets: canvas.dataset.contract,
					object: new CanvasLoader(canvas, {
						pdfPreview: (blob) => {
							thisClass.eSignature = new eSignature(this, canvas, false);
						},
					})
				};
				thisClass.esings.push(canvasArgs);
			});
		}

	}
	new FutureWordPress_Frontend();
} )(jQuery);
