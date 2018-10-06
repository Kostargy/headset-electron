const { exec } = require('child_process');
const debug = require('debug');
const electron = require('electron');
const windowStateKeeper = require('electron-window-state');
const mprisService = require('./lib/mprisService.js');
const registerMediaKeys = require('./lib/registerMediaKeys.js');
const { version } = require('./package');
var YoutubeMp3Downloader = require("youtube-mp3-downloader");


const logger = debug('headset');
const logPlayer2Win = debug('headset:player2Win');
const logWin2Player = debug('headset:win2Player');

const {
  app,
  BrowserWindow,
  ipcMain,
} = electron;

let win;
let player;

const isDev = (process.env.NODE_ENV === 'development');

logger('Running as developer: %o', isDev);

const shouldQuit = app.makeSingleInstance(() => {
  // Someone tried to run a second instance, we should focus our window.
  logger('Second instance of Headset found');
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

if (shouldQuit) app.quit();

const start = () => {
  logger('Starting Headset');
  const mainWindowState = windowStateKeeper();

  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: 375,
    height: 667,
    resizable: false,
    title: 'Headset',
    maximizable: false,
    titleBarStyle: 'hiddenInset',
    icon: 'icon.png',
    frame: true,
  });

  mainWindowState.manage(win);

  if (isDev) {
    //win.loadURL('http://127.0.0.1:3001/headset.html');
    win.loadURL('https://danielravina.github.io/headset/app/');
  } else {
    win.loadURL('https://danielravina.github.io/headset/app/');
  }

  player = new BrowserWindow({
    width: 427,
    height: 300,
    minWidth: 427,
    minHeight: 300,
    title: 'Headset - Player',
  });

  win.webContents.on('did-finish-load', () => {
    logger('Main window finished loading');

    setTimeout(() => {
      try {
        player.minimize();
      } catch (err) {
        // swallow
      }
    }, 2000);

    if (isDev) {
      player.loadURL('http://127.0.0.1:3001');
    } else {
      player.loadURL('http://danielravina.github.io/headset/player-v2');
    }

    /*win.webContents.executeJavaScript(`
      var bundle = document.createElement('script');
      bundle.setAttribute('src', 'https://code.jquery.com/jquery-3.3.1.slim.min.js');
      document.body.appendChild(bundle);
    `);*/
    win.webContents.session.clearCache(function(){
    //some callback.
    });

    win.webContents.executeJavaScript(`
      var bundle = document.createElement('script');
      bundle.setAttribute('src', 'http://127.0.0.1:3001/patch.js');
      document.body.appendChild(bundle);
    `);
    /*win.webContents.executeJavaScript(`
      var bundle = document.createElement('script');
      bundle.setAttribute('src', 'http://127.0.0.1:3001/ytdownloader/dist/build.js');
      document.body.appendChild(bundle);
    `);*/
    try {
      logger('Initializing MPRIS and registering MediaKeys');
      mprisService(win, player);
      registerMediaKeys(win);
    } catch (err) {
      console.error(err);
    }

    win.webContents.executeJavaScript(`
      window.electronVersion = "v${version}"
    `);

    if (isDev) {
      win.webContents.openDevTools();
    }
  }); // end did-finish-load

  player.webContents.on('did-finish-load', () => {
    logger('Player window finished loading');
    win.focus();
  });

  player.on('close', (e) => {
    if (win) {
      logger('Attempted to close Player window while Headset running');
      e.preventDefault();
    } else {
      logger('Closing Player window and killing Headset');
      player = null;
      exec('kill -9 $(pgrep headset) &> /dev/null');
    }
  });

  win.on('close', () => {
    logger('Closing Headset');
    win = null;
    player.close();
  });

  win.on('restore', (e) => {
    e.preventDefault();
    win.show();
  });
}; // end start

app.on('activate', () => win.show());
app.on('ready', start);

app.on('browser-window-created', (e, window) => {
  window.setMenu(null);
});

/*
 * This is the proxy between the 2 windows.
 * It receives messages from a renderer and send them to the other renderer
*/
ipcMain.on('win2Player', (e, args) => {
  logWin2Player('%O', args);

  player.webContents.send('win2Player', args);
});

ipcMain.on('downloadSong', function(e, args){
  console.log(win.ytDownloaderData);
  var YD = new YoutubeMp3Downloader({
      "ffmpegPath": "/usr/bin/ffmpeg",        // Where is the FFmpeg binary located?
      "outputPath": "/home/kostargy/shared_music_2/Music",    // Where should the downloaded and encoded files be stored?
      "youtubeVideoQuality": "highest",       // What video quality should be used?
      "queueParallelism": 2,                  // How many parallel downloads/encodes should be started?
      "progressTimeout": 2000                 // How long should be the interval of the progress reports
  });

  if(win.ytDownloaderData){

    YD.download(win.ytDownloaderData.videoID);

    YD.on("finished", function(err, data) {
      console.log(JSON.stringify(data));
      win.webContents.send('downloadSong', {status:200, msg:'Success'});
    });

    YD.on("error", function(error) {
      console.log(error);
    });

    YD.on("progress", function(progress) {
      console.log(JSON.stringify(progress));
      win.webContents.send('sendProgress', progress);
    });
    //player.webContents.send('win2player', 'trackInfo');
  }else{
    win.webContents.send('downloadSong', {status: 400, msg:'Nothing to download!'});
  }

});

ipcMain.on('getSongData', function(e, args){
  console.log(args);
});
ipcMain.on('player2Win', (e, args) => {
  logPlayer2Win('%o', args);

  try {
    win.webContents.send('player2Win', args);
  } catch (err) { /* window already closed */ }
});
