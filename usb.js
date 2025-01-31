const usb = require('usb');

// Function to detect connected USB devices
function detectDevices() {
  const devices = usb.getDeviceList().map(device => ({
    vendorId: device.deviceDescriptor.idVendor.toString(16),
    productId: device.deviceDescriptor.idProduct.toString(16)
  }));
  console.log('Detected Devices:', devices);
  return devices;
}

// Function to find a specific device based on vendor and product IDs
function findDevice(vendorId, productId) {
  console.log(`Finding device with Vendor ID: ${vendorId.toString(16)}, Product ID: ${productId.toString(16)}`);
  const device = usb.findByIds(vendorId, productId);
  if (!device) {
    console.error('Device not found');
    return null;
  }
  try {
    device.open();
    console.log('Device opened');
    const iface = device.interfaces[0];
    try {
      if (iface.isKernelDriverActive()) {
        iface.detachKernelDriver();
        console.log('Kernel driver detached');
      }
    } catch (e) {
      console.warn('Kernel driver check not supported, continuing without detaching');
    }
    iface.claim();
    console.log('Interface claimed');
    return iface;
  } catch (error) {
    console.error('Failed to open device:', error);
    return null;
  }
}

// Function to send a command to a device
function sendCommandToDevice(iface, command) {
  console.log('Available endpoints:');
  iface.endpoints.forEach((endpoint, index) => {
    console.log(`Endpoint ${index}:`, endpoint);
  });

  const endpoint = iface.endpoints.find(ep => ep.direction === 'out');
  if (!endpoint) {
    console.error('No suitable endpoint found for sending data');
    return;
  }

  console.log('Sending command:', command);
  endpoint.transfer(command, (error) => {
    if (error) {
      console.error('Error sending command:', error);
    } else {
      console.log('Command sent successfully');
    }
  });
}

// Example commands for each device
const devices = [
  { name: 'Mouse', vendorId: 0x30FA, productId: 0x1440, command: Buffer.from([0x01, 0x01, 0x01, 0x01]) },
  { name: 'Keyboard', vendorId: 0x0BDA, productId: 0x5675, command: Buffer.from([0x02, 0x02, 0x02, 0x02]) },
  { name: 'Headset', vendorId: 0x0D8C, productId: 0x0012, command: Buffer.from([0x03, 0x03, 0x03, 0x03]) },
];

// Process each device
devices.forEach(device => {
  console.log(`Processing ${device.name}`);
  const iface = findDevice(device.vendorId, device.productId);
  if (iface) {
    sendCommandToDevice(iface, device.command);
  }
});

// Export functions for use in other modules
module.exports = { detectDevices, findDevice, sendCommandToDevice };
