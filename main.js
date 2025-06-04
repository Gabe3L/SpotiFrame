import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backendProcess = null;
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    resizable: false,
    transparent: true,
    alwaysOnTop: true,
    kiosk: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.setIgnoreMouseEvents(true, { forward: true })
  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadFile('index.html');
  
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

function waitForBackendReady() {
  let dotCount = 1;

  const tryConnect = () => {
    http.get('http://127.0.0.1:5000/', () => {
      console.log('Backend is ready');
      createWindow();
    }).on('error', () => {
      process.stdout.write('Waiting for backend' + '.'.repeat(dotCount) + '   ');
      process.stdout.write('\r');

      dotCount = (dotCount % 3) + 1;

      setTimeout(tryConnect, 1000);
    });
  };
  tryConnect();
}

app.whenReady().then(() => {
  startBackend();
  waitForBackendReady();
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