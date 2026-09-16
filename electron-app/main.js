const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 360,
    minHeight: 600,
    title: 'Gestor de Gastos Familiar',
    backgroundColor: '#f8fafc',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    icon: path.join(__dirname, '../public/icons/icon-512.png')
  });

  // Carga la PWA local (misma carpeta public/). Funciona offline con localStorage.
  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  // Abrir enlaces externos en el navegador del sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  // Menú mínimo multi-idioma
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: 'Gestor de Gastos',
      submenu: [
        { label: 'Recargar', accelerator: 'CmdOrCtrl+R', click: () => mainWindow && mainWindow.reload() },
        { type: 'separator' },
        { label: 'Salir', accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4', click: () => app.quit() }
      ]
    }
  ]));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
