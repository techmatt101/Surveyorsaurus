var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var deepExtend = require('deep-extend');
var phantomjs = require('phantomjs');
var resemble = require('node-resemble.js');
var EventEmitter = require('events').EventEmitter;

var binPath = phantomjs.path;

var TaskRunner = function(config) {
    this.confg = {
        previousDirPath: 'bin/previous',
        changedDirPath: 'bin/changed',
        differenceDirPath: 'bin/difference'
    };

    deepExtend(this.confg, config);
    EventEmitter.call(this);
};

TaskRunner.prototype = Object.create(EventEmitter.prototype);

TaskRunner.prototype.runTests = function(tests, callback) {
    var _self = this;
    if (!(tests instanceof Array)) tests = [tests];
    var i = 0;
    function loop() {
        _self.runTest(tests[i], function() {
            i++;
            if (tests.length > i) {
                loop();
            } else {
                callback(tests);
            }
        });
    }

    loop();
};

TaskRunner.prototype.runTest = function(test, callback) {
    var _self = this;
    var imgFile = test.id + '.png';

    fs.exists(path.join(this.confg.previousDirPath, imgFile), function(hasTestHistory) {
        var folder = (hasTestHistory) ? _self.confg.changedDirPath : _self.confg.previousDirPath;
        _self._takeScreenshot(test.url, path.join(folder, imgFile), test.element, function() {
            if (!hasTestHistory) return returnResults(test, true, null);
            resemble(path.join(_self.confg.changedDirPath, imgFile))
                .compareTo(path.join(_self.confg.previousDirPath, imgFile))
                .onComplete(function(results) {
                    var passed = results.misMatchPercentage < test.mismatchPercentageLeeway;
                    if (passed) {
                        returnResults(test, true, results);
                    } else {
                        fs.exists(_self.confg.differenceDirPath, function(exists){
                            if(!exists) {
                                fs.mkdir(_self.confg.differenceDirPath, function() {
                                    saveDifference(test, results);
                                });
                            } else {
                                saveDifference(test, results);
                            }
                        });
                    }
                });
        });
    });

    function saveDifference(test, results) {
        var dist = fs.createWriteStream(path.join(_self.confg.differenceDirPath, imgFile));
        dist.on('finish', function() {
            returnResults(test, false, results);
        });
        results.getDiffImage().pack().pipe(dist);
    }

    function returnResults(test, passed, results) {
        test.passed = passed;
        _self.emit('end', { test: test, results: results });
        callback();
    }
    this.emit('start', test);
};

TaskRunner.prototype._takeScreenshot = function(url, output, element, callback) {
    var args = [path.join(__dirname, 'phantomjs-script.js'), url, output];
    if (element) args.push(element);
    childProcess.execFile(binPath, args, callback); //TODO: catch errors
};

module.exports = TaskRunner;