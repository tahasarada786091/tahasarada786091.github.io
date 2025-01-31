const usb = require('usb');

// List all connected USB devices
const devices = usb.getDeviceList();

if (devices.length === 0) {
  console.log('No USB devices found.');
} else {
  devices.forEach((device, index) => {
    console.log(`Device ${index + 1}:`);
    console.log(`  Vendor ID: ${device.deviceDescriptor.idVendor.toString(16)}`);
    console.log(`  Product ID: ${device.deviceDescriptor.idProduct.toString(16)}`);
  });
}
