const { app, BrowserWindow, Tray, Menu, Notification } = require("electron");
const path = require("path");

let mainWindow;
let tray;
let isQuiting = false;

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createMainWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}

// Create the main app window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    backgroundColor:null,
    frame: true,
    icon: path.join(__dirname, "assets/images/logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  mainWindow.setMenu(null);
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Handle close button (minimize to tray)
  mainWindow.on("close", (event) => {
    if (!isQuiting) {
      event.preventDefault();
      mainWindow.hide();
      sendNotification("Your timer is minimized.");
    }
  });

  // Handle minimize to tray
  mainWindow.on("minimize", (event) => {
    event.preventDefault();
    mainWindow.hide();
    sendNotification("Your timer is minimized.");
  });

  // Set up the system tray
  setupTray();
}

// Set up the system tray
function setupTray() {
  tray = new Tray(path.join(__dirname, "assets/images/logo.png"));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show",
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      },
    },
    {
      label: "Quit",
      click: () => {
        isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Pomodoro Timer");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

// Function to send a notification
function sendNotification(message) {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: "Pomodoro Timer",
      body: message,
      icon: path.join(__dirname, "assets/images/logo.ico"),
    });

    // Open the app when the notification is clicked
    notification.on("click", () => {
      if (mainWindow.isMinimized() || !mainWindow.isVisible()) {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    notification.show();
  } else {
    console.error("Notifications are not supported on this platform.");
  }
}
