import fs from 'fs';
import url from 'url';
import path from 'path';
import { spawn } from 'child_process';
import { app, BrowserWindow, screen } from 'electron';

//////////////////////////////////////////////////////////////////////////////////////////////////////////

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backendProcess = null;
let mainWindow = null;

//////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadConfig() {
  const configDir = path.join(__dirname, 'config');
  const configPath = path.join(configDir, 'frontend_config.json');
  const defaultPath = path.join(configDir, 'default_frontend_config.json');

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }

  if (!fs.existsSync(configPath)) {
    if (!fs.existsSync(defaultPath)) {
      throw new Error('Default frontend config is missing.');
    }
    fs.copyFileSync(defaultPath, configPath);
    console.log('Created frontend_config.json from default.');
  }

  const configContents = fs.readFileSync(configPath, 'utf-8');
  try {
    return JSON.parse(configContents);
  } catch (err) {
    throw new Error('Invalid JSON in frontend_config.json');
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

function createWindow() {
  const config = loadConfig();
  const { horizontal, vertical } = config.position;

  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workArea;

  const contentWidth = 350;
  const contentHeight = 140;

  const paddingHorizontal = 30 * 2;
  const paddingVertical = 25 * 2;

  const windowWidth = contentWidth + paddingHorizontal;
  const windowHeight = contentHeight + paddingVertical;

  const x = horizontal === 'left' ? 0
    : horizontal === 'right' ? screenWidth - windowWidth
      : (() => { throw new Error('Invalid horizontal position: must be "left" or "right"'); })();

  const y = vertical === 'top' ? 0
    : vertical === 'bottom' ? screenHeight - windowHeight
      : (() => { throw new Error('Invalid vertical position: must be "top" or "bottom"'); })();

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: x,
    y: y,
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////////////////////////////////////////////////

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