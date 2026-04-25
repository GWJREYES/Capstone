const { contextBridge, ipcRenderer } = require('electron');

// Expose a minimal, safe API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  onMenuAction: (callback) => ipcRenderer.on('menu-action', (_event, action) => callback(action)),
});
