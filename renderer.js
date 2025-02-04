const { ipcRenderer } = require('electron');

// Function to update the status message in the UI
function updateStatus(message, type) {
  const statusElement = document.getElementById('deviceStatus');
  statusElement.textContent = message;
  statusElement.className = `status-${type}`;
}

// Function to enable or disable controls
function enableControls(enabled) {
  document.querySelectorAll('.device-control').forEach(control => {
    control.disabled = !enabled;
  });
}

// Function to log debug messages
function logDebug(message) {
  const consoleElement = document.getElementById('debugConsole');
  consoleElement.innerHTML += `<div>${new Date().toLocaleTimeString()}: ${message}</div>`;
}

// IPC listeners
window.electronAPI = {
  sendStatusMessage: (data) => {
    updateStatus(data.message, data.type);
  },
  sendStatusUpdate: (status) => {
    document.getElementById('batteryLevel').textContent = `Battery: ${status.battery}%`;
    // Update other status elements as needed
  }
};

// Existing code for sidebar items and other functionalities
document.addEventListener('DOMContentLoaded', function() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  
  sidebarItems.forEach(item => {
    item.addEventListener('click', function() {
      const accessoryType = this.querySelector('.img').alt.toLowerCase();
      showSettings(accessoryType);
    });
  });

  // Add event listener for connect button
  document.getElementById('connectButton').addEventListener('click', () => {
    ipcRenderer.send('connect-device'); // Send IPC message to connect device
  });
});
