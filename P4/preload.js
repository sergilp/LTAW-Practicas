const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onInfo: (callback) => ipcRenderer.on('info', (_, data) => callback(data)),
    onServerMessage: (callback) => ipcRenderer.on('server-message', (_, msg) => callback(msg)),
    sendTestMessage: () => ipcRenderer.send('test-broadcast')
});
