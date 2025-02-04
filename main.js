const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const usb = require('./usbControl.js'); // Updated to use usbControl.js

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');

  ipcMain.handle('detect-usb-devices', () => {
    return usb.detectDevices();
  });

  ipcMain.handle('send-usb-command', (event, command) => {
    exec(`node usbControl.js ${command}`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error sending USB command:', error);
        return;
      }
      console.log('USB command response:', stdout);
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
