'use strict';

var overlay = void 0;
var numUpdate = 1;
var hadNetworkError = false;
var overlayStyle = {
  position: 'fixed',
  boxSizing: 'border-box',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'black',
  color: '#E8E8E8',
  fontFamily: 'Menlo, Consolas, monospace',
  fontSize: 'large',
  padding: '2rem',
  lineHeight: '1.2',
  whiteSpace: 'pre-wrap',
  overflow: 'auto'
};


function getHMRUrl() {
  var host = SB_PUNDLE_HMR_HOST || location.origin;
  var path = SB_PUNDLE_HMR_PATH;
  var scheme = void 0;
  if (host.slice(0, 8) === 'https://') {
    scheme = 'wss';
  } else if (host.slice(0, 7) === 'http://') {
    scheme = 'ws';
  } else throw new Error('Invalid HMR host specified in Pundle configuration');
  return scheme + '://' + host.slice(host.indexOf('//') + 2) + path;
}
function openHMRConnection() {
  var connectedOnce = false;
  var socket = new WebSocket(getHMRUrl());
  var interval = setInterval(function () {
    if (socket.readyState === 1) {
      socket.send('ping');
    }
  }, 2000);
  socket.addEventListener('open', function () {
    connectedOnce = true;
    hadNetworkError = false;
    console.log('[HMR] Connected');
  });
  socket.addEventListener('close', function () {
    clearInterval(interval);
    if (connectedOnce) {
      console.log('[HMR] Disconnected');
      console.log('[HMR] Retrying in 2 seconds');
      setTimeout(openHMRConnection, 2000);
    } else if (!hadNetworkError) {
      console.log('[HMR] Server seems down. Retrying in 10 seconds');
      hadNetworkError = true;
      setTimeout(openHMRConnection, 10000);
    } else {
      console.log('[HMR] Server seems down, giving up');
    }
  });
  socket.addEventListener('message', function (event) {
    var message = JSON.parse(event.data);
    if (message.type === 'hmr') {
      eval(message.contents + '\n//@ sourceURL=' + location.origin + '/__pundle__/hmr-' + numUpdate++);
      console.log('[HMR] Files Changed:', message.files.join(', '));
      __sbPundle.hmrApply(message.files, message.newFiles);
    } else if (message.type === 'report') {
      if (overlay) {
        overlay.remove();
      }
      overlay = document.createElement('div');
      overlay.innerHTML = __sbPundle.ansiToHtml(message.text);
      Object.assign(overlay.style, overlayStyle);
      document.body.appendChild(overlay);
      setTimeout(function () {
        overlay.remove();
      }, 60000);
    } else if (message.type === 'report-clear') {
      if (overlay) {
        overlay.remove();
      }
    } else {
      console.log('[HMR] Unknown response', message);
    }
  });
}
openHMRConnection();