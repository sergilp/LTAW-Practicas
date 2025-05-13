const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const server = require('./server'); // Inicia el servidor

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

function createWindow() {
    const win = new BrowserWindow({
        width: 600,
        height: 500,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile(path.join(__dirname, 'renderer/index.html'));

    // Enviar info al frontend
    win.webContents.on('did-finish-load', () => {
        win.webContents.send('info', {
            node: process.version,
            electron: process.versions.electron,
            chrome: process.versions.chrome,
            ip: getLocalIP()
        });
    });

    // Manejar mensaje de prueba
    ipcMain.on('test-broadcast', () => {
        server.broadcastTestMessage();
    });

    // Escuchar mensajes que llegan al servidor
    server.onMessage((msg) => {
        win.webContents.send('server-message', msg);
    });
}

app.whenReady().then(createWindow);
