const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const path = require('path');

async function quickRun(apkPath, packageName, activityName, binPath, deviceId = null) {
  try {
    const adbPath = path.join(binPath, 'adb');
    const target = deviceId ? `-s ${deviceId}` : '';
    let log = [];
    
    // Clear cache
    log.push(`Clearing cache for ${packageName}...`);
    await execPromise(`"${adbPath}" ${target} shell pm clear ${packageName}`);
    
    // Install APK
    log.push(`Installing ${apkPath}...`);
    await execPromise(`"${adbPath}" ${target} install -r "${apkPath}"`);
    
    // Launch App
    log.push(`Launching ${packageName}/${activityName}...`);
    await execPromise(`"${adbPath}" ${target} shell am start -n ${packageName}/${activityName}`);
    
    log.push('Quick-Run successful!');
    return { success: true, stdout: log.join('\n') };
  } catch (error) {
    return { success: false, error: error.message, stderr: error.stderr };
  }
}

module.exports = {
  quickRun
};
