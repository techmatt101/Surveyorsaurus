var path = require('path');
var childProcess = require('child_process');
var phantomjs = require('phantomjs');

var binPath = phantomjs.path;

var ScreenshotRunner = function() {};

ScreenshotRunner.prototype.takeScenarioScreenshots = function(scenario, outpath, callback) {
    var args = [path.join(__dirname, 'phantomjs-script.js'), JSON.stringify(scenario), outpath];
    childProcess.execFile(binPath, args, callback);
};

module.exports = ScreenshotRunner;