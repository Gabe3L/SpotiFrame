import path from 'path';
import * as url from 'url';
import { fileURLToPath } from 'url';
import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backendProcess = null;
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 350,
    height: 140,
    resizable: false,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: false,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadURL(url.pathToFileURL(path.join(__dirname, 'build', 'index.html')).href);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.setIgnoreMouseEvents(true, { forward: true })
    mainWindow.setMenuBarVisibility(false);
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    killBackend();
    app.quit();
  });
}

function setupProcessHandlers() {
  process.on('exit', () => {
    killBackend();
  });

  process.on('SIGINT', () => {
    process.exit();
  });

  process.on('SIGTERM', () => {
    process.exit();
  });
}

function startBackend() {
  backendProcess = spawn('uvicorn', ['backend.main:app', '--host', '127.0.0.1', '--port', '5000']);

  backendProcess.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.log(`${data}`);
  });

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend process:', err);
  });

  backendProcess.on('close', (code) => {
    console.log(`Exited with code ${code}`);
  });
}

function killBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

app.whenReady().then(() => {
  setupProcessHandlers();
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  killBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});