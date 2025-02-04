// Function to initialize the USB device scanner
async function initDeviceScanner() {
  const connectedDevices = document.getElementById('connectedDevices');
  const scanningStatus = document.getElementById('scanningStatus');

  try {
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
      return null;
  }
}

// Function to send a command to a USB device
async function sendUsbCommand(device, command) {
  try {
      // Example: Send a command to endpoint 1
      await device.transferOut(1, new Uint8Array(command));
      console.log('Command sent successfully:', command);
  } catch (error) {
      console.error('Error sending USB command:', error);
  }
}

// Function to receive data from a USB device
async function receiveUsbData(device) {
  try {
      // Example: Receive data from endpoint 2
      const result = await device.transferIn(2, 64);
      const data = new Uint8Array(result.data.buffer);
      console.log('Data received:', data);
      return data;
  } catch (error) {
      console.error('Error receiving USB data:', error);
      return null;
  }
}

// Initialize the device scanner when the page loads
window.addEventListener('load', () => {
  initDeviceScanner();
});

// Example: Add event listeners for buttons (if needed)
document.getElementById('connectButton').addEventListener('click', async () => {
  const device = await requestDeviceAccess();
  if (device) {
      // Example: Send a command to the device
      await sendUsbCommand(device, [0x01, 0x02, 0x03]);

      // Example: Receive data from the device
      const data = await receiveUsbData(device);
      console.log('Received data:', data);
  }
});
