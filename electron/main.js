const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const isDev = process.env.NODE_ENV === 'development';
const PORT = process.env.PORT || 3000;
const DEV_URL = `http://localhost:${PORT}`;

let mainWindow;
let nextServer;

function waitForServer(url, retries = 30, delay = 1000) {
  return new Promise((resolve, reject) => {
    const check = (remaining) => {
      http.get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) resolve();
        else if (remaining > 0) setTimeout(() => check(remaining - 1), delay);
        else reject(new Error('Server did not start in time'));
      }).on('error', () => {
        if (remaining > 0) setTimeout(() => check(remaining - 1), delay);
        else reject(new Error('Server did not start in time'));
      });
    };
    check(retries);
  });
}

function startNextServer() {
  return new Promise((resolve) => {
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    nextServer = spawn(cmd, ['next', 'start', '-p', PORT], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: 'inherit',
    });
    nextServer.on('error', (err) => console.error('Next.js server error:', err));
    resolve();
  });
}

function createMenu() {
  const template = [
    {
      label: 'App',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.reload() },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
  ];

  if (isDev) {
    template.push({
      label: 'Developer',
      submenu: [{ role: 'toggleDevTools' }],
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    titleBarStyle: 'default',
    show: false,
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Open external links in the system browser instead of Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  createMenu();

  if (isDev) {
    await waitForServer(DEV_URL);
    mainWindow.loadURL(DEV_URL);
  } else {
    await startNextServer();
    await waitForServer(DEV_URL);
    mainWindow.loadURL(DEV_URL);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (nextServer) nextServer.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', () => {
  if (nextServer) nextServer.kill();
});
