const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const path = require('path');

async function decompileApk(apkPath, outputDir, binPath) {
  try {
    const apktoolPath = path.join(binPath, 'apktool');
    const command = `"${apktoolPath}" d "${apkPath}" -o "${outputDir}" -f`;
    const { stdout, stderr } = await execPromise(command);
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message, stderr: error.stderr };
  }
}

async function buildApk(sourceDir, outputApk, binPath) {
  try {
    const apktoolPath = path.join(binPath, 'apktool');
    const command = `"${apktoolPath}" b "${sourceDir}" -o "${outputApk}"`;
    const { stdout, stderr } = await execPromise(command);
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message, stderr: error.stderr };
  }
}

module.exports = {
  decompileApk,
  buildApk
};
