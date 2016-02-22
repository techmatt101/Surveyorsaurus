"use strict";
var path = require('path');
var childProcess = require('child_process');
var phantomJs = require('phantomjs');

var binPath = phantomJs.path;

class ScreenshotDriver {
    performInstruction(instruction, callback) {
        var args = [path.join(__dirname, 'phantomjs-script.js'), JSON.stringify(instruction)];
        childProcess.execFile(binPath, args, (res, err) => callback(err));
    }
}

module.exports = ScreenshotDriver;