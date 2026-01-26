const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let backendProcess;

// Backend server management
function startBackend() {
    const backendPath = path.join(__dirname, 'backend', 'dist', 'index.js');
    
    if (fs.existsSync(backendPath)) {
        backendProcess = spawn('node', [backendPath], {
            cwd: path.join(__dirname, 'backend'),
            env: { ...process.env, NODE_ENV: 'production' }
        });
        
        backendProcess.stdout.on('data', (data) => {
            console.log(`Backend: ${data}`);
        });
        
        backendProcess.stderr.on('data', (data) => {
            console.error(`Backend Error: ${data}`);
        });
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    // Wait for backend to start, then load frontend
    setTimeout(() => {
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }, 3000);

    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

app.whenReady().then(() => {
    startBackend();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});
