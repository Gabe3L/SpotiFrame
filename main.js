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
    console.log('Window closed, killing backend...');
    if (backendProcess) {
      backendProcess.kill();
      backendProcess = null;
    }
    app.quit();
  });
}

function startBackend() {
  backendProcess = spawn('python', ['-m', 'backend.start'], {
    cwd: __dirname,
    shell: true,
  });

  if (backendProcess.stdout) {
    backendProcess.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
  }

  if (backendProcess.stderr) {
    backendProcess.stderr.on('data', (data) => {
      console.log(`${data}`);
    });
  }

  backendProcess.on('close', (code) => {
    console.log(`Exited with code ${code}`);
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});