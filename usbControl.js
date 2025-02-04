// Function to initialize the USB device scanner
async function initDeviceScanner() {
  const connectedDevices = document.getElementById('connectedDevices');
  const scanningStatus = document.getElementById('scanningStatus');

  try {
      // Check if the WebUSB API is available
      if (!navigator.usb) {
          throw new Error('WebUSB API is not supported in this browser.');
      }

      // Request access to USB devices
      const devices = await navigator.usb.getDevices();

      // Clear the scanning status
      scanningStatus.classList.remove('scanning');
      scanningStatus.textContent = devices.length > 0 ? 'Devices found!' : 'No devices found.';

      // Display connected devices
      connectedDevices.innerHTML = devices.map(device => `
          <div class="flex items-center space-x-2 my-1">
              <span class="device-connected">●</span>
              <span class="text-sm">${device.productName || `VID: ${device.vendorId}, PID: ${device.productId}`}</span>
          </div>
      `).join('');
  } catch (error) {
      console.error('Error scanning for USB devices:', error);
      scanningStatus.textContent = 'Error scanning for devices.';
  }
}

// Function to request permission to access a USB device
async function requestDeviceAccess() {
  try {
      // Check if the WebUSB API is available
      if (!navigator.usb) {
          throw new Error('WebUSB API is not supported in this browser.');
      }

      // Prompt the user to select a USB device
      const device = await navigator.usb.requestDevice({ filters: [] });

      // Open the device
      await device.open();

      // Select the first configuration (if available)
      if (device.configuration === null) {
          await device.selectConfiguration(1);
      }

      // Claim the first interface (if available)
      await device.claimInterface(0);

      console.log('Device connected successfully:', device);
      return device;
  } catch (error) {
      console.error('Error accessing USB device:', error);
      alert('Error accessing USB device: ' + error.message);
      return null;
  }
}

// Initialize the device scanner when the page loads
window.addEventListener('load', () => {
  initDeviceScanner();
});

// Add event listener for the "Connect to USB Device" button
document.getElementById('connectButton').addEventListener('click', async () => {
  const device = await requestDeviceAccess();
  if (device) {
      console.log('Device connected:', device);
      alert('Device connected successfully!');
  }
});
