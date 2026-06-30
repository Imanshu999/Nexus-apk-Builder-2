const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nexusAPI', {
  execBinary: (binary, args) => ipcRenderer.invoke('exec-binary', { binary, args }),
  autoSignApk: (apkPath) => ipcRenderer.invoke('auto-sign-apk', { apkPath })
});
