import RecordRTC from 'recordrtc';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';

const voiceRecord = {
  
    init_recorder: (thisClass) => {
      var form, html, config, json;
      voiceRecord.popupCart = thisClass.popupCart;
      setInterval(() => {
        document.querySelectorAll('.do_recorder:not([data-handled])').forEach((el)=>{
          el.dataset.handled = true;
          voiceRecord.createButtonsAndField(el);
        });
      }, 3500);
      
    },

    createButtonsAndField: function (el) {
      const rootElement = el;
  
      // Create record button
      voiceRecord.recordButton = document.createElement('button');
      voiceRecord.recordButton.textContent = 'Record 🎙️';voiceRecord.recordButton.type = 'button';
      // voiceRecord.recordButton.addEventListener('click', voiceRecord.startRecording);
      rootElement.appendChild(voiceRecord.recordButton);
  
      // Create stop button
      // const stopButton = document.createElement('button');
      // stopButton.textContent = 'Stop';stopButton.type = 'button';
      // stopButton.addEventListener('click', voiceRecord.stopRecording);
      // rootElement.appendChild(stopButton);
  
      // Create release button
      voiceRecord.releaseButton = document.createElement('button');
      voiceRecord.releaseButton.textContent = 'Release';voiceRecord.releaseButton.type = 'button';
      voiceRecord.releaseButton.addEventListener('click', voiceRecord.releaseRecording);
      rootElement.appendChild(voiceRecord.releaseButton);

      // Create release button
      voiceRecord.playButton = document.createElement('button');
      voiceRecord.releaseButton.textContent = 'play';voiceRecord.releaseButton.type = 'button';
      voiceRecord.releaseButton.addEventListener('click', voiceRecord.playRecording);
      rootElement.appendChild(voiceRecord.releaseButton);

      // Download link
      voiceRecord.downloadButton = document.createElement('a');
      voiceRecord.downloadButton.textContent = 'Download';
      voiceRecord.downloadButton.classList.add('button');
      voiceRecord.downloadButton.style.display = 'none';
      rootElement.appendChild(voiceRecord.downloadButton);

      // Upload Button
      voiceRecord.uploadButton = document.createElement('input');
      voiceRecord.uploadButton.type = 'file';
      voiceRecord.uploadButton.accept = 'audio/*;capture=microphone';
      voiceRecord.uploadButton.textContent = 'Download';
      voiceRecord.uploadButton.classList.add('thefileinput');
      voiceRecord.uploadButton.addEventListener('change', voiceRecord.uploadAudio);
      rootElement.appendChild(voiceRecord.uploadButton);
  
      // Create audio element for preview
      const audioPreview = document.createElement('audio');
      // audioPreview.controls = true;
      // audioPreview.autoplay = true;
      // audioPreview.playsinline = true;
      audioPreview.style.display = 'none';
      rootElement.appendChild(audioPreview);
  
      // Create audio element for preview
      const wavePreview = document.createElement('div');
      wavePreview.id = 'audio-preview';
      rootElement.appendChild(wavePreview);
  
      voiceRecord.audioPreview = audioPreview;
      voiceRecord.recorder = null;
      voiceRecord.recordedBlob = null;


      window.voiceRecord = voiceRecord;

      voiceRecord.wavesurfer = WaveSurfer.create({
        container: '#'+wavePreview.id,
        waveColor: '#de424b',
        progressColor: '#973137',
      });
      voiceRecord.record = voiceRecord.wavesurfer.registerPlugin(RecordPlugin.create())
      
      const recButton = voiceRecord.recordButton;
      recButton.onclick = () => {
        if (voiceRecord.wavesurfer.isPlaying()) {
          voiceRecord.wavesurfer.pause();
        }
      
        if (voiceRecord.record.isRecording()) {
          voiceRecord.record.stopRecording();
          recButton.textContent = 'Record';
          voiceRecord.playButton.disabled = false;
          voiceRecord.popupCart.addAdditionalPrice('Voice Record', 20);
          return;
        }
      
        recButton.disabled = true
      
        voiceRecord.record.startRecording().then(() => {
          recButton.textContent = 'Stop';
          recButton.disabled = false;
        })
      }
      
      // Play/pause
      voiceRecord.wavesurfer.once('ready', () => {
        // voiceRecord.playButton.onclick = () => {}
        voiceRecord.wavesurfer.once('play', () => {
          voiceRecord.playButton.innerHTML = 'Pause';
        })
        voiceRecord.wavesurfer.once('pause', () => {
          voiceRecord.playButton.innerHTML = 'Play';
        })
      })
      
      voiceRecord.record.on('stopRecording', () => {
        voiceRecord.downloadButton.href = voiceRecord.record.getRecordedUrl();
        voiceRecord.downloadButton.download = 'recording.webm';voiceRecord.downloadButton.style.display = '';
      })
      voiceRecord.record.on('startRecording', () => {
        voiceRecord.downloadButton.href = '';voiceRecord.downloadButton.download = '';
        voiceRecord.downloadButton.style.display = 'none';
      });
      
    },
  
    playRecording: () => {
      voiceRecord.wavesurfer.playPause();
    },
    startRecording: () => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          voiceRecord.recorder = new RecordRTC(stream, { type: 'audio' });
          voiceRecord.recorder.startRecording();
        })
        .catch((error) => {
          console.error('Error accessing the microphone:', error);
        });
    },
  
    stopRecording: function () {
      if (voiceRecord.recorder) {
        voiceRecord.recorder.stopRecording(function () {
          voiceRecord.recordedBlob = voiceRecord.recorder.getBlob();
          voiceRecord.audioPreview.src = URL.createObjectURL(voiceRecord.recordedBlob);
    
          // Stop and destroy the wavesurfer instance
          if(voiceRecord.wavesurfer) {
            voiceRecord.wavesurfer.stop();
            voiceRecord.wavesurfer.destroy();
          }
    
          // Create a new wavesurfer instance
          voiceRecord.wavesurfer = WaveSurfer.create({
            container: '#audio-preview',
            waveColor: 'gray',
            progressColor: 'black',
            barWidth: 2,
            barHeight: 1,
            responsive: true,
            height: 100,
          });
    
          // Load the recorded audio blob into the wavesurfer
          voiceRecord.wavesurfer.load(voiceRecord.audioPreview.src);

          
          voiceRecord.isPlaying = false;
          voiceRecord.wavesurfer.once('finish', () => {
            voiceRecord.isPlaying = false;
          });
          voiceRecord.wavesurfer.once('interaction', () => {
            if(voiceRecord.isPlaying) {
              voiceRecord.wavesurfer.pause();
              voiceRecord.isPlaying = false;
            } else {
              voiceRecord.wavesurfer.play();
              voiceRecord.isPlaying = true;
            }
          });
        });
      }
    },
  
    releaseRecording: () => {
      if(voiceRecord.recorder) {
        voiceRecord.recorder.destroy();
        voiceRecord.recorder = null;
        voiceRecord.recordedBlob = null;
        voiceRecord.audioPreview.src = '';
        voiceRecord.popupCart.removeAdditionalPrice('Voice Record');
      }
    },

    uploadAudio: (event) => {
      var file = event.target.files[0];
      if (file) {
        const fileURL = URL.createObjectURL(file);
        voiceRecord.audioPreview.src = fileURL;
        voiceRecord.wavesurfer.load(fileURL);
      }
    },

};

export default voiceRecord;