import fs from 'fs';
import url from 'url';
import path from 'path';
import { spawn } from 'child_process';
import { app, ipcMain, BrowserWindow, screen } from 'electron';

//////////////////////////////////////////////////////////////////////////////////////////////////////////

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backendProcess = null;
let mainWindow = null;

//////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadConfig() {
  const configDir = path.join(__dirname, 'config');
  const configPath = path.join(configDir, 'ui_config.json');
  const defaultPath = path.join(configDir, 'default_ui_config.json');

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }

  if (!fs.existsSync(configPath)) {
    if (!fs.existsSync(defaultPath)) {
      throw new Error('Default ui config is missing.');
    }
    fs.copyFileSync(defaultPath, configPath);
    console.log('Created ui_config.json from default.');
  }

  const configContents = fs.readFileSync(configPath, 'utf-8');
  try {
    return JSON.parse(configContents);
  } catch (err) {
    throw new Error('Invalid JSON in ui_config.json');
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

function createWindow() {
  const config = loadConfig();
  const { horizontal, vertical } = config.position;

  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workArea;

  const windowWidth = 350;
  const windowHeight = 127;

  const marginHorizontal = 25;
  const marginVertical = 35;

  const x = horizontal === 'left' ? marginHorizontal : screenWidth - windowWidth - marginHorizontal;
  const y = vertical === 'top' ? marginVertical : screenHeight - windowHeight - marginVertical;

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
    icon: path.join(__dirname, 'assets', 'logo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadURL(url.pathToFileURL(path.join(__dirname, 'build', 'index.html')).href);

  mainWindow.webContents.on('did-finish-load', () => {
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

  ipcMain.on('app-close', () => {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      app.quit();
    }
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