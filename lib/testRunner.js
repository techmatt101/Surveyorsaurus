var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var async = require('async');
var childProcess = require('child_process');
var deepExtend = require('deep-extend');
var phantomjs = require('phantomjs');
var resemble = require('node-resemble.js');
var EventEmitter = require('events').EventEmitter;

var binPath = phantomjs.path;

var TaskRunner = function(config) {
    this.config = {
        previousDirPath: 'bin/previous/',
        currentDirPath: 'bin/current/',
        differenceDirPath: 'bin/difference/'
    };

    deepExtend(this.config, config);
    EventEmitter.call(this);
};

TaskRunner.prototype = Object.create(EventEmitter.prototype);

TaskRunner.prototype.runScenarios = function(scenarios, callback) {
    var _self = this;
    var start = Date.now();
    this.emit('start', { scenarios: scenarios });

    async.series([this._setUpFolders.bind(this)].concat(scenarios.map(function(scenario){
        return function(callback) {
            _self.runScenario(scenario, callback);
        }
    })), function(err) {
        var end = Date.now();
        _self.emit('end', { scenarios: scenarios, time: end - start });
        callback(err, scenarios);
    });
};

TaskRunner.prototype.runScenario = function(scenario, callback) {
    var _self = this;
    var start = Date.now();
    _self.emit('scenarioStart', { scenario: scenario });

    this._takeScenarioScreenshots(scenario, this.config.currentDirPath, function(response, err) {
        if (err) {
            err.message = "BROWSER ERROR: " + err.message;
            callback(err);
            return;
        }
        _self._runTestsChecks(scenario.tests, function(err) {
            var end = Date.now();
            _self.emit('scenarioEnd', { scenario: scenario, time: end - start });
            callback(err);
        });
    });
};

TaskRunner.prototype.approveTest = function(test, callback) {
    var newFile = fs.createWriteStream(this.getPreviousScreenCapture(test));
    newFile.on('finish', callback);
    fs.createReadStream(this.getCurrentScreenCapture(test)).pipe(newFile);
};

TaskRunner.prototype.getDifferenceScreenCapture = function(test) {
    return path.join(this.config.differenceDirPath, this._getFile(test));
};

TaskRunner.prototype.getCurrentScreenCapture = function(test) {
    return path.join(this.config.currentDirPath, this._getFile(test));
};

TaskRunner.prototype.getPreviousScreenCapture = function(test) {
    return path.join(this.config.previousDirPath, this._getFile(test));
};

TaskRunner.prototype._getFile = function(test) {
    return test.id + '.png';
};

TaskRunner.prototype._takeScenarioScreenshots = function(scenario, outpath, callback) {
    var args = [path.join(__dirname, 'phantomjs-script.js'), JSON.stringify(scenario), outpath];
    childProcess.execFile(binPath, args, callback);
};

TaskRunner.prototype._runTestsChecks = function(tests, callback) {
    var _self = this;
    async.series(tests.map(function(test) {
        return function getTestResult(callback) {
            _self.emit('testStart', { test: test });
            _self._compareTest(test, function(passed, results) {
                test.passed = passed;
                test.compareResults = results;
                _self.emit('testEnd', { test: test, passed: passed, results: results });
                if (results === null) {
                    _self.approveTest(test, callback);
                } else if(passed === false) {
                    _self._saveDifference(test, results, callback);
                } else {
                    callback();
                }
            });
        };
    }), callback);
};

TaskRunner.prototype._compareTest = function(test, callback) {
    var _self = this;
    fs.exists(this.getPreviousScreenCapture(test), function(hasTestHistory) {
        if (hasTestHistory) {
            resemble(_self.getCurrentScreenCapture(test))
                .compareTo(_self.getPreviousScreenCapture(test))
                .onComplete(function(results) {
                    var passed = results.misMatchPercentage < test.mismatchPercentageLeeway;
                    callback(passed, results);
                });
        } else {
            callback(true, null);
        }
    });
};

TaskRunner.prototype._saveDifference = function(test, results, callback) {
    var dist = fs.createWriteStream(this.getDifferenceScreenCapture(test));
    dist.on('finish', callback);
    results.getDiffImage().pack().pipe(dist);
};

TaskRunner.prototype._setUpFolders = function(callback) {
    async.parallel([
        this.config.currentDirPath,
        this.config.previousDirPath,
        this.config.differenceDirPath
    ].map(function(path) {
        return function(callback) {
            mkdirp(path, callback);
        }
    }), callback);
};

module.exports = TaskRunner;