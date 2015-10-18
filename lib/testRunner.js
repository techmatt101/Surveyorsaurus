var async = require('async');
var EventEmitter = require('events').EventEmitter;

var TaskRunner = function(testHistory, screenshotRunner, imageComparison) {
    this._testHistory = testHistory;
    this._screenshotRunner = screenshotRunner;
    this._imageComparison = imageComparison;

    EventEmitter.call(this);
};

TaskRunner.prototype = Object.create(EventEmitter.prototype);

TaskRunner.prototype.runScenarios = function(scenarios, callback) {
    var _self = this;
    var start = Date.now();
    this.emit('start', { scenarios: scenarios });

    async.series([this._testHistory.setUpFolders.bind(this._testHistory)].concat(scenarios.map(function(scenario){
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

    this._screenshotRunner.takeScenarioScreenshots(scenario, this._testHistory.config.currentDirPath, function(response, err) {
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

TaskRunner.prototype._runTestsChecks = function(tests, callback) {
    var _self = this;
    async.series(tests.map(function(test) {
        return function getTestResult(callback) {
            _self.emit('testStart', { test: test });
            _self._imageComparison.compareTest(test, function(passed, results) {
                test.passed = passed;
                test.compareResults = results;
                _self.emit('testEnd', { test: test, passed: passed, results: results });
                if (results === null) {
                    _self._testHistory.approveTest(test, callback);
                } else if(passed === false) {
                    _self._testHistory.saveDifference(test, results.getDiffImage(), callback);
                } else {
                    callback();
                }
            });
        };
    }), callback);
};

module.exports = TaskRunner;