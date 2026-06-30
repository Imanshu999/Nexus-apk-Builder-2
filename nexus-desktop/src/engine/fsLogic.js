const fs = require('fs').promises;
const path = require('path');

async function getDirectoryTree(dirPath) {
  try {
    const stats = await fs.stat(dirPath);
    if (!stats.isDirectory()) {
      return {
        name: path.basename(dirPath),
        path: dirPath,
        type: 'file',
      };
    }

    const items = await fs.readdir(dirPath);
    const children = await Promise.all(
      items.map(item => getDirectoryTree(path.join(dirPath, item)))
    );

    return {
      name: path.basename(dirPath),
      path: dirPath,
      type: 'directory',
      children,
    };
  } catch (error) {
    return {
      error: error.message,
      success: false
    };
  }
}

async function readFileContent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function writeFileContent(filePath, content) {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  getDirectoryTree,
  readFileContent,
  writeFileContent
};
