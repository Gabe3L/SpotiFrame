"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const electron_1 = require("electron");
const child_process_1 = require("child_process");
let backendProcess = null;
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        resizable: false,
        transparent: true,
        alwaysOnTop: true,
        kiosk: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile('frontend/index.html');
    mainWindow.on('closed', () => {
        console.log('Window closed, killing backend...');
        if (backendProcess) {
            backendProcess.kill();
            backendProcess = null;
        }
        electron_1.app.quit();
    });
}
function startBackend() {
    backendProcess = (0, child_process_1.spawn)('python', ['-m', 'backend.start'], {
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
electron_1.app.whenReady().then(() => {
    startBackend();
    waitForBackendReady();
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('will-quit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
