const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const path = require('path');

async function signApk(apkPath, binPath) {
  try {
    const javaPath = path.join(binPath, 'java');
    const signerPath = path.join(binPath, 'uber-apk-signer.jar');
    
    // Command to sign the apk using uber-apk-signer
    const command = `"${javaPath}" -jar "${signerPath}" -a "${apkPath}" --overwrite`;
    const { stdout, stderr } = await execPromise(command);
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message, stderr: error.stderr };
  }
}

module.exports = {
  signApk
};
