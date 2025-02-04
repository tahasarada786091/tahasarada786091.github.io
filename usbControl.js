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
      sendStatus('No device selected', 'error');
      return;
    }

    await connectedDevice.open();
    setupDeviceListeners();
    sendStatus(`${connectedDevice.productName} connected`, 'success');
    enableControls(true);
    
    // Request initial device state
    getDeviceStatus();

  } catch (error) {
    sendStatus(`Connection failed: ${error.message}`, 'error');
  }
}

function setupDeviceListeners() {
  connectedDevice.addEventListener('inputreport', handleDeviceData);
  connectedDevice.addEventListener('disconnect', handleDisconnect);
}

function handleDisconnect() {
  connectedDevice = null;
  sendStatus('Device disconnected', 'error');
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
    sendStatus(`Command failed: ${error.message}`, 'error');
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
  
  // Send status to renderer process
  window.electronAPI.sendStatusUpdate(status);
}

// ========================
// UI Helpers
// ========================

function sendStatus(message, type = 'info') {
  // Send status message to renderer process
  window.electronAPI.sendStatusMessage({ message, type });
}

function enableControls(enabled) {
  // This function will be handled in the renderer process
}

function bytesToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join(' ');
}

function logDebug(message) {
  // This function will be handled in the renderer process
}
