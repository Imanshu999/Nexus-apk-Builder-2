const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Nexus APK IDE',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the local Vite dev server in development, or static build in production
  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handler for offline system binaries (apktool, jadx, adb)
const BIN_PATH = path.join(app.getAppPath(), 'bin');
const autoSigner = require('./autoSigner');

ipcMain.handle('exec-binary', async (event, { binary, args }) => {
  // Security constraint: only allow specific local binaries
  const allowedBinaries = ['apktool', 'jadx', 'adb', 'java'];
  
  if (!allowedBinaries.includes(binary)) {
    return { success: false, error: `Unauthorized binary execution attempted: ${binary}` };
  }

  // Construct command with robust offline pathing
  const executable = path.join(BIN_PATH, binary);
  const command = `"${executable}" ${args.join(' ')}`;

  try {
    const { stdout, stderr } = await execPromise(command);
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message, stderr: error.stderr };
  }
});

ipcMain.handle('auto-sign-apk', async (event, { apkPath }) => {
  return await autoSigner.signApk(apkPath);
});
