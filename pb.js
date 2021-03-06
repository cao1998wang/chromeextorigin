'use strict';

var pb = {
    'www': 'https://www.pushbullet.com',
    'api': 'https://api.pushbullet.com',
    'ws': 'wss://stream.pushbullet.com/websocket',
    'stream': 'https://stream.pushbullet.com/streaming',
    'andrelytics': 'https://zebra.pushbullet.com'
};

pb.isOpera = navigator.userAgent.indexOf('OPR') >= 0;

if (window.chrome) {
    pb.version = parseInt(chrome.runtime.getManifest().version);
    pb.browserVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
    pb.userAgent = 'Pushbullet ' + (pb.isOpera ? 'Opera' : 'Chrome') + ' ' + pb.version;
} else if (window.safari) {
    pb.version = parseInt(safari.extension.bundleVersion);
    pb.browserVersion = parseInt(window.navigator.appVersion.match(/Version\/(\d+)\./)[1], 10);
    pb.userAgent = 'Pushbullet Safari '  + pb.version;
} else {
    var params = utils.getParams(location.search);
    pb.browserVersion = parseInt(window.navigator.userAgent.match(/Firefox\/(\d+)\./)[1]);
    pb.version = params['version'];
    pb.userAgent = 'Pushbullet Firefox '  + pb.version;
}

pb.rollingLog = [];
pb.log = function(message) {
    var line;
    if (message instanceof Object || message instanceof Array) {
        line = message;
    } else {
        line = new Date().toLocaleString() + ' - ' + message;
    }

    console.log(line);
    pb.rollingLog.push(JSON.stringify(line));

    if (pb.rollingLog.length > 400) {
        pb.rollingLog.shift();
    }
};
