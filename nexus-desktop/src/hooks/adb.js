const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const path = require('path');

async function getConnectedDevices(binPath) {
  try {
    const adbPath = path.join(binPath, 'adb');
    const { stdout } = await execPromise(`"${adbPath}" devices`);
    const lines = stdout.split('\\n').map(line => line.trim()).filter(line => line.length > 0);
    // Skip the first line "List of devices attached"
    const devices = lines.slice(1).map(line => {
      const parts = line.split('\\t');
      return { id: parts[0], state: parts[1] };
    });
    return { success: true, devices };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function installApk(apkPath, binPath, deviceId = null) {
  try {
    const adbPath = path.join(binPath, 'adb');
    const target = deviceId ? `-s ${deviceId}` : '';
    const { stdout, stderr } = await execPromise(`"${adbPath}" ${target} install -r "${apkPath}"`);
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message, stderr: error.stderr };
  }
}

async function pushFile(localPath, remotePath, binPath, deviceId = null) {
  try {
    const adbPath = path.join(binPath, 'adb');
    const target = deviceId ? `-s ${deviceId}` : '';
    const { stdout, stderr } = await execPromise(`"${adbPath}" ${target} push "${localPath}" "${remotePath}"`);
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message, stderr: error.stderr };
  }
}

function startLogcat(binPath, callback, deviceId = null) {
  const adbPath = path.join(binPath, 'adb');
  const target = deviceId ? ['-s', deviceId] : [];
  
  const logcatProcess = require('child_process').spawn(adbPath, [...target, 'logcat']);
  
  logcatProcess.stdout.on('data', (data) => {
    callback({ type: 'stdout', data: data.toString() });
  });
  
  logcatProcess.stderr.on('data', (data) => {
    callback({ type: 'stderr', data: data.toString() });
  });
  
  logcatProcess.on('close', (code) => {
    callback({ type: 'close', code });
  });

  return logcatProcess;
}

module.exports = {
  getConnectedDevices,
  installApk,
  pushFile,
  startLogcat
};
