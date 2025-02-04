// ========================
// Device Communication Core
// ========================

let connectedDevice = null;
const VENDOR_ID = 0x1234;    // Replace with your device's VID
const PRODUCT_ID = 0x5678;   // Replace with your device's PID

// HID Report IDs (adjust based on your device spec)
const Report = {
  KEYBOARD: 1,
  MOUSE: 2,
  HEADSET: 3,
  STATUS: 4
};

// ========================
// Device Connection Handler
// ========================

async function connectDevice() {
  try {
    const filters = [{ vendorId: VENDOR_ID, productId: PRODUCT_ID }];
    [connectedDevice] = await navigator.hid.requestDevice({ filters });

    if (!connectedDevice) {
      showStatus('No device selected', 'error');
      return;
    }

    await connectedDevice.open();
    setupDeviceListeners();
    showStatus(`${connectedDevice.productName} connected`, 'success');
    enableControls(true);
    
    // Request initial device state
    getDeviceStatus();

  } catch (error) {
    showStatus(`Connection failed: ${error.message}`, 'error');
  }
}

function setupDeviceListeners() {
  connectedDevice.addEventListener('inputreport', handleDeviceData);
  connectedDevice.addEventListener('disconnect', handleDisconnect);
}

function handleDisconnect() {
  connectedDevice = null;
  showStatus('Device disconnected', 'error');
  enableControls(false);
}

// ========================
// Core Device Communication
// ========================

async function sendHidCommand(reportId, ...data) {
  if (!connectedDevice) return;

  try {
    const reportData = new Uint8Array([reportId, ...data]);
    await connectedDevice.sendReport(reportId, reportData);
    logDebug(`Sent: ${bytesToHex(reportData)}`);
  } catch (error) {
    showStatus(`Command failed: ${error.message}`, 'error');
  }
}

function handleDeviceData(event) {
  const { data, reportId } = event;
  logDebug(`Received: [${reportId}] ${bytesToHex(data.buffer)}`);

  switch (reportId) {
    case Report.STATUS:
      updateDeviceStatus(data);
      break;
    // Add other report handlers as needed
  }
}

// ========================
// Keyboard Controls
// ========================

let currentColor = [255, 255, 255]; // Default white

function setKeyboardColor(r, g, b) {
  currentColor = [r, g, b];
  sendHidCommand(
    Report.KEYBOARD,
    0x01,  // Color command
    r, g, b
  );
}

function setKeyboardEffect(effect) {
  const effects = {
    'rainbow': 0x02,
    'breathing': 0x03,
    'static': 0x04
  };
  
  sendHidCommand(
    Report.KEYBOARD,
    0x02,  // Effect command
    effects[effect] || 0x04
  );
}

// ========================
// Mouse Controls
// ========================

let currentDPI = 800;

function setMouseDPI(dpi) {
  currentDPI = dpi;
  const dpiBytes = new Uint16Array([dpi]);
  sendHidCommand(
    Report.MOUSE,
    0x10,  // DPI command
    dpiBytes[0] & 0xFF,
    (dpiBytes[0] >> 8) & 0xFF
  );
}

function setMouseProfile(profile) {
  sendHidCommand(
    Report.MOUSE,
    0x11,  // Profile command
    profile
  );
}

// ========================
// Headset Controls
// ========================

function setHeadsetVolume(volume) {
  sendHidCommand(
    Report.HEADSET,
    0x20,  // Volume command
    Math.min(volume, 100)
  );
}

function setMicVolume(volume) {
  sendHidCommand(
    Report.HEADSET,
    0x21,  // Mic volume command
    Math.min(volume, 100)
  );
}

// ========================
// System Functions
// ========================

function getDeviceStatus() {
  sendHidCommand(Report.STATUS, 0x00);
}

function updateDeviceStatus(data) {
  const status = {
    battery: data.getUint8(1),
    connection: data.getUint8(2),
    activeProfile: data.getUint8(3)
  };
  
  document.getElementById('batteryLevel').textContent = 
    `Battery: ${status.battery}%`;
}

// ========================
// UI Helpers
// ========================

function showStatus(message, type = 'info') {
  const statusElement = document.getElementById('deviceStatus');
  statusElement.textContent = message;
  statusElement.className = `status-${type}`;
}

function enableControls(enabled) {
  document.querySelectorAll('.device-control').forEach(control => {
    control.disabled = !enabled;
  });
}

function bytesToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join(' ');
}

function logDebug(message) {
  const consoleElement = document.getElementById('debugConsole');
  consoleElement.innerHTML += `<div>${new Date().toLocaleTimeString()}: ${message}</div>`;
}

// ========================
// Initialization
// ========================

document.addEventListener('DOMContentLoaded', () => {
  // Device connection
  document.getElementById('connectButton').addEventListener('click', connectDevice);

  // Keyboard controls
  document.getElementById('keyboardColor').addEventListener('input', (e) => {
    const rgb = hexToRgb(e.target.value);
    setKeyboardColor(...rgb);
  });

  document.getElementById('dpiSlider').addEventListener('input', (e) => {
    setMouseDPI(parseInt(e.target.value));
  });

  // Mouse controls
  document.getElementById('resetMouse').addEventListener('click', () => {
    setMouseDPI(800);
    document.getElementById('dpiSlider').value = 800;
  });

  // Headset controls
  document.getElementById('volumeSlider').addEventListener('input', (e) => {
    setHeadsetVolume(parseInt(e.target.value));
  });

  // Initial scan for devices
  navigator.hid.getDevices().then(devices => {
    if (devices.length > 0) {
      connectedDevice = devices[0];
      showStatus('Device already connected', 'success');
      enableControls(true);
    }
  });
});

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
}
