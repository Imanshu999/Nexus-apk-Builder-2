const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const path = require('path');

async function analyzeBytecode(apkPath, outputDir, binPath) {
  try {
    const jadxPath = path.join(binPath, 'jadx');
    // Using jadx to output java source code
    const command = `"${jadxPath}" -d "${outputDir}" "${apkPath}"`;
    const { stdout, stderr } = await execPromise(command);
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message, stderr: error.stderr };
  }
}

module.exports = {
  analyzeBytecode
};
